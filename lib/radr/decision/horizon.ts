/**
 * Decision horizon — when value is perishable vs structural.
 */

export const DECISION_HORIZONS = [
  "NOW",
  "TODAY",
  "THIS_WEEK",
  "THIS_MONTH",
  "STRUCTURAL",
] as const;

export type DecisionRecordHorizon = (typeof DECISION_HORIZONS)[number];

export function horizonLabel(h: DecisionRecordHorizon): string {
  switch (h) {
    case "NOW":
      return "Now";
    case "TODAY":
      return "Today";
    case "THIS_WEEK":
      return "This week";
    case "THIS_MONTH":
      return "This month";
    case "STRUCTURAL":
      return "Structural";
  }
}

/** GM default: operational horizons. */
export const GM_DEFAULT_HORIZONS: DecisionRecordHorizon[] = [
  "NOW",
  "TODAY",
];

export function matchesHorizonFilter(
  horizon: DecisionRecordHorizon,
  filter: DecisionRecordHorizon | "ALL",
): boolean {
  if (filter === "ALL") return true;
  return horizon === filter;
}
