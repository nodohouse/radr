/**
 * Location catalog helpers: city grouping, search, chart palette.
 * Search SSOT = DemoEstateRegistry via organizations (10 + 10).
 */

import { LOCATION_META } from "@/lib/product/demo/locations";
import type { Location } from "@/lib/product/types";
import { LOCATION_CHART_COLORS } from "@/lib/radr/brandTokens";
import {
  DemoEstateRegistry,
  HOTEL_ESTATE,
  RESTAURANT_ESTATE,
  getEstateEntity,
  type DemoEstateEntity,
} from "@/lib/radr/demo/estateRegistry";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export const COUNTRY_LABEL: Record<string, string> = {
  NL: "Netherlands",
  UK: "United Kingdom",
  GB: "United Kingdom",
  FR: "France",
  DE: "Germany",
  US: "United States",
  JP: "Japan",
  SG: "Singapore",
  AE: "United Arab Emirates",
  AU: "Australia",
  MX: "Mexico",
  BR: "Brazil",
  HK: "Hong Kong",
  ZA: "South Africa",
};

export type LocationMode = "single" | "group" | "comparison";

export function countryLabel(code: string): string {
  return COUNTRY_LABEL[code] ?? code;
}

function entityToLocation(e: DemoEstateEntity): Location {
  return {
    id: e.id,
    name: e.displayName,
    city: e.city,
    country: e.countryCode,
    openSignals: 0,
    valueOnRadr: 0,
    verifiedValue: 0,
    lastSync: "now",
  };
}

/** Full global estate catalog (20 sites). */
export function estateLocationsAsCatalog(
  vertical?: DemoVerticalFamily,
): Location[] {
  if (vertical === "restaurant") {
    return RESTAURANT_ESTATE.map(entityToLocation);
  }
  if (vertical === "hotel") {
    return HOTEL_ESTATE.map(entityToLocation);
  }
  return [...RESTAURANT_ESTATE, ...HOTEL_ESTATE].map(entityToLocation);
}

/** @deprecated Prefer estateLocationsAsCatalog — kept for import stability. */
export const ESTATE_SEARCH_CATALOG = estateLocationsAsCatalog();

export function locationSubtitle(loc: Location): string {
  const estate = getEstateEntity(loc.id);
  if (estate) return `${estate.city} · ${countryLabel(estate.countryCode)}`;
  const region = LOCATION_META[loc.id]?.region ?? countryLabel(loc.country);
  return `${loc.city} · ${region}`;
}

export function locationChartColor(index: number): string {
  return LOCATION_CHART_COLORS[index % LOCATION_CHART_COLORS.length]!;
}

export function getLocationById(id: string): Location | undefined {
  const estate = getEstateEntity(id);
  if (estate) return entityToLocation(estate);
  return estateLocationsAsCatalog().find((l) => l.id === id);
}

/** Drop city prefix for compact rail / compare labels. */
export function shortLocationName(name: string): string {
  return name
    .replace(/^Amsterdam /, "")
    .replace(/^Berlin /, "")
    .replace(/^Paris /, "")
    .replace(/^London /, "")
    .replace(/^New York /, "")
    .replace(/^Los Angeles /, "")
    .replace(/^Mexico City /, "")
    .replace(/^San Francisco /, "")
    .replace(/^Tokyo /, "")
    .replace(/^Singapore /, "")
    .replace(/^Dubai /, "")
    .replace(/^Sydney /, "")
    .replace(/^Hong Kong /, "")
    .replace(/^Cape Town /, "")
    .replace(/^São Paulo /, "")
    .replace(/ · .+$/, "");
}

/** Locations sharing the same city as the given location id. */
export function sameCityLocations(locationId: string): Location[] {
  const base = getLocationById(locationId);
  if (!base) return [];
  return estateLocationsAsCatalog().filter((l) => l.city === base.city);
}

export type CityGroup = {
  city: string;
  country: string;
  countryName: string;
  locations: Location[];
};

export function groupLocationsByCity(
  locations: Location[] = estateLocationsAsCatalog(),
): CityGroup[] {
  const map = new Map<string, CityGroup>();
  for (const loc of locations) {
    const key = `${loc.city}|${loc.country}`;
    const existing = map.get(key);
    if (existing) {
      existing.locations.push(loc);
    } else {
      map.set(key, {
        city: loc.city,
        country: loc.country,
        countryName: countryLabel(loc.country),
        locations: [loc],
      });
    }
  }
  return [...map.values()].sort((a, b) => a.city.localeCompare(b.city));
}

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

