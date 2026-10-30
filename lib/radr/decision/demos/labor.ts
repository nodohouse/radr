/**
 * D-1920 — Workforce / labor mismatch at peak.
 * Economics from CANON_LABOR. Peer Decision Room to D-1911.
 * Seeded LEARNED — does not steal Needs You attention from peak / margin / BOH.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { CANON_LABOR } from "../demo/canonical";

const PAYLOAD =
  "Prepared — not written back to labor / delivery systems. Operator confirms in systems of record.";

const OPERATING_STATE = [
  { label: "Expected covers", value: "142", tone: "neutral" as const },
  { label: "Kitchen capacity", value: "94%", tone: "risk" as const },
  { label: "FOH on floor", value: "Scheduled · peak-ready", tone: "watch" as const },
  { label: "Ticket time", value: "Rising toward threshold", tone: "watch" as const },
  { label: "Delivery intake", value: "On plan · compressible", tone: "neutral" as const },
  { label: "Bar coverage", value: "Thin vs inbound", tone: "watch" as const },
];

const CONSTRAINTS = [
  "Kitchen throughput is the binding constraint — not FOH headcount",
  "Agency labor cannot clear a kitchen bottleneck",
  "Delivery throttle only within operational policy",
  "Already-seated guests cannot be moved",
  "Breaks may shift within labor law / house rules",
];

const RELATIONSHIP = [
  "Expected covers 142",
  "Kitchen at 94%",
  "FOH schedule",
  "Bar coverage gap",
  "Delivery intake",
  "Ticket-time trajectory",
  "$840 contribution exposed",
];

export function buildLaborDecisionRecord(
  status: DecisionRecord["status"] = "LEARNED",
): DecisionRecord {
  const c = CANON_LABOR;

  const options = [
    {
      id: "do_nothing",
      title: "Do nothing",
      expectedContributionEuro: 0,
      guestImpact: "high" as const,
      operationalRisk: "high" as const,
      confidence: 88,
      timeToResult: "Service",
      note: "Guest waits compound · $840 contribution exposed",
      isNoAction: true,
    },
    {
      id: "agency",
      title: "Call flex / agency FOH",
      expectedContributionEuro: 410,
      guestImpact: "medium" as const,
      operationalRisk: "high" as const,
      confidence: 70,
      timeToResult: "45–60m",
      note: "Obvious · feeds kitchen bottleneck · high cost",
    },
    {
      id: "alter_break",
      title: "Alter break timing",
      expectedContributionEuro: 280,
      guestImpact: "medium" as const,
      operationalRisk: "medium" as const,
      confidence: 68,
      timeToResult: "Immediate",
      note: "Partial FOH relief · kitchen still binding",
    },
    {
      id: "de_emphasize",
      title: "De-emphasize heavy menu items",
      expectedContributionEuro: 490,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 74,
      timeToResult: "Immediate",
      note: "Lowers kitchen injection · incomplete without FOH rebalance",
    },
    {
      id: "throttle_only",
      title: "Throttle delivery only",
      expectedContributionEuro: 520,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 76,
      timeToResult: "25m window",
      note: "Protects kitchen · leaves bar / floor imbalance",
    },
    {
      id: "rebalance",
      title: "Move 1 FOH to bar · slow delivery 25m",
      expectedContributionEuro: 720,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 78,
      timeToResult: "Immediate",
      note: "Protects waits · kitchen throughput · contribution",
      recommended: true,
    },
  ];

  const ledgerBase = [
    {
      id: "le_lab_01",
      at: "16:28",
      kind: "signal" as const,
      title: "Service pressure predicted before peak · kitchen 94%",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_lab_02",
      at: "16:30",
      kind: "understand" as const,
      title: "More FOH would accelerate orders into the bottleneck",
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_lab_03",
      at: "16:32",
      kind: "simulate" as const,
      title: "Agency vs rebalance vs throttle vs menu de-emphasize",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_lab_04",
      at: "16:35",
      kind: "recommend" as const,
      title: "Move 1 FOH to bar · slow delivery 25m",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.labor,
    organizationId: "org_northstar_restaurants",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "labor_peak_rebalance",
    decisionHorizon: "TODAY",
    status,
    vertical: "restaurant",
    territories: ["LABOR", "SELL"],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState:
      "Kitchen 94% · covers 142 expected · FOH scheduled · bar thin · delivery compressible",
    property: c.property,
    phaseLabel: "Pre-peak · workforce",
    contextLine: "Kitchen binding · do not add FOH into the bottleneck",
    recommendationHeadline: "REBALANCE FOH · THROTTLE DELIVERY",
    recommendationReasoning: c.understand,
    triggerEvents: ["kitchen_load_high", "labor_mismatch", "delivery_surge"],
    evidenceRefs: c.evidence.map((e, i) => ({
      id: `ev_lab_${i}`,
      label: e.label,
      value: e.value,
      source: c.sources[i % c.sources.length]?.name ?? "System",
      freshness: c.sources[i % c.sources.length]?.freshness ?? "Live",
      grade: "OBSERVED" as const,
    })),
    relatedEntities: [
      { type: "service", id: "svc_dinner", label: "Dinner service" },
      { type: "station", id: "st_kitchen", label: "Kitchen" },
      { type: "station", id: "st_bar", label: "Bar" },
    ],
    operatingStateSnapshot: OPERATING_STATE,
    relationshipChain: RELATIONSHIP,
    constraints: CONSTRAINTS,
    baselinePrediction:
      "Add FOH → more order injection → longer tickets → lower throughput",
    noActionOutcome: "$840 contribution exposed · guest waits compound",
    options,
    recommendedOptionId: "rebalance",
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "Protects waits without flooding the kitchen",
    expectedOperationalImpact:
      "FOH rebalance + delivery throttle prepared — not auto-written",
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation:
        "Reservations × labor × KDS × delivery live · 12 comparable Thursday peaks",
      point: 78,
      low: 70,
      high: 86,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Exact walk-in order mix into hot stations",
    },
    mainRiskNarrative:
      "Agency path looks like coverage but historically followed by worse ticket times",
    decisionDeadline: `Decide by ${c.deadline}`,
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_lab_1",
          provider: "Labor",
          title: "Move 1 FOH from floor to bar for peak window",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_lab_2",
          provider: "Delivery",
          title: "Throttle intake 25 minutes · restore when kitchen < threshold",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_lab_3",
          provider: "Floor",
          title: "Hold agency call unless kitchen recovers below 90%",
          status: "PREPARED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerBase,
    graph: {
      nodes: [
        { id: "n_kit", entityType: "staff", label: "Kitchen 94%" },
        { id: "n_foh", entityType: "staff", label: "FOH schedule" },
        { id: "n_bar", entityType: "staff", label: "Bar thin" },
        { id: "n_del", entityType: "channel", label: "Delivery" },
        { id: "n_dec", entityType: "decision", label: "Rebalance" },
      ],
      edges: [
        { fromId: "n_kit", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_foh", toId: "n_dec", relation: "informed_by" },
        { fromId: "n_del", toId: "n_dec", relation: "informed_by" },
      ],
    },
    autonomy: {
      decisionType: "labor_peak_rebalance",
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.78,
      nHistorical: 12,
      neverFullyAutonomous: false,
      reason: "Labor moves stay prepared until GM confirms in the roster system.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Kitchen binding",
        body: "Kitchen at 94% with 142 expected covers — FOH is not the scarce resource.",
      },
      {
        epistemic: "PREDICTED",
        title: "Agency trap",
        body: "Adding FOH historically followed by more order injection into a bottleneck.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Rebalance",
        body: "Move 1 FOH to bar · throttle delivery 25m · protect $720 expected.",
      },
    ],
    locationDnaLine:
      "At Soho · New York, under Thursday peak pressure with kitchen ≥90%, rebalance before agency historically preceded better waits and contribution.",
    playbookImpact: c.learning.nextTimeImpact,
    playbookId: "pb_labor_rebalance",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-18T16:28:00+02:00",
    updatedAt: "2026-09-18T22:40:00+02:00",
    attentionOverride: "learned",
  };

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...base,
      status,
      chosenOptionId: "rebalance",
      approver: "GM",
      actualContributionImpact: c.actualProtectedEuro,
      verifiedValue: {
        amount: c.actualProtectedEuro ?? 690,
        kind: "protected",
        note: "Rebalance path · ticket time held · agency not called",
      },
      lesson: c.learning.lesson,
      playbookImpact: `${c.learning.playbookFrom} → ${c.learning.playbookTo}`,
      attentionOverride: "learned",
      ledger: [
        ...ledgerBase,
        {
          id: "le_lab_05",
          at: "16:40",
          kind: "approve" as const,
          title: "Rebalance approved · agency held",
          statusAfter: "APPROVED" as const,
        },
        {
          id: "le_lab_06",
          at: "22:15",
          kind: "verify" as const,
          title: "$690 protected · waits contained",
          statusAfter: "VERIFIED" as const,
        },
        {
          id: "le_lab_07",
          at: "22:40",
          kind: "learn" as const,
          title: c.learning.lesson,
          statusAfter: "LEARNED" as const,
        },
      ],
    };
  }

  if (status === "APPROVED") {
    return {
      ...base,
      status,
      chosenOptionId: "rebalance",
      approver: "GM",
      attentionOverride: "handling",
    };
  }

  if (status === "AWAITING_APPROVAL") {
    return {
      ...base,
      status,
      attentionOverride: "needs_you",
    };
  }

  return base;
}
