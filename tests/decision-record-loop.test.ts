/**
 * Decision Record loop — lifecycle, escalation, verification, demos.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  canTransition,
  attentionBandOf,
  lifecycleIndex,
} from "@/lib/radr/decision/lifecycle";
import { evaluatePatternStage } from "@/lib/radr/decision/pattern";
import { computeRegret } from "@/lib/radr/decision/counterfactual";
import { projectDecision, projectDecisionForBrief } from "@/lib/radr/decision/project";
import {
  buildTunaDecisionRecord,
  buildTunaStructuralDecision,
  applySupplierFailure,
} from "@/lib/radr/decision/demos/tuna";
import { buildOtaDecisionRecord } from "@/lib/radr/decision/demos/ota";
import { buildOrphanDecisionRecord } from "@/lib/radr/decision/demos/orphan";
import {
  resetDecisionStore,
  approveDecision,
  verifyDecision,
  learnDecision,
  getDecisionRecord,
  failSupplierAndFallback,
  listDecisionRecords,
} from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { resolveAutonomyLevel } from "@/lib/radr/decision/autonomy";

describe("Decision lifecycle", () => {
  it("allows forward transitions and approve override revert", () => {
    expect(canTransition("AWAITING_APPROVAL", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "VERIFIED")).toBe(true);
    expect(canTransition("APPROVED", "AWAITING_APPROVAL")).toBe(true);
    expect(canTransition("VERIFIED", "DETECTED")).toBe(false);
    expect(lifecycleIndex("LEARNED")).toBeGreaterThan(
      lifecycleIndex("RECOMMENDED"),
    );
  });

  it("maps attention bands from lifecycle", () => {
    expect(attentionBandOf("AWAITING_APPROVAL")).toBe("needs_you");
    expect(attentionBandOf("EXECUTING")).toBe("handling");
    expect(attentionBandOf("PREDICTED")).toBe("watching");
    expect(attentionBandOf("VERIFIED")).toBe("verified");
  });
});

describe("Pattern escalation", () => {
  it("escalates tuna 7/12 to STRUCTURAL", () => {
    const stage = evaluatePatternStage({
      incidentCount: 7,
      windowSize: 12,
      similarity: 0.88,
      financialExposureEuro: 8420,
    });
    expect(stage).toBe("STRUCTURAL");
  });

  it("stays INCIDENT for a single event", () => {
    expect(
      evaluatePatternStage({
        incidentCount: 1,
        windowSize: 12,
        similarity: 1,
        financialExposureEuro: 1840,
      }),
    ).toBe("INCIDENT");
  });
});

describe("Closed-loop demos", () => {
  it("tuna record has ledger, options, memory, and structural debt", () => {
    const r = buildTunaDecisionRecord("AWAITING_APPROVAL");
    expect(r.id).toBe(DECISION_IDS.tuna);
    expect(r.ledger.length).toBeGreaterThanOrEqual(5);
    expect(r.options.some((o) => o.recommended)).toBe(true);
    expect(r.recommendedOptionId).toBe("feature_swap");
    expect(r.pattern?.stage).toBe("STRUCTURAL");
    expect(r.debt?.cumulativeExposureEuro).toBe(8420);
    expect(r.memory?.recommendedOptionId).toBe("feature_swap");
    expect(r.valueDecayCurve?.length).toBeGreaterThan(0);
  });

  it("tuna verify closes with protected value and learning", () => {
    const r = buildTunaDecisionRecord("LEARNED");
    expect(r.verifiedValue?.amount).toBe(1590);
    expect(r.verifiedValue?.kind).toBe("protected");
    expect(r.verificationMethod).toBe("POS_TRANSACTION");
    expect(r.lesson).toMatch(/feature-swap/i);
    expect(r.playbookImpact).toBeTruthy();
  });

  it("ota and orphan demos complete the loop", () => {
    const ota = buildOtaDecisionRecord("LEARNED");
    expect(ota.id).toBe(DECISION_IDS.ota);
    expect(ota.verifiedValue?.kind).toBe("protected");
    expect(ota.verificationMethod).toBe("PMS_BOOKING");

    const orphan = buildOrphanDecisionRecord("LEARNED");
    expect(orphan.id).toBe(DECISION_IDS.orphan);
    expect(orphan.verifiedValue?.amount).toBe(40);
    expect(orphan.verifiedValue?.kind).toBe("recovered");
    expect(orphan.lesson).toMatch(/net contribution|direct|fill/i);
  });

  it("structural decision links from tuna pattern", () => {
    const s = buildTunaStructuralDecision();
    expect(s.id).toBe(DECISION_IDS.tunaStructural);
    expect(s.decisionHorizon).toBe("STRUCTURAL");
    expect(s.relatedEntities.some((e) => e.id === DECISION_IDS.tuna)).toBe(
      true,
    );
  });

  it("supplier failure activates fallback without fake writes", () => {
    const base = buildTunaDecisionRecord("APPROVED");
    const failed = applySupplierFailure(base);
    expect(failed.actionPlan.steps.some((s) => s.status === "FAILED")).toBe(
      true,
    );
    expect(
      failed.actionPlan.steps.every((s) => s.preparedOnly),
    ).toBe(true);
    expect(failed.ledger.some((e) => /fallback/i.test(e.title))).toBe(true);
  });
});

describe("Verification money kinds", () => {
  it("does not double-count exposed + verified on projection", () => {
    const verified = buildTunaDecisionRecord("VERIFIED");
    const card = projectDecision(verified);
    expect(card.exposed).toBeUndefined();
    expect(card.verified?.amount).toBe(1590);
    expect(card.status).toBe("verified");
  });

  it("projects shared IDs for brief", () => {
    const card = projectDecisionForBrief(
      buildTunaDecisionRecord("AWAITING_APPROVAL"),
    );
    expect(card.id).toBe(DECISION_IDS.tuna);
    expect(card.options?.some((o) => o.recommended)).toBe(true);
  });
});

describe("Decision regret (internal)", () => {
  it("computes regret vs estimated best alternative", () => {
    const regret = computeRegret({
      chosenOptionId: "supplier_first",
      chosenActualEuro: 1520,
      options: [
        {
          id: "supplier_first",
          title: "Supplier",
          expectedContributionEuro: 1520,
          guestImpact: "none",
          operationalRisk: "medium",
          confidence: 74,
          timeToResult: "40m",
          note: "",
        },
        {
          id: "feature_swap",
          title: "Feature",
          expectedContributionEuro: 1640,
          guestImpact: "low",
          operationalRisk: "low",
          confidence: 81,
          timeToResult: "now",
          note: "",
        },
      ],
    });
    expect(regret?.regretEuro).toBe(120);
  });
});

describe("Decision store", () => {
  beforeEach(() => {
    resetDecisionStore("restaurant");
  });

  it("approve → verify → learn on peak flagship", () => {
    const approved = approveDecision(DECISION_IDS.peak);
    expect(approved?.status).toBe("APPROVED");
    expect(attentionBandOf(approved!.status)).toBe("handling");

    const verified = verifyDecision(DECISION_IDS.peak);
    expect(verified?.verifiedValue?.amount).toBeTruthy();

    const learned = learnDecision(DECISION_IDS.peak);
    expect(learned?.status).toBe("LEARNED");
    expect(learned?.lesson).toBeTruthy();
  });

  it("lists needs_you before approve", () => {
    const needs = listDecisionRecords({ band: "needs_you" });
    expect(needs.some((r) => r.id === DECISION_IDS.peak)).toBe(true);
  });

  it("failSupplierAndFallback records provider failure", () => {
    const failed = failSupplierAndFallback(DECISION_IDS.tuna);
    expect(failed?.actionPlan.steps.some((s) => s.status === "FAILED")).toBe(
      true,
    );
  });

  it("portfolio keeps peak + ota + orphan without vertical wipe", () => {
    const peak = getDecisionRecord(DECISION_IDS.peak)!;
    expect(peak.whyBlocks.length).toBeGreaterThanOrEqual(3);
    expect(peak.ledger.length).toBeGreaterThan(0);

    const ota = getDecisionRecord(DECISION_IDS.ota)!;
    expect(ota.options.length).toBeGreaterThanOrEqual(3);

    const orphan = getDecisionRecord(DECISION_IDS.orphan)!;
    expect(orphan.playbook?.id || orphan.verifiedValue).toBeTruthy();

    resetDecisionStore("hotel");
    expect(getDecisionRecord(DECISION_IDS.peak)?.id).toBe(DECISION_IDS.peak);
  });
});

describe("Autonomy", () => {
  it("never fully autonomous types cap at one-tap", () => {
    const level = resolveAutonomyLevel({
      decisionType: "allergy_confirmation",
      level: 5,
      risk: "high",
      reversibility: "hard",
      neverFullyAutonomous: true,
      reason: "Human required",
    });
    expect(level).toBeLessThanOrEqual(3);
  });
});

describe("Value decay ranking input", () => {
  it("tuna deadline curve decays toward zero by peak", () => {
    const r = buildTunaDecisionRecord();
    const last = r.valueDecayCurve![r.valueDecayCurve!.length - 1]!;
    expect(last.valueEuro).toBe(0);
    expect(r.valueDecayCurve![0]!.valueEuro).toBeGreaterThan(last.valueEuro);
  });
});
