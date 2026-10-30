/**
 * One Decision store — ledger IDs match Decision Record (D-1911 / D-H-9201).
 */
import { describe, expect, it } from "vitest";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { getDecisionsWorkspace } from "@/lib/product/decisionsWorkspace";
import { D1911_CC_DECISION } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { HOTEL_READINESS_CANON } from "@/lib/product/decisionsWorkspace/hotelCrossLinks";

describe("one-product Decision catalog", () => {
  it("restaurant ledger defaults to D-1911 / dec_peak_berlin", () => {
    const ws = getDecisionsWorkspace("restaurants");
    expect(ws.defaultDecisionId).toBe(DECISION_IDS.peak);
    expect(ws.judgment.some((r) => r.id === DECISION_IDS.peak)).toBe(true);
    expect(ws.judgment.some((r) => r.id === "dec_labor_schedule")).toBe(false);

    const detail = ws.details[DECISION_IDS.peak];
    expect(detail).toBeTruthy();
    expect(detail!.id).toBe(DECISION_IDS.peak);
    expect(detail!.confidence).toBe(D1911_CC_DECISION.confidencePct);
    expect(detail!.expected).toBe("+$620");
    expect(detail!.deadline).toBe(D1911_CC_DECISION.deadlineLabel);

    const record = getDecisionRecord(DECISION_IDS.peak)!;
    expect(record.id).toBe(detail!.id);
    expect(displayDecisionId(record.id)).toBe("D-1911");
    expect(record.expectedContributionImpact).toBe(
      D1911_CC_DECISION.expectedEuro,
    );
  });

  it("hotel ledger keeps D-H-9201 with shared economics", () => {
    const ws = getDecisionsWorkspace("hotels");
    expect(ws.defaultDecisionId).toBe(DECISION_IDS.hotelReadiness);
    const row = ws.judgment.find((r) => r.id === DECISION_IDS.hotelReadiness);
    expect(row).toBeTruthy();
    const detail = ws.details[DECISION_IDS.hotelReadiness]!;
    expect(detail.confidence).toBe(HOTEL_READINESS_CANON.confidence);
    expect(detail.expected).toMatch(/1,?840/);
    expect(detail.deadline).toBe(HOTEL_READINESS_CANON.deadline);

    const record = getDecisionRecord(DECISION_IDS.hotelReadiness)!;
    expect(record.id).toBe(DECISION_IDS.hotelReadiness);
    expect(displayDecisionId(record.id)).toBe("D-H-9201");
  });

  it("restaurant peers map onto Record IDs", () => {
    const ws = getDecisionsWorkspace("restaurants");
    const ids = [
      ...ws.judgment.map((r) => r.id),
      ...ws.motion.map((r) => r.id),
      ...ws.resolved.map((r) => r.id),
    ];
    expect(ids).toContain(DECISION_IDS.labor);
    expect(ids).toContain(DECISION_IDS.tableRecover);
    expect(ids).toContain(DECISION_IDS.supplier);
    for (const id of [
      DECISION_IDS.peak,
      DECISION_IDS.labor,
      DECISION_IDS.tableRecover,
      DECISION_IDS.supplier,
    ]) {
      expect(getDecisionRecord(id)).toBeTruthy();
      expect(ws.details[id]?.id).toBe(id);
    }
  });
});
