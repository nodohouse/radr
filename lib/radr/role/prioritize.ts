/**
 * Role-aware finding prioritization - same findings, different order.
 * No invented money: scores only reweight existing priorityScore + fields.
 */

import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import { attentionNowFindings } from "@/lib/radr/valueSemantics";
import { getRoleProfile } from "@/lib/radr/role/profiles";
import { moneyKindOfFinding } from "@/lib/radr/valueSemantics";

export type RankedFinding = {
  finding: Finding;
  roleScore: number;
  whyNow: string;
};

function isGroupishScope(scope: string): boolean {
  return scope === "all" || scope.startsWith("region_");
}

/**
 * Explain timing from existing finding fields only.
 */
export function whyNowForFinding(f: Finding, role: RoleView): string {
  const kind = moneyKindOfFinding(f);
  const when = f.timeframe?.label;

  if (f.urgency === "ACT_NOW") {
    if (f.territory === "LABOR") {
      return when
        ? `Service window ${when} is approaching - staffing gap is still open.`
        : "Peak service is approaching and the staffing gap is still open.";
    }
    if (kind === "recoverable") {
      return "Recoverable value is ready - delay increases write-off risk.";
    }
    return when
      ? `Needs a decision for ${when}.`
      : "Needs a decision in the current operating window.";
  }

  if (f.urgency === "TODAY") {
    if (f.territory === "BUY" || kind === "recoverable") {
      return "Supplier variance is still open this week.";
    }
    if (f.territory === "SELL") {
      return when
        ? `Demand or inventory moved for ${when}.`
        : "Sell-side conditions changed for tonight.";
    }
    return "Material enough to resolve today - not yet critical.";
  }

  if (role === "cfo" || role === "finance") {
    return "Tracked for financial exposure - not interrupting unless it escalates.";
  }
  if (role === "coo" || role === "regional") {
    return "Emerging pattern - watch across locations.";
  }
  return "On the watchlist - no interrupt required yet.";
}

function roleScore(f: Finding, role: RoleView, scope: string): number {
  const w = getRoleProfile(role).findingWeights;
  const terr = w.territory[f.territory] ?? 1;
  const urg = w.urgency[f.urgency] ?? 1;
  const moneyNorm = Math.min(2.5, 1 + f.financialImpact.primaryValue / 500);
  const groupBoost =
    isGroupishScope(scope) || !f.locationId ? w.groupScope : 1;
  const kind = moneyKindOfFinding(f);
  let kindBoost = 1;
  if (role === "finance" || role === "cfo") {
    if (kind === "recoverable") kindBoost = 1.25;
    if (kind === "exposure") kindBoost = 1.1;
  }
  if (role === "gm" || role === "fb_operator") {
    if (f.urgency === "WATCH") kindBoost = 0.85;
  }
  if (role === "owner") {
    // Prefer fewer, material items
    kindBoost = f.financialImpact.primaryValue >= 200 ? 1.15 : 0.75;
  }

  return (
    f.priorityScore *
    terr *
    urg *
    (1 + (moneyNorm - 1) * (w.money - 1)) *
    groupBoost *
    kindBoost
  );
}

/**
 * Rank open attention findings for a role. Preserves finding identity.
 */
export function rolePrioritize(
  findings: Finding[],
  role: RoleView,
  scope: string,
): RankedFinding[] {
  const open = attentionNowFindings(findings);
  return open
    .map((finding) => ({
      finding,
      roleScore: roleScore(finding, role, scope),
      whyNow: whyNowForFinding(finding, role),
    }))
    .sort((a, b) => b.roleScore - a.roleScore);
}
