/**
 * Reservation ingest processor: raw → normalize → domain (idempotent).
 */

import {
  claimIdempotentIngest,
  ingestionIdentity,
  buildRawRecord,
  type RawIngestionRecord,
} from "../idempotency";
import {
  normalizeExternalReservation,
  type RadrReservation,
} from "@/lib/integrations/normalize/reservation";
import type { ExternalReservation } from "@/lib/integrations/types";
import type { DomainReservation } from "@/lib/radr/domain";

export type IngestReservationResult =
  | { ok: true; record: RawIngestionRecord; reservation: DomainReservation; duplicate: false }
  | { ok: true; recordId: string; duplicate: true }
  | { ok: false; error: string };

export function ingestExternalReservation(input: {
  organizationId: string;
  locationId: string;
  provider: string;
  connectionId: string;
  external: ExternalReservation;
  currency?: string;
}): IngestReservationResult {
  const identity = ingestionIdentity({
    organizationId: input.organizationId,
    provider: input.provider,
    externalId: input.external.externalId,
  });
  const record = buildRawRecord({
    organizationId: input.organizationId,
    provider: input.provider,
    connectionId: input.connectionId,
    externalId: input.external.externalId,
    payloadReference: `memory://${identity}`,
    receivedAt: new Date().toISOString(),
    contentType: "application/json",
  });

  const claim = claimIdempotentIngest(identity, record.id);
  if (!claim.accepted) {
    return { ok: true, recordId: claim.existingRecordId!, duplicate: true };
  }

  const normalized: RadrReservation = normalizeExternalReservation(
    input.external,
    input.connectionId,
    input.provider,
  );

  const reservation: DomainReservation = {
    id: `res_${identity}`,
    organizationId: input.organizationId,
    locationId: input.locationId,
    externalId: normalized.provenance.externalId,
    provider: input.provider,
    serviceTime: normalized.serviceTime,
    partySize: normalized.partySize,
    status:
      normalized.status === "unknown" ? "confirmed" : normalized.status,
    bookingChannel: normalized.bookingChannel,
    createdAt: normalized.provenance.ingestedAt,
    updatedAt: normalized.provenance.sourceUpdatedAt ?? normalized.provenance.ingestedAt,
    cancelledAt: normalized.cancelledAt ?? null,
    noShowAt: normalized.noShow ? normalized.provenance.sourceUpdatedAt : null,
    tableIds: normalized.tableExternalId ? [normalized.tableExternalId] : [],
    sectionId: normalized.section ?? null,
    groupBooking: normalized.partySize >= 8,
    currency: input.currency,
  };

  return { ok: true, record, reservation, duplicate: false };
}
