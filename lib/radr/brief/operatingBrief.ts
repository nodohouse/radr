/**
 * Role-composed operating brief - Control Center Layer 1-3 data.
 * Uses existing findings + scenario ledger only (no invented euros).
 */

import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import { demoGreeting } from "@/lib/radr/demoClock";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import { formatCurrency } from "@/lib/radr/currency";
import {
  moneyKindOfFinding,
  verifiedFromFindings,
} from "@/lib/radr/valueSemantics";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";
import { BERLIN_RESERVATION_SUMMARY } from "@/lib/radr/reservationDemo";
import { getRoleProfile } from "@/lib/radr/role/profiles";
import {
  rolePrioritize,
  type RankedFinding,
} from "@/lib/radr/role/prioritize";
import {
  findingToDecision,
  type DecisionHorizon,
  type DecisionObject,
} from "@/lib/radr/decision/types";
import {
  computeSinceLastCheck,
  type SinceLastCheck,
} from "@/lib/radr/attentionState";
import { LOCATIONS } from "@/lib/product/demo/catalog";
import { DEMO_FORECAST_EXPOSURE_DELTA } from "@/lib/radr/demoClock";

export type BusinessPulse = "ON_TRACK" | "NEEDS_ATTENTION" | "AT_RISK";

export type BriefStake = {
  amount: string;
  label: string;
  positive?: boolean;
  /** Visual weight for hero vs supporting strip. */
  emphasis?: "hero" | "support";
};

export type BriefModuleLine = {
  label: string;
  value: string;
  href?: string;
  note?: string;
  positive?: boolean;
};

export type ValuePanel = {
  title: string;
  lines: BriefModuleLine[];
  /** Compact “since last check” financial deltas for the panel. */
  sinceLines: string[];
};

export type ExploreLink = {
  label: string;
  href: string;
};

export type HandledItem = {
  label: string;
  detail?: string;
  href?: string;
};

export type OperatingBrief = {
  role: RoleView;
  firstName: string;
  greeting: string;
  pulse: BusinessPulse;
  pulseReason: string;
  /** Text headline when hero KPI is not used (GM/COO/Owner narrative). */
  headline: string;
  /** Single dominant KPI - never duplicated in breakdown. */
  hero: BriefStake | null;
  /** Supporting strip under hero (breakdown only). */
  breakdown: BriefStake[];
  lead: string;
  reviewCta: string;
  now: DecisionObject[];
  next: DecisionObject[];
  later: DecisionObject[];
  ranked: RankedFinding[];
  valuePanel: ValuePanel;
  whatChanged: string[];
  handled: HandledItem[];
  explore: ExploreLink[];
  calmDetail: string;
};

function moneyTotals(ranked: RankedFinding[]) {
  const totalOpen = ranked.reduce(
    (s, r) => s + r.finding.financialImpact.primaryValue,
    0,
  );
  const recoverable = ranked
    .filter((r) => moneyKindOfFinding(r.finding) === "recoverable")
    .reduce((s, r) => s + r.finding.financialImpact.primaryValue, 0);
  const atRisk = ranked
    .filter((r) => moneyKindOfFinding(r.finding) !== "recoverable")
    .reduce((s, r) => s + r.finding.financialImpact.primaryValue, 0);
  return { totalOpen, recoverable, atRisk };
}

