/**
 * Hotel Live — Canal House Property digital twin (Daylight).
 * KPI SSOT: canalHouseLive(). Room 310 + Floor 3 are Live visual canon.
 */

import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { NORTHSTAR_HOTELS } from "@/lib/radr/demo/organizations";
import { getEstateEntity } from "@/lib/radr/demo/estateRegistry";

export type LiveRoomState =
  | "ready"
  | "dirty"
  | "cleaning"
  | "inspection"
  | "ooo"
  | "occupied";

export type HotelLiveMode =
  | "rooms"
  | "housekeeping"
  | "arrivals"
  | "guests"
  | "staff"
  | "incidents";

export type HotelLiveRoom = {
  id: string;
  number: string;
  floor: number;
  type: "Standard" | "Deluxe King" | "Suite";
  state: LiveRoomState;
  /** Position on floor plan 0–100 */
  x: number;
  y: number;
  w: number;
  h: number;
  priority: "high" | "normal" | "low";
  arrivalAt: string | null;
  guestName: string | null;
  assigned: string | null;
  cleaningStartedAt: string | null;
  cleaningMinutes: number | null;
  expectedReadyAt: string | null;
  exposureEuro: number;
  vip: boolean;
  adults: number;
  nights: number;
  image: string;
  dependencies: { id: string; label: string; done: boolean }[];
  decisionIds: string[];
};

export type HotelLiveFloor = {
  id: number;
  label: string;
  short: string;
  roomCount: number;
  behind: number;
  cleaning: number;
  inspection: number;
};

export type ArrivalWavePoint = {
  hour: string;
  t: number;
  ready: number;
  expected: number;
  due: number;
};

export type ArrivalWaveEvent = {
  id: string;
  time: string;
  t: number;
  title: string;
  detail: string;
  tone: "pos" | "neg" | "watch" | "now";
};

export type HotelLivePropertyModel = {
  propertyId: string;
  propertyLabel: string;
  city: string;
  clockLabel: string;
  occupancyPct: number;
  occupied: number;
  totalRooms: number;
  ready: number;
  due: number;
  atRisk: number;
  arrivalsToday: number;
  inHouse: number;
  exposureEuro: number;
  floors: HotelLiveFloor[];
  rooms: HotelLiveRoom[];
  selectedFloor: number;
  selectedRoomId: string;
  wave: ArrivalWavePoint[];
  waveEvents: ArrivalWaveEvent[];
  activeDecisionId: string;
};

const IMG = {
  deluxe: "/demo/facilities/canal-deluxe-king.jpg",
  classic: "/demo/facilities/canal-classic-queen.jpg",
  suite: "/demo/facilities/canal-suite.jpg",
} as const;

