/**
 * Canal House Amsterdam — boutique hotel DEMO fixture.
 * Parallel to Berlin restaurant; does not replace loc_ber.
 */

import type { PerishableInventoryOpportunity } from "@/lib/radr/activeRevenue/liveRecovery";
import {
  predictionSchema,
  type Prediction,
} from "@/lib/radr/domain/intelligence";
import {
  STAY_SIGNAL_LABEL,
  type StayArrival,
} from "@/lib/radr/demo/stayGuests";

export const CANAL_HOUSE_LOCATION_ID = "loc_ams_canal";
export const CANAL_HOUSE_ORG_ID = "org_canal_house";

export const CANAL_HOUSE = {
  id: CANAL_HOUSE_LOCATION_ID,
  name: "Canal House Amsterdam",
  city: "Amsterdam",
  country: "Netherlands",
  rooms: 28,
  street: "Keizersgracht 312",
  roomTypes: ["Classic Queen", "Deluxe King", "Canal Suite"] as const,
} as const;

export type HotelTonightPulse = {
  occupancyPct: number;
  arrivals: number;
  departures: number;
  stayovers: number;
  /** Guests already sleeping / in-house at start of day */
  inHouseGuests: number;
  adr: number;
  revpar: number;
  roomsReady: number;
  roomsCleaning: number;
  roomsDelayed: number;
  needsYou: number;
  radrHandling: number;
  verifiedToday: number;
  directSharePct: number;
  /** Forward pace — accommodation cares about tomorrow already */
  pickupTomorrow: number;
  roomsOpenTonight: number;
};

export const canalHouseTonight = (): HotelTonightPulse => ({
  occupancyPct: 89,
  arrivals: 12,
  departures: 8,
  stayovers: 16,
  inHouseGuests: 31,
  adr: 268,
  revpar: 238,
  roomsReady: 21,
  roomsCleaning: 5,
  roomsDelayed: 2,
  needsYou: 2,
  radrHandling: 4,
  verifiedToday: 184,
  directSharePct: 48,
  pickupTomorrow: 9,
  roomsOpenTonight: 1,
});

/** Continuity briefing — what a restaurant GM never inherits the same way. */
export type HotelOvernightItem = {
  id: string;
  time: string;
  title: string;
  body: string;
  tone: "ok" | "watch" | "handled";
};

export function canalHouseOvernight(): HotelOvernightItem[] {
  return [
    {
      id: "ov1",
      time: "02:14",
      title: "Noise complaint · Room 401",
      body: "Adjacent guest messaged. Night manager spoke with Berg · quiet after 02:30.",
      tone: "handled",
    },
    {
      id: "ov2",
      time: "06:40",
      title: "Early breakfast · Suite 312 hold",
      body: "Okada party requested 07:00 breakfast tomorrow (anniversary day).",
      tone: "watch",
    },
    {
      id: "ov3",
      time: "Night",
      title: "House ran clean",
      body: "No outages · AC in 108 still OOO · minibar restock complete on floors 2–3.",
      tone: "ok",
    },
  ];
}

export type HotelInHouseGuest = {
  id: string;
  room: string;
  name: string;
  nightsLeft: number;
  flags: string[];
  note: string;
  /** Why the GM should know before walking the floor */
  whyItMatters: string;
};

export function canalHouseInHouse(): HotelInHouseGuest[] {
  return [
    {
      id: "ih_401",
      room: "401",
      name: "Berg",
      nightsLeft: 0,
      flags: ["Departs 11:00", "Overnight note"],
      note: "Noise complaint resolved overnight · late checkout possible",
      whyItMatters: "Departure mood + review risk",
    },
    {
      id: "ih_312",
      room: "312",
      name: "Okada",
      nightsLeft: 3,
      flags: ["Returning", "Anniversary", "High floor"],
      note: "4 prior stays · champagne opportunity ready",
      whyItMatters: "Relationship + ancillary contribution",
    },
    {
      id: "ih_118hold",
      room: "—",
      name: "Walk-in / recovery hold",
      nightsLeft: 1,
      flags: ["Tonight open"],
      note: "Deluxe King cancelled · still on direct",
      whyItMatters: "€420 room night perishable today",
    },
  ];
}

export type HotelYesterdayRollup = {
  verifiedEuro: number;
  reviews: { score: number; count: number; highlight: string };
  occupancyPct: number;
  adr: number;
  guestMessagesHandled: number;
  incidentsHandled: number;
};

