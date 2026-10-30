/**
 * Northstar Hotels — operating dataset for Canal House flagship + group rollup.
 * SELL × DISTRIBUTION × READINESS × HOUSEKEEPING × CONTRIBUTION.
 *
 * SSOT: docs/HOTEL_DEMO_DATASET.md
 */

import { NORTHSTAR_HOTELS, DEMO_SNAPSHOT_ISO } from "@/lib/radr/demo/organizations";

export type RoomStatus =
  | "available"
  | "occupied"
  | "due_out"
  | "departed"
  | "dirty"
  | "cleaning"
  | "inspection"
  | "ready"
  | "ooo"
  | "maintenance"
  | "assigned"
  | "unassigned";

export type HotelChannel =
  | "direct"
  | "booking_com"
  | "expedia"
  | "gds"
  | "corporate"
  | "wholesale";

export type HotelBooking = {
  id: string;
  locationId: string;
  bookingDate: string;
  arrival: string;
  departure: string;
  roomType: string;
  ratePlan: string;
  channel: HotelChannel;
  adr: number;
  los: number;
  leadTimeDays: number;
  cancelled: boolean;
  depositEuro: number;
  guestType: "leisure" | "business" | "group" | "loyalty";
  vip: boolean;
  upgradeEligible: boolean;
  groupBlockId: string | null;
};

export type RoomInventoryCell = {
  roomId: string;
  roomType: string;
  floor: number;
  status: RoomStatus;
  assignedBookingId: string | null;
  earlyArrival: boolean;
  lateCheckout: boolean;
};

export type ChannelEconomics = {
  channel: HotelChannel;
  grossAdr: number;
  commissionPct: number;
  netAdr: number;
  pickupTonight: number;
  remaining: number;
  cancelRatePct: number;
  netContribution: number;
};

export type HotelLiveSnapshot = {
  locationId: string;
  locationName: string;
  clockLabel: string;
  phase: string;
  occupancyPct: number;
  arrivals: number;
  departuresDue: number;
  departed: number;
  cleaning: number;
  ready: number;
  atRiskArrivals: number;
  expectedOccTonight: number;
  expectedAdr: number;
  expectedRevpar: number;
  readinessGap: number;
  exposureEuro: number;
  heroLine: string;
  heroSub: string;
  flow: {
    departed: number;
    housekeeping: number;
    ready: number;
    arriving: number;
    occupied: number;
  };
  nowNext: {
    now: string;
    nextWindow: string;
    nextDetail: string;
    risk: string;
    driver: string;
    decision: string;
  };
  context: { label: string; detail: string }[];
  pulse: {
    id: string;
    label: string;
    value: string;
    delta: string;
    note: string;
    needsAction?: boolean;
  }[];
};

/** Canal House flagship — check-in wave at 14:20. */
export function canalHouseLive(): HotelLiveSnapshot {
  return {
    locationId: "loc_canal_house",
    locationName: "Mercer House · New York",
    clockLabel: "14:20",
    phase: "CHECK_IN_WAVE",
    occupancyPct: 89,
    arrivals: 42,
    departuresDue: 42,
    departed: 38,
    cleaning: 24,
    ready: 31,
    atRiskArrivals: 7,
    expectedOccTonight: 94,
    expectedAdr: 252,
    expectedRevpar: 237,
    readinessGap: 11,
    exposureEuro: 1840,
    heroLine: "OCCUPANCY IS STRONG. ROOM CONTRIBUTION ISN'T.",
    heroSub:
      "Occ 89% · RevPAR €221 · 31/42 ready · €1,840 exposed · Floor 3 behind",
    flow: {
      departed: 38,
      housekeeping: 24,
      ready: 31,
      arriving: 42,
      occupied: 76,
    },
    nowNext: {
      now: "31/42 rooms ready",
      nextWindow: "14:00–15:30",
      nextDetail: "11 arrivals before rooms are ready",
      risk: "7 rooms",
      driver: "Floor 3 housekeeping behind",
      decision: "Reassign 2 attendants",
    },
    context: [
      { label: "Trade show nearby", detail: "Pickup +11%" },
      { label: "Flight disruption", detail: "Late arrival risk +14%" },
    ],
    pulse: [
      {
        id: "occ",
        label: "Occupancy",
        value: "89%",
        delta: "+3pp vs pace",
        note: "NO OCCUPANCY ACTION",
      },
      {
        id: "adr",
        label: "ADR",
        value: "€248",
        delta: "+€6 vs budget",
        note: "NO RATE ACTION",
      },
      {
        id: "revpar",
        label: "RevPAR",
        value: "€221",
        delta: "+3.1%",
        note: "ON PACE",
      },
      {
        id: "ready",
        label: "Room readiness",
        value: "31/42",
        delta: "7 at risk",
        note: "1 Decision on readiness",
        needsAction: true,
      },
      {
        id: "direct",
        label: "Direct share",
        value: "62%",
        delta: "+5pp",
        note: "HOLD WINDOW ACTIVE",
      },
      {
        id: "hk",
        label: "HK productivity",
        value: "13.2/shift",
        delta: "below expected",
        note: "1 Decision on staffing",
        needsAction: true,
      },
    ],
  };
}

