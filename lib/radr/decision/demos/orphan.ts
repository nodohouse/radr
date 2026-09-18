/**
 * Closed-loop demo: Orphan night → wait → €148 rate → recovered contribution.
 * Shared ID: dec_orphan_chiado · economics from CANON_ORPHAN.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { CANON_ORPHAN } from "../demo/canonical";

const PAYLOAD =
  "Prepared — not written back to POS/PMS/channel. Operator confirms in the system of record.";

const RATE = CANON_ORPHAN.recommendedRateEuro ?? 148;

export function buildOrphanDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const options = [
    {
      id: "do_nothing",
      title: "Do nothing",
      expectedContributionEuro: 0,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 90,
      timeToResult: "Night",
      note: `€${CANON_ORPHAN.exposureEuro} opportunity perishes if empty`,
      isNoAction: true,
    },
    {
      id: "discount_128",
      title: "Discount to €128",
      expectedContributionEuro: 78,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 78,
      timeToResult: "Today",
      note: "Rate €128 · expected net contribution €78",
    },
    {
      id: "open_148",
      title: `Wait 24h · €${RATE} direct`,
      expectedContributionEuro: CANON_ORPHAN.expectedProtectedEuro,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 64,
      timeToResult: "72h window",
      note: `Recommended rate €${RATE} · expected net contribution €${CANON_ORPHAN.expectedProtectedEuro}`,
      recommended: true,
    },
  ];

  const ledgerBase = [
    {
      id: "le_or_01",
      at: "09:04",
      kind: "signal" as const,
      title: "1-night gap detected · Unit 24",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_or_02",
      at: "09:05",
      kind: "understand" as const,
      title: "17 comparable gaps · cleaning already scheduled",
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_or_03",
      at: "09:06",
      kind: "predict" as const,
      title: "64% fill if released now",
      statusAfter: "PREDICTED" as const,
    },
    {
      id: "le_or_04",
      at: "09:07",
      kind: "simulate" as const,
      title: "Direct €148 vs discount vs wait",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_or_05",
      at: "09:08",
      kind: "recommend" as const,
      title: "Open one-night direct at €148",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.orphan,
    organizationId: "org_northstar",
    locationId: "loc_chiado_collective",
    operatingUnitId: "ou_chiado_units",
    roleContext: "GM",
    decisionType: "orphan_night_fill",
    decisionHorizon: "TODAY",
    status,
    vertical: "apartment",
    title: "Orphan night · Unit 24",
    problemStatement:
      "T−72h to an orphan night. The obvious move is fill now — RADR waits 24 hours, keeping the unit direct-first.",
    currentState: "T−72h · Unit 24 · gross night €164 · direct-first hold",
    property: "Chiado Collective · Lisbon",
    phaseLabel: "Availability · Chiado",
    contextLine: "Unit 24 · orphan night · T−72h",
    recommendationHeadline: "WAIT 24 HOURS · KEEP DIRECT-FIRST",
    triggerEvents: ["orphan_gap"],
    evidenceRefs: [
      {
        id: "ev_fill",
        label: "Historical fill",
        value: "64%",
        source: "Channel calendar",
        freshness: "Quarter lookback",
      },
      {
        id: "ev_n",
        label: "Comparable gaps",
        value: "17",
        source: "Decision memory",
        freshness: "This quarter",
      },
    ],
    relatedEntities: [
      { type: "unit", id: "unit_24", label: "Apartment 24" },
    ],
    baselinePrediction: "Immediate fill nets ~€78 after channel + turnover drag",
    noActionOutcome: "€164 gross exposure if night stays empty",
    options,
    recommendedOptionId: "open_148",
    recommendationReasoning:
      "Waiting 24 hours keeps the unit direct-first. At T−48h release one-night direct at €148 if still open; at T−24h reassess channel fallback.",
    expectedContributionImpact: CANON_ORPHAN.expectedProtectedEuro,
    expectedGuestImpact: "None",
    expectedOperationalImpact: "Wait 24h · then gated direct release",
    exposedContribution: CANON_ORPHAN.exposureEuro,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation:
        "Evidence coverage High. Historical direct-fill probability 64% is a domain rate — not Decision Confidence.",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Whether longer direct demand materializes in 24h",
    },
    decisionDeadline: "T−72h · wait 24 hours",
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_hold",
          provider: "Channels",
          title: "Hold unit direct-first for 24h",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_open",
          provider: "Channels",
          title: "If still open at T−48h: release one-night direct at €148",
          status: "PREPARED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerBase,
    graph: {
      nodes: [
        { id: "n_gap", entityType: "signal", label: "1-night gap" },
        { id: "n_unit", entityType: "unit", label: "Unit 24" },
        { id: "n_dec", entityType: "decision", label: "Open €148" },
      ],
      edges: [
        { fromId: "n_gap", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_unit", toId: "n_dec", relation: "informed_by" },
      ],
    },
    playbook: {
      id: "pb_orphan_direct",
      title: "One-night orphan gap",
      decisionType: "orphan_night_fill",
      triggerConditions: [
        "1-night gap",
        "≥72h before check-in",
        "cleaning already scheduled",
      ],
      recommendedSequence: [
        { order: 1, action: "Relax minimum stay" },
        { order: 2, action: "Open direct at floor" },
        { order: 3, action: "Release OTA if unfilled" },
      ],
      historicalSuccessRate: 0.64,
      expectedValueEuro: CANON_ORPHAN.expectedProtectedEuro,
      confidence: "MEDIUM",
      locationScope: "loc_lisbon_chiado",
      scope: "LOCAL",
      requiredApprovalLevel: 3,
      automationEligibility: true,
      nEvents: 17,
    },
    operatingDna: {
      locationId: "loc_chiado_collective",
      locationLabel: "Lisbon Chiado",
      summary: "Orphan fill strong when opened early without discount.",
      dna: {
        vertical: "apartment",
        orphanNightFill: 0.64,
        cleaningDuration: 3.5,
        turnoverRisk: 0.22,
        maintenanceDrag: 0.15,
        channelElasticity: 0.48,
        lengthOfStayBehavior: "weekend-biased",
        directConversion: 0.41,
        priceSensitivity: 0.35,
      },
    },
    memory: {
      id: "mem_orphan_chiado",
      locationId: "loc_chiado_collective",
      locationLabel: "Lisbon Chiado",
      decisionType: "orphan_night_fill",
      conditions: [
        { key: "gap_nights", op: "eq", value: 1 },
        { key: "hours_to_arrival", op: "gte", value: 72 },
      ],
      optionStats: [
        {
          optionId: "open_148",
          label: "Open €148",
          successRate: 0.64,
          avgProtectedEuro: CANON_ORPHAN.expectedProtectedEuro,
          n: 17,
        },
        {
          optionId: "discount_128",
          label: "Discount €128",
          successRate: 0.79,
          avgProtectedEuro: 98,
          n: 9,
        },
      ],
      recommendedOptionId: "open_148",
      note: "No discount needed when ≥72h out.",
    },
    autonomy: {
      decisionType: "orphan_night_fill",
      level: 4,
      risk: "low",
      reversibility: "easy",
      historicalSuccessRate: 0.64,
      nHistorical: 17,
      neverFullyAutonomous: false,
      reason: "Low risk · high reversibility — rule-based auto eligible after approval.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "One-night gap",
        body: "Apartment 24 has a one-night gap. Minimum-stay rule blocks fill. Cleaner capacity already planned.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Empty night",
        body: "€164 contribution exposed if the night stays empty. €148 open rate clears without guest impact.",
      },
      {
        epistemic: "PREDICTED",
        title: "Fill rate",
        body: "64% historical fill on comparable one-night gaps. 17 similar gaps this quarter.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Open at €148",
        body: "Open one-night inventory at €148 now. If unfilled by tomorrow 14:00, release to channel.",
      },
    ],
    locationDnaLine:
      "At Lisbon Chiado, opening one-night inventory ≥72h out historically preceded recovered nights without guest impact.",
    image: "/marketing/apt-orphan-gap.png",
    imageAlt: "Empty apartment night",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-16T09:04:00+02:00",
    updatedAt: "2026-09-16T09:08:00+02:00",
  };

  if (
    status === "APPROVED" ||
    status === "EXECUTING" ||
    status === "OBSERVING"
  ) {
    return {
      ...base,
      status,
      chosenOptionId: "open_148",
      approver: "GM · Chiado",
      approvedAt: "2026-09-16T09:12:00+02:00",
      actionPlan: {
        ...base.actionPlan,
        status: "EXECUTING",
        steps: base.actionPlan.steps.map((s) => ({
          ...s,
          status: "EXECUTING" as const,
        })),
      },
      ledger: [
        ...ledgerBase,
        {
          id: "le_or_06",
          at: "09:12",
          kind: "approve",
          title: "GM approved open at €148",
          statusAfter: "APPROVED",
        },
        {
          id: "le_or_07",
          at: "09:14",
          kind: "act",
          title: "Inventory open prepared",
          statusAfter: "EXECUTING",
        },
      ],
      updatedAt: "2026-09-16T09:14:00+02:00",
    };
  }

  if (status === "VERIFIED" || status === "LEARNED" || status === "CLOSED") {
    return {
      ...base,
      status,
      chosenOptionId: "open_148",
      approver: "GM · Chiado",
      approvedAt: "2026-09-16T09:12:00+02:00",
      observedOutcome: `Booked direct at €${RATE} · net contribution verified`,
      actualContributionImpact: CANON_ORPHAN.actualProtectedEuro,
      actualRevenueImpact: RATE,
      actualGuestImpact: "None",
      verifiedValue: {
        amount: CANON_ORPHAN.verifiedIncrementalEuro ?? CANON_ORPHAN.actualProtectedEuro,
        kind: CANON_ORPHAN.verifiedKind,
        note: "Direct booking · conservative verified recovered · DEMO",
      },
      verificationMethod: "PMS_BOOKING",
      verifiedAt: "2026-09-16T16:40:00+02:00",
      lesson: CANON_ORPHAN.learning.lesson,
      playbookImpact: CANON_ORPHAN.learning.nextTimeImpact,
      playbookId: "pb_orphan_direct",
      actionPlan: {
        ...base.actionPlan,
        status: "COMPLETED",
        steps: base.actionPlan.steps.map((s) => ({
          ...s,
          status: "COMPLETED" as const,
        })),
      },
      ledger: [
        ...ledgerBase,
        {
          id: "le_or_06",
          at: "09:12",
          kind: "approve",
          title: `GM approved wait · €${RATE} direct`,
          statusAfter: "APPROVED",
        },
        {
          id: "le_or_07",
          at: "09:14",
          kind: "act",
          title: "Inventory hold prepared",
          statusAfter: "EXECUTING",
        },
        {
          id: "le_or_08",
          at: "16:40",
          kind: "verify",
          title: `€${CANON_ORPHAN.actualProtectedEuro} recovered contribution`,
          amountEuro: CANON_ORPHAN.actualProtectedEuro,
          statusAfter: "VERIFIED",
        },
        {
          id: "le_or_09",
          at: "16:45",
          kind: "learn",
          title: "Price floor increased in playbook",
          statusAfter: "LEARNED",
        },
      ],
      silenceNote: "Everything else operated within expectations.",
      whyBlocks: [
        ...base.whyBlocks,
        {
          epistemic: "VERIFIED",
          title: "Filled above floor",
          body: `Booked direct at €${RATE}. Verified recovered contribution €${CANON_ORPHAN.actualProtectedEuro}.`,
        },
      ],
      updatedAt: "2026-09-16T16:45:00+02:00",
    };
  }

  return base;
}
