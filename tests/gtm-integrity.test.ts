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

describe("problem families domain", () => {
  it("defines five families with Recover progression stages", async () => {
    const {
      PROBLEM_FAMILIES,
      PROBLEM_FAMILY_DEFS,
      pilotFamilies,
      PROGRESSION,
    } = await import("@/lib/radr/problemFamilies");
    expect(PROBLEM_FAMILIES).toEqual([
      "SUPPLIER_AP",
      "RECONCILIATION",
      "COST_VARIANCE",
      "PROCUREMENT",
      "PERISHABLE_REVENUE",
    ]);
    expect(pilotFamilies().map((d) => d.id)).toEqual([
      "SUPPLIER_AP",
      "RECONCILIATION",
    ]);
    expect(PROBLEM_FAMILY_DEFS.PERISHABLE_REVENUE.maturity).toBe("planned");
    expect(PROGRESSION.map((p) => p.stage)).toEqual([
      "RECOVER",
      "PREVENT",
      "OPTIMIZE",
      "AUTOPILOT",
    ]);
    expect(PROBLEM_FAMILY_DEFS.SUPPLIER_AP.verifies.toLowerCase()).toContain(
      "matched",
    );
  });

  it("supplier Decision record carries SUPPLIER_AP problemFamily", () => {
    const r = getDecisionRecord(DECISION_IDS.supplier)!;
    expect(r.problemFamily).toBe("SUPPLIER_AP");
    expect(r.economicState).toBe("VERIFIED");
    expect(r.verificationPath).toEqual(["supplier_credit", "ap_match"]);
    expect(r.alwaysAskActions).toContain("send_dispute");
  });
});

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

describe("pulse → Decision refs", () => {
  it("recover markers point at supplier Decision", async () => {
    const { RECOVER_MARKERS } = await import(
      "@/components/product/lab/labShiftPulse"
    );
    for (const m of RECOVER_MARKERS) {
      expect(m.decisionId).toBe(DECISION_IDS.supplier);
      expect(m.displayId).toBe("D-4102");
      expect(m.grade === "Verified" || m.grade === "Expected").toBe(true);
    }
  });

  it("restaurant turbulence markers reference peak Decision", async () => {
    const { RESTAURANT_MARKERS } = await import(
      "@/components/product/lab/labShiftPulse"
    );
    expect(RESTAURANT_MARKERS.length).toBeGreaterThan(0);
    for (const m of RESTAURANT_MARKERS) {
      expect(m.decisionId).toBeTruthy();
      expect(m.because.length).toBeGreaterThan(8);
    }
  });
});

describe("recover seed + brief scope", () => {
  it("recover seed defaults to Verified €273 supplier credit", async () => {
    const { deriveLab } = await import("@/components/product/lab/labState");
    const d = deriveLab({
      seed: "recover",
      mode: "live",
      selectedFuture: "wait_12",
      approved: false,
      operatorVip: false,
    } as never);
    expect(d.contribution).toBe(273);
    expect(d.moneyGrade).toBe("Verified");
    expect(d.decisionLabel).toMatch(/SUPPLIER CREDIT APPLIED/i);
  });

  it("service brief packets are role-scoped", async () => {
    const { briefForSeed, defaultPacketForRole } = await import(
      "@/components/product/lab/labServiceBrief"
    );
    const service = briefForSeed("service");
    expect(service.packets.foh).toBeTruthy();
    expect(service.packets.chef).toBeTruthy();
    expect(service.packets.gm).toBeTruthy();
    const recover = briefForSeed("recover");
    expect(recover.packets.cfo).toBeTruthy();
    expect(defaultPacketForRole("cfo")).toBe("cfo");
    expect(defaultPacketForRole("gm")).toBe("gm");
  });
});

describe("mobile phone states stay role-actionable", () => {
  it("HeroRadrPhone states cover urgent · brief · shift · recover", async () => {
    const src = await import("fs").then((fs) =>
      fs.promises.readFile(
        new URL(
          "../components/marketing/scenes/home/HeroRadrPhone.tsx",
          import.meta.url,
        ).pathname,
        "utf8",
      ),
    );
    expect(src).toContain('id: "cfo"');
    expect(src).toContain('id: "gm"');
    expect(src).toContain("€273");
    expect(src).toContain("€184");
    expect(src).toContain("CFO");
    expect(src).not.toContain("build an agent");
  });
});
