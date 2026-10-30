/**
 * Connections / Data Health estate coverage for portfolio roles.
 */
import { describe, expect, it } from "vitest";
import { sourcesForDemo } from "@/lib/radr/product/integrations";
import { dataHealthRowsForRole } from "@/lib/radr/product/dataHealthCanonical";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";

describe("Connection estate coverage", () => {
  it("COO restaurant connections cover the full 8-location estate", () => {
    const rows = sourcesForDemo("coo", "restaurant");
    expect(rows.length).toBeGreaterThanOrEqual(4);
    for (const row of rows) {
      expect(row.locationIds.length).toBe(NORTHSTAR_RESTAURANTS.locations.length);
    }
    const ids = new Set(rows.flatMap((r) => r.locationIds));
    expect(ids.size).toBeGreaterThan(1);
    expect(ids.has("loc_berlin_mitte")).toBe(true);
    expect(ids.has("loc_frankfurt_westend")).toBe(true);
  });

  it("Data Health inherits the same estate coverage", () => {
    const rows = dataHealthRowsForRole("coo", "restaurant");
    expect(rows.every((r) => r.locationIds.length > 1)).toBe(true);
  });
});
