import { describe, expect, it } from "vitest";
import {
  allowedVisualizations,
  chartRecommendation,
  effectiveVisualization,
  mergeWidgetConfig,
  recommendedVisualization,
} from "@/lib/product/dashboardWidgetConfig";

describe("dashboard widget config", () => {
  it("recommends waterfall for settlement bridge", () => {
    expect(recommendedVisualization("settlement_bridge")).toBe("waterfall");
    expect(allowedVisualizations("settlement_bridge")).toContain("waterfall");
  });

  it("keeps list widgets from becoming pie charts", () => {
    const allowed = allowedVisualizations("builder_decisions");
    expect(allowed).toContain("list");
    expect(allowed).not.toContain("donut");
  });

  it("surfaces a recommendation when viz is suboptimal", () => {
    const tip = chartRecommendation("settlement_bridge", "donut");
    expect(tip).toMatch(/waterfall/i);
  });

  it("falls back to recommended when stored viz is illegal", () => {
    expect(
      effectiveVisualization("builder_decisions", {
        visualization: "waterfall",
      }),
    ).toBe("list");
  });

  it("merges and clears empty config fields", () => {
    const next = mergeWidgetConfig(
      { title: "Pace", showVariance: true },
      { title: "", visualization: "line" },
    );
    expect(next).toEqual({ showVariance: true, visualization: "line" });
  });
});
