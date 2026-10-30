/**
 * Calendar performance — shared Live (Day) / Performance (Week·Month) heat map.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import type {
  CalendarMetricId,
  DayPerformanceCell,
  DayReplay,
  CalendarCellTone,
} from "./types";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";

function toneFromDelta(
  deltaPct: number,
  threshold = 2,
): CalendarCellTone {
  if (Math.abs(deltaPct) <= threshold) return "neutral";
  return deltaPct > 0 ? "positive" : "negative";
}

function formatDelta(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

/** Deterministic September demo month for Berlin (contribution default). */
export function berlinCalendarMonth(
  metric: CalendarMetricId = "contribution_vs_plan",
): DayPerformanceCell[] {
  // Sparse editorial pattern — Fri dinners often pressure / contribution soft
  const days: Array<{
    d: number;
    rev: number;
    contrib: number;
    decisions: number;
    verified: number;
    err: number;
    peak: string | null;
    lunch?: number;
    dinner?: number;
  }> = [
    { d: 1, rev: 1.2, contrib: 0.4, decisions: 0, verified: 0, err: 4.2, peak: null },
    { d: 2, rev: -0.8, contrib: -1.1, decisions: 1, verified: 420, err: 5.1, peak: "20:05" },
    { d: 3, rev: 2.4, contrib: 1.1, decisions: 0, verified: 0, err: 3.8, peak: null },
    { d: 4, rev: 0.6, contrib: -0.3, decisions: 0, verified: 0, err: 4.0, peak: null },
    { d: 5, rev: 4.8, contrib: -2.6, decisions: 2, verified: 890, err: 6.4, peak: "20:12", lunch: 3.1, dinner: -4.2 },
    { d: 6, rev: 5.2, contrib: 1.8, decisions: 1, verified: 610, err: 5.0, peak: "19:55" },
    { d: 8, rev: -1.4, contrib: -3.2, decisions: 1, verified: 0, err: 7.1, peak: "20:20" },
    { d: 9, rev: 0.2, contrib: 0.5, decisions: 0, verified: 0, err: 3.2, peak: null },
    { d: 10, rev: 3.1, contrib: 2.4, decisions: 0, verified: 0, err: 2.9, peak: null },
    { d: 11, rev: 1.0, contrib: -0.8, decisions: 0, verified: 0, err: 4.5, peak: null },
    { d: 12, rev: 6.1, contrib: -3.8, decisions: 2, verified: 1180, err: 6.8, peak: "20:08", lunch: 2.0, dinner: -5.5 },
    { d: 13, rev: 4.0, contrib: 0.9, decisions: 1, verified: 540, err: 5.2, peak: "19:50" },
    { d: 15, rev: -2.1, contrib: -1.4, decisions: 1, verified: 0, err: 5.8, peak: "20:15" },
    { d: 16, rev: 1.5, contrib: 1.2, decisions: 0, verified: 0, err: 3.5, peak: null },
    { d: 17, rev: 2.8, contrib: 2.1, decisions: 0, verified: 0, err: 3.1, peak: null },
    { d: 18, rev: 4.2, contrib: -1.8, decisions: 3, verified: 590, err: 6.1, peak: "20:10", lunch: 7.0, dinner: -9.0 },
    { d: 19, rev: 5.5, contrib: -4.1, decisions: 2, verified: 2960, err: 7.2, peak: "20:18", lunch: 1.5, dinner: -6.2 },
    { d: 20, rev: 3.8, contrib: 1.4, decisions: 1, verified: 1590, err: 4.8, peak: "19:42" },
    { d: 22, rev: 0.9, contrib: 0.2, decisions: 0, verified: 0, err: 3.6, peak: null },
    { d: 23, rev: -0.5, contrib: -0.9, decisions: 0, verified: 0, err: 4.1, peak: null },
    { d: 25, rev: 11.0, contrib: 4.0, decisions: 1, verified: 720, err: 5.5, peak: "20:00", lunch: 4.2, dinner: 8.1 },
  ];

  const dowNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return days.map((row) => {
    const dateIso = `2026-09-${String(row.d).padStart(2, "0")}`;
    // 2026-09-01 = Tuesday
    const dowIdx = (1 + row.d - 1) % 7;
    const date = new Date(`${dateIso}T12:00:00Z`);
    const isoWeek = isoWeekNumber(date);
    const revenueActual = Math.round(26_200 * (1 + row.rev / 100));
    const contributionActual = Math.round(8_050 * (1 + row.contrib / 100));
    const moneyOut = Math.round(revenueActual - contributionActual);
    const covers = Math.round(310 + row.rev * 4);
    const avgSpend = Math.round((revenueActual / Math.max(covers, 1)) * 100) / 100;

    const value =
      metric === "revenue_vs_forecast"
        ? row.rev
        : metric === "contribution_vs_plan"
          ? row.contrib
          : metric === "verified_value"
            ? row.verified
            : metric === "decision_count"
              ? row.decisions
              : metric === "forecast_accuracy"
                ? -row.err
                : row.peak
                  ? 80
                  : 30;

    const formatted =
      metric === "verified_value"
        ? row.verified > 0
          ? `€${row.verified.toLocaleString("en-GB")}`
          : "—"
        : metric === "decision_count"
          ? String(row.decisions)
          : metric === "forecast_accuracy"
            ? `${row.err.toFixed(1)}%`
            : formatDelta(value);

    const tone: CalendarCellTone =
      metric === "verified_value"
        ? row.verified > 0
          ? "positive"
          : "neutral"
        : metric === "decision_count"
          ? row.decisions >= 2
            ? "negative"
            : row.decisions === 1
              ? "neutral"
              : "positive"
          : metric === "forecast_accuracy"
            ? row.err <= 4
              ? "positive"
              : row.err <= 6
                ? "neutral"
                : "negative"
            : toneFromDelta(value);

    const highlights: string[] = [];
    if (row.peak) highlights.push(`Peak pressure ${row.peak}`);
    if (row.decisions > 0) {
      highlights.push(
        row.d === 18
          ? `${displayDecisionId(DECISION_IDS.peak)} formed`
          : `${row.decisions} Decision${row.decisions === 1 ? "" : "s"}`,
      );
    }
    if (Math.abs(row.contrib) > 2) {
      highlights.push(
        row.contrib < 0
          ? "Contribution behind plan"
          : "Contribution ahead of plan",
      );
    }
    if (row.d === 18) {
      highlights.push("Delivery ↑31%", "Kitchen entered fragile band", "Service recovered 20:36");
    }
    if (row.d === 25) {
      highlights.push(
        "Payday weekend",
        "Concert 800m",
        "Heavy rain 20:00",
      );
    }

    return {
      dateIso,
      dayLabel: String(row.d),
      dow: dowNames[dowIdx]!,
      isoWeek,
      metricId: metric,
      value,
      formatted,
      tone,
      tooltip: {
        revenueActual,
        revenueDeltaPct: row.rev,
        contributionActual,
        contributionDeltaPct: row.contrib,
        moneyIn: revenueActual,
        moneyOut,
        covers,
        avgSpend,
        decisions: row.decisions,
        verifiedEuro: row.verified,
        forecastErrorPct: row.err,
        peakPressure: row.peak,
        highlights: highlights.slice(0, 3),
      },
      services:
        row.lunch != null && row.dinner != null
          ? [
              {
                label: "Lunch",
                deltaPct: row.lunch,
                tone: toneFromDelta(row.lunch),
              },
              {
                label: "Dinner",
                deltaPct: row.dinner,
                tone: toneFromDelta(row.dinner),
              },
            ]
          : undefined,
    };
  });
}

