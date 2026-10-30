/**
 * Live Operating Command — composes NOW / NEXT / CLOSE / WHY / ACTION.
 * Numbers come from canonical fixtures only. No React-side invention.
 */

import {
  forecastAtHorizon,
  getLiveServicePerformance,
  type LiveServicePerformance,
} from "@/lib/radr/intelligence/liveService";
import { getTopDishes, type TopDishRow } from "@/lib/radr/intelligence/topDishes";
import {
  getCombinedTonightDemand,
  getCancellationIntel,
  type CombinedDemandContext,
  type CancellationIntel,
} from "@/lib/radr/product/externalSignals";
import { BERLIN_LIVE_DAY, type TimelineBeat } from "@/lib/radr/product/verticalDay";
import {
  getGroupDayPace,
  getGroupMtdPace,
  type GroupDayPace,
  type MtdPace,
} from "@/lib/radr/product/revenuePacing";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { IntelJudgment } from "@/lib/radr/intelligence/moduleRegistry";
import {
  getRestaurantMoneyFlow,
  getRestaurantOrderFlow,
  getDeliveryStream,
  getStockWatch,
  getSinceChanged,
  getOrderRate,
  getLiveSourceFreshness,
  getGroupMoneyFlow,
  getCancellationFlow,
  getCoverFlow,
  getResourceSignals,
  type MoneyFlowReport,
  type OrderFlowReport,
  type DeliveryStreamReport,
  type StockWatchReport,
  type SinceChangedReport,
  type OrderRateReport,
  type LiveSourceFreshness,
  type CancellationFlow,
  type CoverFlowStage,
  type ResourceSignal,
} from "@/lib/radr/product/liveFlows";

export type LiveHorizon = "60m" | "2h" | "3h" | "close";

export type LiveMenuSignal = {
  id: string;
  label: string;
  value: string;
  detail: string;
  material: boolean;
};

export type LiveTopTonight = TopDishRow & {
  judgmentLine: string | null;
  stationPressurePct: number | null;
  stockRemaining: number | null;
  stockProjectedClose: number | null;
  stockEvidence: "OBSERVED" | "MODELED" | null;
};

export type LiveLaborRead = {
  laborDeltaPp: number;
  revenuePerLaborWithinRange: boolean;
  judgment: IntelJudgment;
  read: string;
};

export type LiveChannelRead = {
  deliverySharePct: number;
  deliveryDeltaPp: number;
  revenueLiftEuro: number;
  contributionEffectEuro: number;
  judgment: IntelJudgment;
  read: string;
};

export type LiveBookingPace = {
  deltaPctVsComparable: number;
  concentration: string;
  kitchenRisk: "LOW" | "MEDIUM" | "HIGH";
  read: string;
};

export type LiveHorizonProjection = {
  horizon: LiveHorizon;
  label: string;
  revenueForecast: number;
  coversIncoming: number;
  kitchenPressure: number;
  staffingNeed: number;
  reservationsRemaining: number;
  deliveryLoadPct: number;
};

export type LiveOperatingSurface = {
  service: LiveServicePerformance;
  timeline: TimelineBeat[];
  demand: CombinedDemandContext;
  cancellations: CancellationIntel;
  topTonight: LiveTopTonight[];
  topTonightRead: string;
  topTonightDecisionId: string | null;
  menuSignals: LiveMenuSignal[];
  labor: LiveLaborRead;
  channel: LiveChannelRead;
  bookingPace: LiveBookingPace;
  horizons: Record<LiveHorizon, LiveHorizonProjection>;
  moneyFlow: MoneyFlowReport;
  orderFlow: OrderFlowReport;
  delivery: DeliveryStreamReport;
  stock: StockWatchReport;
  sinceChanged: SinceChangedReport;
  orderRate: OrderRateReport;
  sourceFreshness: LiveSourceFreshness[];
  cancellationFlow: CancellationFlow;
  coverFlow: CoverFlowStage[];
  resources: ResourceSignal[];
};

export type LiveScenarioId =
  | "quiet_service"
  | "ahead_of_pace"
  | "behind_pace"
  | "event_surge"
  | "rain_terrace"
  | "high_cancellation"
  | "kitchen_pressure"
  | "labor_shortage"
  | "delivery_surge";

export type LiveScenarioMeta = {
  id: LiveScenarioId;
  label: string;
  paceLabel: string;
  judgment: IntelJudgment;
  heroDeltaPct: number;
};

