/**
 * One simulated operating clock for the DEMO product.
 * Business logic must not use browser Date.now() / new Date() for “today”.
 */

export const DEMO_TIMEZONE = "Europe/Berlin";
export const DEMO_CURRENCY = "EUR";
export const DEMO_ORG_ID = "org_northstar";
export const DEMO_LOCATION_ID = "loc_ber";
export const DEMO_LOCATION_NAME = "Berlin Mitte";

/** Wednesday 19 August 2026, 17:30 venue-local. */
export const DEMO_AS_OF_ISO = "2026-08-19T17:30:00+02:00";
export const DEMO_BUSINESS_DATE = "2026-08-19";
export const DEMO_YESTERDAY_DATE = "2026-08-18";
export const DEMO_TOMORROW_DATE = "2026-08-20";

/** Deterministic demo delta for “since last check” (not a live forecast). */
export const DEMO_FORECAST_EXPOSURE_DELTA = -96;

export const DEMO_CLOCK_LABELS = {
  todayLabel: "Wednesday, 19 August",
  todayShort: "WED 19 AUG",
  yesterdayLabel: "Tuesday, 18 August",
  yesterdayShort: "YESTERDAY",
  tomorrowLabel: "Thursday, 20 August",
  asOfLabel: "19 Aug 2026 · 17:30",
} as const;

export function demoAsOf(): Date {
  return new Date(DEMO_AS_OF_ISO);
}

export function demoAsOfMs(): number {
  return demoAsOf().getTime();
}

/** Venue-local hour (0-23) on the demo clock. */
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
