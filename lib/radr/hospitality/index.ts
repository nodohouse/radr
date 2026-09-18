/**
 * Hospitality Intelligence - occasions, requirements, allergy safety.
 * @see ./CONTRACT.md
 */

export type * from "./types";
export { hospitalityAccessForRole } from "./access";
export {
  composeHospitalityTonightBrief,
  menuGuidanceForAllergy,
} from "./brief";
export type { HospitalityTonightBrief } from "./brief";
export {
  DEMO_ALLERGY_ALERTS,
  DEMO_DIETARY_NOTES,
  DEMO_HOSPITALITY_AGG,
  DEMO_SERVICE_MOMENTS,
  DEMO_SERVICE_REQUIREMENTS,
} from "./demoTonight";
export {
  countContainment,
  menuLinesForAllergen,
} from "./menuAllergens";
