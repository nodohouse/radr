/**
 * RADR Butler: domain tool helpers + Ask RADR façade.
 * Structured intelligence routes through lib/ai (tools planner / optional LLM).
 */

import {
  getOperatingSnapshot,
  type OperatingSnapshot,
} from "@/lib/radr/operatingSnapshot";
import { findingsForScope } from "@/lib/radr/findings";
import type { Finding } from "@/lib/radr/domain";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import type { DashPeriod, LocationScope } from "@/lib/product/demo/dashboard";
import {
  canAccessLocation,
  hasPermission,
  type AccessContext,
  type RadrRole,
} from "@/lib/platform/rbac";
import { buildButlerOpening } from "./opening";
import type {
  ButlerActionLink,
  ButlerContext,
  ButlerResponse,
  ButlerRole,
  ButlerSession,
} from "./types";
import { orchestrateAskSync } from "@/lib/ai/orchestrate";
import { nextAskSession } from "@/lib/ai/compose";
import { resolveAskContext } from "@/lib/ai/context";
import { askRequestSchema } from "@/lib/ai/answerSchema";

export type {
  ButlerRole,
  ButlerContext,
  ButlerActionLink,
  ButlerResponse,
  ButlerSession,
} from "./types";

export { buildButlerOpening };

/** Tool-grounded Ask RADR resolve (sync). */
export function resolveButlerIntelligence(
  query: string,
  ctx: ButlerContext,
  session?: ButlerSession,
): ButlerResponse {
  return orchestrateAskSync(query, ctx, session).response;
}

export function nextSession(
  prev: ButlerSession | undefined,
  query: string,
  response: ButlerResponse,
): ButlerSession {
  const req = askRequestSchema.parse({
    question: query,
    locationScope: prev?.locationId ?? "loc_ber",
    period: "yesterday",
    role: "group_cfo",
    allowedLocationIds: "all",
    session: prev,
  });
  const resolved = resolveAskContext(query, req, prev);
  return nextAskSession(prev, query, response, resolved);
}

/** Legacy answer shape for existing tests */
export type ButlerAnswer = {
  answer: string;
  why?: string;
  impactEuro?: number;
  evidence: { label: string; value: string }[];
  confidence?: string;
  recommendedNextStep?: string;
  actions: ButlerActionLink[];
  pendingWrite?: {
    kind: string;
    summary: string;
    details: { label: string; value: string }[];
  };
  toolUsed: string;
};

function toAccessContext(ctx: ButlerContext): AccessContext {
  const roleMap: Record<ButlerRole, RadrRole> = {
    location_manager: "GENERAL_MANAGER",
    regional_manager: "REGIONAL_MANAGER",
    group_cfo: "CFO",
  };
  return {
    userId: "butler_demo",
    organizationId: "org_northstar",
    role: roleMap[ctx.role],
    locationIds: ctx.allowedLocationIds,
  };
}

function assertScopeAccess(ctx: ButlerContext, locationId: string): boolean {
  return canAccessLocation(toAccessContext(ctx), locationId);
}

export function getLocationSummary(
  ctx: ButlerContext,
  locationId?: string,
): OperatingSnapshot | { error: string } {
  const scope = (locationId ?? ctx.locationScope) as LocationScope;
  if (!assertScopeAccess(ctx, scope)) {
    return { error: "Permission denied for this location." };
  }
  return getOperatingSnapshot(scope, ctx.period as DashPeriod);
}

export function getFindings(
  ctx: ButlerContext,
  locationId?: string,
): Finding[] | { error: string } {
  const scope = (locationId ?? ctx.locationScope) as LocationScope;
  if (!assertScopeAccess(ctx, scope)) {
    return { error: "Permission denied for this location." };
  }
  if (!hasPermission(toAccessContext(ctx), "butler:read")) {
    return { error: "Permission denied for Butler read." };
  }
  return findingsForScope(scope);
}

export function getCancellationExposureTool(ctx: ButlerContext): {
  cancelledReservations: number;
  cancelledCovers: number;
  grossBookingValue: number;
  expectedNaturalRecovery: number;
  unrecoveredRevenue: number;
  currency: string;
} | { error: string } {
  if (!assertScopeAccess(ctx, ctx.locationScope)) {
    return { error: "Permission denied." };
  }
  if (ctx.locationScope !== "loc_ber") {
    return {
      cancelledReservations: 0,
      cancelledCovers: 0,
      grossBookingValue: 0,
      expectedNaturalRecovery: 0,
      unrecoveredRevenue: 0,
      currency: "EUR",
    };
  }
  const rs = BERLIN_RESERVATION_SUMMARY;
  return {
    cancelledReservations: rs.cancellationCount,
    cancelledCovers: rs.cancelledCovers,
    grossBookingValue: rs.cancelledBookingValue,
    expectedNaturalRecovery: rs.expectedRecoveredValue,
    unrecoveredRevenue: rs.revenueAtRisk,
    currency: "EUR",
  };
}

export function compareLocations(
  ctx: ButlerContext,
  aId: string,
  bId: string,
): ButlerAnswer | { error: string } {
  if (!assertScopeAccess(ctx, aId) || !assertScopeAccess(ctx, bId)) {
    return { error: "Permission denied for one or both locations." };
  }
  const a = getOperatingSnapshot(aId, ctx.period as DashPeriod);
  const b = getOperatingSnapshot(bId, ctx.period as DashPeriod);
  const marginDelta = a.trading.margin - b.trading.margin;
  const laborDelta = a.trading.laborPct - b.trading.laborPct;
  const worse = marginDelta < 0 ? a : b;
  const better = marginDelta < 0 ? b : a;
  return {
    toolUsed: "compareLocations",
    answer: `${a.locationName} is currently ${Math.abs(marginDelta).toFixed(1)} pts ${
      marginDelta < 0 ? "below" : "above"
    } ${b.locationName} on margin.`,
    evidence: [
      {
        label: `${a.locationName} margin`,
        value: `${a.trading.margin.toFixed(1)}%`,
      },
      {
        label: `${b.locationName} margin`,
        value: `${b.trading.margin.toFixed(1)}%`,
      },
      {
        label: "Labor cost delta",
        value: `${laborDelta >= 0 ? "+" : ""}${laborDelta.toFixed(1)} pts`,
      },
      {
        label: `${worse.locationName} labor`,
        value: `${worse.trading.laborPct.toFixed(1)}% of revenue`,
      },
      {
        label: `${better.locationName} labor`,
        value: `${better.trading.laborPct.toFixed(1)}% of revenue`,
      },
    ],
    recommendedNextStep:
      Math.abs(laborDelta) >= 0.3
        ? `Review peak staffing at ${worse.locationName}`
        : `Inspect open findings at ${worse.locationName}`,
    actions: [
      { label: `Open ${worse.locationName}`, href: `/app?scope=${worse.scope}` },
      { label: "Open LABOR", href: "/app/labor" },
      { label: "View findings", href: "/app/findings" },
    ],
  };
}

function toLegacyAnswer(r: ButlerResponse): ButlerAnswer {
  return {
    answer: r.answer,
    why: r.why ?? r.explanation,
    impactEuro: r.impactEuro,
    evidence: r.evidence,
    confidence: r.confidence?.band,
    recommendedNextStep: r.recommendation?.title,
    actions: r.actions,
    pendingWrite: r.pendingWrite,
    toolUsed: r.toolUsed,
  };
}

export function resolveButlerQuery(
  query: string,
  ctx: ButlerContext,
  session?: ButlerSession,
): ButlerAnswer {
  return toLegacyAnswer(resolveButlerIntelligence(query, ctx, session));
}