export function searchLocations(
  query: string,
  locations: Location[] = estateLocationsAsCatalog(),
): Location[] {
  const q = fold(query.trim());
  if (!q) return locations;
  const tokens = q.split(/\s+/).filter(Boolean);
  return locations.filter((loc) => {
    const estate = getEstateEntity(loc.id);
    const meta = LOCATION_META[loc.id];
    const hay = fold(
      [
        loc.name,
        loc.city,
        loc.country,
        countryLabel(loc.country),
        estate?.displayName ?? "",
        estate?.name ?? "",
        estate?.slug ?? "",
        estate?.region ?? "",
        estate?.currency ?? "",
        estate?.timezone ?? "",
        meta?.region ?? "",
        meta?.street ?? "",
      ].join(" "),
    );
    return tokens.every((t) => hay.includes(t));
  });
}

export function deriveLocationMode(
  scope: string,
  comparisonIds: string[],
): LocationMode {
  if (comparisonIds.length >= 2) return "comparison";
  if (scope === "all" || scope.startsWith("region_")) return "group";
  return "single";
}

/** Region id → canonical estate venue ids. */
export const REGION_LOCATION_IDS: Record<string, string[]> = {
  region_americas: RESTAURANT_ESTATE.filter((e) => e.region === "AMERICAS")
    .map((e) => e.id)
    .concat(
      HOTEL_ESTATE.filter((e) => e.region === "AMERICAS").map((e) => e.id),
    ),
  region_europe: RESTAURANT_ESTATE.filter((e) => e.region === "EUROPE")
    .map((e) => e.id)
    .concat(HOTEL_ESTATE.filter((e) => e.region === "EUROPE").map((e) => e.id)),
  region_mea: RESTAURANT_ESTATE.filter((e) => e.region === "MIDDLE_EAST")
    .map((e) => e.id)
    .concat(
      HOTEL_ESTATE.filter((e) => e.region === "MIDDLE_EAST").map((e) => e.id),
    ),
  region_apac: RESTAURANT_ESTATE.filter((e) => e.region === "APAC")
    .map((e) => e.id)
    .concat(HOTEL_ESTATE.filter((e) => e.region === "APAC").map((e) => e.id)),
  region_africa: HOTEL_ESTATE.filter((e) => e.region === "AFRICA").map(
    (e) => e.id,
  ),
  // Legacy aliases
  region_us: [
    "loc_berlin_mitte",
    "loc_berlin_kreuzberg",
    "loc_canal_house",
    "loc_ams_harbour",
  ],
  region_uk: ["loc_munich_altstadt", "loc_lisbon_alfama"],
  region_mena: ["loc_koln_ehrenfeld", "loc_berlin_mitte_hotel"],
  region_de: [],
  region_nl: [],
  region_pt: [],
  region_fr: [],
};

export function locationsInScope(scope: string): Location[] {
  const all = estateLocationsAsCatalog();
  if (scope === "all") return all;
  if (scope.startsWith("region_")) {
    const ids = new Set(REGION_LOCATION_IDS[scope] ?? []);
    return all.filter((l) => ids.has(l.id));
  }
  const one = getLocationById(scope);
  return one ? [one] : [];
}

/** Assert search can resolve every registry entity (for tests). */
export function assertEstateSearchCoverage(): {
  ok: boolean;
  missing: string[];
} {
  const catalog = estateLocationsAsCatalog();
  const byId = new Set(catalog.map((l) => l.id));
  const expected = [
    ...DemoEstateRegistry.restaurant.locations,
    ...DemoEstateRegistry.hotel.properties,
  ].map((e) => e.id);
  const missing = expected.filter((id) => !byId.has(id));
  return { ok: missing.length === 0, missing };
}

export function orgCatalogForVertical(
  vertical: DemoVerticalFamily,
): Location[] {
  const org =
    vertical === "hotel" ? NORTHSTAR_HOTELS : NORTHSTAR_RESTAURANTS;
  return org.locations.map((l) => ({
    id: l.id,
    name: l.displayName,
    city: l.city,
    country: l.country,
    openSignals: 0,
    valueOnRadr: 0,
    verifiedValue: 0,
    lastSync: "now",
  }));
}
