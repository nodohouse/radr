/**
 * Location-aware analysis windows for Custom period.
 * Holidays follow the venue country — not generic “summer week” filler.
 */

import { LOCATIONS } from "@/lib/product/demo/catalog";
import {
  countryLabel,
  getLocationById,
  REGION_LOCATION_IDS,
} from "@/lib/radr/locationCatalog";

export type HolidayPreset = {
  id: string;
  label: string;
  from: string;
  to: string;
  kind: "holiday" | "recent";
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoFromParts(y: number, m0: number, day: number): string {
  const d = new Date(y, m0, day);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
}

/** Anonymous Gregorian algorithm → Easter Sunday. */
function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function easterIso(year: number): string {
  const d = easterSunday(year);
  return isoFromParts(d.getFullYear(), d.getMonth(), d.getDate());
}

function nthWeekdayOfMonth(
  year: number,
  month0: number,
  weekday: number,
  n: number,
): string {
  const first = new Date(year, month0, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return isoFromParts(year, month0, day);
}

/** Prefer the most recent completed window; else the next upcoming. */
function resolveRecentWindow(
  now: Date,
  build: (year: number) => { from: string; to: string },
): { from: string; to: string } {
  const y = now.getFullYear();
  const today = todayIso(now);
  const candidates = [build(y - 1), build(y), build(y + 1)];
  const past = candidates
    .filter((c) => c.to <= today)
    .sort((a, b) => b.to.localeCompare(a.to));
  if (past[0]) return past[0];
  return candidates.sort((a, b) => a.from.localeCompare(b.from))[0]!;
}

/** Demo-stable lunar New Year anchors (SG / CNY trading weeks). */
const CNY_START: Record<number, string> = {
  2024: "2024-02-10",
  2025: "2025-01-29",
  2026: "2026-02-17",
  2027: "2027-02-06",
};

function cnyWindow(year: number): { from: string; to: string } | null {
  const start = CNY_START[year];
  if (!start) return null;
  return { from: start, to: addDaysIso(start, 6) };
}

function resolveCny(now: Date): { from: string; to: string } {
  const y = now.getFullYear();
  const today = todayIso(now);
  const candidates = [y - 1, y, y + 1]
    .map((yr) => cnyWindow(yr))
    .filter((c): c is { from: string; to: string } => !!c);
  const past = candidates
    .filter((c) => c.to <= today)
    .sort((a, b) => b.to.localeCompare(a.to));
  return past[0] ?? candidates[0]!;
}

/**
 * Country for the active scope.
 * Single venue / region → that country; group / all → null (shared defaults).
 */
export function countryForScope(scope: string): string | null {
  if (scope === "all") return null;
  if (scope.startsWith("region_")) {
    const ids = REGION_LOCATION_IDS[scope] ?? [];
    const countries = new Set(
      ids
        .map((id) => getLocationById(id)?.country)
        .filter((c): c is string => !!c),
    );
    if (countries.size === 1) return [...countries][0]!;
    return null;
  }
  return getLocationById(scope)?.country ?? null;
}

function last7Days(now: Date): HolidayPreset {
  const to = todayIso(now);
  return {
    id: "last7",
    label: "Last 7 days",
    from: addDaysIso(to, -6),
    to,
    kind: "recent",
  };
}

function christmas(now: Date): HolidayPreset {
  const w = resolveRecentWindow(now, (y) => ({
    from: isoFromParts(y, 11, 24),
    to: isoFromParts(y + 1, 0, 2),
  }));
  return { id: "christmas", label: "Christmas", ...w, kind: "holiday" };
}

function easter(now: Date, label = "Easter"): HolidayPreset {
  const w = resolveRecentWindow(now, (y) => {
    const sun = easterIso(y);
    return { from: addDaysIso(sun, -2), to: addDaysIso(sun, 1) };
  });
  return { id: "easter", label, ...w, kind: "holiday" };
}

function holidaysForCountry(code: string, now: Date): HolidayPreset[] {
  switch (code) {
    case "DE":
      return [
        christmas(now),
        easter(now),
        {
          id: "unity",
          label: "Unity Day",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 9, 2),
            to: isoFromParts(y, 9, 5),
          })),
          kind: "holiday",
        },
      ];
    case "US":
      return [
        {
          id: "thanksgiving",
          label: "Thanksgiving",
          ...resolveRecentWindow(now, (y) => {
            const thu = nthWeekdayOfMonth(y, 10, 4, 4);
            return { from: addDaysIso(thu, -1), to: addDaysIso(thu, 3) };
          }),
          kind: "holiday",
        },
        christmas(now),
        {
          id: "july4",
          label: "July 4th",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 6, 2),
            to: isoFromParts(y, 6, 6),
          })),
          kind: "holiday",
        },
      ];
    case "UK":
      return [
        christmas(now),
        easter(now),
        {
          id: "august-bank",
          label: "August bank",
          ...resolveRecentWindow(now, (y) => {
            // Last Monday of August ± weekend
            const last = new Date(y, 8, 0);
            const day = last.getDate() - ((last.getDay() + 6) % 7);
            const mon = isoFromParts(y, 7, day);
            return { from: addDaysIso(mon, -2), to: addDaysIso(mon, 1) };
          }),
          kind: "holiday",
        },
      ];
    case "FR":
      return [
        christmas(now),
        easter(now),
        {
          id: "bastille",
          label: "Bastille",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 6, 12),
            to: isoFromParts(y, 6, 15),
          })),
          kind: "holiday",
        },
      ];
    case "NL":
      return [
        christmas(now),
        {
          id: "kings-day",
          label: "King's Day",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 3, 26),
            to: isoFromParts(y, 3, 28),
          })),
          kind: "holiday",
        },
        {
          id: "sinterklaas",
          label: "Sinterklaas",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 11, 4),
            to: isoFromParts(y, 11, 6),
          })),
          kind: "holiday",
        },
      ];
    case "JP":
      return [
        {
          id: "oshogatsu",
          label: "New Year",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 0, 1),
            to: isoFromParts(y, 0, 4),
          })),
          kind: "holiday",
        },
        {
          id: "golden-week",
          label: "Golden Week",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 3, 29),
            to: isoFromParts(y, 4, 5),
          })),
          kind: "holiday",
        },
        {
          id: "obon",
          label: "Obon",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 7, 13),
            to: isoFromParts(y, 7, 16),
          })),
          kind: "holiday",
        },
      ];
    case "SG":
      return [
        {
          id: "cny",
          label: "Chinese New Year",
          ...resolveCny(now),
          kind: "holiday",
        },
        christmas(now),
        {
          id: "national-day",
          label: "National Day",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 7, 8),
            to: isoFromParts(y, 7, 10),
          })),
          kind: "holiday",
        },
      ];
    case "AE":
      return [
        {
          id: "national-day",
          label: "National Day",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 11, 1),
            to: isoFromParts(y, 11, 3),
          })),
          kind: "holiday",
        },
        christmas(now),
        {
          id: "eid",
          label: "Eid week",
          // Demo anchors near recent Eid al-Fitr trading weeks
          ...resolveRecentWindow(now, (y) => {
            const starts: Record<number, string> = {
              2024: "2024-04-09",
              2025: "2025-03-30",
              2026: "2026-03-19",
              2027: "2027-03-09",
            };
            const start = starts[y] ?? isoFromParts(y, 2, 20);
            return { from: start, to: addDaysIso(start, 4) };
          }),
          kind: "holiday",
        },
      ];
    case "AU":
      return [
        christmas(now),
        easter(now),
        {
          id: "australia-day",
          label: "Australia Day",
          ...resolveRecentWindow(now, (y) => ({
            from: isoFromParts(y, 0, 24),
            to: isoFromParts(y, 0, 27),
          })),
          kind: "holiday",
        },
      ];
    default:
      return [christmas(now), easter(now)];
  }
}

export type WhenPresetPack = {
  country: string | null;
  countryName: string | null;
  hint: string;
  presets: HolidayPreset[];
};

/**
 * Holiday proposals for Custom, scoped to the active location.
 * Always ends with Last 7 days; free date pickers stay available in the UI.
 */
export function buildWhenPresets(
  scope: string,
  now = new Date(),
): WhenPresetPack {
  const country = countryForScope(scope);
  const holidays = country
    ? holidaysForCountry(country, now)
    : [christmas(now), easter(now)];

  const name = country ? countryLabel(country) : null;
  // Cap at 3 holiday chips so the rail stays calm
  const trimmed = holidays.slice(0, 3);
  return {
    country,
    countryName: name,
    hint: name
      ? `Suggested for ${name}`
      : "Suggested across your locations",
    presets: [...trimmed, last7Days(now)],
  };
}

/** @internal smoke aid — countries covered by demo catalog */
export function demoCountries(): string[] {
  return [...new Set(LOCATIONS.map((l) => l.country))].sort();
}
