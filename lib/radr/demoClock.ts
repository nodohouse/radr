/**
 * One simulated operating clock for the DEMO product.
 * Business logic must not use browser Date.now() / new Date() for “today”
 * when computing Live, Decision deadlines, or replay.
 */

export const DEMO_TIMEZONE = "America/New_York";
export const DEMO_CURRENCY = "USD";
export const DEMO_ORG_ID = "org_northstar";
export const DEMO_LOCATION_ID = "loc_ber";
export const DEMO_LOCATION_NAME = "Soho · New York";

/**
 * Morning / pre-shift OS clock (brief, demo greeting).
 * Wednesday 19 August 2026, 17:30 venue-local (America/New_York).
 */
export const DEMO_AS_OF_ISO = "2026-08-19T17:30:00-04:00";
export const DEMO_BUSINESS_DATE = "2026-08-19";
export const DEMO_YESTERDAY_DATE = "2026-08-18";
export const DEMO_TOMORROW_DATE = "2026-08-20";

/**
 * Soho · New York dinner Live scenario — SSOT for LiveCommandSurface + D-1911.
 * Friday 18 Sep 2026 · 19:48 (matches Operating Calendar day-replay).
 * scenarioId kept for fixture continuity.
 */
export const LIVE_SCENARIO = {
  scenarioId: "berlin_dinner_live",
  businessDate: "2026-09-18",
  timestampIso: "2026-09-18T19:48:00-04:00",
  timezone: DEMO_TIMEZONE,
  clockLabel: "19:48",
  openClock: "17:00",
  closeClock: "23:00",
  phase: "live" as const,
  /** D-1911 formed */
  decisionFormedClock: "19:37",
  decisionFormedIso: "2026-09-18T19:37:00-04:00",
  /** Operator must decide by */
  decisionDeadlineClock: "19:59",
  decisionDeadlineIso: "2026-09-18T19:59:00-04:00",
  /** Recommended hold if Wait is chosen */
  waitMinutes: 12,
  resumeClock: "20:00",
  peakObservedClock: "20:10",
  turnsObservedClock: "20:26",
  outcomeCalculatedClock: "21:30",
} as const;

/**
 * Mercer House · New York check-in wave — SSOT for Hotel Live + D-HK-1402.
 * Thu 24 Sep 2026 · 14:20 America/New_York.
 * scenarioId kept for fixture continuity.
 */
export const HOTEL_LIVE_SCENARIO = {
  scenarioId: "canal_checkin_wave",
  businessDate: "2026-09-24",
  timestampIso: "2026-09-24T14:20:00-04:00",
  timezone: "America/New_York",
  clockLabel: "14:20",
  waveLabel: "14:00–15:30",
  phase: "checkin" as const,
  decisionFormedClock: "13:25",
  decisionFormedIso: "2026-09-24T13:25:00-04:00",
  decisionDeadlineClock: "15:00",
  decisionDeadlineIso: "2026-09-24T15:00:00-04:00",
  arrivalsToday: 42,
  roomsReady: 31,
  roomsAtRisk: 7,
  roomsDeparted: 28,
  roomsCleaning: 9,
  roomsInspection: 4,
} as const;

/** Active scenario timestamp for the current demo vertical. */
export function scenarioTimestamp(
  vertical: "restaurant" | "hotel" = "restaurant",
): string {
  return vertical === "hotel"
    ? HOTEL_LIVE_SCENARIO.timestampIso
    : LIVE_SCENARIO.timestampIso;
}

export function scenarioClockLabel(
  vertical: "restaurant" | "hotel" = "restaurant",
): string {
  return vertical === "hotel"
    ? HOTEL_LIVE_SCENARIO.clockLabel
    : LIVE_SCENARIO.clockLabel;
}

/** Deterministic demo delta for “since last check” (not a live forecast). */
export const DEMO_FORECAST_EXPOSURE_DELTA = -96;

export const DEMO_CLOCK_LABELS = {
  todayLabel: "Wednesday, 19 August",
  todayShort: "WED 19 AUG",
  yesterdayLabel: "Tuesday, 18 August",
  yesterdayShort: "YESTERDAY",
  tomorrowLabel: "Thursday, 20 August",
  asOfLabel: "19 Aug 2026 · 17:30",
  liveAsOfLabel: "18 Sep 2026 · 19:48",
} as const;

export function demoAsOf(): Date {
  return new Date(DEMO_AS_OF_ISO);
}

export function demoAsOfMs(): number {
  return demoAsOf().getTime();
}

export function liveScenarioAsOf(): Date {
  return new Date(LIVE_SCENARIO.timestampIso);
}

export function liveScenarioAsOfMs(): number {
  return liveScenarioAsOf().getTime();
}

/** Minutes remaining until Live Decision deadline (never negative for display). */
export function liveDecisionWindowMinutes(): number {
  const ms =
    new Date(LIVE_SCENARIO.decisionDeadlineIso).getTime() -
    liveScenarioAsOfMs();
  return Math.max(0, Math.round(ms / 60_000));
}

/** Venue-local hour (0-23) on the demo morning clock. */
export function demoLocalHour(): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: DEMO_TIMEZONE,
    }).format(demoAsOf()),
  );
}

export function demoGreeting(): "Good morning" | "Good afternoon" | "Good evening" {
  const h = demoLocalHour();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function isoOnDemoDate(
  date = DEMO_BUSINESS_DATE,
  timeHHmm = "17:30",
): string {
  return `${date}T${timeHHmm}:00+02:00`;
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const utc = Date.UTC(y!, m! - 1, d! + days);
  const dt = new Date(utc);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isAfterDemoAsOf(iso: string): boolean {
  return new Date(iso).getTime() > demoAsOfMs();
}

export function minutesBeforeAsOf(iso: string): number {
  return Math.max(0, Math.round((demoAsOfMs() - new Date(iso).getTime()) / 60_000));
}
