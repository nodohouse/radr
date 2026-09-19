/**
 * Closed-loop demo: Tuna shortage → verify → learn → structural debt.
 * Shared ID: dec_tuna_berlin
 */

import type { DecisionRecord } from "../record";
import { evaluatePatternStage } from "../pattern";
import { computeRegret } from "../counterfactual";
import { DECISION_IDS } from "../ids";

const PAYLOAD =
  "Prepared — not written back to POS/PMS/channel. Operator confirms in the system of record.";

export const TUNA_STRUCTURAL_ID = DECISION_IDS.tunaStructural;

export function buildTunaDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const options = [
    {
      id: "do_nothing",
      title: "Do nothing",
      expectedContributionEuro: -1840,
      guestImpact: "high" as const,
      operationalRisk: "high" as const,
      confidence: 90,
      timeToResult: "Peak",
      note: "Sellout ~20:10 · €1,840 contribution exposed",
      isNoAction: true,
    },
    {
      id: "supplier_first",
      title: "Rush 6 portions",
      expectedContributionEuro: 1520,
      costEuro: 180,
      guestImpact: "none" as const,
      operationalRisk: "medium" as const,
      confidence: 74,
      timeToResult: "~40 min",
      note: "Obvious move · rush premium · historically 62% success at Berlin Mitte",
    },
    {
      id: "feature_swap",
      title: "Feature Truffle Pasta first",
      expectedContributionEuro: 1640,
      costEuro: 40,
      guestImpact: "low" as const,
      operationalRisk: "low" as const,
      confidence: 81,
      timeToResult: "Immediate",
      note: "Feature-swap-first · historical feature-swap success 81% (n=22) · €1,590 verified protected",
      recommended: true,
    },
  ];

  const stage = evaluatePatternStage({
    incidentCount: 7,
    windowSize: 12,
    similarity: 0.88,
    financialExposureEuro: 8420,
  });

  const ledgerAwaiting = [
    {
      id: "le_tuna_01",
      at: "17:02",
      kind: "signal" as const,
      title: "Stock discrepancy detected",
      detail: "Tuna Tataki · 6 portions short vs peak plan",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_tuna_02",
      at: "17:03",
      kind: "predict" as const,
      title: "Expected sellout 20:10",
      detail: "37 portions expected · 31 available",
      statusAfter: "PREDICTED" as const,
    },
    {
      id: "le_tuna_03",
      at: "17:03",
      kind: "understand" as const,
      title: "€1,840 contribution exposed",
      amountEuro: 1840,
      statusAfter: "UNDERSTANDING" as const,
    },
    {
      id: "le_tuna_04",
      at: "17:04",
      kind: "simulate" as const,
      title: "Rush 6 portions option modeled",
      detail: "€1,520 expected protected · obvious path",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_tuna_05",
      at: "17:04",
      kind: "simulate" as const,
      title: "Feature-swap option modeled",
      detail: "€1,640 expected protected",
    },
    {
      id: "le_tuna_06",
      at: "17:05",
      kind: "recommend" as const,
      title: "RADR recommended feature-swap-first",
      detail: "Memory: feature swap 81% vs supplier 62% under these conditions",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.tuna,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "menu_stockout_intervention",
    decisionHorizon: "TODAY",
    status,
    vertical: "restaurant",
    title: "Tuna Tataki shortfall before peak",
    problemStatement:
      "Tuna Tataki is tonight’s bestseller. Supplier shortfall: 6 portions missing for dinner.",
    currentState: "31 portions on hand · 37 expected in peak · sellout ~20:10",
    property: "Berlin Mitte",
    phaseLabel: "Pre-shift · Dinner",
    contextLine: "Peak 19:30 · supplier shortfall",
    triggerEvents: ["supplier_shortfall", "pos_demand_pace"],
    evidenceRefs: [
      {
        id: "ev_sellout",
        label: "Sellout probability",
        value: "82%",
        source: "Historical menu mix",
        freshness: "Week lookback",
      },
      {
        id: "ev_sub",
        label: "Substitution acceptance",
        value: "64%",
        source: "POS",
        freshness: "n=28",
      },
      {
        id: "ev_stock",
        label: "Portions available",
        value: "31",
        source: "Inventory",
        freshness: "14 min ago",
      },
    ],
    relatedEntities: [
      { type: "menu_item", id: "dish_tuna_tataki", label: "Tuna Tataki" },
      { type: "supplier", id: "sup_bluefin_de", label: "Bluefin Berlin" },
    ],
    baselinePrediction: "Sellout ~20:10 if no intervention",
    noActionOutcome: "−€1,840 peak contribution · guest disappointment at peak",
    options,
    recommendedOptionId: "feature_swap",
    recommendationReasoning:
      "At Berlin Mitte, when covers >135 and tuna demand >30 with delivery shortfall ≥6 portions and <2h to service, feature-swap-first historically outperforms supplier-first (81% vs 62%).",
    expectedContributionImpact: 1640,
    expectedGuestImpact: "Low — featured substitution historically accepted",
    expectedOperationalImpact: "Kitchen features Truffle Pasta; supplier option held as fallback",
    exposedContribution: 1840,
    confidence: {
      forecast: "HIGH",
      data: "MEDIUM",
      decision: "HIGH",
      userFacing: "HIGH",
      explanation:
        "Historical feature-swap success 81% (n=22 comparable services) — not Decision Confidence. Inventory sync partial.",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "MEDIUM",
      dataFreshness: "MEDIUM",
      mainUncertainty: "Supplier ETA vs featured uptake",
    },
    decisionDeadline: "Decide by 17:15",
    decisionDeadlineAt: "2026-09-16T17:15:00+02:00",
    valueDecayCurve: [
      { at: "17:15", valueEuro: 1640 },
      { at: "17:35", valueEuro: 1180 },
      { at: "18:00", valueEuro: 640 },
      { at: "19:30", valueEuro: 0 },
    ],
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_feature",
          provider: "POS",
          title: "Prepare Truffle Pasta feature for peak",
          status: "READY",
          preparedOnly: true,
          detail: "Menu feature draft — not written back",
        },
        {
          id: "ap_supplier",
          provider: "Supplier / Procurement",
          title: "Hold supplier call as fallback",
          status: "DRAFTED",
          preparedOnly: true,
          detail: "6 portions tuna · confirm by 17:30",
        },
      ],
    },
    executionRefs: [],
    ledger: ledgerAwaiting,
    graph: {
      nodes: [
        { id: "n_signal", entityType: "signal", label: "Tuna shortfall" },
        { id: "n_stock", entityType: "inventory", label: "31 portions" },
        { id: "n_demand", entityType: "forecast", label: "37 expected" },
        { id: "n_sup", entityType: "supplier", label: "Bluefin Berlin" },
        { id: "n_dec", entityType: "decision", label: "Feature swap first" },
      ],
      edges: [
        { fromId: "n_signal", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_stock", toId: "n_dec", relation: "informed_by" },
        { fromId: "n_demand", toId: "n_dec", relation: "informed_by" },
        { fromId: "n_sup", toId: "n_dec", relation: "informed_by" },
      ],
    },
    pattern: {
      id: "pat_tuna_berlin",
      decisionType: "menu_stockout_intervention",
      locationId: "loc_berlin_mitte",
      stage,
      incidentCount: 7,
      windowLabel: "12 peak services",
      similarity: 0.88,
      financialExposureEuro: 8420,
      guestImpact: "medium",
      trend: "worsening",
      message: "THIS IS NO LONGER AN EXCEPTION.",
      structuralDecisionId: TUNA_STRUCTURAL_ID,
    },
    debt: {
      id: "debt_tuna_berlin",
      title: "Tuna supply risk",
      locationLabel: "Berlin Mitte",
      decisionType: "menu_stockout_intervention",
      incidentCount: 7,
      windowLabel: "12 peak services",
      cumulativeExposureEuro: 8420,
      temporaryFixesUsed: 5,
      structuralRecommendation:
        "Add backup supplier or reduce menu dependency on single-source tuna.",
      relatedDecisionIds: [DECISION_IDS.tuna, TUNA_STRUCTURAL_ID],
      horizon: "STRUCTURAL",
    },
    memory: {
      id: "mem_tuna_berlin",
      locationId: "loc_berlin_mitte",
      locationLabel: "Berlin Mitte",
      decisionType: "menu_stockout_intervention",
      conditions: [
        { key: "covers", op: "gt", value: 135 },
        { key: "tuna_demand", op: "gt", value: 30 },
        { key: "supplier_shortfall_portions", op: "gte", value: 6 },
        { key: "minutes_to_service", op: "lt", value: 120 },
      ],
      optionStats: [
        {
          optionId: "supplier_first",
          label: "Supplier-first",
          successRate: 0.62,
          avgProtectedEuro: 1420,
          n: 18,
        },
        {
          optionId: "feature_swap",
          label: "Feature-swap-first",
          successRate: 0.81,
          avgProtectedEuro: 1590,
          n: 22,
        },
      ],
      recommendedOptionId: "feature_swap",
      note: "Historical feature-swap success 81% (n=22). Canonical verified protected €1,590.",
    },
    playbook: {
      id: "pb_tuna_feature_first",
      title: "Tuna shortfall — feature-swap-first",
      decisionType: "menu_stockout_intervention",
      triggerConditions: [
        "tuna_demand > 30 portions",
        "delivery shortfall ≥ 6 portions",
        "service starts < 2h",
      ],
      recommendedSequence: [
        { order: 1, action: "Feature Truffle Pasta for peak" },
        { order: 2, action: "Hold supplier call as fallback until 17:30" },
        { order: 3, action: "Protect main dining pacing on bestsellers" },
      ],
      fallbackSequence: [
        { order: 1, action: "Rush 6 portions supplier if feature uptake low" },
      ],
      historicalSuccessRate: 0.81,
      expectedValueEuro: 1590,
      confidence: "HIGH",
      locationScope: "loc_berlin_mitte",
      scope: "LOCAL",
      requiredApprovalLevel: 3,
      automationEligibility: false,
      nEvents: 22,
    },
    operatingDna: {
      locationId: "loc_berlin_mitte",
      locationLabel: "Berlin Mitte",
      summary:
        "High stockout sensitivity on peak bestsellers; substitution acceptance strong when featured early.",
      dna: {
        vertical: "restaurant",
        weatherSensitivity: 0.72,
        walkInElasticity: 0.55,
        tableTurnDistribution: "peak-compressed",
        menuDemandElasticity: 0.68,
        stockoutSensitivity: 0.91,
        deliveryElasticity: 0.4,
        staffingResponse: 0.62,
        guestRepeatPatterns: "tuna affinity on return covers",
        recoveryEffectiveness: 0.78,
      },
    },
    autonomy: {
      decisionType: "menu_stockout_intervention",
      level: 3,
      risk: "medium",
      reversibility: "moderate",
      historicalSuccessRate: 0.81,
      nHistorical: 22,
      neverFullyAutonomous: false,
      reason: "One-tap approval earned; supplier writes stay prepared-only.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Shortfall confirmed",
        body: "Tuna Tataki is the peak bestseller. Supplier shortfall: 6 portions missing for dinner.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Peak exposure",
        body: "37 expected tuna covers in the peak window. €1,840 contribution exposed tonight if stockout stands.",
      },
      {
        epistemic: "PREDICTED",
        title: "Sell-through",
        body: "82% historical sell-through before 20:15 on comparable nights. Substitution acceptance 64% (n=28) when Truffle Pasta is featured.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Feature swap first",
        body: "Feature Truffle Pasta during peak. Hold supplier as fallback if uptake weak by 17:30.",
      },
    ],
    locationDnaLine:
      "At Berlin Mitte, under these peak conditions, feature-swap-first historically preceded higher protected contribution than supplier-first.",
    image: "/marketing/hero-tuna-supply.png",
    imageAlt: "Tuna delivery shortfall",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-16T17:02:00+02:00",
    updatedAt: "2026-09-16T17:05:00+02:00",
  };

  if (
    status === "APPROVED" ||
    status === "EXECUTING" ||
    status === "OBSERVING"
  ) {
    return {
      ...base,
      status,
      chosenOptionId: "feature_swap",
      approver: "GM · Berlin Mitte",
      approvedAt: "2026-09-16T17:06:00+02:00",
      actionPlan: {
        ...base.actionPlan,
        status: status === "APPROVED" ? "AWAITING_APPROVAL" : "EXECUTING",
        steps: base.actionPlan.steps.map((s, i) =>
          i === 0
            ? {
                ...s,
                status:
                  status === "APPROVED" ? ("READY" as const) : ("EXECUTING" as const),
              }
            : s,
        ),
      },
      ledger: [
        ...ledgerAwaiting,
        {
          id: "le_tuna_07",
          at: "17:06",
          kind: "approve",
          title: "GM approved feature-swap-first",
          statusAfter: "APPROVED",
        },
        {
          id: "le_tuna_08",
          at: "17:08",
          kind: "act",
          title: "Menu feature prepared",
          detail: "Truffle Pasta · POS draft only",
          statusAfter: "EXECUTING",
        },
      ],
      updatedAt: "2026-09-16T17:08:00+02:00",
    };
  }

  if (status === "VERIFIED" || status === "LEARNED" || status === "CLOSED") {
    const actual = 1590;
    const regret = computeRegret({
      chosenOptionId: "feature_swap",
      chosenActualEuro: actual,
      options,
    });
    return {
      ...base,
      status,
      chosenOptionId: "feature_swap",
      approver: "GM · Berlin Mitte",
      approvedAt: "2026-09-16T17:06:00+02:00",
      observedOutcome: "Peak held · Truffle featured · no sellout on tuna pathway",
      actualContributionImpact: actual,
      actualGuestImpact: "None material",
      verifiedValue: {
        amount: actual,
        kind: "protected",
        note: "Peak contribution protected · POS close",
      },
      verificationMethod: "POS_TRANSACTION",
      verifiedAt: "2026-09-16T22:34:00+02:00",
      forecastError: "Expected €1,640 · actual €1,590 (−€50)",
      recommendationQuality: {
        score: 0.92,
        note: "Aligned with memory ranking; small forecast overage",
      },
      counterfactualAssessment:
        "Supplier-first counterfactual estimated €1,520 — chosen path beat it.",
      regret: regret ?? undefined,
      lesson:
        "Feature-swap-first outperformed supplier-first under these conditions.",
      playbookImpact:
        "Playbook updated: next similar event recommends feature-swap-first.",
      playbookId: "pb_tuna_feature_first",
      actionPlan: {
        ...base.actionPlan,
        status: "COMPLETED",
        steps: base.actionPlan.steps.map((s) => ({
          ...s,
          status: "COMPLETED" as const,
        })),
      },
      ledger: [
        ...ledgerAwaiting,
        {
          id: "le_tuna_07",
          at: "17:06",
          kind: "approve",
          title: "GM approved feature-swap-first",
          statusAfter: "APPROVED",
        },
        {
          id: "le_tuna_08",
          at: "17:08",
          kind: "act",
          title: "Menu feature prepared",
          detail: "Truffle Pasta · POS draft only",
          statusAfter: "EXECUTING",
        },
        {
          id: "le_tuna_09",
          at: "21:14",
          kind: "observe",
          title: "Service completed",
          statusAfter: "OBSERVING",
        },
        {
          id: "le_tuna_10",
          at: "22:31",
          kind: "observe",
          title: "POS closed",
        },
        {
          id: "le_tuna_11",
          at: "22:34",
          kind: "verify",
          title: "€1,590 protected",
          amountEuro: 1590,
          statusAfter: "VERIFIED",
        },
        {
          id: "le_tuna_12",
          at: "23:00",
          kind: "learn",
          title: "Feature-swap-first playbook reinforced",
          detail: "Supplier delay pattern updated",
          statusAfter: "LEARNED",
        },
        {
          id: "le_tuna_13",
          at: "23:01",
          kind: "playbook",
          title: "Structural debt escalated",
          detail: "7 of 12 peak services — backup supplier recommended",
        },
      ],
      silenceNote: "Everything else operated within expectations.",
      whyBlocks: [
        ...base.whyBlocks,
        {
          epistemic: "VERIFIED",
          title: "Peak held",
          body: "€1,590 protected tonight. Feature swap executed. Supplier fallback unused.",
        },
      ],
      updatedAt: "2026-09-16T23:01:00+02:00",
    };
  }

  return base;
}

