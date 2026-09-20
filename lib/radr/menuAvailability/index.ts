/**
 * Menu Availability Risk - ingredient → revenue intelligence.
 * @see ./CONTRACT.md
 */

export type * from "./types";
export {
  computeRevenueExposure,
  recomputeMenuAvailabilityRisk,
  MENU_RISK_MATERIALITY_EUR,
} from "./exposure";
export { demoMenuAvailabilityRisk, DEMO_MENU_GRAPH } from "./demo";
export { isMenuAvailabilityEnabled } from "./access";
export {
  computeMenuCriticality,
} from "./criticality";
export type {
  MenuCriticality,
  MenuItemPerformance,
  MenuCriticalityLevel,
} from "./criticality";
export {
  rankSourcingOptions,
  demoBluefinSourcingDecision,
} from "./sourcingDecision";
export type { SourcingOption, SourcingDecision } from "./sourcingDecision";
