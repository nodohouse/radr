import { describe, expect, it } from "vitest";
import {
  assertPilotEconomicsAligned,
  assertSameProductScope,
  marketingDemoScenario,
  productDemoScenario,
} from "@/lib/radr/product/demoScenario";
import { DEMO_ORG } from "@/lib/radr/product/demoOrg";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { getRecommendedIntelligenceModules } from "@/lib/radr/intelligence/recommendedModules";
import { NORTHSTAR_RESTAURANTS } from "@/lib/radr/demo/organizations";

describe("Demo scenario coherence", () => {
  it("keeps group estate and app restaurant org as distinct snapshots", () => {
    const estate = marketingDemoScenario();
    const pilot = productDemoScenario("restaurant");
    expect(estate.id).not.toBe(pilot.id);
    expect(estate.locationsReporting).toBe(12);
    expect(pilot.connectedLocations).toBe(10);
    expect(pilot.orgName).toBe(NORTHSTAR_RESTAURANTS.name);
    expect(pilot.groupLocations).toBe(NORTHSTAR_RESTAURANTS.totalLocations);
    expect(estate.snapshotTimestamp).not.toBe(pilot.snapshotTimestamp);
    expect(estate.economics.verifiedEuro).not.toBe(
      pilot.economics.verifiedEuro,
    );
  });

  it("aligns restaurant app economics with Control Center", () => {
    expect(assertPilotEconomicsAligned()).toBe(true);
    const pilot = productDemoScenario("restaurant");
    const cc = composeControlCenterBrief({
      role: "gm",
      vertical: "restaurant",
      period: "mtd",
    });
    expect(pilot.economics.exposureEuro).toBe(
      cc.economics.activeExposureOrOpportunity,
    );
    expect(pilot.economics.verifiedEuro).toBe(3793);
    expect(cc.verifiedFormatted).toBe(pilot.economics.verifiedFormatted);
    expect(cc.needsYouCount).toBe(pilot.economics.needsAttentionCount);
    expect(cc.needsYouCount).toBe(3);
    expect(cc.locationCount).toBe(10);
  });

  it("Control Center scope matches Live Focus product scenario", () => {
    const { ok, scenario, forbiddenLabels } = assertSameProductScope("restaurant");
    expect(ok).toBe(true);
    expect(forbiddenLabels).toEqual([]);
    expect(scenario.economics.verifiedEuro).not.toBe(6103);
    expect(scenario.orgName).not.toMatch(/Canal|Chiado/i);
    // Legacy mixed DEMO_ORG remains for marketing only
    expect(DEMO_ORG.connectedLocations).toBe(3);
  });
});

describe("Recommended intelligence modules", () => {
  it("prioritizes finance modules for CFO — not Live Service first", () => {
    const mods = getRecommendedIntelligenceModules({ role: "cfo" });
    expect(mods[0]?.id).not.toBe("live_service");
    expect(mods.map((m) => m.id)).toContain("settlement_bridge");
    expect(mods.map((m) => m.id)).toContain("verified_value_trend");
  });

  it("prioritizes live service for GM", () => {
    const mods = getRecommendedIntelligenceModules({
      role: "gm",
      temporalState: "live",
    });
    expect(mods[0]?.id).toBe("live_service");
  });
});
