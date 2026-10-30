/**
 * Project Decision Record → Decisions workspace ledger/inspector shapes.
 * Same ID + economics everywhere — no parallel Decision objects.
 */

import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { attentionBandOf } from "@/lib/radr/decision/lifecycle";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { D1911_CC_DECISION } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { HOTEL_READINESS_CANON } from "./hotelCrossLinks";
import type {
  DecisionDetail,
  DecisionState,
  DriverKind,
  JudgmentRow,
  MotionRow,
  ResolvedRow,
} from "./types";

const THUMB_BY_VERTICAL: Record<string, string> = {
  restaurant: "/demo/facilities/berlin-dining.jpg",
  hotel: "/demo/facilities/canal-suite.jpg",
  apartment: "/demo/facilities/berlin-terrace.jpg",
};

function money(n: number | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const base = formatDecisionMoney(Math.abs(n));
  return n >= 0 ? `+${base}` : `−${base}`;
}

function confidencePct(rec: DecisionRecord): number {
  if (rec.id === DECISION_IDS.peak) return D1911_CC_DECISION.confidencePct;
  if (rec.id === DECISION_IDS.hotelReadiness) {
    return HOTEL_READINESS_CANON.confidence;
  }
  const point = rec.confidence?.point;
  if (typeof point === "number" && point > 0) {
    return point <= 1 ? Math.round(point * 100) : Math.round(point);
  }
  const opt = rec.options?.find((o) => o.id === rec.recommendedOptionId) as
    | { confidence?: number }
    | undefined;
  if (opt && typeof opt.confidence === "number" && opt.confidence > 0) {
    return opt.confidence;
  }
  const band = rec.confidence?.userFacing;
  if (band === "HIGH") return 88;
  if (band === "MEDIUM") return 78;
  if (band === "LOW") return 62;
  return 75;
}

function expectedEuro(rec: DecisionRecord): number {
  if (rec.id === DECISION_IDS.peak) return D1911_CC_DECISION.expectedEuro;
  if (rec.id === DECISION_IDS.hotelReadiness) {
    return HOTEL_READINESS_CANON.protectedEuro;
  }
  return rec.expectedContributionImpact ?? rec.exposedContribution ?? 0;
}

function deadlineLabel(rec: DecisionRecord): string {
  if (rec.id === DECISION_IDS.peak) return D1911_CC_DECISION.deadlineLabel;
  if (rec.id === DECISION_IDS.hotelReadiness) {
    return HOTEL_READINESS_CANON.deadline;
  }
  return rec.decisionDeadline || "Today";
}

function driverKind(rec: DecisionRecord): DriverKind {
  const t = (rec.territories ?? []).join(" ");
  if (rec.vertical === "hotel") {
    if (/house|ready|hk/i.test(rec.decisionType + rec.title)) {
      return "housekeeping";
    }
    if (/rate|rev|adr/i.test(rec.decisionType + rec.title)) return "revenue";
    if (/ota|channel/i.test(rec.decisionType + rec.title)) return "channel";
    return "readiness";
  }
  if (/LABOR/i.test(t) || /labor|staff/i.test(rec.decisionType)) return "labor";
  if (/BUY|supplier|proc/i.test(t + rec.decisionType)) return "procurement";
  if (/menu/i.test(rec.decisionType + rec.title)) return "menu";
  if (/channel|delivery|ota/i.test(rec.decisionType + rec.title)) {
    return "channel";
  }
  if (/cancel|recover|table/i.test(rec.decisionType + rec.title)) {
    return "cancellations";
  }
  if (/capacity|peak/i.test(rec.decisionType + rec.title)) return "capacity";
  return "capacity";
}

function driverLabel(rec: DecisionRecord): string {
  const kind = driverKind(rec);
  const labels: Record<DriverKind, string> = {
    labor: "Labor",
    procurement: "Procurement",
    menu: "Menu mix",
    channel: "Channel mix",
    cancellations: "Cancellations",
    waste: "Food waste",
    capacity: "Capacity",
    housekeeping: "Housekeeping",
    guests: "Guests",
    maintenance: "Maintenance",
    revenue: "Revenue",
    front_office: "Front office",
    readiness: "Readiness",
  };
  return labels[kind];
}

function stateFromRecord(rec: DecisionRecord): DecisionState {
  const band = attentionBandOf(rec.status);
  if (band === "needs_you") return "judgment";
  if (band === "handling") return "motion";
  return "resolved";
}

function statusLabel(state: DecisionState): string {
  if (state === "judgment") return "Needs your judgment";
  if (state === "motion") return "In motion";
  return "Resolved";
}

function subtitleFor(rec: DecisionRecord): string {
  if (rec.id === DECISION_IDS.peak) {
    return D1911_CC_DECISION.action;
  }
  if (rec.id === DECISION_IDS.hotelReadiness) {
    return "Check-in wave · Floor 3 behind";
  }
  return (
    rec.recommendationHeadline ||
    rec.problemStatement?.slice(0, 120) ||
    rec.contextLine ||
    ""
  );
}

export function judgmentRowFromRecord(rec: DecisionRecord): JudgmentRow {
  const euro = expectedEuro(rec);
  const isHotelReady = rec.id === DECISION_IDS.hotelReadiness;
  return {
    id: rec.id,
    title:
      rec.id === DECISION_IDS.peak
        ? D1911_CC_DECISION.title
        : isHotelReady
          ? HOTEL_READINESS_CANON.title
          : rec.title,
    subtitle: subtitleFor(rec),
    thumb: THUMB_BY_VERTICAL[rec.vertical] ?? THUMB_BY_VERTICAL.restaurant!,
    impact: money(euro),
    impactNoun: "protected contribution",
    driver: driverLabel(rec),
    driverKind: driverKind(rec),
    locationCount: 1,
    locationsShort: rec.property || "Soho · New York",
    confidence: confidencePct(rec),
    deadline: isHotelReady ? "Before 14:40" : deadlineLabel(rec),
    deadlineTone: "today",
    liveHref:
      rec.vertical === "hotel"
        ? "/app/live"
        : "/app/live?level=venue&location=berlin-mitte",
  };
}

