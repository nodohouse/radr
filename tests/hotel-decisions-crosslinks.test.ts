import { describe, expect, it } from "vitest";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { houseReadinessModel } from "@/lib/radr/product/houseReadiness";
import { hotelControlCenterViewModel } from "@/lib/radr/product/hotelControlCenter";
import { hotelNeedsYouDecisions } from "@/lib/radr/demo/hotelDecisions";
import { lessonsForLocation } from "@/lib/radr/product/locationMemory";
import { policyRefForDecision } from "@/lib/radr/product/demoSettings";
import {
  HOTEL_READINESS_CANON,
  hotelCrossLinksFor,
} from "@/lib/product/decisionsWorkspace/hotelCrossLinks";
import { getDecisionsWorkspace } from "@/lib/product/decisionsWorkspace";

describe("Hotel D-H-9201 cross-product canon", () => {
  const id = DECISION_IDS.hotelReadiness;

  it("display id is D-H-9201 everywhere", () => {
    expect(displayDecisionId(id)).toBe("D-H-9201");
    expect(
      hotelNeedsYouDecisions().find((d) => d.id === id)?.displayId,
    ).toBe("D-H-9201");
  });

  it("Control Center · House Readiness · Decisions share economics", () => {
    const cc = hotelControlCenterViewModel();
    const house = houseReadinessModel();
    const ledger = getDecisionsWorkspace("hotels");
    const detail = ledger.details[id]!;

    expect(cc.activeDecision?.id).toBe(id);
    expect(cc.activeDecision?.confidence).toBe(81);
    expect(cc.exposureEuro).toBe(1840);
    expect(cc.verified.totalEuro).toBe(6710);

    expect(house.recommendation.decisionId).toBe(id);
    expect(house.recommendation.confidence).toBe(81);
    expect(house.recommendation.valueProtected).toBe(1840);

    expect(detail.confidence).toBe(81);
    expect(detail.expected).toBe("+€1,840");
    expect(detail.deadline).toBe("14:40");
  });

  it("cross-links hit Intelligence · Policy · Data Health · Memory · Value", () => {
    const links = hotelCrossLinksFor(id);
    const hrefs = links.map((l) => l.href);
    expect(hrefs.some((h) => h.includes("/app/intelligence"))).toBe(true);
    expect(hrefs.some((h) => h.includes("policy=housekeeping_reassign"))).toBe(
      true,
    );
    expect(hrefs.some((h) => h.includes("/app/data-health"))).toBe(true);
    expect(hrefs.some((h) => h.includes("/app/memory"))).toBe(true);
    expect(hrefs.some((h) => h.includes("/app/value"))).toBe(true);
    expect(hrefs.some((h) => h.includes("/app/service"))).toBe(true);
  });

  it("Memory lesson and Settings policy point at same Decision", () => {
    const lesson = lessonsForLocation("loc_canal_house").find(
      (l) => l.id === "mem_canal_hk",
    );
    expect(lesson?.relatedDecisionId).toBe(id);
    const policy = policyRefForDecision({
      id,
      decisionType: "housekeeping_reassign",
    });
    expect(policy.policyId).toBe("housekeeping_reassign");
  });

  it("canon constants stay property-scale", () => {
    expect(HOTEL_READINESS_CANON.exposureEuro).toBe(1840);
    expect(HOTEL_READINESS_CANON.confidence).toBe(81);
    expect(HOTEL_READINESS_CANON.verifiedMtdEuro).toBe(6710);
  });
});
