/**
 * Portfolio Decision Record builders from Canon — D-6671, D-4102, D-5208, D-1842 archive.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import {
  CANON_TABLE,
  CANON_SUPPLIER,
  CANON_PLAYBOOK,
  CANON_TUNA,
  CANON_OTA,
  CANON_ORPHAN,
} from "../demo/canonical";
import { buildOtaDecisionRecord } from "./ota";
import { buildOrphanDecisionRecord } from "./orphan";
import { buildTunaDecisionRecord } from "./tuna";

const PAYLOAD =
  "Prepared — not written back unless a connected system confirms execution.";

function mapOptions(
  c: typeof CANON_TABLE | typeof CANON_SUPPLIER | typeof CANON_PLAYBOOK,
) {
  return c.scenarios.map((s) => ({
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
    timeToResult: "Service",
    note: s.note,
    recommended: s.recommended,
    isNoAction: s.isNoAction,
  }));
}

export function buildTableRecoverDecisionRecord(
  status: DecisionRecord["status"] = "APPROVED",
): DecisionRecord {
  const c = CANON_TABLE;
  const options = mapOptions(c);
  const base: DecisionRecord = {
    id: DECISION_IDS.tableRecover,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "late_cancellation_recover",
    decisionHorizon: "NOW",
    status,
    vertical: "restaurant",
    territories: ["RECOVER", "SELL"],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState: "Table 14 cancelled 47m before service · waitlist prepared",
    property: c.property,
    phaseLabel: "Dinner · recovery",
    contextLine: "Action prepared / approved · outcome observing",
    recommendationHeadline: "REBOOK WAITLIST",
    triggerEvents: ["cancellation"],
    evidenceRefs: c.evidence.slice(0, 4).map((e, i) => ({
      id: `ev_t_${i}`,
      label: e.label,
      value: e.value,
      source: c.sources[i % c.sources.length]?.name ?? "System",
      freshness: c.sources[i % c.sources.length]?.freshness ?? "Live",
      grade: "OBSERVED" as const,
    })),
    relatedEntities: [{ type: "table", id: "t14", label: "Table 14" }],
    baselinePrediction: "Leave empty → night contribution lost",
    noActionOutcome: "€210 exposure unrecovered",
    options,
    recommendedOptionId: c.chosenScenarioId,
    recommendationReasoning: c.understand,
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "Low",
    expectedOperationalImpact: "Waitlist SMS prepared",
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: "HIGH",
      data: "HIGH",
      decision: "HIGH",
      userFacing: "HIGH",
      explanation: "Live reservations + waitlist",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Waitlist party fit for cover window",
    },
    decisionDeadline: c.deadline,
    requiredRole: "GM",
    actionPlan: {
      status: "APPROVED",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_wl",
          provider: "Reservations",
          title: "Release replacement inventory to waitlist",
          status: "EXECUTING",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: "le_tr_1",
        at: "18:12",
        kind: "signal",
        title: "Table 14 cancelled",
        statusAfter: "DETECTED",
      },
      {
        id: "le_tr_2",
        at: "18:14",
        kind: "approve",
        title: "Waitlist release approved",
        statusAfter: "APPROVED",
      },
    ],
    graph: { nodes: [], edges: [] },
    autonomy: {
      decisionType: "late_cancellation_recover",
      level: 3,
      risk: "low",
      reversibility: "easy",
      historicalSuccessRate: 0.81,
      nHistorical: 22,
      neverFullyAutonomous: false,
      reason: "Prepared waitlist release within policy.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Cancellation",
        body: "Table cancelled 47 minutes before service.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Recover",
        body: "RADR prepared waitlist rebook. €184 potential recovered contribution — not verified until outcome completes.",
      },
    ],
    locationDnaLine: "Same-service waitlist recover historically precedes protected covers.",
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-17T18:12:00+02:00",
    updatedAt: "2026-09-17T18:20:00+02:00",
  };

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...base,
      status,
      verifiedValue: {
        amount: c.actualProtectedEuro ?? 184,
        kind: "recovered",
        note: "POS observed · DEMO",
      },
      actualContributionImpact: c.actualProtectedEuro,
      observedOutcome: "Waitlist party seated · €184 recovered",
    };
  }
  return base;
}

export function buildSupplierDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const c = CANON_SUPPLIER;
  return {
    id: DECISION_IDS.supplier,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_buy",
    roleContext: "GM",
    decisionType: "supplier_input_economics",
    decisionHorizon: "THIS_WEEK",
    status,
    vertical: "restaurant",
    territories: ["BUY", "SELL"],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState: "Contract €6.80/L · Invoice €7.45/L · 420L · contribution −13.2%",
    property: c.property,
    phaseLabel: "Procurement",
    contextLine: "Invoice was the clue · margin leak is the problem",
    recommendationHeadline: "DISPUTE · HOLD · CHECK YIELD · NO REPRICE YET",
    problemFamily: "SUPPLIER_AP",
    economicState: status === "VERIFIED" || status === "LEARNED" ? "VERIFIED" : "EXPECTED",
    recoverability: "high",
    verificationPath: ["supplier_credit", "ap_match"],
    requiredEvidence: [
      "invoice",
      "contract",
      "quantity",
      "uom",
      "credit_memo",
      "ap_posting",
    ],
    allowedActions: [
      "detect_variance",
      "assemble_evidence",
      "draft_dispute",
      "prepare_finance_package",
      "track_status",
    ],
    alwaysAskActions: [
      "send_dispute",
      "alter_payable",
      "accept_settlement",
      "change_contract",
      "post_journal",
    ],
    triggerEvents: ["invoice_variance"],
    evidenceRefs: c.evidence.slice(0, 6).map((e, i) => ({
      id: `ev_s_${i}`,
      label: e.label,
      value: e.value,
      source: c.sources[i % c.sources.length]?.name ?? "AP",
      freshness: c.sources[i % c.sources.length]?.freshness ?? "Daily",
      grade: i < 3 ? ("OBSERVED" as const) : ("ESTIMATED" as const),
    })),
    relatedEntities: [{ type: "sku", id: "oil", label: "Culinary oil" }],
    operatingStateSnapshot: [
      { label: "Contract", value: "€6.80/L" },
      { label: "Invoice", value: "€7.45/L" },
      { label: "Delivery", value: "420L" },
      { label: "Invoice exposure", value: "€273", tone: "risk" },
      { label: "Usage", value: "+4%", tone: "watch" },
      { label: "Dish contribution", value: "−13.2%", tone: "risk" },
    ],
    baselinePrediction: "Pay as invoiced · contribution keeps compressing",
    noActionOutcome: "€273 drift compounds",
    options: mapOptions(c),
    recommendedOptionId: c.chosenScenarioId,
    recommendationReasoning: c.understand,
    expectedContributionImpact: 0,
    expectedGuestImpact: "None",
    expectedOperationalImpact: c.prepared,
    exposedContribution: c.exposureEuro,
    ...(status === "VERIFIED" || status === "LEARNED"
      ? {
          verifiedValue: {
            amount: c.exposureEuro,
            kind: "recovered" as const,
            note: "Credit memo applied · matched to original invoice / AP record · DEMO",
          },
        }
      : {}),
    confidence: {
      forecast: "HIGH",
      data: "HIGH",
      decision: "HIGH",
      userFacing: "HIGH",
      explanation:
        "Contract vs invoice variance is observed. Usage effect separate. No expected recovered value until credit lands.",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "MEDIUM",
      mainUncertainty: "Whether variance is price-only or yield-driven",
    },
    decisionDeadline: c.deadline,
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_disp",
          provider: "AP",
          title: "Dispute supplier variance",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_hold",
          provider: "Purchasing",
          title: "Hold next above-contract exception",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_yield",
          provider: "Kitchen",
          title: "Investigate usage / yield",
          status: "PREPARED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: "le_sup_1",
        at: "09:10",
        kind: "signal",
        title: "Invoice above contract",
        statusAfter: "DETECTED",
      },
      {
        id: "le_sup_2",
        at: "09:14",
        kind: "recommend",
        title: "Dispute · hold · yield · no reprice",
        statusAfter: "AWAITING_APPROVAL",
      },
    ],
    graph: { nodes: [], edges: [] },
    autonomy: {
      decisionType: "supplier_input_economics",
      level: 2,
      risk: "low",
      reversibility: "easy",
      historicalSuccessRate: 0.82,
      nHistorical: 9,
      neverFullyAutonomous: true,
      reason: "Supplier credit requires human approval.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Invoice clue",
        body: "Contract €6.80/L vs invoice €7.45/L on 420L → €273 exposure.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Economics",
        body: "Usage +4% with selling price unchanged → dish contribution −13.2%.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Do not reprice yet",
        body: "Recover variance · hold exceptions · investigate yield before menu economics change.",
      },
    ],
    locationDnaLine: "Normalize input cost before menu reprice.",
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-16T09:10:00+02:00",
    updatedAt: "2026-09-16T09:14:00+02:00",
  };
}

export function buildPlaybookDecisionRecord(
  status: DecisionRecord["status"] = "SIMULATED",
): DecisionRecord {
  const c = CANON_PLAYBOOK;
  return {
    id: DECISION_IDS.playbook,
    organizationId: "org_northstar",
    locationId: "loc_group",
    operatingUnitId: "ou_group",
    roleContext: "COO",
    decisionType: "structural_margin_pattern",
    decisionHorizon: "STRUCTURAL",
    status,
    vertical: "hotel",
    territories: ["SELL", "LABOR", "BUY"],
    attentionOverride: "watching",
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState: "Amsterdam GOP 38% vs Berlin 31% at similar ADR",
    property: "Northstar Hospitality Group",
    phaseLabel: "Structural",
    contextLine: "Similar revenue · different profit",
    recommendationHeadline: "TEST AMSTERDAM PLAYBOOK IN BERLIN?",
    triggerEvents: ["structural_pattern"],
    evidenceRefs: c.evidence.slice(0, 5).map((e, i) => ({
      id: `ev_p_${i}`,
      label: e.label,
      value: e.value,
      source: "Group Operating Model",
      freshness: "Weekly",
      grade: "ESTIMATED" as const,
    })),
    relatedEntities: [
      { type: "location", id: "loc_canal_house", label: "Amsterdam" },
      { type: "location", id: "loc_berlin_hotel", label: "Berlin Hotel" },
    ],
    baselinePrediction: "Continue temporary Friday fixes without structural change",
    noActionOutcome: `€${c.exposureEuro.toLocaleString("en-IE")}/month structural exposure`,
    options: mapOptions(c),
    recommendedOptionId: c.chosenScenarioId,
    recommendationReasoning: c.understand,
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "None direct",
    expectedOperationalImpact: c.prepared,
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: "MEDIUM",
      data: "MEDIUM",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation: "Cross-location drivers modeled · not auto-copied",
      point: 70,
      low: 60,
      high: 78,
      evidenceCoverage: "MEDIUM",
    },
    decisionDeadline: "This quarter",
    requiredRole: "COO",
    actionPlan: {
      status: "DRAFTED",
      payloadNote: "Structural Decision — never auto-copy playbooks.",
      steps: [
        {
          id: "ap_test",
          provider: "Group",
          title: "Propose Amsterdam housekeeping sequencing test in Berlin",
          status: "PREPARED",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: "le_pb_1",
        at: "Mon",
        kind: "signal",
        title: "GOP gap at similar ADR",
        statusAfter: "DETECTED",
      },
    ],
    graph: { nodes: [], edges: [] },
    debt: {
      id: "debt_friday_peak",
      title: "Friday peak capacity structurally misconfigured",
      locationLabel: "Group",
      decisionType: "structural_margin_pattern",
      incidentCount: 4,
      windowLabel: "last 6 Fridays",
      cumulativeExposureEuro: c.exposureEuro,
      temporaryFixesUsed: 4,
      structuralRecommendation: c.prepared,
      relatedDecisionIds: [DECISION_IDS.peak],
      horizon: "STRUCTURAL",
    },
    autonomy: {
      decisionType: "structural_margin_pattern",
      level: 1,
      risk: "high",
      reversibility: "hard",
      historicalSuccessRate: 0.6,
      nHistorical: 3,
      neverFullyAutonomous: true,
      reason: "Structural group Decision requires COO judgment.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Similar ADR",
        body: "Amsterdam €214 ADR · 38% GOP vs Berlin €216 ADR · 31% GOP.",
      },
      {
        epistemic: "ESTIMATED",
        title: "Drivers",
        body: "Gap associated with channel cost, housekeeping labor, breakfast waste, overtime — not primarily revenue.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Test, do not auto-copy",
        body: "Amsterdam changed housekeeping sequencing 11 weeks ago. Similar conditions in Berlin — propose a controlled test.",
      },
    ],
    locationDnaLine: "Group learning transfers with contextual similarity — never blind copy.",
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-10T10:00:00+02:00",
    updatedAt: "2026-09-15T10:00:00+02:00",
  };
}

/** Patch legacy builders with required territories. */
export function withTerritories(
  record: DecisionRecord,
  territories: DecisionRecord["territories"],
): DecisionRecord {
  return { ...record, territories };
}

export function buildArchivedTuna(): DecisionRecord {
  return withTerritories(buildTunaDecisionRecord("LEARNED"), ["BUY", "SELL"]);
}

export function buildVerifiedOta(): DecisionRecord {
  return withTerritories(buildOtaDecisionRecord("VERIFIED"), ["SELL"]);
}

export function buildVerifiedOrphan(): DecisionRecord {
  return withTerritories(buildOrphanDecisionRecord("VERIFIED"), [
    "RECOVER",
    "SELL",
  ]);
}
