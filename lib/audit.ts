import { db } from "@/lib/db";
import { auditLogs, type AuditAction } from "@/lib/db/schema";
import { newId } from "@/lib/ids";

/**
 * Lightweight audit logging. Do not store document contents or unnecessary
 * financial details in metadata.
 */
export async function writeAuditLog(params: {
  organizationId: string;
  actorUserId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const safeMetadata = sanitizeMetadata(params.metadata ?? {});

  await db.insert(auditLogs).values({
    id: newId(),
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    metadata: safeMetadata,
  });
}

const BLOCKED_METADATA_KEYS = new Set([
  "contents",
  "content",
  "fileBytes",
  "password",
  "token",
  "secret",
]);

function sanitizeMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (BLOCKED_METADATA_KEYS.has(key)) continue;
    if (typeof value === "string" && value.length > 500) {
      out[key] = `${value.slice(0, 500)}…`;
      continue;
    }
    out[key] = value;
  }
  return out;
}
