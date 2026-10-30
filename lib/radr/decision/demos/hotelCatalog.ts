/**
 * Thin hotel Decision builders — seeded from lib/radr/demo/hotelDecisions.ts.
 * Futures derive from options in DecisionRecordView when no canon entry exists.
 */

import type { DecisionRecord } from "../record";
import type { CounterfactualOption } from "../counterfactual";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import {
  HOTEL_DECISION_IDS,
  hotelHandlingDecisions,
  hotelNeedsYouDecisions,
  hotelVerifiedExamples,
  type HotelDecisionSeed,
} from "@/lib/radr/demo/hotelDecisions";
import type { ValueKind } from "../core";

const PAYLOAD =
  "Prepared — not written back to PMS/channel. Operator confirms in the system of record.";

const RATE_DEMAND_SEED: HotelDecisionSeed = {
  id: HOTEL_DECISION_IDS.rateDemand,
  displayId: "D-2432",
  family: "RATE_DEMAND",
  title: "Hold restricted rate · walk pickup above pace",
  verb: "HOLD RESTRICTED RATE",
  locationId: "loc_canal_house",
  locationLabel: "Mercer House · New York",
  economicEuro: 480,
  economicFormatted: "€480",
  deadlineLabel: "watching",
  attention: "watching",
  why: "Walk demand +6% · undercut risk if BAR opened early",
  futures: [
    { id: "hold", label: "Hold floor", value: "+€480 protected", preferred: true },
    { id: "open", label: "Open BAR +4%", value: "+€210 expected" },
    { id: "none", label: "No action", value: "€0 · ADR drift" },
  ],
};

function parseEuroFromFuture(value: string, fallback: number): number {
  const m = value.match(/\+€([\d,]+)/);
  if (!m) return value.includes("€0") ? 0 : fallback;
  return Number(m[1]!.replace(/,/g, ""));
}

function seedToOptions(seed: HotelDecisionSeed): CounterfactualOption[] {
  if (!seed.futures.length) {
    return [
      {
        id: "prepared",
        title: seed.verb,
        expectedContributionEuro: seed.economicEuro,
        guestImpact: "low",
        operationalRisk: "low",
        confidence: 76,
        timeToResult: seed.deadlineLabel,
        note: seed.why,
        recommended: true,
      },
    ];
  }
  return seed.futures.map((f) => {
    const preferred = Boolean(f.preferred);
    const euro = parseEuroFromFuture(
      f.value,
      preferred ? seed.economicEuro : 0,
    );
    const isNoAction =
      f.id === "none" ||
      f.id === "keep" ||
      f.value.startsWith("€0") ||
      f.label.toLowerCase().includes("no action");
    return {
      id: f.id,
      title: f.label,
      expectedContributionEuro: euro,
      guestImpact: isNoAction ? ("high" as const) : ("low" as const),
      operationalRisk: isNoAction ? ("high" as const) : ("low" as const),
      confidence: preferred ? 78 : 68,
      timeToResult: seed.deadlineLabel,
      note: f.value,
      recommended: preferred,
      isNoAction,
    };
  });
}

function statusForSeedAttention(
  seed: HotelDecisionSeed,
  statusOverride?: DecisionRecord["status"],
): DecisionRecord["status"] {
  if (statusOverride) return statusOverride;
  if (seed.attention === "handling") return "APPROVED";
  if (seed.attention === "watching") return "SIMULATED";
  return "AWAITING_APPROVAL";
}

function attentionOverrideFor(
  seed: HotelDecisionSeed,
  status: DecisionRecord["status"],
): DecisionRecord["attentionOverride"] {
  if (seed.attention === "watching") return "watching";
  if (seed.attention === "handling" || status === "APPROVED") return "handling";
  return "needs_you";
}

