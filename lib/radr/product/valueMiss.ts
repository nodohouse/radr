/**
 * Honest Verified Value miss — DEMO.
 * Expected €420 · Observed €90 · Verified €0 · demand faded.
 * Does not inflate verified totals (verified amount = 0).
 */

import type { DecisionRecord } from "@/lib/radr/decision/record";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { computeRegret } from "@/lib/radr/decision/counterfactual";

const EXPECTED = 420;
const OBSERVED = 90;
const VERIFIED = 0;

export type ValueMissTrace = {
  decisionId: string;
  displayId: string;
  title: string;
  expectedEuro: number;
  observedEuro: number;
  verifiedEuro: number;
  reason: string;
  memoryNote: string;
};

export const TERRACE_DEMAND_FADE_MISS: ValueMissTrace = {
  decisionId: DECISION_IDS.created,
  displayId: "D-4410",
  title: "Terrace soft-open · demand faded",
  expectedEuro: EXPECTED,
  observedEuro: OBSERVED,
  verifiedEuro: VERIFIED,
  reason: "Sun window shortened · walk-in demand faded before staged covers filled.",
  memoryNote:
    "Memory updated · weather-hold terrace prep still preferred, but soft-open without inbound signal ranks lower.",
};

export function buildCreatedMissDecisionRecord(): DecisionRecord {
  const options = [
    {
      id: "do_nothing",
      title: "Wait for walk-ins",
      expectedContributionEuro: 0,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 80,
      timeToResult: "Service",
      note: "Window often closes unused",
      isNoAction: true,
    },
    {
      id: "soft_open",
      title: "Soft open · no staffing change",
      expectedContributionEuro: EXPECTED,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 72,
      timeToResult: "Immediate",
      note: "Captures some demand · understaffed service risk",
      recommended: true,
    },
    {
      id: "full_stage",
      title: "Full terrace stage",
      expectedContributionEuro: 640,
      guestImpact: "low" as const,
      operationalRisk: "medium" as const,
      confidence: 68,
      timeToResult: "15m",
      note: "Higher setup cost if demand fades",
    },
  ];

  const regret = computeRegret({
    chosenOptionId: "soft_open",
    chosenActualEuro: OBSERVED,
    options,
  });

  return {
    id: DECISION_IDS.created,
    organizationId: "org_northstar_restaurants",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "terrace_created_contribution",
    decisionHorizon: "NOW",
    status: "LEARNED",
    vertical: "restaurant",
    territories: ["SELL", "LABOR"],
    title: "Terrace soft-open · demand faded",
    problemStatement:
      "Sun window opened · soft-open staged without inbound signal. Demand faded before covers filled.",
    currentState: "Miss sealed · Verified €0 · Memory updated",
    property: "Soho · New York",
    phaseLabel: "Post-service · learning",
    contextLine: `Expected €${EXPECTED} · Observed €${OBSERVED} · Verified €${VERIFIED}`,
    recommendationHeadline: "SOFT OPEN · THEN LEARN",
    recommendationReasoning:
      "Soft-open without inbound confirmation historically followed by fade risk on short sun windows.",
    triggerEvents: ["weather_hold", "terrace_opportunity"],
    evidenceRefs: [
      {
        id: "ev_miss_1",
        label: "Expected contribution",
        value: `€${EXPECTED}`,
        source: "Futures",
        freshness: "At approve",
        grade: "ESTIMATED",
      },
      {
        id: "ev_miss_2",
        label: "Observed contribution",
        value: `€${OBSERVED}`,
        source: "POS terrace",
        freshness: "Close",
        grade: "OBSERVED",
      },
      {
        id: "ev_miss_3",
        label: "Verified",
        value: "€0",
        source: "Attribution gate",
        freshness: "Close",
        grade: "OBSERVED",
      },
    ],
    relatedEntities: [
      { type: "service", id: "svc_terrace", label: "Terrace" },
    ],
    baselinePrediction: "Soft-open captures €420 if walk-ins arrive in window",
    noActionOutcome: "Window closes unused · €0",
    options,
    recommendedOptionId: "soft_open",
    chosenOptionId: "soft_open",
    expectedContributionImpact: EXPECTED,
    expectedGuestImpact: "None",
    expectedOperationalImpact: "Terrace soft-open prepared",
    exposedContribution: 820,
    actualContributionImpact: OBSERVED,
    observedOutcome: "Demand faded · €90 observed · not attributed as Verified",
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation: "Weather × roster live · inbound pace was the miss driver",
      point: 72,
      low: 58,
      high: 82,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Walk-in arrival density in short sun windows",
    },
    decisionDeadline: "17:25",
    requiredRole: "GM",
    approver: "GM",
    actionPlan: {
      status: "COMPLETED",
      payloadNote:
        "Prepared — not written back. Outcome sealed as miss for learning.",
      steps: [
        {
          id: "ap_miss_1",
          provider: "Floor",
          title: "Soft-open terrace · 2 covers",
          status: "COMPLETED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    verifiedValue: {
      amount: VERIFIED,
      kind: "protected",
      note: "Demand faded · attribution gate → €0 Verified",
    },
    regret: regret ?? undefined,
    lesson: TERRACE_DEMAND_FADE_MISS.memoryNote,
    playbookImpact:
      "Require inbound / waitlist signal before soft-open on sub-40m sun windows",
    playbookId: "pb_terrace_weather",
    ledger: [
      {
        id: "le_miss_1",
        at: "17:20",
        kind: "recommend",
        title: "Soft-open recommended · €420 expected",
        statusAfter: "AWAITING_APPROVAL",
      },
      {
        id: "le_miss_2",
        at: "17:22",
        kind: "approve",
        title: "Soft-open approved",
        statusAfter: "APPROVED",
      },
      {
        id: "le_miss_3",
        at: "18:40",
        kind: "observe",
        title: "Demand faded · €90 observed",
        statusAfter: "OBSERVING",
      },
      {
        id: "le_miss_4",
        at: "22:10",
        kind: "verify",
        title: "Attribution gate · €0 Verified",
        statusAfter: "VERIFIED",
      },
      {
        id: "le_miss_5",
        at: "22:20",
        kind: "learn",
        title: TERRACE_DEMAND_FADE_MISS.memoryNote,
        statusAfter: "LEARNED",
      },
    ],
    graph: {
      nodes: [
        { id: "n_wx", entityType: "forecast", label: "Sun window" },
        { id: "n_open", entityType: "action", label: "Soft-open" },
        { id: "n_fade", entityType: "outcome", label: "Demand faded" },
        { id: "n_mem", entityType: "decision", label: "Memory updated" },
      ],
      edges: [
        { fromId: "n_wx", toId: "n_open", relation: "triggered_by" },
        { fromId: "n_open", toId: "n_fade", relation: "resulted_in" },
        { fromId: "n_fade", toId: "n_mem", relation: "learned_as" },
      ],
    },
    autonomy: {
      decisionType: "terrace_created_contribution",
      level: 2,
      risk: "low",
      reversibility: "easy",
      historicalSuccessRate: 0.61,
      nHistorical: 9,
      neverFullyAutonomous: false,
      reason: "Weather-hold opens stay prepared until approved.",
    },
    whyBlocks: [
      {
        epistemic: "PREDICTED",
        title: "Expected",
        body: `€${EXPECTED} expected contribution if soft-open filled.`,
      },
      {
        epistemic: "OBSERVED",
        title: "Observed",
        body: `€${OBSERVED} observed · walk-in demand faded.`,
      },
      {
        epistemic: "VERIFIED",
        title: "Verified",
        body: "€0 Verified · attribution gate declined protected claim.",
      },
    ],
    locationDnaLine:
      "At Soho · New York, short sun windows without inbound signal historically preceded soft-open fades.",
    modelVersion: "decision-record/v1",
    demoLabel: "DEMO · honest miss",
    attentionOverride: "learned",
    createdAt: "2026-09-12T17:18:00+02:00",
    updatedAt: "2026-09-12T22:20:00+02:00",
  };
}

export function listValueMisses(
  vertical: "restaurant" | "hotel" = "restaurant",
): ValueMissTrace[] {
  if (vertical === "hotel") {
    return [
      {
        decisionId: "dec_hotel_vv_upgrade",
        displayId: "D-2422·M",
        title: "Upgrade offer · guest declined",
        expectedEuro: 180,
        observedEuro: 0,
        verifiedEuro: 0,
        reason:
          "Canal View upgrade prepared · guest stayed in booked category · no ancillary captured.",
        memoryNote:
          "Memory updated · late-arrival upgrades convert better when offered at check-in with rate transparency.",
      },
    ];
  }
  return [TERRACE_DEMAND_FADE_MISS];
}
