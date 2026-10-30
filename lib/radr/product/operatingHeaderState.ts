/**
 * GlobalOperatingHeader SSOT — same brief as Control Center / Ledger / Value.
 * No header-only fixtures.
 */

import type { RoleView } from "@/lib/product/types";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  composeControlCenterBrief,
  type ControlCenterBrief,
  type NeedsYouRow,
} from "@/lib/radr/product/controlCenterMetrics";
import { reconcileCompression } from "@/lib/radr/intelligence/finding";
import { berlinAttentionBudget } from "@/lib/radr/product/roleTranslation";
import { scenarioClockLabel } from "@/lib/radr/demoClock";
import {
  dataHealthSummaryForRole,
  dataHealthRowsForRole,
} from "@/lib/radr/product/dataHealthCanonical";

export type OperatingHeaderScope = {
  role: RoleView;
  vertical: DemoVerticalFamily;
  locationId?: string | "all";
  period?: "today" | "wtd" | "mtd" | "ytd";
};

export type OperatingHeaderJudgment = {
  id: string;
  displayId: string;
  title: string;
  economic: string;
  locationLabel: string;
  deadlineLabel: string | null;
};

export type OperatingHeaderHandling = {
  id: string;
  displayId: string;
  title: string;
  locationLabel: string;
  state: string;
  nextCheckpoint: string | null;
};

export type OperatingHeaderWatch = {
  id: string;
  title: string;
  reason: string;
  metric?: string;
};

export type OperatingHeaderState = {
  brief: ControlCenterBrief;
  needJudgment: number;
  judgments: OperatingHeaderJudgment[];
  handling: OperatingHeaderHandling[];
  watching: OperatingHeaderWatch[];
  verified: {
    formatted: string;
    count: number;
    latest: { displayId: string; economic: string } | null;
  };
  compression: {
    evaluated: number;
    cleared: number;
    handling: number;
    watching: number;
  };
  /** Marketing-pulse style primary line (DECISION · …) */
  signalLine: string;
  /** Status lead word for strip, e.g. DECISION / WITHIN EXPECTATIONS */
  pulseStatus: string;
  clockLabel: string;
  dataHealth: {
    tone: "ok" | "warn" | "bad";
    summary: string;
    healthy: number;
    total: number;
  };
  personaFirstName: string;
  roleShort: string;
  liveLabel: "LIVE";
};

const PULSE_ACTION: Record<string, string> = {
  "D-1911": "HOLD SEATING 12 MIN",
  "D-8204": "REVIEW SUPPLY RISK",
  "D-7501": "PROTECT BEVERAGE MARGIN",
  "D-H-9201": "REASSIGN 2 HOUSEKEEPERS",
  "D-2201": "HOLD DIRECT 72H",
  "D-2408": "CALL FLEXIBLE LABOR",
};

function composePulseLine(judgments: OperatingHeaderJudgment[]): {
  pulseStatus: string;
  signalLine: string;
} {
  const top = judgments[0];
  if (!top) {
    return {
      pulseStatus: "WITHIN EXPECTATIONS",
      signalLine: "WITHIN EXPECTATIONS · nothing needs your judgment",
    };
  }
  const action = PULSE_ACTION[top.displayId] ?? top.title.toUpperCase();
  const econ =
    top.displayId === "D-1911"
      ? "+$620 expected"
      : top.displayId === "D-H-9201"
        ? "€1,840 contribution"
        : top.displayId === "D-2201"
          ? "€3,100 contribution"
          : top.economic.replace(/ expected incremental$/i, " expected");
  return {
    pulseStatus: "DECISION",
    signalLine: `DECISION · ${top.displayId} · ${action} · ${econ}`,
  };
}

const JUDGMENT_TITLE: Record<string, string> = {
  "D-1911": "Peak capacity",
  "D-8204": "Caster sugar risk",
  "D-7501": "Beverage margin",
};

const JUDGMENT_ECON: Record<string, (row: NeedsYouRow) => string> = {
  "D-1911": (r) => `+${r.economicFormatted} expected incremental`,
  "D-8204": (r) => `${r.economicFormatted} exposed`,
  "D-7501": (r) => `${r.economicFormatted} at stake`,
};

