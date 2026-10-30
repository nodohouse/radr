/**
 * Location completeness — 10 restaurants × 7 tabs SSOT.
 */
import { describe, expect, it } from "vitest";
import { NORTHSTAR_RESTAURANTS, NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";
import { locationTabsFor } from "@/lib/radr/product/experienceComposer";
import { composeLocationIntel } from "@/lib/radr/location/composeLocationIntel";
import { allCanonicalLocationIds } from "@/lib/radr/location/resolve";
import {
  assertEstateSearchCoverage,
  searchLocations,
} from "@/lib/radr/locationCatalog";
import { getVenueProfile } from "@/lib/radr/venueProfiles";

const CANON_TABS = [
  "overview",
  "live",
  "performance",
  "decisions",
  "value",
  "memory",
  "data",
] as const;

describe("Location completeness", () => {
  it("restaurant org has 10 locations", () => {
    expect(NORTHSTAR_RESTAURANTS.locations).toHaveLength(10);
  });

  it("hotel org has 10 properties", () => {
    expect(NORTHSTAR_HOTELS.locations).toHaveLength(10);
  });

  it("restaurant and hotel share the same 7-tab IA", () => {
    expect(locationTabsFor("restaurant").map((t) => t.id)).toEqual([...CANON_TABS]);
    expect(locationTabsFor("hotel").map((t) => t.id)).toEqual([...CANON_TABS]);
  });

  it("every restaurant location composes intel", () => {
    for (const loc of NORTHSTAR_RESTAURANTS.locations) {
      const intel = composeLocationIntel(loc.id, { role: "coo" });
      expect(intel, loc.id).toBeTruthy();
      expect(intel!.economics.revenue).toBeGreaterThan(0);
      expect(intel!.statement.line.length).toBeGreaterThan(4);
    }
  });

  it("canonical ids cover restaurant + hotel estates", () => {
    const ids = new Set(allCanonicalLocationIds());
    for (const loc of NORTHSTAR_RESTAURANTS.locations) {
      expect(ids.has(loc.id)).toBe(true);
    }
    for (const loc of NORTHSTAR_HOTELS.locations) {
      expect(ids.has(loc.id)).toBe(true);
    }
  });

  it("global search indexes every estate site with matching currency", () => {
    expect(assertEstateSearchCoverage().ok).toBe(true);
    for (const loc of [
      ...NORTHSTAR_RESTAURANTS.locations,
      ...NORTHSTAR_HOTELS.locations,
    ]) {
      expect(searchLocations(loc.city).some((l) => l.id === loc.id)).toBe(true);
      expect(getVenueProfile(loc.id).currency).toBe(loc.currency);
    }
  });
});
