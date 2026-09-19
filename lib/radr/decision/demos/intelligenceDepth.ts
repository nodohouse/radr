/**
 * Intelligence-depth Decision Records — D-7110, D-7302, D-7401.
 * Seeded as learned / verified so Control Center stays calm; Ask + Memory surface them.
 */

import type { DecisionRecord } from "../record";
import { DECISION_IDS } from "../ids";
import {
  CANON_MENU_PEAK,
  CANON_SOCIAL_DEMAND,
  CANON_GUEST_VOICE,
  type CanonDecision,
} from "../demo/canonical";

const PAYLOAD =
  "Prepared — not written back. Operator confirms in systems of record.";

function mapOptions(c: CanonDecision) {
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

function baseFromCanon(
  c: CanonDecision,
  opts: {
    id: string;
    decisionType: string;
    horizon: DecisionRecord["decisionHorizon"];
    status: DecisionRecord["status"];
    phaseLabel: string;
    headline: string;
    relationship: string[];
    alternatives: { label: string; whyLower: string }[];
    mainRisk: string;
    counterEvidence?: string;
  },
): DecisionRecord {
  const options = mapOptions(c);
  return {
    id: opts.id,
    organizationId: "org_northstar",
    locationId: "loc_berlin_mitte",
    operatingUnitId: "ou_berlin_dinner",
    roleContext: "GM",
    decisionType: opts.decisionType,
    decisionHorizon: opts.horizon,
    status: opts.status,
    vertical: "restaurant",
    territories: [...c.territories],
    title: c.title,
    problemStatement: c.problemLine.replace(/\n/g, " "),
    currentState: c.understand,
    property: c.property,
    phaseLabel: opts.phaseLabel,
    contextLine: c.deadline,
    recommendationHeadline: opts.headline,
    triggerEvents: ["relationship_detected"],
    evidenceRefs: c.evidence.map((e, i) => ({
      id: `ev_${opts.id}_${i}`,
      label: e.label,
      value: e.value,
      source: c.sources[i % c.sources.length]?.name ?? "System",
      freshness: c.sources[i % c.sources.length]?.freshness ?? "Demo",
      grade: "OBSERVED" as const,
    })),
    relatedEntities: [],
    baselinePrediction: c.scenarios.find((s) => s.isNoAction)?.note ?? "",
    noActionOutcome: `€${c.exposureEuro} exposure remains`,
    options,
    recommendedOptionId: c.chosenScenarioId,
    recommendationReasoning: c.understand,
    expectedContributionImpact: c.expectedProtectedEuro,
    expectedGuestImpact: "Low–medium",
    expectedOperationalImpact: c.prepared,
    exposedContribution: c.exposureEuro,
    confidence: {
      forecast: c.decisionConfidence,
      data: "HIGH",
      decision: c.decisionConfidence,
      userFacing: c.decisionConfidence,
      explanation: c.connect,
      point: 0,
      low: 0,
      high: 0,
      evidenceCoverage: "HIGH",
      dataFreshness: "HIGH",
      mainUncertainty: opts.mainRisk,
    },
    decisionDeadline: c.deadline,
    requiredRole: "GM",
    actionPlan: {
      status: opts.status === "LEARNED" || opts.status === "VERIFIED" ? "EXECUTED" : "PREPARED",
      payloadNote: PAYLOAD,
      steps: c.prepared.split(" · ").map((title, i) => ({
        id: `ap_${opts.id}_${i}`,
        provider: i === 0 ? "Menu" : i === 1 ? "Floor" : "Kitchen",
        title: title.trim(),
        status: "PREPARED" as const,
        preparedOnly: true,
      })),
    },
    executionRefs: [],
    ledger: [
      {
        id: `le_${opts.id}_1`,
        at: "12:00",
        kind: "signal",
        title: "Relationship detected",
        statusAfter: "DETECTED",
      },
    ],
    graph: { nodes: [], edges: [] },
    autonomy: {
      decisionType: opts.decisionType,
      level: 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.7,
      nHistorical: 8,
      neverFullyAutonomous: true,
      reason: "Cross-system relationship — operator judgment required.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: "What RADR found",
        body: c.connect,
      },
      {
        epistemic: "RECOMMENDED",
        title: "Strongest explanation",
        body: c.understand,
      },
    ],
    relationshipChain: opts.relationship,
    alternativeExplanations: opts.alternatives,
    counterEvidence: opts.counterEvidence,
    mainRiskNarrative: opts.mainRisk,
    locationDnaLine: c.learning?.lesson,
    lesson: c.learning?.lesson,
    playbookImpact: c.learning
      ? `${c.learning.playbookFrom} → ${c.learning.playbookTo}`
      : undefined,
    demoLabel: "DEMO · ILLUSTRATIVE",
    modelVersion: "decision-record/v2",
    createdAt: "2026-09-10T12:00:00+02:00",
    updatedAt: "2026-09-17T12:00:00+02:00",
  };
}

