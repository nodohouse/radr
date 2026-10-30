/**
 * getRecommendedIntelligenceModules — role × vertical × scope composition.
 * Do not hardcode module order in JSX.
 */

import type { RoleView } from "@/lib/product/types";
import {
  getIntelligenceModule,
  suggestedModulesForRole,
  type IntelModuleDef,
} from "@/lib/radr/intelligence/moduleRegistry";

export type IntelligenceComposeInput = {
  role: RoleView;
  vertical?: "restaurant" | "hotel" | "apartment" | "group";
  scope?: "location" | "group" | "comparison";
  temporalState?: "pre_shift" | "live" | "post" | "mtd";
  availableEvidence?: string[];
};

const CFO_ORDER = [
  "verified_value_trend",
  "settlement_bridge",
  "cost_movers",
  "location_exposure",
  "supplier_variance",
  "channel_mix",
  "revenue_vs_forecast",
  "menu_contribution",
] as const;

const COO_ORDER = [
  "location_exposure",
  "cost_movers",
  "cancellation_intel",
  "revenue_pace_mtd",
  "supplier_variance",
  "live_service",
  "verified_value_trend",
] as const;

const GM_ORDER = [
  "live_service",
  "booking_pace",
  "kitchen_pressure",
  "menu_contribution",
  "labor_productivity",
  "top_dishes",
  "covers_vs_forecast",
] as const;

const HOTEL_GM_ORDER = [
  "room_readiness",
  "hotel_pickup",
  "hotel_occ_adr_revpar",
  "hk_productivity",
  "hotel_channel_mix",
  "hotel_cancellation",
  "revenue_pace_day",
] as const;

const HOTEL_CFO_ORDER = [
  "hotel_occ_adr_revpar",
  "verified_value_trend",
  "hotel_channel_mix",
  "hotel_pickup",
  "settlement_bridge",
  "location_exposure",
  "hotel_cancellation",
] as const;

export function getRecommendedIntelligenceModules(
  input: IntelligenceComposeInput,
): IntelModuleDef[] {
  const {
    role,
    vertical = "restaurant",
    temporalState = "mtd",
    availableEvidence,
  } = input;

  let ids: string[];

  if (vertical === "hotel") {
    if (role === "cfo" || role === "finance" || role === "owner") {
      ids = [...HOTEL_CFO_ORDER];
    } else {
      ids = [...HOTEL_GM_ORDER];
      if (temporalState === "live") {
        ids = [
          "room_readiness",
          "hk_productivity",
          ...ids.filter(
            (id) => id !== "room_readiness" && id !== "hk_productivity",
          ),
        ];
      }
    }
  } else if (role === "cfo" || role === "finance") {
    ids = [...CFO_ORDER];
  } else if (role === "coo") {
    ids = [...COO_ORDER];
  } else if (role === "gm" || role === "head_chef" || role === "fb_operator") {
    ids = [...GM_ORDER];
    if (temporalState === "live") {
      ids = [
        "live_service",
        "kitchen_pressure",
        ...ids.filter(
          (id) => id !== "live_service" && id !== "kitchen_pressure",
        ),
      ];
    }
  } else {
    ids = suggestedModulesForRole(role).map((m) => m.id);
  }

  return ids
    .map((id) => getIntelligenceModule(id))
    .filter((m): m is IntelModuleDef => {
      if (!m) return false;
      if (!availableEvidence?.length) return true;
      if (!m.requiredEvidence.length) return true;
      return m.requiredEvidence.every((e) => availableEvidence.includes(e));
    })
    .slice(0, 7);
}