export function buildTunaStructuralDecision(): DecisionRecord {
  return {
    id: TUNA_STRUCTURAL_ID,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "Owner",
    decisionType: "supplier_redundancy",
    decisionHorizon: "STRUCTURAL",
    status: "RECOMMENDED",
    vertical: "restaurant",
    title: "Tuna supply risk is structural",
    problemStatement:
      "7 shortages across 12 peak services. Temporary fixes are absorbing attention.",
    currentState: "Supplier / par structure unstable · €8.420 cumulative exposure",
    property: "Berlin Mitte",
    phaseLabel: "Structural · Supply",
    contextLine: "THIS KEEPS HAPPENING",
    triggerEvents: ["pattern_escalation"],
    evidenceRefs: [
      {
        id: "ev_count",
        label: "Incidents",
        value: "7 / 12",
        source: "Decision memory",
        freshness: "Rolling peaks",
      },
      {
        id: "ev_exp",
        label: "Cumulative exposure",
        value: "€8.420",
        source: "Verified ledger",
        freshness: "YTD peaks",
      },
    ],
    relatedEntities: [
      { type: "decision", id: DECISION_IDS.tuna, label: "Tonight’s tuna decision" },
      { type: "supplier", id: "sup_bluefin_de", label: "Bluefin Berlin" },
    ],
    baselinePrediction: "Pattern continues without redundancy",
    noActionOutcome: "Repeated peak exposure · GM attention debt",
    options: [
      {
        id: "do_nothing",
        title: "Keep patching nightly",
        expectedContributionEuro: -8420,
        guestImpact: "medium",
        operationalRisk: "high",
        confidence: 85,
        timeToResult: "Ongoing",
        note: "Decision debt compounds",
        isNoAction: true,
      },
      {
        id: "backup_supplier",
        title: "Add backup supplier",
        expectedContributionEuro: 6200,
        costEuro: 400,
        guestImpact: "none",
        operationalRisk: "low",
        confidence: 78,
        timeToResult: "2–3 weeks",
        note: "Reduces single-source risk",
        recommended: true,
      },
      {
        id: "reduce_dependency",
        title: "Reduce menu dependency",
        expectedContributionEuro: 4800,
        guestImpact: "low",
        operationalRisk: "medium",
        confidence: 70,
        timeToResult: "1 menu cycle",
        note: "Standing feature alternate on peak boards",
      },
    ],
    recommendedOptionId: "backup_supplier",
    recommendationReasoning:
      "Temporary fixes used 5 times. Structural recommendation: backup supplier or reduce dependency.",
    expectedContributionImpact: 6200,
    expectedGuestImpact: "None — improves reliability",
    expectedOperationalImpact: "Procurement change · playbook update",
    exposedContribution: 8420,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation: "Pattern evidence strong · supplier market assumptions medium",
      point: 78,
      low: 68,
      high: 84,
    },
    decisionDeadline: "Decide this month",
    requiredRole: "Owner",
    actionPlan: {
      status: "DRAFTED",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_rfp",
          provider: "Supplier / Procurement",
          title: "Draft backup supplier shortlist",
          status: "DRAFTED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: "le_str_01",
        at: "23:01",
        kind: "signal",
        title: "Pattern escalated to structural",
        detail: "7 of 12 peak services",
        statusAfter: "RECOMMENDED",
      },
    ],
    graph: {
      nodes: [
        {
          id: "n_pat",
          entityType: "signal",
          label: "7/12 shortages",
        },
        {
          id: "n_ops",
          entityType: "decision",
          label: "D-1842",
        },
        {
          id: "n_str",
          entityType: "decision",
          label: TUNA_STRUCTURAL_ID,
        },
      ],
      edges: [
        { fromId: "n_ops", toId: "n_str", relation: "escalates_to" },
        { fromId: "n_pat", toId: "n_str", relation: "triggered_by" },
      ],
    },
    autonomy: {
      decisionType: "supplier_redundancy",
      level: 1,
      risk: "high",
      reversibility: "hard",
      neverFullyAutonomous: true,
      reason: "Structural supplier change requires human confirmation.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Recurring shortfalls",
        body: "7 shortages across 12 peak services at Berlin Mitte.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Cumulative exposure",
        body: "€8.420 cumulative exposure. Temporary fixes used 5 times.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Fix the system",
        body: "Add backup supplier or reduce single-source menu dependency.",
      },
    ],
    locationDnaLine:
      "At Berlin Mitte, tuna single-sourcing creates repeated operational debt.",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-16T23:01:00+02:00",
    updatedAt: "2026-09-16T23:01:00+02:00",
  };
}

/** Demo: supplier unavailable → fallback playbook activates. */
export function applySupplierFailure(record: DecisionRecord): DecisionRecord {
  if (record.id !== DECISION_IDS.tuna) return record;
  return {
    ...record,
    status: "EXECUTING",
    chosenOptionId: "feature_swap",
    actionPlan: {
      ...record.actionPlan,
      status: "EXECUTING",
      steps: [
        {
          id: "ap_supplier_fail",
          provider: "Supplier / Procurement",
          title: "Supplier unavailable",
          status: "FAILED",
          preparedOnly: true,
          detail: "Provider error — fallback playbook activated",
        },
        {
          id: "ap_feature",
          provider: "POS",
          title: "Feature Truffle Pasta (fallback)",
          status: "EXECUTING",
          preparedOnly: true,
        },
      ],
    },
    ledger: [
      ...record.ledger,
      {
        id: "le_tuna_fail",
        at: "17:12",
        kind: "act",
        title: "Supplier unavailable — fallback activated",
        detail: "Feature-swap playbook continues",
        statusAfter: "EXECUTING",
      },
    ],
    updatedAt: "2026-09-16T17:12:00+02:00",
  };
}
