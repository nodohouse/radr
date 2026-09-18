/**
 * Fleet ranking - bird's-eye location performance for upper management.
 * Rank + why they lead + transferable success criteria.
 */

export type FleetSort =
  | "contribution"
  | "margin"
  | "verified"
  | "attention"
  | "pace";

export type FleetRowStatus = "READY" | "WATCH" | "NEEDS_YOU";

/** One concrete driver behind a location's rank. */
export type FleetDriver = {
  /** Short operating practice. */
  practice: string;
  /** Measured effect. */
  effect: string;
};

export type FleetLocationRow = {
  id: string;
  name: string;
  city: string;
  country: string;
  region: string;
  contribution: number;
  marginPct: number;
  marginVsPlan: number;
  verified: number;
  recoverable: number;
  paceVsExpectedPct: number;
  needsYou: number;
  attentionEuro: number;
  status: FleetRowStatus;
  /** One-line: why this location sits where it does. */
  why: string;
  /** Up to 3 concrete drivers (learnable). */
  drivers: FleetDriver[];
};

/** A success pattern from leaders - apply to lagging locations. */
export type FleetSuccessCriterion = {
  id: string;
  practice: string;
  evidenceFrom: string;
  effect: string;
  /** Where this is not yet applied. */
  applyTo: string[];
};

export type FleetBrief = {
  scopeLabel: string;
  locationCount: number;
  periodLabel: string;
  defaultSort: FleetSort;
  rows: FleetLocationRow[];
  headline: string;
  bestId: string;
  worstGapId: string;
  needsYouCount: number;
  /** Why the contribution leader is ahead. */
  leaderWhy: string;
  /** Transferable criteria distilled from top performers. */
  successCriteria: FleetSuccessCriterion[];
};
