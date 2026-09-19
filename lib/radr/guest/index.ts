/**
 * Guest Value - returning revenue & service context.
 * @see ./CONTRACT.md
 */

export type * from "./types";
export { guestValueAccessForRole } from "./access";
export {
  composeGuestTonightBrief,
  formatGuestTiers,
} from "./brief";
export type { GuestTonightBrief } from "./brief";
export {
  demoBerlinGuestsTonight,
  DEMO_GUEST_TONIGHT_AGG,
} from "./demoTonight";
export {
  floorGuestByReservationId,
  guestIsFloorVip,
  guestHasFloorAllergy,
} from "./floorGuest";
export type { FloorGuestMemory, FloorAllergy } from "./floorGuest";
