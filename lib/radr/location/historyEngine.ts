/**
 * Deterministic location history engine — 24 months of coherent operating history.
 * Same seed ⇒ same numbers. Generates on demand; does not dump everything in UI.
 */

import type { DemoLocationSeed } from "@/lib/radr/demo/organizations";
import { outlierFor } from "@/lib/radr/demo/demoOutliers";

export type HistoryPeriod =
  | "7d"
  | "30d"
  | "mtd"
  | "qtd"
  | "ytd"
  | "12m"
  | "24m";

export type DayHistoryPoint = {
  date: string; // YYYY-MM-DD
  revenue: number;
  contribution: number;
  covers: number;
  refunds: number;
  laborPct: number;
  deliverySharePct: number;
  vsPlanContrib: number; // euro delta
  decisionCount: number;
  verified: number;
  pressure: number; // 0–1
  contextLabel: string | null;
};

export type MonthHistoryPoint = {
  month: string; // YYYY-MM
  revenue: number;
  contribution: number;
  marginPct: number;
  covers: number;
  refunds: number;
  planRevenue: number;
  planContribution: number;
};

export type DaypartRow = {
  id: string;
  label: string;
  revenueSharePct: number;
  contributionSharePct: number;
  coversSharePct: number;
  avgSpend: number;
  laborProductivity: number;
  refundPct: number;
  kitchenPressure: number;
};

export type WeekdayPattern = {
  dow: number; // 0=Sun … 6=Sat
  label: string;
  coversVsAvgPct: number;
  revenueVsAvgPct: number;
  contribMarginDeltaPp: number;
  refundVsAvgPct: number;
  note: string;
};

export type LocationDna = {
  strongestDays: string;
  strongestDaypart: string;
  typicalPeak: string;
  deliverySensitivity: "LOW" | "MEDIUM" | "HIGH";
  eventSensitivity: "LOW" | "MEDIUM" | "HIGH";
  avgSpend: number;
  returningGuestPct: number;
  kitchenConstraint: string;
  highestMarginCategory: string;
  refundVulnerability: string;
  /** Hotel extras */
  bookingWindow?: string;
  readinessBottleneck?: string;
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Anchor "today" for demo history — DemoClock aligned. */
export const HISTORY_AS_OF = "2026-09-24";

function parseIso(d: string): Date {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y!, m! - 1, day!));
}

function fmtIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fmtIso(d);
}

