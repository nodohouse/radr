/**
 * Location-specific Decision Memory — conditions → option outcomes.
 */

export type DecisionMemoryCondition = {
  key: string;
  op: "gt" | "gte" | "lt" | "lte" | "eq";
  value: number | string;
};

export type DecisionMemoryOptionStat = {
  optionId: string;
  label: string;
  successRate: number; // 0–1
  avgProtectedEuro: number;
  n: number;
};

export type DecisionMemoryEntry = {
  id: string;
  locationId: string;
  locationLabel: string;
  decisionType: string;
  conditions: DecisionMemoryCondition[];
  optionStats: DecisionMemoryOptionStat[];
  recommendedOptionId: string;
  note: string;
};

/** Rank options by historical success at this location. */
export function rankOptionsFromMemory(
  entry: DecisionMemoryEntry,
): DecisionMemoryOptionStat[] {
  return [...entry.optionStats].sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate;
    return b.avgProtectedEuro - a.avgProtectedEuro;
  });
}
