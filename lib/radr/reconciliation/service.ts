/**
 * Reconciliation: link reservation → seating → POS → payment.
 * Heuristic matches expose confidence; never claim certainty without explicit IDs.
 */

export type LinkConfidence = "EXPLICIT" | "HIGH" | "MEDIUM" | "LOW";

export type ReconciliationLink = {
  reservationId?: string;
  tableId?: string;
  posOrderId?: string;
  paymentId?: string;
  confidence: LinkConfidence;
  score: number;
  reasons: string[];
};

export type MatchCandidate = {
  reservationId: string;
  locationId: string;
  serviceTimeMs: number;
  partySize: number;
  tableId?: string;
};

export type PosCandidate = {
  posOrderId: string;
  locationId: string;
  openedAtMs: number;
  covers?: number;
  tableId?: string;
};

export function reconcileReservationToPos(
  reservation: MatchCandidate,
  orders: PosCandidate[],
): ReconciliationLink | null {
  // Explicit table + time proximity
  let best: { order: PosCandidate; score: number; reasons: string[] } | null =
    null;

  for (const order of orders) {
    if (order.locationId !== reservation.locationId) continue;
    const reasons: string[] = [];
    let score = 0;

    if (reservation.tableId && order.tableId === reservation.tableId) {
      score += 40;
      reasons.push("same table");
    }

    const deltaMin =
      Math.abs(order.openedAtMs - reservation.serviceTimeMs) / 60_000;
    if (deltaMin <= 15) {
      score += 35;
      reasons.push("time within 15m");
    } else if (deltaMin <= 45) {
      score += 15;
      reasons.push("time within 45m");
    } else {
      continue;
    }

    if (
      order.covers != null &&
      Math.abs(order.covers - reservation.partySize) <= 1
    ) {
      score += 20;
      reasons.push("party size close");
    }

    if (!best || score > best.score) {
      best = { order, score, reasons };
    }
  }

  if (!best || best.score < 40) return null;

  const confidence: LinkConfidence =
    best.score >= 80 ? "HIGH" : best.score >= 55 ? "MEDIUM" : "LOW";

  return {
    reservationId: reservation.reservationId,
    tableId: reservation.tableId,
    posOrderId: best.order.posOrderId,
    confidence,
    score: best.score,
    reasons: best.reasons,
  };
}

export function explicitLink(input: {
  reservationId: string;
  posOrderId: string;
  tableId?: string;
  paymentId?: string;
}): ReconciliationLink {
  return {
    ...input,
    confidence: "EXPLICIT",
    score: 100,
    reasons: ["source-provided link"],
  };
}