function monthsBack(iso: string, n: number): string {
  const d = parseIso(iso);
  d.setUTCMonth(d.getUTCMonth() - n);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function archetypeModifiers(archetype: string) {
  switch (archetype) {
    case "high_volume_delivery_peak":
      return { delivery: 1.35, refund: 1.2, friPressure: 1.4, spend: 1.05 };
    case "delivery_refund":
      return { delivery: 1.45, refund: 1.85, friPressure: 1.55, spend: 0.95 };
    case "premium_attach":
      return { delivery: 0.75, refund: 0.7, friPressure: 0.9, spend: 1.22 };
    case "procurement_shock":
      return { delivery: 0.9, refund: 0.95, friPressure: 1.0, spend: 1.08 };
    case "labor_heavy":
      return { delivery: 0.85, refund: 0.9, friPressure: 1.1, spend: 1.0 };
    case "discount_spend":
      return { delivery: 1.05, refund: 1.1, friPressure: 1.05, spend: 0.88 };
    case "premium_mix":
      return { delivery: 0.7, refund: 0.65, friPressure: 0.85, spend: 1.28 };
    case "stable":
      return { delivery: 0.95, refund: 0.9, friPressure: 0.95, spend: 1.0 };
    case "boutique_city":
      return { delivery: 0.4, refund: 0.8, friPressure: 1.15, spend: 1.35 };
    default:
      return { delivery: 1, refund: 1, friPressure: 1, spend: 1 };
  }
}

export function baseDailyRevenue(seed: DemoLocationSeed): number {
  const h = hash(seed.id);
  const out = outlierFor(seed.id);
  const base =
    seed.id === "loc_berlin_mitte"
      ? 4800
      : seed.vertical === "hotel"
        ? 3200 + (h % 900)
        : 1200 + (h % 800);
  if (out) {
    return Math.round(base * (1 + out.revenueVsPlanPct / 200));
  }
  return base;
}

export function generateDailyHistory(
  seed: DemoLocationSeed,
  days = 730,
): DayHistoryPoint[] {
  const rnd = mulberry32(hash(seed.id + ":hist"));
  const mod = archetypeModifiers(seed.archetype);
  const base = baseDailyRevenue(seed);
  const out = outlierFor(seed.id);
  const points: DayHistoryPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(HISTORY_AS_OF, -i);
    const d = parseIso(date);
    const dow = d.getUTCDay();
    const month = d.getUTCMonth();
    // Seasonality
    const season =
      seed.vertical === "hotel"
        ? 1 + 0.12 * Math.sin(((month - 3) / 12) * Math.PI * 2)
        : 1 + 0.08 * Math.sin(((month - 5) / 12) * Math.PI * 2);
    const weekend = dow === 5 || dow === 6 ? 1.18 * mod.friPressure : dow === 0 ? 0.92 : 1;
    const noise = 0.92 + rnd() * 0.16;
    const revenue = Math.round(base * season * weekend * noise);
    const deliveryShare = Math.min(
      42,
      Math.round((14 + rnd() * 10) * mod.delivery),
    );
    const refundBase = revenue * 0.012 * mod.refund;
    const fridayBump = dow === 5 ? 1.42 : 1;
    const refunds = Math.round(refundBase * fridayBump * (0.85 + rnd() * 0.3));
    const contribMargin =
      0.28 +
      (out ? out.contributionVsPlanPct / 1000 : 0) -
      deliveryShare * 0.0012 -
      (refunds / revenue) * 2.5;
    const contribution = Math.round(revenue * contribMargin);
    const planContrib = Math.round(revenue * 0.28);
    const covers = Math.round(revenue / (68 * mod.spend + rnd() * 8));
    const laborPct = Math.round((26 + rnd() * 6 + (seed.archetype === "labor_heavy" ? 3 : 0)) * 10) / 10;
    const pressure = Math.min(
      1,
      (dow === 5 ? 0.55 : 0.25) + deliveryShare / 100 + rnd() * 0.2,
    );
    let contextLabel: string | null = null;
    if (month === 8 && d.getUTCDate() >= 20 && d.getUTCDate() <= 22 && seed.city === "Berlin") {
      contextLabel = "Berlin Marathon weekend";
    }
    if (rnd() < 0.03) contextLabel = contextLabel ?? "Heavy rain >10mm";

    points.push({
      date,
      revenue,
      contribution,
      covers,
      refunds,
      laborPct,
      deliverySharePct: deliveryShare,
      vsPlanContrib: contribution - planContrib,
      decisionCount: pressure > 0.75 && rnd() > 0.7 ? 1 : 0,
      verified: contribution > planContrib && rnd() > 0.85 ? Math.round(80 + rnd() * 400) : 0,
      pressure,
      contextLabel,
    });
  }
  return points;
}

export function aggregateMonths(daily: DayHistoryPoint[]): MonthHistoryPoint[] {
  const map = new Map<string, DayHistoryPoint[]>();
  for (const p of daily) {
    const m = p.date.slice(0, 7);
    const arr = map.get(m) ?? [];
    arr.push(p);
    map.set(m, arr);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, rows]) => {
      const revenue = rows.reduce((s, r) => s + r.revenue, 0);
      const contribution = rows.reduce((s, r) => s + r.contribution, 0);
      const covers = rows.reduce((s, r) => s + r.covers, 0);
      const refunds = rows.reduce((s, r) => s + r.refunds, 0);
      const planContribution = rows.reduce(
        (s, r) => s + (r.contribution - r.vsPlanContrib),
        0,
      );
      const planRevenue = Math.round(revenue / 1.02);
      return {
        month,
        revenue,
        contribution,
        marginPct: Math.round((contribution / Math.max(1, revenue)) * 1000) / 10,
        covers,
        refunds,
        planRevenue,
        planContribution,
      };
    });
}

export function slicePeriod(
  daily: DayHistoryPoint[],
  period: HistoryPeriod,
): DayHistoryPoint[] {
  const n =
    period === "7d"
      ? 7
      : period === "30d"
        ? 30
        : period === "mtd"
          ? Math.max(1, Number(HISTORY_AS_OF.slice(8, 10)))
          : period === "qtd"
            ? 90
            : period === "ytd"
              ? Math.min(
                  365,
                  (() => {
                    const start = `${HISTORY_AS_OF.slice(0, 4)}-01-01`;
                    return (
                      (parseIso(HISTORY_AS_OF).getTime() -
                        parseIso(start).getTime()) /
                        86400000 +
                      1
                    );
                  })(),
                )
              : period === "12m"
                ? 365
                : 730;
  return daily.slice(-n);
}

