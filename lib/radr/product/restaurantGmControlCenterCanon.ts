/**
 * Restaurant GM Control Center — Soho · New York Live dinner canon.
 * Visual mockup is composition SSOT; this module is product/logic SSOT.
 * Hero location ID stays `loc_berlin_mitte` (deterministic fixture).
 * D-1911 = hold/pace seating — never “Add FOH” when grill is the constraint.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";

export const RESTAURANT_GM_CC_LOCATION_ID = "loc_berlin_mitte" as const;
export const RESTAURANT_GM_CC_LOCATION_LABEL = "Soho · New York" as const;

export type RestaurantGmConstraint =
  | "grill"
  | "labor"
  | "demand_soft"
  | "healthy";

export type RestaurantGmOperatingState = {
  locationId: typeof RESTAURANT_GM_CC_LOCATION_ID;
  locationLabel: typeof RESTAURANT_GM_CC_LOCATION_LABEL;
  clockLabel: string;
  servicePeriod: "Dinner";
  weather: string;
  revenueEuro: number;
  revenueDeltaPct: number;
  contributionEuro: number;
  contributionDeltaPct: number;
  covers: number;
  coversDeltaPct: number;
  avgCheckEuro: number;
  avgCheckDeltaPct: number;
  laborPct: number;
  laborDeltaPp: number;
  reservationsBooked: number;
  bookedCapacityPct: number;
  walkIns: number;
  kitchenLoadNowPct: number;
  kitchenPeakPct: number;
  constraint: RestaurantGmConstraint;
  constraintStation: string;
  constraintTime: string;
  status: "on_track" | "watch" | "risk";
};

/** Deterministic Soho · New York · Live 19:48 dinner state. */
export const BERLIN_GM_LIVE_STATE: RestaurantGmOperatingState = {
  locationId: RESTAURANT_GM_CC_LOCATION_ID,
  locationLabel: RESTAURANT_GM_CC_LOCATION_LABEL,
  clockLabel: LIVE_SCENARIO.clockLabel,
  servicePeriod: "Dinner",
  weather: "22°C · Partly cloudy",
  revenueEuro: 18_420,
  revenueDeltaPct: 12.6,
  contributionEuro: 6_870,
  contributionDeltaPct: 14.2,
  covers: 124,
  coversDeltaPct: 8.8,
  avgCheckEuro: 148,
  avgCheckDeltaPct: 3.5,
  laborPct: 26.1,
  laborDeltaPp: -2.3,
  reservationsBooked: 112,
  bookedCapacityPct: 93,
  walkIns: 12,
  kitchenLoadNowPct: 92,
  kitchenPeakPct: 97,
  constraint: "grill",
  constraintStation: "Grill",
  constraintTime: "20:10",
  status: "on_track",
};

export type RestaurantGmConclusion = {
  lead: string;
  trail: string;
  constraint: RestaurantGmConstraint;
};

/** Derive the operating conclusion from state — never invent FOH when kitchen binds. */
export function deriveRestaurantGmConclusion(
  state: RestaurantGmOperatingState = BERLIN_GM_LIVE_STATE,
): RestaurantGmConclusion {
  if (state.constraint === "grill") {
    return {
      lead: "Dinner is ahead.",
      trail: `${state.constraintStation} becomes the constraint at ${state.constraintTime}.`,
      constraint: "grill",
    };
  }
  if (state.constraint === "labor") {
    return {
      lead: "Demand is ahead.",
      trail: `Floor coverage becomes the constraint at ${state.constraintTime}.`,
      constraint: "labor",
    };
  }
  if (state.constraint === "demand_soft") {
    return {
      lead: "Demand has softened.",
      trail: "Protect contribution before adding capacity.",
      constraint: "demand_soft",
    };
  }
  return {
    lead: "Dinner is on track.",
    trail: "No material intervention required.",
    constraint: "healthy",
  };
}

export type RestaurantGmDecisionCanon = {
  id: string;
  displayId: "D-1911";
  title: string;
  action: string;
  supporting: string;
  expectedEuro: number;
  confidencePct: number;
  deadlineLabel: string;
  /** Explicitly banned recommendation for this bottleneck. */
  bannedAction: string;
};

