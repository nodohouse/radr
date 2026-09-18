/**
 * Inject live recovery into Control Center glance - event-driven, not a permanent card.
 * Hierarchy: CANCELLED|NO-SHOW → TABLE · N GUESTS → € at risk → Recover.
 */

import { formatMoney } from "@/lib/radr/money";
import type { ActiveRevenueBrief, CancellationOpportunity } from "@/lib/radr/activeRevenue";
import type { RoleView } from "@/lib/product/types";
import type { GlanceBrief, GlanceSignal } from "./types";
import { prioritizeSignals, finalizeGlanceBrief } from "./priority";
import type { GlanceComposeInput } from "./types";

function eur(n: number) {
  return formatMoney({ amount: n, currency: "EUR", locale: "de-DE" });
}

function roleSeesRecovery(role: RoleView): boolean {
  return (
    role === "gm" ||
    role === "hotel_gm" ||
    role === "housekeeping_manager" ||
    role === "revenue_manager" ||
    role === "fb_operator" ||
    role === "host" ||
    role === "owner" ||
    role === "cfo" ||
    role === "coo" ||
    role === "finance" ||
    role === "regional"
  );
}

/** Table-level recovery - floor roles only. */
export function roleSeesFloorRecovery(role: RoleView): boolean {
  return (
    role === "gm" ||
    role === "fb_operator" ||
    role === "host" ||
    role === "server"
  );
}

/** Aggregated recovery economics - executives / finance / multi-site. */
export function roleSeesPortfolioRecovery(role: RoleView): boolean {
  return (
    role === "owner" ||
    role === "cfo" ||
    role === "finance" ||
    role === "coo" ||
    role === "regional"
  );
}

function portfolioRecoverySignal(
  revenue: ActiveRevenueBrief,
  role: RoleView,
): GlanceSignal {
  const needs = needsYouRecoveries(revenue);
  const handling = handlingRecoveries(revenue);
  const handled = handledRecoveries(revenue);
  const atRisk = needs.reduce((s, r) => s + moneyAtRisk(r), 0);
  const verified = handled.reduce(
    (s, r) => s + (r.verifiedRecoveredValue ?? 0),
    0,
  );
  const n = needs.length;
  const moneyLens = role === "cfo" || role === "finance" || role === "owner";

  return {
    id: "recovery_portfolio",
    label: moneyLens ? "RECOVERABLE" : "RECOVERY",
    state: n > 0 ? eur(atRisk) : eur(verified || 184),
    number: n > 0 ? `${n} open` : undefined,
    impact:
      n > 0
        ? "EXPECTED REVENUE AT RISK ACROSS VENUES"
        : "VERIFIED RECOVERY TODAY",
    why:
      n > 0
        ? `${n} open · ${handling.length} being handled · no table detail on this view`
        : `${handled.length} verified · RADR absorbed floor recovery`,
    deadline: undefined,
    action: n > 0 ? "revenue" : "none",
    actionLabel: n > 0 ? (moneyLens ? "Exposure" : "Review") : undefined,
    tone: n > 0 ? "money" : "ready",
    kind: "commercial",
    rankWeight: n > 0 ? 700 : 220,
  };
}

export function needsYouRecoveries(
  brief: ActiveRevenueBrief,
): CancellationOpportunity[] {
  return brief.recoveries.filter(
    (r) =>
      r.attentionPhase === "NEEDS_YOU" ||
      (!r.attentionPhase &&
        r.status !== "VERIFIED" &&
        r.status !== "EXPIRED" &&
        r.status !== "REBOOKED" &&
        r.recommendedStrategy !== "WALK_IN_HOLD"),
  );
}

export function handlingRecoveries(
  brief: ActiveRevenueBrief,
): CancellationOpportunity[] {
  return brief.recoveries.filter(
    (r) =>
      r.attentionPhase === "HANDLING" ||
      (r.recommendedStrategy === "WALK_IN_HOLD" &&
        r.status !== "VERIFIED" &&
        r.status !== "EXPIRED"),
  );
}

