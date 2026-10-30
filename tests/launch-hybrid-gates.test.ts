import { describe, expect, it } from "vitest";
import { resetDecisionStore, getDecisionRecord } from "@/lib/radr/decision/store";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { selectNeedsJudgment } from "@/lib/radr/product/selectNeedsJudgment";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { listValueMisses } from "@/lib/radr/product/valueMiss";
import { euroTraceForDecision } from "@/lib/radr/product/euroTrace";
import { getTransferBrief } from "@/lib/radr/product/transferBrief";
import { composeControlCenterExperience } from "@/lib/radr/product/experienceComposer";

describe("Launch Hybrid gates", () => {
  it("Berlin GM Needs You stays Peak · Caster · Margin (not Labor)", () => {
    resetDecisionStore();
    const needs = selectNeedsJudgment({
      role: "gm",
      vertical: "restaurant",
      locationId: "loc_berlin_mitte",
    });
    const ids = needs.map((r) => r.id);
    expect(ids).toContain(DECISION_IDS.peak);
    expect(ids).toContain(DECISION_IDS.casterSugar);
    expect(ids).toContain(DECISION_IDS.marginCoke);
    expect(ids).not.toContain(DECISION_IDS.labor);
    expect(ids).not.toContain(DECISION_IDS.created);
  });

  it("D-1920 workforce is seeded LEARNED with Futures options", () => {
    resetDecisionStore();
    const labor = getDecisionRecord(DECISION_IDS.labor)!;
    expect(displayDecisionId(labor.id)).toBe("D-1920");
    expect(labor.status).toBe("LEARNED");
    expect(labor.options.some((o) => o.id === "agency")).toBe(true);
    expect(labor.options.some((o) => o.id === "rebalance" && o.recommended)).toBe(
      true,
    );
    expect(labor.graph.nodes.length).toBeGreaterThanOrEqual(4);
  });

  it("D-HK-1402 has peer causal graph and stays separate from OTA", () => {
    resetDecisionStore();
    const hk = getDecisionRecord(DECISION_IDS.hotelReadiness)!;
    expect(hk.decisionType).toBe("housekeeping_reassign");
    expect(hk.operatingStateSnapshot?.length).toBeGreaterThan(0);
    expect(hk.graph.nodes.some((n) => n.id === "n_f3")).toBe(true);
    expect(hk.id).not.toBe(DECISION_IDS.ota);
  });

  it("Verified Value honest miss is €0 and TRACE exists", () => {
    resetDecisionStore();
    const miss = listValueMisses()[0]!;
    expect(miss.expectedEuro).toBe(420);
    expect(miss.observedEuro).toBe(90);
    expect(miss.verifiedEuro).toBe(0);
    const trace = euroTraceForDecision(miss.decisionId);
    expect(trace?.kind).toBe("miss");
    expect(trace?.chain.length).toBeGreaterThanOrEqual(5);
    const agg = deriveValueAggregate("gm", "restaurant");
    expect(agg.decisionIdsVerified).not.toContain(DECISION_IDS.created);
  });

  it("D-4102 supplier graph is not empty · procurement clarity", () => {
    resetDecisionStore();
    const s = getDecisionRecord(DECISION_IDS.supplier)!;
    expect(s.graph.nodes.length).toBeGreaterThanOrEqual(5);
    expect(s.silenceNote ?? s.contextLine).toMatch(/D-7501|NOT|tuna|beverage/i);
  });

  it("Estate wine transfer brief is transferable with Decision href", () => {
    const b = getTransferBrief("xfer_wine_hamburg");
    expect(b?.transferability).toBe("HIGH");
    expect(b?.decisionHref).toBeTruthy();
    expect(b?.differences.length).toBeGreaterThan(0);
  });

  it("ExperienceComposer prioritizes roles differently", () => {
    const gm = composeControlCenterExperience({
      role: "gm",
      locationScope: "loc_berlin_mitte",
      vertical: "restaurant",
    });
    const coo = composeControlCenterExperience({
      role: "coo",
      locationScope: "all",
      vertical: "restaurant",
    });
    expect(gm.decisionPriorityIds[0]).toBe(DECISION_IDS.peak);
    expect(coo.decisionPriorityIds[0]).toBe(DECISION_IDS.labor);
  });

  it("Header brief judgment count matches selectNeedsJudgment", () => {
    resetDecisionStore();
    const brief = composeControlCenterBrief({
      role: "gm",
      vertical: "restaurant",
      locationId: "loc_berlin_mitte",
    });
    const n = selectNeedsJudgment({
      role: "gm",
      vertical: "restaurant",
      locationId: "loc_berlin_mitte",
    }).length;
    expect(brief.needsYouCount).toBe(n);
  });
});
