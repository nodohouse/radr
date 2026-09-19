/**
 * Finding engine: detect → complete → dedupe → score → sort.
 * Merges gold-standard scenario findings (shared SoT).
 */

import type { Finding } from "@/lib/radr/domain";
import type { OperatingContextProvider } from "@/lib/radr/ports/operatingContext";
import { demoOperatingContextProvider } from "@/lib/radr/ports/demoOperatingContext";
import { getCancellationRecoveryScenario, getSupplierVarianceScenario } from "@/lib/radr/scenarios/store";
import { dedupeFindings, filterCompleteFindings } from "./dedupe";
import { sortByPriorityScore } from "./priority";
import {
  detectCancellationExposure,
  detectStaffingGap,
  detectSupplierPriceVariance,
  detectWaitlistRecoveryOpportunity,
  detectWeatherSensitiveDemand,
} from "./rules";

export type FindingEngineOptions = {
  contextProvider?: OperatingContextProvider;
  /** Include gold-standard scenario findings (shared SoT) */
  includeScenarios?: boolean;
};

function runRules(
  ctx: NonNullable<ReturnType<OperatingContextProvider["getContext"]>>,
): Finding[] {
  const detected: Finding[] = [];
  const rules = [
    detectStaffingGap,
    detectCancellationExposure,
    detectWaitlistRecoveryOpportunity,
    detectSupplierPriceVariance,
    detectWeatherSensitiveDemand,
  ];
  for (const rule of rules) {
    const f = rule(ctx);
    if (f) detected.push(f);
  }
  return detected;
}

function withScenarios(locationId: string, findings: Finding[]): Finding[] {
  if (locationId !== "loc_ber") return findings;
  const cancel = getCancellationRecoveryScenario();
  const buy = getSupplierVarianceScenario();
  const withoutOverlap = findings.filter(
    (f) =>
      !f.dedupeKey.includes("cancellation_exposure") &&
      f.category !== "waitlist_recovery" &&
      f.category !== "supplier_price_variance" &&
      f.id !== buy.finding.id,
  );
  return [...withoutOverlap, cancel.finding, buy.finding];
}

export function runFindingEngine(
  locationId: string,
  options: FindingEngineOptions = {},
): Finding[] {
  const provider = options.contextProvider ?? demoOperatingContextProvider;
  const ctx = provider.getContext(locationId);
  if (!ctx) return [];

  const includeScenarios = options.includeScenarios !== false;
  const raw = runRules(ctx);
  const merged = includeScenarios ? withScenarios(locationId, raw) : raw;
  const complete = filterCompleteFindings(merged);
  const deduped = dedupeFindings(complete);
  return sortByPriorityScore(deduped);
}

export function findingsForScope(
  scope: string,
  options: FindingEngineOptions = {},
): Finding[] {
  if (scope === "loc_ber") {
    return runFindingEngine("loc_ber", options);
  }
  if (scope === "all" || scope.startsWith("region_")) {
    return runFindingEngine("loc_ber", options);
  }
  return [];
}
