/**
 * Canonical Northstar demo scenarios.
 * Website (group estate) and app (active vertical org) MUST not pretend to be the same snapshot.
 *
 * Product /app always uses the active vertical org (Restaurants 8/8 or Hotels),
 * never the legacy Berlin+Canal+Chiado mixed pilot economics.
 */

import { DEMO_ORG } from "@/lib/radr/product/demoOrg";
import { GROUP_METRICS } from "@/lib/marketing/northstarGroup";
import { CONNECTED_PILOT_MTD } from "@/lib/radr/product/demoOperatingPulse";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { selectNeedsJudgmentCount } from "@/lib/radr/product/selectNeedsJudgment";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type DemoScenarioId =
  | "northstar_group_estate"
  | "northstar_restaurants_app"
  | "northstar_hotels_app"
  /** @deprecated alias — maps to restaurants app */
  | "northstar_recovery_pilot";

export type DemoScenario = {
  id: DemoScenarioId;
  label: string;
  shortLabel: string;
  orgName: string;
  groupLocations: number;
  connectedLocations: number;
  locationsReporting: number;
  scope: "group_estate" | "connected_pilot" | "vertical_org";
  period: "mtd";
  snapshotTimestamp: string;
  disclosure: string;
  economics: {
    verifiedEuro: number;
    verifiedFormatted: string;
    exposureEuro: number;
    exposureFormatted: string;
    needsAttentionCount: number;
  };
};

/** Marketing homepage Control Center mock — full 12-location estate. */
export const NORTHSTAR_GROUP_ESTATE: DemoScenario = {
  id: "northstar_group_estate",
  label: "Northstar · Group estate",
  shortLabel: "Group estate",
  orgName: DEMO_ORG.name,
  groupLocations: DEMO_ORG.totalLocations,
  connectedLocations: DEMO_ORG.totalLocations,
  locationsReporting: GROUP_METRICS.locationsReporting,
  scope: "group_estate",
  period: "mtd",
  snapshotTimestamp: "2026-09-17T09:12:00+02:00",
  disclosure: "DEMO · Group estate · illustrative · not customer results",
  economics: {
    verifiedEuro: GROUP_METRICS.verifiedThisMonth,
    verifiedFormatted: formatDecisionMoney(GROUP_METRICS.verifiedThisMonth),
    exposureEuro: GROUP_METRICS.valueAtRisk,
    exposureFormatted: formatDecisionMoney(GROUP_METRICS.valueAtRisk),
    needsAttentionCount: GROUP_METRICS.needsAttention,
  },
};

function restaurantAppScenario(): DemoScenario {
  const agg = deriveValueAggregate("gm", "restaurant");
  return {
    id: "northstar_restaurants_app",
    label: "Northstar Restaurants · App",
    shortLabel: "Restaurants",
    orgName: NORTHSTAR_RESTAURANTS.name,
    groupLocations: NORTHSTAR_RESTAURANTS.totalLocations,
    connectedLocations: NORTHSTAR_RESTAURANTS.connectedLocations,
    locationsReporting: NORTHSTAR_RESTAURANTS.connectedLocations,
    scope: "vertical_org",
    period: "mtd",
    snapshotTimestamp: NORTHSTAR_RESTAURANTS.snapshotTimestamp,
    disclosure:
      "Demo · Northstar Restaurants · 10 connected locations · illustrative",
    economics: {
      verifiedEuro: agg.verifiedTotal,
      verifiedFormatted: formatDecisionMoney(agg.verifiedTotal),
      exposureEuro: agg.activeExposureOrOpportunity,
      exposureFormatted: formatDecisionMoney(agg.activeExposureOrOpportunity),
      needsAttentionCount: selectNeedsJudgmentCount({
        role: "gm",
        vertical: "restaurant",
      }),
    },
  };
}

