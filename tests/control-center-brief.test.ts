import { describe, expect, it } from "vitest";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("Control Center brief", () => {
  it("CFO brief uses canonical aggregates — no hardcoded euros", () => {
    const agg = deriveValueAggregate("cfo");
    const brief = composeControlCenterBrief({ role: "cfo", period: "mtd" });
    expect(brief.economics.verifiedTotal).toBe(agg.verifiedTotal);
    expect(brief.economics.activeExposureOrOpportunity).toBe(
      agg.activeExposureOrOpportunity,
    );
    expect(brief.needsYouCount).toBe(brief.needsYou.length);
    expect(brief.verifiedFormatted).toContain("$");
    expect(brief.exposureFormatted).toContain("$");
  });

  it("GM and CFO share the same needs-you Decision count SoT for Berlin open set", () => {
    const gm = composeControlCenterBrief({ role: "gm" });
    const cfo = composeControlCenterBrief({ role: "cfo" });
    // Same open Berlin Decisions in seed portfolio (peak + sugar + coke)
    expect(gm.needsYouCount).toBe(3);
    expect(cfo.needsYouCount).toBe(3);
    expect(gm.economics.activeExposure).toBe(cfo.economics.activeExposure);
    expect(gm.economics.activeExposure).toBeGreaterThanOrEqual(974);
  });

  it("customer classes never expose BUY/SELL/LABOR", () => {
    const brief = composeControlCenterBrief({ role: "gm" });
    for (const row of brief.needsYou) {
      expect(row.classLabel).not.toMatch(/BUY|SELL|LABOR|RECOVER/);
    }
    expect(
      customerDecisionClass({
        id: DECISION_IDS.peak,
        decisionType: "peak",
        territories: ["SELL", "LABOR"],
      }),
    ).toBe("Service capacity");
  });

  it("value trend points reconcile to verified Decisions", () => {
    const brief = composeControlCenterBrief({ role: "cfo" });
    const last = brief.valueTrend.at(-1);
    expect(last?.cumulative).toBe(brief.economics.verifiedTotal);
  });
});
