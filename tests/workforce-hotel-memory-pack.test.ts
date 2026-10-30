import { describe, expect, it } from "vitest";
import { buildLaborDecisionRecord } from "@/lib/radr/decision/demos/labor";
import { buildHotelReadinessDecisionRecord } from "@/lib/radr/decision/demos/hotelReadiness";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { getDecisionRecord, resetDecisionStore } from "@/lib/radr/decision/store";
import {
  policyRefForDecision,
  settingsPolicyHref,
} from "@/lib/radr/product/demoSettings";
import { getTransferBrief } from "@/lib/radr/product/transferBrief";

describe("D-1920 Workforce Decision", () => {
  it("builds peer Decision Room from CANON_LABOR", () => {
    const r = buildLaborDecisionRecord("LEARNED");
    expect(r.id).toBe(DECISION_IDS.labor);
    expect(displayDecisionId(r.id)).toBe("D-1920");
    expect(r.options.length).toBeGreaterThanOrEqual(5);
    expect(r.options.find((o) => o.recommended)?.id).toBe("rebalance");
    expect(r.operatingStateSnapshot?.length).toBeGreaterThan(0);
    expect(r.constraints?.length).toBeGreaterThan(0);
    expect(r.verifiedValue?.amount).toBe(690);
    expect(r.lesson).toMatch(/FOH/i);
  });

  it("is seeded in the decision store", () => {
    resetDecisionStore();
    const r = getDecisionRecord(DECISION_IDS.labor);
    expect(r?.status).toBe("LEARNED");
    expect(r?.attentionOverride).toBe("learned");
  });
});

describe("D-HK-1402 Hotel readiness peer fields", () => {
  it("exposes operating state + constraints", () => {
    const r = buildHotelReadinessDecisionRecord();
    expect(r.operatingStateSnapshot?.length).toBeGreaterThan(0);
    expect(r.relationshipChain?.length).toBeGreaterThan(0);
    expect(r.constraints?.length).toBeGreaterThan(0);
    expect(r.decisionType).toBe("housekeeping_reassign");
  });
});

describe("Settings policy deep-links", () => {
  it("maps Decisions to governing policies", () => {
    expect(policyRefForDecision({ id: DECISION_IDS.peak }).policyId).toBe(
      "service_capacity",
    );
    expect(policyRefForDecision({ id: DECISION_IDS.labor }).policyId).toBe(
      "labor_rebalance",
    );
    expect(
      policyRefForDecision({ id: DECISION_IDS.hotelReadiness }).policyId,
    ).toBe("housekeeping_reassign");
    expect(policyRefForDecision({ id: DECISION_IDS.ota }).policyId).toBe(
      "hotel_channel_hold",
    );
    expect(
      settingsPolicyHref("labor_rebalance"),
    ).toContain("policy=labor_rebalance");
  });
});

describe("Estate transfer briefs", () => {
  it("carries decisionHref for transferable patterns", () => {
    expect(getTransferBrief("xfer_wine_hamburg")?.decisionHref).toContain(
      "dec_playbook_group",
    );
    expect(getTransferBrief("xfer_delivery_throttle")?.decisionHref).toContain(
      "dec_labor_berlin",
    );
    expect(getTransferBrief("xfer_hk_reprio")?.decisionHref).toContain(
      "dec_hotel_readiness_canal",
    );
  });
});
