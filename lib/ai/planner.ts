/**
 * Intent → tools plan. Tools compute; composers format.
 * CONTROL_CENTER_SUMMARY is never the fallback for unmatched questions.
 */

import type { AskToolName } from "./tools";
import type { ResolvedContext } from "./context";
import type { ButlerSession, ButlerTopic } from "@/lib/radr/butler/types";
import type { AskIntentClass, ClassifiedIntent } from "./intents";
import { classifyAskIntent } from "./intents";

/** @deprecated Prefer AskIntentClass - kept for compose switch compatibility */
export type AskIntent = AskIntentClass;

export type AskPlan = {
  intent: AskIntentClass;
  topic: ButlerTopic;
  tools: AskToolName[];
  analyzing: { id: string; label: string }[];
  classification: ClassifiedIntent;
  queryPlan: {
    intent: AskIntentClass;
    scope: string;
    time: string;
    tools: AskToolName[];
    renderer: string;
  };
};

function topicFor(intent: AskIntentClass): ButlerTopic {
  switch (intent) {
    case "CONTROL_CENTER_SUMMARY":
      return "attention";
    case "LABOR_REQUIREMENT":
    case "LABOR_COST":
    case "SERVICE_PRESSURE":
      return "labor";
    case "RESERVATION_SUMMARY":
      return "reservations";
    case "WAITLIST_STATUS":
      return "waitlist";
    case "CANCELLATION_EXPOSURE":
    case "RECOVERY_OPPORTUNITY":
      return "cancellations";
    case "SUPPLIER_VARIANCE":
    case "INVOICE_ANALYSIS":
      return "supplier";
    case "VERIFIED_VALUE":
      return "verified_value";
    case "CHANNEL_ECONOMICS":
      return "general";
    case "ACTIVE_REVENUE":
      return "general";
    case "FORECAST":
      return "forecast";
    case "WEATHER_CONTEXT":
      return "forecast";
    case "GUEST_VALUE":
      return "reservations";
    case "HOSPITALITY_SAFETY":
      return "reservations";
    case "LOCATION_COMPARISON":
      return "amsterdam";
    case "DATA_PROVENANCE":
      return "exposure_breakdown";
    case "TERM":
      return "term";
    case "NAVIGATION":
      return "command";
    default:
      return "general";
  }
}

function rendererFor(intent: AskIntentClass): string {
  switch (intent) {
    case "LABOR_REQUIREMENT":
      return "staffingRecommendation";
    case "LABOR_COST":
      return "laborCost";
    case "RESERVATION_SUMMARY":
      return "reservationPulse";
    case "WAITLIST_STATUS":
      return "waitlist";
    case "CANCELLATION_EXPOSURE":
    case "RECOVERY_OPPORTUNITY":
      return "cancellationRecovery";
    case "MARGIN_ANALYSIS":
      return "marginBridge";
    case "REVENUE_ANALYSIS":
      return "revenue";
    case "LOCATION_COMPARISON":
      return "locationComparison";
    case "SUPPLIER_VARIANCE":
    case "INVOICE_ANALYSIS":
      return "supplierVariance";
    case "VERIFIED_VALUE":
      return "verifiedValue";
    case "CONTROL_CENTER_SUMMARY":
      return "executiveSummary";
    case "DATA_PROVENANCE":
      return "provenance";
    case "DATA_HEALTH":
      return "dataHealth";
    case "GUEST_VALUE":
      return "guestValue";
    case "HOSPITALITY_SAFETY":
      return "hospitalitySafety";
    case "CLARIFY":
      return "clarification";
    default:
      return "generic";
  }
}

