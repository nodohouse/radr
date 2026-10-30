/**
 * Hotel House Readiness — canonical room / arrival / risk models + Canal House demo.
 * Deterministic. No Math.random(). Aligns with canalHouseLive() KPIs.
 */

import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type RoomState =
  | "ready"
  | "cleaning"
  | "inspection"
  | "dirty"
  | "blocked"
  | "occupied";

export type RoomType = "standard" | "deluxe" | "suite";

export type HouseRoom = {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  state: RoomState;
  vip: boolean;
  etaReady: string | null;
  etaReadyMinutes: number | null;
  nextArrivalAt: string | null;
  nextGuest: string | null;
  revenueImpact: number;
  assignedHousekeeper: string | null;
  inspectorId: string | null;
  confidence: number;
  updatedAt: string;
  image: string;
};

export type HouseArrival = {
  id: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  roomType: RoomType;
  scheduledAt: string;
  vip: boolean;
  earlyArrival: boolean;
  roomReady: boolean;
  expectedValue: number;
};

export type ReadinessRisk = {
  roomId: string;
  roomNumber: string;
  reason: string;
  delayMinutes: number;
  arrivalAt: string;
  exposure: number;
};

export type HouseReadinessKpi = {
  id: string;
  label: string;
  value: string;
  detail: string;
  delta: string;
  tone: "pos" | "neg" | "watch" | "neutral";
};

export type HouseReadinessModel = {
  locationId: string;
  locationLabel: string;
  clockLabel: string;
  waveLabel: string;
  waveGuests: number;
  occupied: number;
  sellable: number;
  ready: number;
  due: number;
  gap: number;
  arrivalsToday: number;
  recoverableEuro: number;
  kpis: HouseReadinessKpi[];
  floors: number[];
  rooms: HouseRoom[];
  arrivals: HouseArrival[];
  risks: ReadinessRisk[];
  recommendation: {
    decisionId: string;
    confidence: number;
    body: string;
    roomsReady: number;
    valueProtected: number;
    delayReductionMin: number;
    preparedBy: string;
    why: string[];
    evidence: string[];
  };
  byHour: { hour: string; ready: number; due: number }[];
  byType: { type: RoomType; label: string; ready: number; due: number }[];
  turnover: { hour: string; departures: number; ready: number }[];
  capacity: {
    housekeepersOn: number;
    housekeepersShift: number;
    inspectorsOn: number;
    inspectorsShift: number;
    inspectionBacklog: number;
    avgCleanMin: number;
    avgInspectMin: number;
  };
  selectedRoomId: string;
};

const STAMP = HOTEL_LIVE_SCENARIO.timestampIso;
const IMG = "/demo/facilities/canal-classic-queen.jpg";
const IMG2 = "/demo/facilities/canal-deluxe-king.jpg";
const IMG3 = "/demo/facilities/canal-suite.jpg";

/** Deterministic floor×slot status for demo grid (floors 1–4 · 12 rooms). */
function roomState(floor: number, slot: number): RoomState {
  const key = floor * 20 + slot;
  if (floor === 1 && slot === 5) return "cleaning"; // 105 hero
  if (floor === 1 && (slot === 3 || slot === 8)) return "dirty";
  if (floor === 1 && slot === 4) return "inspection";
  if (floor === 2 && slot === 6) return "blocked";
  if (floor === 2 && (slot === 8 || slot === 11)) return "cleaning";
  if (floor === 2 && slot === 3) return "inspection";
  if (floor === 3 && (slot === 1 || slot === 5 || slot === 9)) return "dirty";
  if (floor === 3 && (slot === 2 || slot === 7)) return "inspection";
  if (floor === 3 && slot === 4) return "cleaning";
  if (floor === 4 && slot === 10) return "blocked";
  if (floor === 4 && (slot === 2 || slot === 6)) return "cleaning";
  if (key % 7 === 0) return "occupied";
  if (key % 5 === 0) return "inspection";
  return "ready";
}

function roomType(slot: number): RoomType {
  if (slot === 10 || slot === 12) return "suite";
  if (slot >= 7 && slot <= 9) return "deluxe";
  return "standard";
}

