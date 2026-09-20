import { describe, expect, it } from "vitest";
import {
  BERLIN_BEVERAGE_SHARE_PCT,
  berlinDrinkMixFixture,
  berlinFoodMixFixture,
  splitFnBNetSales,
} from "@/lib/radr/fnb";
import { composeBerlinPostShiftBrief } from "@/lib/radr/preShift";
import { composeBerlinPreShiftBrief } from "@/lib/radr/preShift";
import { demoBerlinLiveFinance } from "@/lib/radr/finance";
import { demoShiftStateAtTick } from "@/lib/radr/live";

describe("F&B category economics", () => {
  it("splits Berlin net into ~35% beverage with higher drink margin", () => {
    const split = splitFnBNetSales(9740, BERLIN_BEVERAGE_SHARE_PCT);
    expect(split.beverageSharePct).toBe(34.8);
    expect(split.foodSharePct).toBe(65.2);
    expect(split.foodRevenue + split.beverageRevenue).toBeCloseTo(9740, 1);
    expect(split.beverageContributionMarginPct).toBeGreaterThan(
      split.foodContributionMarginPct,
    );
  });

  it("post-shift includes drinks mix and category revenue", () => {
    const brief = composeBerlinPostShiftBrief();
    expect(brief.fnb.beverageSharePct).toBe(34.8);
    expect(brief.drinks[0]?.name).toMatch(/Burgundy/i);
    expect(brief.drinks.some((d) => d.tag === "surprise")).toBe(true);
    expect(brief.dishes[0]?.category).toBe("food");
    expect(brief.highlights.some((h) => /drink/i.test(h.label))).toBe(true);
    expect(brief.nextShift.some((a) => /Negroni|Burgundy|BTG/i.test(a.label))).toBe(
      true,
    );
  });

  it("pre-shift and live carry the same beverage share spine", () => {
    const pre = composeBerlinPreShiftBrief();
    expect(pre.fnb.beverageSharePct).toBe(34.8);
    expect(pre.readiness.some((r) => r.domain === "BEVERAGE")).toBe(true);

    const live = demoShiftStateAtTick(8);
    expect(live.fnb.beverageSharePct).toBe(34.8);
    expect(live.fnb.beverageRevenue).toBeGreaterThan(0);

    const finance = demoBerlinLiveFinance(live.netSales);
    expect(finance.fnb.beverageSharePct).toBe(34.8);
    expect(finance.fnb.foodRevenue + finance.fnb.beverageRevenue).toBeCloseTo(
      finance.netSales,
      1,
    );
  });

  it("mix fixtures expose total F&B share", () => {
    const drinks = berlinDrinkMixFixture(34.8);
    const food = berlinFoodMixFixture(65.2);
    expect(drinks[0]!.totalMixPct).toBeGreaterThan(0);
    expect(food[0]!.totalMixPct).toBeGreaterThan(0);
  });
});
