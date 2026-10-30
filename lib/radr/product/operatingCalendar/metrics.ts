/**
 * Operating calendar — metric adapters for restaurant + hotel pace heatmaps.
 * Binary cells: pos (beat) · neg (miss) · empty (no signal / closed / future).
 * History never advances past DemoClock “today” — no future performance.
 */

import type { RoleView } from "@/lib/product/types";
import { migrateRoleView } from "@/lib/product/types";
import {
  HOTEL_LIVE_SCENARIO,
  LIVE_SCENARIO,
} from "@/lib/radr/demoClock";

export type CalendarVertical = "restaurant" | "hotel";

export type HotelCalendarMetric =
  | "BOOKINGS"
  | "OCCUPANCY"
  | "ADR"
  | "REVPAR"
  | "READINESS";

export type RestaurantCalendarMetric =
  | "CONTRIBUTION"
  | "REVENUE"
  | "COVERS"
  | "PRESSURE"
  | "DECISIONS";

export type CalendarMetricId = HotelCalendarMetric | RestaurantCalendarMetric;

export type CalendarCellTone = "pos" | "neg" | "empty";

export type CalendarCellIntensity = "light" | "strong";

export type CalendarMetricDefinition = {
  id: CalendarMetricId;
  label: string;
  shortLabel: string;
  vertical: CalendarVertical;
};

export type CalendarDayCell = {
  weekId: string;
  dayIndex: number;
  tone: CalendarCellTone;
  intensity: CalendarCellIntensity;
  label: string;
  /** Hotel BOOKINGS pickup only — never big numbers on restaurant cells. */
  cellHint?: string;
  pickupCount?: number;
  tooltipRows: { label: string; value: string; delta?: string }[];
  revenue: string;
  contribution: string;
  covers: string;
  decisions: number;
  verified: string;
  peak: string | null;
};

const HOTEL_METRICS: CalendarMetricDefinition[] = [
  { id: "BOOKINGS", label: "Bookings pace", shortLabel: "Bookings", vertical: "hotel" },
  { id: "OCCUPANCY", label: "Occupancy", shortLabel: "Occ", vertical: "hotel" },
  { id: "ADR", label: "Average daily rate", shortLabel: "ADR", vertical: "hotel" },
  { id: "REVPAR", label: "RevPAR", shortLabel: "RevPAR", vertical: "hotel" },
  { id: "READINESS", label: "Room readiness", shortLabel: "Ready", vertical: "hotel" },
];

const RESTAURANT_METRICS: CalendarMetricDefinition[] = [
  { id: "CONTRIBUTION", label: "Contribution", shortLabel: "Contr.", vertical: "restaurant" },
  { id: "REVENUE", label: "Revenue", shortLabel: "Rev", vertical: "restaurant" },
  { id: "COVERS", label: "Covers", shortLabel: "Covers", vertical: "restaurant" },
  { id: "PRESSURE", label: "Operating pressure", shortLabel: "Pressure", vertical: "restaurant" },
  { id: "DECISIONS", label: "Decisions", shortLabel: "Decisions", vertical: "restaurant" },
];

export function calendarMetricsForVertical(
  vertical: CalendarVertical,
): CalendarMetricDefinition[] {
  return vertical === "hotel" ? HOTEL_METRICS : RESTAURANT_METRICS;
}

export function calendarMetricDefinition(
  id: CalendarMetricId,
): CalendarMetricDefinition | undefined {
  return [...HOTEL_METRICS, ...RESTAURANT_METRICS].find((m) => m.id === id);
}

export function defaultHotelCalendarMetric(role: RoleView): HotelCalendarMetric {
  const r = migrateRoleView(role);
  if (r === "cfo" || r === "finance") return "REVPAR";
  if (r === "revenue_manager" || r === "owner" || r === "regional") return "BOOKINGS";
  if (r === "hotel_gm" || r === "gm" || r === "housekeeping_manager") return "READINESS";
  return "READINESS";
}

export function defaultRestaurantCalendarMetric(
  role: RoleView,
): RestaurantCalendarMetric {
  const r = migrateRoleView(role);
  if (r === "cfo" || r === "finance") return "CONTRIBUTION";
  if (r === "head_chef" || r === "kitchen" || r === "fb_operator") return "PRESSURE";
  if (r === "owner" || r === "regional") return "REVENUE";
  return "CONTRIBUTION";
}

