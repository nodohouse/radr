import { describe, expect, it } from "vitest";
import {
  calculateValueMap,
  emptyJourney,
  previewConfidence,
  sampleJourney,
} from "@/lib/marketing/value-calculator";

describe("Value Calculator V2 journey", () => {
  it("restaurant sample produces sane personalized range", () => {
    const j = sampleJourney("restaurant");
    const r = calculateValueMap(j);
    expect(r).not.toBeNull();
    expect(r!.total.modeled).toBeGreaterThan(0);
    expect(r!.total.high).toBeGreaterThanOrEqual(r!.total.modeled);
    expect(r!.verifiedValue).toBe(0);
    expect(r!.startingOpportunity).toBeTruthy();
  });

  it("hotel sample includes channel_mix applicability", () => {
    const r = calculateValueMap(sampleJourney("hotel"));
    expect(r).not.toBeNull();
    expect(r!.categories.some((c) => c.id === "channel_mix")).toBe(true);
  });

  it("mixed sample works", () => {
    const r = calculateValueMap(sampleJourney("mixed"));
    expect(r).not.toBeNull();
    expect(Number.isFinite(r!.total.modeled)).toBe(true);
  });

  it("incomplete journey returns null", () => {
    expect(calculateValueMap(emptyJourney())).toBeNull();
  });

  it("unknown revenue never invents a financial base", () => {
    const j = sampleJourney("restaurant");
    j.revenueId = "unknown";
    const r = calculateValueMap(j);
    expect(r).not.toBeNull();
    expect(r!.total.modeled).toBe(0);
    expect(r!.confidence).toBe("low");
    expect(r!.startingOpportunity).toBeNull();
    expect(r!.roi).toBeNull();
  });

  it("currency AED does not NaN", () => {
    const j = sampleJourney("restaurant");
    j.currency = "AED";
    const r = calculateValueMap(j);
    expect(r!.currency).toBe("AED");
    expect(Number.isFinite(r!.total.low)).toBe(true);
  });

  it("capture rate changes captured value", () => {
    const a = sampleJourney("restaurant");
    a.captureRate = 0.1;
    const b = { ...sampleJourney("restaurant"), captureRate: 0.4 };
    const ra = calculateValueMap(a)!;
    const rb = calculateValueMap(b)!;
    expect(rb.captureScenario.capturedModeled).toBeGreaterThan(
      ra.captureScenario.capturedModeled,
    );
  });

  it("investment enables ROI", () => {
    const j = sampleJourney("restaurant");
    j.investmentId = "50_100";
    const r = calculateValueMap(j)!;
    expect(r.roi).not.toBeNull();
    expect(Number.isFinite(r.roi!.roiModeled)).toBe(true);
  });

  it("preview confidence rises with completeness", () => {
    const empty = previewConfidence(emptyJourney());
    const full = previewConfidence(sampleJourney("restaurant"));
    expect(empty.level).toBe("low");
    expect(["medium", "high"]).toContain(full.level);
  });

  it("deterministic: same journey twice", () => {
    const j = sampleJourney("hotel");
    const a = calculateValueMap(j)!;
    const b = calculateValueMap(j)!;
    expect(a.total.modeled).toBe(b.total.modeled);
    expect(a.startingOpportunity).toBe(b.startingOpportunity);
  });
});

describe("Financial input integrity", () => {
  it("uses exact combined revenue without multiplying by the location count", () => {
    const j = {
      ...sampleJourney("restaurant"),
      revenueMode: "exact" as const,
      revenueExact: 625000,
    };
    const first = calculateValueMap({ ...j, locationsId: "1" })!;
    const many = calculateValueMap({ ...j, locationsId: "51_100" })!;
    expect(first.total).toEqual(many.total);
    expect(first.total.modeled).toBeGreaterThan(0);
  });
  it("keeps numerical bases unchanged when changing reporting currency", () => {
    const usd = calculateValueMap(sampleJourney("hotel"))!;
    for (const currency of ["EUR", "JPY", "AED", "OTHER"] as const) {
      expect(
        calculateValueMap({ ...sampleJourney("hotel"), currency })!.total,
      ).toEqual(usd.total);
    }
  });
  it("rejects invalid exact revenue and invalid revenue-band IDs", () => {
    for (const revenueExact of [0, -10, NaN, Infinity, 1e13]) {
      expect(
        calculateValueMap({
          ...sampleJourney("restaurant"),
          revenueMode: "exact",
          revenueExact,
        }),
      ).toBeNull();
    }
    expect(
      calculateValueMap({
        ...sampleJourney("restaurant"),
        revenueId: "not-a-band",
      }),
    ).toBeNull();
  });
  it("responds to room revenue share and true zero OTA exposure", () => {
    const low = calculateValueMap({
      ...sampleJourney("hotel"),
      roomRevenueShareId: "25_49",
    })!;
    const high = calculateValueMap({
      ...sampleJourney("hotel"),
      roomRevenueShareId: "75_100",
    })!;
    expect(
      high.categories.find((c) => c.id === "channel_mix")!.modeled,
    ).toBeGreaterThan(
      low.categories.find((c) => c.id === "channel_mix")!.modeled,
    );
    expect(
      calculateValueMap({
        ...sampleJourney("hotel"),
        otaId: "none",
      })!.categories.find((c) => c.id === "channel_mix")!.modeled,
    ).toBe(0);
  });
  it("does not create ROI without a revenue amount, even with a budget", () => {
    expect(
      calculateValueMap({
        ...sampleJourney("restaurant"),
        revenueId: "unknown",
        investmentExact: 1000,
      })!.roi,
    ).toBeNull();
  });
});