function hotelAppScenario(): DemoScenario {
  const agg = deriveValueAggregate("gm", "hotel");
  return {
    id: "northstar_hotels_app",
    label: "Northstar Hotels · App",
    shortLabel: "Hotels",
    orgName: NORTHSTAR_HOTELS.name,
    groupLocations: NORTHSTAR_HOTELS.totalLocations,
    connectedLocations: NORTHSTAR_HOTELS.connectedLocations,
    locationsReporting: NORTHSTAR_HOTELS.connectedLocations,
    scope: "vertical_org",
    period: "mtd",
    snapshotTimestamp: NORTHSTAR_HOTELS.snapshotTimestamp,
    disclosure: "Demo · Northstar Hotels · connected properties · illustrative",
    economics: {
      verifiedEuro: agg.verifiedTotal,
      verifiedFormatted: formatDecisionMoney(agg.verifiedTotal),
      exposureEuro: agg.activeExposureOrOpportunity,
      exposureFormatted: formatDecisionMoney(agg.activeExposureOrOpportunity),
      needsAttentionCount: Math.max(1, Math.min(3, Math.round(agg.activeExposureOrOpportunity / 400))),
    },
  };
}

/** @deprecated Use productDemoScenario("restaurant") — kept for import stability. */
export const NORTHSTAR_RECOVERY_PILOT: DemoScenario = restaurantAppScenario();

export const DEMO_SCENARIOS = {
  northstar_group_estate: NORTHSTAR_GROUP_ESTATE,
  northstar_restaurants_app: restaurantAppScenario(),
  northstar_hotels_app: hotelAppScenario(),
  northstar_recovery_pilot: restaurantAppScenario(),
} as const;

export function getDemoScenario(id: DemoScenarioId): DemoScenario {
  if (id === "northstar_recovery_pilot") return restaurantAppScenario();
  if (id === "northstar_restaurants_app") return restaurantAppScenario();
  if (id === "northstar_hotels_app") return hotelAppScenario();
  return NORTHSTAR_GROUP_ESTATE;
}

/** Product surfaces always use the active vertical org — never mixed Canal/Chiado. */
export function productDemoScenario(
  vertical: DemoVerticalFamily = "restaurant",
): DemoScenario {
  return vertical === "hotel" ? hotelAppScenario() : restaurantAppScenario();
}

/** Marketing Control Center mock uses the group estate. */
export function marketingDemoScenario(): DemoScenario {
  return NORTHSTAR_GROUP_ESTATE;
}

/**
 * Assert restaurant app economics stay aligned with Control Center /
 * CONNECTED_PILOT_MTD contribution bridge + value aggregate.
 */
export function assertPilotEconomicsAligned(): boolean {
  const pilot = CONNECTED_PILOT_MTD;
  const scenario = restaurantAppScenario();
  const contrib = pilot.contribution;
  const cc = composeControlCenterBrief({
    role: "gm",
    vertical: "restaurant",
    period: "mtd",
  });
  return (
    contrib.actual === 89_420 &&
    scenario.connectedLocations === 10 &&
    scenario.economics.verifiedEuro === 3793 &&
    scenario.economics.verifiedEuro === cc.economics.verifiedTotal &&
    scenario.economics.exposureEuro === cc.economics.activeExposureOrOpportunity &&
    scenario.economics.needsAttentionCount === cc.needsYouCount &&
    cc.needsYouCount >= 3 &&
    !/Canal|Chiado/i.test(scenario.orgName)
  );
}

/** Control Center ↔ Live Focus scope invariant. */
export function assertSameProductScope(
  vertical: DemoVerticalFamily = "restaurant",
): {
  ok: boolean;
  scenario: DemoScenario;
  forbiddenLabels: string[];
} {
  const scenario = productDemoScenario(vertical);
  const blob = `${scenario.orgName} ${scenario.disclosure} ${scenario.label}`;
  const forbidden =
    vertical === "restaurant"
      ? ["Mercer House", "Chiado", "6103"]
      : ["Soho · New York dinner", "Tuna Tataki"];
  const hits = forbidden.filter((f) => blob.includes(f));
  return { ok: hits.length === 0 && scenario.economics.verifiedEuro !== 6103, scenario, forbiddenLabels: hits };
}