const SCENARIOS: Record<LiveScenarioId, LiveScenarioMeta> = {
  quiet_service: {
    id: "quiet_service",
    label: "Quiet service",
    paceLabel: "On pace",
    judgment: "NO_ACTION",
    heroDeltaPct: 0.4,
  },
  ahead_of_pace: {
    id: "ahead_of_pace",
    label: "Ahead of pace",
    paceLabel: "+3.2% ahead",
    judgment: "WATCHING",
    heroDeltaPct: 3.2,
  },
  behind_pace: {
    id: "behind_pace",
    label: "Behind pace",
    paceLabel: "−4.1% behind",
    judgment: "WATCHING",
    heroDeltaPct: -4.1,
  },
  event_surge: {
    id: "event_surge",
    label: "Event surge",
    paceLabel: "+6% net demand",
    judgment: "DECISION_FORMED",
    heroDeltaPct: 5.1,
  },
  rain_terrace: {
    id: "rain_terrace",
    label: "Rain / terrace drop",
    paceLabel: "Inside compression",
    judgment: "WATCHING",
    heroDeltaPct: 1.2,
  },
  high_cancellation: {
    id: "high_cancellation",
    label: "High cancellation",
    paceLabel: "€360 still exposed",
    judgment: "DECISION_FORMED",
    heroDeltaPct: -1.4,
  },
  kitchen_pressure: {
    id: "kitchen_pressure",
    label: "Kitchen pressure",
    paceLabel: "94% at 20:18",
    judgment: "DECISION_FORMED",
    heroDeltaPct: 3.2,
  },
  labor_shortage: {
    id: "labor_shortage",
    label: "Labor shortage",
    paceLabel: "No labor action",
    judgment: "NO_ACTION",
    heroDeltaPct: 2.1,
  },
  delivery_surge: {
    id: "delivery_surge",
    label: "Delivery surge",
    paceLabel: "Watching contribution",
    judgment: "WATCHING",
    heroDeltaPct: 2.8,
  },
};

export function liveScenario(id: LiveScenarioId): LiveScenarioMeta {
  return SCENARIOS[id];
}

export function allLiveScenarios(): LiveScenarioMeta[] {
  return Object.values(SCENARIOS);
}

export function activeLiveScenario(): LiveScenarioMeta {
  return SCENARIOS.kitchen_pressure;
}

function buildHorizons(
  live: LiveServicePerformance,
): Record<LiveHorizon, LiveHorizonProjection> {
  return {
    "60m": {
      horizon: "60m",
      label: "Next 60m",
      revenueForecast: live.revenueForecast1h,
      coversIncoming: 34,
      kitchenPressure: 94,
      staffingNeed: live.laborForecastNeed,
      reservationsRemaining: 28,
      deliveryLoadPct: 22,
    },
    "2h": {
      horizon: "2h",
      label: "Next 2h",
      revenueForecast: live.revenueForecast2h,
      coversIncoming: 54,
      kitchenPressure: 78,
      staffingNeed: live.laborForecastNeed,
      reservationsRemaining: 12,
      deliveryLoadPct: 17,
    },
    "3h": {
      horizon: "3h",
      label: "Next 3h",
      revenueForecast: live.revenueForecast3h,
      coversIncoming: 66,
      kitchenPressure: 52,
      staffingNeed: 13,
      reservationsRemaining: 4,
      deliveryLoadPct: 14,
    },
    close: {
      horizon: "close",
      label: "To close",
      revenueForecast: live.expectedClose,
      coversIncoming: live.coversForecast - live.covers,
      kitchenPressure: 18,
      staffingNeed: 12,
      reservationsRemaining: 0,
      deliveryLoadPct: 12,
    },
  };
}

export function enrichTopTonight(rows: TopDishRow[]): LiveTopTonight[] {
  return rows.slice(0, 5).map((r) => {
    const isTuna = r.name.includes("Tuna");
    return {
      ...r,
      stationPressurePct: isTuna ? 8 : r.rankRevenue <= 2 ? 3 : null,
      judgmentLine: isTuna
        ? `#1 by revenue · #${r.rankKitchenMin} by contribution / kitchen minute · +8% station pressure`
        : null,
      stockRemaining: isTuna ? 24 : r.rankRevenue === 2 ? 41 : null,
      stockProjectedClose: isTuna ? 7 : r.rankRevenue === 2 ? 18 : null,
      stockEvidence: isTuna || r.rankRevenue === 2 ? "MODELED" : null,
    };
  });
}

function materialMenuSignals(rows: LiveTopTonight[]): LiveMenuSignal[] {
  const tuna = rows.find((r) => r.name.includes("Tuna"));
  const byContrib = [...rows].sort((a, b) => b.contribution - a.contribution);
  const signals: LiveMenuSignal[] = [];
  if (tuna) {
    signals.push({
      id: "kitchen_load",
      label: "Kitchen load contributor",
      value: tuna.name,
      detail: `+${tuna.stationPressurePct}% station pressure at peak`,
      material: true,
    });
  }
  if (byContrib[0]) {
    signals.push({
      id: "highest_contrib",
      label: "Highest contribution",
      value: byContrib[0].name,
      detail: formatDecisionMoney(byContrib[0].contribution),
      material: true,
    });
  }
  return signals.filter((s) => s.material).slice(0, 3);
}

export function getLiveCancellationEconomics(): CancellationIntel {
  return {
    count: 6,
    coversReleased: 18,
    expectedRevenueLost: 1_120,
    alreadyRecovered: 760,
    stillExposed: 360,
    radrRead: "€360 still exposed — recovery Decision open on waitlist path.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: "dec_table_recover_berlin",
  };
}

