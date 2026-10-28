import { describe, it, expect } from "vitest";
import { modelScenario } from "@/lib/value-scenario";
describe("illustrative annual value model", () => {
  const inputs = {
    locations: 1,
    revenue: 3000000,
    labor: 750000,
    procurement: 600000,
    operations: 300000,
  };
  it("applies each disclosed rate to its own baseline", () => {
    const r = modelScenario(inputs);
    expect(r.categories.map((c) => [c.low, c.high])).toEqual([
      [240000, 360000],
      [22500, 45000],
      [30000, 60000],
      [6000, 12000],
    ]);
    expect([r.low, r.high]).toEqual([298500, 477000]);
  });
  it("scales all ranges by the number of locations", () => {
    const a = modelScenario(inputs),
      b = modelScenario({ ...inputs, locations: 3 });
    expect(b.low).toBe(a.low * 3);
    expect(b.high).toBe(a.high * 3);
  });
  it("never models negative opportunity from negative or invalid baselines", () => {
    const r = modelScenario({
      locations: 0,
      revenue: -1,
      labor: NaN,
      procurement: Infinity,
      operations: 0,
    });
    expect(r.low).toBe(0);
    expect(r.high).toBe(0);
  });
  it("bounds location counts and keeps the result finite", () => {
    const r = modelScenario({ ...inputs, locations: Infinity });
    expect(r.low).toBe(298500);
    const large = modelScenario({ ...inputs, locations: 1e9 });
    expect(large.high).toBe(477000 * 10000);
    expect(Number.isFinite(large.high)).toBe(true);
  });
});
