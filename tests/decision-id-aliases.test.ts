import { describe, expect, it } from "vitest";
import {
  isDecisionIdAlias,
  resolveCanonicalDecisionId,
} from "@/lib/radr/decision/aliases";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";
import { getDecisionRecord } from "@/lib/radr/decision/store";
import { getDecisionsWorkspace } from "@/lib/product/decisionsWorkspace";
import { resolveDecisionContext } from "@/lib/product/radrContext/resolveEntityContext";

describe("Decision ID aliases", () => {
  it("HOTEL_DECISION_IDS.channel is the OTA Record", () => {
    expect(HOTEL_DECISION_IDS.channel).toBe(DECISION_IDS.ota);
    expect(displayDecisionId(DECISION_IDS.ota)).toBe("D-2201");
    expect(getDecisionRecord(DECISION_IDS.ota)).toBeTruthy();
  });

  it("resolves near-miss hotel channel ids", () => {
    for (const alias of [
      "dec_hotel_channel_canal",
      "dec_hotel_ota_close_canal",
      "dec_hotel_ota",
    ]) {
      expect(isDecisionIdAlias(alias)).toBe(true);
      expect(resolveCanonicalDecisionId(alias)).toBe(DECISION_IDS.ota);
    }
  });

  it("resolves legacy restaurant workspace labor id", () => {
    expect(resolveCanonicalDecisionId("dec_labor_schedule")).toBe(
      DECISION_IDS.labor,
    );
  });

  it("hotel ledger uses canonical OTA id", () => {
    const ws = getDecisionsWorkspace("hotels");
    expect(ws.judgment.some((r) => r.id === DECISION_IDS.ota)).toBe(true);
    expect(
      ws.judgment.some((r) => r.id === "dec_hotel_ota_close_canal"),
    ).toBe(false);
  });

  it("resolveDecisionContext follows aliases", () => {
    const ctx = resolveDecisionContext("dec_hotel_ota_close_canal")!;
    expect(ctx.decisionId).toBe(DECISION_IDS.ota);
    expect(ctx.vertical).toBe("hotel");
    expect(ctx.scopeId).toBe("loc_canal_house");
  });
});
