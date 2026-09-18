/**
 * Incident → Pattern → Structural Decision.
 * DecisionDebt = recurring unresolved structural issue.
 */

import type { DecisionRecordHorizon } from "./horizon";

export type PatternStage = "INCIDENT" | "REPEAT" | "PATTERN" | "STRUCTURAL";

export type PatternEscalation = {
  id: string;
  decisionType: string;
  locationId: string;
  stage: PatternStage;
  incidentCount: number;
  windowLabel: string;
  similarity: number; // 0–1
  financialExposureEuro: number;
  guestImpact: "none" | "low" | "medium" | "high";
  trend: "improving" | "stable" | "worsening";
  message: string;
  structuralDecisionId?: string;
};

export type DecisionDebt = {
  id: string;
  title: string;
  locationLabel: string;
  decisionType: string;
  incidentCount: number;
  windowLabel: string;
  cumulativeExposureEuro: number;
  temporaryFixesUsed: number;
  structuralRecommendation: string;
  relatedDecisionIds: string[];
  horizon: DecisionRecordHorizon;
};

export type PatternThresholds = {
  minIncidents: number;
  minSimilarity: number;
  escalateOnExposureEuro?: number;
};

export const DEFAULT_PATTERN_THRESHOLDS: PatternThresholds = {
  minIncidents: 5,
  minSimilarity: 0.7,
  escalateOnExposureEuro: 5000,
};

/**
 * Escalate when repeats are material — "this is no longer an exception."
 */
export function evaluatePatternStage(input: {
  incidentCount: number;
  windowSize: number;
  similarity: number;
  financialExposureEuro: number;
  thresholds?: PatternThresholds;
}): PatternStage {
  const t = input.thresholds ?? DEFAULT_PATTERN_THRESHOLDS;
  const rate = input.windowSize > 0 ? input.incidentCount / input.windowSize : 0;

  if (
    input.incidentCount >= t.minIncidents &&
    input.similarity >= t.minSimilarity &&
    (rate >= 0.4 ||
      (t.escalateOnExposureEuro != null &&
        input.financialExposureEuro >= t.escalateOnExposureEuro))
  ) {
    return "STRUCTURAL";
  }
  if (input.incidentCount >= 3 && input.similarity >= 0.6) {
    return "PATTERN";
  }
  if (input.incidentCount >= 2) {
    return "REPEAT";
  }
  return "INCIDENT";
}
