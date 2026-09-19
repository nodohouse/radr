/**
 * Floor ↔ guest bridge for Service Map (demo).
 * Lookup by reservationId · no PII beyond synthetic fixtures.
 */

import {
  demoBerlinGuestsTonight,
  type DemoGuestRecord,
} from "./demoTonight";
import type { GuestTier } from "./types";

const VIP_TIERS: GuestTier[] = ["HIGH_VALUE", "FREQUENT"];

export type FloorAllergy = {
  /** Guest-stated substance / condition line */
  label: string;
  /** Explicit FOH / kitchen protocol */
  protocol: string;
};

export type FloorGuestMemory = {
  guest: DemoGuestRecord;
  isVip: boolean;
  /** One line for tip / panel · e.g. "Usually Tuna Tataki · Dom Pérignon" */
  memoryLine: string;
  serveCue: string;
  allergies: FloorAllergy[];
};

function isVipTiers(tiers: GuestTier[]): boolean {
  return tiers.some((t) => VIP_TIERS.includes(t));
}

function memoryLineFor(guest: DemoGuestRecord): string {
  const dishes = guest.value.topDishes.slice(0, 2);
  if (dishes.length === 0) {
    return guest.value.why[0] ?? "Returning guest";
  }
  return `Usually ${dishes.join(" · ")}`;
}

function serveCueFor(guest: DemoGuestRecord): string {
  const dishes = guest.value.topDishes.slice(0, 2);
  if (dishes.length === 0) {
    return "Ready when they sit";
  }
  return `Ready when they sit · ${dishes.join(" · ")}`;
}

function allergiesFor(guest: DemoGuestRecord): FloorAllergy[] {
  return guest.notes
    .filter((n) => n.kind === "allergy")
    .map((n) => ({
      label: n.note,
      protocol:
        n.protocol ??
        "Change gloves · dedicated board · confirm with Expo before plating",
    }));
}

/** Index demo guests by reservationId (Berlin floor moments). */
export function floorGuestByReservationId(
  reservationId: string | undefined | null,
): FloorGuestMemory | null {
  if (!reservationId) return null;
  const guest = demoBerlinGuestsTonight().find(
    (g) => g.booking.reservationId === reservationId,
  );
  if (!guest) return null;
  return {
    guest,
    isVip: isVipTiers(guest.value.tiers),
    memoryLine: memoryLineFor(guest),
    serveCue: serveCueFor(guest),
    allergies: allergiesFor(guest),
  };
}

export function guestIsFloorVip(
  reservationId: string | undefined | null,
): boolean {
  return floorGuestByReservationId(reservationId)?.isVip === true;
}

export function guestHasFloorAllergy(
  reservationId: string | undefined | null,
): boolean {
  const mem = floorGuestByReservationId(reservationId);
  return (mem?.allergies.length ?? 0) > 0;
}
