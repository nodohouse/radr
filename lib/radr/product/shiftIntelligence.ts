/**
 * Decision-layer shift intelligence — PRE → LIVE → POST.
 * Not a dashboard. Readiness for Decisions + learning after reality.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { CANON_PEAK, CANON_GUEST_VOICE } from "@/lib/radr/decision/demo/canonical";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { recordAttention } from "@/lib/radr/product/roleScope";

export type ReadinessState =
  | "READY"
  | "WATCH"
  | "CONSTRAINT_IDENTIFIED"
  | "ACTION_RECOMMENDED";

export type ShiftCondition = {
  id: string;
  title: string;
  detail: string;
  state: ReadinessState;
  evidence: string[];
};

export type JudgmentPrompt = {
  id: string;
  question: string;
  reason: string;
  contextClass:
    | "VIP"
    | "STAFFING_REALITY"
    | "EQUIPMENT"
    | "LOCAL_EVENT"
    | "GUEST_COMMITMENT"
    | "SUPPLIER"
    | "MANAGER_KNOWLEDGE"
    | "OTHER";
  priorHits: number;
};

export type ArrivalDensity = {
  window: string;
  coversInWindow: number;
  totalBooked: number;
  compressionLabel: string;
  note: string;
};

export type DemandQualitySample = {
  id: string;
  label: string;
  grossEuro: number;
  contributionEuro: number;
  kitchenMinutes: number;
  contributionPerKitchenMinute: number;
  channelCostEuro: number;
  servicePressure: "low" | "medium" | "high";
  acceptNow: boolean;
  reason: string;
};

export type EvidenceConflict = {
  id: string;
  title: string;
  sources: { name: string; value: string }[];
  affectsDecisionIds: string[];
  inference: string;
  status: "FINDING";
};

export type CalibrationSnapshot = {
  sampleSize: number;
  expectedRangeMet: number;
  outsideExpectedRange: number;
  operatorContextChangedRec: number;
  contextImprovedOutcome: number;
  recommendationsApproved: number;
  alternativeSelected: number;
  typesNeedingRecalibration: string[];
  wrongExamples: {
    decisionId: string;
    expected: string;
    actual: string;
    reason: string;
  }[];
  demoNote: string;
};

/** Arrival density — covers timing, not just cover count. */
export const BERLIN_ARRIVAL_DENSITY: ArrivalDensity = {
  window: "19:10–19:35",
  coversInWindow: 42,
  totalBooked: 118,
  compressionLabel: "High arrival compression",
  note: "42 of 118 booked covers arrive inside 25 minutes — unequal to evenly paced demand",
};

export const BERLIN_DEMAND_QUALITY: DemandQualitySample[] = [
  {
    id: "dq_delivery",
    label: "Delivery demand · projected peak",
    grossEuro: 42,
    contributionEuro: 11,
    kitchenMinutes: 9,
    contributionPerKitchenMinute: 1.22,
    channelCostEuro: 8,
    servicePressure: "high",
    acceptNow: false,
    reason:
      "During projected 19:10–19:35 compression: lower-quality use of constrained kitchen capacity vs dine-in turns",
  },
  {
    id: "dq_walkin",
    label: "Projected walk-in demand",
    grossEuro: 96,
    contributionEuro: 38,
    kitchenMinutes: 14,
    contributionPerKitchenMinute: 2.71,
    channelCostEuro: 0,
    servicePressure: "medium",
    acceptNow: false,
    reason:
      "Hold window modeled for peak — expected second turn behind this party is the scarce resource",
  },
  {
    id: "dq_reserved",
    label: "Committed demand · reserved covers",
    grossEuro: 121,
    contributionEuro: 48,
    kitchenMinutes: 16,
    contributionPerKitchenMinute: 3.0,
    channelCostEuro: 0,
    servicePressure: "medium",
    acceptNow: true,
    reason: "Already committed · protect prep for booked covers",
  },
];

