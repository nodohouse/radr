import { describe, expect, it } from "vitest";
import {
  groupLocationsByCity,
  sameCityLocations,
  searchLocations,
} from "@/lib/radr/locationCatalog";

describe("locationCatalog", () => {
  it("groups New York venues together", () => {
    const nyc = sameCityLocations("loc_nyc");
    expect(nyc.length).toBeGreaterThanOrEqual(2);
    expect(nyc.every((l) => l.city === "New York")).toBe(true);
  });

  it("searches by city and country", () => {
    expect(searchLocations("tokyo").some((l) => l.id === "loc_tyo")).toBe(true);
    expect(searchLocations("united states").some((l) => l.id === "loc_nyc")).toBe(
      true,
    );
    expect(searchLocations("berlin").some((l) => l.id === "loc_ber")).toBe(true);
  });

  it("groups by city for switcher", () => {
    const groups = groupLocationsByCity();
    const nyc = groups.find((g) => g.city === "New York");
    expect(nyc?.locations.length).toBeGreaterThanOrEqual(2);
    const berlin = groups.find((g) => g.city === "Berlin");
    expect(berlin?.locations.length).toBeGreaterThanOrEqual(2);
  });
});
