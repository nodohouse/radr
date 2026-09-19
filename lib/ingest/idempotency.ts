/**
 * Ingestion: raw records + idempotent identity.
 */

export type RawIngestionRecord = {
  id: string;
  organizationId: string;
  provider: string;
  connectionId: string;
  externalId: string;
  /** Storage key / opaque reference - not always full payload. */
  payloadReference: string;
  receivedAt: string;
  contentType?: string;
};

/** Stable identity for upserts: org + provider + externalId */
export function ingestionIdentity(input: {
  organizationId: string;
  provider: string;
  externalId: string;
}): string {
  return `${input.organizationId}::${input.provider}::${input.externalId}`;
}

const seen = new Map<string, string>();

/**
 * Returns true if this identity was already processed (duplicate delivery).
 * In-memory for demo/tests; replace with DB unique constraint in production.
 */
export function claimIdempotentIngest(
  identity: string,
  recordId: string,
): { accepted: boolean; existingRecordId?: string } {
  const existing = seen.get(identity);
  if (existing) {
    return { accepted: false, existingRecordId: existing };
  }
  seen.set(identity, recordId);
  return { accepted: true };
}

export function __resetIdempotencyMemory(): void {
  seen.clear();
}

export function buildRawRecord(input: Omit<RawIngestionRecord, "id"> & { id?: string }): RawIngestionRecord {
  return {
    id: input.id ?? `raw_${ingestionIdentity(input)}`,
    organizationId: input.organizationId,
    provider: input.provider,
    connectionId: input.connectionId,
    externalId: input.externalId,
    payloadReference: input.payloadReference,
    receivedAt: input.receivedAt,
    contentType: input.contentType,
  };
}
