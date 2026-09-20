/**
 * Internal AttentionScore — rank + suppress into attention bands.
 * Not user-visible; feeds roleAttention / cockpit budget.
 */

import type { Finding } from "@/lib/radr/domain";
import { operatorAttentionState } from "@/lib/radr/valueSemantics";

export type AttentionBand =
  | "NEEDS_YOU"
  | "HANDLING"
  | "WATCHING"
  | "HANDLED"
  | "SUPPRESSED";

export type AttentionScoreResult = {
  score: number;
  band: AttentionBand;
  reasons: string[];
};

/**
 * Score a finding for attention priority.
 * Higher = more deserving of scarce human attention.
 */
export function scoreFindingAttention(finding: Finding): AttentionScoreResult {
  const reasons: string[] = [];
  let score = 0;

  const state = operatorAttentionState(finding);
  if (state === "VERIFIED" || state === "WAITING" || state === "WAITING_EXTERNAL") {
    return { score: 0, band: "HANDLED", reasons: ["already resolved or waiting"] };
  }
  if (state === "RADR_HANDLING" || state === "PENDING_VERIFICATION") {
    return { score: 12, band: "HANDLING", reasons: ["RADR is handling"] };
  }
  if (state === "WATCH") {
    return { score: 8, band: "WATCHING", reasons: ["watch only"] };
  }

  const financial = finding.financialImpact?.primaryValue ?? 0;
  if (financial >= 500) {
    score += 40;
    reasons.push("material financial");
  } else if (financial >= 200) {
    score += 28;
    reasons.push("notable financial");
  } else if (financial >= 80) {
    score += 16;
    reasons.push("modest financial");
  } else if (financial > 0) {
    score += 6;
  }

  if (finding.urgency === "ACT_NOW") {
    score += 35;
    reasons.push("act now");
  } else if (finding.urgency === "TODAY") {
    score += 22;
    reasons.push("today");
  } else if (finding.urgency === "WATCH") {
    score += 4;
  }

  if (finding.confidenceScore >= 80) score += 10;
  else if (finding.confidenceScore >= 55) score += 5;
  else {
    score -= 8;
    reasons.push("low confidence");
  }

  // Soft suppress noise: low value + not urgent
  if (
    financial < 50 &&
    finding.urgency !== "ACT_NOW" &&
    finding.urgency !== "TODAY"
  ) {
    return {
      score: Math.max(score - 20, 0),
      band: "SUPPRESSED",
      reasons: [...reasons, "below attention threshold"],
    };
  }

  if (state === "READY_FOR_APPROVAL") {
    score += 15;
    reasons.push("ready for approval");
  }

  const band: AttentionBand =
    score >= 24 ? "NEEDS_YOU" : score >= 12 ? "WATCHING" : "SUPPRESSED";

  return { score, band, reasons };
}

/**
 * Rank eligible findings and keep only the top `max` by AttentionScore.
 * Call after role / state filters — does not re-suppress.
 */
export function budgetNeedsYouFindings(
  findings: Finding[],
  maxAttention = 3,
): Finding[] {
  return findings
    .map((f) => ({ finding: f, ...scoreFindingAttention(f) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxAttention)
    .map((r) => r.finding);
}

export const DEFAULT_MAX_ATTENTION = 3;
