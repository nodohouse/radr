/**
 * Pre-shift briefing - squeeze value out of the shift before it starts.
 */

import {
  DEMO_AS_OF_ISO,
  DEMO_LOCATION_ID,
  DEMO_LOCATION_NAME,
} from "@/lib/radr/demoClock";
import { BERLIN_TONIGHT_OPS } from "@/lib/radr/venueProfiles";
import { demoFootfallProvider } from "@/lib/radr/ports/footfall";
import { composeWalkInForecast, type WalkInForecast } from "@/lib/radr/forecast/walkInForecast";
import {
  composeAreaDemandIndex,
  type AreaDemandIndex,
} from "@/lib/radr/forecast/areaDemand";
import {
  translateWeatherToOperations,
  type WeatherOperatingImpact,
} from "@/lib/radr/preShift/weatherImpact";
import {
  outdoorCapabilityForVenue,
  BERLIN_DINNER_TERRACE_CORRELATION,
  type TerraceCorrelationNight,
} from "@/lib/radr/preShift/terraceCapability";
import {
  demoBerlinConcertImpact,
  type LocalEventImpact,
} from "@/lib/radr/preShift/events";
import {
  rankMicroOpportunities,
  type MicroOpportunity,
} from "@/lib/radr/microOpportunities/types";
import { demoMenuAvailabilityRisk } from "@/lib/radr/menuAvailability";
import { composeMenuDecisionBrief } from "@/lib/radr/preShift/menuDecisionBrief";
import {
  BERLIN_BEVERAGE_SHARE_PCT,
  splitFnBNetSales,
  type FnBCategorySplit,
} from "@/lib/radr/fnb";

export type CoverDrivers = {
  reservations: number;
  walkIns: number;
  weatherTerrace: number;
  localEvent: number;
  expectedCancellations: number;
};

export type ReadinessItem = {
  id: string;
  domain:
    | "DEMAND"
    | "STAFF"
    | "MENU"
    | "BEVERAGE"
    | "TERRACE"
    | "RESERVATIONS"
    | "WALK_INS"
    | "DATA";
  status: "ready" | "watch" | "action";
  label: string;
};

export type PreShiftBrief = {
  locationId: string;
  locationName: string;
  serviceLabel: string;
  outlook: "Below normal" | "Normal" | "Above normal";
  expectedCovers: number;
  expectedWalkIns: number;
  walkInRange: { low: number; high: number };
  projectedNetSales: number;
  expectedContribution: number;
  /** Food vs beverage projected split. */
  fnb: FnBCategorySplit;
  peakWindow: { start: string; end: string };
  terraceOutlook: string;
  hasTerrace: boolean;
  terraceCorrelation: {
    liftPct: number;
    sampleSize: number;
    nights: TerraceCorrelationNight[];
    /** Counterfactual if rain probability rose tonight. */
    rainCounterfactual: {
      rainPct: number;
      coversLost: number;
      revenueAtRisk: number;
      recommendation: string;
    } | null;
  } | null;
  areaDemand: AreaDemandIndex;
  walkIns: WalkInForecast;
  weatherImpact: WeatherOperatingImpact | null;
  event: LocalEventImpact | null;
  coverDrivers: CoverDrivers;
  readiness: ReadinessItem[];
  opportunities: MicroOpportunity[];
  /** Things to fix before open - max 2 for Control Center. */
  fixBeforeOpen: {
    id: string;
    title: string;
    amount: number;
    amountLabel?: string;
    kind: "risk" | "opportunity";
    /** Time-critical action - render as EMERGENCY in Control Center. */
    urgency?: "emergency" | "high" | "normal";
    opportunityId?: string;
    /** CFO-readable operating detail (menu / labor). */
    detail?: {
      eyebrow?: string;
      summary: string;
      lines: string[];
      recommendation?: string;
      deadline?: string;
    };
  }[];
  bookingPacePct: number;
  reservationAllocatedPct: number;
  remainingCapacityCovers: number;
  holdTablesForWalkIns: number;
};

