import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { AuthzError, requireUploadAuthorization } from "@/lib/authz";
import { MAX_FILES_PER_UPLOAD } from "@/lib/constants";
import { db } from "@/lib/db";
import { documents, locations } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { putPrivateObject } from "@/lib/storage";
import { assertAllowedUploadBytes, uploadMetaSchema } from "@/lib/validation";

export const runtime = "nodejs";

type UploadedDocument = {
  id: string;
  status: "UPLOADED";
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  documentType: string;
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const files = collectFiles(form);
  if (files.length === 0) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  if (files.length > MAX_FILES_PER_UPLOAD) {
    return NextResponse.json(
      { error: `Maximum ${MAX_FILES_PER_UPLOAD} files per upload` },
      { status: 400 },
    );
  }

  const metaRaw = {
    organizationId: String(form.get("organizationId") ?? ""),
    locationId: form.get("locationId")
      ? String(form.get("locationId"))
      : null,
    documentType: String(form.get("documentType") ?? "UNKNOWN"),
  };

  const meta = uploadMetaSchema.safeParse(metaRaw);
  if (!meta.success) {
    return NextResponse.json(
      { error: "Validation failed", details: meta.error.flatten() },
      { status: 400 },
    );
  }

  try {
    await requireUploadAuthorization(session.user.id, meta.data.organizationId);
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  if (meta.data.locationId) {
    const [location] = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.id, meta.data.locationId),
          eq(locations.organizationId, meta.data.organizationId),
        ),
      )
      .limit(1);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found in organization" },
        { status: 400 },
      );
    }
  }

  const uploaded: UploadedDocument[] = [];

  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());

    let validated: { mimeType: string; filename: string };
    try {
      validated = assertAllowedUploadBytes({
        claimedMime: file.type,
        size: file.size || bytes.length,
        name: file.name,
        bytes,
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid file" },
        { status: 400 },
      );
    }

    const documentId = newId();
    const stored = await putPrivateObject({
      organizationId: meta.data.organizationId,
      documentId,
      originalFilename: validated.filename,
      mimeType: validated.mimeType,
      body: bytes,
    });

    const now = new Date();
    await db.insert(documents).values({
      id: documentId,
      organizationId: meta.data.organizationId,
      locationId: meta.data.locationId ?? null,
      supplierId: null,
      uploadedBy: session.user.id,
      documentType: meta.data.documentType,
      originalFilename: validated.filename,
      storagePath: stored.storagePath,
      mimeType: validated.mimeType,
      fileSize: bytes.length,
      status: "UPLOADED",
      createdAt: now,
      updatedAt: now,
    });

    await writeAuditLog({
      organizationId: meta.data.organizationId,
      actorUserId: session.user.id,
      action: "DOCUMENT_UPLOADED",
      resourceType: "document",
      resourceId: documentId,
      metadata: {
        mimeType: validated.mimeType,
        fileSize: bytes.length,
        originalFilename: validated.filename.slice(0, 200),
      },
    });

    uploaded.push({
      id: documentId,
      status: "UPLOADED",
      originalFilename: validated.filename,
      mimeType: validated.mimeType,
      fileSize: bytes.length,
      documentType: meta.data.documentType,
    });
  }

  return NextResponse.json({
    ok: true,
    documents: uploaded,
    document: uploaded[0],
    message: "GOT IT. RADR received your document.",
  });
}

function collectFiles(form: FormData): File[] {
  const files: File[] = [];
  for (const [key, value] of form.entries()) {
    if ((key === "file" || key === "files") && value instanceof File) {
      files.push(value);
    }
  }
  return files;
}
