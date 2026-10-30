/**
 * Deterministic local daypart for global estate pins.
 * Uses DemoEstateRegistry timezones + demo as-of instant — no wall clock.
 */

import { getEstateEntity } from "@/lib/radr/demo/estateRegistry";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";

export type EstateDaypart =
  | "Closed"
  | "Opening"
  | "Breakfast"
  | "Lunch"
  | "Dinner"
  | "Late night";

/** Local hour 0–23 in the site timezone at the Live dinner snapshot. */
export function localHourAtDemo(
  timezone: string,
  asOfIso: string = LIVE_SCENARIO.timestampIso,
): number {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date(asOfIso));
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    return Number.isFinite(hour) ? hour % 24 : 0;
  } catch {
    return 12;
  }
}

export function daypartFromHour(hour: number): EstateDaypart {
  if (hour >= 5 && hour < 8) return "Opening";
  if (hour >= 8 && hour < 11) return "Breakfast";
  if (hour >= 11 && hour < 15) return "Lunch";
  if (hour >= 15 && hour < 17) return "Opening";
  if (hour >= 17 && hour < 22) return "Dinner";
  if (hour >= 22 || hour < 2) return "Late night";
  return "Closed";
}

export function estateDaypartForLocation(locationId: string): EstateDaypart {
  const e = getEstateEntity(locationId);
  const tz = e?.timezone ?? "America/New_York";
  return daypartFromHour(localHourAtDemo(tz));
}

export function estateLocalClockLabel(locationId: string): string {
  const e = getEstateEntity(locationId);
  const tz = e?.timezone ?? "America/New_York";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(LIVE_SCENARIO.timestampIso));
  } catch {
    return "—";
  }
}
