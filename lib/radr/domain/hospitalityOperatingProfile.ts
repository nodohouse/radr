/**
 * HospitalityOperatingProfile — product SSOT between universal RADR
 * intelligence and venue-native UI. Marketing industry configs must not
 * drive this file.
 */

import { z } from "zod";
import {
  inventoryKindSchema,
  operatingUnitTypeSchema,
  type OperatingUnit,
  type OperatingUnitType,
} from "./operatingUnit";

export const profileSupportSchema = z.enum(["live", "demo", "stub"]);
export type ProfileSupport = z.infer<typeof profileSupportSchema>;

/** Universal operating rhythm — mapped to venue lexicon via terminology. */
export const universalPhaseSchema = z.enum([
  "PREPARE",
  "OPERATE",
  "TURNOVER",
  "RECOVER",
  "VERIFY",
  "LEARN",
]);
export type UniversalPhase = z.infer<typeof universalPhaseSchema>;

export const roleMetricPreferenceSchema = z.object({
  metric: z.string().min(1),
  priority: z.number().int().min(1).max(20),
  visibility: z.enum(["default", "optional", "hidden"]).default("default"),
});
export type RoleMetricPreference = z.infer<typeof roleMetricPreferenceSchema>;

export const hospitalityOperatingProfileSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** Beachhead / family for rollout. */
  family: z.enum([
    "food_beverage",
    "accommodation",
    "experience",
    "mixed",
  ]),
  support: profileSupportSchema,
  defaultUnitTypes: z.array(operatingUnitTypeSchema),
  inventoryKinds: z.array(inventoryKindSchema),
  revenueStreams: z.array(z.string()),
  channelFamilies: z.array(z.string()),
  integrationFamilies: z.array(z.string()),
  /** Role ids that make sense for this profile (product RoleView keys). */
  roleIds: z.array(z.string()),
  /** Default KPI keys recommended after onboarding. */
  defaultKpis: z.array(z.string()),
  roleMetricDefaults: z.record(z.string(), z.array(roleMetricPreferenceSchema)),
  timeModel: z.enum(["meal_service", "hotel_day", "stay_lifecycle", "mixed"]),
  firstInsightTemplate: z.string(),
});

export type HospitalityOperatingProfile = z.infer<
  typeof hospitalityOperatingProfileSchema
>;

export type ProfileId =
  | "restaurant_full_service"
  | "boutique_hotel"
  | "hotel"
  | "serviced_apartments"
  | "vacation_rental"
  | "spa"
  | "bar"
  | "resort_mixed";

const FNB_INTEGRATIONS = [
  "POS",
  "RESERVATIONS",
  "LABOR",
  "SUPPLIERS",
  "DELIVERY",
  "ACCOUNTING",
  "PAYMENTS",
] as const;

const HOTEL_INTEGRATIONS = [
  "PMS",
  "CRS",
  "CHANNEL_MANAGER",
  "RMS",
  "POS",
  "HOUSEKEEPING",
  "LABOR",
  "ACCOUNTING",
  "PAYMENTS",
  "CRM",
] as const;

