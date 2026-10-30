/**
 * Connected-pilot MTD operating fixture — DEMO.
 * Location pulses cover the full active org (restaurants OR hotels),
 * never a mixed Berlin+Canal+Chiado pilot.
 */

import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import { outlierFor } from "@/lib/radr/demo/demoOutliers";

export type PilotLocationPulse = {
  locationId: string;
  label: string;
  revenueActual: number;
  revenuePlan: number;
  contributionActual: number;
  contributionPlan: number;
  activeExposure: number;
  needsYouCount: number;
  verifiedValue: number;
  dataHealth: "ok" | "warn" | "bad";
};

/**
 * Northstar Restaurants connected pilot · MTD rollup (Berlin-weighted).
 * Bridge identity: plan + Σ drivers = actual contribution.
 */
export const CONNECTED_PILOT_MTD = {
  scope: "connected_pilot" as const,
  period: "mtd" as const,
  currency: "EUR" as const,
  revenue: {
    actual: 312_480,
    forecast: 303_180,
    priorComparable: 296_100,
  },
  contribution: {
    actual: 89_420,
    plan: 94_200,
  },
  laborPct: {
    actual: 30.4,
    target: 29.6,
  },
  foodCostPct: {
    actual: 27.9,
    plan: 26.8,
  },
  covers: {
    actual: 3_842,
    forecast: 3_760,
  },
  avgSpend: {
    actual: 81.35,
    priorComparable: 79.8,
  },
  bridge: {
    plan: 94_200,
    drivers: [
      {
        id: "sales_volume",
        label: "Sales volume",
        amount: 6_800,
        method: "modeled" as const,
        evidence: ["pos.net_sales_vs_plan_covers"],
        relatedDecisionIds: [] as string[],
      },
      {
        id: "menu_mix",
        label: "Menu mix",
        amount: -1_800,
        method: "modeled" as const,
        evidence: ["menu.contribution_mix"],
        relatedDecisionIds: ["dec_margin_coke_berlin"],
      },
      {
        id: "labor",
        label: "Labor",
        amount: -3_200,
        method: "deterministic" as const,
        evidence: ["labor.actual_vs_plan"],
        relatedDecisionIds: [] as string[],
      },
      {
        id: "cogs",
        label: "COGS",
        amount: -4_120,
        method: "modeled" as const,
        evidence: ["supplier.invoice_variance", "recipe.cost"],
        relatedDecisionIds: ["dec_supplier_berlin"],
      },
      {
        id: "channel_fees",
        label: "Channel fees",
        amount: -2_460,
        method: "deterministic" as const,
        evidence: ["delivery.commission"],
        relatedDecisionIds: [] as string[],
      },
    ],
    actual: 89_420,
  },
} as const;

type PulseSeed = Omit<
  PilotLocationPulse,
  "activeExposure" | "needsYouCount" | "verifiedValue"
>;

/** Flagship restaurant economics — Berlin carries peak Decisions. */
const RESTAURANT_FLAGSHIP: PulseSeed = (() => {
  const out = outlierFor("loc_berlin_mitte");
  const revPlan = 142_000;
  const contribPlan = 44_500;
  return {
    locationId: "loc_berlin_mitte",
    label: "Soho · New York",
    revenueActual: Math.round(
      revPlan * (1 + (out?.revenueVsPlanPct ?? 4.2) / 100),
    ),
    revenuePlan: revPlan,
    contributionActual: Math.round(
      contribPlan * (1 + (out?.contributionVsPlanPct ?? -3.1) / 100),
    ),
    contributionPlan: contribPlan,
    dataHealth: "warn" as const,
  };
})();

