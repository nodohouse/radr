import { describe, expect, it } from "vitest";
import { resetDecisionStore, getDecisionRecord } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { incrementalVsNoActionEuro } from "@/lib/radr/decision/economics/moneyImpact";

function optionBlob(id: string): string {
  const r = getDecisionRecord(id)!;
  return r.options.map((o) => `${o.id} ${o.title}`).join(" ").toLowerCase();
}

describe("Domain Futures (no generic reuse)", () => {
  it("D-1911 Peak options include Wait/Seat/Throttle with incremental €", () => {
    resetDecisionStore();
    const peak = getDecisionRecord(DECISION_IDS.peak)!;
    expect(peak.options.length).toBeGreaterThanOrEqual(3);
    const blob = optionBlob(DECISION_IDS.peak);
    expect(blob).toMatch(/wait/);
    expect(blob).toMatch(/seat/);
    expect(blob).toMatch(/kill|throttle|refuse/);
    const wait = peak.options.find((o) => /wait/i.test(o.id + o.title))!;
    const incr = incrementalVsNoActionEuro(peak, wait.id);
    expect(incr == null || typeof incr === "number").toBe(true);
  });

  it("D-8204 Caster options are supply/prep — not Peak seat matrix", () => {
    resetDecisionStore();
    const blob = optionBlob(DECISION_IDS.casterSugar);
    expect(blob).not.toMatch(/seat walk-ins|wait 12 min · throttle/);
    expect(blob).toMatch(/top-?up|transfer|prep|accept|risk|courier/i);
  });

  it("D-1920 Labor options are workforce — not Peak seat matrix", () => {
    resetDecisionStore();
    const blob = optionBlob(DECISION_IDS.labor);
    expect(blob).not.toMatch(/seat walk-ins|wait 12 min · throttle/);
    expect(blob).toMatch(/rebalance|agency|overtime|cut|hold|staff/i);
  });

  it("D-HK-1402 Readiness options are hotel HK — not restaurant Peak", () => {
    resetDecisionStore();
    const blob = optionBlob(DECISION_IDS.hotelReadiness);
    expect(blob).not.toMatch(/seat walk-ins|wait 12 min · throttle/);
    expect(blob).toMatch(/reassign|hk|housekeep|arrival|ready|hold|reduce/i);
  });
});