export function buildThinHotelDecisionRecord(
  seed: HotelDecisionSeed,
  statusOverride?: DecisionRecord["status"],
): DecisionRecord {
  const clock = HOTEL_LIVE_SCENARIO;
  const options = seedToOptions(seed);
  const recommended =
    options.find((o) => o.recommended)?.id ?? options[0]!.id;
  const status = statusForSeedAttention(seed, statusOverride);
  const operatingUnit =
    seed.locationId === "loc_ams_harbour"
      ? "ou_harbour_rooms"
      : "ou_canal_rooms";

  const base: DecisionRecord = {
    id: seed.id,
    organizationId: "org_northstar_hotels",
    locationId: seed.locationId,
    operatingUnitId: operatingUnit,
    roleContext: "GM",
    decisionType: seed.family.toLowerCase(),
    decisionHorizon: seed.attention === "watching" ? "THIS_WEEK" : "TODAY",
    status,
    vertical: "hotel",
    title: seed.title,
    problemStatement: seed.why,
    currentState: seed.why,
    property: `${seed.locationLabel}`,
    phaseLabel: `Hotel · ${clock.clockLabel}`,
    contextLine: seed.why,
    recommendationHeadline: seed.verb,
    recommendationReasoning: `${seed.verb} · ${seed.economicFormatted} expected · ${seed.why}`,
    triggerEvents: [seed.family],
    evidenceRefs: [
      {
        id: `ev_${seed.id}_1`,
        label: "Economic exposure",
        value: seed.economicFormatted,
        source: "RADR hotel model",
        freshness: "now",
      },
    ],
    relatedEntities: [
      { type: "location", id: seed.locationId, label: seed.locationLabel },
    ],
    baselinePrediction: seed.futures.find((f) => f.id === "none" || f.id === "keep")
      ?.value ?? "Baseline path modeled",
    noActionOutcome:
      seed.futures.find((f) => f.id === "none")?.value ??
      "Cost of doing nothing modeled in Futures",
    options,
    recommendedOptionId: recommended,
    expectedContributionImpact: seed.economicEuro,
    expectedGuestImpact: "Guest impact in Futures comparison",
    expectedOperationalImpact: PAYLOAD,
    exposedContribution: seed.attention === "needs_you" ? seed.economicEuro : undefined,
    confidence: {
      forecast: "MEDIUM",
      data: "HIGH",
      decision: "MEDIUM",
      userFacing: "MEDIUM",
      evidenceCoverage: "MEDIUM",
      dataFreshness: "HIGH",
      explanation: "Hotel demo seed · PMS + channel economics",
      point: 74,
      low: 62,
      high: 86,
    },
    decisionDeadline: `Decide by ${clock.decisionDeadlineClock}`,
    decisionDeadlineAt: clock.decisionDeadlineIso,
    requiredRole: "GM",
    actionPlan: {
      status: status === "APPROVED" ? "EXECUTING" : "READY",
      payloadNote: PAYLOAD,
      steps: [
        {
          id: `ap_${seed.id}`,
          provider: "RADR",
          title: seed.verb,
          status: status === "APPROVED" ? "EXECUTING" : "READY",
          preparedOnly: true,
        },
      ],
    },
    executionRefs: [],
    ledger: [
      {
        id: `le_${seed.id}_01`,
        at: clock.decisionFormedClock,
        kind: "recommend",
        title: seed.title,
        statusAfter: status,
      },
    ],
    graph: { nodes: [], edges: [] },
    autonomy: {
      decisionType: seed.family.toLowerCase(),
      level: seed.attention === "handling" ? 3 : 2,
      risk: "medium",
      reversibility: "easy",
      historicalSuccessRate: 0.74,
      nHistorical: 8,
      neverFullyAutonomous: true,
      reason: "Hotel decisions stay prepared until approved.",
    },
    whyBlocks: [
      {
        epistemic: "OBSERVED",
        title: seed.family.replace(/_/g, " "),
        body: seed.why,
      },
      {
        epistemic: "RECOMMENDED",
        title: seed.verb,
        body: `${seed.economicFormatted} · ${seed.deadlineLabel}`,
      },
    ],
    locationDnaLine: `${seed.locationLabel} · ${seed.family} pattern`,
    modelVersion: "decision-record/v1",
    demoLabel: seed.displayId,
    createdAt: clock.decisionFormedIso,
    updatedAt: clock.timestampIso,
    territories:
      seed.family === "CHANNEL_ALLOCATION"
        ? ["SELL"]
        : seed.family.includes("HOUSEKEEPING") ||
            seed.family === "ROOM_READINESS"
          ? ["LABOR", "SELL"]
          : ["SELL", "RECOVER"],
    attentionOverride: attentionOverrideFor(seed, status),
  };

  if (status === "VERIFIED" || status === "LEARNED") {
    const kind: Exclude<ValueKind, "exposed"> =
      seed.family === "CHANNEL_ALLOCATION"
        ? "avoided"
        : seed.family.includes("CANCEL") || seed.family.includes("OOO")
          ? "recovered"
          : seed.family.includes("UPSELL") || seed.family.includes("ANCILLARY")
            ? "created"
            : "protected";
    return {
      ...base,
      status,
      chosenOptionId: recommended,
      approver: "GM",
      actualContributionImpact: seed.economicEuro,
      verifiedValue: {
        amount: seed.economicEuro,
        kind,
        note: `${seed.economicFormatted} verified · ${seed.why}`,
      },
      attentionOverride: status === "LEARNED" ? "learned" : "verified",
      actionPlan: {
        ...base.actionPlan!,
        status: "COMPLETED",
        steps: base.actionPlan!.steps.map((s) => ({
          ...s,
          status: "COMPLETED" as const,
        })),
      },
    };
  }

  if (status === "APPROVED") {
    return {
      ...base,
      chosenOptionId: recommended,
      approver: "GM",
    };
  }
  return base;
}

