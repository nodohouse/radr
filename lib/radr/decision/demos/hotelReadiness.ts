/**
 * Hotel D-H-9201 — reassign housekeepers before check-in wave.
 * Shared ID: dec_hotel_readiness_canal
 * Separate from D-2201 channel allocation.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";

const PAYLOAD =
  "Prepared — not written back to PMS. Operator confirms housekeeping reassignment in the system of record.";

const OPERATING_STATE = [
  { label: "Arrivals today", value: "42", tone: "risk" as const },
  { label: "Rooms ready", value: "31", tone: "watch" as const },
  { label: "At risk", value: "7", tone: "risk" as const },
  { label: "Floor 3 pace", value: "Behind", tone: "risk" as const },
  { label: "VIP / early arrivals", value: "In wave", tone: "watch" as const },
  { label: "HK on Floor 1", value: "Surplus vs arrivals", tone: "neutral" as const },
];

const CONSTRAINTS = [
  "Already-cleaned rooms cannot be unassigned without cause",
  "VIP / early arrival rooms take priority once flagged",
  "Channel hold (D-2201) is a separate Decision — do not conflate",
  "Housekeeping moves stay prepared until confirmed in roster / PMS",
  "Flex labor only within hotel labor policy",
];

const RELATIONSHIP = [
  "42 arrivals",
  "31 ready",
  "7 at risk",
  "Floor 3 lag",
  "VIP / FR exposure",
  "HK allocation",
  "€1,840 guest-service value",
];

export function buildHotelReadinessDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const clock = HOTEL_LIVE_SCENARIO;
  const options = [
    {
      id: "keep",
      title: "Keep current allocation",
      expectedContributionEuro: 0,
      guestImpact: "high" as const,
      operationalRisk: "high" as const,
      confidence: 82,
      timeToResult: "75m",
      note: "7 arrivals at risk of late room · FR / VIP exposure",
      isNoAction: true,
    },
    {
      id: "reassign",
      title: "Reassign 2 housekeepers",
      expectedContributionEuro: 1840,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 81,
      timeToResult: "45m",
      note: "Best protection · reversible · no extra labor cost",
      recommended: true,
    },
    {
      id: "vip",
      title: "Prioritize VIP + early arrivals",
      expectedContributionEuro: 920,
      guestImpact: "medium" as const,
      operationalRisk: "medium" as const,
      confidence: 74,
      timeToResult: "60m",
      note: "Protects VIP · leaves floor-3 residual risk",
    },
    {
      id: "extra",
      title: "Call flex labor",
      expectedContributionEuro: 1620,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 78,
      timeToResult: "90m",
      note: "+€1,620 protected · −€280 labor",
    },
  ];

  const ledgerBase = [
    {
      id: "le_hk_01",
      at: "13:18",
      kind: "signal" as const,
      title: "31 ready · 7 at risk · Floor 3 behind",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_hk_02",
      at: "13:20",
      kind: "understand" as const,
      title: "42 arrivals today · check-in wave compressing",
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_hk_03",
      at: "13:22",
      kind: "predict" as const,
      title: "7 arrivals at late-room risk if allocation holds",
      statusAfter: "PREDICTED" as const,
    },
    {
      id: "le_hk_04",
      at: "13:24",
      kind: "simulate" as const,
      title: "Reassign 2 HK vs keep vs VIP priority vs flex",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_hk_05",
      at: clock.clockLabel,
      kind: "recommend" as const,
      title: "Reassign 2 housekeepers to Floor 3",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.hotelReadiness,
    organizationId: "org_northstar_hotels",
    locationId: "loc_canal_house",
    operatingUnitId: "ou_canal_rooms",
    roleContext: "GM",
    decisionType: "housekeeping_reassign",
    decisionHorizon: "TODAY",
    status,
    vertical: "hotel",
    title: "Reassign 2 housekeepers · check-in wave",
    problemStatement:
      "42 arrivals today · 31 rooms ready · 7 at risk. Floor 3 is behind. Channel hold (D-2201) is a separate Decision — this is readiness only.",
    currentState: "31 ready · 7 at risk · Floor 3 behind · 42 arrivals",
    property: "Mercer House · New York",
    phaseLabel: `Pre check-in · ${clock.clockLabel}`,
    contextLine: "42 arrivals · 31 ready · 7 at risk · Floor 3 behind",
    recommendationHeadline: "REASSIGN 2 HOUSEKEEPERS",
    recommendationReasoning:
      "Reassignment protects €1,840 expected guest-service value without calling extra labor. Keep-allocation leaves 7 arrivals at late-room risk. D-2201 channel hold is independent.",
    triggerEvents: ["housekeeping_behind", "check_in_wave"],
    evidenceRefs: [
      {
        id: "ev_hk_1",
        label: "Arrivals today",
        value: String(clock.arrivalsToday),
        source: "PMS · arrivals",
        freshness: "1m",
      },
      {
        id: "ev_hk_2",
        label: "Rooms ready",
        value: String(clock.roomsReady),
        source: "PMS · housekeeping",
        freshness: "2m",
      },
      {
        id: "ev_hk_3",
        label: "At risk",
        value: String(clock.roomsAtRisk),
        source: "RADR readiness model",
        freshness: "now",
      },
      {
        id: "ev_hk_4",
        label: "Floor 3",
        value: "Behind pace",
        source: "Housekeeping board",
        freshness: "3m",
      },
    ],
    relatedEntities: [
      { type: "floor", id: "floor_3", label: "Floor 3" },
      { type: "wave", id: "checkin_wave", label: `Check-in wave ${clock.waveLabel}` },
    ],
    operatingStateSnapshot: OPERATING_STATE,
    relationshipChain: RELATIONSHIP,
    constraints: CONSTRAINTS,
    baselinePrediction: "7 late rooms if allocation holds",
    noActionOutcome: "7 arrivals late-room risk · VIP / FR exposure",
    mainRiskNarrative:
      "Late-room risk concentrates on Floor 3 VIP / early arrivals if allocation holds",
    options,
    recommendedOptionId: "reassign",
    expectedContributionImpact: 1840,
    expectedGuestImpact: "Protects on-time check-in for at-risk arrivals",
    expectedOperationalImpact: "Housekeeping reassignment prepared — not auto-written",
    exposedContribution: 1840,
    confidence: {
      forecast: "HIGH",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      explanation:
        "PMS + housekeeping board live · 12 comparable check-in waves",
      point: 81,
      low: 74,
      high: 88,
      mainUncertainty: "Walk-in / early arrival variance in next 75m",
    },
    decisionDeadline: `Decide by ${clock.decisionDeadlineClock}`,
    decisionDeadlineAt: clock.decisionDeadlineIso,
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_hk_1",
          provider: "Housekeeping",
          title: "Move 2 housekeepers Floor 1 → Floor 3",
          status: "READY",
          preparedOnly: true,
        },
        {
          id: "ap_hk_2",
          provider: "Housekeeping",
          title: "Prioritize VIP / early arrival rooms first",
          status: "READY",
          preparedOnly: true,
        },
        {
          id: "ap_hk_3",
          provider: "Front desk",
          title: "Notify front desk of ETA for at-risk rooms",
          status: "READY",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerBase,
    graph: {
      nodes: [
        { id: "n_ready", entityType: "room", label: "31 ready" },
        { id: "n_risk", entityType: "room", label: "7 at risk" },
        { id: "n_arr", entityType: "booking", label: "42 arrivals" },
        { id: "n_f3", entityType: "staff", label: "Floor 3 behind" },
        { id: "n_vip", entityType: "guest", label: "VIP / early" },
        { id: "n_exp", entityType: "revenue", label: "€1,840 protected" },
        { id: "n_dec", entityType: "decision", label: "Reassign 2 HK" },
        { id: "n_act", entityType: "action", label: "Roster move prepared" },
      ],
      edges: [
        { fromId: "n_arr", toId: "n_risk", relation: "informed_by" },
        { fromId: "n_ready", toId: "n_risk", relation: "informed_by" },
        { fromId: "n_f3", toId: "n_risk", relation: "triggered_by" },
        { fromId: "n_risk", toId: "n_vip", relation: "precedes" },
        { fromId: "n_risk", toId: "n_exp", relation: "precedes" },
        { fromId: "n_risk", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_exp", toId: "n_dec", relation: "informed_by" },
        { fromId: "n_dec", toId: "n_act", relation: "option_for" },
      ],
    },
    autonomy: {
      decisionType: "housekeeping_reassign",
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.81,
      nHistorical: 12,
      neverFullyAutonomous: false,
      reason: "Housekeeping reassignment stays prepared until approved.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Readiness gap",
        body: "31 ready · 7 at risk · Floor 3 behind with 42 arrivals today.",
      },
      {
        epistemic: "PREDICTED",
        title: "Late-room risk",
        body: "7 arrivals at late-room risk if the current allocation holds.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Reassign",
        body: "Move 2 housekeepers to Floor 3 · protect €1,840 without calling extra labor.",
      },
    ],
    locationDnaLine:
      "At Canal House, under check-in wave pressure with Floor 3 behind, reassignment historically preceded on-time readiness.",
    lesson:
      "Reassign before flex labor when ready/arrivals <75% and Floor 3 lags — VIP early exception encoded.",
    playbookImpact:
      "Check-in readiness playbook V3 → V4 · Floor 3 lag threshold + VIP early exception",
    playbookId: "pb_hotel_readiness_canal",
    modelVersion: "decision-record/v1",
    createdAt: clock.decisionFormedIso,
    updatedAt: clock.timestampIso,
    territories: ["LABOR", "SELL"],
    attentionOverride: "needs_you",
  };

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...base,
      status,
      chosenOptionId: "reassign",
      approver: "GM",
      actualContributionImpact: 1760,
      verifiedValue: {
        amount: 1760,
        kind: "protected",
        note: "6 of 7 at-risk arrivals on-time · 1 late by 12m",
      },
      lesson: base.lesson,
      playbookImpact: base.playbookImpact,
      attentionOverride: status === "LEARNED" ? "learned" : "verified",
    };
  }

  if (status === "APPROVED") {
    return {
      ...base,
      status,
      chosenOptionId: "reassign",
      approver: "GM",
      attentionOverride: "handling",
    };
  }

  return base;
}
