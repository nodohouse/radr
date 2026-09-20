import type { FindingUrgency } from "@/lib/radr/domain";
import { confidenceWeight } from "@/lib/radr/calc";

const URGENCY_SCORE: Record<FindingUrgency, number> = {
  ACT_NOW: 100,
  TODAY: 70,
  WATCH: 40,
};

/**
 * priority = financialMateriality × urgency × confidence × timeSensitivity × actionability
 * Implemented as additive weighted score (stable, sortable) matching product intent.
 */
export function scoreFinding(input: {
  urgency: FindingUrgency;
  primaryValue: number;
  confidenceBand: "HIGH" | "MEDIUM" | "LOW";
  timeSensitive: boolean;
  actionable: boolean;
  /** 0-1 how collectable / protectable the money is */
  recoverability?: number;
  /** 0-1 operational severity independent of euros */
  operationalSeverity?: number;
}): number {
  const financial = Math.min(input.primaryValue / 10, 80);
  const urgency = URGENCY_SCORE[input.urgency];
  const confidence = confidenceWeight(input.confidenceBand) * 8;
  const time = input.timeSensitive ? 12 : 0;
  const action = input.actionable ? 10 : 0;
  const recover = Math.round((input.recoverability ?? 0.5) * 8);
  const severity = Math.round((input.operationalSeverity ?? 0.5) * 8);
  return urgency + financial + confidence + time + action + recover + severity;
}

export function sortByPriorityScore<T extends { priorityScore: number }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => b.priorityScore - a.priorityScore);
}
