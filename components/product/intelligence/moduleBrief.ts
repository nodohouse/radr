/**
 * Presentation-only brief for an Intelligence module:
 * question · current state · materiality · evidence · Decision status.
 * Reads existing module reports — never invents numbers.
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import {
  getMetricModule,
  getSettlementBridge,
  getSupplierVarianceSummary,
} from "@/lib/radr/intelligence/opsModules";
import { getCostMovers } from "@/lib/radr/procurement/costMovers";
import { getTopDishes } from "@/lib/radr/intelligence/topDishes";
import {
  getHotelCancelModule,
  getHotelHkModule,
  getHotelOccAdrRevparModule,
  getHotelRoomReadinessModule,
} from "@/lib/radr/intelligence/hotelModules";
import {
  getCancellationIntel,
  getCombinedTonightDemand,
} from "@/lib/radr/product/externalSignals";
import type {
  IntelJudgment,
  IntelModuleDef,
} from "@/lib/radr/intelligence/moduleRegistry";

export type IntelBrief = {
  question: string;
  /** Short state line, e.g. "+3.2% vs expected pace". */
  state: string | null;
  /** Economic / operational size of the thing. */
  materiality: { value: string; label: string } | null;
  judgment: IntelJudgment | null;
  decisionId: string | null;
  /** Higher = more material. Drives lead selection. */
  weight: number;
};

const QUESTIONS: Record<string, string> = {
  live_service: "Is tonight's service running ahead or behind?",
  live_revenue_trajectory: "Where does revenue land by close?",
  money_flow: "How much of gross becomes contribution?",
  order_flow: "Which channels are driving orders and fee drag?",
  delivery_flow: "Is delivery loading the kitchen faster than it pays?",
  stock_watch: "Which stock risk will reach the menu first?",
  demand_outlook: "What does combined demand look like for tonight?",
  top_dishes: "Which dishes earn the most per constrained kitchen minute?",
  menu_contribution: "Where do popularity and contribution disagree?",
  revenue_vs_forecast: "Is the period tracking to the operating forecast?",
  covers_vs_forecast: "Are guest volumes landing on expected covers?",
  settlement_bridge: "Does what POS expected match what was received?",
  supplier_variance: "Are invoices matching contracted supplier rates?",
  cost_movers: "Which vendor SKUs are drifting in price?",
  verified_value_trend: "How much value has RADR sealed with proof?",
  location_exposure: "Where is exposure concentrated across the estate?",
  kitchen_pressure: "When does the kitchen reach the intervention band?",
  booking_pace: "Are reservations pacing against comparable services?",
  labor_productivity: "Is labor converting into revenue per hour?",
  channel_mix: "Is channel mix helping or hurting contribution?",
  revenue_pace_day: "Are we ahead of expected-now and today's target?",
  revenue_pace_mtd: "Is the month on track to plan?",
  tonight_demand: "What do bookings, events and weather add up to tonight?",
  weather_context: "Does weather change tonight's operation?",
  event_context: "Do local events historically move demand?",
  cancellation_intel: "How much released demand is recovered vs still exposed?",
  room_readiness: "Will rooms be ready when guests arrive?",
  hotel_pickup: "Is tonight's pickup on pace for occupancy?",
  hotel_occ_adr_revpar: "How are Occ · ADR · RevPAR tracking to budget?",
  hk_productivity: "Is housekeeping keeping up with arrivals?",
  hotel_channel_mix: "Is distribution net-contribution healthy?",
  hotel_cancellation: "Which released nights can still be recovered?",
};

const EVIDENCE_LABEL: Record<string, string> = {
  pos: "POS",
  reservations: "Reservations",
  kds: "KDS",
  labor: "Labor",
  procurement: "Procurement",
  accounting: "Accounting",
  delivery: "Delivery",
  forecast: "Forecast",
  weather: "Weather",
  events: "Events",
  pms: "PMS",
  housekeeping: "Housekeeping",
  channels: "Channels",
};

export function evidenceLabels(def: IntelModuleDef): string[] {
  return def.requiredEvidence.map((e) => EVIDENCE_LABEL[e] ?? e);
}

const JUDGMENT_WEIGHT: Record<IntelJudgment, number> = {
  DECISION_FORMED: 40,
  WATCHING: 25,
  VERIFIED_OUTCOME: 20,
  NEEDS_DATA: 5,
  NO_ACTION: 8,
};

