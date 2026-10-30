/**
 * Role presentation translation — same truth, different language.
 * GM must not need CFO vocabulary.
 */

import type { RoleView } from "@/lib/product/types";

export type TranslatedMetric = {
  role: RoleView | "chef" | "revenue";
  technical: string;
  plain: string;
};

export function translateForRole(
  role: RoleView,
  key: string,
): TranslatedMetric | null {
  const map: Record<string, Omit<TranslatedMetric, "role">> = {
    contribution_behind: {
      technical: "Contribution −€4,780 vs plan (−1.8pp)",
      plain:
        "You're about €4,780 below expected profit because food cost and delivery mix are higher than plan.",
    },
    labor_efficiency: {
      technical: "Labor +0.8pp vs target",
      plain:
        "We're carrying roughly one more person than demand requires between 21:00–22:00.",
    },
    kitchen_pressure: {
      technical: "Kitchen 92% → 94% projected",
      plain:
        "The kitchen is about to get overloaded. Waiting 12 minutes protects second turns.",
    },
    revenue_ahead: {
      technical: "Revenue +3.2% vs expected-now",
      plain: "Sales are ahead of where we usually are at this time.",
    },
    tuna_stockout: {
      technical: "Inventory depletion P84 · 21:18",
      plain: "Tuna is likely to run out around 21:15 if pace holds.",
    },
    staffing_gap: {
      technical: "Required 12.4 FTE · scheduled 10 · −0.82σ",
      plain: "Add one runner and one line cook from 19:00–21:00.",
    },
  };

  const row = map[key];
  if (!row) return null;
  return { role, ...row };
}

export function plainLine(role: RoleView, key: string): string {
  const t = translateForRole(role, key);
  if (!t) return key;
  if (role === "cfo" || role === "owner") return t.technical;
  return t.plain;
}

/** Attention rollup — must match Control Center compression (SSOT). */
export type AttentionBudget = {
  signalsReviewed: number;
  meaningfulChanges: number;
  watching: number;
  decisions: number;
  gmSees: string;
};

/**
 * Live Focus attention line — derived from the same disposition parts as
 * Control Center (`executiveCompressionLine`), never a legacy hardcoded 145.
 */
export function berlinAttentionBudget(input: {
  needJudgment: number;
  handling?: number;
  watching?: number;
  withinExpectation?: number;
}): AttentionBudget {
  const withinExpectation = input.withinExpectation ?? 141;
  const handling = input.handling ?? 1;
  const watching = input.watching ?? 1;
  const needJudgment = Math.max(0, input.needJudgment);
  const meaningfulChanges =
    withinExpectation + handling + watching + needJudgment;
  return {
    signalsReviewed: 2_481,
    meaningfulChanges,
    watching,
    decisions: needJudgment,
    gmSees:
      needJudgment === 0
        ? "Clear"
        : `${needJudgment} signal${needJudgment === 1 ? "" : "s"} need${needJudgment === 1 ? "s" : ""} your judgment`,
  };
}