export function buildMenuPeakDecisionRecord(
  status: DecisionRecord["status"] = "LEARNED",
): DecisionRecord {
  const c = CANON_MENU_PEAK;
  const r = baseFromCanon(c, {
    id: DECISION_IDS.menuPeak,
    decisionType: "menu_peak_economics",
    horizon: "TODAY",
    status,
    phaseLabel: "Peak · menu economics",
    headline: "DE-EMPHASIZE 19:00–20:30 ONLY",
    relationship: [
      "Signature dish €14.20 contribution",
      "prep +21% vs category",
      "station 92% at peak",
      "ticket time +3.8m when mix >18%",
      "contribution / kitchen minute −18%",
      "second-turn exposure",
    ],
    alternatives: [
      {
        label: "Remove the dish",
        whyLower: "Destroys off-peak brand and contribution · permanent over-corrects",
      },
      {
        label: "Raise price only",
        whyLower: "Margin helps · still burns scarce peak kitchen minutes",
      },
      {
        label: "Feature substitute all day",
        whyLower: "Over-corrects off-peak when STAR economics are healthy",
      },
    ],
    mainRisk: "Guest disappointment if signature disappears from the room entirely",
    counterEvidence:
      "Historical walk-in preference for Tuna Tataki remains high off-peak — argues against removal.",
  });

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...r,
      verifiedValue: {
        amount: c.actualProtectedEuro,
        kind: "protected",
        note: "Peak de-emphasis · STRONGLY_ATTRIBUTED · DEMO",
      },
      outcomeDetail: {
        summary:
          "Peak de-emphasis · Truffle Pasta featured · ticket time stabilized · signature restored after 20:30.",
        observedContributionEuro: c.actualProtectedEuro,
        rows: [
          { label: "Expected", value: `€${c.expectedProtectedEuro}` },
          { label: "Observed", value: `€${c.actualProtectedEuro}` },
          { label: "Verified", value: `€${c.actualProtectedEuro} protected` },
        ],
      },
      attentionOverride: status === "LEARNED" ? "learned" : "verified",
    };
  }
  return r;
}

export function buildSocialDemandDecisionRecord(
  status: DecisionRecord["status"] = "LEARNED",
): DecisionRecord {
  const c = CANON_SOCIAL_DEMAND;
  const r = baseFromCanon(c, {
    id: DECISION_IDS.socialDemand,
    decisionType: "social_demand_mix",
    horizon: "TODAY",
    status,
    phaseLabel: "Pre-service · demand signal",
    headline: "PROTECT STOCK · SHIFT PROMOTION",
    relationship: [
      "Social engagement 2.4×",
      "expected featured-item mix ↑",
      "limited signature inventory",
      "kitchen already constrained",
      "booked covers at risk",
      "contribution exposure",
    ],
    alternatives: [
      {
        label: "Boost the Reel again",
        whyLower: "Amplifies demand into a known inventory and station constraint",
      },
      {
        label: "Ignore the signal",
        whyLower: "Leaves prep unaligned with historically associated mix shifts",
      },
    ],
    mainRisk: "Stockout on booked covers if campaign residual demand is ignored",
    counterEvidence:
      "Engagement is not bookings — attribution remains MODELED until mix and stock are observed.",
  });

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...r,
      verifiedValue: {
        amount: c.actualProtectedEuro,
        kind: "protected",
        note: "Stock protected · MODELED attribution · DEMO SIGNAL — not verified campaign revenue",
      },
      outcomeDetail: {
        summary:
          "Promotion shifted · stock protected for reservations · no 86 on booked covers.",
        observedContributionEuro: c.actualProtectedEuro,
        rows: [
          { label: "Social signal", value: "2.4× · DEMO SIGNAL" },
          { label: "Expected protected", value: `€${c.expectedProtectedEuro}` },
          { label: "Observed / verified", value: `€${c.actualProtectedEuro} · MODELED attribution` },
        ],
      },
      attentionOverride: "learned",
    };
  }
  return r;
}

export function buildGuestVoiceDecisionRecord(
  status: DecisionRecord["status"] = "LEARNED",
): DecisionRecord {
  const c = CANON_GUEST_VOICE;
  const r = baseFromCanon(c, {
    id: DECISION_IDS.guestVoice,
    decisionType: "guest_voice_bottleneck",
    horizon: "THIS_WEEK",
    status,
    phaseLabel: "Pattern · guest voice",
    headline: "FIX KITCHEN MIX — NOT FOH LABOR",
    relationship: [
      "Slow-service mentions +31%",
      "cluster Friday 19:15–20:15",
      "delivery >28%",
      "signature mix >17%",
      "station >94%",
      "FOH normal → contribution drag",
    ],
    alternatives: [
      {
        label: "Add FOH labor",
        whyLower: "Roster already normal · mentions do not track cover count alone",
      },
      {
        label: "Treat as review noise",
        whyLower: "Pattern repeats across comparable Fridays",
      },
    ],
    mainRisk: "Recurring Friday sentiment and contribution drag if mix/load unchanged",
  });

  if (status === "VERIFIED" || status === "LEARNED") {
    return {
      ...r,
      verifiedValue: {
        amount: c.actualProtectedEuro,
        kind: "protected",
        note: "Kitchen-mix intervention · STRONGLY_ATTRIBUTED · DEMO",
      },
      outcomeDetail: {
        summary:
          "Peak mix adjusted · ticket times improved · slow-service mentions declined next comparable Friday.",
        observedContributionEuro: c.actualProtectedEuro,
        rows: [
          { label: "Expected", value: `€${c.expectedProtectedEuro}` },
          { label: "Observed", value: `€${c.actualProtectedEuro}` },
          { label: "Verified", value: `€${c.actualProtectedEuro} protected` },
        ],
      },
      attentionOverride: "learned",
      debt: {
        id: "debt_friday_mix",
        title: "Recurring Friday kitchen-mix pressure",
        locationLabel: "Berlin Mitte",
        decisionType: "guest_voice_bottleneck",
        incidentCount: 4,
        windowLabel: "last 6 Fridays",
        cumulativeExposureEuro: 2480,
        temporaryFixesUsed: 4,
        structuralRecommendation:
          "Change Friday delivery allocation / peak menu — stop celebrating one-off throttles",
        relatedDecisionIds: [DECISION_IDS.guestVoice, DECISION_IDS.menuPeak],
        horizon: "STRUCTURAL",
      },
    };
  }
  return r;
}
