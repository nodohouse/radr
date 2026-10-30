/**
 * Soho · New York service universe — ONE fixture set for Floor / Timeline / Recovery.
 * Shares table IDs with data/demo/serviceMap (t6 = D-1911, t14 = cancellation recovery).
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";
import type {
  ArrivalStrip,
  DemandMatch,
  FloorOptimizationPlan,
  RecoverableCapacityOpportunity,
  ServiceReservation,
  ServiceTonightSummary,
  TimelineBlock,
  UnfulfilledDemand,
  WalkInParty,
} from "./types";
import { rankDemandForOpportunity } from "./matchEngine";
import { evaluateFloorOptimization } from "./floorOptimizer";

const LOC = DEMO_LOCATIONS.berlin.id;
const DATE = "2026-10-03";

/** Tables locked by policy — optimizer must not move. */
export const PROTECTED_TABLE_IDS = new Set(["t12", "t5"]);

export function berlinServiceReservations(): ServiceReservation[] {
  return [
    {
      id: "res_chen_1930",
      source: "opentable",
      externalId: "OT-88421",
      locationId: LOC,
      partyLabel: "Chen",
      partySize: 4,
      start: "19:30",
      expectedEnd: "21:15",
      tableIds: ["t12"],
      area: "BAR",
      status: "booked",
      flexibility: {
        earliestMinutes: -30,
        latestMinutes: 30,
        areaPreferences: ["MAIN", "BAR"],
        vip: false,
        returning: true,
      },
      expectedContributionEuro: 168,
      protected: true,
      constraints: ["VIP preference · bar"],
      confidence: 0.94,
    },
    {
      id: "res_mueller_1915",
      source: "sevenrooms",
      externalId: "SR-22091",
      locationId: LOC,
      partyLabel: "Müller",
      partySize: 3,
      start: "19:15",
      expectedEnd: "20:45",
      tableIds: ["t4"],
      area: "MAIN",
      status: "confirmed",
      flexibility: {
        earliestMinutes: -15,
        latestMinutes: 45,
        areaPreferences: ["MAIN"],
        returning: true,
      },
      expectedContributionEuro: 142,
      confidence: 0.9,
    },
    {
      id: "res_oka_1900",
      source: "website",
      externalId: "WEB-4410",
      locationId: LOC,
      partyLabel: "Oka",
      partySize: 4,
      start: "19:00",
      expectedEnd: "20:40",
      tableIds: ["t9"],
      area: "MAIN",
      status: "arriving",
      flexibility: { earliestMinutes: 0, latestMinutes: 20, terraceOk: false },
      expectedContributionEuro: 176,
      confidence: 0.86,
    },
    {
      id: "res_large_1830",
      source: "sevenrooms",
      externalId: "SR-11802",
      locationId: LOC,
      partyLabel: "Hoffmann",
      partySize: 6,
      start: "18:30",
      expectedEnd: "20:30",
      tableIds: ["t5"],
      area: "MAIN",
      status: "seated",
      flexibility: {},
      expectedContributionEuro: 260,
      protected: true,
      constraints: ["Large-party table protected"],
      confidence: 0.97,
    },
    {
      id: "res_cancel_t14",
      source: "opentable",
      externalId: "OT-77102",
      locationId: LOC,
      partyLabel: "Cancelled party",
      partySize: 4,
      start: "19:30",
      expectedEnd: "21:00",
      tableIds: ["t14"],
      area: "MAIN",
      status: "cancelled",
      flexibility: {},
      expectedContributionEuro: 184,
      confidence: 1,
      notes: "Late cancellation · inventory released",
    },
    {
      id: "res_park_2000",
      source: "resy",
      externalId: "RSY-9033",
      locationId: LOC,
      partyLabel: "Park",
      partySize: 2,
      start: "20:00",
      expectedEnd: "21:20",
      tableIds: ["t10"],
      area: "MAIN",
      status: "booked",
      flexibility: {
        earliestMinutes: -30,
        latestMinutes: 30,
        areaPreferences: ["MAIN", "TERRACE"],
      },
      expectedContributionEuro: 88,
      confidence: 0.88,
    },
    {
      id: "res_berg_1845",
      source: "thefork",
      externalId: "TF-5521",
      locationId: LOC,
      partyLabel: "Berg",
      partySize: 2,
      start: "18:45",
      expectedEnd: "20:00",
      tableIds: ["t8"],
      area: "MAIN",
      status: "seated",
      flexibility: {},
      expectedContributionEuro: 72,
      confidence: 0.8,
      notes: "Turn risk · expected late release",
    },
  ];
}

