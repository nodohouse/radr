/**
 * Intelligence ops selectors — real fixture metrics per module.
 * Never return empty “—” placeholders when demo data exists.
 */

import { berlinMenuItems } from "@/data/demo/menuIntelligence";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  hotelVerifiedExamples,
  hotelVerifiedTotal,
} from "@/lib/radr/demo/hotelDecisions";
import { buildVerifiedValueTrend } from "@/lib/radr/product/demoValueHistory";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { orgForVertical } from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { getLiveServicePerformance } from "@/lib/radr/intelligence/liveService";
import type { IntelJudgment } from "@/lib/radr/intelligence/moduleRegistry";
import { ALL_SOURCES } from "@/lib/radr/product/integrations";

export type MetricModuleState =
  | "ACTIVE"
  | "WITHIN_EXPECTATIONS"
  | "WATCHING"
  | "DECISION_FORMED"
  | "MISSING_DATA"
  | "STALE"
  | "DISCONNECTED";

export type MetricModuleReport = {
  moduleId: string;
  primaryLabel: string;
  primaryValue: string;
  comparisonLabel: string;
  comparisonValue: string;
  spark?: { label: string; actual: number; compare: number }[];
  radrRead: string;
  judgment: IntelJudgment;
  state: MetricModuleState;
  relatedDecisionId: string | null;
  comparisonType: string;
  periodLabel: string;
  needsData?: string;
  healthNote?: string;
};

export type SettlementBridgeReport = {
  posExpected: number;
  fees: number;
  refunds: number;
  timing: number;
  expectedSettlement: number;
  received: number;
  unexplained: number;
  radrRead: string;
  judgment: IntelJudgment;
  relatedDecisionId: string | null;
};

export function getSettlementBridge(): SettlementBridgeReport {
  const posExpected = 41884;
  const fees = 892;
  const refunds = 340;
  const timing = 210;
  const expectedSettlement = posExpected - fees - refunds - timing;
  const received = expectedSettlement - 395;
  return {
    posExpected,
    fees,
    refunds,
    timing,
    expectedSettlement,
    received,
    unexplained: 395,
    radrRead:
      "POS expected settlement leaves an unexplained €395 gap after fees, refunds, and known timing. Reconciliation Decision formed.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: null,
  };
}

export type SupplierVarianceSummary = {
  invoiceRate: number;
  contractRate: number;
  liters: number;
  exposedEuro: number;
  radrRead: string;
  judgment: IntelJudgment;
  relatedDecisionId: string;
};

export function getSupplierVarianceSummary(): SupplierVarianceSummary {
  return {
    invoiceRate: 7.45,
    contractRate: 6.8,
    liters: 420,
    exposedEuro: 273,
    radrRead:
      "Invoice rate €7.45/L vs contracted €6.80/L on 420 L. €273 exposed on this invoice — Supplier / AP Decision ready.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: DECISION_IDS.supplier,
  };
}

export type MenuContributionPoint = {
  itemId: string;
  name: string;
  units: number;
  contribution: number;
  revenue: number;
  outlier: boolean;
};

export type MenuContributionReport = {
  points: MenuContributionPoint[];
  radrRead: string;
  judgment: IntelJudgment;
  relatedDecisionId: string;
};

export function getMenuContribution(): MenuContributionReport {
  const items = berlinMenuItems();
  const points: MenuContributionPoint[] = items.slice(0, 8).map((item) => {
    const units = Math.max(1, Math.round(420 * (item.salesMixPct / 100)));
    return {
      itemId: item.itemId,
      name: item.name,
      units,
      contribution: Math.round(units * item.contribution),
      revenue: Math.round(units * item.price),
      outlier: item.name.includes("Tuna") || item.classicMenuClass === "PUZZLE",
    };
  });
  return {
    points,
    radrRead:
      "Tuna Tataki sits high on demand but trails peers on contribution per kitchen minute — Menu Economics Decision open.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: DECISION_IDS.menuPeak,
  };
}

function laborSourceStale(): boolean {
  // Labor not in vendor list — treat as stale when no dedicated labor connector
  return true;
}

function deliveryDegraded(): boolean {
  return ALL_SOURCES.some(
    (s) => s.id === "deliverect" && s.status === "DEGRADED",
  );
}

