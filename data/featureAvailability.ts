/**
 * Public feature availability — marketing, Pricing, Developers, Trust.
 * Maps to internal capability honesty; never claim LIVE ahead of this table.
 */

import {
  RADR_CAPABILITIES,
  type CapabilityStatus,
} from "@/lib/radr/capabilityStatus";

export type PublicFeatureStatus =
  | "AVAILABLE"
  | "BETA"
  | "EARLY_ACCESS"
  | "BUILDING"
  | "PLANNED"
  | "TECHNICAL_PREVIEW"
  | "CUSTOM"
  | "DEMO";

export type FeatureAvailabilityRecord = {
  id: string;
  name: string;
  status: PublicFeatureStatus;
  notes: string;
};

function mapInternal(status: CapabilityStatus): PublicFeatureStatus {
  switch (status) {
    case "IMPLEMENTED":
      return "AVAILABLE";
    case "DEMO":
      return "DEMO";
    case "PROTOTYPE":
      return "EARLY_ACCESS";
    case "PLANNED":
      return "PLANNED";
    default:
      return "PLANNED";
  }
}

/** Canonical public feature table derived from product capability truth. */
export const FEATURE_AVAILABILITY: readonly FeatureAvailabilityRecord[] =
  RADR_CAPABILITIES.map((c) => ({
    id: c.id,
    name: c.name,
    status: mapInternal(c.status),
    notes: c.notes,
  }));

export function featureAvailability(
  id: string,
): FeatureAvailabilityRecord | undefined {
  return FEATURE_AVAILABILITY.find((f) => f.id === id);
}

export function isPubliclyLive(id: string): boolean {
  const f = featureAvailability(id);
  return f?.status === "AVAILABLE" || f?.status === "BETA";
}
