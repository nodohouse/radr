import { describe, expect, it } from "vitest";
import {
  formatPublicPrice,
  standardPlanQuote,
} from "@/lib/marketing/publicPricing";
import {
  planForLocations,
  planRegistrationHref,
  planSetupPreviewHref,
} from "@/lib/marketing/conversionJourney";

describe("Published annual commitment, monthly instalments", () => {
  it.each([
    [1, "start", 249, 2988],
    [2, "expand", 398, 4776],
    [3, "expand", 597, 7164],
    [4, "expand", 796, 9552],
    [5, "expand", 995, 11940],
  ])(
    "quotes %i locations without treating the unit price as a group total",
    (locations, plan, monthlyTotal, commitmentTotal) => {
      expect(standardPlanQuote(Number(locations))).toMatchObject({
        plan,
        monthlyTotal,
        commitmentTotal,
        commitmentMonths: 12,
        currency: "EUR",
      });
    },
  );
  it.each([0, -1, 1.5, 6, 20, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])(
    "does not invent a standard price for %s locations",
    (count) => {
      expect(standardPlanQuote(count)).toBeNull();
    },
  );
  it("routes larger footprints to sales from marketing and demo setup", () => {
    expect(planForLocations(6)).toBe("enterprise");
    expect(planForLocations(200)).toBe("enterprise");
    expect(planRegistrationHref("enterprise")).toBe("/contact?plan=enterprise");
    expect(planSetupPreviewHref("enterprise", "hotel")).toBe(
      "/contact?plan=enterprise",
    );
  });
  it("formats EUR without implying cents or another currency", () => {
    expect(formatPublicPrice(249)).toBe("€249");
    expect(formatPublicPrice(4776)).toBe("€4,776");
  });
});
