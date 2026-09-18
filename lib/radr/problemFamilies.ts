/**
 * Five problem families — opinionated economic operating surface.
 *
 * Not features. Not agent skills. Canonical hospitality value-loss domains.
 * Progression: RECOVER → PREVENT → OPTIMIZE → AUTOPILOT.
 */

export const PROBLEM_FAMILIES = [
  "SUPPLIER_AP",
  "RECONCILIATION",
  "COST_VARIANCE",
  "PROCUREMENT",
  "PERISHABLE_REVENUE",
] as const;

export type ProblemFamily = (typeof PROBLEM_FAMILIES)[number];

export type EconomicValueState =
  | "IDENTIFIED"
  | "EXPECTED"
  | "OBSERVED"
  | "VERIFIED";

export type ProgressionStage =
  | "RECOVER"
  | "PREVENT"
  | "OPTIMIZE"
  | "AUTOPILOT";

export type ProblemFamilyDef = {
  id: ProblemFamily;
  label: string;
  shortLabel: string;
  stage: ProgressionStage;
  /** What leaks */
  leaks: string;
  /** What RADR does */
  does: string;
  /** What can be verified */
  verifies: string;
  /** Pilot-ready now · expansion · planned */
  maturity: "pilot" | "expansion" | "planned";
  exampleSignals: string[];
};

export const PROBLEM_FAMILY_DEFS: Record<ProblemFamily, ProblemFamilyDef> = {
  SUPPLIER_AP: {
    id: "SUPPLIER_AP",
    label: "Supplier / AP",
    shortLabel: "Supplier / AP",
    stage: "RECOVER",
    leaks:
      "Contract leakage, missing credits, rebates, duplicate charges, UOM and quantity mismatch.",
    does: "Detects variance → prepares evidence → tracks settlement → verifies recovered value.",
    verifies: "Credit / settlement matched to the original invoice or AP posting.",
    maturity: "pilot",
    exampleSignals: [
      "contract price variance",
      "unapplied credit",
      "missing rebate",
      "duplicate invoice",
      "freight outside terms",
    ],
  },
  RECONCILIATION: {
    id: "RECONCILIATION",
    label: "Reconciliation & close",
    shortLabel: "Reconciliation",
    stage: "RECOVER",
    leaks:
      "POS vs processor vs delivery vs accounting mismatches — refunds, chargebacks, tips, settlements.",
    does: "Detects mismatch → explains source disagreement → prepares correction → verifies closure.",
    verifies: "Settlement / journal correction matched across source systems.",
    maturity: "pilot",
    exampleSignals: [
      "delivery settlement short",
      "processor vs POS gap",
      "unexplained refund treatment",
      "tip / deposit mismatch",
    ],
  },
  COST_VARIANCE: {
    id: "COST_VARIANCE",
    label: "Cost variance",
    shortLabel: "Cost variance",
    stage: "PREVENT",
    leaks:
      "Food / beverage cost moves without a clear driver — price, waste, yield, mix, substitution.",
    does: "Connects price × volume × recipe × waste × mix → ranks drivers → recommends the right lever.",
    verifies: "Cost movement explained and corrective action outcome observed.",
    maturity: "expansion",
    exampleSignals: [
      "food cost +pts",
      "waste spike",
      "yield down",
      "mix shift to low-throughput",
    ],
  },
  PROCUREMENT: {
    id: "PROCUREMENT",
    label: "Procurement intelligence",
    shortLabel: "Procurement",
    stage: "OPTIMIZE",
    leaks:
      "Same SKU, different prices across locations — missed tiers, contract leakage, consolidation opportunity.",
    does: "Surfaces dispersion → negotiation leverage → group-rate Decision.",
    verifies: "Negotiated rate / credit / volume tier applied and matched.",
    maturity: "expansion",
    exampleSignals: [
      "cross-location price dispersion",
      "missed purchasing tier",
      "equivalent SKU gap",
    ],
  },
  PERISHABLE_REVENUE: {
    id: "PERISHABLE_REVENUE",
    label: "Perishable revenue",
    shortLabel: "Perishable revenue",
    stage: "RECOVER",
    leaks:
      "Cancellations, no-shows, late releases, orphan nights, unused deposits — value about to expire.",
    does: "Capacity at risk → time remaining → recovery action → observe → verify contribution.",
    verifies: "Recovered contribution matched after service / night close.",
    maturity: "planned",
    exampleSignals: [
      "cancel cluster",
      "no-show",
      "orphan night",
      "late table release",
      "walk-away",
    ],
  },
};

export const PROGRESSION: {
  stage: ProgressionStage;
  title: string;
  body: string;
}[] = [
  {
    stage: "RECOVER",
    title: "Recover",
    body: "Find and recover existing leakage.",
  },
  {
    stage: "PREVENT",
    title: "Prevent",
    body: "Detect conditions before value expires.",
  },
  {
    stage: "OPTIMIZE",
    title: "Optimize",
    body: "Choose the best response across competing constraints.",
  },
  {
    stage: "AUTOPILOT",
    title: "Autopilot",
    body: "Execute trusted patterns inside policy.",
  },
];

export function problemFamilyOf(id: ProblemFamily): ProblemFamilyDef {
  return PROBLEM_FAMILY_DEFS[id];
}

export function pilotFamilies(): ProblemFamilyDef[] {
  return PROBLEM_FAMILIES.map((id) => PROBLEM_FAMILY_DEFS[id]).filter(
    (d) => d.maturity === "pilot",
  );
}
