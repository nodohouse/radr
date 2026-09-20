/**
 * Verified Value helpers + metric labels for marketing surfaces.
 */

export {
  verifiedEuro,
  formatScenarioEuro,
  expectedMetricLabel,
  observedMetricLabel,
  verifiedMetricLabel,
  scenarioMetricCaption,
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
} from "@/lib/radr/decision/demo/canonical";

export {
  scenarioValueCaption,
  METRIC_TYPE_LABEL,
  type ScenarioValue,
  type ScenarioMetricType,
} from "@/lib/radr/decision/economics/scenarioValue";

/** Public honesty label for first-exposure demo economics. */
export const DEMO_ILLUSTRATIVE = "DEMO · ILLUSTRATIVE" as const;
export const DEMO_PORTFOLIO_ILLUSTRATIVE =
  "DEMO PORTFOLIO · ILLUSTRATIVE" as const;