export function getRevenueVsForecast(): MetricModuleReport {
  const live = getLiveServicePerformance();
  return {
    moduleId: "revenue_vs_forecast",
    primaryLabel: "Revenue",
    primaryValue: `€${live.revenue.toLocaleString("en-GB")}`,
    comparisonLabel: "vs forecast at this point",
    comparisonValue: `${live.revenueDeltaPct >= 0 ? "+" : ""}${live.revenueDeltaPct}% · €${live.forecastAtNow.toLocaleString("en-GB")}`,
    spark: live.series
      .filter((s) => s.label !== "CLOSE" || s.forecastRevenue > 0)
      .map((s) => ({
        label: s.label,
        actual: s.actualRevenue,
        compare: s.forecastRevenue,
      })),
    radrRead: live.active
      ? "Revenue is ahead of plan, but kitchen pressure is increasing faster than covers. No intervention recommended yet."
      : "No active service. Next dinner opens at 18:00.",
    judgment: live.active ? "WATCHING" : "NO_ACTION",
    state: live.active ? "WATCHING" : "WITHIN_EXPECTATIONS",
    relatedDecisionId: live.relatedDecisionId,
    comparisonType: "VS FORECAST",
    periodLabel: "Live · dinner",
  };
}

export function getCoversVsForecast(): MetricModuleReport {
  const live = getLiveServicePerformance();
  const pct = Math.round((live.covers / Math.max(live.coversForecast, 1)) * 100);
  return {
    moduleId: "covers_vs_forecast",
    primaryLabel: "Covers",
    primaryValue: `${live.covers}`,
    comparisonLabel: "vs forecast",
    comparisonValue: `${live.coversForecast} forecast · ${pct}% of plan`,
    radrRead:
      "Cover pace is behind forecast while average spend is ahead. Mix, not volume, is carrying the night.",
    judgment: "WATCHING",
    state: "WATCHING",
    relatedDecisionId: DECISION_IDS.peak,
    comparisonType: "VS FORECAST",
    periodLabel: "Live · dinner",
  };
}

export function getKitchenPressure(): MetricModuleReport {
  const live = getLiveServicePerformance();
  return {
    moduleId: "kitchen_pressure",
    primaryLabel: "Kitchen pressure",
    primaryValue: `${live.kitchenPressure}%`,
    comparisonLabel: "Intervention threshold",
    comparisonValue: `Material above ${live.interventionThreshold}%`,
    radrRead:
      "Pressure is rising faster than covers under current menu mix. No intervention yet — watch above 94%.",
    judgment: "WATCHING",
    state: "WATCHING",
    relatedDecisionId: DECISION_IDS.peak,
    comparisonType: "VS LOCATION BASELINE",
    periodLabel: "Live · dinner",
  };
}

export function getVerifiedValueTrendModule(
  vertical: DemoVerticalFamily = "restaurant",
): MetricModuleReport {
  if (vertical === "hotel") {
    // Canonical Canal House hotel MTD — must match Control Center / Value.
    const total = hotelVerifiedTotal();
    const sealed = hotelVerifiedExamples().length;
    return {
      moduleId: "verified_value_trend",
      primaryLabel: "Verified Value",
      primaryValue: `€${total.toLocaleString("en-GB")}`,
      comparisonLabel: "MTD cumulative",
      comparisonValue: `${sealed} sealed Decisions`,
      radrRead:
        "Verified Value is Decision-linked. Every euro on this curve opens its Decision path.",
      judgment: "VERIFIED_OUTCOME",
      state: "ACTIVE",
      relatedDecisionId: null,
      comparisonType: "VS PRIOR MTD",
      periodLabel: "MTD",
    };
  }
  const agg = deriveValueAggregate("cfo", vertical);
  const trend = buildVerifiedValueTrend("cfo");
  const last = trend[trend.length - 1];
  return {
    moduleId: "verified_value_trend",
    primaryLabel: "Verified Value",
    primaryValue: `€${agg.verifiedTotal.toLocaleString("en-GB")}`,
    comparisonLabel: "MTD cumulative",
    comparisonValue: last
      ? `${trend.filter((p) => p.decisionId).length} sealed Decisions`
      : "No sealed outcomes",
    spark: trend.map((p) => ({
      label: p.label,
      actual: p.cumulative,
      compare: p.cumulative,
    })),
    radrRead:
      "Verified Value is Decision-linked. Every euro on this curve opens its Decision path.",
    judgment: "VERIFIED_OUTCOME",
    state: "ACTIVE",
    relatedDecisionId: last?.decisionId ?? null,
    comparisonType: "VS PRIOR MTD",
    periodLabel: "MTD",
  };
}

