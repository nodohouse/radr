/**
 * THE RADR LOOP - canonical operating intelligence model.
 *
 * OBSERVE → DETECT → UNDERSTAND → QUANTIFY → PREPARE → ACT → VERIFY → LEARN → OBSERVE
 *
 * Public marketing and product UX use these eight stage names.
 * Longer internal pipelines (CONNECT, APPROVE, EXPLAIN, RECOMMEND) map into these stages.
 *
 * Do not invent a second ontology: the loop operates on the hospitality operating graph.
 */

import type { Finding, FindingStatus } from "@/lib/radr/domain";
import type { ValueState } from "@/lib/radr/valueSemantics";
import { valueStateOfFinding } from "@/lib/radr/valueSemantics";

export const RADR_LOOP_STAGES = [
  "observe",
  "detect",
  "understand",
  "quantify",
  "prepare",
  "act",
  "verify",
  "learn",
] as const;

export type RadrLoopStage = (typeof RADR_LOOP_STAGES)[number];

export const RADR_LOOP_LABELS: Record<RadrLoopStage, string> = {
  observe: "Observe",
  detect: "Detect",
  understand: "Understand",
  quantify: "Quantify",
  prepare: "Prepare",
  act: "Act",
  verify: "Verify",
  learn: "Learn",
};

export const RADR_LOOP_DEFINITIONS: Record<RadrLoopStage, string> = {
  observe:
    "RADR continuously receives and normalizes signals into an operating picture.",
  detect: "RADR identifies something that deserves attention - a Finding candidate.",
  understand:
    "RADR correlates hospitality signals to explain why it matters, not just that it changed.",
  quantify:
    "RADR determines the economic consequence from canonical inputs - no invented money.",
  prepare:
    "RADR completes as much work as possible before the operator - a Prepared Action.",
  act: "A governed action occurs: approved, executed from preparation, or under explicit policy.",
  verify:
    "RADR observes what actually happened. Verified Value requires evidence.",
  learn:
    "Expected versus actual is retained for future estimates. Learning is not claimed until supported.",
};

/** Map a finding's value/status into the furthest completed loop stage (0-7). */
export function loopStageIndexFromFinding(finding: Finding): number {
  const vs = valueStateOfFinding(finding);
  return loopStageIndexFromValueState(vs, finding.status, Boolean(finding.recommendation));
}

export function loopStageIndexFromValueState(
  valueState: ValueState,
  status?: FindingStatus,
  hasRecommendation = false,
): number {
  if (valueState === "VERIFIED") return 7; // Learn pending retention still sits at verify→learn
  if (
    valueState === "OBSERVED" ||
    valueState === "PENDING_VERIFICATION"
  ) {
    return 6;
  }
  if (valueState === "ACTIONED") return 5;
  if (valueState === "PREPARED" || valueState === "ACTIONABLE") return 4;
  if (valueState === "EXPECTED") return 3;
  if (valueState === "IDENTIFIED") {
    if (hasRecommendation) return 4;
    if (status === "DETECTED") return 1;
    if (status === "OPEN" || status === "REVIEWED") return 3;
    return 2;
  }
  if (valueState === "DISMISSED" || valueState === "EXPIRED") return 3;
  return 1;
}

export function loopStageFromIndex(index: number): RadrLoopStage {
  const i = Math.max(0, Math.min(RADR_LOOP_STAGES.length - 1, index));
  return RADR_LOOP_STAGES[i]!;
}

export type LoopStageState = "complete" | "current" | "pending";

export function loopStageStates(currentIndex: number): Record<RadrLoopStage, LoopStageState> {
  const out = {} as Record<RadrLoopStage, LoopStageState>;
  RADR_LOOP_STAGES.forEach((stage, i) => {
    if (i < currentIndex) out[stage] = "complete";
    else if (i === currentIndex) out[stage] = "current";
    else out[stage] = "pending";
  });
  return out;
}

/**
 * Intervention outcome history - structures required for future learning.
 * Do not claim an online learning engine when records are only retained.
 */
export type LearningStatus = "pending" | "retained" | "not_applicable";

export type InterventionOutcomeRecord = {
  id: string;
  findingId: string;
  organizationId: string;
  locationId: string;
  territory?: string;
  contextSummary: string;
  evidenceSnapshotIds: string[];
  predictionSummary: string;
  expectedValueMajor: number;
  currency: string;
  recommendedActionSummary: string;
  approvedActionSummary?: string;
  actualActionSummary?: string;
  observedValueMajor?: number;
  verifiedValueMajor?: number;
  confidenceAtPrediction?: number;
  varianceMajor?: number;
  operatingConditions?: Record<string, string | number | boolean>;
  learningStatus: LearningStatus;
  learningNote: string;
  createdAt: string;
  updatedAt: string;
};

export function buildRetainedOutcome(input: {
  id: string;
  findingId: string;
  organizationId: string;
  locationId: string;
  territory?: string;
  contextSummary: string;
  evidenceSnapshotIds?: string[];
  predictionSummary: string;
  expectedValueMajor: number;
  currency?: string;
  recommendedActionSummary: string;
  approvedActionSummary?: string;
  actualActionSummary?: string;
  observedValueMajor?: number;
  verifiedValueMajor?: number;
  confidenceAtPrediction?: number;
  operatingConditions?: Record<string, string | number | boolean>;
  now?: string;
}): InterventionOutcomeRecord {
  const now = input.now ?? new Date().toISOString();
  const observed = input.observedValueMajor ?? input.verifiedValueMajor;
  const variance =
    observed !== undefined ? observed - input.expectedValueMajor : undefined;
  const retained = observed !== undefined;
  return {
    id: input.id,
    findingId: input.findingId,
    organizationId: input.organizationId,
    locationId: input.locationId,
    territory: input.territory,
    contextSummary: input.contextSummary,
    evidenceSnapshotIds: input.evidenceSnapshotIds ?? [],
    predictionSummary: input.predictionSummary,
    expectedValueMajor: input.expectedValueMajor,
    currency: input.currency ?? "EUR",
    recommendedActionSummary: input.recommendedActionSummary,
    approvedActionSummary: input.approvedActionSummary,
    actualActionSummary: input.actualActionSummary,
    observedValueMajor: observed,
    verifiedValueMajor: input.verifiedValueMajor,
    confidenceAtPrediction: input.confidenceAtPrediction,
    varianceMajor: variance,
    operatingConditions: input.operatingConditions,
    learningStatus: retained ? "retained" : "pending",
    learningNote: retained
      ? "Outcome retained for future estimates. No automatic model update claimed."
      : "Awaiting observed outcome before retention.",
    createdAt: now,
    updatedAt: now,
  };
}
