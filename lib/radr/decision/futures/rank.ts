/**
 * Risk-adjusted scenario ranking.
 * Max expected value is not always the pick.
 */

import type { DecisionObjective, Scenario } from "./types";

function impactScore(i: Scenario["operationalRisk"]): number {
  if (i === "none") return 0;
  if (i === "low") return 1;
  if (i === "medium") return 2;
  return 3;
}

/**
 * Score = expected contribution
 *   − riskPenalty * operationalRisk
 *   − guestPenalty * guestImpact
 *   − downsideGap * riskAversion
 * Blocked scenarios rank last.
 */
export function scoreScenario(
  s: Scenario,
  objective: DecisionObjective,
): number {
  if (s.constraintViolations.some((v) => v.severity === "block")) {
    return -1e12;
  }

  const riskW =
    objective.riskAversion === "high"
      ? 180
      : objective.riskAversion === "medium"
        ? 110
        : 60;
  const guestW = objective.primary === "guest" ? 140 : 70;
  const downsideGap = Math.max(0, s.expectedContribution - s.downside);
  const downsideW =
    objective.riskAversion === "high"
      ? 0.35
      : objective.riskAversion === "medium"
        ? 0.22
        : 0.1;

  let score =
    s.expectedContribution -
    riskW * impactScore(s.operationalRisk) -
    guestW * impactScore(s.expectedGuestImpact) -
    downsideW * downsideGap;

  if (objective.primary === "service") {
    score -= 40 * impactScore(s.expectedCapacityImpact);
  }

  // Slight preference for confidence
  score += s.confidence * 0.8;

  return score;
}

export function rankScenarios(
  scenarios: Scenario[],
  objective: DecisionObjective,
): Scenario[] {
  const scored = scenarios.map((s) => ({
    s,
    score: scoreScenario(s, objective),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.map((row, i) => ({
    ...row.s,
    rank: i + 1,
    recommended: i === 0,
  }));
}

export function pickRecommended(
  scenarios: Scenario[],
  objective: DecisionObjective,
): Scenario {
  const ranked = rankScenarios(scenarios, objective);
  return ranked[0]!;
}
