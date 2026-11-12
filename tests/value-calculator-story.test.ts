import { describe, expect, it } from "vitest";
import {
  calculateValueMap,
  sampleJourney,
} from "@/lib/marketing/value-calculator";
import {
  CATEGORY_LENS,
  categoryDecision,
  lensBreakdown,
  resultStory,
} from "@/lib/marketing/value-calculator/resultStory";

describe("Calculator decision story", () => {
  for (const vertical of ["restaurant", "hotel", "mixed"] as const) {
    it(`${vertical}: lens contributions reconcile without counting categories twice`, () => {
      const journey = sampleJourney(vertical);
      const result = calculateValueMap(journey)!;
      const lenses = lensBreakdown(result.categories);
      expect(lenses.reduce((s, l) => s + l.amount, 0)).toBe(
        result.total.modeled,
      );
      expect(lenses.reduce((s, l) => s + l.share, 0)).toBeCloseTo(1, 10);
      expect(lenses.flatMap((l) => l.members.map((c) => c.id)).sort()).toEqual(
        result.categories.map((c) => c.id).sort(),
      );
      for (const category of result.categories) {
        const d = categoryDecision(category.id, journey);
        expect(d.question.endsWith("?")).toBe(true);
        expect(d.response.length).toBeGreaterThan(25);
        expect(d.verify.length).toBeGreaterThan(25);
        expect(CATEGORY_LENS[category.id]).toBeTruthy();
      }
    });
  }
  it("does not make a visual share when revenue is unknown", () => {
    const j = { ...sampleJourney("mixed"), revenueId: "unknown" };
    const lenses = lensBreakdown(calculateValueMap(j)!.categories);
    expect(lenses.every((l) => l.amount === 0 && l.share === 0)).toBe(true);
  });
  it("routes known operations through the existing registration gate without financial inputs", () => {
    for (const v of ["restaurant", "hotel"] as const) {
      const story = resultStory(sampleJourney(v));
      const url = new URL(story.demoHref, "https://radr.invalid");
      expect(url.pathname).toBe("/signup");
      expect(url.searchParams.get("intent")).toBe("demo");
      expect(url.searchParams.get("next")).toBe(
        `/app/enter?vertical=${v}&go=1`,
      );
      expect([...url.searchParams.keys()].sort()).toEqual(["intent", "next"]);
    }
    expect(resultStory(sampleJourney("mixed")).demoHref).toBe("/demo");
  });
  it("retains only the selected scope in the lens breakdown", () => {
    const j = {
      ...sampleJourney("hotel"),
      painAreas: ["channel_mix" as const],
      painUnsure: false,
    };
    const lenses = lensBreakdown(calculateValueMap(j)!.categories);
    expect(lenses.find((l) => l.id === "SELL")?.share).toBe(1);
    expect(
      lenses
        .filter((l) => l.id !== "SELL")
        .every((l) => l.amount === 0 && !l.members.length),
    ).toBe(true);
  });
});
