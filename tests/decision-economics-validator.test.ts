import { describe, expect, it } from "vitest";
import {
  D1911_ECONOMICS,
  D1911_TRAJECTORY_INCREMENTAL,
  validateDecisionEconomics,
  validateSeededDecisionEconomics,
} from "@/lib/radr/decision/economics/validator";
import {
  getDecisionRecord,
  resetDecisionStore,
  approveDecision,
  advanceDecision,
} from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  applyDecisionStatusToHouse,
  assertHouseTemporalIntegrity,
  houseAttentionFor,
  houseAttentionFromDecisionStatus,
} from "@/lib/radr/product/houseAttention";
import { DEMO_POLICIES, DEFAULT_DEMO_SETTINGS } from "@/lib/radr/product/demoSettings";

describe("DecisionEconomicsValidator", () => {
  it("validates D-1911 seeded economics with zero issues", () => {
    const issues = validateSeededDecisionEconomics();
    expect(issues).toEqual([]);
  });

  it("primary Future metric is incrementalVsBaseline €620", () => {
    const wait = D1911_ECONOMICS.options.find((o) => o.id === "wait_12")!;
    expect(wait.economics.primaryFutureMetric).toBe("incrementalVsBaseline");
    expect(wait.economics.incrementalVsBaseline).toBe(620);
    expect(D1911_ECONOMICS.headlinePrimaryEuro).toBe(620);
    expect(D1911_TRAJECTORY_INCREMENTAL.wait["+60"]).toBe(620);
    expect(D1911_TRAJECTORY_INCREMENTAL.seat["+60"]).toBe(0);
    expect(D1911_TRAJECTORY_INCREMENTAL.kill["+60"]).toBe(180);
  });

  it("rejects mismatched headline", () => {
    const bad = {
      ...D1911_ECONOMICS,
      headlinePrimaryEuro: 410,
    };
    const issues = validateDecisionEconomics(bad);
    expect(issues.some((i) => i.code === "headline_mismatch")).toBe(true);
  });
});

describe("D-8204 caster sugar store wiring", () => {
  it("seeds AWAITING_APPROVAL and transitions with builder", () => {
    resetDecisionStore();
    const r = getDecisionRecord(DECISION_IDS.casterSugar)!;
    expect(r).toBeTruthy();
    expect(r.status).toBe("AWAITING_APPROVAL");
    expect(r.id).toBe(DECISION_IDS.casterSugar);
    expect(r.title).toMatch(/caster sugar/i);
    approveDecision(DECISION_IDS.casterSugar, "topup");
    expect(getDecisionRecord(DECISION_IDS.casterSugar)!.status).toBe("APPROVED");
    advanceDecision(DECISION_IDS.casterSugar, "OBSERVING");
    expect(getDecisionRecord(DECISION_IDS.casterSugar)!.status).toBe("OBSERVING");
    advanceDecision(DECISION_IDS.casterSugar, "VERIFIED");
    expect(getDecisionRecord(DECISION_IDS.casterSugar)!.status).toBe("VERIFIED");
  });

  it("house attention derives from DecisionRecord status", () => {
    expect(houseAttentionFromDecisionStatus("AWAITING_APPROVAL")).toBe(
      "needs_you",
    );
    expect(houseAttentionFromDecisionStatus("APPROVED")).toBe("handling");
    expect(houseAttentionFromDecisionStatus("OBSERVING")).toBe("verifying");
    expect(houseAttentionFromDecisionStatus("VERIFIED")).toBe("verified");

    const base = houseAttentionFor("restaurant");
    const handling = applyDecisionStatusToHouse(base, {
      [DECISION_IDS.casterSugar]: "APPROVED",
    });
    const sugar = handling.gaps.find((g) => g.id === "gap_sugar_berlin")!;
    expect(sugar.attention).toBe("handling");
    expect(assertHouseTemporalIntegrity(handling)).toEqual([]);
  });
});

describe("demoSettings policies", () => {
  it("includes all six named policies and GM €250", () => {
    expect(DEMO_POLICIES.map((p) => p.name)).toEqual(
      expect.arrayContaining([
        "SERVICE CAPACITY",
        "SUPPLIER EMERGENCY ORDER",
        "MENU PRICE CHANGE",
        "DELIVERY THROTTLE",
        "HOUSEKEEPING REASSIGNMENT",
        "HOTEL CHANNEL INVENTORY HOLD",
      ]),
    );
    expect(DEFAULT_DEMO_SETTINGS.approvalGmMax).toBe(250);
    expect(DEMO_POLICIES.every((p) => p.scope && p.threshold && p.approvers)).toBe(
      true,
    );
  });
});
