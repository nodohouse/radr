/**
 * Location operating hours — configuration, not component hardcodes.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import type {
  DayOfWeek,
  LocationOperatingHours,
  OperatingWindow,
  ServicePeriod,
} from "./types";

const DAYS: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function everyDay(windows: OperatingWindow[]): Record<DayOfWeek, OperatingWindow[]> {
  return Object.fromEntries(DAYS.map((d) => [d, windows])) as Record<
    DayOfWeek,
    OperatingWindow[]
  >;
}

function weekdaysDinner(): Record<DayOfWeek, OperatingWindow[]> {
  const dinner: OperatingWindow[] = [
    { open: "17:00", close: "23:00", label: "Dinner" },
  ];
  const closed: OperatingWindow[] = [];
  return {
    monday: dinner,
    tuesday: dinner,
    wednesday: dinner,
    thursday: dinner,
    friday: dinner,
    saturday: dinner,
    sunday: closed,
  };
}

/** Soho · New York — dinner service restaurant. */
export const BERLIN_OPERATING_HOURS: LocationOperatingHours = {
  locationId: DEMO_LOCATIONS.berlin.id,
  mode: "restaurant",
  timezone: "Europe/Berlin",
  week: weekdaysDinner(),
};

/** Canal House — 24/7 hotel. */
export const CANAL_OPERATING_HOURS: LocationOperatingHours = {
  locationId: DEMO_LOCATIONS.canal.id,
  mode: "hotel_24_7",
  timezone: "Europe/Amsterdam",
  week: everyDay([{ open: "00:00", close: "24:00", label: "Hotel day" }]),
};

/** Chiado — 24/7 serviced apartments. */
export const CHIADO_OPERATING_HOURS: LocationOperatingHours = {
  locationId: DEMO_LOCATIONS.chiado.id,
  mode: "serviced_apartment_24_7",
  timezone: "Europe/Lisbon",
  week: everyDay([{ open: "00:00", close: "24:00", label: "Apartment day" }]),
};

const BY_ID: Record<string, LocationOperatingHours> = {
  [DEMO_LOCATIONS.berlin.id]: BERLIN_OPERATING_HOURS,
  [DEMO_LOCATIONS.canal.id]: CANAL_OPERATING_HOURS,
  [DEMO_LOCATIONS.chiado.id]: CHIADO_OPERATING_HOURS,
  loc_ber: BERLIN_OPERATING_HOURS,
};

export function getOperatingHours(
  locationId: string,
): LocationOperatingHours | null {
  return BY_ID[locationId] ?? null;
}

export function windowsForDay(
  hours: LocationOperatingHours,
  dow: DayOfWeek,
): OperatingWindow[] {
  return hours.week[dow] ?? [];
}

/** Demo editorial day = Friday. */
export const DEMO_OPERATING_DOW: DayOfWeek = "friday";

export function activeWindowNow(
  hours: LocationOperatingHours,
  dow: DayOfWeek = DEMO_OPERATING_DOW,
): OperatingWindow | null {
  const wins = windowsForDay(hours, dow);
  return wins[0] ?? null;
}

/** Restaurant dinner service periods for Berlin (derived from window). */
export function restaurantServicePeriods(
  window: OperatingWindow,
): ServicePeriod[] {
  // Fixed editorial bands inside dinner window — not free-floating.
  return [
    {
      id: "early",
      kind: "early",
      label: "Open / early",
      start: window.open,
      end: "18:00",
    },
    {
      id: "peak",
      kind: "peak",
      label: "Peak",
      start: "18:00",
      end: "20:30",
    },
    {
      id: "second",
      kind: "second_turn",
      label: "Second turn",
      start: "20:30",
      end: "22:00",
    },
    {
      id: "late",
      kind: "late",
      label: "Late",
      start: "22:00",
      end: window.close,
    },
  ];
}

export function hotelOperationalBands(): ServicePeriod[] {
  return [
    { id: "night", kind: "night_audit", label: "Night audit", start: "00:00", end: "06:00" },
    { id: "bfast", kind: "breakfast", label: "Breakfast", start: "06:00", end: "10:00" },
    { id: "dep", kind: "departures", label: "Departures", start: "07:00", end: "11:00" },
    { id: "hk", kind: "housekeeping", label: "Housekeeping", start: "09:00", end: "15:00" },
    { id: "cin", kind: "check_in", label: "Check-in wave", start: "14:00", end: "18:00" },
    { id: "eve", kind: "evening", label: "Evening", start: "18:00", end: "22:00" },
    { id: "ovn", kind: "overnight", label: "Overnight", start: "22:00", end: "24:00" },
  ];
}

export function apartmentOperationalBands(): ServicePeriod[] {
  return [
    { id: "dep", kind: "departures", label: "Departures", start: "08:00", end: "11:00" },
    { id: "turn", kind: "turnover", label: "Cleaning / ready", start: "10:00", end: "15:00" },
    { id: "arr", kind: "arrivals", label: "Arrivals", start: "15:00", end: "20:00" },
    { id: "eve", kind: "evening", label: "Evening access", start: "20:00", end: "24:00" },
    { id: "ovn", kind: "overnight", label: "Overnight", start: "00:00", end: "08:00" },
  ];
}

export function parseHHMM(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatMinutesRemaining(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}