/** Floor 3 layout — 24 rooms · corridor architecture (deterministic). */
function floor3Rooms(): HotelLiveRoom[] {
  /**
   * State recipe matching mockup filter counts:
   * Dirty 6 · Cleaning 8 · Ready 9 · OOO 1 = 24
   */
  const states: LiveRoomState[] = [
    "ready",
    "dirty",
    "cleaning",
    "ready",
    "cleaning",
    "ooo",
    "dirty",
    "cleaning",
    "cleaning",
    "dirty", // 310
    "ready",
    "ready",
    "cleaning",
    "ready",
    "dirty",
    "dirty",
    "cleaning",
    "ready",
    "cleaning",
    "ready",
    "dirty",
    "cleaning",
    "ready",
    "ready",
  ];

  // Boutique floor — inset so tiles never clip the plan edge when stage fills
  const layout: { x: number; y: number; w: number; h: number }[] = [];
  for (let i = 0; i < 8; i++) {
    layout.push({ x: 4.5 + i * 10.35, y: 4, w: 9.5, h: 16.5 });
  }
  for (let i = 0; i < 4; i++) {
    layout.push({ x: 10 + i * 16.8, y: 24, w: 14.8, h: 13.5 });
  }
  for (let i = 0; i < 8; i++) {
    layout.push({ x: 4.5 + i * 10.35, y: 52.5, w: 9.5, h: 16.5 });
  }
  for (let i = 0; i < 4; i++) {
    layout.push({ x: 10 + i * 16.8, y: 73.5, w: 14.8, h: 15.5 });
  }

  return states.map((state, i) => {
    const number = String(301 + i);
    const is310 = number === "310";
    const pos = layout[i]!;
    const dirtyOrCleaning = state === "dirty" || state === "cleaning";
    return {
      id: `room_${number}`,
      number,
      floor: 3,
      type: is310 || i % 5 === 0 ? "Deluxe King" : i % 7 === 0 ? "Suite" : "Standard",
      state,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      priority: is310 || state === "dirty" ? "high" : "normal",
      arrivalAt: is310
        ? "15:20"
        : dirtyOrCleaning
          ? i % 2 === 0
            ? "15:10"
            : "15:35"
          : null,
      guestName: is310
        ? "Michael Tan"
        : dirtyOrCleaning
          ? ["Elena Vogt", "James Okonkwo", "Sofia Berg", "Liam Chen"][i % 4]!
          : null,
      assigned: dirtyOrCleaning
        ? is310
          ? "K. Silva"
          : i % 2 === 0
            ? "M. Klein"
            : "J. Weber"
        : null,
      cleaningStartedAt: is310
        ? "13:48"
        : state === "cleaning"
          ? "14:05"
          : null,
      cleaningMinutes: is310 ? 32 : state === "cleaning" ? 18 + (i % 12) : null,
      expectedReadyAt: is310
        ? "14:58"
        : dirtyOrCleaning
          ? "15:05"
          : null,
      exposureEuro: is310
        ? 280
        : state === "ooo"
          ? 420
          : dirtyOrCleaning
            ? 180 + i * 8
            : 0,
      vip: is310 || i === 2 || i === 14,
      adults: is310 ? 2 : 2,
      nights: is310 ? 3 : 2,
      image:
        is310 || i % 5 === 0
          ? IMG.deluxe
          : i % 7 === 0
            ? IMG.suite
            : IMG.classic,
      dependencies: is310
        ? [
            { id: "insp", label: "Room inspection required", done: false },
            { id: "mini", label: "Minibar restock", done: false },
            { id: "late", label: "Late checkout completed", done: true },
          ]
        : [
            { id: "insp", label: "Room inspection required", done: state === "ready" },
            { id: "late", label: "Late checkout completed", done: true },
          ],
      decisionIds: is310 || state === "dirty" ? [DECISION_IDS.hotelReadiness] : [],
    };
  });
}

function otherFloorRooms(floor: number, count: number): HotelLiveRoom[] {
  const rooms: HotelLiveRoom[] = [];
  for (let i = 0; i < count; i++) {
    const number = String(floor * 100 + 1 + i);
    rooms.push({
      id: `room_${number}`,
      number,
      floor,
      type: "Standard",
      state: i % 4 === 0 ? "cleaning" : i % 5 === 0 ? "dirty" : "ready",
      x: 10 + (i % 6) * 14,
      y: 20 + Math.floor(i / 6) * 22,
      w: 12,
      h: 16,
      priority: "normal",
      arrivalAt: null,
      guestName: null,
      assigned: null,
      cleaningStartedAt: null,
      cleaningMinutes: null,
      expectedReadyAt: null,
      exposureEuro: 0,
      vip: false,
      adults: 2,
      nights: 1,
      image: IMG.classic,
      dependencies: [],
      decisionIds: [],
    });
  }
  return rooms;
}

