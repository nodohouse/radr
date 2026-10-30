/**
 * Canonical Control Center metrics — single SoT for counts and money.
 * Every surface (CC, nav badges, drawers) must use these selectors.
 */

import type { RoleView } from "@/lib/product/types";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { listDecisionRecords } from "@/lib/radr/decision/store";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  scopedDecisionsForDemo,
  splitNeedsYou,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { orgForVertical } from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { scenarioClockLabel } from "@/lib/radr/demoClock";
import {
  deriveValueAggregate,
  attentionEuro,
  type ValueAggregate,
} from "@/lib/radr/product/valueAggregate";
import { primaryMetricOf } from "@/lib/radr/product/primaryMetric";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import {
  DEMO_ORG,
  locationDisplayName,
  connectedScopeLabel,
} from "@/lib/radr/product/demoOrg";
import { getWatchingSignals } from "@/lib/radr/decision/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { dataHealthSummaryForRole } from "@/lib/radr/product/dataHealthCanonical";
import {
  buildVerifiedValueTrend,
  priorMtdVerifiedTotal,
  type VerifiedTrendPoint,
} from "@/lib/radr/product/demoValueHistory";
import { GROUP_OPERATING_OUTLIERS } from "@/lib/radr/product/verticalDay";
import { selectNeedsJudgmentCount } from "@/lib/radr/product/selectNeedsJudgment";

export type ControlCenterScope = {
  role: RoleView;
  /** Optional location filter on top of persona allow-list. */
  locationId?: string | "all";
  period?: "today" | "wtd" | "mtd" | "ytd";
  /** Active demo org vertical — filters Decisions + org chrome. */
  vertical?: DemoVerticalFamily;
};

export type NeedsYouRow = {
  id: string;
  displayId: string;
  classLabel: string;
  locationLabel: string;
  title: string;
  recommendation: string;
  economicLabel: string;
  economicValue: number;
  economicFormatted: string;
  horizon: string;
  deadlineLabel: string | null;
  severity: "urgent" | "review";
  record: DecisionRecord;
  /** Optional Why-now line for Peek (hotel seeds / composed rows). */
  contextLine?: string;
};

export type OutlierRow = {
  id: string;
  locationLabel: string;
  what: string;
  amountFormatted: string;
  whyAbnormal: string;
  cta: string;
  href: string;
  /** Operating abnormality state — not a Decision queue. */
  state?: "Watching" | "Decision formed";
};

export type SinceLastCheckItem = {
  id: string;
  text: string;
};

export type ControlCenterBrief = {
  orgName: string;
  roleLabel: string;
  firstName: string;
  scopeLabel: string;
  periodLabel: string;
  refreshedLabel: string;
  needsYouCount: number;
  urgentCount: number;
  reviewCount: number;
  handlingCount: number;
  watchingCount: number;
  locationsWithAttention: number;
  locationCount: number;
  totalLocations: number;
  connectedLocations: number;
  scopeDetail: string;
  economics: ValueAggregate;
  verifiedFormatted: string;
  priorVerifiedFormatted: string;
  verifiedDelta: number;
  verifiedDeltaPct: number | null;
  exposureFormatted: string;
  pendingFormatted: string;
  sinceLastCheck: SinceLastCheckItem[];
  needsYou: NeedsYouRow[];
  handling: NeedsYouRow[];
  verifiedRecent: NeedsYouRow[];
  outliers: OutlierRow[];
  watching: { id: string; text: string; reason: string }[];
  valueTrend: VerifiedTrendPoint[];
  dataHealth: {
    tone: "ok" | "warn" | "bad";
    summary: string;
  };
  emptyNeedsYou: boolean;
};

function horizonLabel(r: DecisionRecord): string {
  if (r.decisionHorizon === "NOW") return "Now";
  if (r.decisionHorizon === "TODAY") return "Today";
  if (r.decisionHorizon === "THIS_WEEK") return "This week";
  return r.decisionHorizon ?? "";
}

