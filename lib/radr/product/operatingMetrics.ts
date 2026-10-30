/**
 * Operating metric registry — business pulse / bridge IDs.
 * Extends domain catalog concepts with comparison + evidence contracts.
 * Values are NEVER invented in React — only via selectors in businessPulse / contributionBridge.
 */

export type ComparisonType =
  | "vs_forecast"
  | "vs_plan"
  | "vs_target"
  | "vs_prior_period"
  | "vs_comparable";

export type MetricEvidenceClass = "deterministic" | "modeled" | "observed";

export type OperatingMetricDef = {
  id: string;
  label: string;
  domain: "sell" | "labor" | "buy" | "recover" | "ops" | "value";
  unit: "euro" | "percent" | "pp" | "count";
  format: "money" | "percent" | "pp" | "integer" | "decimal";
  grain: "mtd" | "today" | "service" | "wtd";
  requiredEvidence: string[];
  comparisonStrategies: ComparisonType[];
  rolePriority: Partial<
    Record<"cfo" | "coo" | "gm" | "owner" | "fb_operator", number>
  >;
  drilldownRoute?: string;
  evidenceClass: MetricEvidenceClass;
};

export const OPERATING_METRICS: OperatingMetricDef[] = [
  {
    id: "revenue_mtd",
    label: "Revenue",
    domain: "sell",
    unit: "euro",
    format: "money",
    grain: "mtd",
    requiredEvidence: ["pos.net_sales"],
    comparisonStrategies: ["vs_forecast", "vs_prior_period"],
    rolePriority: { cfo: 10, coo: 20, gm: 30, owner: 10 },
    drilldownRoute: "/app/intelligence?cat=revenue",
    evidenceClass: "deterministic",
  },
  {
    id: "contribution_mtd",
    label: "Contribution",
    domain: "sell",
    unit: "euro",
    format: "money",
    grain: "mtd",
    requiredEvidence: ["pos.net_sales", "cogs", "labor", "channel_fees"],
    comparisonStrategies: ["vs_plan"],
    rolePriority: { cfo: 11, coo: 25, owner: 12 },
    drilldownRoute: "/app/intelligence?cat=financial",
    evidenceClass: "modeled",
  },
  {
    id: "labor_pct_mtd",
    label: "Labor",
    domain: "labor",
    unit: "percent",
    format: "percent",
    grain: "mtd",
    requiredEvidence: ["labor.actual_cost", "pos.net_sales"],
    comparisonStrategies: ["vs_target"],
    rolePriority: { cfo: 20, coo: 15, gm: 20 },
    evidenceClass: "deterministic",
  },
  {
    id: "food_cost_pct_mtd",
    label: "Food cost",
    domain: "buy",
    unit: "percent",
    format: "percent",
    grain: "mtd",
    requiredEvidence: ["cogs", "pos.net_sales"],
    comparisonStrategies: ["vs_plan"],
    rolePriority: { cfo: 22, coo: 30, gm: 40 },
    evidenceClass: "modeled",
  },
  {
    id: "covers_mtd",
    label: "Covers",
    domain: "ops",
    unit: "count",
    format: "integer",
    grain: "mtd",
    requiredEvidence: ["pos.covers", "reservations"],
    comparisonStrategies: ["vs_forecast"],
    rolePriority: { gm: 12, coo: 18, cfo: 40 },
    evidenceClass: "deterministic",
  },
  {
    id: "avg_spend_mtd",
    label: "Avg spend",
    domain: "sell",
    unit: "euro",
    format: "decimal",
    grain: "mtd",
    requiredEvidence: ["pos.net_sales", "pos.covers"],
    comparisonStrategies: ["vs_prior_period"],
    rolePriority: { gm: 14, cfo: 35, coo: 28 },
    evidenceClass: "deterministic",
  },
  {
    id: "verified_value_mtd",
    label: "Verified Value",
    domain: "value",
    unit: "euro",
    format: "money",
    grain: "mtd",
    requiredEvidence: ["decision.verified"],
    comparisonStrategies: ["vs_prior_period"],
    rolePriority: { cfo: 15, coo: 22, owner: 15 },
    drilldownRoute: "/app/value",
    evidenceClass: "deterministic",
  },
  {
    id: "active_exposure",
    label: "Active exposure",
    domain: "value",
    unit: "euro",
    format: "money",
    grain: "today",
    requiredEvidence: ["decision.needs_you"],
    comparisonStrategies: [],
    rolePriority: { cfo: 16, coo: 12, gm: 16 },
    drilldownRoute: "/app/decisions?band=needs_you",
    evidenceClass: "deterministic",
  },
];

export function getOperatingMetric(id: string): OperatingMetricDef | undefined {
  return OPERATING_METRICS.find((m) => m.id === id);
}
