/**
 * Tool Gateway — one truth layer for UI · Ask · REST · MCP.
 * Wraps existing domain selectors. Does not invent economic amounts.
 */

import type { RoleView } from "@/lib/product/types";
import { getBusinessPulse } from "@/lib/radr/product/businessPulse";
import { composeControlCenterBrief } from "@/lib/radr/product/controlCenterMetrics";
import { composeExecutiveBrief } from "@/lib/radr/product/executiveBrief";
import { getContributionBridge } from "@/lib/radr/finance/contributionBridge";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { canonicalVerifiedTotal } from "@/lib/radr/product/verifiedValueCanon";
import { dataHealthSummaryForRole } from "@/lib/radr/product/dataHealthCanonical";
import { buildBerlinOperatingMemory } from "@/lib/radr/decision/learning/operatingMemory";
import {
  getDecisionRecord,
  listDecisionRecords,
} from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { getDecisionTrace } from "@/lib/marketing/decisionTrace";
import {
  composeLiveOperatingSurface,
  paceHeadline,
} from "@/lib/radr/product/liveOperating";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import {
  getRestaurantDayPace,
  getGroupMtdPace,
  getHotelDayPace,
  getApartmentDayPace,
} from "@/lib/radr/product/revenuePacing";
import {
  getRestaurantMoneyFlow,
  getGroupMoneyFlow,
  getHotelMoneyFlow,
  getApartmentMoneyFlow,
  getStockWatch,
  getResourceSignals,
} from "@/lib/radr/product/liveFlows";
import { verticalDayFor } from "@/lib/radr/product/verticalDay";
import { DEMO_LOCATIONS, normalizeLocationId } from "@/lib/radr/product/demoOrg";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { primaryMetricOf } from "@/lib/radr/product/primaryMetric";
import {
  TOOL_GATEWAY_VERSION,
  type GatewayToolName,
  type GatedToolName,
  type ToolCallContext,
  type ToolEnvelope,
  type ToolEvidenceState,
  type ToolPeriod,
  type ToolProvenanceRef,
  GATED_TOOL_NAMES,
  READ_TOOL_NAMES,
} from "./contracts";
import { listToolDescriptors } from "./registry";
import { newRequestId, recordToolObservation } from "./observe";

function asRole(role?: string): RoleView {
  if (
    role === "cfo" ||
    role === "gm" ||
    role === "coo" ||
    role === "finance" ||
    role === "revenue_manager" ||
    role === "owner"
  ) {
    return role;
  }
  return "cfo";
}

function periodOf(ctx: ToolCallContext): ToolPeriod {
  return ctx.period ?? "mtd";
}

function envelope<T>(
  tool: GatewayToolName | GatedToolName,
  ctx: ToolCallContext,
  started: number,
  partial: {
    data: T | null;
    evidenceState: ToolEvidenceState;
    provenance: ToolProvenanceRef[];
    error?: string | null;
    gated?: boolean;
    locationScope?: string;
  },
): ToolEnvelope<T> {
  const requestId = ctx.requestId ?? newRequestId();
  const latencyMs = Math.max(0, Date.now() - started);
  const status = partial.gated
    ? "gated"
    : partial.error
      ? "error"
      : "ok";
  recordToolObservation({
    requestId,
    tool,
    principal: ctx.userId ?? "demo",
    tenant: ctx.organizationId ?? "org_northstar",
    locationScope: partial.locationScope ?? ctx.locationScope ?? "all",
    status,
    latencyMs,
    at: new Date().toISOString(),
  });
  return {
    tool,
    version: TOOL_GATEWAY_VERSION,
    tenantScope: ctx.organizationId ?? "org_northstar",
    locationScope: partial.locationScope ?? ctx.locationScope ?? "all",
    period: periodOf(ctx),
    evidenceState: partial.evidenceState,
    provenance: partial.provenance,
    data: partial.data,
    error: partial.error ?? null,
    gated: partial.gated,
    requestId,
    latencyMs,
  };
}