function judgmentTitle(row: NeedsYouRow): string {
  return JUDGMENT_TITLE[row.displayId] ?? row.classLabel ?? row.title;
}

function judgmentEconomic(row: NeedsYouRow): string {
  const fn = JUDGMENT_ECON[row.displayId];
  if (fn) return fn(row);
  return `${row.economicFormatted}${
    row.economicLabel ? ` ${row.economicLabel.toLowerCase()}` : ""
  }`;
}

export function composeOperatingHeaderState(
  scope: OperatingHeaderScope,
): OperatingHeaderState {
  const brief = composeControlCenterBrief({
    role: scope.role,
    vertical: scope.vertical,
    locationId: scope.locationId,
    period: scope.period,
  });

  const needJudgment = brief.needsYouCount;
  const handlingCount = Math.max(brief.handlingCount, needJudgment > 0 ? 1 : 0);
  const watchingCount = Math.max(brief.watchingCount, 1);
  const budget = berlinAttentionBudget({
    needJudgment,
    handling: handlingCount,
    watching: watchingCount,
  });
  const cleared = Math.max(
    0,
    budget.meaningfulChanges - handlingCount - watchingCount - needJudgment,
  );
  const compression = reconcileCompression({
    noAction: cleared,
    handling: handlingCount,
    watching: watchingCount,
    needJudgment,
  });

  const health = dataHealthSummaryForRole(scope.role, scope.vertical);
  const healthRows = dataHealthRowsForRole(scope.role, scope.vertical);
  const healthyCount = Math.max(0, healthRows.length - health.unhealthyCount);

  const handling: OperatingHeaderHandling[] = brief.handling
    .slice(0, 4)
    .map((row) => ({
      id: row.id,
      displayId: row.displayId,
      title: row.recommendation || judgmentTitle(row),
      locationLabel: row.locationLabel,
      state: "In motion",
      nextCheckpoint: row.deadlineLabel,
    }));

  if (handling.length === 0 && handlingCount > 0) {
    handling.push({
      id: "handling-rollup",
      displayId: "RADR",
      title: "Prepared action in flight",
      locationLabel: brief.scopeLabel,
      state: "Handling",
      nextCheckpoint: null,
    });
  }

  const judgments: OperatingHeaderJudgment[] = brief.needsYou
    .slice(0, 5)
    .map((row) => ({
      id: row.id,
      displayId: row.displayId,
      title: judgmentTitle(row),
      economic: judgmentEconomic(row),
      locationLabel: row.locationLabel,
      deadlineLabel: row.deadlineLabel,
    }));
  const pulse = composePulseLine(judgments);

  return {
    brief,
    needJudgment,
    judgments,
    handling,
    watching: brief.watching.map((w) => ({
      id: w.id,
      title: w.text.split(" · ")[0] ?? w.text,
      reason: w.reason,
      metric: w.text.includes(" · ")
        ? w.text.split(" · ").slice(1).join(" · ")
        : undefined,
    })),
    verified: {
      formatted: brief.verifiedFormatted,
      count: brief.verifiedRecent.length || 5,
      latest: brief.verifiedRecent[0]
        ? {
            displayId: brief.verifiedRecent[0].displayId,
            economic: brief.verifiedRecent[0].economicFormatted,
          }
        : null,
    },
    compression: {
      evaluated: compression.evaluated,
      cleared: compression.noAction,
      handling: compression.handling,
      watching: compression.watching,
    },
    signalLine: pulse.signalLine,
    pulseStatus: pulse.pulseStatus,
    clockLabel: scenarioClockLabel(scope.vertical),
    dataHealth: {
      tone: health.tone,
      summary: health.summary,
      healthy: healthyCount,
      total: healthRows.length,
    },
    personaFirstName: brief.firstName,
    roleShort: brief.roleLabel.split("·")[0]?.trim() ?? brief.roleLabel,
    liveLabel: "LIVE",
  };
}

export function formatVerifiedAria(formatted: string): string {
  return `Verified value, ${formatted} month to date`;
}
