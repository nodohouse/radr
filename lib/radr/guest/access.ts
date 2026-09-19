/**
 * Role-aware guest data visibility.
 */

import type { RoleView } from "@/lib/product/types";
import type { GuestValueAccess } from "./types";

export function guestValueAccessForRole(role: RoleView): GuestValueAccess {
  switch (role) {
    case "finance":
      return {
        canSeeNamedGuests: false,
        canSeeServiceNotes: false,
        aggregatesOnly: true,
      };
    case "cfo":
    case "owner":
      return {
        canSeeNamedGuests: false,
        canSeeServiceNotes: false,
        aggregatesOnly: true,
      };
    case "gm":
    case "fb_operator":
    case "host":
    case "server":
    case "head_chef":
      return {
        canSeeNamedGuests: true,
        canSeeServiceNotes: role === "gm" || role === "fb_operator" || role === "host",
        aggregatesOnly: false,
      };
    case "kitchen":
      return {
        canSeeNamedGuests: false,
        canSeeServiceNotes: false,
        aggregatesOnly: true,
      };
    case "coo":
    case "regional":
      return {
        canSeeNamedGuests: true,
        canSeeServiceNotes: false,
        aggregatesOnly: false,
      };
    default:
      return {
        canSeeNamedGuests: false,
        canSeeServiceNotes: false,
        aggregatesOnly: true,
      };
  }
}
