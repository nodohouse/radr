/**
 * D-1911 Peak capacity collision — flagship restaurant Decision Record.
 * Economics from CANON_PEAK.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { CANON_PEAK } from "../demo/canonical";
import {
  PEAK_SERVICE_CLOCK,
  peakContextLine,
  peakDeadlineDisplay,
  peakPhaseLabel,
  peakResumeNote,
} from "./peakClock";

const PAYLOAD =
  "Prepared — not written back to POS / delivery / menu systems. Operator confirms in systems of record.";

const OPERATING_STATE = [
  { label: "Floor occupancy", value: "78%", tone: "neutral" as const },
  { label: "Walk-in parties waiting", value: "2", tone: "watch" as const },
  { label: "Inbound reserved covers", value: "38 · next 22m", tone: "risk" as const },
  {
    label: "Arrival density 19:10–19:35",
    value: "42 covers in 25m",
    tone: "risk" as const,
  },
  { label: "KDS ticket time", value: "14 min ↑", tone: "risk" as const },
  { label: "Kitchen modeled load", value: "92%", tone: "risk" as const },
  {
    label: "Projected load if seat now",
    value: "~97%",
    tone: "risk" as const,
  },
  { label: "Delivery vs plan", value: "+31%", tone: "watch" as const },
  { label: "Second-turn tables at risk", value: "9", tone: "risk" as const },
];

const CONSTRAINTS = [
  "Already-seated guests cannot be moved",
  "VIP reservation may require timing (operator context)",
  "Delivery throttle only within operational policy",
  "Kitchen station is physically constrained",
  "Guest wait cannot exceed acceptable threshold",
];

const RELATIONSHIP = [
  "38 inbound covers",
  "2 walk-in tables",
  "delivery +31%",
  "projected kitchen load",
  "ticket-time pressure",
  "second-turn risk",
  "contribution exposure",
];

export function buildPeakDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const c = CANON_PEAK;
  const options = c.scenarios.map((s) => ({
    id: s.id,
    title: s.title,
    expectedContributionEuro: s.expectedContributionEuro,
    economicMetrics: s.economicMetrics,
    economicEffectNote: s.economicEffectNote,
    guestImpact: s.guestImpact,
    operationalRisk: s.operationalRisk,
    riskLevel: s.riskLevel ?? s.operationalRisk,
    mainRiskDescription: s.mainRiskDescription,
    confidence: s.confidence,
    timeToResult: s.id === "wait_12" ? "12 min" : "Immediate",
    note: s.note,
    recommended: s.recommended,
    isNoAction: s.isNoAction,
  }));

  const ledgerBase = [
    {
      id: "le_peak_01",
      at: "18:40",
      kind: "signal" as const,
      title: "Kitchen load 92% · inbound 38 covers",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_peak_02",
      at: "18:41",
      kind: "understand" as const,
      title: "Empty tables ≠ capacity under inbound wave",
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_peak_03",
      at: "18:41",
      kind: "simulate" as const,
      title: "Seat now vs wait 12m vs pause delivery",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_peak_04",
      at: PEAK_SERVICE_CLOCK.nowLabel,
      kind: "recommend" as const,
      title: "Wait 12 minutes · throttle delivery · feature fast dish",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.peak,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "peak_capacity_collision",
    decisionHorizon: "NOW",
    status,
    vertical: "restaurant",
    territories: ["LABOR", "SELL"],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState:
      "Floor 78% · kitchen 92% · 38 covers inbound · ticket 14m ↑ · delivery +31%",
    property: c.property,
    phaseLabel: peakPhaseLabel(),
    contextLine: peakContextLine(),
    recommendationHeadline: `WAIT ${PEAK_SERVICE_CLOCK.waitMinutes} MINUTES`,
    triggerEvents: ["kitchen_load_high", "inbound_covers", "delivery_surge"],
    evidenceRefs: [
      {
        id: "ev_res",
        label: "Reservations inbound",
        value: "38 covers · next 22m",
        source: "Reservations",
        freshness: "Observed 2m ago",
        grade: "OBSERVED",
      },
      {
        id: "ev_kds",
        label: "KDS ticket time",
        value: "14 min ↑",
        source: "KDS",
        freshness: "Observed 40s ago",
        grade: "OBSERVED",
      },
      {
        id: "ev_pos",
        label: "Open-order load",
        value: "Live",
        source: "POS",
        freshness: "Live",
        grade: "OBSERVED",
      },
      {
        id: "ev_del",
        label: "Delivery demand",
        value: "+31% vs plan",
        source: "Delivery",
        freshness: "Observed 4m ago",
        grade: "OBSERVED",
      },
      {
        id: "ev_mem",
        label: "Operating Memory",
        value: "12 comparable Friday services",
        source: "Operating Memory",
        freshness: "Demo sample",
        grade: "ESTIMATED",
      },
      {
        id: "ev_mix",
        label: "Walk-in order mix",
        value: "ESTIMATED",
        source: "Model",
        freshness: "Unknown",
        grade: "UNKNOWN",
      },
    ],
    relatedEntities: [
      { type: "service", id: "svc_dinner", label: "Friday dinner" },
      { type: "station", id: "st_kitchen", label: "Kitchen" },
    ],
    operatingStateSnapshot: OPERATING_STATE,
    relationshipChain: RELATIONSHIP,
    constraints: CONSTRAINTS,
    operatorContext: [],
    baselinePrediction:
      "Seat now → kitchen ~97% · tickets 17–20m · second turns slip",
    noActionOutcome:
      "Seating into peak destroys second-turn contribution vs wait path (€0 incremental)",
    options,
    recommendedOptionId: "wait_12",
    recommendationReasoning: c.understand,
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "Moderate wait for two walk-in parties",
    expectedOperationalImpact:
      "Hold walk-ins · throttle delivery · feature high €/min dish",
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation: "Evidence coverage High · data freshness Good · main uncertainty walk-in order mix. Historical comparable-service pattern: 78% of matched services showed turn-time deterioration — not Decision Confidence.",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Walk-in order mix",
    },
    mainRiskNarrative:
      "Walk-in abandonment during the 12-minute hold",
    decisionDeadline: peakDeadlineDisplay(),
    decisionDeadlineAt: PEAK_SERVICE_CLOCK.deadlineIso,
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_floor",
          provider: "Floor",
          title: "Hold next two walk-in tables",
          status: "PREPARED",
          detail: peakResumeNote(),
          preparedOnly: true,
        },
        {
          id: "ap_delivery",
          provider: "Delivery",
          title: "Throttle intake for 25 minutes",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_menu",
          provider: "Menu",
          title: "Feature faster high-contribution dish",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_inv",
          provider: "Inventory",
          title: "Preserve constrained signature item for committed demand",
          status: "PREPARED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerBase,
    graph: {
      nodes: [
        { id: "n_in", entityType: "booking", label: "38 inbound" },
        { id: "n_walk", entityType: "guest", label: "2 walk-ins" },
        { id: "n_del", entityType: "channel", label: "Delivery +31%" },
        { id: "n_kit", entityType: "staff", label: "Kitchen 92%" },
        { id: "n_dec", entityType: "decision", label: "Wait 12m" },
      ],
      edges: [
        { fromId: "n_in", toId: "n_kit", relation: "informed_by" },
        { fromId: "n_walk", toId: "n_kit", relation: "informed_by" },
        { fromId: "n_del", toId: "n_kit", relation: "informed_by" },
        { fromId: "n_kit", toId: "n_dec", relation: "triggered_by" },
      ],
    },
    playbook: {
      id: "pb_peak_capacity_berlin",
      title: "Peak Capacity Collision · Berlin Mitte",
      decisionType: "peak_capacity_collision",
      triggerConditions: [
        "kitchen_load >= 90%",
        "inbound_covers >= 30 in <25m",
        "ticket_time rising",
      ],
      recommendedSequence: [
        { order: 1, action: "Hold walk-in seating briefly" },
        { order: 2, action: "Throttle lower-value delivery" },
        { order: 3, action: "Feature high €/min dish" },
        { order: 4, action: "Resume when modeled load falls" },
      ],
      historicalSuccessRate: 0.78,
      expectedValueEuro: 620,
      confidence: "MEDIUM",
      locationScope: "loc_berlin_mitte",
      scope: "LOCAL",
      requiredApprovalLevel: 3,
      automationEligibility: false,
      nEvents: 12,
    },
    operatingDna: {
      locationId: "loc_berlin_mitte",
      locationLabel: "Berlin Mitte",
      summary:
        "Friday dinner kitchen throughput becomes fragile above ~94% for >15m.",
      dna: {
        vertical: "restaurant",
        weatherSensitivity: 0.4,
        walkInElasticity: 0.55,
        tableTurnDistribution: "peak-compressed",
        menuDemandElasticity: 0.62,
        stockoutSensitivity: 0.5,
        deliveryElasticity: 0.45,
        staffingResponse: 0.7,
        guestRepeatPatterns: "Friday regulars + walk-ins",
        recoveryEffectiveness: 0.68,
      },
    },
    autonomy: {
      decisionType: "peak_capacity_collision",
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.78,
      nHistorical: 12,
      neverFullyAutonomous: true,
      reason: "Material service Decision — human approval required.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Collision forming",
        body: "Floor 78% with walk-ins waiting while 38 reserved covers arrive in 22m, KDS at 14m rising, kitchen at 92%, delivery +31%.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Seat-now pressure",
        body: "Immediate seating projects kitchen load near 97% — historically followed by ticket times ≥17m and second-turn loss.",
      },
      {
        epistemic: "PREDICTED",
        title: "Wait path",
        body: "Holding two walk-ins ~12m, throttling delivery, and featuring a faster dish is expected to protect +€620 vs seat-now.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "WAIT 12 MINUTES",
        body: "Do not seat the next two walk-in tables yet. Throttle lower-contribution delivery. Feature high €/min dish. Resume when modeled pressure falls.",
      },
    ],
    locationDnaLine:
      "When kitchen load exceeds ~94% for >15m on comparable Friday dinners, ticket times rise, second turns slip, comps increase, and contribution deteriorates. Demo sample · 12 services.",
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-17T18:40:00+02:00",
    updatedAt: PEAK_SERVICE_CLOCK.nowIso,
  };

  if (status === "SIMULATED" || status === "RECOMMENDED") {
    return { ...base, status };
  }

  if (
    status === "APPROVED" ||
    status === "EXECUTING" ||
    status === "OBSERVING"
  ) {
    return {
      ...base,
      status,
      chosenOptionId: "wait_12",
      approver: "Sarah · GM Berlin Mitte",
      approvedAt: "2026-09-17T18:44:00+02:00",
      actionPlan: {
        ...base.actionPlan,
        status: status === "APPROVED" ? "APPROVED" : "EXECUTING",
        steps: base.actionPlan.steps.map((s) => ({
          ...s,
          status: status === "APPROVED" ? ("APPROVED" as const) : ("EXECUTING" as const),
        })),
      },
      ledger: [
        ...ledgerBase,
        {
          id: "le_peak_05",
          at: "18:44",
          kind: "approve",
          title: "GM approved wait-12 plan",
          statusAfter: "APPROVED",
        },
      ],
      updatedAt: "2026-09-17T18:44:00+02:00",
    };
  }

  if (status === "VERIFIED" || status === "LEARNED" || status === "CLOSED") {
    const verified: DecisionRecord = {
      ...base,
      status: status === "CLOSED" ? "LEARNED" : status,
      chosenOptionId: "wait_12",
      approver: "Sarah · GM Berlin Mitte",
      approvedAt: "2026-09-17T18:44:00+02:00",
      observedOutcome:
        "Peak load 95% · ticket peak 15.6m · 1 second turn lost · +€590 observed",
      actualContributionImpact: c.actualProtectedEuro ?? 590,
      outcomeDetail: {
        summary: "Service window closed. Outcome close to expectation.",
        rows: [
          { label: "Actual peak kitchen load", value: "95%" },
          { label: "Observed ticket-time peak", value: "15.6m" },
          { label: "Second turns lost", value: "1" },
          { label: "Expected incremental", value: "+€620" },
          { label: "Observed incremental contribution", value: "+€590" },
          { label: "Forecast error", value: "−€30 · −4.8%" },
        ],
        observedContributionEuro: 590,
        expectedContributionEuro: 620,
        forecastErrorEuro: -30,
        forecastErrorPct: -4.8,
      },
      verifiedValue: {
        amount: 590,
        kind: "protected",
        note: "Verified incremental contribution vs seat-now · DEMO",
      },
      verificationMethod: "DEMO_ILLUSTRATIVE",
      verifiedAt: "2026-09-17T21:40:00+02:00",
      verificationDetail: {
        method: "DEMO_ILLUSTRATIVE",
        attributionStrength: "STRONGLY_ATTRIBUTED",
        comparedTo: "Seat-now baseline (kitchen →97% path)",
        note: "Observed +€590; verified incremental contribution €590 after attribution gate.",
        metrics: [
          {
            metricType: "EXPECTED_INCREMENTAL_CONTRIBUTION",
            value: 620,
            currency: "EUR",
            label: "Expected incremental contribution",
            horizon: "tonight",
          },
          {
            metricType: "OBSERVED_INCREMENTAL_CONTRIBUTION",
            value: 590,
            currency: "EUR",
            label: "Observed incremental contribution",
            horizon: "tonight",
          },
          {
            metricType: "VERIFIED_INCREMENTAL_CONTRIBUTION",
            value: 590,
            currency: "EUR",
            label: "Verified incremental contribution",
            horizon: "tonight",
          },
        ],
      },
      forecastError: "−€30 (−4.8%)",
      lesson: c.learning.lesson,
      playbookImpact: `${c.learning.playbookFrom} → ${c.learning.playbookTo}`,
      playbookId: "pb_peak_capacity_berlin",
      patternsUpdated: ["friday_peak_kitchen_fragility"],
      playbooksUpdated: ["Peak Capacity Collision · Berlin Mitte · v3"],
      playbook: base.playbook
        ? { ...base.playbook, nEvents: 13, title: "Peak Capacity Collision · Berlin Mitte · v3" }
        : undefined,
      actionPlan: {
        ...base.actionPlan,
        status: "COMPLETED",
        steps: base.actionPlan.steps.map((s) => ({
          ...s,
          status: "EXECUTED" as const,
          preparedOnly: false,
        })),
      },
      ledger: [
        ...ledgerBase,
        {
          id: "le_peak_05",
          at: "18:44",
          kind: "approve",
          title: "GM approved wait-12 plan",
          statusAfter: "APPROVED",
        },
        {
          id: "le_peak_06",
          at: "21:35",
          kind: "observe",
          title: "Service outcome observed",
          statusAfter: "OBSERVING",
        },
        {
          id: "le_peak_07",
          at: "21:40",
          kind: "verify",
          title: "€590 verified incremental contribution",
          statusAfter: "VERIFIED",
        },
      ],
      updatedAt: "2026-09-17T21:40:00+02:00",
    };
    return verified;
  }

  return base;
}

/** Apply VIP operator context and re-recommend. */
export function applyPeakVipContext(record: DecisionRecord): DecisionRecord {
  const ctx = {
    id: `ctx_${Date.now()}`,
    author: "Sarah",
    role: "GM",
    timestamp: new Date().toISOString(),
    text: "VIP party at the bar needs to sit by 18:50.",
    impactNote: "Seat VIP · continue holding second walk-in · keep delivery throttle",
  };
  return {
    ...record,
    status: "AWAITING_APPROVAL",
    recommendationHeadline: "SEAT VIP BY 18:50 · HOLD SECOND WALK-IN",
    recommendationReasoning:
      "Operator context added. Seat VIP party at 18:50. Continue holding the second walk-in table. Maintain temporary delivery throttle. Resume standard seating after modeled pressure falls.",
    recommendedOptionId: "wait_12",
    operatorContext: [...(record.operatorContext ?? []), ctx],
    whyBlocks: [
      ...record.whyBlocks,
      {
        epistemic: "OBSERVED",
        title: "Operator context",
        body: ctx.text,
      },
    ],
    ledger: [
      ...record.ledger,
      {
        id: `le_ctx_${Date.now()}`,
        at: new Date().toISOString().slice(11, 16),
        kind: "understand",
        title: "Operator context · VIP by 18:50",
        statusAfter: "SIMULATED",
      },
      {
        id: `le_resim_${Date.now()}`,
        at: new Date().toISOString().slice(11, 16),
        kind: "recommend",
        title: "Recommendation updated after re-simulation",
        statusAfter: "AWAITING_APPROVAL",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}