export function daypartMatrix(seed: DemoLocationSeed): DaypartRow[] {
  const rnd = mulberry32(hash(seed.id + ":daypart"));
  const mod = archetypeModifiers(seed.archetype);
  const parts = [
    { id: "breakfast", label: "Breakfast", w: seed.vertical === "hotel" ? 0.18 : 0.02 },
    { id: "lunch", label: "Lunch", w: 0.22 },
    { id: "afternoon", label: "Afternoon", w: 0.1 },
    { id: "dinner", label: "Dinner", w: 0.48 },
    { id: "late", label: "Late", w: 0.18 },
  ];
  const hotelAdj = seed.vertical === "hotel";
  if (hotelAdj) {
    parts[0]!.w = 0.22;
    parts[1]!.w = 0.15;
    parts[3]!.w = 0.35;
  }
  const sum = parts.reduce((s, p) => s + p.w, 0);
  return parts.map((p) => {
    const share = p.w / sum;
    return {
      id: p.id,
      label: p.label,
      revenueSharePct: Math.round(share * 1000) / 10,
      contributionSharePct:
        Math.round(share * 100 * (p.id === "dinner" ? 1.08 : 0.95) * 10) / 10,
      coversSharePct: Math.round(share * 1000) / 10,
      avgSpend: Math.round((52 + rnd() * 40) * mod.spend * 100) / 100,
      laborProductivity: Math.round((85 + rnd() * 40) * 10) / 10,
      refundPct:
        Math.round(
          (p.id === "dinner" || p.id === "late" ? 1.8 : 0.9) *
            mod.refund *
            10,
        ) / 10,
      kitchenPressure: Math.round((p.id === "dinner" ? 0.7 : 0.3 + rnd() * 0.2) * 100) / 100,
    };
  });
}

export function weekdayPatterns(seed: DemoLocationSeed): WeekdayPattern[] {
  const mod = archetypeModifiers(seed.archetype);
  return DOW.map((label, dow) => {
    const fri = dow === 5;
    const sat = dow === 6;
    const coversVsAvgPct = fri ? 18 : sat ? 12 : dow === 1 ? -8 : dow === 2 ? -4 : 2;
    const revenueVsAvgPct = fri ? 12 : sat ? 10 : dow === 1 ? -6 : 1;
    const contribMarginDeltaPp = fri
      ? -3 * mod.refund
      : sat
        ? -1.2
        : dow === 3
          ? 0.8
          : 0.2;
    const refundVsAvgPct = fri ? Math.round(42 * mod.refund) : sat ? 12 : -8;
    const note = fri
      ? "Busy, but economically weaker than it looks."
      : sat
        ? "Strong covers · watch late delivery."
        : dow === 2
          ? "Often overstaffed mid-afternoon."
          : "Within band.";
    return {
      dow,
      label,
      coversVsAvgPct,
      revenueVsAvgPct,
      contribMarginDeltaPp: Math.round(contribMarginDeltaPp * 10) / 10,
      refundVsAvgPct,
      note,
    };
  });
}

export function buildLocationDna(
  seed: DemoLocationSeed,
  daily: DayHistoryPoint[],
): LocationDna {
  const mod = archetypeModifiers(seed.archetype);
  const recent = daily.slice(-90);
  const avgSpend =
    recent.reduce((s, d) => s + d.revenue / Math.max(1, d.covers), 0) /
    Math.max(1, recent.length);
  const hotel = seed.vertical === "hotel";
  return {
    strongestDays: hotel ? "Fri–Sun" : "Thu–Sat",
    strongestDaypart: hotel ? "Arrivals 14:00–16:00" : "Dinner",
    typicalPeak: hotel ? "15:00–16:30" : "19:45–20:40",
    deliverySensitivity:
      mod.delivery > 1.2 ? "HIGH" : mod.delivery < 0.85 ? "LOW" : "MEDIUM",
    eventSensitivity: hotel || seed.city === "Berlin" ? "HIGH" : "MEDIUM",
    avgSpend: Math.round(avgSpend * 100) / 100,
    returningGuestPct: Math.round(24 + (hash(seed.id) % 18)),
    kitchenConstraint:
      seed.archetype === "labor_heavy"
        ? "Pass / expo"
        : seed.archetype === "high_volume_delivery_peak"
          ? "Cold station"
          : "Grill",
    highestMarginCategory: hotel ? "Direct suites" : "Beverage",
    refundVulnerability: hotel
      ? "7–14 day cancellation window"
      : mod.refund > 1.3
        ? "Friday delivery peak"
        : "Weekend late orders",
    bookingWindow: hotel ? "28–42 days" : undefined,
    readinessBottleneck: hotel ? "13:30–15:00" : undefined,
  };
}

export function monthLabels24(asOf = HISTORY_AS_OF): string[] {
  return Array.from({ length: 24 }, (_, i) => monthsBack(asOf, 23 - i));
}
