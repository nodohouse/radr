/**
 * Value Calculator assumption registry — SSOT.
 * sourceType: prefer internal_modeling_assumption. Never invent industry benchmarks.
 * @see docs/VALUE_CALCULATOR_ASSUMPTIONS.md
 */

export type SourceType =
  | "internal_modeling_assumption"
  | "public_citation";

export type VerticalId = "restaurant" | "hotel" | "mixed" | "other";

export type CategoryId =
  | "labor"
  | "supplier_ap"
  | "procurement"
  | "reconciliation"
  | "food_waste"
  | "perishable"
  | "channel_mix"
  | "readiness"
  | "revenue_pricing"
  | "guest_experience";

export type OverlapGroup =
  | "labor_cluster"
  | "ap_cluster"
  | "recon_cluster"
  | "food_cost_cluster"
  | "yield_cluster"
  | "guest_cluster";

export type RateTriple = { low: number; base: number; high: number };

export type OpportunityAssumption = {
  id: string;
  categoryId: CategoryId;
  rates: RateTriple;
  verticals: readonly VerticalId[];
  overlapGroup: OverlapGroup;
  sourceType: SourceType;
  description: string;
  sourceReference: string;
  lastReviewed: string;
  timeToProve: number;
  effort: number;
};

export const ASSUMPTION_LAST_REVIEWED = "2026-10-23";

/** Defaults when the visitor selects “I don’t know”. */
export const DEFAULT_OPERATING: Record<
  VerticalId,
  {
    laborPctOfRevenue: number;
    foodCogsPctOfRevenue: number;
    purchasingPctOfRevenue: number;
    deliveryMixPct: number;
    occupancy: number;
    otaMixPct: number;
    roomRevenueShare: number;
  }
> = {
  restaurant: {
    laborPctOfRevenue: 0.28,
    foodCogsPctOfRevenue: 0.28,
    purchasingPctOfRevenue: 0.32,
    deliveryMixPct: 0.15,
    occupancy: 0,
    otaMixPct: 0,
    roomRevenueShare: 0,
  },
  hotel: {
    laborPctOfRevenue: 0.32,
    foodCogsPctOfRevenue: 0.08,
    purchasingPctOfRevenue: 0.18,
    deliveryMixPct: 0,
    occupancy: 0.72,
    otaMixPct: 0.45,
    roomRevenueShare: 0.65,
  },
  mixed: {
    laborPctOfRevenue: 0.3,
    foodCogsPctOfRevenue: 0.18,
    purchasingPctOfRevenue: 0.25,
    deliveryMixPct: 0.08,
    occupancy: 0.7,
    otaMixPct: 0.3,
    roomRevenueShare: 0.4,
  },
  other: {
    laborPctOfRevenue: 0.3,
    foodCogsPctOfRevenue: 0.18,
    purchasingPctOfRevenue: 0.25,
    deliveryMixPct: 0.08,
    occupancy: 0.7,
    otaMixPct: 0.3,
    roomRevenueShare: 0.4,
  },
};

export const PORTFOLIO = {
  portfolioCapRate: 0.08,
  overlapCorrelationFactor: 0.35,
  defaultCaptureRate: 0.2,
  captureRateMin: 0.05,
  captureRateMax: 0.5,
} as const;

