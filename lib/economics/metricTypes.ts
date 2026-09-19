/**
 * Canonical economic metric semantics.
 * UI labels must derive from type — never rename the same field differently per page.
 */

export const ECONOMIC_METRIC_TYPES = [
  "EXPOSURE",
  "SUPPLIER_VARIANCE",
  "GROSS_VALUE",
  "RATE",
  "REVENUE",
  "EXPECTED_NET_CONTRIBUTION",
  "OBSERVED_NET_CONTRIBUTION",
  "EXPECTED_INCREMENTAL_CONTRIBUTION",
  "OBSERVED_INCREMENTAL_CONTRIBUTION",
  "VERIFIED_INCREMENTAL_CONTRIBUTION",
  "EXPECTED_PROTECTED",
  "VERIFIED_PROTECTED",
  "VERIFIED_RECOVERED",
  "VERIFIED_CREATED",
  "VERIFIED_AVOIDED",
  "STRUCTURAL_IMPROVEMENT_OPPORTUNITY",
  /** @deprecated Prefer EXPECTED_INCREMENTAL_CONTRIBUTION */
  "INCREMENTAL_CONTRIBUTION",
  "BASELINE_DELTA",
] as const;

export type EconomicMetricType = (typeof ECONOMIC_METRIC_TYPES)[number];

export const ECONOMIC_METRIC_LABEL: Record<EconomicMetricType, string> = {
  EXPOSURE: "Exposure",
  SUPPLIER_VARIANCE: "Supplier variance exposed",
  GROSS_VALUE: "Gross value",
  RATE: "Rate",
  REVENUE: "Revenue",
  EXPECTED_NET_CONTRIBUTION: "Expected net contribution",
  OBSERVED_NET_CONTRIBUTION: "Observed net contribution",
  EXPECTED_INCREMENTAL_CONTRIBUTION: "Expected incremental contribution",
  OBSERVED_INCREMENTAL_CONTRIBUTION: "Observed incremental contribution",
  VERIFIED_INCREMENTAL_CONTRIBUTION: "Verified incremental contribution",
  EXPECTED_PROTECTED: "Expected protected",
  VERIFIED_PROTECTED: "Verified protected",
  VERIFIED_RECOVERED: "Verified recovered",
  VERIFIED_CREATED: "Verified created",
  VERIFIED_AVOIDED: "Verified avoided",
  STRUCTURAL_IMPROVEMENT_OPPORTUNITY: "Expected improvement opportunity",
  INCREMENTAL_CONTRIBUTION: "Incremental contribution",
  BASELINE_DELTA: "Baseline delta",
};

export type MetricPresentation = {
  type: EconomicMetricType;
  value: number;
  currency: "EUR";
  label: string;
  scopeLabel: string;
  horizonLabel: string;
  baselineLabel?: string;
};

/** Expected / modeled metrics — must never be labeled as Verified Value. */
export const EXPECTED_METRIC_TYPES = new Set<EconomicMetricType>([
  "EXPECTED_NET_CONTRIBUTION",
  "EXPECTED_PROTECTED",
  "EXPECTED_INCREMENTAL_CONTRIBUTION",
  "STRUCTURAL_IMPROVEMENT_OPPORTUNITY",
  "SUPPLIER_VARIANCE",
  "EXPOSURE",
]);

/** Verified metrics — only after observed reality + attribution. */
export const VERIFIED_METRIC_TYPES = new Set<EconomicMetricType>([
  "VERIFIED_PROTECTED",
  "VERIFIED_RECOVERED",
  "VERIFIED_CREATED",
  "VERIFIED_AVOIDED",
  "VERIFIED_INCREMENTAL_CONTRIBUTION",
]);

export function isVerifiedMetricType(t: EconomicMetricType): boolean {
  return VERIFIED_METRIC_TYPES.has(t);
}

export function isExpectedMetricType(t: EconomicMetricType): boolean {
  return EXPECTED_METRIC_TYPES.has(t);
}

export function metricCaption(m: MetricPresentation): string {
  const parts: string[] = [m.label];
  if (m.scopeLabel) parts.push(m.scopeLabel);
  if (
    m.horizonLabel &&
    !isHorizonRedundant(m.scopeLabel ?? "", m.horizonLabel)
  ) {
    parts.push(m.horizonLabel);
  }
  if (m.baselineLabel) {
    const already =
      m.label.toLowerCase().includes(m.baselineLabel.toLowerCase()) ||
      (m.scopeLabel ?? "").toLowerCase().includes("vs seat-now");
    if (!already) parts.push(m.baselineLabel);
  }
  // Dedupe consecutive identical segments
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (out[out.length - 1]?.toLowerCase() === p.toLowerCase()) continue;
    out.push(p);
  }
  return out.join(" · ");
}

/** Skip horizon when scope already carries the same temporal meaning. */
export function isHorizonRedundant(
  scopeLabel: string,
  horizonLabel: string,
): boolean {
  const s = scopeLabel.toLowerCase();
  const h = horizonLabel.toLowerCase().trim();
  if (!h) return true;
  if (s.includes(h)) return true;
  if (h === "tonight" && s.includes("tonight")) return true;
  if (h === "72h" && (s.includes("72h") || s.includes("72 h"))) return true;
  if (h.includes("test") && s.includes("test")) return true;
  if (h.includes("week") && s.includes("invoice")) return true;
  return false;
}
