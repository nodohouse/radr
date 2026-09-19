/**
 * Marketing Decision Object — re-exports the universal Decision.
 */
export type {
  Decision as DecisionObject,
  DecisionCardState as DecisionState,
  DecisionVertical,
  DecisionOption,
  DecisionEvidence,
  DecisionWhy as WhyBasis,
  DecisionMoney,
  ValueKind as MoneyLabel,
  Horizon as MoneyHorizon,
} from "@/lib/radr/decision/core";

export {
  formatDecisionMoney,
  moneyCaption,
  verifiedCaption,
  horizonLabel,
} from "@/lib/radr/decision/core";
