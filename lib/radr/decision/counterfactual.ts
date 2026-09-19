/**
 * Counterfactual engine + internal DecisionRegret.
 * Regret is internal — never shaming UI.
 */

import type { EconomicMetricType } from "@/lib/economics/metricTypes";

export type ScenarioEconomicMetric = {
  type: EconomicMetricType | "NOT_MODELED" | "QUALITATIVE";
  value?: number;
  currency?: "EUR";
  label: string;
  baseline?: string;
  scope?: string;
  horizon?: string;
  status?: "EXPECTED" | "EXPOSED" | "POTENTIAL" | "PENDING" | "NOT_MODELED";
};

export type CounterfactualOption = {
  id: string;
  title: string;
  expectedRevenueEuro?: number;
  /**
   * Legacy scalar — prefer economicMetrics.
   * Omit when no monetary projection exists.
   */
  expectedContributionEuro?: number;
  economicMetrics?: ScenarioEconomicMetric[];
  /** When no numeric metric — e.g. "Not yet modeled". */
  economicEffectNote?: string;
  costEuro?: number;
  guestImpact: "none" | "low" | "medium" | "high";
  /** @deprecated Prefer riskLevel — kept for older fixtures. */
  operationalRisk: "low" | "medium" | "high";
  /** Explicit risk severity — never reuse as the main-risk narrative. */
  riskLevel?: "low" | "medium" | "high";
  /** Human-readable primary risk of this path. */
  mainRiskDescription?: string;
  confidence: number; // 0–100 → map to HIGH/MEDIUM/LOW in UI
  timeToResult: string;
  note: string;
  recommended?: boolean;
  isNoAction?: boolean;
};

export type DecisionRegret = {
  chosenOptionId: string;
  chosenActualEuro: number;
  estimatedBestOptionId: string;
  estimatedBestEuro: number;
  regretEuro: number;
  note: string;
};

export function optionEconomicEuro(o: CounterfactualOption): number | null {
  if (o.economicMetrics?.length) {
    const first = o.economicMetrics.find((m) => m.value != null);
    if (first?.value != null) return first.value;
  }
  if (o.expectedContributionEuro != null) return o.expectedContributionEuro;
  return null;
}

export function computeRegret(input: {
  chosenOptionId: string;
  chosenActualEuro: number;
  options: CounterfactualOption[];
}): DecisionRegret | null {
  const ranked = [...input.options]
    .filter((o) => !o.isNoAction)
    .map((o) => ({ o, euro: optionEconomicEuro(o) }))
    .filter(
      (x): x is { o: CounterfactualOption; euro: number } => x.euro != null,
    )
    .sort((a, b) => b.euro - a.euro);
  const best = ranked[0];
  if (!best) return null;
  const regret = Math.max(0, best.euro - input.chosenActualEuro);
  return {
    chosenOptionId: input.chosenOptionId,
    chosenActualEuro: input.chosenActualEuro,
    estimatedBestOptionId: best.o.id,
    estimatedBestEuro: best.euro,
    regretEuro: regret,
    note:
      regret <= 0
        ? "Chosen path matched or beat estimated best alternative."
        : `Estimated regret vs ${best.o.title}: €${Math.round(regret)}.`,
  };
}
