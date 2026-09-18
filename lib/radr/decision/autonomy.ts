/**
 * Autonomy is earned per decision type — never fake execution.
 */

export type AutonomyLevel =
  | 0 // OBSERVE
  | 1 // RECOMMEND
  | 2 // PREPARE
  | 3 // ONE-TAP APPROVAL
  | 4 // RULE-BASED AUTO-EXECUTION
  | 5; // TRUSTED AUTONOMY

export type DecisionAutonomyPolicy = {
  decisionType: string;
  level: AutonomyLevel;
  risk: "low" | "medium" | "high";
  reversibility: "easy" | "moderate" | "hard";
  historicalSuccessRate?: number;
  nHistorical?: number;
  neverFullyAutonomous: boolean;
  reason: string;
};

export const NEVER_AUTONOMOUS_TYPES = new Set([
  "allergy_confirmation",
  "employee_termination",
  "major_supplier_payment",
  "high_value_guest_compensation",
]);

export function autonomyLabel(level: AutonomyLevel): string {
  switch (level) {
    case 0:
      return "Observe";
    case 1:
      return "Recommend";
    case 2:
      return "Prepare";
    case 3:
      return "One-tap approval";
    case 4:
      return "Rule-based auto-execution";
    case 5:
      return "Trusted autonomy";
  }
}

export function resolveAutonomyLevel(
  policy: DecisionAutonomyPolicy,
): AutonomyLevel {
  if (
    policy.neverFullyAutonomous ||
    NEVER_AUTONOMOUS_TYPES.has(policy.decisionType)
  ) {
    return Math.min(policy.level, 3) as AutonomyLevel;
  }
  return policy.level;
}