export function canalHouseYesterday(): HotelYesterdayRollup {
  return {
    verifiedEuro: 184,
    reviews: {
      score: 9.4,
      count: 2,
      highlight: "“Front desk remembered our anniversary.”",
    },
    occupancyPct: 86,
    adr: 261,
    guestMessagesHandled: 7,
    incidentsHandled: 1,
  };
}


export type HotelRoomStatus =
  | "ready"
  | "cleaning"
  | "delayed"
  | "occupied"
  | "out_of_order";

export type HotelRoom = {
  id: string;
  number: string;
  type: (typeof CANAL_HOUSE.roomTypes)[number];
  floor: number;
  status: HotelRoomStatus;
  guestName?: string;
  arrivalAt?: string;
  departureAt?: string;
  note?: string;
  /** Under-radar facility signal for this specific room */
  radar?: string;
};

export function canalHouseRooms(): HotelRoom[] {
  return [
    {
      id: "r204",
      number: "204",
      type: "Deluxe King",
      floor: 2,
      status: "delayed",
      guestName: "Martinez",
      arrivalAt: "14:30",
      note: "HK projected 14:42 · swap with 207",
      radar: "Bath expected — confirm towels before arrival",
    },
    {
      id: "r207",
      number: "207",
      type: "Classic Queen",
      floor: 2,
      status: "cleaning",
      departureAt: "11:00",
      note: "Checkout done · can finish before 204",
    },
    {
      id: "r312",
      number: "312",
      type: "Canal Suite",
      floor: 3,
      status: "ready",
      guestName: "Okada",
      arrivalAt: "15:00",
      note: "Returning · anniversary · high floor",
      radar: "Welcome tray + champagne path for anniversary",
    },
    {
      id: "r118",
      number: "118",
      type: "Deluxe King",
      floor: 1,
      status: "ready",
      note: "Cancelled stay · inventory opened",
    },
    {
      id: "r215",
      number: "215",
      type: "Classic Queen",
      floor: 2,
      status: "cleaning",
      departureAt: "12:00",
      radar: "Minibar restock still pending from stayover",
    },
    {
      id: "r401",
      number: "401",
      type: "Canal Suite",
      floor: 4,
      status: "occupied",
      guestName: "Berg",
      departureAt: "11:00",
      radar: "Review-sensitive · overnight noise resolved",
    },
    {
      id: "r108",
      number: "108",
      type: "Classic Queen",
      floor: 1,
      status: "out_of_order",
      note: "Maintenance · AC",
      radar: "AC OOO — do not soft-block as Classic Queen sellable",
    },
    {
      id: "r220",
      number: "220",
      type: "Deluxe King",
      floor: 2,
      status: "ready",
      guestName: "Nguyen",
      arrivalAt: "16:00",
      radar: "Asked about canal-view upgrade overnight",
    },
  ];
}

export type HotelArrival = {
  id: string;
  time: string;
  room: string;
  guest: string;
  nights: number;
  roomType: string;
  flags: string[];
  roomStatus: HotelRoomStatus;
};

export function canalHouseArrivals(): HotelArrival[] {
  return canalHouseStayArrivals().map((a) => ({
    id: a.id,
    time: a.time,
    room: a.unit,
    guest:
      a.partySize > 1
        ? `${a.guestName} party of ${a.partySize}`
        : a.guestName,
    nights: a.nights,
    roomType: a.unitType,
    flags: a.signals
      .filter((s) => s !== "first_stay" && s !== "ota")
      .slice(0, 3)
      .map((s) => STAY_SIGNAL_LABEL[s]),
    roomStatus:
      a.unitStatus === "tbd" || a.unitStatus === "maintenance"
        ? "ready"
        : a.unitStatus,
  }));
}