export function composeLiveOperatingSurface(): LiveOperatingSurface {
  const service = getLiveServicePerformance();
  const top = getTopDishes("tonight");
  const topTonight = enrichTopTonight(top.rows);
  const laborDeltaPp =
    Math.round((service.laborPct - service.laborTargetPct) * 10) / 10;

  const labor: LiveLaborRead = {
    laborDeltaPp,
    revenuePerLaborWithinRange: true,
    judgment: "NO_ACTION",
    read:
      laborDeltaPp > 0
        ? `Labor +${laborDeltaPp}pp above target. Revenue / labor hour within normal range. NO LABOR ACTION — menu mix is driving service pressure.`
        : "Labor within band. NO LABOR ACTION.",
  };

  const channel: LiveChannelRead = {
    deliverySharePct: 18.1,
    deliveryDeltaPp: 8.1,
    revenueLiftEuro: 920,
    contributionEffectEuro: -180,
    judgment: "WATCHING",
    read: "Delivery +8.1pp vs Friday baseline · revenue +€920 · contribution effect −€180. WATCHING.",
  };

  const bookingPace: LiveBookingPace = {
    deltaPctVsComparable: 9,
    concentration: "19:30–20:30",
    kitchenRisk: "HIGH",
    read: "Dinner booking pace +9% vs comparable Fridays · demand concentrated 19:30–20:30 · kitchen pressure risk HIGH.",
  };

  const demand = getCombinedTonightDemand();
  const demandAdjusted: CombinedDemandContext = {
    ...demand,
    implication: `Expected pressure ${service.kitchenProjected}% at ${service.kitchenProjectedAt}.`,
    netDemandDeltaPct: 6,
    walkInForecastCovers: 18,
  };

  return {
    service,
    timeline: BERLIN_LIVE_DAY.timeline,
    demand: demandAdjusted,
    cancellations: getLiveCancellationEconomics(),
    topTonight,
    topTonightRead: top.radrRead,
    topTonightDecisionId: top.relatedDecisionId,
    menuSignals: materialMenuSignals(topTonight),
    labor,
    channel,
    bookingPace,
    horizons: buildHorizons(service),
    moneyFlow: getRestaurantMoneyFlow(),
    orderFlow: getRestaurantOrderFlow(),
    delivery: getDeliveryStream(),
    stock: getStockWatch(),
    sinceChanged: getSinceChanged(),
    orderRate: getOrderRate(),
    sourceFreshness: getLiveSourceFreshness(),
    cancellationFlow: getCancellationFlow(),
    coverFlow: getCoverFlow(),
    resources: getResourceSignals("restaurant"),
  };
}

export function horizonProjection(
  surface: LiveOperatingSurface,
  horizon: LiveHorizon,
): LiveHorizonProjection {
  return surface.horizons[horizon];
}

export function revenueAtHorizon(
  surface: LiveOperatingSurface,
  horizon: LiveHorizon,
): number {
  return forecastAtHorizon(surface.service, horizon);
}

export type CfoLiveSurfaceModel = {
  groupDay: GroupDayPace;
  mtd: MtdPace;
  verifiedTodayFormatted: string;
  settlementExceptionEuro: number;
  cancellationExposureEuro: number;
  locations: GroupDayPace["locations"];
  moneyFlow: MoneyFlowReport;
};

export function composeCfoLiveSurface(
  vertical: "restaurant" | "hotel" = "restaurant",
): CfoLiveSurfaceModel {
  const groupDay = getGroupDayPace(vertical);
  const mtd = getGroupMtdPace();
  const cancel = getCancellationIntel();
  return {
    groupDay,
    mtd,
    verifiedTodayFormatted: formatDecisionMoney(184),
    settlementExceptionEuro: 395,
    cancellationExposureEuro: cancel.stillExposed,
    locations: groupDay.locations,
    moneyFlow: getGroupMoneyFlow(),
  };
}

export function paceHeadline(live: LiveServicePerformance): string {
  const sign = live.revenueDeltaPct >= 0 ? "+" : "";
  const word =
    live.revenueDeltaPct >= 1.5
      ? "ahead of pace"
      : live.revenueDeltaPct <= -1.5
        ? "behind pace"
        : "on pace";
  return `${sign}${live.revenueDeltaPct}% ${word}`;
}

export { displayDecisionId, DECISION_IDS };



export type BestsellerPeriod = "tonight" | "week" | "month";

export function getBestsellersForPeriod(
  period: BestsellerPeriod,
): LiveTopTonight[] {
  const report = getTopDishes(
    period === "tonight" ? "tonight" : period === "week" ? "7d" : "mtd",
  );
  const base = enrichTopTonight(report.rows);
  if (period === "tonight") return base;
  return [...base]
    .map((r, i) => ({
      ...r,
      rankRevenue:
        period === "month" && r.name.includes("Tuna")
          ? 4
          : period === "week" && r.name.includes("Tuna")
            ? 2
            : i + 1,
      vsComparablePct:
        period === "month" && r.name.includes("Tuna") ? 34 : r.vsComparablePct,
      judgmentLine:
        period === "month" && r.name.includes("Tuna")
          ? "#1 tonight · #4 MTD · Tonight demand +34% vs normal"
          : r.judgmentLine,
    }))
    .sort((a, b) => a.rankRevenue - b.rankRevenue);
}
