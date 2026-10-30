/**
 * Hourly metric series — open → NOW → close (or 00–24 for hotels).
 * Derived from canonical live fixtures + densified hour points.
 */

import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { getHotelDaySeries } from "@/lib/radr/product/liveFlows";
import type { HourlyMetricPoint } from "./types";
import { parseHHMM } from "./operatingHours";

function pressureLevel(p: number): HourlyMetricPoint["pressureLevel"] {
  if (p >= 90) return "critical";
  if (p >= 75) return "high";
  if (p >= 45) return "medium";
  return "low";
}

/**
 * Berlin dinner — densified hour-by-hour cumulative series.
 * Past = observed solid · Future = modeled with band.
 */
export function berlinHourlySeries(): HourlyMetricPoint[] {
  const live = getLiveServicePerformance(DEMO_LOCATIONS.berlin.id);
  const openMin = parseHHMM("17:00");

  // Editorial densified waypoints (cumulative revenue)
  const rows: Array<{
    clock: string;
    label: string;
    actual: number | null;
    expected: number;
    forecast: number;
    low: number | null;
    high: number | null;
    intervalActual: number | null;
    intervalExpected: number | null;
    covers: number | null;
    coversF: number | null;
    pressure: number;
    observed: boolean;
    isNow?: boolean;
  }> = [
    {
      clock: "17:00",
      label: "OPEN",
      actual: 0,
      expected: 0,
      forecast: 0,
      low: null,
      high: null,
      intervalActual: 0,
      intervalExpected: 0,
      covers: 0,
      coversF: 0,
      pressure: 12,
      observed: true,
    },
    {
      clock: "18:00",
      label: "18:00",
      actual: 2_140,
      expected: 2_200,
      forecast: 2_280,
      low: null,
      high: null,
      intervalActual: 2_140,
      intervalExpected: 2_200,
      covers: 28,
      coversF: 30,
      pressure: 28,
      observed: true,
    },
    {
      clock: "19:00",
      label: "19:00",
      actual: 8_640,
      expected: 8_300,
      forecast: 8_420,
      low: null,
      high: null,
      intervalActual: 6_500,
      intervalExpected: 6_100,
      covers: 98,
      coversF: 102,
      pressure: 61,
      observed: true,
    },
    {
      clock: "19:48",
      label: "NOW",
      actual: 18_420,
      expected: 17_850,
      forecast: 17_850,
      low: null,
      high: null,
      intervalActual: 9_780,
      intervalExpected: 9_550,
      covers: 124,
      coversF: 208,
      pressure: 92,
      observed: true,
      isNow: true,
    },
    {
      clock: "20:00",
      label: "20:00",
      actual: null,
      expected: 19_200,
      forecast: 19_600,
      low: 19_100,
      high: 20_100,
      intervalActual: null,
      intervalExpected: 1_750,
      covers: null,
      coversF: 228,
      pressure: 94,
      observed: false,
    },
    {
      clock: "21:00",
      label: "21:00",
      actual: null,
      expected: 22_400,
      forecast: 22_900,
      low: 22_200,
      high: 23_600,
      intervalActual: null,
      intervalExpected: 3_300,
      covers: null,
      coversF: 258,
      pressure: 78,
      observed: false,
    },
    {
      clock: "22:00",
      label: "22:00",
      actual: null,
      expected: 24_800,
      forecast: 25_200,
      low: 24_600,
      high: 25_900,
      intervalActual: null,
      intervalExpected: 2_300,
      covers: null,
      coversF: 274,
      pressure: 52,
      observed: false,
    },
    {
      clock: "23:00",
      label: "CLOSE",
      actual: null,
      expected: live.targetClose,
      forecast: live.expectedClose,
      low: live.likelyCloseLow,
      high: live.likelyCloseHigh,
      intervalActual: null,
      intervalExpected: 1_600,
      covers: null,
      coversF: live.coversForecast,
      pressure: 18,
      observed: false,
    },
  ];

  return rows.map((r, i) => ({
    id: `h_${i}`,
    label: r.label,
    clock: r.clock,
    minute: parseHHMM(r.clock) - openMin,
    observed: r.observed,
    isNow: r.isNow,
    revenueActual: r.actual,
    revenueExpected: r.expected,
    revenueForecast: r.forecast,
    revenueLow: r.low,
    revenueHigh: r.high,
    intervalActual: r.intervalActual,
    intervalExpected: r.intervalExpected,
    covers: r.covers,
    coversForecast: r.coversF,
    contribution: null,
    contributionPlan: null,
    pressure: r.pressure,
    pressureLevel: pressureLevel(r.pressure),
  }));
}

/** Hotel 24h condensed series from existing pace fixtures. */
export function hotelHourlySeries(): HourlyMetricPoint[] {
  const series = getHotelDaySeries();
  return series.map((s, i) => {
    const pressure =
      s.label.includes("14") || s.label.includes("15")
        ? 82
        : s.label.includes("10")
          ? 68
          : 35;
    return {
      id: `hotel_${i}`,
      label: s.label,
      clock: s.label === "NOW" ? "14:20" : s.label,
      minute: i * 180,
      observed: s.observed,
      isNow: s.label === "NOW",
      revenueActual: s.observed ? s.actual : null,
      revenueExpected: s.expected,
      revenueForecast: s.expected,
      revenueLow: s.observed ? null : Math.round(s.expected * 0.97),
      revenueHigh: s.observed ? null : Math.round(s.expected * 1.04),
      intervalActual: null,
      intervalExpected: null,
      covers: null,
      coversForecast: null,
      contribution: null,
      contributionPlan: null,
      pressure,
      pressureLevel: pressureLevel(pressure),
    };
  });
}

export function apartmentHourlySeries(): HourlyMetricPoint[] {
  // Condensed turnover day — revenue lighter, ops heavier
  const rows = [
    { clock: "08:00", label: "08:00", actual: 1_200, expected: 1_150, p: 22, obs: true },
    { clock: "11:00", label: "11:00", actual: 2_800, expected: 2_900, p: 48, obs: true },
    { clock: "14:00", label: "NOW", actual: 4_100, expected: 4_050, p: 76, obs: true, now: true },
    { clock: "17:00", label: "17:00", actual: null, expected: 5_400, p: 62, obs: false },
    { clock: "20:00", label: "20:00", actual: null, expected: 6_200, p: 40, obs: false },
    { clock: "24:00", label: "24:00", actual: null, expected: 6_800, p: 18, obs: false },
  ];
  return rows.map((r, i) => ({
    id: `apt_${i}`,
    label: r.label,
    clock: r.clock,
    minute: parseHHMM(r.clock === "24:00" ? "23:59" : r.clock),
    observed: r.obs,
    isNow: Boolean(r.now),
    revenueActual: r.actual,
    revenueExpected: r.expected,
    revenueForecast: r.expected,
    revenueLow: r.obs ? null : Math.round(r.expected * 0.96),
    revenueHigh: r.obs ? null : Math.round(r.expected * 1.05),
    intervalActual: null,
    intervalExpected: null,
    covers: null,
    coversForecast: null,
    contribution: null,
    contributionPlan: null,
    pressure: r.p,
    pressureLevel: pressureLevel(r.p),
  }));
}
