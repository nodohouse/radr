/**
 * Homepage decision data — same IDs as /app (lib/radr/decision/catalog).
 */
export {
  HERO_BY_VERTICAL as HERO_DECISIONS,
  VERIFIED_BY_VERTICAL as VERIFIED_DECISIONS,
  HIDDEN_BY_VERTICAL as HIDDEN_DECISIONS,
  RAIN_SIMULATE,
  simulateFor,
  toDecisionVertical,
  toHeroVertical,
  DECISION_IDS,
} from "@/lib/radr/decision/catalog";

export type { DecisionVertical as HomepageVertical } from "@/lib/radr/decision/core";
