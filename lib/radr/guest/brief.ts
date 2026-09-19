/**
 * Compose tonight guest brief - material signals only.
 */

import type { RoleView } from "@/lib/product/types";
import { guestValueAccessForRole } from "./access";
import {
  DEMO_GUEST_TONIGHT_AGG,
  demoBerlinGuestsTonight,
  type DemoGuestRecord,
} from "./demoTonight";
import type { GuestTier } from "./types";

export type GuestTonightBrief = {
  material: boolean;
  reservedCovers: number;
  returningGuests: number;
  firstTimeGuests: number;
  expectedReturningRevenue: number;
  expectedFirstTimeRevenue: number;
  returningRevenueSharePct: number;
  highValueReturning: number;
  lapsedReturning90d: number;
  serviceNotesNeedingAttention: number;
  bluefinAffinityGuests: number;
  bluefinAffinityExpectedValue: number;
  /** Named guests - null when role is aggregates-only. */
  spotlight: DemoGuestRecord[] | null;
  attentionNotes: { guestLabel: string; note: string }[] | null;
  access: ReturnType<typeof guestValueAccessForRole>;
};

function tierLabel(t: GuestTier): string {
  switch (t) {
    case "HIGH_VALUE":
      return "High-value";
    case "FREQUENT":
      return "Frequent";
    case "RETURNING":
      return "Returning";
    case "LAPSED":
      return "Lapsed";
    case "FIRST_TIME":
      return "First-time";
    case "GROUP_ORGANIZER":
      return "Group organizer";
  }
}

export function formatGuestTiers(tiers: GuestTier[]): string {
  return tiers.map(tierLabel).join(" · ");
}

export function composeGuestTonightBrief(
  role: RoleView,
): GuestTonightBrief {
  const access = guestValueAccessForRole(role);
  const guests = demoBerlinGuestsTonight();
  const agg = DEMO_GUEST_TONIGHT_AGG;

  const highValue = guests
    .filter((g) => g.value.tiers.includes("HIGH_VALUE"))
    .sort((a, b) => b.value.lifetimeSpend - a.value.lifetimeSpend);

  const material =
    agg.highValueReturning >= 3 ||
    agg.serviceNotesNeedingAttention > 0 ||
    agg.lapsedReturning90d > 0 ||
    agg.expectedReturningRevenue >= 2000;

  const spotlight = access.canSeeNamedGuests
    ? highValue.slice(0, 9)
    : null;

  const attentionNotes =
    access.canSeeServiceNotes
      ? guests
          .flatMap((g) =>
            g.notes
              .filter((n) => n.needsAttentionTonight)
              .map((n) => ({
                guestLabel: g.identity.displayName,
                note: n.note,
              })),
          )
          .slice(0, 4)
      : null;

  return {
    material,
    reservedCovers: agg.reservedCovers,
    returningGuests: agg.returningGuests,
    firstTimeGuests: agg.firstTimeGuests,
    expectedReturningRevenue: agg.expectedReturningRevenue,
    expectedFirstTimeRevenue: agg.expectedFirstTimeRevenue,
    returningRevenueSharePct: agg.returningRevenueSharePct,
    highValueReturning: agg.highValueReturning,
    lapsedReturning90d: agg.lapsedReturning90d,
    serviceNotesNeedingAttention: agg.serviceNotesNeedingAttention,
    bluefinAffinityGuests: agg.bluefinAffinityGuests,
    bluefinAffinityExpectedValue: agg.bluefinAffinityExpectedValue,
    spotlight,
    attentionNotes,
    access,
  };
}