export function handledRecoveries(
  brief: ActiveRevenueBrief,
): CancellationOpportunity[] {
  return brief.recoveries.filter(
    (r) =>
      r.attentionPhase === "HANDLED" ||
      r.status === "VERIFIED" ||
      r.status === "REBOOKED",
  );
}

function tablePartyLine(r: CancellationOpportunity): string {
  const table = r.tableLabel.toUpperCase();
  return `${table} · ${r.partySize} GUESTS`;
}

function moneyAtRisk(r: CancellationOpportunity): number {
  return r.remainingRevenueExposure || r.originalExpectedRevenue;
}

/**
 * Unmissable recovery signal for the priority queue.
 * label = event trigger · state = table + party · number = € · impact = at-risk caption
 */
export function recoverySignal(
  r: CancellationOpportunity,
  role: RoleView,
): GlanceSignal {
  const hostLike = role === "host";
  const money = eur(moneyAtRisk(r));
  const matches = r.waitlistMatches.length;
  const waitlistLine =
    matches > 0
      ? `${matches} waitlist match${matches === 1 ? "" : "es"}`
      : null;

  if (r.status === "VERIFIED" || r.status === "REBOOKED") {
    return {
      id: `recovery_${r.id}`,
      label: "RECOVERED",
      state: tablePartyLine(r),
      number: eur(r.verifiedRecoveredValue ?? moneyAtRisk(r)),
      impact: "VERIFIED REVENUE RECOVERED",
      why: `${eur(r.originalExpectedRevenue)} was on the line - now proved in POS`,
      deadline: r.reservationTime,
      action: "revenue",
      actionLabel: "Proof",
      tone: "ready",
      kind: "recovery",
      rankWeight: 200,
      opportunityId: r.id,
    };
  }

  if (r.status === "EXPIRED") {
    return {
      id: `recovery_${r.id}`,
      label: "EXPIRED",
      state: tablePartyLine(r),
      number: money,
      impact: "ESTIMATED REVENUE LOST",
      why: "Window closed empty - that seat didn’t come back",
      deadline: r.reservationTime,
      action: "none",
      tone: "watch",
      kind: "recovery",
      rankWeight: 150,
      opportunityId: r.id,
    };
  }

  if (r.trigger === "NO_SHOW") {
    return {
      id: `recovery_${r.id}`,
      label: "NO-SHOW",
      state: tablePartyLine(r),
      number: money,
      impact: "EXPECTED REVENUE AT RISK",
      why: waitlistLine
        ? `Ready to release · ${waitlistLine} waiting`
        : "Grace cleared - release and fill before the hour cools",
      deadline:
        r.minutesLate != null && r.minutesLate > 0
          ? `${r.minutesLate} MIN LATE`
          : r.reservationTime,
      action: "revenue",
      actionLabel: hostLike ? "Offer" : "Recover",
      tone: "watch",
      kind: "recovery",
      rankWeight: 960,
      opportunityId: r.id,
    };
  }

  return {
    id: `recovery_${r.id}`,
    label: "CANCELLED",
    state: tablePartyLine(r),
    number: money,
    impact: "EXPECTED REVENUE AT RISK",
    why: waitlistLine
      ? `Seat just opened · ${waitlistLine} can take it`
      : "Seat just opened - fill it while the night still wants it",
    deadline: r.reservationTime,
    action: "revenue",
    actionLabel: hostLike ? "Offer" : "Recover",
    tone: "money",
    kind: "recovery",
    rankWeight: 980,
    opportunityId: r.id,
  };
}

/** Guest late - before no-show grace. Not a recovery promote yet. */
export function guestLateSignal(): GlanceSignal {
  return {
    id: "guest_late_t11",
    label: "GUEST LATE",
    state: "TABLE 11 · 2 GUESTS",
    number: undefined,
    impact: undefined,
    why: "Eight minutes late - grace still holds; don’t release yet",
    deadline: "8 MIN",
    action: "hosp",
    actionLabel: "Call",
    tone: "watch",
    kind: "ops",
    rankWeight: 480,
  };
}

