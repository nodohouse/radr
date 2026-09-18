/**
 * Compose helpers for Active Revenue Intelligence.
 */

import type {
  ActiveRevenueBrief,
  CancellationOpportunity,
  GuestOpportunity,
} from "./types";
import { demoBerlinActiveRevenue, rankGuestOpportunities } from "./demoBerlin";

export function composeBerlinActiveRevenue(): ActiveRevenueBrief {
  return demoBerlinActiveRevenue();
}

/** Open recoveries that need a human (not verified / expired). */
export function openRecoveries(
  brief: ActiveRevenueBrief,
): CancellationOpportunity[] {
  return brief.recoveries.filter(
    (r) => r.status !== "VERIFIED" && r.status !== "EXPIRED" && r.status !== "REBOOKED",
  );
}

export function materialRecoveries(
  brief: ActiveRevenueBrief,
): CancellationOpportunity[] {
  return openRecoveries(brief).filter(
    (r) => r.remainingRevenueExposure >= 80 || r.waitlistMatches.length >= 3,
  );
}

/** FOH: one line per table, max 2 suggestions overall for a section glance. */
export function fohSectionPrompts(
  brief: ActiveRevenueBrief,
  limit = 2,
): GuestOpportunity[] {
  return brief.fohPrompts.slice(0, limit);
}

export function potentialTonight(brief: ActiveRevenueBrief): number {
  return brief.rollup.tonightPotential;
}

export function neverAutoSocial(brief: ActiveRevenueBrief): boolean {
  return brief.recoveries.every(
    (r) =>
      r.recommendedStrategy !== "SOCIAL" ||
      (r.requiresApproval && r.automationLevel !== "AUTOMATED"),
  );
}

export { rankGuestOpportunities };