export function hotelGroupRollup() {
  const locs = NORTHSTAR_HOTELS.locations;
  return {
    orgId: NORTHSTAR_HOTELS.id,
    snapshotTimestamp: DEMO_SNAPSHOT_ISO,
    locationCount: locs.length,
    occupancyPct: 87,
    adr: 241,
    revpar: 210,
    readyRatio: "248/312",
    atRiskArrivals: 19,
    verifiedEuro: 12480,
    exposureEuro: 6120,
    needsYouCount: 4,
    handlingCount: 3,
  };
}

export function canalChannelEconomics(): ChannelEconomics[] {
  return [
    {
      channel: "direct",
      grossAdr: 268,
      commissionPct: 0,
      netAdr: 268,
      pickupTonight: 14,
      remaining: 9,
      cancelRatePct: 4.2,
      netContribution: 182,
    },
    {
      channel: "booking_com",
      grossAdr: 255,
      commissionPct: 15,
      netAdr: 216.75,
      pickupTonight: 11,
      remaining: 6,
      cancelRatePct: 9.1,
      netContribution: 148,
    },
    {
      channel: "expedia",
      grossAdr: 249,
      commissionPct: 18,
      netAdr: 204.18,
      pickupTonight: 7,
      remaining: 4,
      cancelRatePct: 10.4,
      netContribution: 132,
    },
    {
      channel: "corporate",
      grossAdr: 232,
      commissionPct: 0,
      netAdr: 232,
      pickupTonight: 6,
      remaining: 3,
      cancelRatePct: 2.1,
      netContribution: 161,
    },
    {
      channel: "gds",
      grossAdr: 244,
      commissionPct: 8,
      netAdr: 224.48,
      pickupTonight: 3,
      remaining: 2,
      cancelRatePct: 3.5,
      netContribution: 154,
    },
    {
      channel: "wholesale",
      grossAdr: 198,
      commissionPct: 22,
      netAdr: 154.44,
      pickupTonight: 1,
      remaining: 1,
      cancelRatePct: 6.0,
      netContribution: 98,
    },
  ];
}

/** Seed bookings — Canal House arrival wave. */
export function canalBookings(): HotelBooking[] {
  const base: HotelBooking[] = [];
  const channels: HotelChannel[] = [
    "direct",
    "booking_com",
    "expedia",
    "corporate",
    "direct",
    "gds",
  ];
  const types = ["Classic", "Canal View", "Junior Suite", "Classic", "Canal View"];
  for (let i = 0; i < 42; i++) {
    const channel = channels[i % channels.length]!;
    const roomType = types[i % types.length]!;
    const vip = i % 11 === 0;
    base.push({
      id: `bk_ch_${String(i + 1).padStart(3, "0")}`,
      locationId: "loc_canal_house",
      bookingDate: "2026-09-12",
      arrival: "2026-09-24",
      departure: i % 3 === 0 ? "2026-09-26" : "2026-09-25",
      roomType,
      ratePlan: channel === "corporate" ? "CORP-NEG" : "BAR",
      channel,
      adr: channel === "direct" ? 268 : channel === "booking_com" ? 255 : 240,
      los: i % 3 === 0 ? 2 : 1,
      leadTimeDays: 8 + (i % 20),
      cancelled: false,
      depositEuro: channel === "direct" ? 80 : 0,
      guestType: vip ? "loyalty" : i % 5 === 0 ? "business" : "leisure",
      vip,
      upgradeEligible: vip || i % 7 === 0,
      groupBlockId: i >= 36 ? "grp_tradeshow_ams" : null,
    });
  }
  return base;
}

export function canalRoomInventory(): RoomInventoryCell[] {
  const cells: RoomInventoryCell[] = [];
  let n = 0;
  for (let floor = 1; floor <= 5; floor++) {
    for (let r = 1; r <= 18; r++) {
      n += 1;
      const roomId = `${floor}${String(r).padStart(2, "0")}`;
      let status: RoomStatus = "occupied";
      if (n <= 38) status = n <= 14 ? "departed" : n <= 38 ? "dirty" : "occupied";
      if (n > 38 && n <= 62) status = "cleaning";
      if (n > 62 && n <= 93) status = "ready";
      if (n > 93 && n <= 96) status = "ooo";
      if (floor === 3 && status === "cleaning") {
        /* Floor 3 bottleneck — stays cleaning longer */
      }
      cells.push({
        roomId,
        roomType: r <= 10 ? "Classic" : r <= 15 ? "Canal View" : "Junior Suite",
        floor,
        status,
        assignedBookingId: null,
        earlyArrival: n % 17 === 0,
        lateCheckout: n % 19 === 0,
      });
    }
  }
  return cells;
}

export const HOTEL_TIMELINE_HOURS = [
  0, 3, 6, 9, 12, "NOW", 15, 18, 21, 24,
] as const;

export const HOTEL_OPERATING_BANDS = [
  { id: "night_audit", label: "Night audit", from: 0, to: 5 },
  { id: "breakfast", label: "Breakfast", from: 6, to: 10 },
  { id: "departures", label: "Departures", from: 9, to: 12 },
  { id: "housekeeping", label: "Housekeeping", from: 10, to: 16 },
  { id: "early_arrivals", label: "Early arrivals", from: 12, to: 14 },
  { id: "check_in", label: "Check-in", from: 14, to: 18 },
  { id: "evening", label: "Evening", from: 18, to: 22 },
  { id: "overnight", label: "Overnight", from: 22, to: 24 },
] as const;