export function getLocationExposure(
  vertical: DemoVerticalFamily = "restaurant",
): MetricModuleReport {
  const agg = deriveValueAggregate("cfo", vertical);
  const org = orgForVertical(vertical);
  const names = org.locations
    .slice(0, 3)
    .map((l) => locationDisplayName(l.id).split("·")[0]!.trim())
    .join(" · ");
  return {
    moduleId: "location_exposure",
    primaryLabel: "Active exposure",
    primaryValue: `€${agg.activeExposureOrOpportunity.toLocaleString("en-GB")}`,
    comparisonLabel: `Across ${org.shortName}`,
    comparisonValue: names,
    radrRead:
      "Exposure concentrates where Decisions still need judgment. Portfolio median is quieter than the peak location.",
    judgment: "WATCHING",
    state: "WATCHING",
    relatedDecisionId:
      vertical === "hotel" ? DECISION_IDS.hotelReadiness : DECISION_IDS.peak,
    comparisonType: "VS PORTFOLIO MEDIAN",
    periodLabel: "Today",
  };
}

export function getBookingPace(): MetricModuleReport {
  return {
    moduleId: "booking_pace",
    primaryLabel: "Booking pace",
    primaryValue: "+6.4%",
    comparisonLabel: "vs same weekday average",
    comparisonValue: "142 covers booked · 134 avg Friday",
    radrRead:
      "Pace is ahead of the Friday baseline. Walk-in share remains within expected band — watching, not deciding.",
    judgment: "WATCHING",
    state: "WITHIN_EXPECTATIONS",
    relatedDecisionId: null,
    comparisonType: "VS SAME WEEKDAY AVERAGE",
    periodLabel: "Tonight",
  };
}

export function getLaborProductivity(): MetricModuleReport {
  if (laborSourceStale()) {
    return {
      moduleId: "labor_productivity",
      primaryLabel: "Revenue / labor hour",
      primaryValue: "€86",
      comparisonLabel: "vs comparable Friday",
      comparisonValue: "€91 · STALE · 4h",
      radrRead:
        "Labor cost appears elevated, but menu mix explains more of contribution variance. Do not cut labor from a stale feed alone.",
      judgment: "WATCHING",
      state: "STALE",
      relatedDecisionId: DECISION_IDS.peak,
      comparisonType: "VS PREVIOUS COMPARABLE SERVICE",
      periodLabel: "Tonight",
      healthNote: "Last successful sync 15:40 · metric may be outdated.",
      needsData: undefined,
    };
  }
  return {
    moduleId: "labor_productivity",
    primaryLabel: "Revenue / labor hour",
    primaryValue: "€91",
    comparisonLabel: "vs comparable Friday",
    comparisonValue: "Within ±5%",
    radrRead: "Within expected range. No action recommended.",
    judgment: "NO_ACTION",
    state: "WITHIN_EXPECTATIONS",
    relatedDecisionId: null,
    comparisonType: "VS PREVIOUS COMPARABLE SERVICE",
    periodLabel: "Tonight",
  };
}

export function getChannelMix(): MetricModuleReport {
  if (deliveryDegraded()) {
    return {
      moduleId: "channel_mix",
      primaryLabel: "Delivery share",
      primaryValue: "+8.1pp",
      comparisonLabel: "vs comparable Fridays",
      comparisonValue: "Contribution impact −€430 · provisional",
      radrRead:
        "Delivery share is up versus comparable Fridays. Deliverect is degraded — treat fee impact as provisional until the feed recovers.",
      judgment: "WATCHING",
      state: "STALE",
      relatedDecisionId: null,
      comparisonType: "VS PREVIOUS COMPARABLE SERVICE",
      periodLabel: "Tonight",
      healthNote: "Deliverect DEGRADED · 4m",
      needsData: undefined,
    };
  }
  return {
    moduleId: "channel_mix",
    primaryLabel: "Delivery share",
    primaryValue: "22%",
    comparisonLabel: "vs comparable Fridays",
    comparisonValue: "+1.2pp",
    radrRead: "Within expected range. No action recommended.",
    judgment: "NO_ACTION",
    state: "WITHIN_EXPECTATIONS",
    relatedDecisionId: null,
    comparisonType: "VS PREVIOUS COMPARABLE SERVICE",
    periodLabel: "Tonight",
  };
}

/** Resolve any registry module id to a metric report when specialized UI is absent. */
export function getMetricModule(
  moduleId: string,
  vertical: DemoVerticalFamily = "restaurant",
): MetricModuleReport | null {
  switch (moduleId) {
    case "revenue_vs_forecast":
      return getRevenueVsForecast();
    case "covers_vs_forecast":
      return getCoversVsForecast();
    case "kitchen_pressure":
      return getKitchenPressure();
    case "verified_value_trend":
      return getVerifiedValueTrendModule(vertical);
    case "location_exposure":
      return getLocationExposure(vertical);
    case "booking_pace":
      return getBookingPace();
    case "labor_productivity":
      return getLaborProductivity();
    case "channel_mix":
      return getChannelMix();
    default:
      return null;
  }
}
