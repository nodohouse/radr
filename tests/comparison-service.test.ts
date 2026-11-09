import { describe, expect, it } from "vitest";
import {
  buildCompareHref,
  getLocationComparison,
  parseComparisonLocationIds,
} from "@/lib/radr/comparisonService";

describe("comparisonService", () => {
  it("parses location query ids", () => {
    expect(
      parseComparisonLocationIds("loc_berlin_mitte,loc_berlin_kreuzberg,loc_ber"),
    ).toEqual(["loc_berlin_mitte", "loc_berlin_kreuzberg", "loc_ber"]);
  });

  it("builds a route-addressable href", () => {
    const href = buildCompareHref([
      "loc_berlin_mitte",
      "loc_berlin_kreuzberg",
      "loc_ber",
    ]);
    expect(href).toBe(
      "/app/compare?locations=loc_berlin_mitte,loc_berlin_kreuzberg,loc_ber&stay=1",
    );
  });

  it("requires 2–4 valid locations", () => {
    expect(getLocationComparison({ locationIds: ["loc_berlin_mitte"] }).ok).toBe(false);
    const ok = getLocationComparison({
      locationIds: ["loc_berlin_mitte", "loc_berlin_kreuzberg"],
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.sameCity).toBe(false);
      expect(ok.locations).toHaveLength(2);
      expect(ok.summary.length).toBeGreaterThan(20);
    }
  });

  it("flags invalid ids", () => {
    const bad = getLocationComparison({
      locationIds: ["loc_berlin_mitte", "loc_nope"],
    });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error).toBe("invalid");
  });

  it("converts mixed currencies to explicit USD reporting", () => {
    const mixed = getLocationComparison({
      locationIds: ["loc_berlin_mitte", "loc_munich_altstadt"],
    });
    expect(mixed.ok).toBe(true);
    if (mixed.ok) {
      expect(mixed.mixedCurrency).toBe(true);
      expect(mixed.reportingCurrency).toBe("USD");
    }
  });
});
