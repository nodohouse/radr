import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { writeAuditLog } from "@/lib/audit";
import { AuthzError, requireDocumentAccess, requirePermission } from "@/lib/authz";
import { getAuthIdentity } from "@/lib/identity/provider";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
import { createSignedDownloadUrl, deletePrivateObject, getPrivateObjectBuffer } from "@/lib/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/**
 * Authorized document access.
 * Never exposes permanent public URLs.
 * For S3, may return a short-lived signed URL; otherwise streams bytes.
 */
export async function GET(_request: Request, { params }: Params) {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { document } = await requireDocumentAccess(identity.userId, id);

    const signedUrl = await createSignedDownloadUrl(document.storagePath, 60);
    if (signedUrl) {
      return NextResponse.json({
        mode: "signed_url",
        url: signedUrl,
        expiresInSeconds: 60,
        filename: document.originalFilename,
        mimeType: document.mimeType,
      });
    }

    const bytes = await getPrivateObjectBuffer(document.storagePath);
    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${sanitizeFilename(document.originalFilename)}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[prep] document download failed");
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const identity = await getAuthIdentity();
  if (!identity) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { document } = await requireDocumentAccess(identity.userId, id);
    await requirePermission(
      identity.userId,
      document.organizationId,
      "document.upload",
      document.locationId ?? undefined,
    );

    await db.delete(documents).where(eq(documents.id, id));
    await deletePrivateObject(document.storagePath);

    await writeAuditLog({
      organizationId: document.organizationId,
      actorUserId: identity.userId,
      action: "DOCUMENT_DELETED",
      resourceType: "document",
      resourceId: id,
      metadata: { mimeType: document.mimeType },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthzError) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 },
      );
    }
    console.error("[prep] document delete failed");
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/["\r\n]+/g, "_");
}
