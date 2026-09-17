import type { Clock } from "./types";
import { parseHm } from "./format";

/** Frozen service clock — systems calculate against this fixture, not wall clock. */
export const SERVICE_CLOCK: Clock = {
  nowLabel: "18:42",
  deadlineLabel: "18:53",
  waitMinutes: 12,
  resumeLabel: "18:54",
  nowMinutes: parseHm("18:42"),
};

export function minutesUntilDeadline(): number {
  return parseHm(SERVICE_CLOCK.deadlineLabel) - SERVICE_CLOCK.nowMinutes;
}

export function decideByLabel(): string {
  return `Decide by ${SERVICE_CLOCK.deadlineLabel} · ~${minutesUntilDeadline()} min`;
}