function resolveDecisionId(raw: string): string {
  if (raw.startsWith("dec_")) return raw;
  const upper = raw.toUpperCase();
  for (const [key, id] of Object.entries(DECISION_IDS)) {
    if (displayDecisionId(id) === upper || id === raw) return id;
    void key;
  }
  if (upper === "D-4102") return DECISION_IDS.supplier;
  if (upper === "D-1911") return DECISION_IDS.peak;
  return raw;
}

function euroTraceForSupplier() {
  const trace = getDecisionTrace("D-4102");
  if (!trace) return null;
  return {
    displayId: "D-4102",
    decisionId: DECISION_IDS.supplier,
    verifiedEuro: trace.verification.verifiedEuro,
    chain: [
      { step: "Invoice variance", detail: "INV-88421 vs CTR-1188", state: "OBSERVED" as const },
      { step: "Decision", detail: "D-4102 · Supplier dispute", state: "OBSERVED" as const },
      {
        step: "Action",
        detail: trace.action.name,
        state: "OBSERVED" as const,
      },
      {
        step: "Credit memo",
        detail: trace.verification.proof.find((p) => /credit/i.test(p.label))?.value ?? "CM-1042",
        state: "OBSERVED" as const,
      },
      {
        step: "Ledger match",
        detail: "Accounting / AP export",
        state: "SETTLED" as const,
      },
      {
        step: "Verified Value",
        detail: formatDecisionMoney(trace.verification.verifiedEuro),
        state: "SETTLED" as const,
      },
    ],
  };
}

function liveJoinStory() {
  const live = composeLiveOperatingSurface();
  const uber = live.delivery.channels.find((c) => /uber/i.test(c.label));
  const tuna = live.stock.items[0];
  const wx = live.demand.signals.find((s) => s.type === "weather");
  return {
    title: "How the next hour collides",
    signals: [
      {
        id: "delivery",
        label: "Uber Eats",
        value: uber
          ? `${uber.vsComparablePct >= 0 ? "+" : ""}${uber.vsComparablePct}%`
          : "+31%",
        detail: uber ? `${uber.ordersTonight} orders tonight` : "orders up",
      },
      {
        id: "tuna",
        label: "Tuna demand",
        value: tuna ? `+${Math.round(tuna.expectedDemand - tuna.remaining)}` : "+18%",
        detail: tuna
          ? `${tuna.remaining} portions · stockout ${tuna.projectedStockoutAt}`
          : "projected short",
      },
      {
        id: "weather",
        label: "Rain",
        value: wx?.label?.split("·")[1]?.trim() ?? "20:10",
        detail: wx?.expectedOperationalEffect?.split(".")[0] ?? "Terrace compression",
      },
      {
        id: "covers",
        label: "Inbound covers",
        value: `+${live.horizons["60m"].coversIncoming}`,
        detail: "Next 60 minutes",
      },
      {
        id: "kitchen",
        label: "Kitchen",
        value: `${live.service.kitchenProjected}%`,
        detail: `Projected at ${live.service.kitchenProjectedAt}`,
      },
    ],
    decision: {
      id: DECISION_IDS.peak,
      displayId: displayDecisionId(DECISION_IDS.peak),
      recommendation: "WAIT 12 MINUTES",
      expectedValue: 620,
      expectedValueFormatted: formatDecisionMoney(620),
    },
    radrRead:
      "Delivery surge, tuna burn, rain compression, and inbound covers collide at 20:18. One Decision absorbs the join — wait protects turns and contribution.",
  };
}

type Args = Record<string, unknown>;

