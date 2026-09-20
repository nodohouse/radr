import { describe, expect, it } from "vitest";
import {
  buildCompareHref,
  getLocationComparison,
  parseComparisonLocationIds,
} from "@/lib/radr/comparisonService";

describe("comparisonService", () => {
  it("parses location query ids", () => {
    expect(
      parseComparisonLocationIds("loc_nyc,loc_nyc_wvill,loc_ber"),
    ).toEqual(["loc_nyc", "loc_nyc_wvill", "loc_ber"]);
  });

  it("builds a route-addressable href", () => {
    const href = buildCompareHref([
      "loc_nyc",
      "loc_nyc_wvill",
      "loc_ber",
    ]);
    expect(href).toBe(
      "/app/compare?locations=loc_nyc,loc_nyc_wvill,loc_ber",
    );
  });

  it("requires 2–4 valid locations", () => {
    expect(getLocationComparison({ locationIds: ["loc_nyc"] }).ok).toBe(false);
    const ok = getLocationComparison({
      locationIds: ["loc_nyc", "loc_nyc_wvill"],
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.sameCity).toBe(true);
      expect(ok.locations).toHaveLength(2);
      expect(ok.summary.length).toBeGreaterThan(20);
    }
  });

  it("flags invalid ids", () => {
    const bad = getLocationComparison({
      locationIds: ["loc_nyc", "loc_nope"],
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe("invalid");
  });

  it("converts mixed currencies to EUR reporting", () => {
    const mixed = getLocationComparison({
      locationIds: ["loc_nyc", "loc_lon"],
    });
    expect(mixed.ok).toBe(true);
    if (mixed.ok) {
      expect(mixed.mixedCurrency).toBe(true);
      expect(mixed.reportingCurrency).toBe("EUR");
    }
  });
});