export function hotelLivePropertyModel(): HotelLivePropertyModel {
  const live = canalHouseLive();
  const floor3 = floor3Rooms();
  const rooms = [
    ...otherFloorRooms(1, 18),
    ...otherFloorRooms(2, 20),
    ...floor3,
    ...otherFloorRooms(4, 16),
    ...otherFloorRooms(5, 14),
    ...otherFloorRooms(6, 14),
    ...otherFloorRooms(7, 16),
    ...otherFloorRooms(8, 12),
  ];

  const floorMeta = (n: number): HotelLiveFloor => {
    const fr = rooms.filter((r) => r.floor === n);
    return {
      id: n,
      label: n === 0 ? "Ground" : `Floor ${n}`,
      short: n === 0 ? "G" : `F${n}`,
      roomCount: fr.length,
      behind: fr.filter((r) => r.state === "dirty" || r.priority === "high").length,
      cleaning: fr.filter((r) => r.state === "cleaning").length,
      inspection: fr.filter((r) => r.state === "inspection").length,
    };
  };

  const wave: ArrivalWavePoint[] = [
    { hour: "08:00", t: 0, ready: 4, expected: 5, due: 6 },
    { hour: "10:00", t: 0.14, ready: 12, expected: 14, due: 16 },
    { hour: "12:00", t: 0.28, ready: 20, expected: 22, due: 28 },
    { hour: "14:00", t: 0.42, ready: 28, expected: 30, due: 36 },
    { hour: "14:20", t: 0.48, ready: 31, expected: 32, due: 42 },
    { hour: "15:00", t: 0.55, ready: 33, expected: 36, due: 42 },
    { hour: "16:00", t: 0.64, ready: 37, expected: 40, due: 42 },
    { hour: "18:00", t: 0.78, ready: 40, expected: 41, due: 42 },
    { hour: "20:00", t: 0.9, ready: 41, expected: 42, due: 42 },
    { hour: "22:00", t: 1, ready: 42, expected: 42, due: 42 },
  ];

  return {
    propertyId: "loc_canal_house",
    propertyLabel: "Mercer House · New York",
    city: "New York",
    clockLabel: HOTEL_LIVE_SCENARIO.clockLabel,
    occupancyPct: 89,
    occupied: 178,
    totalRooms: 200,
    ready: live.ready,
    due: 42,
    atRisk: live.atRiskArrivals,
    arrivalsToday: 42,
    inHouse: 136,
    exposureEuro: live.exposureEuro,
    floors: [8, 7, 6, 5, 4, 3, 2, 1].map(floorMeta),
    rooms,
    selectedFloor: 3,
    selectedRoomId: "room_310",
    wave,
    waveEvents: [
      {
        id: "dep",
        time: "12:00",
        t: 0.28,
        title: "Departures peak",
        detail: "42 due",
        tone: "pos",
      },
      {
        id: "hk",
        time: "14:00",
        t: 0.42,
        title: "Cleaning pressure",
        detail: "24 in HK",
        tone: "watch",
      },
      {
        id: "now",
        time: "14:20",
        t: 0.48,
        title: "NOW",
        detail: "31/42 ready",
        tone: "now",
      },
      {
        id: "wave",
        time: "15:00",
        t: 0.55,
        title: "Check-in wave",
        detail: "42 arrivals · 7 at risk",
        tone: "neg",
      },
    ],
    activeDecisionId: DECISION_IDS.hotelReadiness,
  };
}

export function roomStateLabel(state: LiveRoomState): string {
  switch (state) {
    case "ready":
      return "Ready";
    case "dirty":
      return "Dirty";
    case "cleaning":
      return "Cleaning";
    case "inspection":
      return "Inspection";
    case "ooo":
      return "Out of order";
    case "occupied":
      return "Occupied";
  }
}

export function floorStatusCounts(rooms: HotelLiveRoom[]) {
  return {
    all: rooms.length,
    dirty: rooms.filter((r) => r.state === "dirty").length,
    cleaning: rooms.filter((r) => r.state === "cleaning").length,
    ready: rooms.filter((r) => r.state === "ready").length,
    ooo: rooms.filter((r) => r.state === "ooo").length,
    inspection: rooms.filter((r) => r.state === "inspection").length,
  };
}

/** Matches DemoEstateRegistry hero hotel slug (`loc_canal_house`). */
export const HOTEL_LIVE_PROPERTY_SLUG = "nyc-mercer-house";
export const HOTEL_LIVE_NOW_MINUTES = 14 * 60 + 20; // 14:20

export type HotelLiveTimeOffset = 0 | 30 | 60 | 120;

export function parseTimeOffset(raw: string | null): HotelLiveTimeOffset {
  if (!raw) return 0;
  const n = Number(raw.replace(/^\+/, ""));
  if (n === 30 || n === 60 || n === 120) return n;
  return 0;
}

