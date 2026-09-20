/**
 * Role-aware hospitality / allergy visibility.
 * Allergy data is sensitive - finance/CFO never see individual alerts.
 */

import type { RoleView } from "@/lib/product/types";
import type { HospitalityAccess } from "./types";

export function hospitalityAccessForRole(role: RoleView): HospitalityAccess {
  switch (role) {
    case "finance":
    case "cfo":
      return {
        canSeeNamedGuests: false,
        canSeeOccasions: false,
        canSeeServiceRequirements: false,
        canSeeAllergyDetail: false,
        canSeeKitchenSafety: false,
        aggregatesOnly: true,
      };
    case "owner":
      return {
        canSeeNamedGuests: false,
        canSeeOccasions: true,
        canSeeServiceRequirements: false,
        canSeeAllergyDetail: false,
        canSeeKitchenSafety: false,
        aggregatesOnly: true,
      };
    case "gm":
    case "fb_operator":
    case "head_chef":
    case "kitchen":
    case "host":
    case "server":
      return {
        canSeeNamedGuests: role !== "kitchen",
        canSeeOccasions: role !== "kitchen",
        canSeeServiceRequirements: role !== "kitchen",
        canSeeAllergyDetail: true,
        canSeeKitchenSafety:
          role === "gm" ||
          role === "fb_operator" ||
          role === "head_chef" ||
          role === "kitchen",
        aggregatesOnly: false,
      };
    case "coo":
    case "regional":
      return {
        canSeeNamedGuests: true,
        canSeeOccasions: true,
        canSeeServiceRequirements: true,
        canSeeAllergyDetail: true,
        canSeeKitchenSafety: true,
        aggregatesOnly: false,
      };
    default:
      return {
        canSeeNamedGuests: false,
        canSeeOccasions: false,
        canSeeServiceRequirements: false,
        canSeeAllergyDetail: false,
        canSeeKitchenSafety: false,
        aggregatesOnly: true,
      };
  }
}
