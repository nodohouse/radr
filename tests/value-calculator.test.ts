import { describe, expect, it } from "vitest";
import {
  PORTFOLIO,
  calculateValueOpportunity,
  sampleInput,
  type ValueCalculatorInput,
} from "@/lib/marketing/value-calculator";

function base(over: Partial<ValueCalculatorInput> = {}): ValueCalculatorInput {
  return {
    vertical: "restaurant",
    locations: 5,
    annualRevenue: 10_000_000,
    currency: "USD",
    laborPct: 0.28,
    foodCogsPct: 0.28,
    purchasingPct: 0.3,
    painAreas: "unsure",
    systems: "3_5",
    reconcileCadence: "weekly",
    manualRecon: "medium",
    decisionStandardization: "medium",
    ...over,
  };
}

function assertSane(r: ReturnType<typeof calculateValueOpportunity>) {
  expect(Number.isFinite(r.total.low)).toBe(true);
  expect(Number.isFinite(r.total.modeled)).toBe(true);
  expect(Number.isFinite(r.total.high)).toBe(true);
  expect(r.total.low).toBeGreaterThanOrEqual(0);
  expect(r.total.modeled).toBeGreaterThanOrEqual(r.total.low);
  expect(r.total.high).toBeGreaterThanOrEqual(r.total.modeled);
  expect(r.verifiedValue).toBe(0);
  expect(r.headline.low).toBe(r.total.low);
  expect(r.headline.modeled).toBe(r.total.modeled);
}

describe("calculateValueOpportunity", () => {
  it("restaurant sample is sane", () => {
    const r = calculateValueOpportunity(sampleInput("restaurant_group"));
    assertSane(r);
    expect(r.categories.length).toBeGreaterThan(0);
    expect(r.startingOpportunity).toBeTruthy();
  });

  it("hotel sample is sane", () => {
    const r = calculateValueOpportunity(sampleInput("hotel_group"));
    assertSane(r);
    expect(r.categories.some((c) => c.id === "channel_mix")).toBe(true);
  });

  it("mixed sample is sane", () => {
    const r = calculateValueOpportunity(sampleInput("mixed_group"));
    assertSane(r);
  });

  it("handles zero revenue", () => {
    const r = calculateValueOpportunity(base({ annualRevenue: 0 }));
    assertSane(r);
    expect(r.total.modeled).toBe(0);
    expect(r.confidence).toBe("low");
  });

  it("handles unknown metrics", () => {
    const r = calculateValueOpportunity(
      base({
        laborPct: undefined,
        foodCogsPct: undefined,
        purchasingPct: undefined,
      }),
    );
    assertSane(r);
    expect(r.confidenceReasons.some((x) => /assumed/i.test(x))).toBe(true);
  });

  it("supports currencies without NaN", () => {
    for (const currency of ["EUR", "GBP", "JPY", "AED"] as const) {
      const r = calculateValueOpportunity(base({ currency }));
      assertSane(r);
      expect(r.currency).toBe(currency);
    }
  });

  it("scales with sites and revenue", () => {
    const small = calculateValueOpportunity(
      base({ locations: 1, annualRevenue: 1_000_000 }),
    );
    const large = calculateValueOpportunity(
      base({ locations: 100, annualRevenue: 100_000_000 }),
    );
    assertSane(small);
    assertSane(large);
    expect(large.total.modeled).toBeGreaterThan(small.total.modeled);
  });

  it("filters pain areas", () => {
    const r = calculateValueOpportunity(
      base({ painAreas: ["supplier_ap", "labor"] }),
    );
    assertSane(r);
    expect(
      r.categories.every((c) => ["supplier_ap", "labor"].includes(c.id)),
    ).toBe(true);
  });

  it("applies overlap so AP cluster is not blind-summed", () => {
    const r = calculateValueOpportunity(
      base({ painAreas: ["supplier_ap", "procurement"] }),
    );
    assertSane(r);
    expect(r.methodology.overlapGroupsApplied).toContain("ap_cluster");
    const sumRawWouldBeHigher =
      r.categories.reduce((s, c) => s + c.modeled, 0) <= r.total.modeled + 1;
    expect(sumRawWouldBeHigher).toBe(true);
  });

  it("respects capture rate", () => {
    const a = calculateValueOpportunity(base({ captureRate: 0.1 }));
    const b = calculateValueOpportunity(base({ captureRate: 0.4 }));
    expect(b.captureScenario.capturedModeled).toBeGreaterThan(
      a.captureScenario.capturedModeled,
    );
  });

  it("ROI null without investment", () => {
    const r = calculateValueOpportunity(base({ annualInvestment: undefined }));
    expect(r.roi).toBeNull();
  });

  it("ROI with investment", () => {
    const r = calculateValueOpportunity(
      base({
        annualInvestment: 120_000,
        captureRate: PORTFOLIO.defaultCaptureRate,
      }),
    );
    expect(r.roi).not.toBeNull();
    expect(Number.isFinite(r.roi!.roiModeled)).toBe(true);
  });

  it("portfolio cap can apply on high rates", () => {
    const r = calculateValueOpportunity(
      base({
        annualRevenue: 5_000_000,
        rateOverrides: {
          laborOpportunityRate: { low: 0.2, base: 0.3, high: 0.4 },
          supplierLeakageRate: { low: 0.2, base: 0.3, high: 0.4 },
          perishableRevenueOpportunityRate: {
            low: 0.2,
            base: 0.3,
            high: 0.4,
          },
        },
      }),
    );
    assertSane(r);
    expect(r.total.modeled).toBeLessThanOrEqual(
      Math.round(5_000_000 * PORTFOLIO.portfolioCapRate) + 1,
    );
  });

  it("rejects negative / infinite inputs", () => {
    const r = calculateValueOpportunity(
      base({
        annualRevenue: Number.POSITIVE_INFINITY,
        locations: -3,
        captureRate: 99,
      }),
    );
    assertSane(r);
  });

  it("hotel excludes food_waste by default applicability when filtered", () => {
    const r = calculateValueOpportunity(
      base({
        vertical: "hotel",
        painAreas: "unsure",
        roomRevenueShare: 0.7,
        otaMixPct: 0.4,
      }),
    );
    assertSane(r);
    expect(r.categories.some((c) => c.id === "food_waste")).toBe(false);
  });
});

