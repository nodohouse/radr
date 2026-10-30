import { describe, expect, it } from "vitest";
import {
  assertEstateSearchCoverage,
  estateLocationsAsCatalog,
  getLocationById,
  groupLocationsByCity,
  sameCityLocations,
  searchLocations,
} from "@/lib/radr/locationCatalog";
import {
  HOTEL_ESTATE,
  RESTAURANT_ESTATE,
  getEstateEntity,
} from "@/lib/radr/demo/estateRegistry";
import { getVenueProfile } from "@/lib/radr/venueProfiles";

describe("locationCatalog · DemoEstateRegistry SSOT", () => {
  it("indexes all 20 estate sites", () => {
    const { ok, missing } = assertEstateSearchCoverage();
    expect(missing).toEqual([]);
    expect(ok).toBe(true);
    expect(estateLocationsAsCatalog()).toHaveLength(20);
    expect(estateLocationsAsCatalog("restaurant")).toHaveLength(10);
    expect(estateLocationsAsCatalog("hotel")).toHaveLength(10);
  });

  it("groups New York venues together (restaurant + hotel)", () => {
    const nyc = sameCityLocations("loc_berlin_mitte");
    expect(nyc.length).toBeGreaterThanOrEqual(2);
    expect(nyc.every((l) => l.city === "New York")).toBe(true);
  });

  it("searches every global city to a canonical estate id", () => {
    const cases: [string, string][] = [
      ["tokyo", "loc_stuttgart_mitte"],
      ["shibuya", "loc_stuttgart_mitte"],
      ["mexico", "loc_hamburg_hafen"],
      ["roma norte", "loc_hamburg_hafen"],
      ["são paulo", "loc_frankfurt_westend"],
      ["sao paulo", "loc_frankfurt_westend"],
      ["hong kong", "loc_hk_central"],
      ["sydney", "loc_sydney_surry"],
      ["dubai", "loc_koln_ehrenfeld"],
      ["singapore", "loc_dusseldorf_medienhafen"],
      ["cape town", "loc_cape_town_waterfront"],
      ["mercer", "loc_canal_house"],
      ["soho", "loc_berlin_mitte"],
      ["west hollywood", "loc_berlin_kreuzberg"],
    ];
    for (const [q, id] of cases) {
      expect(
        searchLocations(q).some((l) => l.id === id),
        `search("${q}") should hit ${id}`,
      ).toBe(true);
    }
  });

  it("does not surface Berlin or Amsterdam display names", () => {
    const hits = [
      ...searchLocations("berlin"),
      ...searchLocations("amsterdam"),
    ];
    for (const h of hits) {
      expect(h.name).not.toMatch(/Berlin|Amsterdam/i);
      expect(h.city).not.toMatch(/Berlin|Amsterdam/i);
    }
  });

  it("groups by city for switcher without Europe orphans", () => {
    const groups = groupLocationsByCity();
    expect(groups.find((g) => g.city === "Berlin")).toBeUndefined();
    expect(groups.find((g) => g.city === "Amsterdam")).toBeUndefined();
    const nyc = groups.find((g) => g.city === "New York");
    expect(nyc?.locations.length).toBeGreaterThanOrEqual(2);
  });

  it("getLocationById resolves estate entities with matching currency", () => {
    for (const e of [...RESTAURANT_ESTATE, ...HOTEL_ESTATE]) {
      const loc = getLocationById(e.id);
      expect(loc?.id).toBe(e.id);
      expect(loc?.city).toBe(e.city);
      const profile = getVenueProfile(e.id);
      expect(profile.currency).toBe(e.currency);
      expect(getEstateEntity(e.id)?.timezone).toBe(e.timezone);
    }
  });
});