export function formatClock(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Deterministic room progression for time scrub (never random). */
export function roomAtOffset(
  room: HotelLiveRoom,
  offsetMin: HotelLiveTimeOffset,
): HotelLiveRoom {
  if (offsetMin === 0 || room.state === "ooo" || room.state === "ready") {
    return room;
  }
  if (room.number === "310") {
    if (offsetMin >= 40) {
      return {
        ...room,
        state: "ready",
        priority: "normal",
        cleaningMinutes: null,
        expectedReadyAt: "14:58",
      };
    }
    if (offsetMin >= 30) {
      return {
        ...room,
        state: "inspection",
        cleaningMinutes: 8,
        expectedReadyAt: "14:58",
      };
    }
    if (offsetMin >= 10) {
      return {
        ...room,
        state: "cleaning",
        cleaningMinutes: 22,
        expectedReadyAt: "14:58",
      };
    }
    return room;
  }
  if (room.state === "dirty" && offsetMin >= 60) {
    return { ...room, state: "cleaning", cleaningMinutes: 18 };
  }
  if (room.state === "dirty" && offsetMin >= 30) {
    return { ...room, state: "cleaning", cleaningMinutes: 28 };
  }
  if (room.state === "cleaning" && offsetMin >= 60) {
    return { ...room, state: "ready", cleaningMinutes: null, priority: "normal" };
  }
  if (room.state === "cleaning" && offsetMin >= 30) {
    return { ...room, state: "inspection", cleaningMinutes: 10 };
  }
  return room;
}

export function waveReadyAtOffset(
  wave: ArrivalWavePoint[],
  offsetMin: HotelLiveTimeOffset,
): { ready: number; expected: number; t: number; hour: string } {
  const targetMin = HOTEL_LIVE_NOW_MINUTES + offsetMin;
  const targetHour = formatClock(targetMin);
  // Map [08:00 → 22:00] to t
  const dayStart = 8 * 60;
  const dayEnd = 22 * 60;
  const t = Math.min(
    1,
    Math.max(0, (targetMin - dayStart) / (dayEnd - dayStart)),
  );
  let best = wave[0]!;
  for (const p of wave) {
    if (p.t <= t) best = p;
  }
  return {
    ready: best.ready,
    expected: best.expected,
    t,
    hour: targetHour,
  };
}

export function parseMode(raw: string | null): HotelLiveMode {
  const modes: HotelLiveMode[] = [
    "rooms",
    "housekeeping",
    "arrivals",
    "guests",
    "staff",
    "incidents",
  ];
  if (raw && (modes as string[]).includes(raw)) return raw as HotelLiveMode;
  return "rooms";
}

export type HotelLiveLevel = "estate" | "property";

export function parseLevel(raw: string | null): HotelLiveLevel {
  return raw === "estate" ? "estate" : "property";
}

export type HotelEstateProperty = {
  id: string;
  slug: string;
  name: string;
  city: string;
  x: number;
  y: number;
  occupancyPct: number;
  ready: number;
  due: number;
  atRisk: number;
  exposureEuro: number;
  status: string;
  tone: "ok" | "watch" | "neg";
  driver: string;
  decisionId: string | null;
};

export function hotelLiveEstateModel(): {
  orgLabel: string;
  exposureEuro: number;
  atRisk: number;
  properties: HotelEstateProperty[];
} {
  const metricById: Record<
    string,
    Omit<HotelEstateProperty, "name" | "city" | "slug" | "id">
  > = {
    loc_canal_house: {
      x: 22, y: 38, occupancyPct: 89, ready: 31, due: 42, atRisk: 7,
      exposureEuro: 1840, status: "HK pressure", tone: "neg",
      driver: "Floor 3 readiness · 7 at risk",
      decisionId: DECISION_IDS.hotelReadiness,
    },
    loc_ams_harbour: {
      x: 12, y: 48, occupancyPct: 79, ready: 38, due: 40, atRisk: 1,
      exposureEuro: 220, status: "On plan", tone: "ok",
      driver: "Pickup steady", decisionId: null,
    },
    loc_lisbon_alfama: {
      x: 42, y: 32, occupancyPct: 74, ready: 22, due: 24, atRisk: 0,
      exposureEuro: 90, status: "Healthy", tone: "ok",
      driver: "Direct share strong", decisionId: null,
    },
    loc_berlin_mitte_hotel: {
      x: 55, y: 48, occupancyPct: 86, ready: 36, due: 42, atRisk: 4,
      exposureEuro: 980, status: "Watch", tone: "watch",
      driver: "Late checkout backlog", decisionId: null,
    },
    loc_paris_opera: {
      x: 68, y: 58, occupancyPct: 82, ready: 29, due: 30, atRisk: 1,
      exposureEuro: 310, status: "Healthy", tone: "ok",
      driver: "Strong direct", decisionId: null,
    },
    loc_london_clerkenwell: {
      x: 80, y: 36, occupancyPct: 88, ready: 33, due: 36, atRisk: 2,
      exposureEuro: 540, status: "Watch", tone: "watch",
      driver: "VIP arrivals clustering", decisionId: null,
    },
    loc_munich_airport: {
      x: 86, y: 42, occupancyPct: 93, ready: 40, due: 44, atRisk: 1,
      exposureEuro: 500, status: "On plan", tone: "ok",
      driver: "Flight delay buffer held", decisionId: null,
    },
    loc_sydney_surry_hotel: {
      x: 90, y: 72, occupancyPct: 86, ready: 34, due: 36, atRisk: 0,
      exposureEuro: 90, status: "Healthy", tone: "ok",
      driver: "Weekend demand firm", decisionId: null,
    },
    loc_schiphol_gate: {
      x: 28, y: 58, occupancyPct: 91, ready: 44, due: 48, atRisk: 3,
      exposureEuro: 640, status: "OTA mix", tone: "watch",
      driver: "Channel cost on shoulder", decisionId: null,
    },
    loc_cape_town_waterfront: {
      x: 48, y: 78, occupancyPct: 82, ready: 28, due: 30, atRisk: 1,
      exposureEuro: 210, status: "Watch", tone: "watch",
      driver: "Shoulder pickup soft", decisionId: null,
    },
  };

  const properties: HotelEstateProperty[] = NORTHSTAR_HOTELS.locations.map((loc) => {
    const m = metricById[loc.id] ?? {
      x: 50, y: 50, occupancyPct: 80, ready: 30, due: 32, atRisk: 0,
      exposureEuro: 100, status: "Healthy", tone: "ok" as const,
      driver: "Within plan", decisionId: null,
    };
    const estate = getEstateEntity(loc.id);
    return {
      id: loc.id,
      slug: estate?.slug ?? loc.id,
      name: estate?.name ?? loc.name,
      city: estate?.city ?? loc.city,
      ...m,
    };
  });

  return {
    orgLabel: "Northstar Hotels",
    exposureEuro: properties.reduce((s, p) => s + p.exposureEuro, 0),
    atRisk: properties.reduce((s, p) => s + p.atRisk, 0),
    properties,
  };
}

export type HotelLiveGuestCard = {
  id: string;
  name: string;
  room: string;
  vip: boolean;
  note: string;
  arrivalAt: string | null;
};

export type HotelLiveIncident = {
  id: string;
  room: string;
  title: string;
  detail: string;
  exposureEuro: number;
  nextArrival: string | null;
  action: string;
  tone: "neg" | "watch";
};

export function hotelLiveGuestCards(rooms: HotelLiveRoom[]): HotelLiveGuestCard[] {
  return rooms
    .filter((r) => r.guestName || r.vip)
    .slice(0, 8)
    .map((r) => ({
      id: r.id,
      name: r.guestName ?? "VIP hold",
      room: r.number,
      vip: r.vip,
      note: r.vip
        ? "VIP · preferences on file"
        : r.priority === "high"
          ? "Arrival readiness risk"
          : "In-house / inbound",
      arrivalAt: r.arrivalAt,
    }));
}

export function hotelLiveIncidents(rooms: HotelLiveRoom[]): HotelLiveIncident[] {
  const ooo = rooms.find((r) => r.state === "ooo");
  const dirtyHigh = rooms.filter(
    (r) => r.state === "dirty" && r.priority === "high",
  );
  const list: HotelLiveIncident[] = [];
  if (ooo) {
    list.push({
      id: `inc_${ooo.number}`,
      room: ooo.number,
      title: "OUT OF ORDER",
      detail: "AC fault",
      exposureEuro: ooo.exposureEuro || 420,
      nextArrival: "16:30",
      action: "Reassign guest room",
      tone: "neg",
    });
  }
  for (const r of dirtyHigh.slice(0, 3)) {
    list.push({
      id: `inc_${r.number}`,
      room: r.number,
      title: "Readiness risk",
      detail: `Dirty · arrival ${r.arrivalAt ?? "soon"}`,
      exposureEuro: r.exposureEuro,
      nextArrival: r.arrivalAt,
      action: "Prioritize room",
      tone: "watch",
    });
  }
  return list;
}