export function motionRowFromRecord(rec: DecisionRecord): MotionRow {
  const euro = expectedEuro(rec);
  return {
    id: rec.id,
    title: rec.title,
    subtitle: subtitleFor(rec),
    thumb: THUMB_BY_VERTICAL[rec.vertical] ?? THUMB_BY_VERTICAL.restaurant!,
    impact: money(euro),
    impactNoun: "expected value",
    driver: driverLabel(rec),
    driverKind: driverKind(rec),
    locationsShort: rec.property || "—",
    status: "Implementing",
    progress: 55,
    expectedDate: "This week",
  };
}

export function resolvedRowFromRecord(rec: DecisionRecord): ResolvedRow {
  const euro = expectedEuro(rec);
  const actual =
    rec.verifiedValue?.amount ??
    rec.actualContributionImpact ??
    rec.outcomeDetail?.observedContributionEuro ??
    euro;
  return {
    id: rec.id,
    title: rec.title,
    subtitle: subtitleFor(rec),
    thumb: THUMB_BY_VERTICAL[rec.vertical] ?? THUMB_BY_VERTICAL.restaurant!,
    expected: money(euro),
    actual: money(actual),
    accuracy: "—",
    driver: driverLabel(rec),
    driverKind: driverKind(rec),
    locationsShort: rec.property || "—",
    completed: "Verified",
  };
}

export function detailFromRecord(rec: DecisionRecord): DecisionDetail {
  const state = stateFromRecord(rec);
  const euro = expectedEuro(rec);
  const conf = confidencePct(rec);
  const why =
    rec.whyBlocks?.map((b) => b.body).filter(Boolean) ??
    (rec.recommendationReasoning
      ? [rec.recommendationReasoning]
      : [rec.problemStatement || rec.title]);

  const display = displayDecisionId(rec.id);

  return {
    id: rec.id,
    state,
    title:
      rec.id === DECISION_IDS.peak
        ? D1911_CC_DECISION.title
        : rec.id === DECISION_IDS.hotelReadiness
          ? HOTEL_READINESS_CANON.title
          : rec.title,
    subtitle: subtitleFor(rec),
    statusLabel: statusLabel(state),
    expected: money(euro),
    expectedRange: money(euro),
    confidence: conf,
    deadline: deadlineLabel(rec),
    deadlineTone: "today",
    why: why.length ? why : [`${display} · ${rec.title}`],
    outcomes: [
      {
        id: "value",
        value: money(euro),
        label: "Expected protected",
        detail: rec.decisionHorizon === "NOW" ? "Tonight" : "Horizon",
      },
      {
        id: "conf",
        value: `${conf}%`,
        label: "Confidence",
        detail: rec.confidence?.mainUncertainty || "Evidence-backed",
      },
      {
        id: "deadline",
        value: deadlineLabel(rec),
        label: "Deadline",
        detail: "Decision window",
      },
    ],
    locations: [
      {
        id: rec.locationId || "loc",
        name: rec.property || "Location",
        currentLabel: "Current course",
        afterLabel: "With RADR",
        currentPct: 40,
        afterPct: 72,
        gain: money(euro),
      },
    ],
    financial: {
      expected: money(euro),
      low: money(Math.round(euro * 0.75)),
      high: money(Math.round(euro * 1.25)),
      costOfNothing: money(rec.exposedContribution ?? euro),
      implementationCost: "€0 prepared",
      net: money(euro),
      horizon: rec.decisionHorizon === "NOW" ? "Tonight" : "This week",
    },
    evidenceSources: (rec.evidenceRefs ?? []).slice(0, 6).map((e) => ({
      id: e.id,
      name: e.source || e.label,
      freshness: e.freshness,
      healthy: e.grade !== "STALE" && e.grade !== "MISSING",
    })),
    evidenceNotes: (rec.evidenceRefs ?? [])
      .slice(0, 4)
      .map((e) => `${e.label}: ${e.value}`),
    plan: (rec.actionPlan?.steps ?? []).slice(0, 5).map((s, i) => ({
      n: i + 1,
      text: s.title,
    })),
    planMeta: {
      owner: rec.requiredRole || rec.roleContext || "GM",
      effective: "On approve",
      monitor: "Next service window",
      rollback: "Operator override",
    },
    futures: {
      doNothing: {
        title: "Do nothing",
        lines: [
          {
            label: "Outcome",
            value: rec.noActionOutcome || "Value decays",
            tone: "neg",
          },
        ],
      },
      withRadr: {
        title: "With RADR",
        lines: [
          {
            label: "Protected",
            value: money(euro),
            tone: "pos",
          },
          {
            label: "Action",
            value: subtitleFor(rec),
            tone: "neutral",
          },
        ],
      },
    },
    liveHref:
      rec.vertical === "hotel"
        ? "/app/live"
        : "/app/live?level=venue&location=berlin-mitte",
  };
}

export function rowFromRecord(
  rec: DecisionRecord,
): JudgmentRow | MotionRow | ResolvedRow {
  const state = stateFromRecord(rec);
  if (state === "judgment") return judgmentRowFromRecord(rec);
  if (state === "motion") return motionRowFromRecord(rec);
  return resolvedRowFromRecord(rec);
}
