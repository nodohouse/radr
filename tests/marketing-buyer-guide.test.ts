import { describe, expect, it } from "vitest";
import {
  ECONOMIC_GUIDES,
  economicGuideId,
  LEAK_FIELD_NOTES,
} from "@/lib/marketing/buyerGuide";
import { planForLocations, planName } from "@/lib/marketing/conversionJourney";
import { getBlogPost } from "@/lib/marketing/blog";
import {
  PUBLIC_SUPPLIER,
  PUBLIC_RESTAURANT,
} from "@/lib/marketing/publicCanon";
import { resultStory } from "@/lib/marketing/value-calculator/resultStory";
import { emptyJourney } from "@/lib/marketing/value-calculator/journey";
describe("Buyer guidance boundaries", () => {
  it("offers only documented package capacities at the exact boundaries", () => {
    expect([1, 2, 5, 6, 20, 21].map(planForLocations)).toEqual([
      "start",
      "expand",
      "expand",
      "enterprise",
      "enterprise",
      null,
    ]);
    expect(planName(planForLocations(20)!)).toBe("Portfolio");
  });
  it("does not recommend a plan for invalid or fractional counts", () => {
    for (const n of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
      expect(planForLocations(n)).toBeNull();
  });
  it("resolves explicit economic routes without prototype property fallbacks", () => {
    for (const id of ["buy", "labor", "sell", "recover"])
      expect(economicGuideId(id)).toBe(id);
    for (const id of [undefined, "constructor", "__proto__", "cost"])
      expect(economicGuideId(id)).toBeNull();
  });
  it("uses canonical public economics and resolves every reading destination", () => {
    expect(ECONOMIC_GUIDES.buy.example).toContain(
      PUBLIC_SUPPLIER.exposureFormatted,
    );
    expect(LEAK_FIELD_NOTES.supplier.proof).toContain(
      PUBLIC_SUPPLIER.exposureFormatted,
    );
    expect(ECONOMIC_GUIDES.labor.example).toContain(
      PUBLIC_RESTAURANT.expectedFormatted,
    );
    for (const g of Object.values(ECONOMIC_GUIDES))
      expect(getBlogPost(g.next.split("/").at(-1)!)).toBeDefined();
  });
  it("does not call a single other-format venue a portfolio", () => {
    const j = {
      ...emptyJourney(),
      vertical: "other" as const,
      otherKind: "resort" as const,
    };
    expect(resultStory(j).title).not.toContain("portfolio");
    expect(resultStory(j).demoHref).toBe("/demo");
  });
});
