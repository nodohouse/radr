/**
 * Single operating snapshot for Control Center + Butler + shared pages.
 * Pages must not recompute trading / exposure / attention independently.
 */

import {
  getDashboard,
  locationLabel,
  type DashPeriod,
  type LocationScope,
} from "@/lib/product/demo/dashboard";
import { DEMO_ORG } from "@/lib/radr/demoModel";
import { DAILY_PULSE } from "@/lib/radr/operatingPulse";
import {
  deriveAttentionStatus,
  priorityFindingsForScope,
  type PriorityFinding,
} from "@/lib/radr/priorityFindings";
import { findingsForScope } from "@/lib/radr/findings";
import {
  attentionNowFindings,
  currentExposureFromFindings,
} from "@/lib/radr/valueSemantics";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { BERLIN_TONIGHT_OPS } from "@/lib/radr/venueProfiles";

export type OperatingSnapshot = {
  scope: string;
  isGroup: boolean;
  locationName: string;
  orgName: string;
  attention: {
    open: number;
    atRiskEuro: number;
    actNow: number;
    today: number;
    label: string;
    detail: string;
    state: "ok" | "watch" | "risk" | "opportunity";
  };
  findings: PriorityFinding[];
  narrative: string;
  trading: {
    revenue: number;
    revenueDisplay: string;
    revenueVsForecast: number;
    margin: number;
    marginVsPlan: number;
    laborPct: number;
    laborVsPlan: number;
  };
  tonight: {
    reservations: number;
    bookedCovers: number;
    forecastCovers: number;
    expectedOccupancyPct: number;
    peakStart: string;
    peakEnd: string;
    groupBookings: number;
    cancellations: number;
  } | null;
};

function berlinNarrative(findings: PriorityFinding[]): string {
  const open = findings.filter(
    (f) => f.status !== "RESOLVED" && f.status !== "DISMISSED",
  );
  if (open.length === 0) {
    return "Operation on plan. No material exceptions in this scope.";
  }
  const hasLabor = open.some((f) => f.territory === "LABOR");
  const hasSell = open.some((f) => f.territory === "SELL");
  const hasBuy = open.some((f) => f.territory === "BUY");
  if (hasLabor && hasSell) {
    return "Revenue is ahead of forecast, but staffing pressure and one late cancellation require action before tonight's peak service. Waitlist demand can still recover released inventory.";
  }
  if (hasLabor) {
    return "Revenue is healthy overall. Tonight's primary exposure is peak-service staffing, driven by group arrivals overlapping the 19:00-20:30 window.";
  }
  if (hasSell && hasBuy) {
    return "Trading is on plan. Cancellation inventory and a supplier variance need review today.";
  }
  return "Material exceptions need attention before service peaks tonight.";
}

/**
 * Canonical Control Center payload for a scope.
 * Berlin uses venue-profile truth; other scopes use dashboard demo.
 */
export function getOperatingSnapshot(
  scope: LocationScope,
  period: DashPeriod = "yesterday",
): OperatingSnapshot {
  const isGroup = scope === "all" || scope.startsWith("region_");
  const dash = getDashboard(scope, period);
  const findings = priorityFindingsForScope(scope);
  const attention = deriveAttentionStatus(findings);
  const engineScope =
    scope === "all" || String(scope).startsWith("region_")
      ? "loc_ber"
      : String(scope);
  const engine = findingsForScope(engineScope);
  const needsNow = attentionNowFindings(engine);
  const atRisk = currentExposureFromFindings(engine);
  const actNow = needsNow.filter((f) => f.urgency === "ACT_NOW").length;
  const today = needsNow.filter(
    (f) => f.urgency === "TODAY" || f.urgency === "WATCH",
  ).length;
  const attentionOpen = needsNow.length;

  if (scope === "loc_ber") {
    const p = DAILY_PULSE;
    const rs = BERLIN_RESERVATION_SUMMARY;
    return {
      scope,
      isGroup: false,
      locationName: locationLabel(scope),
      orgName: DEMO_ORG.name,
      attention: {
        open: attentionOpen,
        atRiskEuro: atRisk,
        actNow,
        today,
        label: attention.label,
        detail: attention.detail,
        state: attention.state,
      },
      findings,
      narrative: berlinNarrative(findings),
      trading: {
        revenue: p.revenue,
        revenueDisplay: p.revenueDisplay,
        revenueVsForecast: p.revenueVsForecast,
        margin: p.margin,
        marginVsPlan: 0.6,
        laborPct: p.laborPct,
        laborVsPlan: -0.4,
      },
      tonight: {
        reservations: rs.reservationCount,
        bookedCovers: rs.bookedCovers,
        forecastCovers: rs.forecastCovers,
        expectedOccupancyPct: BERLIN_TONIGHT_OPS.expectedOccupancyPct,
        peakStart: BERLIN_TONIGHT_OPS.peakWindow.start,
        peakEnd: BERLIN_TONIGHT_OPS.peakWindow.end,
        groupBookings: 2,
        cancellations: rs.cancellationCount,
      },
    };
  }

  return {
    scope,
    isGroup,
    locationName: locationLabel(scope),
    orgName: DEMO_ORG.name,
    attention: {
      open: attentionOpen,
      atRiskEuro: atRisk,
      actNow,
      today,
      label: attention.label,
      detail: attention.detail,
      state: attention.state,
    },
    findings,
    narrative: isGroup
      ? attentionOpen > 0
        ? `Revenue is healthy across the group. ${attentionOpen} issues need attention. A minority of locations concentrate most of today's financial exposure.`
        : `All ${DEMO_ORG.locations} locations operating without material exceptions.`
      : attentionOpen > 0
        ? attention.detail
        : "Operation on plan for this location.",
    trading: {
      revenue: dash.today.revenue,
      revenueDisplay: `€${Math.round(dash.today.revenue).toLocaleString("en-GB")}`,
      revenueVsForecast: dash.today.revenueVsForecast,
      margin: dash.marginCurrent,
      marginVsPlan: dash.today.marginVsPlan,
      laborPct: dash.today.laborPct,
      laborVsPlan: dash.today.laborVsPlan,
    },
    tonight: null,
  };
}
