/**
 * Public marketing demo registry — re-exports canonical Decisions.
 * Components must import economics from here (or lib/radr/decision/demo/canonical).
 * Flagship restaurant Decision = CANON_PEAK (D-1911). D-1842 remains in the library.
 *
 * Structure:
 *   data/demo/decisions.ts  — Decision objects
 *   data/demo/locations.ts  — property map
 *   data/demo/value.ts      — Verified Value helpers + illustrative labels
 *   data/demo/sources.ts    — market source registry
 *   data/demo/patterns.ts   — structural / playbook Decisions
 */

export {
  CANON_TUNA,
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
  CANON_LABOR,
  CANON_SUPPLIER,
  CANON_BESTSELLER,
  type CanonDecision,
  type CanonScenario,
  expectedMetricLabel,
  observedMetricLabel,
  verifiedMetricLabel,
  scenarioMetricCaption,
  verifiedEuro,
  formatScenarioEuro,
} from "@/lib/radr/decision/demo/canonical";

export { formatDecisionMoney } from "@/lib/radr/decision/core";
export {
  DECISION_IDS,
  displayDecisionId,
  DECISION_DISPLAY_IDS,
} from "@/lib/radr/decision/ids";
export {
  DEMO_ILLUSTRATIVE,
  DEMO_PORTFOLIO_ILLUSTRATIVE,
} from "./value";
export { DEMO_LOCATIONS } from "./locations";

import {
  CANON_PEAK,
  CANON_OTA,
  CANON_ORPHAN,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

/** Primary website demo world — restaurant flagship is peak capacity (D-1911). */
export const DEMO_WORLD = {
  currency: "EUR" as const,
  primaryLocation: "Berlin Mitte",
  restaurant: CANON_PEAK,
  hotel: CANON_OTA,
  apartments: CANON_ORPHAN,
  illustrativeLabel: "DEMO · ILLUSTRATIVE",
} as const;

/** Funnel used on Findings marketing page */
export const FINDING_FUNNEL = {
  signals: 10482,
  anomalies: 37,
  findings: 8,
  decisions: 2,
} as const;

/** Control Center attention rollup (marketing) */
export const BRIEF_ATTENTION = {
  needsYou: 2,
  handling: 3,
  watching: 4,
  verifiedTodayEuro: CANON_PEAK.actualProtectedEuro,
} as const;

export function money(n: number): string {
  return formatDecisionMoney(n);
}
