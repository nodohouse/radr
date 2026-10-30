/**
 * Canonical D-1911 service clock — derived from LIVE_SCENARIO (DemoClock).
 * Do not hardcode conflicting times elsewhere.
 */

import {
  LIVE_SCENARIO,
  liveDecisionWindowMinutes,
} from "@/lib/radr/demoClock";

export const PEAK_SERVICE_CLOCK = {
  nowLabel: LIVE_SCENARIO.clockLabel,
  nowIso: LIVE_SCENARIO.timestampIso,
  formedLabel: LIVE_SCENARIO.decisionFormedClock,
  formedIso: LIVE_SCENARIO.decisionFormedIso,
  deadlineLabel: LIVE_SCENARIO.decisionDeadlineClock,
  deadlineIso: LIVE_SCENARIO.decisionDeadlineIso,
  waitMinutes: LIVE_SCENARIO.waitMinutes,
  resumeLabel: LIVE_SCENARIO.resumeClock,
  peakObservedLabel: LIVE_SCENARIO.peakObservedClock,
  turnsObservedLabel: LIVE_SCENARIO.turnsObservedClock,
  outcomeCalculatedLabel: LIVE_SCENARIO.outcomeCalculatedClock,
} as const;

/** Minutes from Live NOW → deadline (canonical: 11). */
export function peakDecisionWindowMinutes(): number {
  return liveDecisionWindowMinutes();
}

export function peakDeadlineDisplay(): string {
  const w = peakDecisionWindowMinutes();
  return `Decide by ${PEAK_SERVICE_CLOCK.deadlineLabel} · ~${w} min`;
}

export function peakContextLine(): string {
  return `Decision window ~${peakDecisionWindowMinutes()} min`;
}

export function peakPhaseLabel(): string {
  return `Dinner service · ${PEAK_SERVICE_CLOCK.nowLabel}`;
}

export function peakResumeNote(): string {
  return `Resume seating ~${PEAK_SERVICE_CLOCK.resumeLabel} when modeled pressure falls`;
}