export const RESTAURANT_FULL_SERVICE: HospitalityOperatingProfile =
  hospitalityOperatingProfileSchema.parse({
    id: "restaurant_full_service",
    label: "Full-service restaurant",
    family: "food_beverage",
    support: "live",
    defaultUnitTypes: ["RESTAURANT", "BAR"],
    inventoryKinds: ["table", "seat", "private_room", "terrace", "bar_seat"],
    revenueStreams: [
      "dine_in",
      "delivery",
      "takeaway",
      "bar",
      "private_dining",
      "events",
    ],
    channelFamilies: [
      "direct",
      "opentable",
      "resy",
      "thefork",
      "walk_in",
      "uber_eats",
      "deliveroo",
    ],
    integrationFamilies: [...FNB_INTEGRATIONS],
    roleIds: [
      "gm",
      "owner",
      "cfo",
      "coo",
      "fb_operator",
      "chef",
      "host",
      "server",
    ],
    defaultKpis: [
      "covers",
      "contribution",
      "labor_pct",
      "cancellation_exposure",
      "verified_value",
      "floor_pressure",
    ],
    roleMetricDefaults: {
      gm: [
        { metric: "covers", priority: 1, visibility: "default" },
        { metric: "contribution", priority: 2, visibility: "default" },
        { metric: "labor_pct", priority: 3, visibility: "default" },
        { metric: "cancellation_exposure", priority: 4, visibility: "default" },
        { metric: "verified_value", priority: 5, visibility: "default" },
      ],
      chef: [
        { metric: "covers", priority: 1, visibility: "default" },
        { metric: "food_cost", priority: 2, visibility: "default" },
        { metric: "stockouts", priority: 3, visibility: "default" },
        { metric: "allergies", priority: 4, visibility: "default" },
      ],
    },
    timeModel: "meal_service",
    firstInsightTemplate:
      "Dinner demand is above normal; terrace opening protects ~€348 contribution.",
  });

export const BOUTIQUE_HOTEL: HospitalityOperatingProfile =
  hospitalityOperatingProfileSchema.parse({
    id: "boutique_hotel",
    label: "Boutique hotel",
    family: "accommodation",
    support: "demo",
    defaultUnitTypes: ["ROOMS", "RESTAURANT", "BAR", "HOUSEKEEPING"],
    inventoryKinds: ["room", "room_night", "table", "seat"],
    revenueStreams: [
      "room_revenue",
      "fb",
      "breakfast",
      "bar",
      "ancillary",
      "late_checkout",
      "early_checkin",
    ],
    channelFamilies: [
      "direct",
      "booking_com",
      "expedia",
      "corporate",
      "walk_in",
      "phone",
    ],
    integrationFamilies: [...HOTEL_INTEGRATIONS],
    roleIds: [
      "gm",
      "hotel_gm",
      "owner",
      "cfo",
      "coo",
      "revenue_manager",
      "housekeeping_manager",
      "fb_operator",
    ],
    defaultKpis: [
      "in_house",
      "arrivals",
      "departures",
      "room_readiness",
      "occupancy",
      "overnight_incidents",
      "guest_moments",
      "adr",
      "revpar",
      "pickup",
      "direct_share",
      "cancellation_exposure",
    ],
    roleMetricDefaults: {
      hotel_gm: [
        { metric: "in_house", priority: 1, visibility: "default" },
        { metric: "arrivals", priority: 2, visibility: "default" },
        { metric: "room_readiness", priority: 3, visibility: "default" },
        { metric: "overnight_incidents", priority: 4, visibility: "default" },
        { metric: "guest_moments", priority: 5, visibility: "default" },
        { metric: "occupancy", priority: 6, visibility: "default" },
        { metric: "pickup", priority: 7, visibility: "default" },
        { metric: "direct_share", priority: 8, visibility: "default" },
      ],
      housekeeping_manager: [
        { metric: "room_readiness", priority: 1, visibility: "default" },
        { metric: "departures", priority: 2, visibility: "default" },
        { metric: "turnaround", priority: 3, visibility: "default" },
        { metric: "arrivals", priority: 4, visibility: "default" },
      ],
      revenue_manager: [
        { metric: "occupancy", priority: 1, visibility: "default" },
        { metric: "adr", priority: 2, visibility: "default" },
        { metric: "revpar", priority: 3, visibility: "default" },
        { metric: "pickup", priority: 4, visibility: "default" },
        { metric: "direct_share", priority: 5, visibility: "default" },
        { metric: "cancellation_exposure", priority: 6, visibility: "default" },
      ],
      cfo: [
        { metric: "revenue", priority: 1, visibility: "default" },
        { metric: "contribution", priority: 2, visibility: "default" },
        { metric: "distribution_cost", priority: 3, visibility: "default" },
        { metric: "verified_value", priority: 4, visibility: "default" },
      ],
    },
    timeModel: "hotel_day",
    firstInsightTemplate:
      "House held overnight; 12 arrivals today with 1 room projected late for check-in readiness.",
  });

