import { describe, expect, it } from "vitest";
import { modulesForIntelligenceCategory } from "@/lib/radr/intelligence/categoryModules";

describe("Intelligence category routing", () => {
  it("revenue category never includes Live Service", () => {
    const ids = modulesForIntelligenceCategory("revenue", [
      "live_service",
      "settlement_bridge",
    ]);
    expect(ids).not.toContain("live_service");
    expect(ids).toContain("revenue_vs_forecast");
  });

  it("payments is settlement-first", () => {
    const ids = modulesForIntelligenceCategory("payments", []);
    expect(ids[0]).toBe("settlement_bridge");
    expect(ids).not.toContain("live_service");
    expect(ids).not.toContain("top_dishes");
  });

  it("overview keeps role list intact", () => {
    const overview = ["verified_value_trend", "settlement_bridge"];
    expect(modulesForIntelligenceCategory("overview", overview)).toEqual(
      overview,
    );
  });
});