function toolsFor(
  intent: AskIntentClass,
  ctx: ResolvedContext,
): { tools: AskToolName[]; analyzing: { id: string; label: string }[] } {
  switch (intent) {
    case "LABOR_REQUIREMENT":
    case "SERVICE_PRESSURE":
      return {
        tools: [
          "get_labor_requirement",
          "get_reservations",
          "get_forecast",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "res", label: "Reservations" },
          { id: "forecast", label: "Forecast" },
          { id: "labor", label: "Labor schedule" },
        ],
      };
    case "LABOR_COST":
      return {
        tools: ["get_labor_status", "get_margin", "get_revenue", "get_data_freshness"],
        analyzing: [
          { id: "labor", label: "Labor cost" },
          { id: "pos", label: "POS" },
        ],
      };
    case "RESERVATION_SUMMARY":
      return {
        tools: [
          "get_reservations",
          "get_waitlist",
          "get_forecast",
          "get_service_status",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "res", label: "Reservations" },
          { id: "forecast", label: "Forecast" },
          { id: "svc", label: "Service curve" },
        ],
      };
    case "WAITLIST_STATUS":
      return {
        tools: ["get_waitlist", "get_data_freshness"],
        analyzing: [
          { id: "res", label: "Reservations" },
          { id: "wl", label: "Waitlist" },
        ],
      };
    case "CANCELLATION_EXPOSURE":
    case "RECOVERY_OPPORTUNITY":
      return {
        tools: ["get_cancellations", "get_waitlist", "get_data_freshness"],
        analyzing: [
          { id: "cancel", label: "Cancellations" },
          { id: "wl", label: "Waitlist" },
        ],
      };
    case "MARGIN_ANALYSIS":
      return {
        tools: [
          "get_margin",
          "get_revenue",
          "get_labor_status",
          "get_supplier_variances",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "margin", label: "Margin" },
          { id: "labor", label: "Labor" },
          { id: "buy", label: "Supplier data" },
        ],
      };
    case "REVENUE_ANALYSIS":
      return {
        tools: ["get_revenue", "get_margin", "get_data_freshness"],
        analyzing: [
          { id: "pos", label: "POS" },
          { id: "margin", label: "Margin" },
        ],
      };
    case "CHANNEL_ECONOMICS":
      return {
        tools: ["get_channel_economics", "get_data_freshness"],
        analyzing: [
          { id: "pos", label: "POS" },
          { id: "delivery", label: "Delivery platforms" },
          { id: "channel", label: "Channel contribution" },
        ],
      };
    case "ACTIVE_REVENUE":
      return {
        tools: [
          "get_active_revenue",
          "get_cancellations",
          "get_waitlist",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "cancel", label: "Cancellations" },
          { id: "wl", label: "Waitlist" },
          { id: "guest", label: "Guest opportunities" },
        ],
      };
    case "SUPPLIER_VARIANCE":
    case "INVOICE_ANALYSIS":
      return {
        tools: ["get_supplier_variances", "get_data_freshness"],
        analyzing: [
          { id: "inv", label: "Invoices" },
          { id: "contract", label: "Contracts" },
        ],
      };
    case "FORECAST":
      return {
        tools: ["get_forecast", "get_reservations", "get_data_freshness"],
        analyzing: [
          { id: "forecast", label: "Forecast" },
          { id: "res", label: "Reservations" },
        ],
      };
    case "WEATHER_CONTEXT":
      return {
        tools: [
          "get_weather",
          "get_forecast",
          "get_labor_status",
          "get_reservations",
          "get_findings",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "wx", label: "Weather forecast" },
          { id: "hist", label: "Comparable periods" },
          { id: "labor", label: "Labor plan" },
          { id: "res", label: "Reservation pace" },
        ],
      };
    case "GUEST_VALUE":
      return {
        tools: ["get_guest_value", "get_reservations", "get_data_freshness"],
        analyzing: [
          { id: "guest", label: "Guest history" },
          { id: "pos", label: "POS spend" },
          { id: "res", label: "Reservations" },
        ],
      };
    case "HOSPITALITY_SAFETY":
      return {
        tools: ["get_hospitality", "get_data_freshness"],
        analyzing: [
          { id: "hosp", label: "Hospitality notes" },
          { id: "allerg", label: "Allergy / dietary" },
          { id: "menu", label: "Menu allergen data" },
        ],
      };
    case "LOCATION_COMPARISON":
      return {
        tools: ["compare_locations", "get_data_freshness"],
        analyzing: [
          { id: "a", label: ctx.locationName },
          { id: "b", label: "Peer location" },
        ],
      };
    case "VERIFIED_VALUE":
      return {
        tools: ["get_verified_value", "get_cancellations", "get_data_freshness"],
        analyzing: [{ id: "value", label: "Verified value" }],
      };
    case "DATA_PROVENANCE":
    case "CONTROL_CENTER_SUMMARY":
      return {
        tools: [
          ctx.isGroup ? "get_group_summary" : "get_location_summary",
          "get_findings",
          "get_data_freshness",
        ],
        analyzing: [
          { id: "summary", label: ctx.locationName },
          { id: "findings", label: "Findings" },
        ],
      };
    case "DATA_HEALTH":
      return {
        tools: ["get_data_freshness"],
        analyzing: [{ id: "data", label: "Data health" }],
      };
    case "TERM":
    case "CLARIFY":
    case "NAVIGATION":
    case "FOLLOW_UP":
    case "METRIC_EXPLANATION":
      return {
        tools: ["get_data_freshness"],
        analyzing: [{ id: "ctx", label: "Context" }],
      };
    default:
      return {
        tools: ["get_data_freshness"],
        analyzing: [{ id: "ctx", label: "Context" }],
      };
  }
}

export function planAsk(
  question: string,
  ctx: ResolvedContext,
  session?: ButlerSession,
): AskPlan {
  const classification = classifyAskIntent(question, {
    followUp: ctx.followUp,
    priorIntent: session?.topic,
    priorTopic: session?.topic,
    priorQuery: session?.lastQuery,
    period: ctx.period,
  });

  return planFromClassification(classification, ctx);
}

/** Rebuild a plan when LLM (or another classifier) overrides intent. */
export function planFromClassification(
  classification: ClassifiedIntent,
  ctx: ResolvedContext,
): AskPlan {
  const intent = classification.intent;
  const { tools, analyzing } = toolsFor(intent, ctx);
  const topic = topicFor(intent);

  return {
    intent,
    topic,
    tools,
    analyzing,
    classification,
    queryPlan: {
      intent,
      scope: ctx.locationName,
      time: ctx.periodLabel,
      tools,
      renderer: rendererFor(intent),
    },
  };
}
