/**
 * Closed-loop demo: OTA mix → hold direct → verify → playbook.
 * Shared ID: dec_ota_canal
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { CANON_OTA } from "../demo/canonical";

const PAYLOAD =
  "Prepared — not written back to POS/PMS/channel. Operator confirms in the system of record.";

export function buildOtaDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const options = [
    {
      id: "do_nothing",
      title: "Release to OTA now",
      expectedContributionEuro: 0,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 88,
      timeToResult: "Immediate",
      note: "€4.200 perishes to OTA commission drag",
      isNoAction: true,
    },
    {
      id: "soft_cap",
      title: "Soft cap OTA",
      expectedContributionEuro: 1800,
      guestImpact: "none" as const,
      operationalRisk: "low" as const,
      confidence: 70,
      timeToResult: "Today",
      note: "Partial protection · still leaks premium",
    },
    {
      id: "hold_72h",
      title: "Hold premium direct to 72h",
      expectedContributionEuro: 3100,
      guestImpact: "none" as const,
      operationalRisk: "medium" as const,
      confidence: 73,
      timeToResult: "72h window",
      note: "Best net · protects ADR and commission",
      recommended: true,
    },
  ];

  const ledgerBase = [
    {
      id: "le_ota_01",
      at: "08:12",
      kind: "signal" as const,
      title: "OTA share +11 pts vs target",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_ota_02",
      at: "08:14",
      kind: "understand" as const,
      title: "Occupancy 89% · direct demand strong",
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_ota_03",
      at: "08:15",
      kind: "predict" as const,
      title: "Direct-fill probability 73%",
      statusAfter: "PREDICTED" as const,
    },
    {
      id: "le_ota_04",
      at: "08:16",
      kind: "simulate" as const,
      title: "Hold direct 72h vs release OTA now",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_ota_05",
      at: "08:17",
      kind: "recommend" as const,
      title: "Hold 4 premium rooms direct",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.ota,
    organizationId: "org_northstar",
    locationId: "loc_canal_house",
    operatingUnitId: "ou_canal_rooms",
    roleContext: "GM",
    decisionType: "channel_mix_hold",
    decisionHorizon: "THIS_WEEK",
    status,
    vertical: "hotel",
    title: "OTA mix drift on sold-out shoulder",
    problemStatement:
      "Nearly sold out — but giving too much away to OTAs.",
    currentState: "89% occupancy · direct 48% vs 59% target · OTA +11 pts",
    property: "Canal House · Amsterdam",
    phaseLabel: "Start of day · House",
    contextLine: "89% occupancy · 12 arrivals",
    triggerEvents: ["ota_share_drift", "high_occupancy"],
    evidenceRefs: [
      {
        id: "ev_fill",
        label: "Direct-fill probability",
        value: "73%",
        source: "Booking pace",
        freshness: "Live",
      },
      {
        id: "ev_adr",
        label: "ADR uplift",
        value: "+€26",
        source: "Historical weekends",
        freshness: "18 dates",
      },
    ],
    relatedEntities: [
      { type: "room", id: "room_premium_block", label: "4 premium rooms" },
      { type: "channel", id: "ch_ota", label: "OTA mix" },
    ],
    baselinePrediction: "Direct-fill 73% if held 72h",
    noActionOutcome: "€4.200 commission drag on demand that can fill direct",
    options,
    recommendedOptionId: "hold_72h",
    recommendationReasoning:
      "On comparable high-demand dates, 72h direct hold historically preceded protected contribution on remaining premium rooms.",
    expectedContributionImpact: 3100,
    expectedGuestImpact: "None",
    expectedOperationalImpact: "Channel inventory rule prepared — not auto-written",
    exposedContribution: 4200,
    confidence: {
      forecast: "HIGH",
      data: "HIGH",
      decision: "HIGH",
      userFacing: "HIGH",
      explanation: "PMS + channel manager live · 18 comparable dates",
      point: 73,
      low: 68,
      high: 79,
    },
    decisionDeadline: "Decide before noon",
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_hold",
          provider: "Channels",
          title: "Hold 4 premium rooms direct 72h",
          status: "READY",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerBase,
    graph: {
      nodes: [
        { id: "n_ota", entityType: "channel", label: "OTA share +11 pts" },
        { id: "n_occ", entityType: "booking", label: "89% occupancy" },
        { id: "n_dec", entityType: "decision", label: "Hold direct 72h" },
      ],
      edges: [
        { fromId: "n_ota", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_occ", toId: "n_dec", relation: "informed_by" },
      ],
    },
    playbook: {
      id: "pb_ota_weekend_hold",
      title: "High-demand weekend / OTA mix drift",
      decisionType: "channel_mix_hold",
      triggerConditions: [
        "occupancy > 85%",
        "pickup ahead",
        "OTA share > target",
      ],
      recommendedSequence: [
        { order: 1, action: "Hold premium rooms direct" },
        { order: 2, action: "Monitor pickup" },
        {
          order: 3,
          action: "Release 2 rooms OTA if pace falls",
        },
      ],
      historicalSuccessRate: 0.73,
      expectedValueEuro: 3100,
      confidence: "HIGH",
      locationScope: "loc_canal_house",
      scope: "LOCAL",
      requiredApprovalLevel: 3,
      automationEligibility: false,
      nEvents: 18,
    },
    operatingDna: {
      locationId: "loc_canal_house",
      locationLabel: "Canal House",
      summary: "Direct elasticity rises on event weekends; OTA over-exposure on shoulders.",
      dna: {
        vertical: "hotel",
        directBookingElasticity: 0.73,
        OTAExposure: 0.61,
        roomReadinessPatterns: "stable",
        housekeepingDuration: 28,
        upgradeConversion: 0.22,
        lateCheckoutBehavior: "moderate",
        ancillaryAttachment: 0.35,
        maintenanceRisk: 0.18,
        guestReturnPatterns: "weekend leisure repeat",
      },
    },
    memory: {
      id: "mem_ota_canal",
      locationId: "loc_canal_house",
      locationLabel: "Canal House",
      decisionType: "channel_mix_hold",
      conditions: [
        { key: "occupancy", op: "gt", value: 85 },
        { key: "ota_share_pts_above", op: "gt", value: 8 },
      ],
      optionStats: [
        {
          optionId: "hold_72h",
          label: "Hold 72h",
          successRate: 0.73,
          avgProtectedEuro: 2900,
          n: 18,
        },
        {
          optionId: "soft_cap",
          label: "Soft cap",
          successRate: 0.58,
          avgProtectedEuro: 1600,
          n: 11,
        },
      ],
      recommendedOptionId: "hold_72h",
      note: "Event-weekend direct demand stronger than baseline model.",
    },
    autonomy: {
      decisionType: "channel_mix_hold",
      level: 3,
      risk: "medium",
      reversibility: "moderate",
      historicalSuccessRate: 0.73,
      nHistorical: 18,
      neverFullyAutonomous: false,
      reason: "Channel writes stay prepared until approved.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Mix leak",
        body: "Nearly sold out (89% · 12 arrivals). Direct share 48% vs 59% target. OTA share 11 pts above target.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Commission drag",
        body: "€4.200 contribution exposed to OTA commission on demand that can still fill direct.",
      },
      {
        epistemic: "PREDICTED",
        title: "Direct fill",
        body: "73% historical direct-fill probability on comparable high-demand dates.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Hold premium",
        body: "Hold 4 premium rooms direct until 72h out. If pickup weakens, release 2 rooms back to OTA.",
      },
    ],
    locationDnaLine:
      "At Canal House, under sold-out pressure with OTA above target, a 72h direct hold historically preceded protected contribution.",
    image: "/marketing/hotel-ota-soldout.png",
    imageAlt: "Boutique hotel room",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-16T08:12:00+02:00",
    updatedAt: "2026-09-16T08:17:00+02:00",
  };

  if (
    status === "APPROVED" ||
    status === "EXECUTING" ||
    status === "OBSERVING"
  ) {
    return {
      ...base,
      status,
      chosenOptionId: "hold_72h",
      approver: "GM · Canal House",
      approvedAt: "2026-09-16T08:22:00+02:00",
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
          id: "le_ota_06",
          at: "08:22",
          kind: "approve",
          title: "GM approved direct hold",
          statusAfter: "APPROVED",
        },
        {
          id: "le_ota_07",
          at: "08:24",
          kind: "act",
          title: "Channel hold prepared",
          detail: "Not auto-written",
          statusAfter: "EXECUTING",
        },
      ],
      updatedAt: "2026-09-16T08:24:00+02:00",
    };
  }

  if (status === "VERIFIED" || status === "LEARNED" || status === "CLOSED") {
    return {
      ...base,
      status,
      chosenOptionId: "hold_72h",
      approver: "GM · Canal House",
      approvedAt: "2026-09-16T08:22:00+02:00",
      observedOutcome: "3 of 4 premium rooms sold direct",
      actualContributionImpact: CANON_OTA.actualProtectedEuro,
      actualGuestImpact: "None",
      verifiedValue: {
        amount: CANON_OTA.actualProtectedEuro,
        kind: CANON_OTA.verifiedKind,
        note: "Contribution protected · direct fill on held inventory",
      },
      verificationMethod: "PMS_BOOKING",
      verifiedAt: "2026-09-18T18:00:00+02:00",
      lesson: CANON_OTA.learning.lesson,
      playbookImpact: CANON_OTA.learning.nextTimeImpact,
      playbookId: "pb_ota_weekend_hold",
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
          id: "le_ota_06",
          at: "08:22",
          kind: "approve",
          title: "GM approved direct hold",
          statusAfter: "APPROVED",
        },
        {
          id: "le_ota_07",
          at: "08:24",
          kind: "act",
          title: "Channel hold prepared",
          statusAfter: "EXECUTING",
        },
        {
          id: "le_ota_08",
          at: "18:00",
          kind: "verify",
          title: `3/4 sold direct · €${CANON_OTA.actualProtectedEuro.toLocaleString("de-DE")} protected`,
          amountEuro: CANON_OTA.actualProtectedEuro,
          statusAfter: "VERIFIED",
        },
        {
          id: "le_ota_09",
          at: "18:10",
          kind: "learn",
          title: "Channel playbook updated",
          statusAfter: "LEARNED",
        },
      ],
      silenceNote: "Everything else operated within expectations.",
      whyBlocks: [
        ...base.whyBlocks,
        {
          epistemic: "VERIFIED",
          title: "Direct hold held",
          body: "3/4 premium rooms sold direct. Distribution cost avoided.",
        },
      ],
      updatedAt: "2026-09-18T18:10:00+02:00",
    };
  }

  return base;
}
