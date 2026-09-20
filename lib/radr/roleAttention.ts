/**
 * Single attention source of truth for Control Center, top bar, and nav.
 * Same role + scope → same needsYou / approvals counts everywhere.
 */

import type { Finding } from "@/lib/radr/domain";
import type { RoleView } from "@/lib/product/types";
import { findingsForScope } from "@/lib/radr/findings";
import {
  attentionNowFindings,
  operatorAttentionState,
  verifiedFromFindings,
} from "@/lib/radr/valueSemantics";
import { rolePrioritize } from "@/lib/radr/role/prioritize";
import { formatEuro } from "@/lib/radr/money";
import {
  budgetNeedsYouFindings,
  DEFAULT_MAX_ATTENTION,
  scoreFindingAttention,
} from "@/lib/radr/attention/score";

export type RoleAttention = {
  needsYou: number;
  readyForApproval: number;
  /** Open attention findings for this role (needs you only). */
  findings: Finding[];
  /** RADR is handling (not needing human yet). */
  handling: Finding[];
  /** Quiet watch — not in the needs-you budget. */
  watching: Finding[];
  /** Verified since / attributable outcomes (ids only for chrome). */
  verifiedCount: number;
  headline: string;
  /** Short line for top chrome, e.g. "€184,00 verified today" */
  verifiedLine: string | null;
  verifiedToday: number;
};

export function needsYouHeadline(n: number): string {
  if (n <= 0) return "Nothing needs you.";
  if (n === 1) return "1 thing needs you.";
  return `${n} things need you.`;
}

/**
 * Findings that require this role's judgment now - not WATCH, not handled.
 * Attention budget applied via `maxAttention` (default 3).
 */
export function roleNeedsYouFindings(
  findings: Finding[],
  role: RoleView,
  scope: string,
  maxAttention: number = DEFAULT_MAX_ATTENTION,
): Finding[] {
  const ranked = rolePrioritize(findings, role, scope);
  const eligible = ranked
    .filter(({ finding }) => {
      const state = operatorAttentionState(finding);
      if (
        state === "WATCH" ||
        state === "VERIFIED" ||
        state === "WAITING" ||
        state === "WAITING_EXTERNAL" ||
        state === "PENDING_VERIFICATION" ||
        state === "RADR_HANDLING"
      ) {
        return false;
      }
      if (role === "owner") {
        return finding.financialImpact.primaryValue >= 200;
      }
      if (role === "cfo" || role === "finance") {
        return (
          finding.urgency === "ACT_NOW" ||
          finding.urgency === "TODAY" ||
          state === "READY_FOR_APPROVAL"
        );
      }
      return finding.urgency === "ACT_NOW" || finding.urgency === "TODAY";
    })
    .map((r) => r.finding);

  return budgetNeedsYouFindings(eligible, maxAttention);
}

export function roleReadyForApprovalFindings(
  findings: Finding[],
  role: RoleView,
): Finding[] {
  if (role === "host" || role === "server" || role === "kitchen") return [];
  return attentionNowFindings(findings).filter(
    (f) => operatorAttentionState(f) === "READY_FOR_APPROVAL",
  );
}

export function composeRoleAttention(input: {
  findings?: Finding[];
  role: RoleView;
  scope: string;
  maxAttention?: number;
}): RoleAttention {
  const findings = input.findings ?? findingsForScope(input.scope);
  const needs = roleNeedsYouFindings(
    findings,
    input.role,
    input.scope,
    input.maxAttention ?? DEFAULT_MAX_ATTENTION,
  );
  const readyForApproval = roleReadyForApprovalFindings(
    findings,
    input.role,
  ).length;

  const verifiedToday = verifiedFromFindings(findings);
  const verifiedLine =
    verifiedToday > 0 ? `${formatEuro(verifiedToday)} verified today` : null;

  const handling: Finding[] = [];
  const watching: Finding[] = [];
  let verifiedCount = 0;
  for (const f of findings) {
    const { band } = scoreFindingAttention(f);
    if (band === "HANDLING") handling.push(f);
    else if (band === "WATCHING") watching.push(f);
    else if (band === "HANDLED") verifiedCount += 1;
  }

  return {
    needsYou: needs.length,
    readyForApproval,
    findings: needs,
    handling,
    watching,
    verifiedCount,
    headline: needsYouHeadline(needs.length),
    verifiedLine,
    verifiedToday,
  };
}

/** Nav / top-bar convenience - always the same numbers. */
export function attentionForScope(
  scope: string,
  role: RoleView,
): RoleAttention {
  return composeRoleAttention({ role, scope });
}
