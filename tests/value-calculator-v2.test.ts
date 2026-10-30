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

  it("unknown revenue still models with assumed base", () => {
    const j = sampleJourney("restaurant");
    j.revenueId = "unknown";
    const r = calculateValueMap(j);
    expect(r).not.toBeNull();
    expect(r!.total.modeled).toBeGreaterThan(0);
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
