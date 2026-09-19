/**
 * Same recovery truth, different altitude.
 * Floor = tables · Portfolio = economics.
 */

import type { RoleView } from "@/lib/product/types";
import type { LiveRecoveryEvent } from "./liveRecovery";
import type { ActiveRevenueBrief, CancellationOpportunity } from "./types";

export type RecoveryAltitude = "floor" | "portfolio";

export function recoveryAltitudeForRole(role: RoleView | string | undefined): RecoveryAltitude {
  if (
    role === "owner" ||
    role === "cfo" ||
    role === "finance" ||
    role === "coo" ||
    role === "regional"
  ) {
    return "portfolio";
  }
  return "floor";
}

/** Rewrite live feed labels so executives never see Table N. */
export function portfolioLiveLabel(event: LiveRecoveryEvent): string {
  switch (event.kind) {
    case "cancellation_detected":
      return "Cancellation · expected revenue at risk";
    case "no_show_eligible":
      return "No-show · recovery opportunity open";
    case "recovered":
      return "Recovery verified · POS confirmed";
    case "waitlist_offered":
      return "Waitlist offer in flight";
    case "no_show_pending":
      return "Late guest · grace window · not released";
    case "social_published":
      return "Social recovery published";
    case "expired":
      return "Recovery window expired";
    default:
      return "Recovery signal";
  }
}

export function portfolioRecoveryRollup(brief: ActiveRevenueBrief) {
  const open = brief.recoveries.filter(
    (r) =>
      r.status !== "VERIFIED" &&
      r.status !== "EXPIRED" &&
      r.status !== "REBOOKED",
  );
  const verified = brief.recoveries.filter((r) => r.status === "VERIFIED");
  const atRisk = open.reduce(
    (s, r) => s + (r.remainingRevenueExposure || r.originalExpectedRevenue || 0),
    0,
  );
  const verifiedValue = verified.reduce(
    (s, r) => s + (r.verifiedRecoveredValue ?? 0),
    0,
  );
  const guestContrib = brief.guestOpportunities.reduce(
    (s, g) => s + g.expectedIncrementalContribution,
    0,
  );
  return {
    openCount: open.length,
    atRisk,
    verifiedCount: verified.length,
    verifiedValue,
    guestOpportunityCount: brief.guestOpportunities.length,
    guestContrib,
  };
}

/** Strip table identity from a recovery for portfolio dig-deeper. */
export function portfolioRecoverySummary(r: CancellationOpportunity): {
  kicker: string;
  title: string;
  amount: number;
} {
  const kicker =
    r.status === "VERIFIED"
      ? "Verified"
      : r.trigger === "NO_SHOW"
        ? "No-show"
        : "Cancellation";
  return {
    kicker,
    title: `${r.partySize} guests · ${r.reservationTime}`,
    amount: r.verifiedRecoveredValue ?? r.remainingRevenueExposure ?? 0,
  };
}
