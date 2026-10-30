import type { OnboardingProgress } from "./types";
import { SELF_SERVE_FLOW } from "./flows/selfServe";

const PROGRESS_KEYS = [
  "schemaVersion",
  "flowVersion",
  "flowId",
  "currentStepId",
  "completedStepIds",
  "skippedStepIds",
  "lastCompletedAt",
] as const;

export function defaultProgress(
  currentStepId: string | null = SELF_SERVE_FLOW.steps[0]?.id ?? null,
): OnboardingProgress {
  return {
    schemaVersion: SELF_SERVE_FLOW.schemaVersion,
    flowVersion: SELF_SERVE_FLOW.version,
    flowId: SELF_SERVE_FLOW.id,
    currentStepId,
    completedStepIds: [],
    skippedStepIds: [],
    lastCompletedAt: null,
  };
}

/** Embed progress fields into legacy onboarding jsonb without wiping first-value fields. */
export function progressFromLegacyState(
  currentStepHint?: string,
): Partial<OnboardingProgress> {
  const progress = defaultProgress(currentStepHint ?? "organization");
  return {
    schemaVersion: progress.schemaVersion,
    flowVersion: progress.flowVersion,
    flowId: progress.flowId,
    currentStepId: progress.currentStepId,
    completedStepIds: ["role", "organization", "location"],
    skippedStepIds: [],
    lastCompletedAt: new Date().toISOString(),
  };
}

export function extractProgress(raw: unknown): OnboardingProgress {
  const base = defaultProgress();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Record<string, unknown>;
  return {
    schemaVersion:
      typeof obj.schemaVersion === "number" ? obj.schemaVersion : base.schemaVersion,
    flowVersion:
      typeof obj.flowVersion === "number" ? obj.flowVersion : base.flowVersion,
    flowId: typeof obj.flowId === "string" ? obj.flowId : base.flowId,
    currentStepId:
      typeof obj.currentStepId === "string" || obj.currentStepId === null
        ? (obj.currentStepId as string | null)
        : base.currentStepId,
    completedStepIds: Array.isArray(obj.completedStepIds)
      ? obj.completedStepIds.filter((x): x is string => typeof x === "string")
      : base.completedStepIds,
    skippedStepIds: Array.isArray(obj.skippedStepIds)
      ? obj.skippedStepIds.filter((x): x is string => typeof x === "string")
      : base.skippedStepIds,
    lastCompletedAt:
      typeof obj.lastCompletedAt === "string" || obj.lastCompletedAt === null
        ? (obj.lastCompletedAt as string | null)
        : base.lastCompletedAt,
  };
}

export function mergeProgressIntoOnboardingJson(
  existing: Record<string, unknown>,
  progress: OnboardingProgress,
): Record<string, unknown> {
  const next = { ...existing };
  for (const key of PROGRESS_KEYS) {
    next[key] = progress[key];
  }
  return next;
}
