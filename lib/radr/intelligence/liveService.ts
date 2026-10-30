/**
 * Live service performance — canonical fixture snapshots, no Math.random.
 * Berlin dinner editorial peak at NOW · 19:48.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DEMO_AS_OF_ISO, LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { demoServicePhaseAt } from "@/lib/radr/servicePhase";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { IntelJudgment } from "@/lib/radr/intelligence/moduleRegistry";
import { BERLIN_GM_LIVE_STATE } from "@/lib/radr/product/restaurantGmControlCenterCanon";

export type ServiceSnapshot = {
  minuteOfService: number;
  label: string;
  clock?: string;
  actualRevenue: number;
  forecastRevenue: number;
  targetRevenue: number;
  comparableRevenue: number;
  actualCovers: number;
  forecastCovers: number;
  avgSpend: number;
  kitchenPressure: number;
  kitchenPressureForecast: number;
  laborPct: number;
  deliverySharePct: number;
  observed: boolean;
  /** Cumulative orders (observed) or forecast orders. */
  orders: number;
  /** € / hour rate at this waypoint (actual if observed else forecast). */
  revenueRatePerHour: number;
};

export type LiveFeedItem = {
  id: string;
  at: string;
  text: string;
};

export type LiveFreshnessState = "LIVE" | "CURRENT" | "DELAYED" | "STALE";

export type LiveServicePerformance = {
  active: boolean;
  locationId: string;
  locationLabel: string;
  serviceType: string;
  clockLabel: string;
  freshnessSeconds: number;
  freshnessState: LiveFreshnessState;
  freshnessLabel: string;
  revenue: number;
  forecastAtNow: number;
  revenueDeltaPct: number;
  revenueForecast1h: number;
  revenueForecast2h: number;
  revenueForecast3h: number;
  expectedClose: number;
  targetClose: number;
  closeDeltaPctVsTarget: number;
  likelyCloseLow: number | null;
  likelyCloseHigh: number | null;
  covers: number;
  coversForecast: number;
  coversBookedRemaining: number;
  walkIns: number;
  waitlist: number;
  cancellations: number;
  noShows: number;
  avgSpend: number;
  avgSpendForecast: number;
  kitchenPressure: number;
  kitchenPressureAt: string | null;
  kitchenProjected: number;
  kitchenProjectedAt: string;
  interventionThreshold: number;
  ticketTimeMin: number;
  laborPct: number;
  laborTargetPct: number;
  revenuePerLaborHour: number;
  coversPerLaborHour: number;
  laborScheduled: number;
  laborActual: number;
  laborForecastNeed: number;
  overtimeExposureEuro: number;
  series: ServiceSnapshot[];
  nowIndex: number;
  feed: LiveFeedItem[];
  radrRead: string;
  radrLines: [string, string];
  judgment: IntelJudgment;
  relatedDecisionId: string | null;
  nextServiceLabel: string | null;
};

function freshnessFromSeconds(sec: number): {
  state: LiveFreshnessState;
  label: string;
} {
  if (sec < 120) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return {
      state: "LIVE",
      label: `LIVE · updated ${m}m ${String(s).padStart(2, "0")}s ago`,
    };
  }
  if (sec < 300) {
    return {
      state: "CURRENT",
      label: `CURRENT · POS ${Math.round(sec / 60)}m freshness`,
    };
  }
  if (sec < 900) {
    return {
      state: "DELAYED",
      label: `DELAYED · POS ${Math.round(sec / 60)}m freshness`,
    };
  }
  return {
    state: "STALE",
    label: `STALE · POS ${Math.round(sec / 60)}m freshness`,
  };
}

/**
 * Deterministic Berlin dinner curve.
 * NOW = 19:48 · +1H / +2H / +3H / CLOSE / TARGET from editorial canon.
 */
