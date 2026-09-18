/**
 * GTM integrity — Verified aggregates, Autopilot orthogonality, Recover Trace.
 */

import { describe, it, expect } from "vitest";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getDecisionRecord, listDecisionRecords } from "@/lib/radr/decision/store";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import {
  assertVerifiedReconciles,
  canonicalVerifiedTotal,
  decisionVerifiedAmount,
  roleViewForLabRole,
} from "@/lib/radr/product/verifiedValueCanon";
import { autopilotForSeed, AUTOPILOT_LADDER } from "@/components/product/lab/labAutopilot";
import { ROLE_PRESETS } from "@/components/product/lab/labModules";

describe("verified value canon", () => {
  it("every role aggregate equals sum of verified records in scope", () => {
    for (const role of ["gm", "cfo", "coo"] as const) {
      const check = assertVerifiedReconciles(role);
      expect(check.ok, `${role}: ${check.aggregate} !== ${check.sum}`).toBe(
        true,
      );
      expect(canonicalVerifiedTotal(role)).toBe(check.sum);
    }
  });

  it("CFO and GM totals differ by scope — never a single hardcoded ladder", () => {
    const gm = canonicalVerifiedTotal("gm");
    const cfo = canonicalVerifiedTotal("cfo");
    expect(cfo).toBeGreaterThan(gm);
    expect(cfo).not.toBe(2830);
    expect(gm).not.toBe(5830);
  });

  it("D-4102 Verified recovered €273 is included in CFO aggregate", () => {
    const r = getDecisionRecord(DECISION_IDS.supplier)!;
    expect(r.verifiedValue?.amount).toBe(273);
    expect(r.verifiedValue?.kind).toBe("recovered");
    expect(decisionVerifiedAmount(DECISION_IDS.supplier)).toBe(273);
    const agg = deriveValueAggregate("cfo");
    expect(agg.decisionIdsVerified).toContain(DECISION_IDS.supplier);
    expect(agg.verifiedByKind.recovered).toBeGreaterThanOrEqual(273);
  });

  it("no duplicate supplier verified records", () => {
    const verified = listDecisionRecords().filter(
      (r) => r.id === DECISION_IDS.supplier && r.verifiedValue,
    );
    expect(verified).toHaveLength(1);
  });

  it("lab role mapping uses consistent RoleView scopes", () => {
    expect(roleViewForLabRole("gm")).toBe("gm");
    expect(roleViewForLabRole("cfo")).toBe("cfo");
    expect(roleViewForLabRole("clevel")).toBe("coo");
    expect(ROLE_PRESETS.cfo.note.toLowerCase()).not.toContain("ladder");
    // Center and Value must agree: clevel uses portfolio (coo), not Berlin-only (gm)
    expect(canonicalVerifiedTotal(roleViewForLabRole("clevel"))).toBe(
      canonicalVerifiedTotal("coo"),
    );
    expect(canonicalVerifiedTotal(roleViewForLabRole("clevel"))).not.toBe(
      canonicalVerifiedTotal("gm"),
    );
  });
});

describe("autopilot orthogonal to verified lifecycle", () => {
  it("ladder is Suggest · Stage · Auto — never Verified", () => {
    expect(AUTOPILOT_LADDER.map((s) => s.label)).toEqual([
      "Suggest",
      "Stage",
      "Auto",
    ]);
    expect(AUTOPILOT_LADDER.some((s) => /verified/i.test(s.label))).toBe(
      false,
    );
  });

  it("recover Autopilot is Stage with always-ask financial commitments", () => {
    const m = autopilotForSeed("recover", true);
    expect(m.level).toBe(2);
    expect(m.levelLabel).toBe("Stage");
    expect(m.levelLabel.toLowerCase()).not.toContain("verified");
    const send = m.policy.find((p) => p.id === "send");
    expect(send?.mode).toBe("ask");
    expect(m.receipt?.verified.toLowerCase()).toContain("273");
    expect(m.receipt).toHaveProperty("executed");
    expect(m.receipt).not.toHaveProperty("staged");
  });

  it("Expected vs Verified stay distinct on margin-response", () => {
    const m = autopilotForSeed("margin-response", false);
    expect(m.levelLabel).toBe("Suggest");
    expect(m.because.toLowerCase()).toContain("expected");
    expect(m.receipt).toBeUndefined();
  });
});