function stubProfile(
  id: ProfileId,
  label: string,
  family: HospitalityOperatingProfile["family"],
  defaults: Partial<HospitalityOperatingProfile> = {},
): HospitalityOperatingProfile {
  return hospitalityOperatingProfileSchema.parse({
    id,
    label,
    family,
    support: "stub",
    defaultUnitTypes: defaults.defaultUnitTypes ?? ["OTHER"],
    inventoryKinds: defaults.inventoryKinds ?? ["other"],
    revenueStreams: defaults.revenueStreams ?? [],
    channelFamilies: defaults.channelFamilies ?? ["direct"],
    integrationFamilies: defaults.integrationFamilies ?? ["ACCOUNTING"],
    roleIds: defaults.roleIds ?? ["gm", "owner", "cfo"],
    defaultKpis: defaults.defaultKpis ?? ["revenue", "contribution"],
    roleMetricDefaults: defaults.roleMetricDefaults ?? {},
    timeModel: defaults.timeModel ?? "mixed",
    firstInsightTemplate:
      defaults.firstInsightTemplate ??
      "RADR is learning this operating model. Demo preview coming soon.",
  });
}

export const SERVICED_APARTMENTS: HospitalityOperatingProfile =
  hospitalityOperatingProfileSchema.parse({
    id: "serviced_apartments",
    label: "Serviced apartments",
    family: "accommodation",
    support: "demo",
    defaultUnitTypes: ["SERVICED_APARTMENTS", "HOUSEKEEPING"],
    inventoryKinds: ["unit", "unit_night"],
    revenueStreams: [
      "unit_revenue",
      "cleaning_fee",
      "early_checkin",
      "late_checkout",
      "ancillary",
    ],
    channelFamilies: [
      "direct",
      "airbnb",
      "booking_com",
      "expedia",
      "corporate",
    ],
    integrationFamilies: [
      "PMS",
      "CHANNEL_MANAGER",
      "ACCOUNTING",
      "LABOR",
    ],
    roleIds: [
      "gm",
      "owner",
      "cfo",
      "finance",
      "revenue_manager",
      "housekeeping_manager",
    ],
    defaultKpis: [
      "occupancy",
      "adr",
      "turnovers",
      "unit_readiness",
      "orphan_nights",
      "maintenance_blocks",
      "direct_share",
      "guest_issues",
    ],
    roleMetricDefaults: {
      gm: [
        { metric: "turnovers", priority: 1, visibility: "default" },
        { metric: "unit_readiness", priority: 2, visibility: "default" },
        { metric: "occupancy", priority: 3, visibility: "default" },
        { metric: "orphan_nights", priority: 4, visibility: "default" },
        { metric: "maintenance_blocks", priority: 5, visibility: "default" },
      ],
      revenue_manager: [
        { metric: "occupancy", priority: 1, visibility: "default" },
        { metric: "adr", priority: 2, visibility: "default" },
        { metric: "orphan_nights", priority: 3, visibility: "default" },
        { metric: "direct_share", priority: 4, visibility: "default" },
      ],
      housekeeping_manager: [
        { metric: "turnovers", priority: 1, visibility: "default" },
        { metric: "unit_readiness", priority: 2, visibility: "default" },
      ],
      owner: [
        { metric: "contribution", priority: 1, visibility: "default" },
        { metric: "occupancy", priority: 2, visibility: "default" },
        { metric: "verified_value", priority: 3, visibility: "default" },
      ],
      cfo: [
        { metric: "contribution", priority: 1, visibility: "default" },
        { metric: "distribution_cost", priority: 2, visibility: "default" },
        { metric: "verified_value", priority: 3, visibility: "default" },
      ],
    },
    timeModel: "stay_lifecycle",
    firstInsightTemplate:
      "9 check-ins today; 1 turnover projected late and 1 maintenance block threatens tomorrow.",
  });