const SERIES: ServiceSnapshot[] = [
  {
    minuteOfService: 0,
    label: "OPEN",
    clock: "17:00",
    actualRevenue: 0,
    forecastRevenue: 0,
    targetRevenue: 0,
    comparableRevenue: 0,
    actualCovers: 0,
    forecastCovers: 0,
    avgSpend: 0,
    kitchenPressure: 12,
    kitchenPressureForecast: 12,
    laborPct: 22,
    deliverySharePct: 8,
    observed: true,
    orders: 0,
    revenueRatePerHour: 0,
  },
  {
    minuteOfService: 60,
    label: "18:00",
    clock: "18:00",
    actualRevenue: 2140,
    forecastRevenue: 2280,
    targetRevenue: 2200,
    comparableRevenue: 2050,
    actualCovers: 28,
    forecastCovers: 30,
    avgSpend: 76,
    kitchenPressure: 28,
    kitchenPressureForecast: 28,
    laborPct: 24,
    deliverySharePct: 11,
    observed: true,
    orders: 22,
    revenueRatePerHour: 2140,
  },
  {
    minuteOfService: 120,
    label: "19:00",
    clock: "19:00",
    actualRevenue: 8640,
    forecastRevenue: 8420,
    targetRevenue: 8300,
    comparableRevenue: 8100,
    actualCovers: 98,
    forecastCovers: 102,
    avgSpend: 88,
    kitchenPressure: 61,
    kitchenPressureForecast: 61,
    laborPct: 26,
    deliverySharePct: 14,
    observed: true,
    orders: 78,
    revenueRatePerHour: 6500,
  },
  {
    minuteOfService: 168,
    label: "NOW",
    clock: BERLIN_GM_LIVE_STATE.clockLabel,
    /** SSOT: BERLIN_GM_LIVE_STATE — same numbers as GM Control Center. */
    actualRevenue: BERLIN_GM_LIVE_STATE.revenueEuro,
    forecastRevenue: 17_850,
    targetRevenue: 17_600,
    comparableRevenue: 17_200,
    actualCovers: BERLIN_GM_LIVE_STATE.covers,
    forecastCovers: 286,
    avgSpend: BERLIN_GM_LIVE_STATE.avgCheckEuro,
    kitchenPressure: BERLIN_GM_LIVE_STATE.kitchenLoadNowPct,
    kitchenPressureForecast: BERLIN_GM_LIVE_STATE.kitchenLoadNowPct,
    laborPct: BERLIN_GM_LIVE_STATE.laborPct,
    deliverySharePct: 18.1,
    observed: true,
    orders: 185,
    revenueRatePerHour: 9780,
  },
  {
    minuteOfService: 228,
    label: "+1H",
    clock: "20:48",
    actualRevenue: 0,
    forecastRevenue: 21_400,
    targetRevenue: 20_900,
    comparableRevenue: 20_200,
    actualCovers: 0,
    forecastCovers: 248,
    avgSpend: 86,
    kitchenPressure: 0,
    kitchenPressureForecast: 92,
    laborPct: 29,
    deliverySharePct: 19,
    observed: false,
    orders: 220,
    revenueRatePerHour: 2980,
  },
  {
    minuteOfService: 288,
    label: "+2H",
    clock: "21:48",
    actualRevenue: 0,
    forecastRevenue: 23_900,
    targetRevenue: 23_400,
    comparableRevenue: 22_600,
    actualCovers: 0,
    forecastCovers: 268,
    avgSpend: 86,
    kitchenPressure: 0,
    kitchenPressureForecast: 78,
    laborPct: 28,
    deliverySharePct: 17,
    observed: false,
    orders: 248,
    revenueRatePerHour: 2500,
  },
  {
    minuteOfService: 348,
    label: "+3H",
    clock: "22:48",
    actualRevenue: 0,
    forecastRevenue: 25_600,
    targetRevenue: 25_100,
    comparableRevenue: 24_400,
    actualCovers: 0,
    forecastCovers: 280,
    avgSpend: 86,
    kitchenPressure: 0,
    kitchenPressureForecast: 52,
    laborPct: 27,
    deliverySharePct: 15,
    observed: false,
    orders: 270,
    revenueRatePerHour: 1700,
  },
  {
    minuteOfService: 390,
    label: "CLOSE",
    clock: "23:30",
    actualRevenue: 0,
    forecastRevenue: 26_800,
    targetRevenue: 26_100,
    comparableRevenue: 25_400,
    actualCovers: 0,
    forecastCovers: 286,
    avgSpend: 86,
    kitchenPressure: 0,
    kitchenPressureForecast: 18,
    laborPct: 27.2,
    deliverySharePct: 14,
    observed: false,
    orders: 286,
    revenueRatePerHour: 1200,
  },
];