describe("Transparent and bounded model scenarios", () => {
  it("reconciles the full adjustment bridge to the sum of all categories", () => {
    for (const vertical of ["restaurant", "hotel", "mixed", "other"] as const) {
      const r = calculateValueOpportunity(base({ vertical }));
      expect(
        r.methodology.rawModeledTotal! -
          r.methodology.overlapReduction! -
          r.methodology.portfolioReduction!,
      ).toBe(r.total.modeled);
      expect(r.categories.reduce((sum, c) => sum + c.modeled, 0)).toBe(
        r.total.modeled,
      );
      for (const c of r.categories)
        expect(c.calculation?.rates.base).toBeGreaterThanOrEqual(0);
    }
  });
  it("deduplicates selected areas and sanitizes non-finite sensitivity rates", () => {
    const a = calculateValueOpportunity(base({ painAreas: ["labor"] }));
    const b = calculateValueOpportunity(
      base({ painAreas: ["labor", "labor"] }),
    );
    expect(b.total).toEqual(a.total);
    const r = calculateValueOpportunity(
      base({
        captureRate: NaN,
        rateOverrides: {
          laborOpportunityRate: { low: 0.4, base: NaN, high: -2 },
        },
      }),
    );
    assertSane(r);
    expect(Number.isFinite(r.captureScenario.capturedModeled)).toBe(true);
    expect(r.captureScenario.rate).toBe(PORTFOLIO.defaultCaptureRate);
  });
  it("identifies only overlap groups containing multiple categories", () => {
    const r = calculateValueOpportunity(base({ painAreas: ["labor"] }));
    expect(r.methodology.overlapGroupsApplied).toEqual([]);
    expect(r.methodology.overlapReduction).toBe(0);
  });
  it("reports negative annual ROI and never guarantees payback", () => {
    const r = calculateValueOpportunity(base({ annualInvestment: 1000000000 }));
    expect(r.roi!.roiModeled).toBeLessThan(0);
    expect(r.roi!.netModeled).toBeLessThan(0);
  });
});

it("does not recommend a zero-value category as a monetary starting point", () => {
  const r = calculateValueOpportunity(
    base({ painAreas: ["labor"], laborPct: 0 }),
  );
  expect(r.total.modeled).toBe(0);
  expect(r.startingOpportunity).toBeNull();
});

it("keeps mixed, extreme and malformed numeric scenarios finite and reconciled", () => {
  const revenues = [0, -100, NaN, Infinity, 120, 1e6, 1e12, 1e308];
  for (const vertical of ["restaurant", "hotel", "mixed", "other"] as const) {
    for (let i = 0; i < revenues.length * 4; i += 1) {
      const r = calculateValueOpportunity(
        base({
          vertical,
          annualRevenue: revenues[i % revenues.length],
          laborPct: i % 3 === 0 ? NaN : (i % 5) / 4,
          captureRate: [NaN, -1, 0.2, Infinity, 10][i % 5],
          annualInvestment: i % 2 ? 1e308 : 100,
          rateOverrides: {
            laborOpportunityRate: {
              low: i % 2 ? 0.5 : NaN,
              base: -1,
              high: Infinity,
            },
          },
        }),
      );
      assertSane(r);
      expect(Number.isFinite(r.captureScenario.capturedModeled)).toBe(true);
      expect(
        r.methodology.rawModeledTotal! -
          r.methodology.overlapReduction! -
          r.methodology.portfolioReduction!,
      ).toBe(r.total.modeled);
      if (r.roi?.paybackMonthsModeled != null)
        expect(Number.isFinite(r.roi.paybackMonthsModeled)).toBe(true);
    }
  }
});
