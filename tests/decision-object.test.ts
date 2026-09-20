import { describe, expect, it } from "vitest";
import { findingsForScope } from "@/lib/radr/findings";
import { findingToDecision } from "@/lib/radr/decision/types";
import {
  BERLIN_TERRACE_WEATHER,
  calculateTerraceWeatherOpportunity,
} from "@/lib/radr/weather/calc";

describe("findingToDecision", () => {
  it("builds weather options with do-nothing economics", () => {
    const weather = findingsForScope("loc_ber").find(
      (f) => f.category === "weather_sensitive_demand",
    );
    expect(weather).toBeTruthy();
    const d = findingToDecision(weather!, "gm");
    const opp = calculateTerraceWeatherOpportunity(BERLIN_TERRACE_WEATHER);

    expect(d.options.length).toBeGreaterThanOrEqual(3);
    expect(d.recommendedOptionId).toBe("prepare_terrace_foh");
    expect(d.noAction.expectedCostEuro).toBe(opp.doNothingValue);
    expect(d.noAction.detail).toContain(String(opp.doNothingValue));
    expect(d.options.some((o) => o.id === "do_nothing")).toBe(true);
    expect(d.decisionDeadline.length).toBeGreaterThan(0);
    expect(["High", "Medium", "Low"]).toContain(d.confidenceLabel);
    expect(d.epistemicState).toBeTruthy();
  });

  it("builds staffing options with a clear no-action path", () => {
    const staffing = findingsForScope("loc_ber").find(
      (f) =>
        f.category === "peak_service_capacity" ||
        f.category.includes("staff") ||
        f.id.includes("staffing"),
    );
    expect(staffing).toBeTruthy();
    const d = findingToDecision(staffing!, "gm");
    expect(d.options.some((o) => o.id === "do_nothing")).toBe(true);
    expect(d.options.some((o) => o.recommended)).toBe(true);
    expect(d.noAction.expectedCostEuro).toBeGreaterThan(0);
    expect(d.decisionDeadline.length).toBeGreaterThan(0);
  });
});
