import type { ExternalReservation, Provenance } from "../types";

/** Normalized reservation. Provider field names must not leak past this layer. */
export type RadrReservation = {
  id: string;
  locationExternalId: string;
  serviceTime: string;
  partySize: number;
  status: "confirmed" | "seated" | "cancelled" | "no_show" | "completed" | "unknown";
  bookingChannel?: string;
  tableExternalId?: string;
  section?: string;
  cancelledAt?: string;
  noShow?: boolean;
  provenance: Provenance;
};

function mapStatus(raw: string): RadrReservation["status"] {
  const s = raw.toLowerCase();
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("no_show") || s.includes("noshow")) return "no_show";
  if (s.includes("seat")) return "seated";
  if (s.includes("complete") || s.includes("done")) return "completed";
  if (s.includes("confirm") || s.includes("book")) return "confirmed";
  return "unknown";
}

/**
 * Normalize any adapter ExternalReservation into the RADR model.
 */
export function normalizeExternalReservation(
  input: ExternalReservation,
  connectionId: string,
  providerId: string,
): RadrReservation {
  const ingestedAt = new Date().toISOString();
  return {
    id: `${providerId}:${input.externalId}`,
    locationExternalId: input.locationExternalId,
    serviceTime: input.serviceTime,
    partySize: input.partySize,
    status: mapStatus(input.status),
    bookingChannel: input.bookingChannel,
    tableExternalId: input.tableExternalId,
    section: input.section,
    cancelledAt: input.cancelledAt,
    noShow: input.noShow,
    provenance: {
      sourceProvider: providerId,
      sourceConnectionId: connectionId,
      externalId: input.externalId,
      sourceUpdatedAt: input.sourceUpdatedAt,
      ingestedAt,
    },
  };
}