export function berlinUnfulfilledDemand(): UnfulfilledDemand[] {
  return [
    {
      id: "dem_chen_wait",
      source: "opentable",
      partyLabel: "Chen",
      partySize: 4,
      preferredTime: "19:30",
      flexibility: {
        earliestMinutes: -30,
        latestMinutes: 30,
        areaPreferences: ["MAIN", "BAR"],
      },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T17:40:00+02:00`,
      waitMinutes: 0,
      state: "waiting",
      expectedContributionEuro: 168,
    },
    {
      id: "dem_mueller",
      source: "sevenrooms",
      partyLabel: "Müller",
      partySize: 3,
      preferredTime: "19:15",
      flexibility: {
        earliestMinutes: -15,
        latestMinutes: 45,
        areaPreferences: ["MAIN"],
        returning: true,
      },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T18:05:00+02:00`,
      state: "waiting",
      expectedContributionEuro: 142,
    },
    {
      id: "dem_walkin_4",
      source: "walk_in",
      partyLabel: "Walk-in · 4",
      partySize: 4,
      preferredTime: "19:48",
      flexibility: { earliestMinutes: 0, latestMinutes: 40 },
      date: DATE,
      contactable: false,
      createdAt: `${DATE}T19:30:00+02:00`,
      waitMinutes: 18,
      state: "waiting",
      expectedContributionEuro: 156,
    },
    {
      id: "dem_site_a",
      source: "website",
      partyLabel: "Rossi",
      partySize: 2,
      preferredTime: "19:45",
      flexibility: {
        earliestMinutes: -20,
        latestMinutes: 40,
        terraceOk: true,
      },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T16:20:00+02:00`,
      state: "waiting",
      expectedContributionEuro: 84,
    },
    {
      id: "dem_site_b",
      source: "website",
      partyLabel: "Nguyen",
      partySize: 4,
      preferredTime: "20:00",
      flexibility: {
        earliestMinutes: -30,
        latestMinutes: 30,
        areaPreferences: ["MAIN"],
      },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T15:55:00+02:00`,
      state: "waiting",
      expectedContributionEuro: 172,
    },
    {
      id: "dem_ot_2",
      source: "opentable",
      partyLabel: "Sato",
      partySize: 2,
      preferredTime: "19:30",
      flexibility: { earliestMinutes: 0, latestMinutes: 60 },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T18:40:00+02:00`,
      state: "waiting",
      expectedContributionEuro: 76,
    },
    {
      id: "dem_sr_access",
      source: "sevenrooms",
      partyLabel: "Accessible party",
      partySize: 2,
      preferredTime: "19:00",
      flexibility: {
        accessibility: true,
        earliestMinutes: -15,
        latestMinutes: 30,
        areaPreferences: ["MAIN"],
      },
      date: DATE,
      contactable: true,
      createdAt: `${DATE}T14:10:00+02:00`,
      state: "waiting",
      expectedContributionEuro: 90,
    },
  ];
}

export function berlinRecoverableOpportunities(): RecoverableCapacityOpportunity[] {
  const cancel = getCancellationRecoveryScenario();
  const t14: RecoverableCapacityOpportunity = {
    id: "rcv_t14_1930",
    locationId: LOC,
    area: "MAIN",
    tableIds: ["t14"],
    start: "19:30",
    end: "21:00",
    partySizeFit: { min: 3, max: 4 },
    source: "late_cancellation",
    confidence: 0.91,
    expectedCovers: 4,
    expectedContributionEuro: cancel?.potentialRecoverableMajor ?? 286,
    compatibleDemandIds: ["dem_mueller", "dem_walkin_4", "dem_chen_wait"],
    operationalImpact: "low",
    state: cancel?.actionStatus === "ACCEPTED" ? "offered" : "open",
    decisionId: DECISION_IDS.tableRecover,
  };

  return [
    t14,
    {
      id: "rcv_t10_gap",
      locationId: LOC,
      area: "MAIN",
      tableIds: ["t10"],
      start: "19:00",
      end: "19:50",
      partySizeFit: { min: 2, max: 2 },
      source: "short_gap",
      confidence: 0.78,
      expectedCovers: 2,
      expectedContributionEuro: 96,
      compatibleDemandIds: ["dem_site_a", "dem_ot_2"],
      operationalImpact: "low",
      state: "open",
    },
    {
      id: "rcv_join_main",
      locationId: LOC,
      area: "MAIN",
      tableIds: ["t13", "t10"],
      start: "20:15",
      end: "21:45",
      partySizeFit: { min: 4, max: 4 },
      source: "floor_rearrangement",
      confidence: 0.74,
      expectedCovers: 4,
      expectedContributionEuro: 210,
      compatibleDemandIds: ["dem_site_b", "dem_chen_wait"],
      operationalImpact: "medium",
      state: "open",
    },
  ];
}

export function berlinWalkInQueue(): WalkInParty[] {
  return [
    {
      id: "wi_martin",
      partyLabel: "Martin",
      partySize: 3,
      waitMinutes: 18,
      estimatedSeatMinutes: 8,
      compatibleTableIds: ["t7", "t14"],
      state: "waiting",
    },
    {
      id: "wi_hold_2",
      partyLabel: "Walk-in 2",
      partySize: 2,
      waitMinutes: 12,
      estimatedSeatMinutes: 12,
      compatibleTableIds: ["t6", "t20"],
      state: "held",
    },
  ];
}

export function berlinTonightSummary(): ServiceTonightSummary {
  const opps = berlinRecoverableOpportunities();
  const demand = berlinUnfulfilledDemand().filter((d) => d.state === "waiting");
  return {
    bookedCovers: 184,
    walkInsForecast: 21,
    waitingCount: demand.length,
    recoverableGaps: opps.filter((o) => o.state === "open" || o.state === "prepared").length,
    recoverableEuro: opps.reduce((s, o) => s + o.expectedContributionEuro, 0),
    decisionsNeedingJudgment: 1,
  };
}

export function berlinArrivalStrip(): ArrivalStrip {
  return {
    windowMinutes: 30,
    expectedCovers: 38,
    parties: 6,
    vipCount: 2,
    lateRiskCount: 1,
  };
}

export function waitingDemandBySource(): { source: string; count: number }[] {
  const demand = berlinUnfulfilledDemand().filter((d) => d.state === "waiting");
  const map = new Map<string, number>();
  for (const d of demand) {
    const key =
      d.source === "opentable"
        ? "OpenTable"
        : d.source === "sevenrooms"
          ? "SevenRooms"
          : d.source === "website"
            ? "Website"
            : d.source === "walk_in"
              ? "Walk-in"
              : d.source;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()].map(([source, count]) => ({ source, count }));
}

export function berlinTimelineBlocks(): TimelineBlock[] {
  const reservations = berlinServiceReservations();
  const blocks: TimelineBlock[] = reservations
    .filter((r) => r.status !== "cancelled")
    .map((r) => ({
      id: `blk_${r.id}`,
      tableId: r.tableIds[0]!,
      area: r.area,
      kind: r.status === "held" ? "hold" : "booking",
      start: r.start,
      end: r.expectedEnd,
      label: `${r.partyLabel} · ${r.partySize}`,
      partySize: r.partySize,
      state: r.protected
        ? ("PROTECTED" as const)
        : r.status === "seated"
          ? ("IN_SERVICE" as const)
          : r.status === "arriving"
            ? ("ARRIVING" as const)
            : ("RESERVED" as const),
      reservationId: r.id,
      material:
        r.id === "res_berg_1845"
          ? "turn_risk"
          : r.id === "res_oka_1900"
            ? "late_risk"
            : null,
      contributionEuro: r.expectedContributionEuro,
    }));

  // Recoverable gap on t14
  blocks.push({
    id: "blk_rcv_t14",
    tableId: "t14",
    area: "MAIN",
    kind: "recoverable",
    start: "19:30",
    end: "21:00",
    label: "Recoverable · 4",
    partySize: 4,
    state: "BLOCKED",
    material: "cancellation",
    decisionId: DECISION_IDS.tableRecover,
    contributionEuro: 286,
  });

  // D-1911 hold on t6
  blocks.push({
    id: "blk_d1911_t6",
    tableId: "t6",
    area: "MAIN",
    kind: "hold",
    start: "19:48",
    end: "20:00",
    label: "Hold · walk-in",
    partySize: 2,
    state: "HELD",
    material: "decision",
    decisionId: DECISION_IDS.peak,
    contributionEuro: 620,
  });

  return blocks;
}

export function matchesForOpportunity(
  oppId: string,
): DemandMatch[] {
  const opp = berlinRecoverableOpportunities().find((o) => o.id === oppId);
  if (!opp) return [];
  const demand = berlinUnfulfilledDemand();
  return rankDemandForOpportunity(opp, demand);
}

export function berlinFloorPlan(): FloorOptimizationPlan {
  return evaluateFloorOptimization({
    reservations: berlinServiceReservations(),
    protectedTableIds: PROTECTED_TABLE_IDS,
    kitchenCurrentPct: 97,
    asOf: "19:48",
    locationId: LOC,
  });
}

/** Full shared universe snapshot for Service views. */
export function getBerlinServiceUniverse() {
  const reservations = berlinServiceReservations();
  const demand = berlinUnfulfilledDemand();
  const opportunities = berlinRecoverableOpportunities();
  const walkIns = berlinWalkInQueue();
  const summary = berlinTonightSummary();
  const arrivals = berlinArrivalStrip();
  const timeline = berlinTimelineBlocks();
  const floorPlan = berlinFloorPlan();
  const waitingBySource = waitingDemandBySource();
  return {
    locationId: LOC,
    reservations,
    demand,
    opportunities,
    walkIns,
    summary,
    arrivals,
    timeline,
    floorPlan,
    waitingBySource,
    protectedTableIds: [...PROTECTED_TABLE_IDS],
    decisionPeakId: DECISION_IDS.peak,
    decisionRecoverId: DECISION_IDS.tableRecover,
  };
}

export type BerlinServiceUniverse = ReturnType<typeof getBerlinServiceUniverse>;
