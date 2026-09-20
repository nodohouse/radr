/**
 * Guest Value - explainable hospitality guest intelligence.
 * Not a CRM. Not surveillance. Legitimate service + repeat economics only.
 *
 * Never store or score: race, religion, health inference, politics,
 * sexual orientation, or other sensitive inferred attributes.
 */

export type GuestIdentityConfidence = "HIGH" | "MEDIUM" | "LOW";

export type GuestTier =
  | "RETURNING"
  | "FREQUENT"
  | "HIGH_VALUE"
  | "LAPSED"
  | "FIRST_TIME"
  | "GROUP_ORGANIZER";

export type GuestIdentity = {
  id: string;
  displayName: string;
  /** Opaque match keys - never raw PII in UI dumps. */
  matchKeys: {
    reservationCustomerId?: string;
    loyaltyId?: string;
    emailHash?: string;
    phoneHash?: string;
  };
  identityConfidence: GuestIdentityConfidence;
};

export type GuestVisit = {
  id: string;
  guestId: string;
  locationId: string;
  businessDate: string;
  partySize: number;
  spend: number;
  channel: "dine_in" | "terrace" | "bar";
};

export type GuestPreference = {
  guestId: string;
  /** Explicitly provided / operational notes only. */
  kind:
    | "quiet_table"
    | "terrace"
    | "tasting_menu"
    | "wine"
    | "allergy"
    | "language"
    | "celebration"
    | "service_recovery";
  note: string;
  /** Who may see this note. */
  visibility: "host" | "gm" | "manager";
};

export type GuestServiceNote = {
  id: string;
  guestId: string;
  note: string;
  kind: "preference" | "recovery" | "celebration" | "allergy";
  visibility: "host" | "gm" | "manager" | "kitchen";
  needsAttentionTonight: boolean;
  /** Explicit FOH / kitchen protocol when kind is allergy (guest-stated only). */
  protocol?: string;
};

export type GuestValueSummary = {
  guestId: string;
  tiers: GuestTier[];
  visitCount: number;
  lifetimeSpend: number;
  avgSpendPerVisit: number;
  avgPartySize: number;
  daysSinceLastVisit: number;
  completedVisits: number;
  noShows: number;
  lateCancellations: number;
  reliability: "High" | "Medium" | "Watch";
  /** Why this guest is surfaced - never a black-box score. */
  why: string[];
  topDishes: string[];
  expectedSpendTonightLow: number;
  expectedSpendTonightHigh: number;
};

export type TonightGuestBooking = {
  reservationId: string;
  guestId: string;
  tableLabel: string | null;
  time: string;
  partySize: number;
  covers: number;
};

export type GuestValueAccess = {
  /** Show named guest details. */
  canSeeNamedGuests: boolean;
  /** Show service notes. */
  canSeeServiceNotes: boolean;
  /** Show aggregate returning revenue only. */
  aggregatesOnly: boolean;
};