function buildRooms(): HouseRoom[] {
  const rooms: HouseRoom[] = [];
  for (const floor of [1, 2, 3, 4]) {
    for (let slot = 1; slot <= 12; slot++) {
      const number = `${floor}${String(slot).padStart(2, "0")}`;
      const state = roomState(floor, slot);
      const vip = (floor === 1 && slot === 5) || (floor === 2 && slot === 8);
      const cleaning = state === "cleaning" || state === "dirty";
      const etaMin =
        number === "105"
          ? 30
          : cleaning
            ? 20 + ((floor * 3 + slot) % 35)
            : state === "inspection"
              ? 8 + (slot % 10)
              : null;
      const arrival =
        number === "105"
          ? "15:00"
          : state === "ready" || state === "occupied"
            ? null
            : `${14 + (slot % 3)}:${String((slot * 5) % 60).padStart(2, "0")}`;
      rooms.push({
        id: `room_${number}`,
        number,
        floor,
        type: roomType(slot),
        state,
        vip,
        etaReady: etaMin != null ? addMinutes("14:20", etaMin) : null,
        etaReadyMinutes: etaMin,
        nextArrivalAt: arrival,
        nextGuest:
          number === "105"
            ? "Mr. James Carter"
            : arrival
              ? guestFor(number)
              : null,
        revenueImpact:
          number === "105"
            ? 280
            : state === "blocked"
              ? 420
              : state === "ready" || state === "occupied"
                ? 0
                : 240 + slot * 10,
        assignedHousekeeper:
          state === "cleaning" || state === "dirty"
            ? number === "105"
              ? "Sophie Park"
              : slot % 2 === 0
                ? "Marta Klein"
                : "Jonas Weber"
            : null,
        inspectorId: state === "inspection" ? "insp_1" : null,
        confidence: state === "blocked" ? 0.72 : 0.91,
        updatedAt: STAMP,
        image:
          roomType(slot) === "suite"
            ? IMG3
            : roomType(slot) === "deluxe"
              ? IMG2
              : IMG,
      });
    }
  }
  return rooms;
}

