/**
 * D-8204 — Restore caster sugar before pastry pull.
 * Physical inventory Decision — NOT supplier AP variance (D-4102).
 */

import type { DecisionRecord } from "../record";
import type { CounterfactualOption } from "../counterfactual";
import { DECISION_IDS } from "../ids";

const EXPOSURE = 186;
const PAYLOAD =
  "Prepared — not written to procurement. Operator confirms receipt in systems of record.";

export function buildCasterSugarDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
): DecisionRecord {
  const options: CounterfactualOption[] = [
    {
      id: "topup",
      title: "Emergency top-up · bike courier",
      expectedContributionEuro: EXPOSURE,
      costEuro: 28,
      economicMetrics: [
        {
          type: "EXPECTED_PROTECTED",
          value: EXPOSURE,
          currency: "EUR",
          label: "Contribution protected",
          status: "EXPECTED",
        },
        {
          type: "QUALITATIVE",
          label: "Courier + sugar €28 · ETA 45 min",
          status: "EXPECTED",
        },
      ],
      economicEffectNote: "Restores par before pastry pull · protects dessert 86",
      guestImpact: "none",
      operationalRisk: "low",
      riskLevel: "low",
      mainRiskDescription: "Courier late past 19:40 stockout window",
      confidence: 88,
      timeToResult: "45 minutes",
      note: "Metro Cash · 3 kg caster · bike to Soho · New York",
      recommended: true,
    },
    {
      id: "transfer",
      title: "Transfer from Kreuzberg",
      expectedContributionEuro: 160,
      costEuro: 0,
      economicMetrics: [
        {
          type: "EXPECTED_PROTECTED",
          value: 160,
          currency: "EUR",
          label: "Contribution protected",
          status: "EXPECTED",
        },
        {
          type: "QUALITATIVE",
          label: "ETA 25 min runner · free cash",
          status: "EXPECTED",
        },
      ],
      economicEffectNote: "Moves surplus · slight Kreuzberg soft risk",
      guestImpact: "low",
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Kreuzberg dips below comfort if Friday covers spike",
      confidence: 72,
      timeToResult: "25 minutes",
      note: "4 kg available · runner Mira",
    },
    {
      id: "adjust",
      title: "Adjust prep / menu exposure",
      expectedContributionEuro: 90,
      costEuro: 0,
      economicMetrics: [
        {
          type: "EXPECTED_PROTECTED",
          value: 90,
          currency: "EUR",
          label: "Contribution protected",
          status: "EXPECTED",
        },
      ],
      economicEffectNote: "Protect pastry · accept lower dessert contribution",
      guestImpact: "medium",
      operationalRisk: "medium",
      riskLevel: "medium",
      mainRiskDescription: "Complaint risk on marketed desserts",
      confidence: 64,
      timeToResult: "Immediate",
      note: "Hold two dessert SKUs · protect pastry line",
    },
    {
      id: "accept",
      title: "Accept risk",
      expectedContributionEuro: 0,
      economicMetrics: [
        {
          type: "EXPOSURE",
          value: EXPOSURE,
          currency: "EUR",
          label: "Exposed if stockout",
          status: "EXPOSED",
        },
      ],
      economicEffectNote: "Do nothing · stockout mid-service likely",
      guestImpact: "high",
      operationalRisk: "high",
      riskLevel: "high",
      mainRiskDescription: "Pastry pull fails · comps / complaints",
      confidence: 91,
      timeToResult: "—",
      note: "Cost of doing nothing",
      isNoAction: true,
    },
  ];

  const ledger = [
    {
      id: "le_sug_1",
      at: "14:12",
      kind: "signal" as const,
      title: "Voice capture · 2 kg left",
      detail: "Kitchen Mira · dry store",
      statusAfter: "DETECTED" as const,
    },
    {
      id: "le_sug_2",
      at: "14:14",
      kind: "understand" as const,
      title: "Compared to house par",
      detail: "2 kg vs 5 kg · gap material · expected use 2.4 kg",
      statusAfter: "PREDICTED" as const,
    },
    {
      id: "le_sug_3",
      at: "14:16",
      kind: "simulate" as const,
      title: "Futures · top-up / transfer / adjust / accept",
      statusAfter: "SIMULATED" as const,
    },
    {
      id: "le_sug_4",
      at: "14:18",
      kind: "recommend" as const,
      title: "Emergency top-up prepared",
      detail: "€28 · 45 min · policy GM ≤ €250",
      statusAfter: "AWAITING_APPROVAL" as const,
    },
  ];

  const base: DecisionRecord = {
    id: DECISION_IDS.casterSugar,
    organizationId: "org_northstar_restaurants",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: "boh_par_gap_restore",
    decisionHorizon: "TODAY",
    status,
    vertical: "restaurant",
    territories: ["BUY", "RECOVER"],
    title: "Restore caster sugar before pastry pull",
    problemStatement:
      "Dry store reports 2 kg caster sugar vs 5 kg house par. Expected use tonight 2.4 kg. Projected stockout 19:40 — pastry pull and dessert 86 at risk (€186 exposure).",
    currentState:
      "Observed 2.0 kg · Par 5.0 kg · Gap 3.0 kg · Voice capture confirmed 14:12 · Confidence high.",
    property: "Soho · New York",
    phaseLabel: "Back of house · Dry store",
    contextLine: "Decide before 19:25 · pastry pull window",
    recommendationHeadline: "EMERGENCY TOP-UP",
    recommendationReasoning:
      "Emergency top-up restores par with low operational risk before pastry pull. Transfer is viable but softens Kreuzberg. Accept risk fails the service. Separate from any supplier invoice variance (D-4102).",
    triggerEvents: ["par_gap", "voice_capture", "prep_requirement"],
    evidenceRefs: [
      {
        id: "ev_sugar_obs",
        label: "Observed on hand",
        value: "2.0 kg",
        source: "Voice capture · Kitchen Mira",
        freshness: "14:12",
        grade: "OBSERVED",
      },
      {
        id: "ev_sugar_par",
        label: "House standard (par)",
        value: "5.0 kg",
        source: "Operating model",
        freshness: "Static",
        grade: "OBSERVED",
      },
      {
        id: "ev_sugar_use",
        label: "Expected use remaining",
        value: "2.4 kg (dessert + pastry)",
        source: "Prep plan · tonight",
        freshness: "Demo",
        grade: "PREDICTED",
      },
      {
        id: "ev_sugar_stockout",
        label: "Projected stockout",
        value: "19:40",
        source: "Usage velocity",
        freshness: "Live twin",
        grade: "PREDICTED",
      },
      {
        id: "ev_sugar_exp",
        label: "Service exposure",
        value: `€${EXPOSURE}`,
        source: "Contribution model",
        freshness: "Demo",
        grade: "ESTIMATED",
      },
    ],
    relatedEntities: [
      { type: "sku", id: "sku_caster_sugar", label: "Caster sugar" },
      { type: "area", id: "area_dry_store", label: "Dry store · Berlin" },
      {
        type: "location",
        id: "loc_berlin_kreuzberg",
        label: "Kreuzberg (transfer source)",
      },
    ],
    baselinePrediction: "Stockout 19:40 → dessert / pastry failure",
    noActionOutcome: `€${EXPOSURE} exposed · comps / complaints likely`,
    options,
    recommendedOptionId: "topup",
    expectedContributionImpact: EXPOSURE,
    expectedGuestImpact: "Protected if top-up arrives before pull",
    expectedOperationalImpact: "Courier dock · dry store restock",
    exposedContribution: EXPOSURE,
    confidence: {
      forecast: "HIGH",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      explanation: "Voice + camera + par model aligned · courier ETA modeled",
      point: 88,
      low: 78,
      high: 94,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: "Courier ETA under peak traffic",
    },
    mainRiskNarrative: "Pastry pull fails if decision delayed past 19:25",
    counterEvidence:
      "Kreuzberg transfer is free cash — but softens sister location cover",
    constraints: [
      "Do not auto-write procurement",
      "Physical inventory Decision — not AP invoice variance",
      "GM may approve ≤ €250 under Supplier emergency order policy",
    ],
    decisionDeadline: "Decide by 19:25",
    decisionDeadlineAt: "2026-09-18T19:25:00+02:00",
    requiredRole: "GM",
    actionPlan: {
      status: "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: "ap_sug_1",
          provider: "Procurement",
          title: "Confirm Metro Cash · 3 kg caster sugar",
          status: "READY",
          preparedOnly: true,
        },
        {
          id: "ap_sug_2",
          provider: "Logistics",
          title: "Dispatch bike courier · ETA 45 min · €28",
          status: "READY",
          preparedOnly: true,
        },
        {
          id: "ap_sug_3",
          provider: "Kitchen",
          title: "Receive · update dry store on hand to ≥5 kg",
          status: "READY",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger,
    graph: {
      nodes: [
        { id: "n_obs", entityType: "inventory", label: "2 kg observed" },
        { id: "n_par", entityType: "signal", label: "5 kg par" },
        { id: "n_prep", entityType: "forecast", label: "Pastry pull" },
        { id: "n_dec", entityType: "decision", label: "D-8204 top-up" },
      ],
      edges: [
        { fromId: "n_obs", toId: "n_dec", relation: "triggered_by" },
        { fromId: "n_par", toId: "n_dec", relation: "informed_by" },
        { fromId: "n_prep", toId: "n_dec", relation: "precedes" },
      ],
    },
    autonomy: {
      decisionType: "boh_par_gap_restore",
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.86,
      nHistorical: 9,
      neverFullyAutonomous: false,
      reason: "Emergency stock restore stays prepared until GM approval (≤ €250).",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "Par gap",
        body: "2.0 kg on hand vs 5.0 kg house standard · voice + camera aligned.",
      },
      {
        epistemic: "PREDICTED",
        title: "Stockout 19:40",
        body: "Expected use 2.4 kg remaining · pastry pull before stockout window.",
      },
      {
        epistemic: "RECOMMENDED",
        title: "Emergency top-up",
        body: "€28 · 45 min · protects €186 dessert/pastry contribution.",
      },
    ],
    locationDnaLine:
      "Berlin dry-store shorts on high-delivery Fridays historically preceded pastry failure when unresolved before 19:25.",
    modelVersion: "decision-record/v1",
    createdAt: "2026-09-18T14:14:00+02:00",
    updatedAt: "2026-09-18T14:18:00+02:00",
    attentionOverride: "needs_you",
    demoLabel: "D-8204 · BOH inventory",
  };

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...base,
      status,
      chosenOptionId: "topup",
      approver: "GM",
      actualContributionImpact: 172,
      verifiedValue: {
        amount: 172,
        kind: "protected",
        note: "6 kg restored · 0 dessert comps · pastry pull held",
      },
      attentionOverride: "verified",
      currentState: "On hand 6.0 kg · Par 5.0 kg · Restored after courier",
    };
  }

  if (status === "APPROVED" || status === "EXECUTING" || status === "OBSERVING") {
    return {
      ...base,
      status,
      chosenOptionId: "topup",
      approver: "GM",
      attentionOverride: "handling",
      actionPlan: {
        ...base.actionPlan,
        status: status === "OBSERVING" ? "EXECUTED" : "EXECUTING",
        steps: base.actionPlan.steps.map((s, i) => ({
          ...s,
          status:
            i === 0
              ? ("EXECUTED" as const)
              : i === 1
                ? status === "OBSERVING"
                  ? ("EXECUTED" as const)
                  : ("EXECUTING" as const)
                : ("READY" as const),
          preparedOnly: false,
        })),
      },
    };
  }

  return base;
}
