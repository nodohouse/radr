/**
 * Canonical revenue pacing — day / MTD / month-end.
 * Deterministic demo fixtures. No LLM-invented euros.
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { CONNECTED_PILOT_MTD } from "@/lib/radr/product/demoOperatingPulse";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import type { HospitalityVertical } from "@/lib/radr/product/experienceComposer";

export type PaceStatus = "AHEAD" | "ON_PACE" | "BEHIND";

export type DayPace = {
  vertical: HospitalityVertical;
  locationLabel: string;
  clockLabel: string;
  revenueActualNow: number;
  revenueForecastAtNow: number;
  revenueForecastClose: number;
  revenueBudgetDay: number;
  revenueComparableService: number;
  deltaPctVsExpected: number;
  status: PaceStatus;
  statusLabel: string;
  drivers: { label: string; value: string; tone: "pos" | "neg" | "neu" }[];
  offsets: { label: string; value: string; tone: "pos" | "neg" | "neu" }[];
  radrRead: string;
};

export type MtdPace = {
  revenueMTD: number;
  revenueBudgetMTD: number;
  revenueForecastMonthEnd: number;
  revenueMonthlyPlan: number;
  revenuePriorMTD: number;
  revenueDeltaPctVsPlan: number;
  monthEndDeltaPctVsPlan: number;
  contributionMTD: number;
  contributionVsPlan: number;
  contributionFormatted: string;
  contributionDeltaFormatted: string;
  status: PaceStatus;
  radrRead: string;
};

export type GroupDayPace = {
  revenueActual: number;
  revenueExpectedNow: number;
  revenueForecastClose: number;
  revenueBudget: number;
  deltaPct: number;
  status: PaceStatus;
  locations: {
    label: string;
    revenueDeltaPct: number;
    contributionDeltaPp: number | null;
    note: string;
  }[];
  radrRead: string;
};

export type HotelDayPace = DayPace & {
  occupancyPct: number;
  adr: number;
  revpar: number;
  arrivals: number;
  roomsReady: number;
  roomsAtRisk: number;
};

export type ApartmentDayPace = DayPace & {
  occupancyPct: number;
  adr: number;
  revpar: number;
  turnovers: number;
  cleaningBehind: number;
  gapNights: number;
};

function statusFromPct(pct: number): PaceStatus {
  if (pct >= 1.5) return "AHEAD";
  if (pct <= -1.5) return "BEHIND";
  return "ON_PACE";
}

function statusLabel(s: PaceStatus): string {
  if (s === "AHEAD") return "Ahead of pace";
  if (s === "BEHIND") return "Behind pace";
  return "On pace";
}

/** Berlin restaurant LIVE day pacing from live service fixture. */
export function getRestaurantDayPace(): DayPace {
  const live = getLiveServicePerformance();
  const pct = live.revenueDeltaPct;
  const status = statusFromPct(pct);
  return {
    vertical: "restaurant",
    locationLabel: live.locationLabel,
    clockLabel: live.clockLabel || "19:48",
    revenueActualNow: live.revenue || 18_420,
    revenueForecastAtNow: live.forecastAtNow || 17_850,
    revenueForecastClose: live.expectedClose || 26_800,
    revenueBudgetDay: 26_100,
    revenueComparableService: 25_400,
    deltaPctVsExpected: pct || 3.2,
    status,
    statusLabel: statusLabel(status),
    drivers: [
      { label: "Walk-ins", value: "+14", tone: "pos" },
      { label: "Average spend", value: "+$4", tone: "pos" },
    ],
    offsets: [
      { label: "Delivery contribution", value: "−$180", tone: "neg" },
    ],
    radrRead:
      status === "AHEAD"
        ? "Walk-ins and spend are offsetting higher delivery fees."
        : "Tracking within the normal band.",
  };
}

/** Connected-pilot MTD + month-end forecast. */
export function getGroupMtdPace(): MtdPace {
  const f = CONNECTED_PILOT_MTD;
  const revDelta = Math.round(
    ((f.revenue.actual - f.revenue.forecast) / f.revenue.forecast) * 1000,
  ) / 10;
  const monthEndForecast = 492_800;
  const monthlyPlan = 486_000;
  const meDelta =
    Math.round(((monthEndForecast - monthlyPlan) / monthlyPlan) * 1000) / 10;
  const contribDelta = f.contribution.actual - f.contribution.plan;
  return {
    revenueMTD: f.revenue.actual,
    revenueBudgetMTD: f.revenue.forecast,
    revenueForecastMonthEnd: monthEndForecast,
    revenueMonthlyPlan: monthlyPlan,
    revenuePriorMTD: f.revenue.priorComparable,
    revenueDeltaPctVsPlan: revDelta,
    monthEndDeltaPctVsPlan: meDelta,
    contributionMTD: f.contribution.actual,
    contributionVsPlan: contribDelta,
    contributionFormatted: formatDecisionMoney(f.contribution.actual),
    contributionDeltaFormatted: `${contribDelta < 0 ? "−" : "+"}${formatDecisionMoney(Math.abs(contribDelta))}`,
    status: statusFromPct(revDelta),
    radrRead:
      "Revenue is ahead. Contribution is behind — COGS and channel mix explain most of the gap.",
  };
}

