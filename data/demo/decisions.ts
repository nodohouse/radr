/**
 * Demo economics registry — re-export hub for marketing surfaces.
 * Prefer importing Decisions from here or from lib/radr/decision/demo/canonical.
 *
 * Canonical flagship Decisions:
 * - D-1911 restaurant peak capacity (CANON_PEAK)
 * - D-2201 hotel channel / premium inventory (CANON_OTA)
 * - D-3104 orphan night (CANON_ORPHAN) — gross ≠ net ≠ verified incremental
 * - D-4102 supplier / usage (CANON_SUPPLIER)
 * - D-5208 group pattern (CANON_PLAYBOOK)
 * - D-1855 cross-domain bestseller (CANON_BESTSELLER)
 *
 * D-1842 remains library only — not pricing / homepage flagship proof.
 */

export {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_SUPPLIER,
  CANON_LABOR,
  CANON_PLAYBOOK,
  CANON_BESTSELLER,
  CANON_TUNA,
  formatScenarioEuro,
  verifiedEuro,
  expectedMetricLabel,
  observedMetricLabel,
  verifiedMetricLabel,
  scenarioMetricCaption,
  type CanonDecision,
  type CanonScenario,
} from "@/lib/radr/decision/demo/canonical";

export type { ScenarioValue, ScenarioMetricType } from "@/lib/radr/decision/economics/scenarioValue";
export { scenarioValueCaption, METRIC_TYPE_LABEL } from "@/lib/radr/decision/economics/scenarioValue";
export {
  DEMO_ILLUSTRATIVE,
  DEMO_PORTFOLIO_ILLUSTRATIVE,
} from "./value";
export { DEMO_LOCATIONS } from "./locations";
