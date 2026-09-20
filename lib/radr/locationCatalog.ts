/**
 * Location catalog helpers: city grouping, search, chart palette.
 * Does not replace LOCATIONS; enriches product catalog for switcher + compare.
 */

import { LOCATIONS } from "@/lib/product/demo/catalog";
import { LOCATION_META } from "@/lib/product/demo/locations";
import type { Location } from "@/lib/product/types";
import { LOCATION_CHART_COLORS } from "@/lib/radr/brandTokens";

export const COUNTRY_LABEL: Record<string, string> = {
  NL: "Netherlands",
  UK: "United Kingdom",
  FR: "France",
  DE: "Germany",
  US: "United States",
  JP: "Japan",
  SG: "Singapore",
  AE: "United Arab Emirates",
  AU: "Australia",
};

export type LocationMode = "single" | "group" | "comparison";

export function countryLabel(code: string): string {
  return COUNTRY_LABEL[code] ?? code;
}

export function locationSubtitle(loc: Location): string {
  const region = LOCATION_META[loc.id]?.region ?? countryLabel(loc.country);
  return `${loc.city} · ${region}`;
}

export function locationChartColor(index: number): string {
  return LOCATION_CHART_COLORS[index % LOCATION_CHART_COLORS.length]!;
}

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

/** Drop city prefix for compact rail / compare labels. */
export function shortLocationName(name: string): string {
  return name
    .replace(/^Amsterdam /, "")
    .replace(/^Berlin /, "")
    .replace(/^Paris /, "")
    .replace(/^London /, "")
    .replace(/^New York /, "")
    .replace(/^San Francisco /, "")
    .replace(/^Tokyo /, "")
    .replace(/^Singapore /, "")
    .replace(/^Dubai /, "")
    .replace(/^Sydney /, "");
}

/** Locations sharing the same city as the given location id. */
export function sameCityLocations(locationId: string): Location[] {
  const base = getLocationById(locationId);
  if (!base) return [];
  return LOCATIONS.filter((l) => l.city === base.city);
}

export type CityGroup = {
  city: string;
  country: string;
  countryName: string;
  locations: Location[];
};

export function groupLocationsByCity(locations: Location[] = LOCATIONS): CityGroup[] {
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

export function searchLocations(query: string, locations: Location[] = LOCATIONS): Location[] {
  const q = query.trim().toLowerCase();
  if (!q) return locations;
  const tokens = q.split(/\s+/).filter(Boolean);
  return locations.filter((loc) => {
    const meta = LOCATION_META[loc.id];
    const hay = [
      loc.name,
      loc.city,
      loc.country,
      countryLabel(loc.country),
      meta?.region ?? "",
      meta?.street ?? "",
    ]
      .join(" ")
      .toLowerCase();
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

/** Region id → venue ids (includes multi-venue cities). */
export const REGION_LOCATION_IDS: Record<string, string[]> = {
  region_de: ["loc_ber", "loc_ber_kreuz"],
  region_us: ["loc_nyc", "loc_nyc_wvill", "loc_sf"],
  region_apac: ["loc_tyo", "loc_sin", "loc_syd"],
  region_mena: ["loc_dxb"],
  region_nl: ["loc_ams", "loc_ams_canal"],
  region_pt: ["loc_lis_residences"],
  region_uk: ["loc_lon"],
  region_fr: ["loc_par"],
};

export function locationsInScope(scope: string): Location[] {
  if (scope === "all") return LOCATIONS;
  if (scope.startsWith("region_")) {
    const ids = new Set(REGION_LOCATION_IDS[scope] ?? []);
    return LOCATIONS.filter((l) => ids.has(l.id));
  }
  const one = getLocationById(scope);
  return one ? [one] : [];
}