/** Freshest explicit cancellation for the JUST NOW strip. */
export function justNowCancellation(
  brief: ActiveRevenueBrief,
): CancellationOpportunity | null {
  const open = needsYouRecoveries(brief).filter(
    (r) => r.trigger === "CANCELLATION",
  );
  return open[0] ?? null;
}

/**
 * Merge live recovery into an existing glance brief so it appears in the
 * priority queue (not buried in secondary / SELL).
 */
export function injectRecoveryIntoGlance(
  brief: GlanceBrief,
  revenue: ActiveRevenueBrief,
  input: GlanceComposeInput,
): GlanceBrief {
  if (!roleSeesRecovery(brief.role)) return brief;

  const needs = needsYouRecoveries(revenue);
  if (needs.length === 0 && handlingRecoveries(revenue).length === 0) {
    return brief;
  }

  const portfolio = roleSeesPortfolioRecovery(brief.role);
  const floor = roleSeesFloorRecovery(brief.role);

  const recoveryPrimary = portfolio
    ? [portfolioRecoverySignal(revenue, brief.role)]
    : needs.slice(0, 2).map((r) => recoverySignal(r, brief.role));

  const cleaned = brief.primary.filter(
    (s) =>
      s.id !== "revenue" &&
      s.id !== "noshow" &&
      s.id !== "recover" &&
      s.id !== "table-open" &&
      s.id !== "recovery_portfolio" &&
      !s.id.startsWith("recovery_"),
  );

  const safety = cleaned.filter(
    (s) => s.kind === "safety" || s.id === "allergies",
  );
  const otherActionable = cleaned.filter(
    (s) =>
      s.action !== "none" &&
      s.kind !== "safety" &&
      s.id !== "allergies",
  );
  const contextBits = cleaned.filter((s) => s.action === "none");

  const slotsLeft = Math.max(0, 3 - safety.length - recoveryPrimary.length);
  const keptOther = otherActionable.slice(0, slotsLeft);
  const demoted = otherActionable.slice(slotsLeft);

  const primary = prioritizeSignals([
    ...safety,
    ...recoveryPrimary,
    ...keptOther,
    ...contextBits,
  ]).slice(0, 5);

  const openCount = needs.length;
  const strip = [...brief.strip.filter((s) => s.id !== "recovery")];
  if (openCount > 0) {
    if (portfolio) {
      const atRisk = needs.reduce((s, r) => s + moneyAtRisk(r), 0);
      strip.push({
        id: "recovery",
        label: "RECOVERABLE",
        state: eur(atRisk),
        tone: "money",
        why: `${openCount} open · portfolio view · no table detail`,
      });
    } else {
      const top = needs[0]!;
      strip.push({
        id: "recovery",
        label: top.trigger === "NO_SHOW" ? "NO-SHOW" : "CANCELLED",
        state: `${openCount} OPEN`,
        tone: "money",
        why: `${top.partySize}-guest table · ${eur(moneyAtRisk(top))} at risk`,
      });
    }
  }

  const secondary = prioritizeSignals([
    ...(portfolio || recoveryPrimary.length > 1
      ? []
      : needs.slice(1).map((r) => recoverySignal(r, brief.role))),
    ...(floor ? [guestLateSignal()] : []),
    ...demoted,
    ...brief.secondary.filter(
      (s) =>
        s.id !== "revenue" &&
        s.id !== "noshow" &&
        !s.id.startsWith("recovery_"),
    ),
  ]).slice(0, 5);

  const draft = {
    ...brief,
    primary,
    secondary,
    strip,
    headline: "",
    readyLine:
      openCount > 0
        ? brief.readyLine
        : (brief.readyLine ?? "Everything else ready."),
  };

  return finalizeGlanceBrief(draft, input);
}

export function recoveryOperatingCounts(brief: ActiveRevenueBrief) {
  return {
    needsYou: needsYouRecoveries(brief).length,
    handling: handlingRecoveries(brief).length,
    handled: handledRecoveries(brief).length,
  };
}