export const D1911_CC_DECISION: RestaurantGmDecisionCanon = {
  id: DECISION_IDS.peak,
  displayId: "D-1911",
  title: "Peak capacity collision",
  action: "Hold next seating wave for 12 min",
  supporting:
    "Kitchen pressure is forecast to peak at 20:10 while inbound covers remain above plan. Pace seating briefly to protect ticket time, guest satisfaction and contribution.",
  expectedEuro: 620,
  confidencePct: 82,
  deadlineLabel: "19:59",
  bannedAction: "Add 1 FOH for the peak window",
};

export type RestaurantGmWhyNow = {
  kitchenLoadNowPct: number;
  forecastPeakPct: number;
  forecastPeakTime: string;
  inboundCoversNext22m: number;
  averageTicketMin: number;
  tableTurnPressure: string;
  expectedIfUnchanged: string;
  evidence: string[];
};

export const D1911_WHY_NOW: RestaurantGmWhyNow = {
  kitchenLoadNowPct: 92,
  forecastPeakPct: 97,
  forecastPeakTime: "20:10",
  inboundCoversNext22m: 38,
  averageTicketMin: 18,
  tableTurnPressure: "High",
  expectedIfUnchanged: "service delay +9m",
  evidence: ["POS", "Reservations", "KDS", "Delivery", "Labor"],
};

export type RestaurantGmNeedsYouItem = {
  id: string;
  decisionId: string;
  title: string;
  meta: string;
  severity: "critical" | "watch";
};

export const BERLIN_GM_NEEDS_YOU: RestaurantGmNeedsYouItem[] = [
  {
    id: "ny_peak",
    decisionId: DECISION_IDS.peak,
    title: "Peak capacity collision",
    meta: "Soho · New York · Tonight",
    severity: "critical",
  },
  {
    id: "ny_delivery_grill",
    decisionId: DECISION_IDS.peak,
    title: "Delivery mix raising grill load",
    meta: "Soho · New York · 20:00–20:30",
    severity: "watch",
  },
];

export type OperatingPulseEvent = {
  id: string;
  time: string;
  /** 0–1 along service axis 17:00–22:00 */
  t: number;
  type: "signal" | "peak" | "now" | "constraint" | "recovery";
  title: string;
  description: string;
  covers?: number;
  kitchenLoad?: number;
  severity: "pos" | "neg" | "now";
  decisionId?: string;
  exposureEuro?: number;
};

/** Canonical Operating Pulse events for Berlin Live dinner. */
export const BERLIN_GM_PULSE_EVENTS: OperatingPulseEvent[] = [
  {
    id: "walkins_1840",
    time: "18:40",
    t: 0.28,
    type: "signal",
    title: "Walk-ins increase",
    description: "+18% vs forecast",
    severity: "pos",
  },
  {
    id: "peak_1925",
    time: "19:25",
    t: 0.42,
    type: "peak",
    title: "Dinner peak",
    description: "124 covers",
    covers: 124,
    severity: "pos",
  },
  {
    id: "now_1948",
    time: "19:48",
    t: 0.493,
    type: "now",
    title: "NOW",
    description: LIVE_SCENARIO.clockLabel,
    severity: "now",
  },
  {
    id: "grill_2010",
    time: "20:10",
    t: 0.62,
    type: "constraint",
    title: "Kitchen pressure",
    description: "Grill at capacity",
    kitchenLoad: 97,
    severity: "neg",
    decisionId: DECISION_IDS.peak,
    exposureEuro: 620,
  },
  {
    id: "recovery_2035",
    time: "20:35",
    t: 0.78,
    type: "recovery",
    title: "Expected recovery",
    description: "Capacity eases",
    severity: "pos",
  },
];

/** Local money for NYC hero — demo amounts keep prior magnitude, USD symbol. */
export function formatEuro(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatSignedPct(n: number, suffix = "vs plan"): string {
  const sign = n > 0 ? "+" : "";
  return `↑ ${sign}${n.toFixed(1)}% ${suffix}`;
}

export function formatLaborDelta(pp: number): string {
  // Lower labor % vs plan is favorable when service quality holds.
  const abs = Math.abs(pp).toFixed(1);
  return pp < 0 ? `↓ −${abs} pp vs plan` : `↑ +${abs} pp vs plan`;
}

export function restaurantLocationAllowed(
  locationId: string,
  restaurantLocationIds: ReadonlySet<string>,
): boolean {
  if (locationId === "all" || locationId.startsWith("region_")) return true;
  if (locationId === "loc_canal_house" || locationId === "loc_ams_canal") {
    return false;
  }
  return restaurantLocationIds.has(locationId);
}