/** CFO group LIVE day pacing — vertical-scoped. Never mix restaurant with Canal/Chiado. */
export function getGroupDayPace(
  vertical: "restaurant" | "hotel" = "restaurant",
): GroupDayPace {
  if (vertical === "hotel") {
    return {
      revenueActual: 48_200,
      revenueExpectedNow: 50_100,
      revenueForecastClose: 72_400,
      revenueBudget: 74_800,
      deltaPct: -3.8,
      status: "BEHIND",
      locations: [
        {
          label: "Mercer House · New York",
          revenueDeltaPct: -4.1,
          contributionDeltaPp: 0.6,
          note: "ADR +2.2% · rooms soft vs expected-now",
        },
        {
          label: "Harbour",
          revenueDeltaPct: -2.4,
          contributionDeltaPp: -0.3,
          note: "Pickup soft midweek",
        },
        {
          label: "Schiphol Gate",
          revenueDeltaPct: 1.1,
          contributionDeltaPp: 0.4,
          note: "Within expectations",
        },
      ],
      radrRead:
        "Group rooms revenue behind expected-now. Readiness risk concentrates at Canal House.",
    };
  }
  return {
    revenueActual: 62_400,
    revenueExpectedNow: 60_800,
    revenueForecastClose: 91_200,
    revenueBudget: 89_600,
    deltaPct: 2.6,
    status: "AHEAD",
    locations: [
      {
        label: "Soho · New York",
        revenueDeltaPct: 3.2,
        contributionDeltaPp: -1.8,
        note: "Exposure $788 · COGS / delivery mix",
      },
      {
        label: "Roma Norte · Mexico City",
        revenueDeltaPct: 1.8,
        contributionDeltaPp: -0.4,
        note: "Covers ahead · mix quiet",
      },
      {
        label: "Jardins · São Paulo",
        revenueDeltaPct: 0.6,
        contributionDeltaPp: -2.1,
        note: "Tuna cost pressure · watching",
      },
    ],
    radrRead:
      "Group revenue ahead of expected-now. Contribution pressure remains Soho-led.",
  };
}

export function formatPaceMoney(n: number): string {
  return formatDecisionMoney(n);
}

/** Canal House boutique hotel — rooms revenue pace. */
export function getHotelDayPace(): HotelDayPace {
  return {
    vertical: "hotel",
    locationLabel: "Mercer House · New York",
    clockLabel: HOTEL_LIVE_SCENARIO.clockLabel,
    revenueActualNow: 18_640,
    revenueForecastAtNow: 19_420,
    revenueForecastClose: 28_900,
    revenueBudgetDay: 29_800,
    revenueComparableService: 27_400,
    deltaPctVsExpected: -4.1,
    status: "BEHIND",
    statusLabel: "Behind pace",
    drivers: [
      { label: "Direct share", value: "+6pp", tone: "pos" },
      { label: "ADR", value: "+$6", tone: "pos" },
    ],
    offsets: [
      { label: "Occupancy vs pace", value: "−3pp", tone: "neg" },
      { label: "OTA dilution", value: "−$420", tone: "neg" },
    ],
    radrRead:
      "Rooms revenue soft vs expected-now. Margin holds on mix — readiness risk is the guest Decision.",
    occupancyPct: 89,
    adr: 248,
    revpar: 221,
    arrivals: HOTEL_LIVE_SCENARIO.arrivalsToday,
    roomsReady: HOTEL_LIVE_SCENARIO.roomsReady,
    roomsAtRisk: HOTEL_LIVE_SCENARIO.roomsAtRisk,
  };
}

/** Chiado serviced apartments — revenue + turnover pace. */
export function getApartmentDayPace(): ApartmentDayPace {
  return {
    vertical: "apartment",
    locationLabel: "Chiado Collective",
    clockLabel: "11:40",
    revenueActualNow: 6_820,
    revenueForecastAtNow: 6_740,
    revenueForecastClose: 9_480,
    revenueBudgetDay: 9_900,
    revenueComparableService: 9_200,
    deltaPctVsExpected: 1.2,
    status: "ON_PACE",
    statusLabel: "On pace",
    drivers: [
      { label: "Same-day bookings", value: "+3", tone: "pos" },
    ],
    offsets: [
      { label: "Gap nights", value: "3 · $118 gate", tone: "neg" },
      { label: "Cleaning behind SLA", value: "2 units", tone: "neg" },
    ],
    radrRead:
      "Revenue within range. Turnovers and gap nights are the operating Decision — not pricing.",
    occupancyPct: 78,
    adr: 164,
    revpar: 128,
    turnovers: 11,
    cleaningBehind: 2,
    gapNights: 3,
  };
}

export function getDayPaceForVertical(
  vertical: HospitalityVertical,
): DayPace | HotelDayPace | ApartmentDayPace {
  if (vertical === "hotel") return getHotelDayPace();
  if (vertical === "apartment") return getApartmentDayPace();
  return getRestaurantDayPace();
}