function deadlineLabel(r: DecisionRecord): string | null {
  if (r.id.includes("peak") || r.decisionHorizon === "NOW") {
    const clock = r.contextLine?.match(/\d{1,2}:\d{2}/);
    if (clock) return `Decide by ${clock[0]}`;
  }
  if (r.decisionHorizon === "THIS_WEEK") return "Review this week";
  if (r.decisionHorizon === "TODAY") return "Decide today";
  return null;
}

function toRow(
  r: DecisionRecord,
  severity: "urgent" | "review",
): NeedsYouRow {
  const metric = primaryMetricOf(r);
  const value = attentionEuro(r);
  return {
    id: r.id,
    displayId: displayDecisionId(r.id),
    classLabel: customerDecisionClass(r),
    locationLabel: locationDisplayName(r.locationId),
    title: r.title,
    recommendation:
      r.recommendationHeadline ??
      r.options.find((o) => o.recommended)?.title ??
      "Review",
    economicLabel: metric?.label ?? "Exposure",
    economicValue: value,
    economicFormatted: formatDecisionMoney(value),
    horizon: horizonLabel(r),
    deadlineLabel: deadlineLabel(r),
    severity,
    record: r,
  };
}

/**
 * Compose the Control Center executive brief from Decision store + health.
 */
export function composeControlCenterBrief(
  scope: ControlCenterScope,
): ControlCenterBrief {
  const vertical = scope.vertical ?? "restaurant";
  const ctx = roleContextFor(scope.role, vertical);
  const demoOrg = orgForVertical(vertical);
  const all = listDecisionRecords();
  let scoped = scopedDecisionsForDemo(all, scope.role, vertical);
  if (scope.locationId && scope.locationId !== "all") {
    scoped = scoped.filter(
      (r) =>
        r.locationId === scope.locationId ||
        r.locationId === "loc_ber" /* legacy */,
    );
  }

  const { urgent, review } = splitNeedsYou(scoped);
  const needsYouRecords = [...urgent, ...review];
  const handlingRecords = scoped.filter(
    (r) => recordAttention(r) === "handling",
  );
  const verifiedRecords = scoped.filter(
    (r) =>
      recordAttention(r) === "verified" || recordAttention(r) === "learned",
  );

  const economics = deriveValueAggregate(scope.role, vertical);
  const priorVerified = priorMtdVerifiedTotal(scope.role, vertical);
  const verifiedDelta = economics.verifiedTotal - priorVerified;
  const verifiedDeltaPct =
    priorVerified > 0
      ? Math.round((verifiedDelta / priorVerified) * 100)
      : null;

  const locationsWithAttention = new Set(
    needsYouRecords.map((r) => r.locationId),
  ).size;

  const watchingSignals = getWatchingSignals().filter((w) => {
    if (vertical === "hotel" && w.locationId === "loc_berlin_mitte") {
      return false;
    }
    if (vertical === "restaurant" && w.locationId === "loc_canal_house") {
      return false;
    }
    return ctx.allowedLocationIds.includes(
      w.locationId as (typeof ctx.allowedLocationIds)[number],
    );
  });

  const health = dataHealthSummaryForRole(scope.role, vertical);
  const stale = health.unhealthyCount;
  const healthTone = health.tone;

  const outliers: OutlierRow[] = GROUP_OPERATING_OUTLIERS.filter((o) => {
    if (ctx.scopeType === "LOCATION") {
      const loc = String(ctx.defaultLocationId);
      return o.locationLabel
        .toLowerCase()
        .includes(
          locationDisplayName(loc)
            .split("·")[0]!
            .trim()
            .toLowerCase()
            .split(" ")[0]!,
        );
    }
    return true;
  })
    .slice(0, 4)
    .map((o) => ({
      id: o.id,
      locationLabel: o.locationLabel,
      what: o.metric,
      amountFormatted: o.delta,
      whyAbnormal: o.why,
      cta: o.state,
      href: o.href,
      state: o.state,
    }));

  const sinceLastCheck: SinceLastCheckItem[] = [];
  if (urgent.length > 0) {
    sinceLastCheck.push({
      id: "new",
      text: `+${urgent.length} urgent Decision${urgent.length === 1 ? "" : "s"}`,
    });
  }
  if (verifiedDelta !== 0) {
    const sign = verifiedDelta > 0 ? "+" : "−";
    sinceLastCheck.push({
      id: "verified-delta",
      text: `${sign}${formatDecisionMoney(Math.abs(verifiedDelta))} Verified vs prior period${
        verifiedDeltaPct != null
          ? ` (${verifiedDeltaPct >= 0 ? "+" : ""}${verifiedDeltaPct}%)`
          : ""
      }`,
    });
  } else {
    const recentVerified = verifiedRecords
      .filter((r) => r.verifiedValue)
      .slice(0, 1);
    if (recentVerified[0]?.verifiedValue) {
      sinceLastCheck.push({
        id: "verified",
        text: `${formatDecisionMoney(recentVerified[0].verifiedValue.amount)} moved to Verified`,
      });
    }
  }
  if (outliers.length > 0) {
    sinceLastCheck.push({
      id: "outlier",
      text: `${outliers[0]!.what} · ${outliers[0]!.amountFormatted} outside band`,
    });
  }
  if (stale > 0) {
    sinceLastCheck.push({
      id: "health",
      text: health.summary,
    });
  }
  if (watchingSignals.length > 0 && sinceLastCheck.length < 3) {
    sinceLastCheck.push({
      id: "watching",
      text: `${watchingSignals.length} signal${watchingSignals.length === 1 ? "" : "s"} on watch`,
    });
  }
  if (sinceLastCheck.length === 0) {
    sinceLastCheck.push({
      id: "quiet",
      text: "No material changes since last check",
    });
  }

  const refreshedLabel = scenarioClockLabel(vertical);

  const scopeLabel =
    scope.locationId && scope.locationId !== "all"
      ? locationDisplayName(scope.locationId)
      : ctx.scopeType === "LOCATION"
        ? locationDisplayName(String(ctx.defaultLocationId))
        : connectedScopeLabel(demoOrg);

  return {
    orgName: demoOrg.name,
    roleLabel: ctx.label,
    firstName: ctx.firstName,
    scopeLabel,
    scopeDetail: connectedScopeLabel(demoOrg),
    periodLabel: (scope.period ?? "mtd").toUpperCase(),
    refreshedLabel,
    needsYouCount: needsYouRecords.length,
    urgentCount: urgent.length,
    reviewCount: review.length,
    handlingCount: handlingRecords.length,
    watchingCount: watchingSignals.length,
    locationsWithAttention,
    locationCount: demoOrg.connectedLocations,
    totalLocations: demoOrg.totalLocations,
    connectedLocations: demoOrg.connectedLocations,
    economics,
    verifiedFormatted: formatDecisionMoney(economics.verifiedTotal),
    priorVerifiedFormatted: formatDecisionMoney(priorVerified),
    verifiedDelta,
    verifiedDeltaPct,
    exposureFormatted: formatDecisionMoney(
      economics.activeExposureOrOpportunity,
    ),
    pendingFormatted: formatDecisionMoney(economics.pendingVerification),
    sinceLastCheck,
    needsYou: [
      ...urgent.map((r) => toRow(r, "urgent")),
      ...review.map((r) => toRow(r, "review")),
    ],
    handling: handlingRecords.map((r) => toRow(r, "review")),
    verifiedRecent: verifiedRecords
      .filter((r) => r.verifiedValue)
      .slice(0, 3)
      .map((r) => toRow(r, "review")),
    outliers,
    watching: watchingSignals.slice(0, 3).map((w) => ({
      id: w.id,
      text: `${w.title} · ${w.metricValue}`,
      reason: w.reason,
    })),
    valueTrend: buildVerifiedValueTrend(scope.role, vertical),
    dataHealth: {
      tone: healthTone,
      summary: health.summary,
    },
    emptyNeedsYou: needsYouRecords.length === 0,
  };
}

export function needsYouCount(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): number {
  return selectNeedsJudgmentCount({ role, vertical });
}
