/**
 * D-7501 Margin Response Decision Record — Coca-Cola cost shock.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import { CANON_MARGIN_COKE } from "../demo/canonical";
import {
  COKE_MARGIN_SHOCK,
  COKE_SUPPLIER_LEVERAGE,
} from "@/lib/radr/product/marginResponse";

const PAYLOAD =
  "Prepared — not written back to POS / procurement. Operator confirms in systems of record.";

export function buildMarginCokeDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const c = CANON_MARGIN_COKE;
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
    timeToResult: "This week",
    note: s.note,
    recommended: s.recommended,
    isNoAction: s.isNoAction,
  }));

  return {
    id: DECISION_IDS.marginCoke,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "margin_response_cost_shock",
    decisionHorizon: "THIS_WEEK",
    status,
    vertical: "restaurant",
    territories: [...c.territories],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState: c.understand,
    property: c.property,
    phaseLabel: "Procurement · beverage category",
    contextLine: c.deadline,
    recommendationHeadline: "CATEGORY REBALANCE — NOT BLUNT REPRICE",
    triggerEvents: ["supplier_unit_cost_increase"],
    evidenceRefs: c.evidence.map((e, i) => ({
      id: `ev_mc_${i}`,
      label: e.label,
      value: e.value,
      source: c.sources[i % c.sources.length]?.name ?? "System",
      freshness: c.sources[i % c.sources.length]?.freshness ?? "Demo",
      grade: "OBSERVED" as const,
    })),
    relatedEntities: [
      { type: "sku", id: "sku_coke_330", label: COKE_MARGIN_SHOCK.sku },
      {
        type: "supplier",
        id: "sup_bev_berlin",
        label: COKE_MARGIN_SHOCK.supplier,
      },
    ],
    baselinePrediction: "Absorb → €184 / week contribution pressure",
    noActionOutcome: `€${COKE_MARGIN_SHOCK.monthlyExposureEuro} monthly exposure if absorbed`,
    options,
    recommendedOptionId: c.chosenScenarioId,
    recommendationReasoning: c.understand,
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "Medium · category architecture, not single-SKU spike",
    expectedOperationalImpact: "Menu price sheet + procurement negotiation pack",
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation:
        "Invoice + contract + POS mix High · elasticity evidence insufficient for blunt raise",
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Guest price response / attach on lunch bundles",
    },
    mainRiskNarrative: "PRICE RESPONSE UNCERTAIN if raise-item-only path chosen",
    counterEvidence:
      "Blunt raise recovers item margin fastest on paper — but concentrates guest-price exposure on the highest-volume anchor",
    alternativeExplanations: [
      {
        label: "Contract variance / dispute first",
        whyLower: "Market list confirms real price move · not silent mismatch",
      },
      {
        label: "Temporary surcharge — wait",
        whyLower: "Two prior cycles already elevated · option value declining",
      },
    ],
    relationshipChain: [
      "Supplier invoice",
      "Coca-Cola 330ml SKU",
      "Beverage menu items",
      "Lunch drink bundle",
      "Category contribution",
      "Berlin Mitte P&L",
    ],
    constraints: [
      "Do not auto-write POS prices",
      "Switch supplier blocked this week (MOQ + delivery slot)",
      "Elasticity claims require stronger sample",
    ],
    decisionDeadline: c.deadline,
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_cat",
          provider: "Menu",
          title: "Draft beverage category rebalance",
          status: "PREPARED",
          preparedOnly: true,
        },
        {
          id: "ap_neg",
          provider: "Procurement",
          title: "Build supplier negotiation pack",
          status: "PREPARED",
          detail: `Cross-location: ${COKE_SUPPLIER_LEVERAGE.map((r) => `${r.location} €${r.unitCostEuro}`).join(" · ")}`,
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: "le_mc_1",
        at: "09:10",
        kind: "signal",
        title: "Unit cost +€0.10",
        detail: `${COKE_MARGIN_SHOCK.sku} · market price change`,
        statusAfter: "DETECTED",
      },
      {
        id: "le_mc_2",
        at: "09:40",
        kind: "understand",
        title: "Not dispute-first",
        detail: COKE_MARGIN_SHOCK.shockClassNote,
      },
      {
        id: "le_mc_3",
        at: "10:15",
        kind: "simulate",
        title: "Category contribution exposed",
        detail: `~€${COKE_MARGIN_SHOCK.weeklyExposureEuro} / week if absorbed`,
      },
      {
        id: "le_mc_4",
        at: "11:20",
        kind: "recommend",
        title: "Category rebalance recommended",
        detail:
          "Raise-item-only is an input path — not strongest under thin elasticity",
        statusAfter: "RECOMMENDED",
      },
    ],
    graph: { nodes: [], edges: [] },
    autonomy: {
      decisionType: "margin_response_cost_shock",
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.68,
      nHistorical: 6,
      neverFullyAutonomous: true,
      reason: "Price architecture · guest perception — approval required.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Cost shock",
        body: `${COKE_MARGIN_SHOCK.sku}: €${COKE_MARGIN_SHOCK.priorUnitCostEuro} → €${COKE_MARGIN_SHOCK.newUnitCostEuro}`,
      },
      {
        epistemic: "RECOMMENDED",
        title: "Strongest response",
        body: c.understand,
      },
    ],
    locationDnaLine: c.learning?.lesson,
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-15T09:10:00+02:00",
    updatedAt: "2026-09-17T11:20:00+02:00",
  };
}
