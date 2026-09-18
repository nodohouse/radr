/**
 * D-1911 Control Center → Record → context → approve → verify → memory journey.
 */

import { describe, expect, it, beforeEach } from "vitest";
import {
  resetDecisionStore,
  getDecisionRecord,
  listDecisionRecords,
  addOperatorContext,
  approveDecision,
  advanceDecision,
  verifyDecision,
  learnDecision,
  recordAttentionBand,
  heroRecordId,
} from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { controlCenterBundle } from "@/lib/radr/product/services";

describe("D-1911 portfolio E2E", () => {
  beforeEach(() => {
    resetDecisionStore();
  });

  it("seeds peak as Control Center hero needing you", () => {
    expect(heroRecordId()).toBe(DECISION_IDS.peak);
    const bundle = controlCenterBundle("gm");
    expect(bundle.urgent[0]?.id).toBe(DECISION_IDS.peak);
    expect(recordAttentionBand(bundle.urgent[0]!)).toBe("needs_you");
    expect(bundle.handling.some((r) => r.id === DECISION_IDS.tableRecover)).toBe(
      true,
    );
    expect(bundle.watching[0]?.id).toBe("watch_kitchen_berlin");
  });

  it("runs peak: context → approve → observe → verify → learn", () => {
    let r = getDecisionRecord(DECISION_IDS.peak)!;
    expect(r.recommendationHeadline).toMatch(/WAIT|12/i);

    r = addOperatorContext(DECISION_IDS.peak)!;
    expect(r.operatorContext?.length).toBeGreaterThan(0);

    r = approveDecision(DECISION_IDS.peak)!;
    expect(r.status).toBe("APPROVED");
    expect(recordAttentionBand(r)).toBe("handling");
    expect(
      listDecisionRecords({ band: "needs_you" }).some(
        (x) => x.id === DECISION_IDS.peak,
      ),
    ).toBe(false);

    r = advanceDecision(DECISION_IDS.peak, "OBSERVING")!;
    expect(["OBSERVING", "EXECUTING", "APPROVED"]).toContain(r.status);

    r = verifyDecision(DECISION_IDS.peak)!;
    expect(r.status).toBe("VERIFIED");
    expect(r.verifiedValue?.amount).toBe(590);
    expect(r.outcomeDetail?.observedContributionEuro).toBe(590);

    r = learnDecision(DECISION_IDS.peak)!;
    expect(r.status).toBe("LEARNED");
    expect(r.lesson).toBeTruthy();
    expect(recordAttentionBand(r)).toBe("learned");

    const needs = listDecisionRecords({ band: "needs_you" });
    expect(needs.some((x) => x.id === DECISION_IDS.peak)).toBe(false);
  });

  it("keeps multi-location portfolio without vertical wipe", () => {
    const ids = listDecisionRecords().map((r) => r.id);
    expect(ids).toContain(DECISION_IDS.peak);
    expect(ids).toContain(DECISION_IDS.ota);
    expect(ids).toContain(DECISION_IDS.orphan);
    expect(ids).toContain(DECISION_IDS.supplier);
    expect(ids).toContain(DECISION_IDS.playbook);
  });
});
