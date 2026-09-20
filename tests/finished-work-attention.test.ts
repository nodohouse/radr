import { describe, expect, it, beforeEach } from "vitest";
import {
  computeSinceLastCheck,
  demoSeedSnapshot,
  memoryAttentionStore,
} from "@/lib/radr/attentionState";
import {
  createActionFromFinding,
  __resetActionMemory,
  getAction,
  listActionsForFinding,
  transitionAction,
} from "@/lib/radr/actions/service";
import { findingsForScope } from "@/lib/radr/findings";
import {
  attentionNowFindings,
  currentExposureFromFindings,
  operatorAttentionState,
  verifiedFromFindings,
} from "@/lib/radr/valueSemantics";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";
import { MATERIAL_AT_RISK, VALUE_AT_RISK } from "@/lib/radr/demoModel";
import { berlinTerraceOpportunity } from "@/lib/radr/weather/calc";

describe("finished work / attention system pass", () => {
  beforeEach(() => {
    __resetActionMemory();
    memoryAttentionStore.write(demoSeedSnapshot());
  });

  it("unresolved exposure is 290 + 118 = 408; verified 184 excluded", () => {
    const findings = findingsForScope("loc_ber");
    const open = attentionNowFindings(findings);
    expect(open).toHaveLength(2);
    expect(currentExposureFromFindings(findings)).toBe(408);
    expect(MATERIAL_AT_RISK).toBe(408);
    expect(VALUE_AT_RISK).toBe(408);
    expect(verifiedFromFindings(findings) || getVerifiedValueFromScenarios().verified).toBe(
      184,
    );
    expect(open.every((f) => f.status !== "VERIFIED")).toBe(true);
  });

  it("weather opportunity reconciles to 420 gross / 72 cost / 348 net", () => {
    const opp = berlinTerraceOpportunity();
    expect(opp.grossOpportunity).toBe(420);
    expect(opp.laborCostToCapture).toBe(72);
    expect(opp.netOpportunity).toBe(348);
    const wx = findingsForScope("loc_ber").find(
      (f) => f.category === "weather_sensitive_demand",
    );
    expect(wx).toBeTruthy();
    expect(wx!.financialImpact.primaryValue).toBe(420);
    expect(attentionNowFindings(findingsForScope("loc_ber")).some((f) => f.id === wx!.id)).toBe(
      false,
    );
  });

  it("ACT_NOW / TODAY prepared findings map to READY_FOR_APPROVAL", () => {
    const labor = findingsForScope("loc_ber").find((f) => f.territory === "LABOR")!;
    expect(operatorAttentionState(labor)).toBe("READY_FOR_APPROVAL");
    const buy = findingsForScope("loc_ber").find((f) => f.territory === "BUY")!;
    expect(operatorAttentionState(buy)).toBe("READY_FOR_APPROVAL");
  });

  it("since last check surfaces handled / approval / verified lines", () => {
    const findings = findingsForScope("loc_ber");
    const since = computeSinceLastCheck(findings, demoSeedSnapshot());
    expect(since.needsYou).toBe(2);
    expect(since.decisionsReady).toBeGreaterThanOrEqual(1);
    expect(since.recoveredValue).toBe(184);
    expect(since.lines.some((l) => /Verified Value/i.test(l))).toBe(true);
    expect(since.lines.some((l) => /approval/i.test(l))).toBe(true);
    expect(since.events.length).toBeGreaterThan(0);
  });

  it("prepared action stays DRAFT_ONLY and separate from executed", () => {
    const labor = findingsForScope("loc_ber").find((f) => f.territory === "LABOR")!;
    const action = createActionFromFinding(labor, "test_op", "act_labor_test");
    expect(action.status).toBe("PROPOSED");
    expect(action.executionCapability).toBe("DRAFT_ONLY");
    expect(action.expectedCost).toBe(labor.recommendation.expectedCost);
    expect(action.expectedBenefit).toBe(labor.recommendation.expectedBenefit);
    expect(action.requiredApproverRole).toBe("GM");
    expect(listActionsForFinding(labor.id)).toHaveLength(1);

    const approved = transitionAction(action.id, "ACCEPTED");
    expect(approved?.status).toBe("ACCEPTED");
    expect(getAction(action.id)?.executionCapability).toBe("DRAFT_ONLY");
  });

  it("supplier discrepancy reconciles to €118", () => {
    const buy = findingsForScope("loc_ber").find((f) => f.territory === "BUY")!;
    expect(buy.financialImpact.primaryValue).toBe(118);
  });
});
