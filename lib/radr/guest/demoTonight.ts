/**
 * Berlin Mitte dinner - illustrative guest value fixture.
 * Synthetic names · no real PII · identity confidence explicit.
 */

import { DEMO_LOCATION_ID } from "@/lib/radr/demoClock";
import type {
  GuestIdentity,
  GuestPreference,
  GuestServiceNote,
  GuestValueSummary,
  TonightGuestBooking,
} from "./types";

export type DemoGuestRecord = {
  identity: GuestIdentity;
  value: GuestValueSummary;
  booking: TonightGuestBooking;
  preferences: GuestPreference[];
  notes: GuestServiceNote[];
};

const GUESTS: DemoGuestRecord[] = [
  {
    identity: {
      id: "gst_sophie",
      displayName: "Sophie Laurent",
      matchKeys: {
        reservationCustomerId: "res_cust_sophie",
        loyaltyId: "loy_8841",
        emailHash: "h_sophie_email",
      },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_sophie",
      tiers: ["HIGH_VALUE", "FREQUENT", "RETURNING"],
      visitCount: 8,
      lifetimeSpend: 3460,
      avgSpendPerVisit: 433,
      avgPartySize: 3.6,
      daysSinceLastVisit: 21,
      completedVisits: 8,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: [
        "8 visits in 8 months",
        "€3.460,00 historical spend",
        "Usually tasting menu + wine",
        "Last visit 21 days ago",
      ],
      topDishes: ["Tuna Tataki", "Dom Pérignon", "Wagyu Don"],
      expectedSpendTonightLow: 420,
      expectedSpendTonightHigh: 520,
    },
    booking: {
      reservationId: "r_sophie",
      guestId: "gst_sophie",
      tableLabel: "Table 3",
      time: "19:00",
      partySize: 4,
      covers: 4,
    },
    preferences: [
      {
        guestId: "gst_sophie",
        kind: "quiet_table",
        note: "Prefers quiet seating",
        visibility: "host",
      },
      {
        guestId: "gst_sophie",
        kind: "tasting_menu",
        note: "Regular tasting-menu guest",
        visibility: "gm",
      },
    ],
  notes: [
    {
      id: "note_sophie_quiet",
      guestId: "gst_sophie",
      note: "Prefers quiet seating",
      kind: "preference",
      visibility: "host",
      needsAttentionTonight: true,
    },
    {
      id: "note_sophie_shellfish",
      guestId: "gst_sophie",
      note: "Shellfish allergy (guest stated)",
      kind: "allergy",
      visibility: "kitchen",
      needsAttentionTonight: true,
      protocol:
        "Change gloves · dedicated board · no shared oil · confirm with Expo before Tataki plating",
    },
  ],
},
{
  identity: {
    id: "gst_daniel",
      displayName: "Daniel Weber",
      matchKeys: {
        reservationCustomerId: "res_cust_daniel",
        emailHash: "h_daniel_email",
      },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_daniel",
      tiers: ["HIGH_VALUE", "FREQUENT", "RETURNING", "GROUP_ORGANIZER"],
      visitCount: 12,
      lifetimeSpend: 4820,
      avgSpendPerVisit: 138,
      avgPartySize: 4.1,
      daysSinceLastVisit: 18,
      completedVisits: 14,
      noShows: 0,
      lateCancellations: 1,
      reliability: "High",
      why: [
        "12 visits in 8 months",
        "€4.820,00 lifetime spend",
        "€138,00 average spend",
        "Usually books for 4",
      ],
      topDishes: ["Tuna Tataki", "Bluefin Nigiri"],
      expectedSpendTonightLow: 160,
      expectedSpendTonightHigh: 220,
    },
    booking: {
      reservationId: "r_daniel",
      guestId: "gst_daniel",
      tableLabel: "Table 7",
      time: "20:00",
      partySize: 4,
      covers: 4,
    },
    preferences: [],
    notes: [
      {
        id: "note_daniel_nut",
        guestId: "gst_daniel",
        note: "Tree nut allergy (guest stated)",
        kind: "allergy",
        visibility: "kitchen",
        needsAttentionTonight: true,
        protocol:
          "Change gloves · clean board · pastry / dessert alert · no shared tongs",
      },
    ],
  },
  {
    identity: {
      id: "gst_mira",
      displayName: "Mira Chen",
      matchKeys: { loyaltyId: "loy_2201" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_mira",
      tiers: ["HIGH_VALUE", "RETURNING"],
      visitCount: 6,
      lifetimeSpend: 2140,
      avgSpendPerVisit: 357,
      avgPartySize: 2.2,
      daysSinceLastVisit: 34,
      completedVisits: 6,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: [
        "6 visits · €2.140,00 historical spend",
        "Often terrace + wine",
      ],
      topDishes: ["Tuna Tataki", "Chablis"],
      expectedSpendTonightLow: 280,
      expectedSpendTonightHigh: 360,
    },
    booking: {
      reservationId: "r_mira",
      guestId: "gst_mira",
      tableLabel: "Terrace 3",
      time: "19:00",
      partySize: 2,
      covers: 2,
    },
    preferences: [
      {
        guestId: "gst_mira",
        kind: "terrace",
        note: "Prefers terrace",
        visibility: "host",
      },
    ],
    notes: [
      {
        id: "note_mira_terrace",
        guestId: "gst_mira",
        note: "Prefers terrace",
        kind: "preference",
        visibility: "host",
        needsAttentionTonight: false,
      },
    ],
  },
  {
    identity: {
      id: "gst_jonas",
      displayName: "Jonas Keller",
      matchKeys: { reservationCustomerId: "res_cust_jonas" },
      identityConfidence: "MEDIUM",
    },
    value: {
      guestId: "gst_jonas",
      tiers: ["LAPSED", "HIGH_VALUE", "RETURNING"],
      visitCount: 9,
      lifetimeSpend: 2910,
      avgSpendPerVisit: 323,
      avgPartySize: 3.0,
      daysSinceLastVisit: 112,
      completedVisits: 9,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: [
        "Returning after 112 days",
        "€2.910,00 historical spend",
        "Previously frequent midweek diner",
      ],
      topDishes: ["Wagyu Don"],
      expectedSpendTonightLow: 240,
      expectedSpendTonightHigh: 320,
    },
    booking: {
      reservationId: "r_jonas",
      guestId: "gst_jonas",
      tableLabel: "Table 4",
      time: "18:30",
      partySize: 3,
      covers: 3,
    },
    preferences: [],
    notes: [
      {
        id: "note_jonas_recovery",
        guestId: "gst_jonas",
        note: "Previous visit required recovery - manager touchpoint",
        kind: "recovery",
        visibility: "manager",
        needsAttentionTonight: true,
      },
    ],
  },
  {
    identity: {
      id: "gst_elena",
      displayName: "Elena Rossi",
      matchKeys: { loyaltyId: "loy_5510" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_elena",
      tiers: ["HIGH_VALUE", "FREQUENT", "RETURNING"],
      visitCount: 11,
      lifetimeSpend: 3680,
      avgSpendPerVisit: 335,
      avgPartySize: 2.8,
      daysSinceLastVisit: 12,
      completedVisits: 11,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: ["11 visits · €3.680,00 historical spend"],
      topDishes: ["Bluefin Nigiri", "Tuna Tataki"],
      expectedSpendTonightLow: 300,
      expectedSpendTonightHigh: 380,
    },
    booking: {
      reservationId: "r_elena",
      guestId: "gst_elena",
      tableLabel: "Table 9",
      time: "20:15",
      partySize: 2,
      covers: 2,
    },
    preferences: [],
    notes: [],
  },
  {
    identity: {
      id: "gst_tom",
      displayName: "Tom Berg",
      matchKeys: { reservationCustomerId: "res_cust_tom" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_tom",
      tiers: ["HIGH_VALUE", "RETURNING", "GROUP_ORGANIZER"],
      visitCount: 7,
      lifetimeSpend: 4120,
      avgSpendPerVisit: 589,
      avgPartySize: 5.2,
      daysSinceLastVisit: 27,
      completedVisits: 7,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: ["High party value · group organizer"],
      topDishes: ["Chef's Omakase"],
      expectedSpendTonightLow: 480,
      expectedSpendTonightHigh: 620,
    },
    booking: {
      reservationId: "r_tom",
      guestId: "gst_tom",
      tableLabel: "Table 14",
      time: "19:45",
      partySize: 6,
      covers: 6,
    },
    preferences: [],
    notes: [],
  },
  {
    identity: {
      id: "gst_anna",
      displayName: "Anna Vogel",
      matchKeys: { emailHash: "h_anna" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_anna",
      tiers: ["FREQUENT", "RETURNING"],
      visitCount: 5,
      lifetimeSpend: 980,
      avgSpendPerVisit: 196,
      avgPartySize: 2.0,
      daysSinceLastVisit: 9,
      completedVisits: 5,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: ["5 visits · reliable midweek regular"],
      topDishes: ["Salmon Tataki"],
      expectedSpendTonightLow: 160,
      expectedSpendTonightHigh: 210,
    },
    booking: {
      reservationId: "r_anna",
      guestId: "gst_anna",
      tableLabel: "Table 2",
      time: "18:00",
      partySize: 2,
      covers: 2,
    },
    preferences: [],
    notes: [],
  },
  {
    identity: {
      id: "gst_luca",
      displayName: "Luca Moretti",
      matchKeys: { loyaltyId: "loy_991" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_luca",
      tiers: ["HIGH_VALUE", "RETURNING"],
      visitCount: 4,
      lifetimeSpend: 1760,
      avgSpendPerVisit: 440,
      avgPartySize: 2.5,
      daysSinceLastVisit: 41,
      completedVisits: 4,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: ["€1.760,00 historical spend · wine attachment"],
      topDishes: ["Tuna Tataki", "Chablis"],
      expectedSpendTonightLow: 320,
      expectedSpendTonightHigh: 400,
    },
    booking: {
      reservationId: "r_luca",
      guestId: "gst_luca",
      tableLabel: "Table 11",
      time: "21:00",
      partySize: 2,
      covers: 2,
    },
    preferences: [
      {
        guestId: "gst_luca",
        kind: "wine",
        note: "Wine preference on file",
        visibility: "gm",
      },
    ],
    notes: [],
  },
  {
    identity: {
      id: "gst_priya",
      displayName: "Priya Shah",
      matchKeys: { reservationCustomerId: "res_cust_priya" },
      identityConfidence: "HIGH",
    },
    value: {
      guestId: "gst_priya",
      tiers: ["HIGH_VALUE", "RETURNING"],
      visitCount: 6,
      lifetimeSpend: 2280,
      avgSpendPerVisit: 380,
      avgPartySize: 3.1,
      daysSinceLastVisit: 15,
      completedVisits: 6,
      noShows: 0,
      lateCancellations: 0,
      reliability: "High",
      why: ["6 visits · €2.280,00 historical spend"],
      topDishes: ["Bluefin Nigiri"],
      expectedSpendTonightLow: 260,
      expectedSpendTonightHigh: 340,
    },
    booking: {
      reservationId: "r_priya",
      guestId: "gst_priya",
      tableLabel: "Table 5",
      time: "19:15",
      partySize: 3,
      covers: 3,
    },
    preferences: [],
    notes: [
      {
        id: "note_priya_bday",
        guestId: "gst_priya",
        note: "Anniversary noted on reservation",
        kind: "celebration",
        visibility: "host",
        needsAttentionTonight: true,
      },
    ],
  },
];

export function demoBerlinGuestsTonight(): DemoGuestRecord[] {
  return GUESTS.filter((g) =>
    g.booking.guestId.startsWith("gst_"),
  ).map((g) => ({
    ...g,
    booking: { ...g.booking },
  }));
}

export const DEMO_GUEST_LOCATION_ID = DEMO_LOCATION_ID;

/** Aggregate tonight economics - fixture-aligned with pre-shift covers. */
export const DEMO_GUEST_TONIGHT_AGG = {
  reservedCovers: 118,
  returningGuests: 42,
  firstTimeGuests: 31,
  expectedReturningRevenue: 3840,
  expectedFirstTimeRevenue: 2260,
  returningRevenueSharePct: 32,
  highValueReturning: 9,
  lapsedReturning90d: 3,
  serviceNotesNeedingAttention: 2,
  /** Guests with historical Bluefin affinity booked tonight. */
  bluefinAffinityGuests: 3,
  bluefinAffinityExpectedValue: 680,
} as const;