/** Vacation rental shares Lisbon Residences DEMO path for this pass. */
export const VACATION_RENTAL: HospitalityOperatingProfile =
  hospitalityOperatingProfileSchema.parse({
    ...SERVICED_APARTMENTS,
    id: "vacation_rental",
    label: "Vacation rental",
  });

export const HOTEL_STUB = stubProfile("hotel", "Hotel", "accommodation", {
  defaultUnitTypes: ["ROOMS", "RESTAURANT", "HOUSEKEEPING"],
  inventoryKinds: ["room", "room_night"],
  timeModel: "hotel_day",
  integrationFamilies: [...HOTEL_INTEGRATIONS],
});

export const SPA_STUB = stubProfile("spa", "Spa / wellness", "experience", {
  defaultUnitTypes: ["SPA"],
  inventoryKinds: ["treatment_slot", "therapist_hour"],
  timeModel: "meal_service",
});

export const BAR_STUB = stubProfile("bar", "Bar / club", "food_beverage", {
  defaultUnitTypes: ["BAR"],
  inventoryKinds: ["table", "bar_seat"],
  timeModel: "meal_service",
});

export const RESORT_MIXED_STUB = stubProfile(
  "resort_mixed",
  "Resort / mixed hospitality",
  "mixed",
  {
    defaultUnitTypes: ["ROOMS", "RESTAURANT", "SPA", "EVENTS"],
    inventoryKinds: ["room", "room_night", "table", "treatment_slot", "event_slot"],
    timeModel: "mixed",
  },
);

export const PROFILES: Record<ProfileId, HospitalityOperatingProfile> = {
  restaurant_full_service: RESTAURANT_FULL_SERVICE,
  boutique_hotel: BOUTIQUE_HOTEL,
  hotel: HOTEL_STUB,
  serviced_apartments: SERVICED_APARTMENTS,
  vacation_rental: VACATION_RENTAL,
  spa: SPA_STUB,
  bar: BAR_STUB,
  resort_mixed: RESORT_MIXED_STUB,
};

export function getProfile(id: string): HospitalityOperatingProfile | null {
  return (PROFILES as Record<string, HospitalityOperatingProfile>)[id] ?? null;
}

export function parseHospitalityOperatingProfile(
  input: unknown,
): HospitalityOperatingProfile {
  return hospitalityOperatingProfileSchema.parse(input);
}

/** Default Berlin restaurant units for loc_ber. */
export function berlinRestaurantUnits(
  organizationId = "org_northstar",
  locationId = "loc_ber",
): OperatingUnit[] {
  return [
    {
      id: `${locationId}_restaurant`,
      organizationId,
      locationId,
      unitType: "RESTAURANT" as OperatingUnitType,
      label: "Main dining",
      inventoryKind: "table",
      capacity: 96,
      revenueStreams: ["dine_in", "private_dining"],
      laborGroups: ["FOH", "BOH"],
      operatingHours: { open: "18:00", close: "23:00" },
      kpiKeys: ["covers", "contribution", "floor_pressure"],
      phaseKeys: ["PREPARE", "OPERATE", "TURNOVER", "VERIFY", "LEARN"],
      connectedSystemFamilies: ["POS", "RESERVATIONS", "LABOR"],
    },
    {
      id: `${locationId}_bar`,
      organizationId,
      locationId,
      unitType: "BAR",
      label: "Bar",
      inventoryKind: "bar_seat",
      capacity: 18,
      revenueStreams: ["bar"],
      laborGroups: ["FOH"],
      operatingHours: { open: "17:00", close: "01:00" },
      kpiKeys: ["covers", "beverage_contribution"],
      phaseKeys: ["PREPARE", "OPERATE", "VERIFY"],
      connectedSystemFamilies: ["POS"],
    },
    {
      id: `${locationId}_terrace`,
      organizationId,
      locationId,
      unitType: "RESTAURANT",
      label: "Terrace",
      inventoryKind: "terrace",
      capacity: 36,
      revenueStreams: ["dine_in"],
      laborGroups: ["FOH"],
      operatingHours: { open: "18:00", close: "22:00" },
      kpiKeys: ["covers", "contribution"],
      phaseKeys: ["PREPARE", "OPERATE"],
      connectedSystemFamilies: ["RESERVATIONS"],
    },
  ];
}

