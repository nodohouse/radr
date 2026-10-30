import { describe, expect, it } from "vitest";
import {
  executiveCompressionLine,
  reconcileCompression,
} from "@/lib/radr/intelligence/finding";
import {
  buildCompareHref,
  getLocationComparison,
  parseComparisonLocationIds,
} from "@/lib/radr/comparisonService";
import { getTransferBrief } from "@/lib/radr/product/transferBrief";
import { houseAttentionFor, assertHouseTemporalIntegrity } from "@/lib/radr/product/houseAttention";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";

describe("RC P0 invariants", () => {
  it("executive compression totals reconcile", () => {
    const r = reconcileCompression({
      noAction: 141,
      handling: 1,
      watching: 1,
      needJudgment: 3,
    });
    expect(r.evaluated).toBe(146);
    const line = executiveCompressionLine({
      withinExpectation: 141,
      handling: 1,
      watching: 1,
      needJudgment: 3,
    });
    expect(line.startsWith("146 evaluated")).toBe(true);
    expect(line).toMatch(/cleared/);
    expect(line).not.toMatch(/^147 /);
  });

  it("compare href uses locations= and accepts from/to", () => {
    expect(buildCompareHref(["loc_hamburg_hafen", "loc_berlin_mitte"])).toBe(
      "/app/compare?locations=loc_hamburg_hafen,loc_berlin_mitte&stay=1",
    );
    expect(
      parseComparisonLocationIds(
        null,
        "loc_hamburg_hafen",
        "loc_berlin_mitte",
      ),
    ).toEqual(["loc_hamburg_hafen", "loc_berlin_mitte"]);
    expect(getTransferBrief("xfer_wine_hamburg")?.transferability).toBe("HIGH");
  });

  it("Hamburg → Berlin compare resolves (estate IDs)", () => {
    const result = getLocationComparison({
      locationIds: ["loc_hamburg_hafen", "loc_berlin_mitte"],
      period: "mtd",
      allowedLocationIds: "all",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.locations.map((l) => l.id)).toEqual([
        "loc_hamburg_hafen",
        "loc_berlin_mitte",
      ]);
      expect(result.locations[0]?.name).toMatch(/Hamburg/i);
      expect(result.locations[1]?.name).toMatch(/Berlin/i);
    }
  });

  it("waterfall drivers In+Out equals contribution variance", () => {
    const bridge = getContributionBridge();
    const drivers = bridge.segments.filter(
      (s) => s.kind === "positive" || s.kind === "negative",
    );
    const inflow = drivers
      .filter((d) => d.amount > 0)
      .reduce((s, d) => s + d.amount, 0);
    const outflow = drivers
      .filter((d) => d.amount < 0)
      .reduce((s, d) => s + d.amount, 0);
    expect(inflow + outflow).toBe(bridge.varianceAmount);
  });

  it("BOH sugar has Futures; fryer oil is not D-4102", () => {
    const house = houseAttentionFor("restaurant");
    const sugar = house.gaps.find((g) => g.id === "gap_sugar_berlin")!;
    const oil = house.gaps.find((g) => g.id === "gap_oil_berlin")!;
    expect(sugar.futures?.length).toBeGreaterThanOrEqual(3);
    const rec = sugar.futures?.find((f) => f.recommended);
    expect(rec?.approveHref).toBe(`/app/decisions/${DECISION_IDS.casterSugar}`);
    expect(sugar.decisionId).toBe(DECISION_IDS.casterSugar);
    expect(oil.decisionId).toBeUndefined();
    expect(oil.decisionId).not.toBe(DECISION_IDS.supplier);
    expect(oil.preparedActionLabel).toMatch(/fryer/i);
  });

  it("BOH sugar gap does not coexist with verified sugar restore", () => {
    const house = houseAttentionFor("restaurant");
    const issues = assertHouseTemporalIntegrity(house);
    expect(issues).toEqual([]);
    expect(house.verifications.every((v) => v.itemKey !== "caster_sugar")).toBe(
      true,
    );
    expect(house.verifications[0]?.historicalLabel).toMatch(/HISTORICAL/i);
  });

  it("hotel BOH has no restaurant sugar/fryer concepts", () => {
    const house = houseAttentionFor("hotel");
    expect(house.gaps.every((g) => !/sugar|fryer/i.test(g.item))).toBe(true);
    expect(house.gaps.some((g) => /soap|linen|minibar/i.test(g.item))).toBe(
      true,
    );
  });
});