/** Rich stay arrivals — who is coming, relationship, occasions, prepare. */
export function canalHouseStayArrivals(): StayArrival[] {
  return [
    {
      id: "a1",
      time: "14:30",
      unit: "204",
      unitKind: "room",
      guestName: "Martinez",
      partySize: 2,
      nights: 2,
      unitType: "Deluxe King",
      priorStays: 0,
      signals: ["first_stay", "early_checkin", "ota"],
      specialNote: "Asked for bath tub when booking — Deluxe confirmed",
      prepare: "Confirm bath towels · ETA soon vs HK finish",
      whyItMatters: "First impression + delayed room risk",
      unitStatus: "delayed",
      channel: "ota",
    },
    {
      id: "a2",
      time: "15:00",
      unit: "312",
      unitKind: "room",
      guestName: "Okada",
      partySize: 2,
      nights: 3,
      unitType: "Canal Suite",
      priorStays: 4,
      signals: [
        "returning",
        "anniversary",
        "high_floor",
        "vip_relationship",
        "direct",
      ],
      specialNote: "Anniversary · preferred high floor on prior stays",
      prepare: "Welcome tray + champagne path · early breakfast held",
      whyItMatters: "Relationship guest · review + ancillary contribution",
      unitStatus: "ready",
      channel: "direct",
    },
    {
      id: "a3",
      time: "16:00",
      unit: "220",
      unitKind: "room",
      guestName: "Nguyen",
      partySize: 1,
      nights: 1,
      unitType: "Deluxe King",
      priorStays: 0,
      signals: ["first_stay", "direct", "upgrade_interest"],
      specialNote: "Messaged overnight asking about canal-view upgrade",
      prepare: "Offer Deluxe / Suite path if 118 still open",
      whyItMatters: "Direct book · upgrade contribution while inventory open",
      unitStatus: "ready",
      channel: "direct",
    },
    {
      id: "a4",
      time: "17:30",
      unit: "TBD",
      unitKind: "room",
      guestName: "Recovery hold",
      partySize: 2,
      nights: 1,
      unitType: "Deluxe King",
      priorStays: 0,
      signals: ["first_stay"],
      specialNote: "Walk-in / recovery inventory from cancelled Deluxe",
      prepare: "Keep on direct until 16:00 decision",
      whyItMatters: "€420 perishable room night",
      unitStatus: "tbd",
      channel: "direct",
    },
  ];
}

export function canalHouseArrivalForRoom(
  roomNumber: string,
): StayArrival | undefined {
  return canalHouseStayArrivals().find((a) => a.unit === roomNumber);
}

export type HotelAttentionItem = {
  id: string;
  territory: "LABOR" | "RECOVER" | "SELL" | "BUY";
  kicker: string;
  title: string;
  body: string;
  stakeEuro: number;
  stakeLabel: string;
  cta: string;
  /** What RADR already did */
  radrDid?: string;
  href: string;
};

export function canalHouseAttention(): HotelAttentionItem[] {
  return [
    {
      id: "hot_room_204_readiness",
      territory: "LABOR",
      kicker: "HOUSEKEEPING",
      title: "Room 204 projected late for arrival",
      body: "Guest arriving 14:30 · housekeeping projected complete 14:42 · 12 min late.",
      radrDid: "Prepared sequence swap: finish 207 first, then 204.",
      stakeEuro: 1120,
      stakeLabel: "guest / revenue exposure",
      cta: "Approve swap",
      href: "/app/service",
    },
    {
      id: "hot_deluxe_cancel",
      territory: "RECOVER",
      kicker: "RECOVERY",
      title: "Deluxe King cancelled · tonight",
      body: "Room night opened. Direct inventory first, then OTA if unsold.",
      radrDid: "Held on direct · drafted Booking.com release if still open at 16:00.",
      stakeEuro: 420,
      stakeLabel: "room revenue at risk",
      cta: "Recover",
      href: "/app/service?recover=deluxe",
    },
  ];
}

export type HotelGuestMoment = {
  id: string;
  room: string;
  title: string;
  body: string;
  ready: boolean;
  opportunity?: string;
  contributionEuro?: number;
};

export function canalHouseGuestMoments(): HotelGuestMoment[] {
  return [
    {
      id: "gm_312",
      room: "312",
      title: "Returning guest · Anniversary",
      body: "4 prior stays · requested high floor · room ready · early breakfast held",
      ready: true,
      opportunity: "Champagne / restaurant reservation",
      contributionEuro: 84,
    },
    {
      id: "gm_220",
      room: "220",
      title: "First stay · Direct book",
      body: "Arrives 16:00 · asked about canal-view upgrade on Booking chat overnight",
      ready: true,
      opportunity: "Offer Deluxe if 118 still open",
      contributionEuro: 60,
    },
  ];
}

export type HotelHandlingItem = {
  id: string;
  label: string;
  status: string;
};

export function canalHouseHandling(): HotelHandlingItem[] {
  return [
    {
      id: "h0",
      label: "Logged overnight noise resolution · Room 401 · pending departure mood check",
      status: "Pending verification",
    },
    {
      id: "h1",
      label: "Watching Room 215 turnaround vs 16:00 arrival window",
      status: "RADR is watching",
    },
    {
      id: "h2",
      label: "Prepared early check-in offer for Suite waitlist (2 parties)",
      status: "Prepared for approval",
    },
    {
      id: "h3",
      label: "Verified late-checkout contribution · Room 401 yesterday",
      status: "Verified",
    },
  ];
}

