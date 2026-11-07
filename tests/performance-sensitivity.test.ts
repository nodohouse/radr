import { expect, it } from "vitest";
import { projectedSensitivity } from "@/lib/product/performanceSensitivity";
it("varies the unrecorded remainder rather than historical revenue", () => {
  expect(projectedSensitivity(18000, 26000, 10)).toEqual({
    low: 25200,
    baseline: 26000,
    high: 26800,
  });
});
it("handles an unchanged forecast, no remainder and negative adjustments", () => {
  expect(projectedSensitivity(18000, 26000, 0)).toEqual({
    low: 26000,
    baseline: 26000,
    high: 26000,
  });
  expect(projectedSensitivity(26000, 26000, 30).low).toBe(26000);
  expect(projectedSensitivity(100, 80, 10)).toEqual({
    low: 78,
    baseline: 80,
    high: 82,
  });
});
it("rejects invalid inputs rather than drawing plausible-looking numbers", () => {
  for (const amount of [NaN, Infinity, -Infinity])
    expect(() => projectedSensitivity(amount, 100, 10)).toThrow();
  for (const variation of [-1, 31, Infinity, NaN])
    expect(() => projectedSensitivity(10, 100, variation)).toThrow();
});
