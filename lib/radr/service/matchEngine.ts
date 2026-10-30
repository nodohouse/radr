/**
 * Match recovered capacity to unfulfilled demand.
 * Ranking is explainable — never opaque VIP favoritism.
 */

import type {
  DemandMatch,
  RecoverableCapacityOpportunity,
  UnfulfilledDemand,
} from "./types";

function parseHm(hm: string): number {
  const [h, m] = hm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function timeFit(
  preferred: string,
  slotStart: string,
  flexEarliest = -30,
  flexLatest = 45,
): { ok: boolean; deltaMin: number; score: number } {
  const pref = parseHm(preferred);
  const slot = parseHm(slotStart);
  const delta = slot - pref;
  const ok = delta >= flexEarliest && delta <= flexLatest;
  const abs = Math.abs(delta);
  const score = ok ? Math.max(0, 1 - abs / 90) : 0;
  return { ok, deltaMin: delta, score };
}

export function rankDemandForOpportunity(
  opp: RecoverableCapacityOpportunity,
  demand: UnfulfilledDemand[],
): DemandMatch[] {
  const candidates = demand.filter(
    (d) =>
      (d.state === "waiting" || d.state === "notified") &&
      d.partySize >= opp.partySizeFit.min &&
      d.partySize <= opp.partySizeFit.max &&
      (opp.compatibleDemandIds.length === 0 ||
        opp.compatibleDemandIds.includes(d.id)),
  );

  const scored = candidates.map((d) => {
    const flexE = d.flexibility.earliestMinutes ?? -30;
    const flexL = d.flexibility.latestMinutes ?? 45;
    const tf = timeFit(d.preferredTime, opp.start, flexE, flexL);

    let fit = 0.35 * tf.score;
    // Party size exactness
    const sizeDelta = Math.abs(
      d.partySize - (opp.partySizeFit.min + opp.partySizeFit.max) / 2,
    );
    fit += 0.2 * Math.max(0, 1 - sizeDelta / 3);

    // Wait duration (walk-ins / aging demand) — fairness signal
    const wait = d.waitMinutes ?? 0;
    fit += 0.1 * Math.min(1, wait / 30);

    // Expected contribution (normalized, capped influence)
    fit += 0.15 * Math.min(1, d.expectedContributionEuro / 200);

    // Returning guests — small, disclosed boost (not opaque VIP)
    if (d.flexibility.returning) fit += 0.05;

    // Accessibility hard requirement when demand needs it
    if (d.flexibility.accessibility) {
      // Demo: only MAIN tables with seats>=2 considered accessible-capable
      fit += opp.area === "MAIN" ? 0.08 : -0.5;
    }

    // Operational pressure penalty
    if (opp.operationalImpact === "high") fit -= 0.12;
    if (opp.operationalImpact === "medium") fit -= 0.05;

    fit = Math.max(0, Math.min(0.99, fit + 0.15));

    const reasons: string[] = [];
    if (tf.ok) {
      reasons.push(
        tf.deltaMin === 0
          ? `requested ${d.preferredTime}`
          : `requested ${d.preferredTime} · ±${Math.abs(tf.deltaMin)} min`,
      );
    } else {
      reasons.push("outside preferred window");
    }
    if (d.waitMinutes && d.waitMinutes > 0) {
      reasons.push(`waiting ${d.waitMinutes} min`);
    }
    if (d.flexibility.returning) reasons.push("returning guest");
    if (d.flexibility.accessibility) reasons.push("accessibility");
    reasons.push(`€${d.expectedContributionEuro} expected`);

    return {
      demandId: d.id,
      fitPct: Math.round(fit * 100),
      reason: reasons.join(" · "),
      _sort: fit,
    };
  });

  scored.sort((a, b) => b._sort - a._sort);

  return scored.map((s, i) => ({
    demandId: s.demandId,
    rank: i + 1,
    fitPct: s.fitPct,
    reason: s.reason,
  }));
}

/** Safety: never match seated / completed reservations as movable demand. */
export function canOfferRecovery(opp: RecoverableCapacityOpportunity): boolean {
  return (
    (opp.state === "open" || opp.state === "prepared") &&
    opp.confidence >= 0.5 &&
    opp.compatibleDemandIds.length > 0
  );
}