export type HotelRecoveryOption = {
  id: string;
  label: string;
  detail: string;
  default?: boolean;
};

export function canalHouseRecoveryOptions(): HotelRecoveryOption[] {
  return [
    {
      id: "direct",
      label: "Hold for direct",
      detail: "Keep on website / front desk · highest contribution",
      default: true,
    },
    {
      id: "ota",
      label: "Release to Booking.com",
      detail: "If still open after 16:00 · commission applies",
    },
    {
      id: "upgrade",
      label: "Offer as upgrade",
      detail: "Move Classic Queen arrival into Deluxe · protect ADR story",
    },
  ];
}

export function canalHousePerishableInventory(): PerishableInventoryOpportunity[] {
  return [
    {
      id: "pi_deluxe_king_tonight",
      inventoryType: "room_night",
      availableFrom: "2026-09-14T14:00:00+02:00",
      expiresAt: "2026-09-15T00:00:00+02:00",
      capacity: 1,
      expectedValue: 420,
      expectedContribution: 310,
      recommendedChannel: "direct",
      recommendedAction: "Release Deluxe King to direct, then Booking.com",
      status: "OPEN",
    },
  ];
}

export function canalHouseFirstInsight(): string {
  return "House held 31 guests overnight; 12 arrivals today with 1 room projected late for check-in readiness.";
}

export function canalHousePredictions(): Prediction[] {
  return [
    predictionSchema.parse({
      id: "pred_r204_ready",
      type: "room_readiness_risk",
      entityType: "room",
      entityId: "r204",
      timeHorizon: "today_14:00",
      what: "Room 204 likely late for 14:30 arrival",
      pointEstimate: 72,
      unit: "percent",
      confidence: "high",
      drivers: [
        { id: "d1", label: "Cleaning started late", direction: "down" },
        { id: "d2", label: "Average turnover 46 min", direction: "neutral" },
        { id: "d3", label: "Maintenance check pending on path", direction: "down" },
      ],
      historicalBaseline: "Deluxe King readiness on-time 78% historically",
      recommendedAction: "Approve sequence swap · finish 207 first",
      visibleToRoles: ["hotel_gm", "housekeeping_manager"],
      verticals: ["boutique_hotel"],
    }),
    predictionSchema.parse({
      id: "pred_deluxe_refill",
      type: "refill_probability",
      entityType: "room_night",
      entityId: "pi_deluxe_king_tonight",
      timeHorizon: "tonight",
      what: "Deluxe King cancellation · 81% refill probability if held direct",
      pointEstimate: 81,
      unit: "percent",
      confidence: "medium",
      drivers: [
        { id: "d1", label: "Lead time still usable", direction: "up" },
        { id: "d2", label: "Direct demand unusually strong today", direction: "up" },
        { id: "d3", label: "OTA commission would dilute contribution", direction: "down" },
      ],
      historicalBaseline: "Same lead-time refill ~74% over last 90 days",
      recommendedAction: "Hold OTA inventory 90 min · prioritize direct",
      visibleToRoles: ["hotel_gm", "revenue_manager", "cfo", "owner"],
      verticals: ["boutique_hotel"],
    }),
    predictionSchema.parse({
      id: "pred_dist_cost",
      type: "distribution_expense",
      entityType: "property",
      entityId: "loc_ams_canal",
      timeHorizon: "mtd",
      what: "OTA share jump is weakening contribution despite occupancy",
      pointEstimate: 2840,
      unit: "euro",
      confidence: "medium",
      drivers: [
        { id: "d1", label: "OTA share 41% → 57%", direction: "down" },
        { id: "d2", label: "Occupancy still strong at 89%", direction: "up" },
      ],
      historicalBaseline: "Direct share usually 45–52% this season",
      recommendedAction: "Review channel mix · protect direct",
      visibleToRoles: ["cfo", "finance", "revenue_manager", "owner"],
      verticals: ["boutique_hotel"],
    }),
  ];
}

/** Format recovery line for hotel perishable inventory. */
export function formatHotelRecoveryOpened(opts: {
  roomType: string;
  nights?: number;
  euro: number;
}): string {
  const nights = opts.nights ?? 1;
  const nightLabel = nights === 1 ? "1 room night" : `${nights} room nights`;
  return `Room night opened · ${opts.roomType} · ${nightLabel} · €${opts.euro.toLocaleString("en-IE")} at risk`;
}

export function hotelRoomStatusLabel(status: HotelRoomStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "cleaning":
      return "Cleaning";
    case "delayed":
      return "At risk";
    case "occupied":
      return "Occupied";
    case "out_of_order":
      return "Out of order";
  }
}
