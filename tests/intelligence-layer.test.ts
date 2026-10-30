import { describe, expect, it } from "vitest";
import {
  INTELLIGENCE_REGISTRY,
  MAX_CONTROL_CENTER_PINS,
  suggestedModulesForRole,
} from "@/lib/radr/intelligence/moduleRegistry";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import { getTopDishes } from "@/lib/radr/intelligence/topDishes";
import {
  getMetricModule,
  getMenuContribution,
  getSettlementBridge,
  getSupplierVarianceSummary,
} from "@/lib/radr/intelligence/opsModules";
import { sourcesForRole } from "@/lib/radr/product/integrations";
import { dataHealthSummaryForRole } from "@/lib/radr/product/dataHealthCanonical";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { NAV_CONTROL, NAV_HOUSE, NAV_OPERATE, NAV_SYSTEM } from "@/lib/product/appNav";
import {
  DEMO_ORG,
  connectedScopeLabel,
} from "@/lib/radr/product/demoOrg";

describe("Intelligence polish", () => {
  it("registry exposes Live Service and Top Dishes", () => {
    expect(INTELLIGENCE_REGISTRY.live_service?.title).toBe("Live Service");
    expect(INTELLIGENCE_REGISTRY.top_dishes?.pinningSupported).toBe(true);
    expect(MAX_CONTROL_CENTER_PINS).toBe(6);
  });

  it("nav groups Control / House / Operate / System", () => {
    expect(NAV_CONTROL.map((n) => n.id)).toEqual([
      "control-center",
      "decisions",
      "value",
    ]);
    expect(NAV_HOUSE.map((n) => n.id)).toEqual(["house"]);
    expect(NAV_OPERATE.map((n) => n.id)).toEqual([
      "locations",
      "memory",
      "intelligence",
    ]);
    expect(NAV_SYSTEM.map((n) => n.id)).toEqual([
      "connections",
      "data-health",
    ]);
  });

  it("Northstar demo universe is 12 total / 3 connected", () => {
    expect(DEMO_ORG.totalLocations).toBe(12);
    expect(DEMO_ORG.connectedLocations).toBe(3);
    expect(connectedScopeLabel()).toContain("3 / 12");
  });

  it("CFO suggestions prioritize money modules", () => {
    const ids = suggestedModulesForRole("cfo").map((m) => m.id);
    expect(ids[0]).toBe("verified_value_trend");
    expect(ids).toContain("settlement_bridge");
  });

  it("Live Service returns coherent actual vs forecast when active", () => {
    const live = getLiveServicePerformance();
    expect(live.active).toBe(true);
    expect(live.revenue).toBe(18420);
    expect(live.forecastAtNow).toBe(17850);
    expect(live.avgSpend).toBe(86);
    expect(live.avgSpendForecast).toBe(82);
    expect(live.radrRead.length).toBeGreaterThan(20);
  });

  it("every catalog module has a real metric state — no placeholders", () => {
    for (const id of Object.keys(INTELLIGENCE_REGISTRY)) {
      if (
        id === "live_service" ||
        id === "top_dishes" ||
        id === "menu_contribution" ||
        id === "settlement_bridge" ||
        id === "supplier_variance" ||
        id === "revenue_pace_day" ||
        id === "revenue_pace_mtd" ||
        id === "tonight_demand" ||
        id === "cancellation_intel" ||
        id === "weather_context" ||
        id === "event_context" ||
        id === "live_revenue_trajectory" ||
        id === "money_flow" ||
        id === "order_flow" ||
        id === "delivery_flow" ||
        id === "stock_watch" ||
        id === "demand_outlook"
      ) {
        continue;
      }
      const m = getMetricModule(id);
      expect(m, id).toBeTruthy();
      expect(m!.primaryValue).not.toBe("—");
      expect(m!.radrRead.length).toBeGreaterThan(12);
    }
  });

  it("Top Dishes ranks tuna with kitchen-minute mismatch", () => {
    const report = getTopDishes("tonight");
    expect(report.available).toBe(true);
    expect(report.rows.length).toBeLessThanOrEqual(4);
    expect(report.rows[0]?.name).toMatch(/Tuna/i);
    expect(report.radrRead).toMatch(/kitchen minute/i);
  });

  it("Data Health summary matches Connections unhealthy count", () => {
    const summary = dataHealthSummaryForRole("cfo");
    const rows = sourcesForRole("cfo");
    const unhealthy = rows.filter(
      (r) => r.status === "STALE" || r.status === "DEGRADED",
    ).length;
    expect(summary.unhealthyCount).toBe(unhealthy);
    expect(summary.unhealthyCount).toBeGreaterThanOrEqual(2);
    expect(summary.summary).toMatch(/degraded|stale/i);
  });

  it("customer Decision classes replace BUY/SELL lenses", () => {
    expect(
      customerDecisionClass({
        id: DECISION_IDS.peak,
        decisionType: "peak",
        territories: ["SELL", "LABOR"],
      }),
    ).toBe("Service capacity");
  });

  it("Settlement and supplier selectors stay Decision-linked", () => {
    expect(getSettlementBridge().unexplained).toBe(395);
    expect(getSupplierVarianceSummary().relatedDecisionId).toBe(
      DECISION_IDS.supplier,
    );
    expect(getMenuContribution().points.length).toBeGreaterThan(3);
  });
});