export function defaultCalendarMetric(
  vertical: CalendarVertical,
  role: RoleView,
): CalendarMetricId {
  return vertical === "hotel"
    ? defaultHotelCalendarMetric(role)
    : defaultRestaurantCalendarMetric(role);
}

export type CalendarPeriod = {
  /** Full year, e.g. 2026 */
  year: number;
  /** 1–12 */
  month: number;
};

/** Demo Live night — Sep 2026 · Fri 18. Default history window. */
export const DEFAULT_CALENDAR_PERIOD: CalendarPeriod = {
  year: 2026,
  month: 9,
};

/** Earliest year offered in the History period picker. */
export const CALENDAR_MIN_YEAR = 2024;

export type CalendarAsOf = {
  year: number;
  month: number;
  day: number;
};

/** DemoClock “today” for the active vertical — History cannot look past this. */
export function calendarAsOf(vertical: CalendarVertical): CalendarAsOf {
  const iso =
    vertical === "hotel"
      ? HOTEL_LIVE_SCENARIO.businessDate
      : LIVE_SCENARIO.businessDate;
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function maxCalendarPeriod(vertical: CalendarVertical): CalendarPeriod {
  const asOf = calendarAsOf(vertical);
  return { year: asOf.year, month: asOf.month };
}

export function periodKey(period: CalendarPeriod): number {
  return period.year * 12 + period.month;
}

export function clampCalendarPeriod(
  period: CalendarPeriod,
  max: CalendarPeriod,
): CalendarPeriod {
  if (periodKey(period) <= periodKey(max)) return period;
  return { ...max };
}

export function canAdvanceCalendarPeriod(
  period: CalendarPeriod,
  max: CalendarPeriod,
): boolean {
  return periodKey(period) < periodKey(max);
}

export function isCalendarDateAfterAsOf(
  y: number,
  m: number,
  day: number,
  asOf: CalendarAsOf,
): boolean {
  if (y !== asOf.year) return y > asOf.year;
  if (m !== asOf.month) return m > asOf.month;
  return day > asOf.day;
}

const DAY_NAMES = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;
const MONTH_SHORT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

export function calendarMonthLabel(period: CalendarPeriod): string {
  return `${MONTH_SHORT[period.month - 1]} ${period.year}`;
}

export function shiftCalendarPeriod(
  period: CalendarPeriod,
  deltaMonths: number,
  max?: CalendarPeriod,
): CalendarPeriod {
  const d = new Date(Date.UTC(period.year, period.month - 1 + deltaMonths, 1));
  const next = { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  return max ? clampCalendarPeriod(next, max) : next;
}

/** ISO week number (Mon-start) for a UTC calendar date. */
function isoWeek(y: number, m: number, day: number): number {
  const t = new Date(Date.UTC(y, m - 1, day));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Monday (UTC) of the ISO week containing the 1st of the month. */
function monthGridStart(period: CalendarPeriod): Date {
  const first = new Date(Date.UTC(period.year, period.month - 1, 1));
  const dow = first.getUTCDay() || 7; // 1=Mon … 7=Sun
  first.setUTCDate(first.getUTCDate() - (dow - 1));
  return first;
}

/**
 * Deterministic demo tone from date — binary green/red trend.
 * Sep 2026 Fri 18 stays the strong demo night.
 */
function toneForDate(
  y: number,
  m: number,
  day: number,
): { tone: CalendarCellTone; intensity: CalendarCellIntensity; isDemoFri: boolean } {
  const isDemoFri = y === 2026 && m === 9 && day === 18;
  if (isDemoFri) {
    return { tone: "neg", intensity: "strong", isDemoFri: true };
  }
  // Stable hash → mostly green, ~1/4 red
  const h = (y * 37 + m * 53 + day * 17) % 11;
  if (h === 0 || h === 3 || h === 7) {
    return { tone: "neg", intensity: h === 0 ? "strong" : "light", isDemoFri: false };
  }
  return { tone: "pos", intensity: h === 5 ? "strong" : "light", isDemoFri: false };
}

function restaurantEconomics(
  tone: CalendarCellTone,
  isDemoFri: boolean,
): Pick<
  CalendarDayCell,
  "revenue" | "contribution" | "covers" | "verified" | "decisions" | "peak"
> {
  const revenue = isDemoFri ? "€27.4k" : tone === "pos" ? "€24.1k" : tone === "neg" ? "€21.8k" : "€22.6k";
  const contribution = isDemoFri ? "€7.8k" : tone === "pos" ? "€7.1k" : tone === "neg" ? "€6.4k" : "€6.8k";
  const covers = isDemoFri ? "412" : tone === "pos" ? "368" : "341";
  return {
    revenue,
    contribution,
    covers,
    decisions: isDemoFri ? 3 : tone === "neg" ? 2 : tone === "empty" ? 0 : 1,
    verified: isDemoFri ? "€590" : tone === "pos" ? "€310" : tone === "neg" ? "€120" : "€0",
    peak: isDemoFri || tone === "neg" ? "20:10" : null,
  };
}

export function restaurantCalendarTooltipRows(
  cell: CalendarDayCell,
): CalendarDayCell["tooltipRows"] {
  return [
    { label: "Revenue", value: cell.revenue, delta: cell.tone === "pos" ? "+2.1%" : undefined },
    { label: "Contribution", value: cell.contribution, delta: cell.tone === "neg" ? "−1.8%" : undefined },
    { label: "Covers", value: cell.covers },
    { label: "Peak", value: cell.peak ?? "—" },
    { label: "Decisions", value: String(cell.decisions) },
    { label: "Verified", value: cell.verified },
  ];
}

function hotelTooltip(
  metric: HotelCalendarMetric,
  tone: CalendarCellTone,
  isDemoFri: boolean,
): CalendarDayCell["tooltipRows"] {
  const beat = tone === "pos";
  const miss = tone === "neg";
  const occ = isDemoFri ? "91%" : beat ? "88%" : miss ? "82%" : "84%";
  const adr = isDemoFri ? "€262" : beat ? "€251" : "€244";
  const revpar = isDemoFri ? "€238" : beat ? "€221" : "€205";
  const ready = isDemoFri ? "36/42" : miss ? "28/38" : "31/40";
  const pickup = isDemoFri ? 18 : beat ? 14 : miss ? 9 : 11;
  const pickupDelta = isDemoFri ? "+11%" : beat ? "+6%" : miss ? "−3%" : "+2%";

  switch (metric) {
    case "BOOKINGS":
      return [
        { label: "Pickup", value: String(pickup), delta: pickupDelta },
        { label: "Occupancy", value: occ },
        { label: "Direct share", value: isDemoFri ? "64%" : "61%" },
      ];
    case "OCCUPANCY":
      return [
        { label: "Occupancy", value: occ, delta: pickupDelta },
        { label: "Arrivals", value: isDemoFri ? "44" : "38" },
        { label: "On the books", value: isDemoFri ? "96%" : "92%" },
      ];
    case "ADR":
      return [
        { label: "ADR", value: adr, delta: isDemoFri ? "+€14" : "+€4" },
        { label: "Net ADR", value: isDemoFri ? "€248" : "€236" },
        { label: "Channel mix", value: "Direct weighted" },
      ];
    case "REVPAR":
      return [
        { label: "RevPAR", value: revpar, delta: isDemoFri ? "+5.2%" : "+2.1%" },
        { label: "ADR", value: adr },
        { label: "Occ", value: occ },
      ];
    case "READINESS":
      return [
        {
          label: "Ready / arrivals",
          value: ready,
          delta: isDemoFri ? "2 at risk" : miss ? "9 at risk" : "On pace",
        },
        { label: "HK productivity", value: isDemoFri ? "12.8/shift" : "13.4/shift" },
        { label: "Wave", value: "14:00–15:30" },
      ];
  }
}

function emptyCell(
  weekId: string,
  dayIndex: number,
  label = `${DAY_NAMES[dayIndex]} · —`,
): CalendarDayCell {
  return {
    weekId,
    dayIndex,
    tone: "empty",
    intensity: "light",
    label,
    tooltipRows: [],
    revenue: "—",
    contribution: "—",
    covers: "—",
    decisions: 0,
    verified: "—",
    peak: null,
  };
}

export function buildOperatingCalendarCells(
  vertical: CalendarVertical,
  metric: CalendarMetricId,
  period: CalendarPeriod = DEFAULT_CALENDAR_PERIOD,
): CalendarDayCell[] {
  const out: CalendarDayCell[] = [];
  const asOf = calendarAsOf(vertical);
  const clamped = clampCalendarPeriod(period, maxCalendarPeriod(vertical));
  const daysInMonth = new Date(
    Date.UTC(clamped.year, clamped.month, 0),
  ).getUTCDate();
  const cursor = monthGridStart(clamped);
  const monthAbbr = MONTH_SHORT[clamped.month - 1];

  // 4–6 ISO weeks covering the selected month
  for (let w = 0; w < 6; w++) {
    const weekAnchor = new Date(cursor);
    weekAnchor.setUTCDate(cursor.getUTCDate() + w * 7);
    // Stop once a full week is past the month (and we have ≥4 weeks)
    if (w >= 4) {
      const weekTouchesMonth = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekAnchor);
        d.setUTCDate(weekAnchor.getUTCDate() + i);
        return d.getUTCMonth() + 1 === clamped.month;
      }).some(Boolean);
      if (!weekTouchesMonth) break;
    }

    const weekNum = isoWeek(
      weekAnchor.getUTCFullYear(),
      weekAnchor.getUTCMonth() + 1,
      weekAnchor.getUTCDate(),
    );
    const weekId = `W${weekNum}`;

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekAnchor);
      d.setUTCDate(weekAnchor.getUTCDate() + i);
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const day = d.getUTCDate();
      const inMonth = m === clamped.month && y === clamped.year;

      if (!inMonth || isCalendarDateAfterAsOf(y, m, day, asOf)) {
        out.push(emptyCell(weekId, i));
        continue;
      }

      const { tone, intensity, isDemoFri } = toneForDate(y, m, day);
      const label = `${DAY_NAMES[i]} · ${String(day).padStart(2, "0")} ${monthAbbr}`;
      const econ = restaurantEconomics(tone, isDemoFri);
      const pickupCount =
        vertical === "hotel"
          ? isDemoFri
            ? 18
            : tone === "pos"
              ? 14
              : tone === "neg"
                ? 9
                : 11
          : undefined;

      const showPickupInCell =
        vertical === "hotel" && metric === "BOOKINGS" && pickupCount != null;

      const tooltipRows =
        vertical === "hotel"
          ? hotelTooltip(metric as HotelCalendarMetric, tone, isDemoFri)
          : restaurantCalendarTooltipRows({
              weekId,
              dayIndex: i,
              tone,
              intensity,
              label,
              tooltipRows: [],
              pickupCount,
              cellHint: undefined,
              ...econ,
            });

      out.push({
        weekId,
        dayIndex: i,
        tone,
        intensity,
        label,
        cellHint: showPickupInCell ? String(pickupCount) : undefined,
        pickupCount,
        tooltipRows,
        ...econ,
      });
    }

    // Cap at weeks that include day 1…daysInMonth
    if (weekAnchor.getUTCDate() + 6 > daysInMonth && w >= 3) {
      const lastInWeek = new Date(weekAnchor);
      lastInWeek.setUTCDate(weekAnchor.getUTCDate() + 6);
      if (
        lastInWeek.getUTCMonth() + 1 !== clamped.month ||
        lastInWeek.getUTCDate() >= daysInMonth
      ) {
        // continue loop; break handled by touches check above
      }
    }
  }
  return out;
}

/** Unique week ids in display order for a built cell set. */
export function calendarWeekIds(cells: CalendarDayCell[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const c of cells) {
    if (!seen.has(c.weekId)) {
      seen.add(c.weekId);
      ids.push(c.weekId);
    }
  }
  return ids;
}

export function calendarCellAriaLabel(
  cell: CalendarDayCell,
  metric: CalendarMetricDefinition,
): string {
  if (metric.vertical === "restaurant") {
    return `${cell.label}: ${metric.label} · Revenue ${cell.revenue} · Contribution ${cell.contribution}`;
  }
  const primary = cell.tooltipRows[0];
  const delta = primary?.delta ? ` ${primary.delta}` : "";
  return `${cell.label}: ${metric.label} ${primary?.value ?? ""}${delta}`;
}
