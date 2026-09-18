/**
 * Canonical ScenarioValue — CFO-grade economic labeling.
 *
 * Every public scenario euro must answer:
 * WHAT is this number? FOR WHAT? OVER WHAT PERIOD? COMPARED WITH WHAT?
 *
 * Never display a naked €0 without clarifying it is incremental vs baseline
 * (not “€0 total contribution”).
 */

export type ScenarioMetricType =
  | "GROSS_REVENUE"
  | "NET_REVENUE"
  | "GROSS_CONTRIBUTION"
  | "NET_CONTRIBUTION"
  | "INCREMENTAL_CONTRIBUTION"
  | "EXPECTED_INCREMENTAL_CONTRIBUTION"
  | "EXPOSURE"
  | "OPPORTUNITY"
  | "EXPECTED_PROTECTED"
  | "EXPECTED_CREATED"
  | "EXPECTED_RECOVERED"
  | "EXPECTED_AVOIDED"
  | "OBSERVED_CONTRIBUTION"
  | "VERIFIED_PROTECTED"
  | "VERIFIED_CREATED"
  | "VERIFIED_RECOVERED"
  | "VERIFIED_AVOIDED"
  | "RATE"
  | "COST"
  | "SUPPLIER_VARIANCE";

export type ScenarioValue = {
  amount: number;
  currency: "EUR";
  metricType: ScenarioMetricType;
  /** What the number covers — e.g. "Remaining 4 premium rooms" */
  scope: string;
  /** Time window — e.g. "72h" · "tonight" · "this week" */
  horizon: string;
  /** Explicit baseline — e.g. "vs current OTA allocation" */
  comparedTo: string;
  /** Short public label */
  label: string;
  /** Optional link to baseline scenario id */
  baselineId?: string;
  attributionType?:
    | "DIRECTLY_VERIFIED"
    | "STRONGLY_ATTRIBUTED"
    | "PARTIALLY_ATTRIBUTED"
    | "ASSOCIATED";
};

export const METRIC_TYPE_LABEL: Record<ScenarioMetricType, string> = {
  GROSS_REVENUE: "Gross revenue",
  NET_REVENUE: "Net revenue",
  GROSS_CONTRIBUTION: "Gross contribution",
  NET_CONTRIBUTION: "Net contribution",
  INCREMENTAL_CONTRIBUTION: "Incremental contribution",
  EXPECTED_INCREMENTAL_CONTRIBUTION: "Expected incremental contribution",
  EXPOSURE: "Exposure",
  OPPORTUNITY: "Opportunity",
  EXPECTED_PROTECTED: "Expected protected",
  EXPECTED_CREATED: "Expected created",
  EXPECTED_RECOVERED: "Expected recovered",
  EXPECTED_AVOIDED: "Expected avoided",
  OBSERVED_CONTRIBUTION: "Observed contribution",
  VERIFIED_PROTECTED: "Verified protected",
  VERIFIED_CREATED: "Verified created",
  VERIFIED_RECOVERED: "Verified recovered",
  VERIFIED_AVOIDED: "Verified avoided",
  RATE: "Rate",
  COST: "Cost",
  SUPPLIER_VARIANCE: "Supplier variance exposed",
};

/** One-line CFO caption for a ScenarioValue. */
export function scenarioValueCaption(v: ScenarioValue): string {
  return `${METRIC_TYPE_LABEL[v.metricType]} · ${v.scope} · ${v.horizon} · ${v.comparedTo}`;
}