export const OPPORTUNITY_ASSUMPTIONS: readonly OpportunityAssumption[] = [
  {
    id: "laborOpportunityRate",
    categoryId: "labor",
    rates: { low: 0.015, base: 0.03, high: 0.05 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "labor_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Modeled labor variance / scheduling opportunity vs labor cost base.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.6,
    effort: 0.55,
  },
  {
    id: "supplierLeakageRate",
    categoryId: "supplier_ap",
    rates: { low: 0.008, base: 0.015, high: 0.028 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "ap_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Contract vs invoice variance opportunity vs purchasing base.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.9,
    effort: 0.3,
  },
  {
    id: "procurementDispersionRate",
    categoryId: "procurement",
    rates: { low: 0.006, base: 0.012, high: 0.022 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "ap_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Cross-site / supplier price dispersion vs purchasing base.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.7,
    effort: 0.45,
  },
  {
    id: "reconciliationVarianceRate",
    categoryId: "reconciliation",
    rates: { low: 0.002, base: 0.005, high: 0.01 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "recon_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Settlement / payment mismatch opportunity vs revenue proxy.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.85,
    effort: 0.35,
  },
  {
    id: "foodWasteOpportunityRate",
    categoryId: "food_waste",
    rates: { low: 0.01, base: 0.02, high: 0.035 },
    verticals: ["restaurant", "mixed", "other"],
    overlapGroup: "food_cost_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Waste / yield opportunity vs food/COGS base.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.55,
    effort: 0.5,
  },
  {
    id: "perishableRevenueOpportunityRate",
    categoryId: "perishable",
    rates: { low: 0.008, base: 0.018, high: 0.03 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "yield_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Time-sensitive capacity / inventory opportunity vs perishable base.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.5,
    effort: 0.6,
  },
  {
    id: "channelMixOpportunityRate",
    categoryId: "channel_mix",
    rates: { low: 0.01, base: 0.02, high: 0.035 },
    verticals: ["hotel", "mixed"],
    overlapGroup: "yield_cluster",
    sourceType: "internal_modeling_assumption",
    description: "OTA / channel mix economics vs room-exposed revenue.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.55,
    effort: 0.55,
  },
  {
    id: "readinessOpportunityRate",
    categoryId: "readiness",
    rates: { low: 0.004, base: 0.01, high: 0.018 },
    verticals: ["hotel", "mixed"],
    overlapGroup: "yield_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Arrival readiness / housekeeping timing vs room revenue proxy.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.5,
    effort: 0.5,
  },
  {
    id: "revenuePricingOpportunityRate",
    categoryId: "revenue_pricing",
    rates: { low: 0.004, base: 0.01, high: 0.02 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "yield_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Pricing / mix opportunity vs revenue.",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.45,
    effort: 0.65,
  },
  {
    id: "guestExperienceOpportunityRate",
    categoryId: "guest_experience",
    rates: { low: 0.002, base: 0.005, high: 0.01 },
    verticals: ["restaurant", "hotel", "mixed", "other"],
    overlapGroup: "guest_cluster",
    sourceType: "internal_modeling_assumption",
    description: "Guest-experience-linked operating opportunity (diagnostic rate).",
    sourceReference: "RADR internal modeling — not an industry benchmark",
    lastReviewed: ASSUMPTION_LAST_REVIEWED,
    timeToProve: 0.35,
    effort: 0.7,
  },
] as const;

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  labor: "Labor",
  supplier_ap: "Supplier / AP",
  procurement: "Procurement",
  reconciliation: "Reconciliation",
  food_waste: "Food / waste",
  perishable: "Perishable capacity",
  channel_mix: "Channel mix",
  readiness: "Operational readiness",
  revenue_pricing: "Revenue / pricing",
  guest_experience: "Guest experience",
};

export const EVIDENCE_BY_CATEGORY: Record<CategoryId, string[]> = {
  labor: ["Schedules", "Timeclock", "Payroll", "Demand source", "POS / PMS"],
  supplier_ap: [
    "Invoices",
    "Contracts",
    "Supplier statements",
    "AP ledger",
    "Credits",
  ],
  procurement: ["POs", "Supplier catalogs", "Invoice history", "Pack sizes"],
  reconciliation: ["POS settlements", "Payouts", "Refunds", "Bank / PSP"],
  food_waste: ["POS", "Menu", "Inventory", "Recipe / COGS", "Waste logs"],
  perishable: ["Reservations / PMS", "Inventory", "Channels", "Waitlist"],
  channel_mix: ["PMS", "Channel manager", "OTA", "Rate / inventory"],
  readiness: ["PMS", "Housekeeping", "Arrivals", "Labor roster"],
  revenue_pricing: ["POS / PMS", "Menu / rates", "Demand signals"],
  guest_experience: ["Reviews", "Service timing", "Complaints", "POS / PMS"],
};

export const DISCLAIMER =
  "Illustrative model based on information provided and stated assumptions. Results are not guaranteed savings, financial advice, or Verified Value.";

export function assumptionByCategory(
  id: CategoryId,
): OpportunityAssumption | undefined {
  return OPPORTUNITY_ASSUMPTIONS.find((a) => a.categoryId === id);
}
