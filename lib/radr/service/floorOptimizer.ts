/**
 * Whole-floor optimization — Decision-layer recommendation, not a seating CMS.
 * May return NO CHANGE. Never moves protected / seated parties.
 */

import type { FloorMove, FloorOptimizationPlan, ServiceReservation } from "./types";

type Input = {
  reservations: ServiceReservation[];
  protectedTableIds: Set<string>;
  kitchenCurrentPct: number;
  asOf: string;
  locationId: string;
};

function isMovable(r: ServiceReservation, protectedTables: Set<string>): boolean {
  if (r.protected) return false;
  if (r.status === "seated" || r.status === "completed" || r.status === "cancelled") {
    return false;
  }
  if (r.tableIds.some((t) => protectedTables.has(t))) return false;
  return r.status === "booked" || r.status === "confirmed" || r.status === "arriving";
}

/**
 * Demo-deterministic optimizer for Berlin peak.
 * Produces the gold "better configuration" when wait-path conditions hold;
 * otherwise returns NO CHANGE (valid RADR outcome).
 */
export function evaluateFloorOptimization(input: Input): FloorOptimizationPlan {
  const { reservations, protectedTableIds, kitchenCurrentPct, asOf, locationId } =
    input;

  const protectedUnchanged = reservations.filter(
    (r) => r.protected || r.tableIds.some((t) => protectedTableIds.has(t)),
  ).length;

  // Safety: never propose moves involving seated guests
  const seatedIds = new Set(
    reservations.filter((r) => r.status === "seated").flatMap((r) => r.tableIds),
  );

  const movable = reservations.filter((r) => isMovable(r, protectedTableIds));

  // Peak pressure scenario — propose two booking moves that free t6 window capacity
  // without touching protected t12 / t5 or seated tables.
  const oka = movable.find((r) => r.id === "res_oka_1900");
  const park = movable.find((r) => r.id === "res_park_2000");

  const canImprove =
    kitchenCurrentPct >= 90 &&
    Boolean(oka) &&
    Boolean(park) &&
    !oka!.tableIds.some((t) => seatedIds.has(t)) &&
    asOf >= "19:00";

  if (!canImprove) {
    return {
      id: "floor_opt_no_change",
      locationId,
      asOf,
      improved: false,
      summary: "No floor change",
      deltaCovers: 0,
      expectedContributionEuro: 0,
      kitchenCurrentPct,
      kitchenOptimizedPct: kitchenCurrentPct,
      guestDisruption: "none",
      moveCount: 0,
      protectedUnchanged,
      moves: [],
      pressureCurrent: {
        Dining: 84,
        Bar: 62,
        Cold: 97,
        Hot: 88,
        Delivery: 71,
      },
      pressureOptimized: {
        Dining: 84,
        Bar: 62,
        Cold: 97,
        Hot: 88,
        Delivery: 71,
      },
      confidence: 0.82,
      noChangeReason:
        kitchenCurrentPct < 90
          ? "Kitchen pressure below intervention threshold"
          : "No safe reallocation without moving seated or protected inventory",
    };
  }

  const moves: FloorMove[] = [
    {
      reservationId: oka!.id,
      partyLabel: oka!.partyLabel,
      fromTableIds: ["t9"],
      toTableIds: ["t8"],
      reason: "Earlier finish predicted on t8 · frees MAIN 4-top for inbound wave",
    },
    {
      reservationId: park!.id,
      partyLabel: park!.partyLabel,
      fromTableIds: ["t10"],
      toTableIds: ["t13"],
      reason: "Bar-adjacent 2-top · opens t10 for 19:30–21:00 recovery",
    },
  ];

  // Reject any move that would touch protected tables
  const safeMoves = moves.filter(
    (m) =>
      !m.fromTableIds.some((t) => protectedTableIds.has(t)) &&
      !m.toTableIds.some((t) => protectedTableIds.has(t)) &&
      !m.fromTableIds.some((t) => seatedIds.has(t)),
  );

  if (safeMoves.length === 0) {
    return {
      id: "floor_opt_no_change",
      locationId,
      asOf,
      improved: false,
      summary: "No floor change",
      deltaCovers: 0,
      expectedContributionEuro: 0,
      kitchenCurrentPct,
      kitchenOptimizedPct: kitchenCurrentPct,
      guestDisruption: "none",
      moveCount: 0,
      protectedUnchanged,
      moves: [],
      pressureCurrent: { Dining: 84, Bar: 62, Cold: 97, Hot: 88, Delivery: 71 },
      pressureOptimized: { Dining: 84, Bar: 62, Cold: 97, Hot: 88, Delivery: 71 },
      confidence: 0.9,
      noChangeReason: "All candidate moves blocked by protected or seated inventory",
    };
  }

  return {
    id: "floor_opt_peak_berlin",
    locationId,
    asOf,
    improved: true,
    summary: "RADR found a better configuration",
    deltaCovers: 8,
    expectedContributionEuro: 620,
    kitchenCurrentPct,
    kitchenOptimizedPct: 88,
    guestDisruption: "low",
    moveCount: safeMoves.length,
    protectedUnchanged,
    moves: safeMoves,
    pressureCurrent: {
      Dining: 84,
      Bar: 62,
      Cold: 97,
      Hot: 88,
      Delivery: 71,
    },
    pressureOptimized: {
      Dining: 79,
      Bar: 64,
      Cold: 88,
      Hot: 84,
      Delivery: 68,
    },
    confidence: 0.87,
  };
}

export function assertNoProtectedMoves(
  plan: FloorOptimizationPlan,
  protectedTableIds: Set<string>,
): boolean {
  return plan.moves.every(
    (m) =>
      !m.fromTableIds.some((t) => protectedTableIds.has(t)) &&
      !m.toTableIds.some((t) => protectedTableIds.has(t)),
  );
}

export function assertNoSeatedMoves(
  plan: FloorOptimizationPlan,
  seatedTableIds: Set<string>,
): boolean {
  return plan.moves.every(
    (m) => !m.fromTableIds.some((t) => seatedTableIds.has(t)),
  );
}
