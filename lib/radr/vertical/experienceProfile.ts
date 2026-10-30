/**
 * VerticalExperienceProfile — one decision architecture, two operating worlds.
 *
 * DO NOT scatter `if (restaurant)` / `if (hotel)` through UI components.
 * Compose Control Center / Live / Pulse / Intelligence from this profile.
 *
 * SSOT companion: docs/VERTICAL_EXPERIENCE_PROFILE.md
 */

export type DemoVerticalFamily = "restaurant" | "hotel";

export type LiveHeroType =
  | "service_trajectory"
  | "room_readiness_arrival";

export type OperatingFlowType =
  | "reservation_service"
  | "departure_housekeeping_arrival";

export type VerticalExperienceProfile = {
  id: DemoVerticalFamily;
  label: string;
  /** Org this profile owns in demo. */
  demoOrgId: string;
  primaryDemandUnit: string;
  primaryCapacityUnit: string;
  primaryEconomicMetric: string;
  liveHeroType: LiveHeroType;
  operatingFlowType: OperatingFlowType;
  /** 24h hotel phases OR meal-service restaurant phases. */
  operatingPhases: readonly string[];
  pulseMetrics: readonly string[];
  intelligencePriorities: readonly string[];
  decisionTypes: readonly string[];
  resourceTypes: readonly string[];
  roleProfiles: readonly string[];
  /** Forbidden lexicon in primary UI (language QA). */
  forbiddenTerms: readonly string[];
  visualizationRegistry: {
    hero: string;
    flow: string;
    timeline: string;
    pulse: string;
    portfolio: string;
  };
};

export const RESTAURANT_EXPERIENCE: VerticalExperienceProfile = {
  id: "restaurant",
  label: "Restaurant group",
  demoOrgId: "org_northstar_restaurants",
  primaryDemandUnit: "covers",
  primaryCapacityUnit: "kitchen_station_minutes",
  primaryEconomicMetric: "contribution",
  liveHeroType: "service_trajectory",
  operatingFlowType: "reservation_service",
  operatingPhases: [
    "PRE_SHIFT",
    "OPENING",
    "LUNCH",
    "AFTERNOON",
    "DINNER",
    "PEAK",
    "CLOSE",
    "POST_SHIFT",
  ],
  pulseMetrics: [
    "revenue",
    "contribution",
    "verified_value",
    "labor_pct",
    "covers",
    "kitchen_load",
  ],
  intelligencePriorities: [
    "reservations",
    "menu",
    "kitchen",
    "labor",
    "delivery",
    "inventory",
    "procurement",
    "guest",
    "contribution",
  ],
  decisionTypes: [
    "peak_capacity",
    "menu_economics",
    "supplier_variance",
    "labor_staffing",
    "delivery_throttle",
    "inventory_hold",
  ],
  resourceTypes: ["tables", "kitchen_stations", "staff", "inventory"],
  roleProfiles: ["gm", "cfo", "chef", "revenue_manager", "ops"],
  forbiddenTerms: ["ADR", "RevPAR", "room nights", "housekeeping", "check-in"],
  visualizationRegistry: {
    hero: "contribution_bridge",
    flow: "service_floor",
    timeline: "service_clock",
    pulse: "restaurant_pulse",
    portfolio: "location_exposure_matrix",
  },
};

export const HOTEL_EXPERIENCE: VerticalExperienceProfile = {
  id: "hotel",
  label: "Hotel group",
  demoOrgId: "org_northstar_hotels",
  primaryDemandUnit: "room_nights",
  primaryCapacityUnit: "rooms",
  primaryEconomicMetric: "net_room_contribution",
  liveHeroType: "room_readiness_arrival",
  operatingFlowType: "departure_housekeeping_arrival",
  operatingPhases: [
    "NIGHT",
    "DEPARTURE_WAVE",
    "HOUSEKEEPING",
    "ARRIVAL_PREP",
    "CHECK_IN_WAVE",
    "EVENING",
    "OVERNIGHT",
  ],
  pulseMetrics: [
    "occupancy",
    "adr",
    "revpar",
    "room_readiness",
    "direct_share",
    "hk_productivity",
  ],
  intelligencePriorities: [
    "pickup",
    "occupancy",
    "adr",
    "revpar",
    "room_readiness",
    "housekeeping",
    "distribution",
    "channel_economics",
    "cancellation",
    "upsell",
    "maintenance",
    "group_business",
  ],
  decisionTypes: [
    "room_readiness",
    "channel_allocation",
    "rate_demand",
    "cancellation_recovery",
    "overbooking",
    "upsell_ancillary",
    "housekeeping_staffing",
    "group_displacement",
    "maintenance_ooo",
    "fb_breakfast_capacity",
  ],
  resourceTypes: [
    "rooms",
    "room_types",
    "housekeeping",
    "front_desk",
    "channel_inventory",
  ],
  roleProfiles: [
    "hotel_gm",
    "cfo",
    "revenue_manager",
    "ops",
    "housekeeping_lead",
  ],
  forbiddenTerms: [
    "covers",
    "tables",
    "kitchen →",
    "dish",
    "service period",
    "delivery +",
  ],
  visualizationRegistry: {
    hero: "readiness_arrival_gap",
    flow: "departure_hk_ready_arrival",
    timeline: "hotel_24h",
    pulse: "hotel_pulse",
    portfolio: "net_revpar_exposure_matrix",
  },
};

const BY_ID: Record<DemoVerticalFamily, VerticalExperienceProfile> = {
  restaurant: RESTAURANT_EXPERIENCE,
  hotel: HOTEL_EXPERIENCE,
};

export function verticalExperienceFor(
  id: DemoVerticalFamily,
): VerticalExperienceProfile {
  return BY_ID[id];
}

export function isDemoVerticalFamily(v: string): v is DemoVerticalFamily {
  return v === "restaurant" || v === "hotel";
}
