/**
 * RADR Knowledge — how much RADR has learned this operation.
 * Not a cheap game: communicates operating memory maturity.
 */

export const KNOWLEDGE_LEVELS = [
  "STARTING",
  "LEARNING",
  "ADAPTED",
  "HIGH_CONFIDENCE",
  "TRUSTED",
] as const;

export type KnowledgeLevel = (typeof KNOWLEDGE_LEVELS)[number];

export type KnowledgeSnapshot = {
  level: KnowledgeLevel;
  label: string;
  summary: string;
  verifiedDecisionCount: number;
  decisionCount: number;
  playbookCount: number;
  /** 0–1 share of decisions that still need a human */
  humanDecisionShare?: number;
  forecastErrorPct?: number;
};

export function knowledgeLabel(level: KnowledgeLevel): string {
  switch (level) {
    case "STARTING":
      return "Starting";
    case "LEARNING":
      return "Learning";
    case "ADAPTED":
      return "Adapted";
    case "HIGH_CONFIDENCE":
      return "High confidence";
    case "TRUSTED":
      return "Trusted";
  }
}

/**
 * Derive knowledge from verified history — location-first.
 */
export function deriveKnowledgeLevel(input: {
  verifiedDecisionCount: number;
  decisionCount: number;
  playbookCount: number;
  forecastErrorPct?: number;
  automationEligiblePlaybooks?: number;
}): KnowledgeLevel {
  const { verifiedDecisionCount: v, playbookCount: p } = input;
  const err = input.forecastErrorPct;
  const auto = input.automationEligiblePlaybooks ?? 0;

  if (v >= 200 && p >= 12 && (err == null || err <= 8) && auto >= 3) {
    return "TRUSTED";
  }
  if (v >= 80 && p >= 6 && (err == null || err <= 12)) {
    return "HIGH_CONFIDENCE";
  }
  if (v >= 25 && p >= 2) {
    return "ADAPTED";
  }
  if (v >= 5 || input.decisionCount >= 10) {
    return "LEARNING";
  }
  return "STARTING";
}

export function knowledgeSummary(level: KnowledgeLevel): string {
  switch (level) {
    case "STARTING":
      return "Limited operating history. RADR learns from every closed decision.";
    case "LEARNING":
      return "Patterns are beginning to emerge at this location.";
    case "ADAPTED":
      return "Models are calibrated to this property’s verified history.";
    case "HIGH_CONFIDENCE":
      return "Substantial verified decision history. Recommendations compound.";
    case "TRUSTED":
      return "Low-risk playbooks eligible for automation under policy.";
  }
}