/** Deterministic Berlin dinner pre-shift fixture. */
export function composeBerlinPreShiftBrief(
  asOfIso: string = DEMO_AS_OF_ISO,
): PreShiftBrief {
  const ops = BERLIN_TONIGHT_OPS;
  const spend = 66.76; // → €9.480 projected on 142 covers
  const contributionRate = 0.618;
  const expectedCovers = 142;
  const projectedNetSales = 9480;
  const expectedContribution = 5860;
  const fnb = splitFnBNetSales(projectedNetSales, BERLIN_BEVERAGE_SHARE_PCT);

  const footfall = demoFootfallProvider.estimateAreaFootfall({
    locationId: DEMO_LOCATION_ID,
    asOf: asOfIso,
    serviceStartIso: "2026-08-19T17:00:00+02:00",
    serviceEndIso: "2026-08-19T23:00:00+02:00",
  });

  const event = demoBerlinConcertImpact();

  const walkIns = composeWalkInForecast({
    locationId: DEMO_LOCATION_ID,
    serviceLabel: "Dinner",
    baseWalkIns: 14,
    weatherLift: 5,
    eventLift: 6,
    bookingPaceLift: 2,
    transitDrag: -1,
    avgPartySize: 2.1,
    spendPerCover: spend,
    peakWindow: { start: "19:30", end: "20:30" },
    footfall,
  });

  const outdoor = outdoorCapabilityForVenue(DEMO_LOCATION_ID);
  const corr = BERLIN_DINNER_TERRACE_CORRELATION;

  const weatherImpact =
    outdoor.hasOutdoor && outdoor.weatherElastic
      ? translateWeatherToOperations({
          hasTerrace: true,
          weather: {
            temperatureC: 22,
            conditionLabel: "Dry · Low wind",
            precipitationProbabilityPct: 12,
            windKph: 11,
            humidityPct: 48,
            feelsLikeC: 21,
          },
          dryWarmLiftCovers: corr.incrementalCovers,
          spendPerCover: spend,
          contributionRate,
          fohCostToCapture: corr.fohCost,
          incrementalRevenue: corr.incrementalRevenue,
          incrementalContribution: corr.incrementalContribution,
          comparableLiftPct: corr.warmDryLiftPct,
          comparableSampleSize: corr.sampleSize,
          outdoorLabel: outdoor.label,
          outdoorSeats: outdoor.seats,
        })
      : null;

  const terraceCorrelation =
    weatherImpact && outdoor.weatherElastic
      ? {
          liftPct: corr.warmDryLiftPct,
          sampleSize: corr.sampleSize,
          nights: [...corr.nights],
          rainCounterfactual: {
            rainPct: 55,
            coversLost: 8,
            revenueAtRisk: 340,
            recommendation: "Hold 3 indoor tables for reassignment.",
          },
        }
      : null;

  const areaDemand = composeAreaDemandIndex(DEMO_LOCATION_ID, [
    { label: "Concert nearby", deltaPct: 9 },
    { label: "Dry terrace weather", deltaPct: 5 },
    { label: "Reservation pace", deltaPct: 4 },
    { label: "Transit disruption", deltaPct: -1 },
  ]);

  const menu = demoMenuAvailabilityRisk();
  const menuDecision = composeMenuDecisionBrief();
  const menuAtRisk = menuDecision?.contributionAtRisk ?? menu?.exposure.contributionAtRisk ?? 730;
  const staffingProtected = 290;
  const staffingCost = 72;

  const opportunityRows: MicroOpportunity[] = [];
  if (weatherImpact?.decision === "OPEN") {
    opportunityRows.push({
      id: "opp_terrace_open",
      kind: "terrace",
      title: "Open full terrace from 18:00",
      recommendation: "Open full terrace from 18:00.",
      expectedUpside: weatherImpact.incrementalContribution,
      cost: weatherImpact.fohCostToCapture,
      netExpectedContribution: weatherImpact.netExpectedContribution,
      confidence: "high",
      deadline: "18:00",
      drivers: [
        "22°C",
        "Dry",
        "Low wind",
        `+${corr.warmDryLiftPct}% on warm-dry dinners (n=${corr.sampleSize})`,
      ],
    });
  }
  opportunityRows.push(
    {
      id: "opp_staff_foh",
      kind: "staffing",
      title: "Add 1 FOH (Front of House) for peak",
      recommendation: "+1 FOH (Front of House) · 19:15-20:30",
      expectedUpside: staffingProtected,
      cost: staffingCost,
      netExpectedContribution: staffingProtected - staffingCost,
      confidence: "high",
      deadline: "19:00",
      drivers: ["Expected 142 covers", "Capacity 128", "Gap 14 covers"],
    },
    {
      id: "opp_hold_walkin_tables",
      kind: "walk_ins",
      title: "Hold tables for walk-ins",
      recommendation: "Hold 4 tables for walk-ins between 19:00-20:00.",
      expectedUpside: 310,
      cost: 0,
      netExpectedContribution: 310,
      confidence: "medium",
      deadline: "19:00",
      drivers: [
        "Reservation inventory 86% allocated",
        `Expected walk-ins ${walkIns.expected}`,
        "Remaining capacity 18 covers",
      ],
    },
    {
      id: "opp_tuna_source",
      kind: "ingredient",
      title: "Bluefin tuna coverage",
      recommendation: "Review 2 sourcing options before open.",
      expectedUpside: menuAtRisk,
      cost: 0,
      netExpectedContribution: menuAtRisk,
      confidence: "high",
      deadline: "17:00",
      drivers: ["Available 9 portions", "Expected 31", "Sell-out ~20:15"],
    },
    {
      id: "opp_wine_btg",
      kind: "menu_prep",
      title: "Burgundy BTG par + attach",
      recommendation:
        "Hold elevated Burgundy by-the-glass par; brief floor on wine attach.",
      expectedUpside: 186,
      cost: 28,
      netExpectedContribution: 158,
      confidence: "high",
      deadline: "17:30",
      drivers: [
        `Beverage ${fnb.beverageSharePct}% of projected net`,
        `${fnb.beverageContributionMarginPct}% beverage contribution margin`,
        "Warm terrace night · aperitif + BTG attach",
      ],
    },
  );
  const opportunities = rankMicroOpportunities(opportunityRows);
  const fixBeforeOpen: PreShiftBrief["fixBeforeOpen"] = [
    menuDecision
      ? {
          id: "fix_tuna",
          title: `${menuDecision.dishes[0]!.name} will sell out`,
          amount: menuDecision.contributionAtRisk,
          amountLabel: "contribution at risk",
          kind: "risk",
          urgency: "emergency",
          opportunityId: "opp_tuna_source",
          detail: {
            eyebrow: `${menuDecision.ingredientName} · POS #${menuDecision.dishes[0]!.salesRank} dinner seller`,
            summary: menuDecision.soWhat,
            lines: [
              `Affects ${menuDecision.dishes.map((d) => d.name).join(", ")}`,
              `${menuDecision.portionsAvailable} portions left · ${menuDecision.portionsExpected} expected · sell-out ~${menuDecision.runOutBy}`,
              menuDecision.criticality.topDish?.repeatGuestOrderPct != null
                ? `${menuDecision.criticality.topDish.repeatGuestOrderPct}% of returning guests ordered ${menuDecision.dishes[0]!.name} in the last 8 weeks`
                : "Signature / staple dish with low substitution",
              menuDecision.guestAffinity.line,
              `${menuDecision.criticality.topDish?.menuMixSharePct ?? 12.4}% of dinner food revenue`,
            ],
            recommendation:
              menuDecision.sourcing.options.find((o) => o.recommended)?.title ??
              "Emergency source before cutoff",
            deadline: `Decide by ${menuDecision.sourcing.decideBy} - ${menuDecision.sourcing.decideByWhy}`,
          },
        }
      : {
          id: "fix_tuna",
          title: "Bluefin tuna - #2 seller at risk",
          amount: menuAtRisk,
          amountLabel: "contribution at risk",
          kind: "risk",
          urgency: "emergency",
          opportunityId: "opp_tuna_source",
        },
    {
      id: "fix_staff",
      title: "Peak service understaffed",
      amount: staffingProtected,
      amountLabel: "at risk",
      kind: "risk",
      urgency: "high",
      opportunityId: "opp_staff_foh",
      detail: {
        eyebrow: "Labor · 19:00-20:30",
        summary:
          "Forecast 142 covers vs 128 FOH (Front of House) capacity - a 14-cover gap in the peak window. Guests wait longer; ticket times slip.",
        lines: [
          "Berlin Mitte dinner peak · +1 FOH (Front of House) closes the gap",
          `Cost ${staffingCost} · expected protection ${staffingProtected}`,
        ],
        recommendation: "+1 FOH (Front of House) · 19:15-20:30",
        deadline: "Decide by 19:00 - before peak briefing",
      },
    },
  ];

  const readiness: ReadinessItem[] = [
    { id: "r_demand", domain: "DEMAND", status: "ready", label: "Above normal" },
    {
      id: "r_staff",
      domain: "STAFF",
      status: "action",
      label: "1 adjustment recommended",
    },
    { id: "r_menu", domain: "MENU", status: "action", label: "1 risk" },
    {
      id: "r_bev",
      domain: "BEVERAGE",
      status: "watch",
      label: "BTG par · attach",
    },
    ...(outdoor.hasOutdoor && outdoor.weatherElastic
      ? [
          {
            id: "r_terrace",
            domain: "TERRACE" as const,
            status: "action" as const,
            label:
              weatherImpact?.decision === "OPEN"
                ? "Open recommended"
                : "Watch weather",
          },
        ]
      : []),
    {
      id: "r_res",
      domain: "RESERVATIONS",
      status: "ready",
      label: "Healthy",
    },
    {
      id: "r_walk",
      domain: "WALK_INS",
      status: "watch",
      label: "High",
    },
    { id: "r_data", domain: "DATA", status: "ready", label: "Healthy" },
  ];

  return {
    locationId: DEMO_LOCATION_ID,
    locationName: DEMO_LOCATION_NAME,
    serviceLabel: "Dinner",
    outlook: "Above normal",
    expectedCovers,
    expectedWalkIns: walkIns.expected,
    walkInRange: { low: walkIns.rangeLow, high: walkIns.rangeHigh },
    projectedNetSales,
    expectedContribution,
    fnb,
    peakWindow: { start: "19:30", end: "21:00" },
    terraceOutlook:
      !outdoor.hasOutdoor
        ? "N/A"
        : weatherImpact?.decision === "OPEN"
          ? "Strong"
          : "Watch",
    hasTerrace: outdoor.hasOutdoor && outdoor.weatherElastic,
    terraceCorrelation,
    areaDemand,
    walkIns,
    weatherImpact,
    event,
    coverDrivers: {
      reservations: ops.bookedCovers,
      walkIns: walkIns.expected,
      weatherTerrace: weatherImpact?.historicalTerraceLiftCovers ?? 0,
      localEvent: 11,
      expectedCancellations: -7,
    },
    readiness,
    opportunities,
    fixBeforeOpen,
    bookingPacePct: 12,
    reservationAllocatedPct: 86,
    remainingCapacityCovers: 18,
    holdTablesForWalkIns: 4,
  };
}