function addMinutes(clock: string, mins: number): string {
  const [h, m] = clock.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + mins;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function guestFor(room: string): string {
  const names = [
    "Ms. Emily Chen",
    "Mr. Daniel Weber",
    "Ms. Sofia Rossi",
    "Mr. Liam Park",
    "Ms. Nora Berg",
    "Mr. Hugo Santos",
  ];
  const i = Number(room) % names.length;
  return names[i]!;
}

export function houseReadinessModel(): HouseReadinessModel {
  const rooms = buildRooms();
  // Spec KPIs are property-level SSOT (not grid subset counts)
  const ready = 31;
  const due = 42;
  const gap = 11;

  const arrivals: HouseArrival[] = [
    {
      id: "arr_105",
      guestName: "Mr. James Carter",
      roomId: "room_105",
      roomNumber: "105",
      roomType: "standard",
      scheduledAt: "15:00",
      vip: true,
      earlyArrival: false,
      roomReady: false,
      expectedValue: 280,
    },
    {
      id: "arr_208",
      guestName: "Ms. Emily Chen",
      roomId: "room_208",
      roomNumber: "208",
      roomType: "deluxe",
      scheduledAt: "15:10",
      vip: false,
      earlyArrival: false,
      roomReady: false,
      expectedValue: 320,
    },
    {
      id: "arr_301",
      guestName: "Mr. Daniel Weber",
      roomId: "room_301",
      roomNumber: "301",
      roomType: "standard",
      scheduledAt: "15:20",
      vip: false,
      earlyArrival: true,
      roomReady: false,
      expectedValue: 280,
    },
    {
      id: "arr_410",
      guestName: "Ms. Sofia Rossi",
      roomId: "room_410",
      roomNumber: "410",
      roomType: "suite",
      scheduledAt: "15:30",
      vip: false,
      earlyArrival: false,
      roomReady: true,
      expectedValue: 540,
    },
  ];

  const risks: ReadinessRisk[] = [
    {
      roomId: "room_105",
      roomNumber: "105",
      reason: "Cleaning overdue",
      delayMinutes: 42,
      arrivalAt: "15:00",
      exposure: 280,
    },
    {
      roomId: "room_208",
      roomNumber: "208",
      reason: "Inspection delayed",
      delayMinutes: 37,
      arrivalAt: "15:10",
      exposure: 320,
    },
    {
      roomId: "room_305",
      roomNumber: "305",
      reason: "Cleaning overdue",
      delayMinutes: 51,
      arrivalAt: "15:20",
      exposure: 280,
    },
  ];

  return {
    locationId: "loc_canal_house",
    locationLabel: "Mercer House · New York",
    clockLabel: HOTEL_LIVE_SCENARIO.clockLabel,
    waveLabel: "CHECK-IN WAVE",
    waveGuests: 40,
    occupied: 178,
    sellable: 200,
    ready,
    due,
    gap,
    arrivalsToday: 42,
    recoverableEuro: 3780,
    kpis: [
      {
        id: "occ",
        label: "Occupancy",
        value: "89%",
        detail: "178 / 200 rooms",
        delta: "+2% vs yesterday",
        tone: "pos",
      },
      {
        id: "ready",
        label: "Rooms ready / due",
        value: "31 / 42",
        detail: "Arrival wave inventory",
        delta: "+6 vs yesterday",
        tone: "pos",
      },
      {
        id: "gap",
        label: "Readiness gap",
        value: "11",
        detail: "Before check-in window",
        delta: "−5 vs yesterday",
        tone: "neg",
      },
      {
        id: "arrivals",
        label: "Arrivals today",
        value: "42",
        detail: "14:00–16:00 wave",
        delta: "+8 vs yesterday",
        tone: "neutral",
      },
      {
        id: "recoverable",
        label: "Recoverable revenue",
        value: "€3,780",
        detail: "Expected · not verified",
        delta: "+€1,200 vs yesterday",
        tone: "watch",
      },
    ],
    floors: [1, 2, 3, 4],
    rooms,
    arrivals,
    risks,
    recommendation: {
      decisionId: DECISION_IDS.hotelReadiness,
      confidence: 81,
      body: "Reassign 2 housekeepers from lower-priority floors to Floor 3 before the arrival wave.",
      roomsReady: 4,
      valueProtected: 1840,
      delayReductionMin: 35,
      preparedBy: "Housekeeping Operator",
      why: [
        "Floor 3 is behind its arrival-ready trajectory.",
        "42 arrivals today · 31 ready · 7 rooms at risk.",
        "Floors 1 and 2 have spare capacity in the next 40 minutes.",
      ],
      evidence: [
        "PMS arrivals",
        "Housekeeping progress",
        "Room readiness",
        "Attendant capacity",
      ],
    },
    byHour: [
      { hour: "08:00", ready: 4, due: 6 },
      { hour: "09:00", ready: 8, due: 10 },
      { hour: "10:00", ready: 12, due: 14 },
      { hour: "11:00", ready: 16, due: 18 },
      { hour: "12:00", ready: 20, due: 24 },
      { hour: "13:00", ready: 24, due: 30 },
      { hour: "14:00", ready: 28, due: 36 },
      { hour: "15:00", ready: 31, due: 42 },
      { hour: "16:00", ready: 35, due: 42 },
      { hour: "17:00", ready: 38, due: 42 },
      { hour: "18:00", ready: 40, due: 42 },
      { hour: "19:00", ready: 41, due: 42 },
      { hour: "20:00", ready: 42, due: 42 },
    ],
    byType: [
      { type: "standard", label: "Standard", ready: 18, due: 26 },
      { type: "deluxe", label: "Deluxe", ready: 8, due: 10 },
      { type: "suite", label: "Suite", ready: 4, due: 6 },
    ],
    turnover: [
      { hour: "10:00", departures: 4, ready: 3 },
      { hour: "11:00", departures: 8, ready: 6 },
      { hour: "12:00", departures: 14, ready: 11 },
      { hour: "13:00", departures: 22, ready: 18 },
      { hour: "14:00", departures: 30, ready: 26 },
      { hour: "15:00", departures: 38, ready: 31 },
      { hour: "16:00", departures: 40, ready: 35 },
    ],
    capacity: {
      housekeepersOn: 8,
      housekeepersShift: 10,
      inspectorsOn: 2,
      inspectorsShift: 3,
      inspectionBacklog: 6,
      avgCleanMin: 27,
      avgInspectMin: 8,
    },
    selectedRoomId: "room_105",
  };
}

export function roomStateLabel(state: RoomState): string {
  switch (state) {
    case "ready":
      return "Ready";
    case "cleaning":
      return "Cleaning";
    case "inspection":
      return "Inspection";
    case "dirty":
      return "Dirty";
    case "blocked":
      return "Blocked";
    case "occupied":
      return "Occupied";
  }
}

export function roomTypeLabel(type: RoomType): string {
  switch (type) {
    case "standard":
      return "Standard";
    case "deluxe":
      return "Deluxe";
    case "suite":
      return "Suite";
  }
}

/** Grid rooms that are part of the due/wave inventory (excludes quiet occupied). */
export function waveRooms(rooms: HouseRoom[]): HouseRoom[] {
  return rooms.filter((r) => r.state !== "occupied" || r.vip);
}
