/**
 * Service Map demo — physical capacity with economic overlay.
 * Restaurant tables · hotel rooms · apartment units share one primitive.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type ServiceMapMode =
  | "occupancy"
  | "revenue"
  | "pressure"
  | "turns"
  | "readiness"
  | "contribution";

export type ServiceMapVertical = "restaurant" | "hotel" | "apartment";

export type FloorZone = "MAIN" | "BAR" | "TERRACE" | "PREMIUM" | "STANDARD" | "STUDIO";

export type TableState =
  | "occupied"
  | "available"
  | "held"
  | "inbound"
  | "turn_risk"
  | "cancelled"
  | "dirty"
  | "ready"
  | "ooo";

export type ServiceMapUnit = {
  id: string;
  label: string;
  zone: FloorZone;
  seats?: number;
  x: number; // 0–100
  y: number;
  w: number;
  h: number;
  state: TableState;
  party?: string;
  expectedSpendEuro?: number;
  contributionEuro?: number;
  turnMinutes?: number;
  pressure?: number; // 0–100
  channel?: string;
  note?: string;
};

export type ServiceMapSnapshot = {
  locationId: string;
  vertical: ServiceMapVertical;
  at: string;
  phase: string;
  occupancyPct: number;
  kitchenLoadPct?: number;
  units: ServiceMapUnit[];
  inboundCovers?: number;
  walkInsWaiting?: number;
  turnRiskCount?: number;
  decisionId?: string;
};

const BERLIN_NOW: ServiceMapUnit[] = [
  { id: "t1", label: "1", zone: "MAIN", seats: 2, x: 8, y: 18, w: 10, h: 12, state: "occupied", party: "2", expectedSpendEuro: 96, contributionEuro: 38, turnMinutes: 72, pressure: 40 },
  { id: "t2", label: "2", zone: "MAIN", seats: 4, x: 22, y: 16, w: 12, h: 14, state: "occupied", party: "4", expectedSpendEuro: 180, contributionEuro: 72, turnMinutes: 85, pressure: 55 },
  { id: "t3", label: "3", zone: "MAIN", seats: 2, x: 38, y: 18, w: 10, h: 12, state: "turn_risk", party: "2", expectedSpendEuro: 110, contributionEuro: 44, turnMinutes: 98, pressure: 78, note: "Second turn at risk" },
  { id: "t4", label: "4", zone: "MAIN", seats: 4, x: 52, y: 14, w: 12, h: 14, state: "inbound", party: "Res 19:00", expectedSpendEuro: 210, contributionEuro: 84, pressure: 70, note: "Inbound reservation" },
  { id: "t5", label: "5", zone: "MAIN", seats: 6, x: 68, y: 12, w: 14, h: 16, state: "occupied", party: "5", expectedSpendEuro: 260, contributionEuro: 98, turnMinutes: 90, pressure: 62 },
  { id: "t6", label: "6", zone: "MAIN", seats: 2, x: 12, y: 42, w: 10, h: 12, state: "held", party: "Walk-in hold", expectedSpendEuro: 96, contributionEuro: 36, pressure: 85, note: "Hold 12m · wait path" },
  { id: "t7", label: "7", zone: "MAIN", seats: 4, x: 28, y: 40, w: 12, h: 14, state: "occupied", party: "3", expectedSpendEuro: 140, contributionEuro: 52, turnMinutes: 70, pressure: 48 },
  { id: "t8", label: "8", zone: "MAIN", seats: 2, x: 46, y: 42, w: 10, h: 12, state: "turn_risk", party: "2", expectedSpendEuro: 88, contributionEuro: 34, turnMinutes: 105, pressure: 82 },
  { id: "t9", label: "9", zone: "MAIN", seats: 4, x: 62, y: 38, w: 12, h: 14, state: "inbound", party: "Res 18:55", expectedSpendEuro: 190, contributionEuro: 76, pressure: 74 },
  { id: "t10", label: "10", zone: "MAIN", seats: 2, x: 80, y: 40, w: 10, h: 12, state: "available", pressure: 30 },
  { id: "t11", label: "11", zone: "BAR", seats: 2, x: 8, y: 68, w: 9, h: 10, state: "occupied", party: "2", expectedSpendEuro: 64, contributionEuro: 28, pressure: 45 },
  { id: "t12", label: "12", zone: "BAR", seats: 2, x: 20, y: 68, w: 9, h: 10, state: "held", party: "VIP · 18:50", expectedSpendEuro: 140, contributionEuro: 58, pressure: 60, note: "VIP constraint" },
  { id: "t13", label: "13", zone: "BAR", seats: 2, x: 32, y: 70, w: 9, h: 10, state: "available", pressure: 35 },
  { id: "t14", label: "14", zone: "MAIN", seats: 4, x: 48, y: 66, w: 12, h: 14, state: "cancelled", party: "Cancelled", expectedSpendEuro: 184, contributionEuro: 0, pressure: 20, note: "Recover · waitlist prepared" },
  { id: "t15", label: "15", zone: "MAIN", seats: 2, x: 66, y: 68, w: 10, h: 12, state: "turn_risk", party: "2", expectedSpendEuro: 92, contributionEuro: 36, turnMinutes: 100, pressure: 80 },
  { id: "t16", label: "16", zone: "TERRACE", seats: 4, x: 82, y: 66, w: 12, h: 14, state: "available", pressure: 15, note: "Rain risk · terrace soft" },
  { id: "t17", label: "17", zone: "MAIN", seats: 4, x: 14, y: 86, w: 12, h: 10, state: "occupied", party: "4", expectedSpendEuro: 170, contributionEuro: 68, pressure: 50 },
  { id: "t18", label: "18", zone: "MAIN", seats: 2, x: 32, y: 86, w: 10, h: 10, state: "inbound", party: "38 covers · 22m", expectedSpendEuro: 121, contributionEuro: 48, pressure: 88, note: "Wave inbound" },
  { id: "t19", label: "19", zone: "MAIN", seats: 6, x: 50, y: 84, w: 14, h: 12, state: "turn_risk", party: "6", expectedSpendEuro: 280, contributionEuro: 110, turnMinutes: 110, pressure: 90 },
  { id: "t20", label: "20", zone: "MAIN", seats: 2, x: 72, y: 86, w: 10, h: 10, state: "held", party: "Walk-in 2", expectedSpendEuro: 96, contributionEuro: 36, pressure: 84 },
];

function cloneUnits(src: ServiceMapUnit[], mut: (u: ServiceMapUnit) => ServiceMapUnit) {
  return src.map(mut);
}

export function berlinServiceSnapshots(): Record<string, ServiceMapSnapshot> {
  const base: ServiceMapSnapshot = {
    locationId: DEMO_LOCATIONS.berlin.id,
    vertical: "restaurant",
    at: "18:42",
    phase: "Building → peak",
    occupancyPct: 78,
    kitchenLoadPct: 92,
    inboundCovers: 38,
    walkInsWaiting: 2,
    turnRiskCount: 9,
    decisionId: DECISION_IDS.peak,
    units: BERLIN_NOW,
  };

  const at1900Seat: ServiceMapSnapshot = {
    ...base,
    at: "19:00",
    phase: "Peak · seat-now path",
    occupancyPct: 94,
    kitchenLoadPct: 97,
    turnRiskCount: 12,
    units: cloneUnits(BERLIN_NOW, (u) => {
      if (u.state === "held" || u.state === "available") {
        return { ...u, state: "occupied", pressure: Math.min(100, (u.pressure ?? 50) + 25), note: "Seated into peak" };
      }
      if (u.state === "turn_risk") {
        return { ...u, pressure: Math.min(100, (u.pressure ?? 70) + 15) };
      }
      return { ...u, pressure: Math.min(100, (u.pressure ?? 40) + 10) };
    }),
  };

  const at1900Wait: ServiceMapSnapshot = {
    ...base,
    at: "19:00",
    phase: "Peak · wait-12 path",
    occupancyPct: 82,
    kitchenLoadPct: 88,
    turnRiskCount: 5,
    units: cloneUnits(BERLIN_NOW, (u) => {
      if (u.id === "t6" || u.id === "t20") {
        return { ...u, state: "held", pressure: 55, note: "Still holding · pressure easing" };
      }
      if (u.state === "turn_risk") {
        return { ...u, pressure: Math.max(40, (u.pressure ?? 80) - 18), state: "occupied" };
      }
      return { ...u, pressure: Math.max(20, (u.pressure ?? 50) - 8) };
    }),
  };

  return {
    "18:42": base,
    "18:00": { ...base, at: "18:00", phase: "Building", occupancyPct: 54, kitchenLoadPct: 61, turnRiskCount: 2 },
    "19:00": at1900Wait,
    "19:00_seat": at1900Seat,
    "20:00": {
      ...base,
      at: "20:00",
      phase: "Peak recovering",
      occupancyPct: 86,
      kitchenLoadPct: 79,
      turnRiskCount: 3,
    },
    "21:00": {
      ...base,
      at: "21:00",
      phase: "Closing",
      occupancyPct: 48,
      kitchenLoadPct: 44,
      turnRiskCount: 0,
    },
  };
}

export function canalRoomSnapshot(): ServiceMapSnapshot {
  const rooms: ServiceMapUnit[] = [];
  let i = 0;
  for (const floor of [1, 2, 3]) {
    for (const n of [1, 2, 3, 4, 5, 6]) {
      i += 1;
      const premium = n <= 2;
      const state: TableState =
        i === 3 || i === 8 || i === 11 || i === 14
          ? "available"
          : i === 5
            ? "dirty"
            : i === 9
              ? "ooo"
              : "occupied";
      rooms.push({
        id: `r${floor}${n}`,
        label: `${floor}0${n}`,
        zone: premium ? "PREMIUM" : "STANDARD",
        x: ((n - 1) % 6) * 15 + 6,
        y: (floor - 1) * 28 + 12,
        w: 12,
        h: 18,
        state,
        contributionEuro: premium ? 429 : 280,
        channel: state === "available" && premium ? "Hold direct" : undefined,
        note:
          state === "available" && premium
            ? "Premium · direct hold candidate"
            : state === "ooo"
              ? "Out of order"
              : undefined,
        pressure: state === "available" ? 20 : 50,
      });
    }
  }
  return {
    locationId: DEMO_LOCATIONS.canal.id,
    vertical: "hotel",
    at: "Today",
    phase: "Inventory · 72h",
    occupancyPct: 89,
    units: rooms,
    decisionId: DECISION_IDS.ota,
  };
}

export function chiadoUnitSnapshot(): ServiceMapSnapshot {
  const units: ServiceMapUnit[] = [];
  for (let d = 0; d < 7; d++) {
    for (let u = 0; u < 4; u++) {
      const orphan = d === 3 && u === 1;
      units.push({
        id: `u${u}_d${d}`,
        label: orphan ? "U24" : `U${20 + u}`,
        zone: u % 2 === 0 ? "STUDIO" : "STANDARD",
        x: d * 13 + 4,
        y: u * 20 + 14,
        w: 11,
        h: 16,
        state: orphan ? "available" : d < 3 || d > 4 ? "occupied" : "dirty",
        contributionEuro: orphan ? 112 : 95,
        note: orphan ? "Orphan night · T−72h" : undefined,
        pressure: orphan ? 70 : 30,
      });
    }
  }
  return {
    locationId: DEMO_LOCATIONS.chiado.id,
    vertical: "apartment",
    at: "Week view",
    phase: "Unit nights",
    occupancyPct: 71,
    units,
    decisionId: DECISION_IDS.orphan,
  };
}