export function judgmentLabel(j: IntelJudgment | null): string {
  switch (j) {
    case "DECISION_FORMED":
      return "Decision formed";
    case "WATCHING":
      return "Watching";
    case "VERIFIED_OUTCOME":
      return "Verified";
    case "NEEDS_DATA":
      return "Needs data";
    case "NO_ACTION":
      return "No action";
    default:
      return "Context";
  }
}

function pct(n: number): string {
  return `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(1)}%`;
}

export function getIntelBrief(
  def: IntelModuleDef,
  vertical: "restaurant" | "hotel",
): IntelBrief {
  const question = QUESTIONS[def.id] ?? def.description;
  const base: IntelBrief = {
    question,
    state: null,
    materiality: null,
    judgment: null,
    decisionId: null,
    weight: 0,
  };
  const done = (b: Partial<IntelBrief>): IntelBrief => {
    const out = { ...base, ...b };
    out.weight =
      (out.judgment ? JUDGMENT_WEIGHT[out.judgment] : 0) +
      (out.decisionId ? 10 : 0) +
      (out.materiality ? 5 : 0);
    return out;
  };

  switch (def.id) {
    case "live_service": {
      const d = getLiveServicePerformance();
      if (!d.active) return done({ judgment: "NO_ACTION", state: "Between services" });
      return done({
        state: `${pct(d.revenueDeltaPct)} vs expected pace · ${d.clockLabel}`,
        materiality: {
          value: formatDecisionMoney(d.expectedClose),
          label: "expected close",
        },
        judgment: d.judgment,
        decisionId: d.relatedDecisionId,
      });
    }
    case "supplier_variance": {
      const s = getSupplierVarianceSummary();
      return done({
        state: `€${s.invoiceRate.toFixed(2)}/L vs €${s.contractRate.toFixed(2)}/L contract`,
        materiality: {
          value: formatDecisionMoney(s.exposedEuro),
          label: "exposed this invoice",
        },
        judgment: s.judgment,
        decisionId: s.relatedDecisionId,
      });
    }
    case "settlement_bridge": {
      const s = getSettlementBridge();
      return done({
        state: "POS expected → processor → accounting",
        materiality: {
          value: formatDecisionMoney(s.unexplained),
          label: "unexplained gap",
        },
        judgment: s.judgment,
        decisionId: s.relatedDecisionId,
      });
    }
    case "top_dishes": {
      const t = getTopDishes("tonight");
      return done({
        state: t.periodLabel,
        judgment: t.judgment,
        decisionId: t.relatedDecisionId,
      });
    }
    case "cost_movers": {
      const movers = getCostMovers();
      const total = movers.reduce((n, m) => n + m.exposureEuro, 0);
      const linked = movers.find((m) => m.relatedDecisionId);
      return done({
        state: `${movers.length} SKUs drifting vs contract`,
        materiality: { value: formatDecisionMoney(total), label: "exposure · 30D" },
        judgment: linked ? "DECISION_FORMED" : "WATCHING",
        decisionId: linked?.relatedDecisionId ?? null,
      });
    }
    case "tonight_demand": {
      const t = getCombinedTonightDemand();
      return done({
        state: t.implication,
        materiality: { value: pct(t.netDemandDeltaPct), label: "net demand" },
        judgment: t.judgment,
        decisionId: t.relatedDecisionId,
      });
    }
    case "cancellation_intel": {
      const c = getCancellationIntel();
      return done({
        state: `${c.count} cancellations · ${formatDecisionMoney(c.alreadyRecovered)} recovered`,
        materiality: {
          value: formatDecisionMoney(c.stillExposed),
          label: "still exposed",
        },
        judgment: c.judgment,
        decisionId: c.relatedDecisionId,
      });
    }
    default:
      break;
  }

  const hotel: Record<string, () => ReturnType<typeof getHotelRoomReadinessModule>> = {
    room_readiness: getHotelRoomReadinessModule,
    hotel_occ_adr_revpar: getHotelOccAdrRevparModule,
    hk_productivity: getHotelHkModule,
    hotel_cancellation: getHotelCancelModule,
  };
  const m = hotel[def.id]?.() ?? getMetricModule(def.id, vertical);
  if (m) {
    return done({
      state: `${m.comparisonValue} · ${m.comparisonLabel}`,
      materiality: { value: m.primaryValue, label: m.primaryLabel },
      judgment: m.judgment,
      decisionId: m.relatedDecisionId,
    });
  }
  return done({});
}