function largestDriver(ranked: RankedFinding[]): {
  territory: string;
  amount: number;
} | null {
  const byTerr = new Map<string, number>();
  for (const r of ranked) {
    byTerr.set(
      r.finding.territory,
      (byTerr.get(r.finding.territory) ?? 0) +
        r.finding.financialImpact.primaryValue,
    );
  }
  const top = [...byTerr.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  return { territory: top[0], amount: top[1] };
}

function pulseFrom(open: RankedFinding[]): {
  pulse: BusinessPulse;
  reason: string;
} {
  if (open.length === 0) {
    return { pulse: "ON_TRACK", reason: "Nothing material needs you." };
  }
  const nowCount = open.filter(
    (r) => r.finding.urgency === "ACT_NOW",
  ).length;
  if (nowCount >= 2 || open[0]!.finding.financialImpact.primaryValue >= 400) {
    return {
      pulse: "AT_RISK",
      reason: `${nowCount || open.length} material issue${(nowCount || open.length) === 1 ? "" : "s"} need a decision.`,
    };
  }
  return {
    pulse: "NEEDS_ATTENTION",
    reason: `${open.length} thing${open.length === 1 ? "" : "s"} need you.`,
  };
}

function heroAndBreakdown(
  role: RoleView,
  ranked: RankedFinding[],
  verifiedEuro: number,
): { hero: BriefStake | null; breakdown: BriefStake[] } {
  const { totalOpen, recoverable, atRisk } = moneyTotals(ranked);

  if (role === "cfo") {
    return {
      hero:
        totalOpen > 0
          ? {
              amount: formatFindingEuro(totalOpen),
              label: "needs attention",
              emphasis: "hero",
            }
          : null,
      breakdown: [
        ...(atRisk > 0
          ? [{ amount: formatFindingEuro(atRisk), label: "at risk" }]
          : []),
        ...(recoverable > 0
          ? [
              {
                amount: formatFindingEuro(recoverable),
                label: "recoverable",
                positive: true,
              },
            ]
          : []),
        ...(verifiedEuro > 0
          ? [
              {
                amount: formatFindingEuro(verifiedEuro),
                label: "verified",
                positive: true,
              },
            ]
          : []),
      ],
    };
  }

  if (role === "finance") {
    return {
      hero:
        recoverable > 0
          ? {
              amount: formatFindingEuro(recoverable),
              label: "ready to recover",
              positive: true,
              emphasis: "hero",
            }
          : totalOpen > 0
            ? {
                amount: formatFindingEuro(totalOpen),
                label: "needs attention",
                emphasis: "hero",
              }
            : null,
      breakdown: [
        ...(verifiedEuro > 0
          ? [
              {
                amount: formatFindingEuro(verifiedEuro),
                label: "already verified",
                positive: true,
              },
            ]
          : []),
        ...(atRisk > 0
          ? [{ amount: formatFindingEuro(atRisk), label: "at risk" }]
          : []),
      ],
    };
  }

  if (role === "coo" || role === "regional") {
    const locs = new Set(
      ranked.map((r) => r.finding.locationId).filter(Boolean),
    );
    const n = locs.size || (ranked.length ? 1 : 0);
    return {
      hero:
        n > 0
          ? {
              amount: String(n),
              label:
                n === 1
                  ? "location needs attention"
                  : "locations need attention",
              emphasis: "hero",
            }
          : null,
      breakdown:
        totalOpen > 0
          ? [{ amount: formatFindingEuro(totalOpen), label: "total exposure" }]
          : [],
    };
  }

  if (role === "owner") {
    return {
      hero:
        ranked.length > 0
          ? {
              amount: String(ranked.length),
              label:
                ranked.length === 1
                  ? "thing needs attention"
                  : "things need attention",
              emphasis: "hero",
            }
          : null,
      breakdown: [
        ...(totalOpen > 0
          ? [{ amount: formatFindingEuro(totalOpen), label: "at risk" }]
          : []),
        ...(verifiedEuro > 0
          ? [
              {
                amount: formatFindingEuro(verifiedEuro),
                label: "verified this period",
                positive: true,
              },
            ]
          : []),
      ],
    };
  }

  // GM / F&B
  return {
    hero:
      ranked.length > 0
        ? {
            amount: String(ranked.length),
            label:
              ranked.length === 1 ? "thing needs you" : "things need you",
            emphasis: "hero",
          }
        : null,
    breakdown:
      totalOpen > 0
        ? [{ amount: formatFindingEuro(totalOpen), label: "at risk" }]
        : [],
  };
}

function headlineFor(
  role: RoleView,
  ranked: RankedFinding[],
  pulse: BusinessPulse,
  locationName: string,
  isGroup: boolean,
  hero: BriefStake | null,
): string {
  // Money / count heroes carry the visual KPI - keep headline empty for those.
  if (role === "cfo" || role === "finance") {
    return hero ? "" : "Nothing material is open.";
  }
  if (ranked.length === 0) {
    if (role === "owner") return "Your business is on track.";
    return isGroup
      ? "Everything looks good across locations."
      : `${locationName} is mostly on track.`;
  }
  if (role === "coo" || role === "regional" || role === "owner") {
    return "";
  }
  if (pulse === "ON_TRACK") return "Tonight is mostly on track.";
  return "";
}

function valuePanelFor(
  role: RoleView,
  ranked: RankedFinding[],
  isGroup: boolean,
  locationName: string,
  verifiedEuro: number,
  since: SinceLastCheck,
): ValuePanel {
  const { totalOpen, recoverable, atRisk } = moneyTotals(ranked);
  const driver = largestDriver(ranked);
  const sinceLines = whatChangedLines(ranked, verifiedEuro, since).slice(0, 3);

  if (role === "cfo") {
    const lines: BriefModuleLine[] = [];
    if (totalOpen > 0) {
      lines.push({
        label: "Requires attention",
        value: formatFindingEuro(totalOpen),
      });
    }
    if (verifiedEuro > 0) {
      lines.push({
        label: "Verified",
        value: formatFindingEuro(verifiedEuro),
        href: "/app/value",
        positive: true,
        note:
          since.recoveredValue > 0
            ? `↑ +${formatFindingEuro(since.recoveredValue)} since last check`
            : undefined,
      });
    }
    if (recoverable > 0) {
      lines.push({
        label: "Recoverable",
        value: formatFindingEuro(recoverable),
        href: "/app/controls",
        positive: true,
        note: "new",
      });
    }
    if (driver) {
      lines.push({
        label: "Largest driver",
        value: `${driver.territory} · ${formatFindingEuro(driver.amount)}`,
      });
    }
    return {
      title: "Financial Pulse",
      lines: lines.slice(0, 4),
      sinceLines,
    };
  }

  if (role === "finance") {
    return {
      title: "Recovery Queue",
      lines: [
        ...(recoverable > 0
          ? [
              {
                label: "Ready to recover",
                value: formatFindingEuro(recoverable),
                href: "/app/controls",
                positive: true,
              },
            ]
          : []),
        ...(verifiedEuro > 0
          ? [
              {
                label: "Verified",
                value: formatFindingEuro(verifiedEuro),
                href: "/app/value",
                positive: true,
              },
            ]
          : []),
        ...(driver
          ? [
              {
                label: "Largest driver",
                value: `${driver.territory} · ${formatFindingEuro(driver.amount)}`,
              },
            ]
          : []),
        ...(atRisk > 0
          ? [{ label: "Still at risk", value: formatFindingEuro(atRisk) }]
          : []),
      ].slice(0, 4),
      sinceLines,
    };
  }

  if (role === "gm" || role === "fb_operator") {
    const covers = BERLIN_RESERVATION_SUMMARY.forecastCovers;
    const labor = ranked.find((r) => r.finding.territory === "LABOR");
    return {
      title: "Tonight's Service",
      lines: [
        ...(!isGroup
          ? [{ label: "Expected covers", value: String(covers) }]
          : [{ label: "Focus", value: locationName }]),
        {
          label: "Staffing",
          value: labor ? "1 FOH (Front of House) gap" : "Covered",
        },
        {
          label: "Demand",
          value: "Terrace demand elevated",
          href: "/app/forecast",
        },
        {
          label: "Peak window",
          value: "19:00-20:30",
        },
      ].slice(0, 4),
      sinceLines,
    };
  }

  if (role === "coo" || role === "regional") {
    const locsNeeding = new Set(
      ranked.map((r) => r.finding.locationId).filter(Boolean),
    );
    const totalLocs = LOCATIONS.length;
    const top = ranked[0];
    const lines: BriefModuleLine[] = [
      {
        label: "Need attention",
        value: `${locsNeeding.size || ranked.length} of ${totalLocs}`,
        href: "/app/locations",
      },
    ];
    if (top) {
      lines.push({
        label: "Highest risk",
        value: top.finding.locationName ?? locationName,
        href: "/app/locations",
      });
    }
    if (Math.abs(DEMO_FORECAST_EXPOSURE_DELTA) > 0) {
      lines.push({
        label: "Biggest change",
        value: `Forecast exposure ${formatFindingEuro(Math.abs(DEMO_FORECAST_EXPOSURE_DELTA))} ${DEMO_FORECAST_EXPOSURE_DELTA < 0 ? "down" : "up"}`,
        href: "/app/forecast",
      });
    }
    if (totalOpen > 0) {
      lines.push({
        label: "Total exposure",
        value: formatFindingEuro(totalOpen),
      });
    }
    return {
      title: "Location Health",
      lines: lines.slice(0, 4),
      sinceLines,
    };
  }

  if (role === "head_chef" || role === "kitchen") {
    return {
      title: "Kitchen Pulse",
      lines: [
        { label: "Prep", value: "2 changes tonight" },
        { label: "86 risk", value: "Bluefin · watch 20:15" },
        { label: "Allergies", value: "Confirm before fire" },
        { label: "Covers", value: String(BERLIN_RESERVATION_SUMMARY.forecastCovers) },
      ].slice(0, 4),
      sinceLines,
    };
  }

  if (role === "host" || role === "server") {
    return {
      title: "Floor Pulse",
      lines: [
        { label: "Seating", value: "Table open · waitlist ready" },
        { label: "Occasions", value: "Birthdays + allergy tables" },
        { label: "Peak", value: "19:00-20:30" },
        { label: "Covers", value: String(BERLIN_RESERVATION_SUMMARY.forecastCovers) },
      ].slice(0, 4),
      sinceLines,
    };
  }

  // Owner / CEO - portfolio altitude, not floor noise
  return {
    title: "Business Pulse",
    lines: [
      {
        label: "Contribution",
        value: ranked.length === 0 ? "On track" : "Watch",
      },
      ...(ranked.length > 0
        ? [
            {
              label: "Material decisions",
              value: `${ranked.length} open`,
            },
          ]
        : []),
      ...(totalOpen > 0
        ? [{ label: "Exposure", value: formatFindingEuro(totalOpen) }]
        : []),
      ...(verifiedEuro > 0
        ? [
            {
              label: "Verified this period",
              value: formatFindingEuro(verifiedEuro),
              href: "/app/value",
              positive: true,
            },
          ]
        : []),
    ].slice(0, 4),
    sinceLines,
  };
}

function whatChangedLines(
  ranked: RankedFinding[],
  verifiedEuro: number,
  since: SinceLastCheck,
): string[] {
  const { recoverable, atRisk } = moneyTotals(ranked);
  const lines: string[] = [];
  if (verifiedEuro > 0 || since.recoveredValue > 0) {
    lines.push(
      `+${formatFindingEuro(since.recoveredValue || verifiedEuro)} verified`,
    );
  }
  if (recoverable > 0) {
    lines.push(`+${formatFindingEuro(recoverable)} recoverable`);
  }
  if (atRisk > 0) {
    lines.push(`+${formatFindingEuro(atRisk)} exposure`);
  }
  if (since.decisionsReady > 0) {
    lines.push(
      `${since.decisionsReady} new decision${since.decisionsReady === 1 ? "" : "s"} ready`,
    );
  } else if (ranked.length > 0) {
    lines.push(
      `${ranked.length} decision${ranked.length === 1 ? "" : "s"} ready`,
    );
  }
  return lines.slice(0, 4);
}

function handledFor(
  verifiedEuro: number,
  ranked: RankedFinding[],
): HandledItem[] {
  const items: HandledItem[] = [];
  if (verifiedEuro > 0) {
    items.push({
      label: `${formatCurrency(verifiedEuro, "EUR", { compact: false, cents: false })} verified since your last check`,
      detail: "Supplier credit recovered",
      href: "/app/value",
    });
  }
  // Real second item only when a forecast/demand finding exists in scope
  const demand = ranked.find(
    (r) =>
      r.finding.category === "weather_sensitive_demand" ||
      r.finding.territory === "SELL",
  );
  if (demand && verifiedEuro > 0) {
    // Don't invent - only note refresh when SELL exists as open watch elsewhere
  }
  // Use verified scenario presence as the sole proof path; optional forecast note
  // from DEMO delta (real fixture):
  if (Math.abs(DEMO_FORECAST_EXPOSURE_DELTA) > 0 && items.length < 2) {
    items.push({
      label: "Forecast refreshed after demand change",
      detail: `Exposure ${DEMO_FORECAST_EXPOSURE_DELTA < 0 ? "down" : "up"} ${formatFindingEuro(Math.abs(DEMO_FORECAST_EXPOSURE_DELTA))}`,
      href: "/app/forecast",
    });
  }
  return items.slice(0, 2);
}

function exploreFor(role: RoleView): ExploreLink[] {
  if (role === "cfo" || role === "finance") {
    return [
      { label: "Verified Value", href: "/app/value" },
      { label: "Supplier recovery", href: "/app/controls" },
      { label: "Location exposure", href: "/app/locations" },
    ];
  }
  if (role === "coo" || role === "regional") {
    return [
      { label: "Locations", href: "/app/locations" },
      { label: "Forecast", href: "/app/forecast" },
      { label: "Verified Value", href: "/app/value" },
    ];
  }
  if (role === "owner") {
    return [
      { label: "Verified Value", href: "/app/value" },
      { label: "Locations", href: "/app/locations" },
      { label: "Needs attention", href: "/app/findings" },
    ];
  }
  return [
    { label: "Service Map", href: "/app/service" },
    { label: "Forecast", href: "/app/forecast" },
    { label: "Verified Value", href: "/app/value" },
  ];
}

function bucket(
  ranked: RankedFinding[],
  role: RoleView,
  horizon: DecisionHorizon,
): DecisionObject[] {
  return ranked
    .filter((r) => {
      const h =
        r.finding.urgency === "ACT_NOW"
          ? "NOW"
          : r.finding.urgency === "TODAY"
            ? "NEXT"
            : "LATER";
      return h === horizon;
    })
    .slice(0, horizon === "NOW" ? 3 : 2)
    .map((r) => findingToDecision(r.finding, role));
}

export function composeOperatingBrief(input: {
  role: RoleView;
  findings: Finding[];
  locationScope: string;
  locationName: string;
  isGroup: boolean;
  since?: SinceLastCheck;
}): OperatingBrief {
  const profile = getRoleProfile(input.role);
  const ranked = rolePrioritize(
    input.findings,
    input.role,
    input.locationScope,
  );
  const verifiedEuro =
    verifiedFromFindings(input.findings) ||
    getVerifiedValueFromScenarios().verified;
  const { pulse, reason } = pulseFrom(ranked);
  const { hero, breakdown } = heroAndBreakdown(
    input.role,
    ranked,
    verifiedEuro,
  );
  const since =
    input.since ?? computeSinceLastCheck(input.findings);

  const lead =
    ranked.length === 0
      ? "RADR is watching the operation."
      : ranked.length === 1
        ? "RADR has already prepared the next step."
        : "RADR has already prepared the next steps.";

  return {
    role: input.role,
    firstName: profile.firstName,
    greeting: `${demoGreeting()}, ${profile.firstName}.`,
    pulse,
    pulseReason: reason,
    headline: headlineFor(
      input.role,
      ranked,
      pulse,
      input.locationName,
      input.isGroup,
      hero,
    ),
    hero,
    breakdown,
    lead,
    reviewCta: profile.reviewCta,
    now: bucket(ranked, input.role, "NOW"),
    next: bucket(ranked, input.role, "NEXT"),
    later: bucket(ranked, input.role, "LATER"),
    ranked,
    valuePanel: valuePanelFor(
      input.role,
      ranked,
      input.isGroup,
      input.locationName,
      verifiedEuro,
      since,
    ),
    whatChanged: whatChangedLines(ranked, verifiedEuro, since),
    handled: handledFor(verifiedEuro, ranked),
    explore: exploreFor(input.role),
    calmDetail:
      ranked.length === 0
        ? "Everything is operating within expectations."
        : "Everything else is operating within expectations.",
  };
}

/** Re-export for consumers that only need the finding list. */
export function openFindingsForBrief(findings: Finding[]): Finding[] {
  return rolePrioritize(findings, "gm", "loc_ber").map((r) => r.finding);
}
