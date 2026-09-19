/**
 * Micro-opportunity engine - small economic moves before / during service.
 */

export type MicroOpportunity = {
  id: string;
  kind:
    | "terrace"
    | "staffing"
    | "menu_prep"
    | "ingredient"
    | "inventory"
    | "reservations"
    | "walk_ins"
    | "delivery"
    | "kitchen_hours"
    | "discounting";
  title: string;
  recommendation: string;
  expectedUpside: number;
  cost: number;
  netExpectedContribution: number;
  confidence: "low" | "medium" | "high";
  deadline: string;
  drivers: string[];
};

export function rankMicroOpportunities(
  items: MicroOpportunity[],
): MicroOpportunity[] {
  return [...items].sort(
    (a, b) => b.netExpectedContribution - a.netExpectedContribution,
  );
}
