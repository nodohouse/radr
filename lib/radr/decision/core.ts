/**
 * Universal Decision — one object for homepage, platform, and /app.
 * Money kinds only: exposed | protected | recovered | created | avoided.
 * Never fake POS/PMS writes. Approve = prepared payload only.
 */

export type ValueKind =
  | "exposed"
  | "protected"
  | "recovered"
  | "created"
  | "avoided";

export type Horizon = "tonight" | "this_week" | "annual";

export type Epistemic =
  | "OBSERVED"
  | "ESTIMATED"
  | "PREDICTED"
  | "RECOMMENDED"
  | "VERIFIED";

export type DecisionStatus =
  | "needs_you"
  | "handling"
  | "watching"
  | "approved"
  | "verified";

export type DecisionVertical = "restaurant" | "hotel" | "apartment";

export type DecisionPhase = "pre" | "live" | "after" | "day";

export type DecisionMoney = {
  amount: number;
  kind: ValueKind;
  horizon: Horizon;
};

export type DecisionEvidence = {
  value: string;
  label: string;
};

export type DecisionOption = {
  id: string;
  title: string;
  /** Net vs do-nothing baseline (€0). Labor already subtracted. */
  netVsDoNothing: number;
  cost?: number;
  note: string;
  recommended?: boolean;
};

export type WhyBlock = {
  epistemic: Epistemic;
  title: string;
  body: string;
};

export type DecisionWhy = {
  blocks: WhyBlock[];
  sources: { name: string; freshness: string }[];
  sample: { n: number; window: string };
  baseline: string;
  effect: string;
  confidence: { point: number; low: number; high: number };
  assumptions: string[];
  /** “At Berlin Mitte, under these conditions…” */
  locationDna: string;
};

export type Decision = {
  id: string;
  vertical: DecisionVertical;
  property: string;
  phase: DecisionPhase;
  phaseLabel: string;
  contextLine: string;
  headline: string;
  soWhat: string;
  exposed?: DecisionMoney;
  expected?: DecisionMoney;
  action: string;
  fallback?: string;
  deadline?: string;
  evidence: DecisionEvidence[];
  why: DecisionWhy;
  options?: DecisionOption[];
  status: DecisionStatus;
  /** Always: prepared, not written back to POS/PMS */
  payloadNote: string;
  proof?: { label: string; detail: string }[];
  verified?: { amount: number; kind: ValueKind; note: string };
  learn?: string;
  silenceNote?: string;
  image?: string;
  imageAlt?: string;
};

/** Card UI interaction state (not the Decision.status). */
export type DecisionCardState =
  | "DECIDE"
  | "SIMULATE"
  | "APPROVED"
  | "VERIFIED";

export function formatDecisionMoney(amount: number): string {
  const grouped = Math.round(Math.abs(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `€${grouped}`;
}

export function horizonLabel(h: Horizon): string {
  if (h === "tonight") return "tonight";
  if (h === "this_week") return "this week";
  return "annual";
}

export function moneyCaption(kind: ValueKind, horizon: Horizon): string {
  const h = horizonLabel(horizon);
  switch (kind) {
    case "exposed":
      return `contribution exposed · ${h}`;
    case "protected":
      return `expected protected · ${h}`;
    case "recovered":
      return `recovered · ${h}`;
    case "created":
      return `expected created · ${h}`;
    case "avoided":
      return `avoided · ${h}`;
  }
}

export function verifiedCaption(kind: ValueKind): string {
  switch (kind) {
    case "protected":
      return "protected";
    case "recovered":
      return "recovered";
    case "created":
      return "created";
    case "avoided":
      return "avoided";
    case "exposed":
      return "exposed";
  }
}