const FEED: LiveFeedItem[] = [
  { id: "f1", at: "19:46", text: "Table 18 seated" },
  { id: "f2", at: "19:44", text: "Avg ticket +€4.10 vs forecast" },
  { id: "f3", at: "19:41", text: "Kitchen crossed 85%" },
  { id: "f4", at: "19:38", text: "12 walk-ins accepted" },
  { id: "f5", at: "19:37", text: "D-1911 formed" },
];

/** Canonical POS freshness for Berlin Live editorial (1m 42s). */
export const BERLIN_LIVE_FRESHNESS_SECONDS = 102;

/**
 * Berlin dinner LIVE when service phase is LIVE/CLOSING.
 * Peak snapshot (NOW · 19:48) is the demo editorial sample.
 */
export function getLiveServicePerformance(
  locationId = DEMO_LOCATIONS.berlin.id,
  asOfIso: string = DEMO_AS_OF_ISO,
): LiveServicePerformance {
  const phase = demoServicePhaseAt(asOfIso);
  const active =
    locationId === DEMO_LOCATIONS.berlin.id &&
    (phase.phase === "LIVE" || phase.phase === "CLOSING");

  const fresh = freshnessFromSeconds(BERLIN_LIVE_FRESHNESS_SECONDS);
  const point = (label: string) => SERIES.find((s) => s.label === label)!;
  const nowPoint = point("NOW");
  const h1 = point("+1H");
  const h2 = point("+2H");
  const h3 = point("+3H");
  const close = point("CLOSE");

  const empty: LiveServicePerformance = {
    active: false,
    locationId,
    locationLabel: "Soho · New York",
    serviceType: "Dinner",
    clockLabel: phase.asOfIso.slice(11, 16),
    freshnessSeconds: BERLIN_LIVE_FRESHNESS_SECONDS,
    freshnessState: fresh.state,
    freshnessLabel: fresh.label,
    revenue: 0,
    forecastAtNow: 0,
    revenueDeltaPct: 0,
    revenueForecast1h: h1.forecastRevenue,
    revenueForecast2h: h2.forecastRevenue,
    revenueForecast3h: h3.forecastRevenue,
    expectedClose: close.forecastRevenue,
    targetClose: close.targetRevenue,
    closeDeltaPctVsTarget: 0,
    likelyCloseLow: null,
    likelyCloseHigh: null,
    covers: 0,
    coversForecast: close.forecastCovers,
    coversBookedRemaining: 0,
    walkIns: 0,
    waitlist: 0,
    cancellations: 0,
    noShows: 0,
    avgSpend: 0,
    avgSpendForecast: 82,
    kitchenPressure: 0,
    kitchenPressureAt: null,
    kitchenProjected: 94,
    kitchenProjectedAt: "20:18",
    interventionThreshold: 94,
    ticketTimeMin: 0,
    laborPct: 0,
    laborTargetPct: 28,
    revenuePerLaborHour: 0,
    coversPerLaborHour: 0,
    laborScheduled: 0,
    laborActual: 0,
    laborForecastNeed: 0,
    overtimeExposureEuro: 0,
    series: SERIES,
    nowIndex: -1,
    feed: [],
    radrRead: "No active service right now.",
    radrLines: ["No active service.", "Next dinner · 18:00"],
    judgment: "NO_ACTION",
    relatedDecisionId: null,
    nextServiceLabel: "Next dinner · 18:00",
  };

  if (!active) return empty;

  const revenueDeltaPct =
    Math.round(
      ((nowPoint.actualRevenue - nowPoint.forecastRevenue) /
        nowPoint.forecastRevenue) *
        1000,
    ) / 10;
  const closeDelta =
    Math.round(
      ((close.forecastRevenue - close.targetRevenue) / close.targetRevenue) *
        1000,
    ) / 10;
  const avgSpend =
    locationId === DEMO_LOCATIONS.berlin.id
      ? BERLIN_GM_LIVE_STATE.avgCheckEuro
      : Math.round(
          nowPoint.actualRevenue / Math.max(nowPoint.actualCovers, 1),
        );
  const pressureMaterial = nowPoint.kitchenPressure >= 94;

  const radrLines: [string, string] = [
    `+${revenueDeltaPct.toFixed(1)}% ahead of pace · walk-ins and average spend driving upside.`,
    `Kitchen pressure approaches the intervention band at 20:18.`,
  ];

  return {
    active: true,
    locationId,
    locationLabel: "Soho · New York",
    serviceType: "Dinner service",
    clockLabel: LIVE_SCENARIO.clockLabel,
    freshnessSeconds: BERLIN_LIVE_FRESHNESS_SECONDS,
    freshnessState: fresh.state,
    freshnessLabel: fresh.label,
    revenue: nowPoint.actualRevenue,
    forecastAtNow: nowPoint.forecastRevenue,
    revenueDeltaPct,
    revenueForecast1h: h1.forecastRevenue,
    revenueForecast2h: h2.forecastRevenue,
    revenueForecast3h: h3.forecastRevenue,
    expectedClose: close.forecastRevenue,
    targetClose: close.targetRevenue,
    closeDeltaPctVsTarget: closeDelta,
    likelyCloseLow: 26_100,
    likelyCloseHigh: 27_400,
    covers: nowPoint.actualCovers,
    coversForecast: close.forecastCovers,
    coversBookedRemaining: 38,
    walkIns: BERLIN_GM_LIVE_STATE.walkIns,
    waitlist: 2,
    cancellations: 6,
    noShows: 1,
    avgSpend,
    avgSpendForecast: BERLIN_GM_LIVE_STATE.avgCheckEuro,
    kitchenPressure: nowPoint.kitchenPressure,
    kitchenPressureAt: BERLIN_GM_LIVE_STATE.clockLabel,
    kitchenProjected: BERLIN_GM_LIVE_STATE.kitchenPeakPct,
    kitchenProjectedAt: BERLIN_GM_LIVE_STATE.constraintTime,
    interventionThreshold: 94,
    ticketTimeMin: 18.4,
    laborPct: nowPoint.laborPct,
    laborTargetPct: 28.4,
    revenuePerLaborHour: 186,
    coversPerLaborHour: 2.4,
    laborScheduled: 14,
    laborActual: 14,
    laborForecastNeed: 15,
    overtimeExposureEuro: 0,
    series: SERIES,
    nowIndex: SERIES.findIndex((s) => s.label === "NOW"),
    feed: FEED,
    radrRead: pressureMaterial
      ? "Kitchen pressure material. Capacity Decision open."
      : radrLines.join(" "),
    radrLines,
    judgment: pressureMaterial ? "DECISION_FORMED" : "WATCHING",
    relatedDecisionId: DECISION_IDS.peak,
    nextServiceLabel: null,
  };
}

export function forecastAtHorizon(
  live: LiveServicePerformance,
  horizon: "60m" | "2h" | "3h" | "close",
): number {
  if (horizon === "60m") return live.revenueForecast1h;
  if (horizon === "2h") return live.revenueForecast2h;
  if (horizon === "3h") return live.revenueForecast3h;
  return live.expectedClose;
}