export function berlinPreShiftBrief() {
  const conditions: ShiftCondition[] = [
    {
      id: "arrival",
      title: "Arrival compression 19:10–19:35",
      detail: BERLIN_ARRIVAL_DENSITY.note,
      state: "CONSTRAINT_IDENTIFIED",
      evidence: ["Reservations", "Table management"],
    },
    {
      id: "cold",
      title: "Cold station projected constraint",
      detail: "Modeled cold-station load ~96% under current signature mix",
      state: "ACTION_RECOMMENDED",
      evidence: ["KDS", "Menu mix", "Operating Memory"],
    },
    {
      id: "rain",
      title: "Rain removes terrace · delivery historically ↑",
      detail: "Similar rain nights associated with +18% delivery and indoor scarcity",
      state: "WATCH",
      evidence: ["Weather · DEMO", "Delivery history"],
    },
  ];

  const prepared = [
    "Feature faster high €/min alternative during peak window",
    "Protect constrained signature stock for booked covers",
    "Prepare delivery throttle threshold if kitchen ≥90%",
    "Hold walk-in acceptance window when inbound wave lands",
  ];

  const judgment: JudgmentPrompt = {
    id: "jp_vip_friday",
    question: "Any VIP or event constraints tonight?",
    reason:
      "3 prior Friday Decisions changed after VIP/event context — RADR asks before final recommendation",
    contextClass: "VIP",
    priorHits: 3,
  };

  return {
    locationId: DEMO_LOCATIONS.berlin.id,
    locationName: "Berlin Mitte",
    serviceLabel: "Dinner · tonight",
    asOf: "16:15",
    headline: "Tonight's demand mix exceeds current cold-station flexibility",
    conditions,
    prepared,
    judgment,
    arrivalDensity: BERLIN_ARRIVAL_DENSITY,
    demandQuality: BERLIN_DEMAND_QUALITY,
    relatedDecisionIds: [DECISION_IDS.peak, DECISION_IDS.menuPeak],
    demoLabel: "DEMO · ILLUSTRATIVE" as const,
  };
}

export function berlinPostShiftBrief() {
  return {
    locationId: DEMO_LOCATIONS.berlin.id,
    locationName: "Berlin Mitte",
    serviceLabel: "Dinner · last night",
    expectedIncrementalEuro: CANON_PEAK.expectedProtectedEuro,
    observedIncrementalEuro: CANON_PEAK.actualProtectedEuro,
    varianceEuro: CANON_PEAK.actualProtectedEuro - CANON_PEAK.expectedProtectedEuro,
    varianceNote:
      "Walk-in ordering mix differed from forecast — main modeled variance",
    operatorContext:
      "VIP constraint improved guest outcome; second walk-in held",
    contextHelped: true,
    verifiedEuro: CANON_PEAK.actualProtectedEuro,
    attribution: "STRONGLY_ATTRIBUTED" as const,
    learning:
      CANON_PEAK.learning?.lesson ??
      "Peak hold when kitchen ≥90% and inbound ≥30 covers in <25m",
    wrongCall: null as null | {
      expected: string;
      actual: string;
      reason: string;
    },
    relatedDecisionIds: [DECISION_IDS.peak],
    optionalPrompt: "Anything unusual the systems would not know?",
    demoLabel: "DEMO · ILLUSTRATIVE" as const,
  };
}

export function judgmentMemoryStats() {
  return {
    promptsAsked: 11,
    contextAdded: 7,
    recommendationChanged: 5,
    outcomeImproved: 4,
    nextPrompt: berlinPreShiftBrief().judgment,
  };
}

export const EVIDENCE_CONFLICTS: EvidenceConflict[] = [
  {
    id: "ec_oil_qty",
    title: "Supplier invoice vs inventory movement",
    sources: [
      { name: "Invoice", value: "420L received" },
      { name: "Inventory movement", value: "391L" },
      { name: "Usage model", value: "407L" },
    ],
    affectsDecisionIds: [DECISION_IDS.supplier],
    inference:
      "Evidence conflict — Decision confidence reduced until delivery / yield verified. Do not reprice on disputed input.",
    status: "FINDING",
  },
];

export function calibrationSnapshot(): CalibrationSnapshot {
  const verified = listDecisionRecords().filter(
    (r) =>
      r.verifiedValue &&
      (recordAttention(r) === "verified" || recordAttention(r) === "learned"),
  );
  return {
    sampleSize: 100,
    expectedRangeMet: 71,
    outsideExpectedRange: 29,
    operatorContextChangedRec: 18,
    contextImprovedOutcome: 14,
    recommendationsApproved: 64,
    alternativeSelected: 22,
    typesNeedingRecalibration: ["social_demand_mix"],
    wrongExamples: [
      {
        decisionId: DECISION_IDS.socialDemand,
        expected: "Featured-item mix lift modeled high",
        actual: "Mix lift softer than modeled",
        reason:
          "Engagement is a demand indicator — conversion weaker than historical average · MODELED attribution",
      },
      {
        decisionId: DECISION_IDS.guestVoice,
        expected: `€${CANON_GUEST_VOICE.expectedProtectedEuro} protected`,
        actual: `€${CANON_GUEST_VOICE.actualProtectedEuro} protected`,
        reason: "Within band · variance from next-Friday delivery mix",
      },
    ],
    demoNote: `${verified.length} verified Decisions currently in demo store · calibration figures are DEMO ILLUSTRATIVE over a 100-Decision horizon`,
  };
}