/** ISO week number for a Date. */
function isoWeekNumber(d: Date): number {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function defaultCalendarMetricForRole(
  role: string,
): CalendarMetricId {
  if (role === "cfo" || role === "owner") return "contribution_vs_plan";
  if (role === "revenue") return "revenue_vs_forecast";
  if (role === "chef") return "operational_pressure";
  return "revenue_vs_forecast"; // GM default — operating performance
}

/** Friday 18 Sep — flagship day replay connecting Live → Decision → Verified. */
export function getDayReplay(
  dateIso: string,
  locationId: string = DEMO_LOCATIONS.berlin.id,
): DayReplay | null {
  if (dateIso !== "2026-09-18") return null;
  if (
    locationId !== DEMO_LOCATIONS.berlin.id &&
    locationId !== "loc_ber" &&
    locationId !== "all"
  ) {
    return null;
  }

  return {
    dateIso,
    locationId: DEMO_LOCATIONS.berlin.id,
    title: "Friday 18 September · Soho · New York",
    openClock: "17:00",
    closeClock: "23:00",
    revenueActual: 27_840,
    revenueForecast: 26_720,
    contributionActual: 7_920,
    contributionPlan: 8_060,
    verifiedEuro: 590,
    beats: [
      {
        at: "17:00",
        label: "Service opens",
        detail: "Forecast close €26.7k · kitchen ready",
        kind: "ops",
        minuteFromOpen: 0,
        knownAtTime: ["Expected close €26.7k", "Staffing gap flagged for 19:00"],
      },
      {
        at: "19:12",
        label: "Delivery surge",
        detail: "+21% channel volume vs expected",
        kind: "demand",
        minuteFromOpen: 132,
        knownAtTime: [
          "Delivery +21%",
          "Kitchen 78%",
          "Forecast still within band",
        ],
      },
      {
        at: "19:18",
        label: `${displayDecisionId(DECISION_IDS.peak)} forms`,
        detail: "Wait 12 minutes · Futures available",
        kind: "decision",
        minuteFromOpen: 138,
        knownAtTime: [
          "38 inbound covers",
          "Delivery +31%",
          "Kitchen climbing to 92%",
          "Futures: Wait 12 / Seat now / Throttle",
        ],
      },
      {
        at: "19:30",
        label: "Action: wait 12",
        detail: "Operator chose hold · €620 expected",
        kind: "ops",
        minuteFromOpen: 150,
        knownAtTime: ["Hold applied", "Seat release deferred 12m"],
      },
      {
        at: "20:10",
        label: "Peak pressure",
        detail: "Kitchen 94% · rain begins · terrace indoors",
        kind: "pressure",
        minuteFromOpen: 190,
        knownAtTime: ["Kitchen 94%", "Rain nowcast", "Hold holding"],
      },
      {
        at: "20:36",
        label: "Service recovered",
        detail: "Kitchen 86% · second turns protected",
        kind: "ops",
        minuteFromOpen: 216,
        knownAtTime: ["Kitchen 86%", "Turns intact"],
      },
      {
        at: "23:00",
        label: "€590 verified",
        detail: "Outcome sealed · Memory updated",
        kind: "release",
        minuteFromOpen: 360,
        knownAtTime: [
          "Revenue +4.2% vs forecast",
          "Contribution −1.8% vs plan",
          "€590 Verified Value",
        ],
      },
    ],
    outcome:
      "Revenue beat forecast (+4.2%). Contribution −1.8% vs plan. Hold protected second turns; €590 verified. Memory: Friday Peak Capacity forecast error 14.2% → 6.8%.",
  };
}

export function calendarCellsForLocation(
  locationId: string,
  metric: CalendarMetricId,
): DayPerformanceCell[] {
  if (
    locationId === DEMO_LOCATIONS.berlin.id ||
    locationId === "loc_ber" ||
    locationId === "all"
  ) {
    return berlinCalendarMonth(metric);
  }
  // Other locations: lighter stub using same pattern scaled
  return berlinCalendarMonth(metric).map((c) => ({
    ...c,
    value: c.value * 0.6,
    formatted:
      c.metricId === "verified_value" || c.metricId === "decision_count"
        ? c.formatted
        : formatDelta(c.value * 0.6),
  }));
}
