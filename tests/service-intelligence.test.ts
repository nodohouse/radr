import { describe, expect, it } from "vitest";
import {
  assertNoProtectedMoves,
  assertNoSeatedMoves,
  evaluateFloorOptimization,
} from "@/lib/radr/service/floorOptimizer";
import { rankDemandForOpportunity, canOfferRecovery } from "@/lib/radr/service/matchEngine";
import {
  berlinRecoverableOpportunities,
  berlinServiceReservations,
  berlinUnfulfilledDemand,
  getBerlinServiceUniverse,
  PROTECTED_TABLE_IDS,
} from "@/lib/radr/service/universe";
import { toServiceTableState } from "@/lib/radr/service/tableStates";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

describe("Service Intelligence", () => {
  it("shares one universe across Floor / Timeline / Recovery", () => {
    const u = getBerlinServiceUniverse();
    expect(u.reservations.length).toBeGreaterThan(3);
    expect(u.timeline.length).toBeGreaterThan(3);
    expect(u.opportunities.length).toBeGreaterThan(0);
    expect(u.decisionPeakId).toBe(DECISION_IDS.peak);
    // t6 + t14 exist in floor-linked universe
    expect(u.timeline.some((b) => b.tableId === "t6")).toBe(true);
    expect(u.opportunities.some((o) => o.tableIds.includes("t14"))).toBe(true);
  });

  it("maps legacy floor states to canonical table states", () => {
    expect(toServiceTableState("held")).toBe("HELD");
    expect(toServiceTableState("inbound")).toBe("RESERVED");
    expect(toServiceTableState("occupied")).toBe("IN_SERVICE");
    expect(toServiceTableState("available", { protected: true })).toBe(
      "PROTECTED",
    );
  });

  it("optimizer never moves protected or seated tables", () => {
    const reservations = berlinServiceReservations();
    const plan = evaluateFloorOptimization({
      reservations,
      protectedTableIds: PROTECTED_TABLE_IDS,
      kitchenCurrentPct: 97,
      asOf: "19:48",
      locationId: "loc_berlin_mitte",
    });
    expect(assertNoProtectedMoves(plan, PROTECTED_TABLE_IDS)).toBe(true);
    const seated = new Set(
      reservations.filter((r) => r.status === "seated").flatMap((r) => r.tableIds),
    );
    expect(assertNoSeatedMoves(plan, seated)).toBe(true);
    // VIP bar table stays put
    expect(
      plan.moves.some((m) => m.fromTableIds.includes("t12") || m.toTableIds.includes("t12")),
    ).toBe(false);
  });

  it("optimizer may conclude no floor change", () => {
    const plan = evaluateFloorOptimization({
      reservations: berlinServiceReservations(),
      protectedTableIds: PROTECTED_TABLE_IDS,
      kitchenCurrentPct: 70,
      asOf: "19:48",
      locationId: "loc_berlin_mitte",
    });
    expect(plan.improved).toBe(false);
    expect(plan.moveCount).toBe(0);
    expect(plan.noChangeReason).toBeTruthy();
  });

  it("peak optimizer proposes a better configuration when pressure is high", () => {
    const plan = evaluateFloorOptimization({
      reservations: berlinServiceReservations(),
      protectedTableIds: PROTECTED_TABLE_IDS,
      kitchenCurrentPct: 97,
      asOf: "19:48",
      locationId: "loc_berlin_mitte",
    });
    expect(plan.improved).toBe(true);
    expect(plan.expectedContributionEuro).toBe(620);
    expect(plan.kitchenOptimizedPct).toBeLessThan(plan.kitchenCurrentPct);
    expect(plan.guestDisruption).toBe("low");
  });

  it("match engine ranks recoverable demand with explainable fit", () => {
    const opp = berlinRecoverableOpportunities()[0]!;
    const matches = rankDemandForOpportunity(opp, berlinUnfulfilledDemand());
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]!.rank).toBe(1);
    expect(matches[0]!.fitPct).toBeGreaterThan(50);
    expect(matches[0]!.reason.length).toBeGreaterThan(8);
    expect(canOfferRecovery(opp)).toBe(true);
  });

  it("waiting demand exposes connector sources", () => {
    const u = getBerlinServiceUniverse();
    expect(u.waitingBySource.some((s) => s.source === "OpenTable")).toBe(true);
    expect(u.waitingBySource.some((s) => s.source === "SevenRooms")).toBe(true);
  });
});
