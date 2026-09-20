/**
 * LIVE / OPEN public Decisions — Control Center + Needs You only.
 * Sealed historical IDs (D-4102, D-1911, …) live in publicDecisionEconomics.
 * Never mix: a sealed Decision must not appear as Needs You.
 */

export type PublicTemporalMode = "live" | "historical" | "replay";

export type PublicLiveDecision = {
  displayId: string;
  location: string;
  classLabel: string;
  temporalMode: "live";
  state: "needs_you" | "investigate" | "review" | "radr_handling";
  owner: string;
  economics: {
    identified: number;
    exposed: number;
    expected: number;
    recoverable: number;
    observed: number;
    attributed: number;
    verified: number;
    currency: "EUR";
    basis: string;
  };
  line: string;
  detail: string;
  cta: string;
  ctaHref: string;
};

/** D-7021 — Berlin reconciliation · OPEN */
export const LIVE_D7021: PublicLiveDecision = {
  displayId: "D-7021",
  location: "Berlin Mitte",
  classLabel: "Reconciliation",
  temporalMode: "live",
  state: "investigate",
  owner: "Finance",
  economics: {
    identified: 395,
    exposed: 395,
    expected: 0,
    recoverable: 395,
    observed: 0,
    attributed: 91,
    verified: 0,
    currency: "EUR",
    basis: "Expected settlement vs received funds",
  },
  line: "Expected settlement and received funds disagree.",
  detail: "€91 explained. €395 remains unmatched.",
  cta: "Investigate",
  ctaHref: "/solutions#reconciliation",
};

/** D-7022 — Amsterdam supplier variance · OPEN (not D-4102) */
export const LIVE_D7022: PublicLiveDecision = {
  displayId: "D-7022",
  location: "Amsterdam",
  classLabel: "Supplier / AP",
  temporalMode: "live",
  state: "review",
  owner: "CFO",
  economics: {
    identified: 186,
    exposed: 186,
    expected: 186,
    recoverable: 186,
    observed: 0,
    attributed: 0,
    verified: 0,
    currency: "EUR",
    basis: "Invoice vs agreed contract rate",
  },
  line: "Invoice and agreed contract rate disagree.",
  detail: "Evidence package ready.",
  cta: "Review",
  ctaHref: "/contact?intent=recovery-pilot",
};

export const PUBLIC_LIVE_DECISIONS = {
  "D-7021": LIVE_D7021,
  "D-7022": LIVE_D7022,
} as const;

export const MORNING_BRIEF_LIVE = [LIVE_D7021, LIVE_D7022] as const;

export const ROUTINE_SIGNALS_SUPPRESSED = 147;