/** Deterministic economics from DemoOutlierScenario when present. */
function restaurantPulseSeed(
  id: string,
  name: string,
  i: number,
): PulseSeed {
  if (id === RESTAURANT_FLAGSHIP.locationId) return RESTAURANT_FLAGSHIP;
  const out = outlierFor(id);
  if (out) {
    const revPlan =
      id === "loc_hamburg_hafen"
        ? 52_000
        : id === "loc_frankfurt_westend"
          ? 48_500
          : id === "loc_dusseldorf_medienhafen"
            ? 46_000
            : 38_000 + (i % 5) * 3_800;
    const revAct = Math.round(revPlan * (1 + out.revenueVsPlanPct / 100));
    const contribPlan = Math.round(revPlan * 0.28);
    const contribAct = Math.round(
      contribPlan * (1 + out.contributionVsPlanPct / 100),
    );
    return {
      locationId: id,
      label: name,
      revenueActual: revAct,
      revenuePlan: revPlan,
      contributionActual: contribAct,
      contributionPlan: contribPlan,
      dataHealth: out.polarity === "negative" ? "warn" : "ok",
    };
  }
  const revPlan = 38_000 + (i % 5) * 4_200;
  const revAct = Math.round(revPlan * (0.94 + ((i * 3) % 9) * 0.01));
  const contribPlan = Math.round(revPlan * 0.28);
  const contribAct = Math.round(contribPlan * (0.9 + ((i * 2) % 7) * 0.02));
  return {
    locationId: id,
    label: name,
    revenueActual: revAct,
    revenuePlan: revPlan,
    contributionActual: contribAct,
    contributionPlan: contribPlan,
    dataHealth: i % 4 === 0 ? "warn" : "ok",
  };
}

const HOTEL_FLAGSHIP: PulseSeed = {
  locationId: "loc_canal_house",
  label: "Mercer House · New York",
  revenueActual: 112_640,
  revenuePlan: 110_200,
  contributionActual: 34_920,
  contributionPlan: 35_400,
  dataHealth: "ok",
};

function hotelPulseSeed(id: string, name: string, i: number): PulseSeed {
  if (id === HOTEL_FLAGSHIP.locationId) return HOTEL_FLAGSHIP;
  const revPlan = 72_000 + (i % 6) * 8_500;
  const revAct = Math.round(revPlan * (0.96 + ((i * 2) % 5) * 0.012));
  const contribPlan = Math.round(revPlan * 0.31);
  const contribAct = Math.round(contribPlan * (0.92 + ((i * 3) % 6) * 0.015));
  return {
    locationId: id,
    label: name,
    revenueActual: revAct,
    revenuePlan: revPlan,
    contributionActual: contribAct,
    contributionPlan: contribPlan,
    dataHealth: i % 5 === 0 ? "warn" : "ok",
  };
}

/** Full restaurant org pulse base — no hotel / Chiado. */
export const RESTAURANT_LOCATION_PULSE_BASE: PulseSeed[] =
  NORTHSTAR_RESTAURANTS.locations.map((l, i) =>
    restaurantPulseSeed(l.id, l.displayName, i),
  );

/** Full hotel org pulse base — no restaurants. */
export const HOTEL_LOCATION_PULSE_BASE: PulseSeed[] =
  NORTHSTAR_HOTELS.locations.map((l, i) =>
    hotelPulseSeed(l.id, l.displayName, i),
  );

/**
 * @deprecated Prefer vertical-specific bases.
 * Mixed pilot kept only for legacy tests that still import it.
 */
export const LOCATION_PULSE_BASE: PulseSeed[] = [
  ...RESTAURANT_LOCATION_PULSE_BASE.slice(0, 1),
  HOTEL_FLAGSHIP,
];

export function locationPulseBaseForVertical(
  vertical: "restaurant" | "hotel",
): PulseSeed[] {
  return vertical === "hotel"
    ? HOTEL_LOCATION_PULSE_BASE
    : RESTAURANT_LOCATION_PULSE_BASE;
}

export function assertContributionBridgeIdentity(): boolean {
  const { plan, drivers, actual } = CONNECTED_PILOT_MTD.bridge;
  const sum = drivers.reduce((s, d) => s + d.amount, plan as number);
  return Math.abs(sum - actual) < 0.01;
}
