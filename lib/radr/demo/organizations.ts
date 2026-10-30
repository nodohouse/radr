/**
 * Demo organizations — first-class vertical demos.
 *
 * NORTHSTAR RESTAURANTS · NORTHSTAR HOTELS
 * Location composition SSOT: lib/radr/demo/estateRegistry.ts
 *
 * Mixed portfolio remains available as legacy `org_northstar` for internal demos.
 */

import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  HOTEL_ESTATE,
  RESTAURANT_ESTATE,
  type DemoEstateEntity,
} from "@/lib/radr/demo/estateRegistry";

export type DemoOrgId =
  | "org_northstar_restaurants"
  | "org_northstar_hotels"
  | "org_northstar"; /* legacy mixed */

export type DemoLocationSeed = {
  id: string;
  name: string;
  displayName: string;
  city: string;
  country: string;
  vertical: DemoVerticalFamily | "apartment";
  /** Archetype for generating operating color. */
  archetype: string;
  timezone: string;
  currency?: string;
  countryCode?: string;
  region?: string;
  locale?: string;
  image?: string;
};

export type DemoOrganization = {
  id: DemoOrgId;
  name: string;
  shortName: string;
  vertical: DemoVerticalFamily | "mixed";
  totalLocations: number;
  connectedLocations: number;
  snapshotTimestamp: string;
  demoScenarioId: string;
  locations: DemoLocationSeed[];
};

export const DEMO_SNAPSHOT_ISO = "2026-09-24T14:20:00-04:00";

function seedFromEstate(e: DemoEstateEntity): DemoLocationSeed {
  return {
    id: e.id,
    name: e.name,
    displayName: e.displayName,
    city: e.city,
    country: e.countryCode,
    vertical: e.vertical,
    archetype: e.archetype,
    timezone: e.timezone,
    currency: e.currency,
    countryCode: e.countryCode,
    region: e.region,
    locale: e.locale,
    image: e.image,
  };
}

export const NORTHSTAR_RESTAURANTS: DemoOrganization = {
  id: "org_northstar_restaurants",
  name: "Northstar Restaurants",
  shortName: "Restaurants",
  vertical: "restaurant",
  totalLocations: RESTAURANT_ESTATE.length,
  connectedLocations: RESTAURANT_ESTATE.length,
  snapshotTimestamp: DEMO_SNAPSHOT_ISO,
  demoScenarioId: "rest_demo_v1_fri_peak",
  locations: RESTAURANT_ESTATE.map(seedFromEstate),
};

export const NORTHSTAR_HOTELS: DemoOrganization = {
  id: "org_northstar_hotels",
  name: "Northstar Hotels",
  shortName: "Hotels",
  vertical: "hotel",
  totalLocations: HOTEL_ESTATE.length,
  connectedLocations: HOTEL_ESTATE.length,
  snapshotTimestamp: DEMO_SNAPSHOT_ISO,
  demoScenarioId: "hotel_demo_v1_checkin_wave",
  locations: HOTEL_ESTATE.map(seedFromEstate),
};

/** Legacy mixed Northstar — internal / marketing continuity only. */
export const NORTHSTAR_MIXED_LEGACY = {
  id: "org_northstar" as const,
  name: "Northstar Hospitality Group",
  shortName: "Northstar",
  vertical: "mixed" as const,
};

export const DEMO_ORGS = {
  restaurants: NORTHSTAR_RESTAURANTS,
  hotels: NORTHSTAR_HOTELS,
} as const;

export function demoOrgById(id: DemoOrgId): DemoOrganization | null {
  if (id === NORTHSTAR_RESTAURANTS.id) return NORTHSTAR_RESTAURANTS;
  if (id === NORTHSTAR_HOTELS.id) return NORTHSTAR_HOTELS;
  return null;
}

export function demoOrgForVertical(
  v: DemoVerticalFamily,
): DemoOrganization {
  return v === "hotel" ? NORTHSTAR_HOTELS : NORTHSTAR_RESTAURANTS;
}

export function primaryLocationId(org: DemoOrganization): string {
  return org.locations[0]!.id;
}