function seedById(id: string): HotelDecisionSeed | undefined {
  return (
    hotelNeedsYouDecisions().find((s) => s.id === id) ??
    hotelHandlingDecisions().find((s) => s.id === id) ??
    (id === RATE_DEMAND_SEED.id ? RATE_DEMAND_SEED : undefined)
  );
}

export function buildHotelCatalogRecord(
  id: string,
  status?: DecisionRecord["status"],
): DecisionRecord | undefined {
  const seed = seedById(id);
  if (!seed) return undefined;
  return buildThinHotelDecisionRecord(seed, status);
}

export const HOTEL_CATALOG_BUILDER_IDS = [
  HOTEL_DECISION_IDS.cancelRecover,
  HOTEL_DECISION_IDS.overbook,
  HOTEL_DECISION_IDS.upsell,
  HOTEL_DECISION_IDS.hkStaff,
  HOTEL_DECISION_IDS.maintenance,
  HOTEL_DECISION_IDS.rateDemand,
] as const;

export function seedHotelCatalogRecords(): Record<string, DecisionRecord> {
  const out: Record<string, DecisionRecord> = {};
  for (const id of HOTEL_CATALOG_BUILDER_IDS) {
    const seed = seedById(id);
    if (!seed) continue;
    const status =
      seed.attention === "handling"
        ? ("APPROVED" as const)
        : seed.attention === "watching"
          ? ("SIMULATED" as const)
          : ("AWAITING_APPROVAL" as const);
    out[id] = buildThinHotelDecisionRecord(seed, status);
  }

  /** MTD Verified Value — past outcomes, separate from live needs-you Decisions. */
  for (const vv of hotelVerifiedExamples()) {
    const seed: HotelDecisionSeed = {
      id: vv.decisionId,
      displayId: vv.displayId,
      family: vv.family,
      title: vv.label,
      verb: vv.label.toUpperCase(),
      locationId: vv.locationId,
      locationLabel: vv.locationLabel,
      economicEuro: vv.euro,
      economicFormatted: `€${vv.euro.toLocaleString("en-IE")}`,
      deadlineLabel: "verified",
      attention: "handling",
      why: `Verified from ${vv.sourceDecisionId}`,
      futures: [],
    };
    const record = buildThinHotelDecisionRecord(seed, "VERIFIED");
    out[vv.decisionId] = {
      ...record,
      verifiedValue: {
        amount: vv.euro,
        kind: vv.kind,
        note: vv.label,
      },
    };
  }
  return out;
}

export function buildCancelRecoverDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
) {
  return buildThinHotelDecisionRecord(
    seedById(HOTEL_DECISION_IDS.cancelRecover)!,
    status,
  );
}

export function buildHotelHkStaffDecisionRecord(
  status: DecisionRecord["status"] = "AWAITING_APPROVAL",
) {
  return buildThinHotelDecisionRecord(
    seedById(HOTEL_DECISION_IDS.hkStaff)!,
    status,
  );
}

export function buildHotelMaintenanceDecisionRecord(
  status: DecisionRecord["status"] = "APPROVED",
) {
  return buildThinHotelDecisionRecord(
    seedById(HOTEL_DECISION_IDS.maintenance)!,
    status,
  );
}

export function buildHotelUpsellDecisionRecord(
  status: DecisionRecord["status"] = "APPROVED",
) {
  return buildThinHotelDecisionRecord(
    seedById(HOTEL_DECISION_IDS.upsell)!,
    status,
  );
}

export function buildHotelOverbookDecisionRecord(
  status: DecisionRecord["status"] = "APPROVED",
) {
  return buildThinHotelDecisionRecord(
    seedById(HOTEL_DECISION_IDS.overbook)!,
    status,
  );
}

export function buildHotelRateDemandDecisionRecord(
  status: DecisionRecord["status"] = "SIMULATED",
) {
  return buildThinHotelDecisionRecord(RATE_DEMAND_SEED, status);
}