/** Canal House Amsterdam boutique hotel units. */
export function canalHouseUnits(
  organizationId = "org_canal_house",
  locationId = "loc_ams_canal",
): OperatingUnit[] {
  return [
    {
      id: `${locationId}_rooms`,
      organizationId,
      locationId,
      unitType: "ROOMS",
      label: "Rooms",
      inventoryKind: "room",
      capacity: 28,
      revenueStreams: ["room_revenue", "ancillary", "late_checkout"],
      laborGroups: ["front_desk", "housekeeping"],
      kpiKeys: ["occupancy", "adr", "revpar", "room_readiness"],
      phaseKeys: ["PREPARE", "OPERATE", "TURNOVER", "VERIFY", "LEARN"],
      connectedSystemFamilies: ["PMS", "CHANNEL_MANAGER", "HOUSEKEEPING"],
    },
    {
      id: `${locationId}_restaurant`,
      organizationId,
      locationId,
      unitType: "RESTAURANT",
      label: "Restaurant",
      inventoryKind: "table",
      capacity: 40,
      revenueStreams: ["fb", "breakfast"],
      laborGroups: ["FOH", "BOH"],
      kpiKeys: ["covers", "fb_contribution"],
      phaseKeys: ["PREPARE", "OPERATE", "VERIFY"],
      connectedSystemFamilies: ["POS", "RESERVATIONS"],
    },
    {
      id: `${locationId}_bar`,
      organizationId,
      locationId,
      unitType: "BAR",
      label: "Bar",
      inventoryKind: "bar_seat",
      capacity: 24,
      revenueStreams: ["bar"],
      laborGroups: ["FOH"],
      kpiKeys: ["covers", "beverage_contribution"],
      phaseKeys: ["OPERATE"],
      connectedSystemFamilies: ["POS"],
    },
    {
      id: `${locationId}_hk`,
      organizationId,
      locationId,
      unitType: "HOUSEKEEPING",
      label: "Housekeeping",
      inventoryKind: "room",
      capacity: 28,
      revenueStreams: [],
      laborGroups: ["housekeeping"],
      kpiKeys: ["room_readiness", "turnaround"],
      phaseKeys: ["TURNOVER", "OPERATE"],
      connectedSystemFamilies: ["HOUSEKEEPING", "PMS"],
    },
  ];
}

/** Lisbon Residences serviced apartments units. */
export function lisbonResidencesUnits(
  organizationId = "org_lisbon_residences",
  locationId = "loc_lis_residences",
): OperatingUnit[] {
  return [
    {
      id: `${locationId}_units`,
      organizationId,
      locationId,
      unitType: "SERVICED_APARTMENTS",
      label: "Apartments",
      inventoryKind: "unit",
      capacity: 84,
      revenueStreams: ["unit_revenue", "cleaning_fee", "ancillary"],
      laborGroups: ["ops", "cleaning", "maintenance"],
      kpiKeys: ["occupancy", "adr", "turnovers", "orphan_nights"],
      phaseKeys: ["PREPARE", "OPERATE", "TURNOVER", "VERIFY", "LEARN"],
      connectedSystemFamilies: ["PMS", "CHANNEL_MANAGER"],
    },
    {
      id: `${locationId}_hk`,
      organizationId,
      locationId,
      unitType: "HOUSEKEEPING",
      label: "Turnover / cleaning",
      inventoryKind: "unit",
      capacity: 84,
      revenueStreams: [],
      laborGroups: ["cleaning"],
      kpiKeys: ["turnovers", "unit_readiness"],
      phaseKeys: ["TURNOVER", "OPERATE"],
      connectedSystemFamilies: ["HOUSEKEEPING", "PMS"],
    },
  ];
}
