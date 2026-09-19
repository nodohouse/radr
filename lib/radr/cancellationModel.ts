/**
 * Reservation / cancellation financial model.
 * Cancellations are financial events, not raw booking counts.
 *
 * Distinguishes gross booking value at risk from expected unrecovered
 * revenue after replacement probability.
 */

export type CancellationLead =
  | "early"
  | "medium"
  | "late"
  | "same_day"
  | "no_show";

/** Configurable replacement priors by lead class (demo defaults). */
export const REPLACEMENT_PRIOR: Record<CancellationLead, number> = {
  early: 0.82,
  medium: 0.65,
  late: 0.38,
  same_day: 0.18,
  no_show: 0.05,
};

export type CancellationCluster = {
  reservations: number;
  covers: number;
  /** Expected covers × expected spend/cover before replacement. */
  grossBookingValue: number;
  /** After modeled replacement / rebook probability. */
  expectedUnrecovered: number;
  /** Contribution / margin impact where estimable. */
  estimatedMarginImpact: number;
  /** Dominant timing class for the cluster. */
  leadClass: CancellationLead;
  replacementProbability: number;
  primaryTerritory: "SELL";
  secondaryTerritories: Array<"LABOR" | "BUY" | "RECOVER">;
};

export function expectedBookingValue(
  covers: number,
  spendPerCover: number,
): number {
  return Math.round(covers * spendPerCover);
}

export function unrecoveredFromGross(
  gross: number,
  replacementProbability: number,
): number {
  return Math.round(gross * (1 - replacementProbability));
}

export function formatAtRiskEuro(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `€${k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `€${n.toLocaleString("en-IE")}`;
}
