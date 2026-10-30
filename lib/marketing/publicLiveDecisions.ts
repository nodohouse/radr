/**
 * LIVE / OPEN public Decisions — Control Center + Needs You only.
 * Sealed historical IDs (D-4102, D-1911, …) live in publicDecisionEconomics.
 * Never mix: a sealed Decision must not appear as Needs You.
 *
 * Source of truth for multi-location: northstarGroup.ts
 */

import {
  LIVE_D7021 as NS_D7021,
  LIVE_D7022 as NS_D7022,
  LIVE_D7023 as NS_D7023,
  GROUP_NEEDS_YOU,
  ROUTINE_SIGNALS_SUPPRESSED,
  locationLabel,
  type GroupLiveDecision,
} from "@/lib/marketing/northstarGroup";

export type PublicTemporalMode = "live" | "historical" | "replay";

export type PublicLiveDecision = {
  displayId: string;
  location: string;
  locationId: GroupLiveDecision["locationId"];
  classLabel: string;
  temporalMode: "live";
  state: "needs_you" | "investigate" | "review" | "radr_handling";
  owner: string;
  economics: GroupLiveDecision["economics"];
  line: string;
  detail: string;
  cta: string;
  ctaHref: string;
};

function toPublic(d: GroupLiveDecision): PublicLiveDecision {
  return {
    displayId: d.displayId,
    location: locationLabel(d.locationId),
    locationId: d.locationId,
    classLabel: d.classLabel,
    temporalMode: d.temporalMode,
    state: d.state,
    owner: d.owner,
    economics: d.economics,
    line: d.line,
    detail: d.detail,
    cta: d.cta,
    ctaHref: d.ctaHref,
  };
}

export const LIVE_D7021 = toPublic(NS_D7021);
export const LIVE_D7022 = toPublic(NS_D7022);
export const LIVE_D7023 = toPublic(NS_D7023);

export const PUBLIC_LIVE_DECISIONS = {
  "D-7021": LIVE_D7021,
  "D-7022": LIVE_D7022,
  "D-7023": LIVE_D7023,
} as const;

export const MORNING_BRIEF_LIVE = GROUP_NEEDS_YOU.map(toPublic);

export { ROUTINE_SIGNALS_SUPPRESSED };