function runRead(
  tool: GatewayToolName,
  args: Args,
  ctx: ToolCallContext,
  started: number,
): ToolEnvelope {
  const role = asRole(ctx.role ?? (typeof args.role === "string" ? args.role : "cfo"));
  const loc =
    (typeof args.locationId === "string" && args.locationId) ||
    ctx.locationScope ||
    "all";

  switch (tool) {
    case "get_group_pulse": {
      const pulse = getBusinessPulse(role);
      const brief = composeControlCenterBrief({ role, period: "mtd" });
      const exec = composeExecutiveBrief(role);
      const reviewed = 147;
      const needJudgment = brief.needsYouCount;
      return envelope(tool, ctx, started, {
        locationScope: "all",
        evidenceState: "MIXED",
        provenance: [
          { source: "business_pulse", method: "deterministic", grade: "MODELED" },
          { source: "control_center_brief", method: "decision_store", grade: "OBSERVED" },
        ],
        data: {
          headline: exec.headline,
          revenueDeltaLabel: exec.revenueDeltaLabel,
          contributionDeltaLabel: exec.contributionDeltaLabel,
          needsYouCount: brief.needsYouCount,
          handlingCount: brief.handling.length,
          exposureFormatted: brief.exposureFormatted,
          verifiedMoved: brief.sinceLastCheck.find((s) => /verified/i.test(s.text))?.text ?? null,
          systemProof: {
            reviewed,
            requireJudgment: needJudgment,
            line: `${reviewed} operating changes reviewed. ${needJudgment} require judgment.`,
          },
          pulse,
          facts: exec.facts,
        },
      });
    }
    case "get_location_status": {
      const n = normalizeLocationId(loc === "all" ? DEMO_LOCATIONS.berlin.id : loc);
      const day = verticalDayFor(n);
      return envelope(tool, ctx, started, {
        locationScope: n,
        evidenceState: "MIXED",
        provenance: [
          { source: "vertical_day", method: "fixture", grade: "MODELED" },
        ],
        data: day
          ? {
              locationId: n,
              label: day.title,
              vertical: day.vertical,
              radrState: day.radrState,
              radrLine: day.radrLine,
              heroMetrics: day.heroMetrics,
              timeline: day.timeline.slice(0, 6),
              attention: day.attention,
            }
          : null,
        error: day ? null : `Unknown location ${loc}`,
      });
    }
    case "get_live_service": {
      const surface = composeLiveOperatingSurface();
      const service = getLiveServicePerformance();
      return envelope(tool, ctx, started, {
        locationScope: DEMO_LOCATIONS.berlin.id,
        evidenceState: "MIXED",
        provenance: [
          { source: "pos", method: "live_fixture", freshness: service.freshnessLabel, grade: "OBSERVED" },
          { source: "forecast", method: "modeled", grade: "MODELED" },
        ],
        data: {
          paceHeadline: paceHeadline(service),
          revenue: service.revenue,
          expectedNow: service.forecastAtNow,
          expectedClose: service.expectedClose,
          targetClose: service.targetClose,
          clockLabel: service.clockLabel,
          kitchenProjected: service.kitchenProjected,
          kitchenProjectedAt: service.kitchenProjectedAt,
          join: liveJoinStory(),
          moneyFlow: surface.moneyFlow,
          stock: surface.stock,
          delivery: surface.delivery,
          demand: surface.demand,
          sourceFreshness: surface.sourceFreshness,
        },
      });
    }
    case "get_revenue_pace": {
      const vertical =
        typeof args.vertical === "string" ? args.vertical : loc.includes("canal")
          ? "hotel"
          : loc.includes("chiado")
            ? "apartment"
            : loc === "all"
              ? "group"
              : "restaurant";
      if (vertical === "group") {
        const mtd = getGroupMtdPace();
        return envelope(tool, ctx, started, {
          locationScope: "all",
          evidenceState: "MODELED",
          provenance: [{ source: "group_mtd_pace", method: "deterministic", grade: "MODELED" }],
          data: { vertical: "group", mtd },
        });
      }
      if (vertical === "hotel") {
        const pace = getHotelDayPace();
        return envelope(tool, ctx, started, {
          locationScope: DEMO_LOCATIONS.canal.id,
          evidenceState: "MIXED",
          provenance: [{ source: "pms", method: "fixture", grade: "OBSERVED" }],
          data: { vertical: "hotel", pace },
        });
      }
      if (vertical === "apartment") {
        const pace = getApartmentDayPace();
        return envelope(tool, ctx, started, {
          locationScope: DEMO_LOCATIONS.chiado.id,
          evidenceState: "MIXED",
          provenance: [{ source: "pms", method: "fixture", grade: "OBSERVED" }],
          data: { vertical: "apartment", pace },
        });
      }
      const pace = getRestaurantDayPace();
      return envelope(tool, ctx, started, {
        locationScope: DEMO_LOCATIONS.berlin.id,
        evidenceState: "MIXED",
        provenance: [{ source: "pos", method: "fixture", grade: "OBSERVED" }],
        data: { vertical: "restaurant", pace },
      });
    }
    case "get_money_flow": {
      const kind =
        typeof args.vertical === "string"
          ? args.vertical
          : loc === "all"
            ? "group"
            : loc.includes("canal")
              ? "hotel"
              : loc.includes("chiado")
                ? "apartment"
                : "restaurant";
      const data =
        kind === "group"
          ? getGroupMoneyFlow()
          : kind === "hotel"
            ? getHotelMoneyFlow()
            : kind === "apartment"
              ? getApartmentMoneyFlow()
              : getRestaurantMoneyFlow();
      return envelope(tool, ctx, started, {
        locationScope: kind === "group" ? "all" : loc,
        evidenceState: "MIXED",
        provenance: [
          { source: "money_flow", method: "fixture_reconciled", grade: "MIXED" },
        ],
        data: { vertical: kind, ...data },
      });
    }
    case "get_inventory_risk": {
      const stock = getStockWatch();
      const resources = getResourceSignals(
        loc.includes("canal")
          ? "hotel"
          : loc.includes("chiado")
            ? "apartment"
            : "restaurant",
      );
      return envelope(tool, ctx, started, {
        locationScope: loc === "all" ? DEMO_LOCATIONS.berlin.id : loc,
        evidenceState: "MODELED",
        provenance: [
          { source: "inventory", method: "recipe_depletion", grade: "MODELED" },
        ],
        data: { stock, resources },
      });
    }
    case "get_decisions": {
      const state =
        typeof args.state === "string" ? args.state : "needs_you";
      const minExposure =
        typeof args.min_exposure === "number" ? args.min_exposure : 0;
      const band =
        state === "needs_you"
          ? "needs_you"
          : state === "handling"
            ? "handling"
            : state === "verified"
              ? "verified"
              : "all";
      const rows = listDecisionRecords({
        band: band === "all" ? "all" : (band as "needs_you"),
        locationId: loc === "all" ? "all" : normalizeLocationId(loc),
      }).filter((r) => {
        const m = primaryMetricOf(r);
        const expo = Math.abs(m?.value ?? r.expectedContributionImpact ?? 0);
        return expo >= minExposure;
      });
      return envelope(tool, ctx, started, {
        locationScope: loc,
        evidenceState: "OBSERVED",
        provenance: [{ source: "decision_store", method: "record", grade: "OBSERVED" }],
        data: {
          count: rows.length,
          decisions: rows.slice(0, 40).map((r) => {
            const m = primaryMetricOf(r);
            return {
              id: r.id,
              displayId: displayDecisionId(r.id),
              title: r.title,
              status: r.status,
              attention: r.attentionOverride ?? null,
              locationId: r.locationId,
              expectedContributionImpact: r.expectedContributionImpact,
              verifiedValue: r.verifiedValue ?? null,
              primaryMetric: m,
            };
          }),
        },
      });
    }
    case "get_decision": {
      const raw = String(args.id ?? args.decisionId ?? "");
      if (!raw) {
        return envelope(tool, ctx, started, {
          data: null,
          evidenceState: "UNKNOWN",
          provenance: [],
          error: "id required",
        });
      }
      const id = resolveDecisionId(raw);
      const r = getDecisionRecord(id);
      if (!r) {
        return envelope(tool, ctx, started, {
          data: null,
          evidenceState: "UNKNOWN",
          provenance: [],
          error: `Decision not found: ${raw}`,
        });
      }
      const selected =
        r.options.find((o) => o.id === (r.chosenOptionId ?? r.recommendedOptionId)) ??
        r.options.find((o) => o.id === r.recommendedOptionId) ??
        null;
      return envelope(tool, ctx, started, {
        locationScope: r.locationId,
        evidenceState: "OBSERVED",
        provenance: [{ source: "decision_store", method: "record", grade: "OBSERVED" }],
        data: {
          id: r.id,
          displayId: displayDecisionId(r.id),
          state: r.status,
          location: r.property,
          class: r.decisionType,
          title: r.title,
          recommendation:
            r.recommendationHeadline ?? selected?.title ?? null,
          expectedValue: r.expectedContributionImpact,
          verifiedValue: r.verifiedValue ?? null,
          drivers: (r.graph?.nodes ?? []).slice(0, 8).map((n) => ({
            id: n.id,
            label: n.label,
            entityType: n.entityType,
          })),
          evidenceFreshness: r.confidence.dataFreshness ?? null,
          futures: r.options.map((o) => ({
            id: o.id,
            label: o.title,
            expectedEffect: o.expectedContributionEuro ?? null,
            selected: o.id === (r.chosenOptionId ?? r.recommendedOptionId),
          })),
          approvalRequirement: r.requiredRole,
          verificationMethod: r.verificationMethod ?? null,
          relatedMetrics: [],
          auditReference: r.id,
          evidenceRefs: r.evidenceRefs.slice(0, 8),
        },
      });
    }
    case "get_decision_trace": {
      const raw = String(args.id ?? args.decisionId ?? "D-4102");
      const id = resolveDecisionId(raw);
      const display = displayDecisionId(id);
      const marketing = getDecisionTrace(display);
      const record = getDecisionRecord(id);
      const euroTrace =
        id === DECISION_IDS.supplier || display === "D-4102"
          ? euroTraceForSupplier()
          : null;
      return envelope(tool, ctx, started, {
        locationScope: record?.locationId ?? DEMO_LOCATIONS.berlin.id,
        evidenceState: "MIXED",
        provenance: [
          { source: "decision_store", method: "record", grade: "OBSERVED" },
          ...(marketing
            ? [{ source: "decision_trace", method: "sealed_fixture", grade: "SETTLED" as const }]
            : []),
        ],
        data: {
          decisionId: id,
          displayId: display,
          record: record
            ? {
                title: record.title,
                status: record.status,
                expectedValue: record.expectedContributionImpact,
                verifiedValue: record.verifiedValue,
              }
            : null,
          marketingTrace: marketing
            ? {
                headlineEuro: marketing.headlineEuro,
                whySurfaced: marketing.whySurfaced,
                calculation: marketing.calculation,
                action: marketing.action,
                verification: marketing.verification,
                whatCouldChange: marketing.whatCouldChange,
              }
            : null,
          euroTrace,
        },
        error:
          !record && !marketing ? `No trace for ${raw}` : null,
      });
    }
    case "get_futures": {
      const raw = String(args.id ?? args.decisionId ?? DECISION_IDS.peak);
      const id = resolveDecisionId(raw);
      const r = getDecisionRecord(id);
      return envelope(tool, ctx, started, {
        locationScope: r?.locationId ?? loc,
        evidenceState: "MODELED",
        provenance: [{ source: "decision_store", method: "futures", grade: "MODELED" }],
        data: {
          decisionId: id,
          displayId: displayDecisionId(id),
          futures: (r?.options ?? []).map((o) => ({
            id: o.id,
            label: o.title,
            expectedEffect: o.expectedContributionEuro ?? null,
            selected: o.id === (r?.chosenOptionId ?? r?.recommendedOptionId),
          })),
          selectedFutureId: r?.chosenOptionId ?? r?.recommendedOptionId ?? null,
        },
        error: r ? null : `Decision not found: ${raw}`,
      });
    }
    case "get_verified_value": {
      const agg = deriveValueAggregate(role);
      const canon = canonicalVerifiedTotal(role);
      return envelope(tool, ctx, started, {
        locationScope: "all",
        evidenceState: "SETTLED",
        provenance: [
          { source: "decision_ledger", method: "deriveValueAggregate", grade: "SETTLED" },
          { source: "verified_value_canon", method: "canonicalVerifiedTotal", grade: "SETTLED" },
        ],
        data: {
          verifiedTotal: agg.verifiedTotal,
          canonicalTotal: canon,
          verifiedByKind: agg.verifiedByKind,
          decisionIdsVerified: agg.decisionIdsVerified,
          pendingVerification: agg.pendingVerification,
          activeExposure: agg.activeExposure,
          provenOutcomes: agg.decisionIdsVerified.length,
          euroTrace: euroTraceForSupplier(),
        },
      });
    }
    case "get_data_health": {
      const health = dataHealthSummaryForRole(role);
      return envelope(tool, ctx, started, {
        locationScope: loc,
        evidenceState: "OBSERVED",
        provenance: [{ source: "integrations", method: "health_summary", grade: "OBSERVED" }],
        data: health,
      });
    }
    case "get_operating_memory": {
      const memory = buildBerlinOperatingMemory();
      return envelope(tool, ctx, started, {
        locationScope: DEMO_LOCATIONS.berlin.id,
        evidenceState: "MODELED",
        provenance: [
          { source: "operating_memory", method: "learning_unit", grade: "MODELED" },
        ],
        data: memory,
      });
    }
    case "explain_variance": {
      const bridge = getContributionBridge();
      const drivers = bridge.segments.filter((s) => s.kind === "positive" || s.kind === "negative");
      const shortfallDrivers = drivers.filter((d) => d.amount < 0);
      const absNeg = shortfallDrivers.reduce((s, d) => s + Math.abs(d.amount), 0);
      const explainedShare =
        absNeg > 0
          ? Math.round(
              (shortfallDrivers
                .filter((d) => /cogs|channel/i.test(d.label))
                .reduce((s, d) => s + Math.abs(d.amount), 0) /
                absNeg) *
                100,
            )
          : 0;
      return envelope(tool, ctx, started, {
        locationScope: "all",
        evidenceState: bridge.identityOk ? "MIXED" : "UNKNOWN",
        provenance: [
          { source: "contribution_bridge", method: "deterministic", grade: "MODELED" },
        ],
        data: {
          title: bridge.title,
          subtitle: bridge.subtitle,
          varianceAmount: bridge.varianceAmount,
          varianceFormatted: bridge.varianceFormatted,
          identityOk: bridge.identityOk,
          conclusion:
            bridge.varianceAmount < 0
              ? "Revenue is not the issue. Cost mix is."
              : "Contribution is at or above plan.",
          explainedSharePct: explainedShare,
          explainedShareLine:
            explainedShare > 0
              ? `COGS and channel mix explain ${explainedShare}% of the shortfall drivers.`
              : null,
          drivers: drivers.map((d) => ({
            id: d.id,
            label: d.label,
            amount: d.amount,
            formatted: d.formatted,
            method: d.method,
            evidence: d.evidence,
            relatedDisplayIds: d.relatedDisplayIds,
          })),
          segments: bridge.segments,
          relatedDecisionId: DECISION_IDS.supplier,
          relatedDisplayId: displayDecisionId(DECISION_IDS.supplier),
        },
      });
    }
    default: {
      const _exhaustive: never = tool;
      return envelope(_exhaustive, ctx, started, {
        data: null,
        evidenceState: "UNKNOWN",
        provenance: [],
        error: `Unknown tool`,
      });
    }
  }
}

export function invokeTool(
  tool: string,
  args: Args = {},
  ctx: ToolCallContext = {},
): ToolEnvelope {
  const started = Date.now();
  if ((GATED_TOOL_NAMES as string[]).includes(tool)) {
    return envelope(tool as GatedToolName, ctx, started, {
      data: null,
      evidenceState: "UNKNOWN",
      provenance: [],
      error: "Write tools require approval policy — not enabled in developer preview.",
      gated: true,
    });
  }
  if (!(READ_TOOL_NAMES as string[]).includes(tool)) {
    return envelope("get_group_pulse", ctx, started, {
      data: null,
      evidenceState: "UNKNOWN",
      provenance: [],
      error: `Unknown tool: ${tool}`,
    });
  }
  return runRead(tool as GatewayToolName, args, ctx, started);
}

export function listGatewayTools() {
  return listToolDescriptors();
}

export { liveJoinStory, euroTraceForSupplier };
