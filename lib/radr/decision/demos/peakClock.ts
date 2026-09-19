/**
 * Canonical D-1911 service clock — single source for display time,
 * deadline, window, wait, and resume. Do not hardcode these elsewhere.
 */

export const PEAK_SERVICE_CLOCK = {
  /** Live Decision "now" */
  nowLabel: "18:42",
  nowIso: "2026-09-17T18:42:00+02:00",
  /** Operator must decide by */
  deadlineLabel: "18:53",
  deadlineIso: "2026-09-17T18:53:00+02:00",
  /** Recommended hold duration */
  waitMinutes: 12,
  /** Modeled resume seating */
  resumeLabel: "18:54",
  /** Observed peak after approval */
  peakObservedLabel: "19:03",
  turnsObservedLabel: "19:26",
  outcomeCalculatedLabel: "21:30",
} as const;

function minutesFromHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Minutes from now → deadline (canonical: 11). */
export function peakDecisionWindowMinutes(): number {
  return (
    minutesFromHm(PEAK_SERVICE_CLOCK.deadlineLabel) -
    minutesFromHm(PEAK_SERVICE_CLOCK.nowLabel)
  );
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
