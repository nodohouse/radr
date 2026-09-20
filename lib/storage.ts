import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { newId } from "@/lib/ids";

export type StoredObject = {
  storagePath: string;
  driver: "local" | "s3";
};

function storageDriver(): "local" | "s3" {
  const driver = process.env.STORAGE_DRIVER ?? "local";
  if (driver === "s3") return "s3";
  return "local";
}

function localRoot(): string {
  return (
    process.env.LOCAL_STORAGE_DIR ??
    path.join(process.cwd(), ".data", "uploads")
  );
}

function s3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    },
  });
}

function s3Bucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) {
    throw new Error("S3_BUCKET is required when STORAGE_DRIVER=s3");
  }
  return bucket;
}

export function buildStoragePath(params: {
  organizationId: string;
  documentId: string;
  originalFilename: string;
}): string {
  const safeName = params.originalFilename
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 120);
  return `organizations/${params.organizationId}/documents/${params.documentId}/${safeName}`;
}

export async function putPrivateObject(params: {
  organizationId: string;
  documentId?: string;
  originalFilename: string;
  mimeType: string;
  body: Buffer;
}): Promise<StoredObject & { documentId: string }> {
  const documentId = params.documentId ?? newId();
  const storagePath = buildStoragePath({
    organizationId: params.organizationId,
    documentId,
    originalFilename: params.originalFilename,
  });

  if (storageDriver() === "s3") {
    await s3Client().send(
      new PutObjectCommand({
        Bucket: s3Bucket(),
        Key: storagePath,
        Body: params.body,
        ContentType: params.mimeType,
        // Private by default. No ACL grants.
      }),
    );
    return { storagePath, driver: "s3", documentId };
  }

  const absolute = path.join(localRoot(), storagePath);
  await fs.mkdir(path.dirname(absolute), { recursive: true });
  await fs.writeFile(absolute, params.body, { mode: 0o600 });
  return { storagePath, driver: "local", documentId };
}

export function assertSafeStoragePath(
  storageRoot: string,
  storagePath: string,
): string {
  const absolute = path.join(storageRoot, storagePath);
  const resolvedRoot = path.resolve(storageRoot);
  const resolvedFile = path.resolve(absolute);
  if (
    !resolvedFile.startsWith(resolvedRoot + path.sep) &&
    resolvedFile !== resolvedRoot
  ) {
    throw new Error("Invalid storage path");
  }
  return resolvedFile;
}

export async function getPrivateObjectBuffer(
  storagePath: string,
): Promise<Buffer> {
  if (storageDriver() === "s3") {
    const result = await s3Client().send(
      new GetObjectCommand({
        Bucket: s3Bucket(),
        Key: storagePath,
      }),
    );
    const body = result.Body;
    if (!body) {
      throw new Error("Empty object body");
    }
    if (body instanceof Readable || typeof (body as { transformToByteArray?: unknown }).transformToByteArray !== "function") {
      const bytes = await streamToBuffer(body as Readable | AsyncIterable<Uint8Array>);
      return bytes;
    }
    const arr = await (body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
    return Buffer.from(arr);
  }

  const resolvedFile = assertSafeStoragePath(localRoot(), storagePath);
  return fs.readFile(resolvedFile);
}

export async function createSignedDownloadUrl(
  storagePath: string,
  expiresInSeconds = 60,
): Promise<string | null> {
  if (storageDriver() !== "s3") {
    // Local driver has no public URLs; callers should stream via authorized route.
    return null;
  }

  return getSignedUrl(
    s3Client(),
    new GetObjectCommand({
      Bucket: s3Bucket(),
      Key: storagePath,
    }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deletePrivateObject(storagePath: string): Promise<void> {
  if (storageDriver() === "s3") {
    await s3Client().send(
      new DeleteObjectCommand({
        Bucket: s3Bucket(),
        Key: storagePath,
      }),
    );
    return;
  }

  const resolvedFile = assertSafeStoragePath(localRoot(), storagePath);
  await fs.unlink(resolvedFile).catch(() => undefined);
}

async function streamToBuffer(
  stream: Readable | AsyncIterable<Uint8Array>,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
