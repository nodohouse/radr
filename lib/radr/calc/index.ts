/**
 * Shared domain calculations. UI must not re-implement these.
 */

export {
  estimateContribution,
  calculateExpectedNetBenefit,
  calculateStaffingRisk,
  calculateCancellationExposure,
  calculateSupplierVariance,
  URGENCY_WEIGHT,
  confidenceWeight,
  applyFreshnessToConfidence,
  type ConfidenceLevel,
  type DataSourceKey,
  type DataSourceFreshness,
  type FinancialImpact as LegacyFinancialImpact,
  type FindingRecommendation as LegacyFindingRecommendation,
  type FindingConfidence,
  type FindingVerification,
  type StaffingRiskInput,
  type CancellationExposureInput,
  type SupplierVarianceInput,
  type SupplierLineVariance,
} from "@/lib/radr/findingIntelligence";

export {
  expectedBookingValue,
  unrecoveredFromGross,
  REPLACEMENT_PRIOR,
  type CancellationLead,
  type CancellationCluster,
} from "@/lib/radr/cancellationModel";

/** Percent variance: actual vs baseline. Returns 0 if baseline is 0. */
export function pctVsBaseline(actual: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((actual - baseline) / Math.abs(baseline)) * 100;
}

export function pctVsForecast(actual: number, forecast: number): number {
  return pctVsBaseline(actual, forecast);
}

export function occupancyPct(covers: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return (covers / capacity) * 100;
}

export function laborCostPct(laborCost: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return (laborCost / revenue) * 100;
}

export function marginPtsDelta(actualMargin: number, planMargin: number): number {
  return actualMargin - planMargin;
}

export function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((s, item) => s + pick(item), 0);
}
