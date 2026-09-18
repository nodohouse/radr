/**
 * Berlin Mitte floor: 72 seats across Main / Bar / Terrace.
 * Table seat sum must equal venue profile seats (72).
 *
 * Geometry rule: every section has a reserved header band
 * (SECTION_HEADER_HEIGHT + SECTION_HEADER_GAP). Tables live only
 * in the canvas below that band, never in the header safe zone.
 *
 * Main Dining 42 · Bar 12 · Terrace 18
 */

import type { FloorPlan, ServiceTimeKey, TableMoment } from "./floorModel";
import {
  SECTION_HEADER_GAP,
  SECTION_HEADER_HEIGHT,
  validateFloorGeometry,
} from "./floorModel";
import { BERLIN_TONIGHT_FORECAST, BERLIN_TONIGHT_OPS } from "./venueProfiles";

const SPEND = BERLIN_TONIGHT_OPS.expectedSpendPerCover;

/** Header band + gap before table canvas. */
const HEADER = SECTION_HEADER_HEIGHT + SECTION_HEADER_GAP; // 86

export const BERLIN_FLOOR: FloorPlan = {
  id: "floor_ber",
  locationId: "loc_ber",
  name: "Berlin Mitte",
  width: 680,
  height: 520,
  seats: 72,
  sections: [
    {
      id: "main",
      name: "Main Dining",
      capacity: 42,
      assignedFoh: 2,
      x: 20,
      y: 24,
      width: 400,
      height: 470,
      servers: [
        {
          id: "foh_lena",
          name: "Lena K.",
          short: "LENA",
          sectionId: "main",
          role: "server",
        },
        {
          id: "foh_marco",
          name: "Marco V.",
          short: "MARCO",
          sectionId: "main",
          role: "server",
        },
      ],
    },
    {
      id: "bar",
      name: "Bar",
      capacity: 12,
      assignedFoh: 1,
      x: 440,
      y: 24,
      width: 220,
      height: 200,
      servers: [
        {
          id: "foh_sofia",
          name: "Sofia R.",
          short: "SOFIA",
          sectionId: "bar",
          role: "server",
        },
      ],
    },
    {
      id: "terrace",
      name: "Terrace",
      capacity: 18,
      assignedFoh: 1,
      x: 440,
      y: 244,
      width: 220,
      height: 250,
      servers: [
        {
          id: "foh_jonas",
          name: "Jonas M.",
          short: "JONAS",
          sectionId: "terrace",
          role: "server",
        },
      ],
    },
  ],
  kitchen: [
    {
      id: "ks_expo",
      name: "Expo",
      person: "Ana P.",
      picking: "Pass · ticket pacing",
    },
    {
      id: "ks_hot",
      name: "Hot line",
      person: "Kai N.",
      picking: "Mains · grill",
    },
    {
      id: "ks_cold",
      name: "Cold / garde",
      person: "Mira S.",
      picking: "Starters · Tataki",
    },
  ],
  tables: [
    // Main · canvas y ≈ 110–494 · Lena left / Marco right of mid (x=220)
    // Row 1
    {
      id: "t01",
      label: "1",
      x: 44,
      y: 122,
      width: 52,
      height: 52,
      shape: "round",
      seats: 2,
      sectionId: "main",
    },
    {
      id: "t02",
      label: "2",
      x: 124,
      y: 122,
      width: 52,
      height: 52,
      shape: "round",
      seats: 2,
      sectionId: "main",
    },
    {
      id: "t03",
      label: "3",
      x: 248,
      y: 118,
      width: 64,
      height: 64,
      shape: "rect",
      seats: 4,
      sectionId: "main",
    },
    {
      id: "t04",
      label: "4",
      x: 340,
      y: 118,
      width: 64,
      height: 64,
      shape: "rect",
      seats: 4,
      sectionId: "main",
    },
    // Row 2
    {
      id: "t06",
      label: "6",
      x: 44,
      y: 248,
      width: 64,
      height: 64,
      shape: "rect",
      seats: 4,
      sectionId: "main",
    },
    {
      id: "t07",
      label: "7",
      x: 136,
      y: 248,
      width: 64,
      height: 64,
      shape: "rect",
      seats: 4,
      sectionId: "main",
    },
    {
      id: "t08",
      label: "8",
      x: 248,
      y: 252,
      width: 72,
      height: 60,
      shape: "rect",
      seats: 4,
      sectionId: "main",
      combinableWith: ["t09", "t12"],
    },
    {
      id: "t09",
      label: "9",
      x: 340,
      y: 252,
      width: 64,
      height: 60,
      shape: "rect",
      seats: 4,
      sectionId: "main",
      combinableWith: ["t08"],
    },
    // Row 3 · fills lower main dining
    {
      id: "t11",
      label: "11",
      x: 44,
      y: 392,
      width: 52,
      height: 52,
      shape: "round",
      seats: 2,
      sectionId: "main",
    },
    {
      id: "t12",
      label: "12",
      x: 120,
      y: 384,
      width: 152,
      height: 68,
      shape: "rect",
      seats: 8,
      sectionId: "main",
      combinableWith: ["t08"],
    },
    {
      id: "t14",
      label: "14",
      x: 300,
      y: 384,
      width: 96,
      height: 68,
      shape: "rect",
      seats: 4,
      sectionId: "main",
    },

    // Bar · canvas y ≈ 110–224
    {
      id: "b1",
      label: "B1",
      x: 456,
      y: 118,
      width: 48,
      height: 48,
      shape: "round",
      seats: 2,
      sectionId: "bar",
    },
    {
      id: "b2",
      label: "B2",
      x: 520,
      y: 118,
      width: 48,
      height: 48,
      shape: "round",
      seats: 2,
      sectionId: "bar",
    },
    {
      id: "b3",
      label: "B3",
      x: 584,
      y: 118,
      width: 60,
      height: 48,
      shape: "rect",
      seats: 4,
      sectionId: "bar",
    },
    {
      id: "b4",
      label: "B4",
      x: 456,
      y: 182,
      width: 72,
      height: 32,
      shape: "rect",
      seats: 2,
      sectionId: "bar",
    },
    {
      id: "b5",
      label: "B5",
      x: 548,
      y: 182,
      width: 72,
      height: 32,
      shape: "rect",
      seats: 2,
      sectionId: "bar",
    },

    // Terrace · canvas y ≈ 330–494
    {
      id: "tr1",
      label: "T1",
      x: 456,
      y: 344,
      width: 60,
      height: 60,
      shape: "rect",
      seats: 4,
      sectionId: "terrace",
    },
    {
      id: "tr2",
      label: "T2",
      x: 536,
      y: 344,
      width: 60,
      height: 60,
      shape: "rect",
      seats: 4,
      sectionId: "terrace",
    },
    {
      id: "tr3",
      label: "T3",
      x: 616,
      y: 352,
      width: 36,
      height: 44,
      shape: "round",
      seats: 2,
      sectionId: "terrace",
    },
    {
      id: "tr4",
      label: "T4",
      x: 456,
      y: 420,
      width: 60,
      height: 60,
      shape: "rect",
      seats: 4,
      sectionId: "terrace",
    },
    {
      id: "tr5",
      label: "T5",
      x: 536,
      y: 428,
      width: 44,
      height: 44,
      shape: "round",
      seats: 2,
      sectionId: "terrace",
    },
    {
      id: "tr6",
      label: "T6",
      x: 596,
      y: 420,
      width: 56,
      height: 60,
      shape: "rect",
      seats: 2,
      sectionId: "terrace",
    },
  ],
};

const seatSum = BERLIN_FLOOR.tables.reduce((s, t) => s + t.seats, 0);
if (seatSum !== BERLIN_FLOOR.seats) {
  throw new Error(`[floor] seat sum ${seatSum} ≠ plan ${BERLIN_FLOOR.seats}`);
}

const geometryIssues = validateFloorGeometry(BERLIN_FLOOR);
if (geometryIssues.length > 0) {
  throw new Error(
    `[floor] geometry failures:\n${geometryIssues.map((i) => `  - ${i.message}`).join("\n")}`,
  );
}

/** Table states by service time: simulated from tonight ops. */
export const BERLIN_FLOOR_MOMENTS: Record<ServiceTimeKey, TableMoment[]> = {
  now: [
    {
      tableId: "t03",
      state: "RESERVED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_sophie",
      note: "Sophie · Tataki · Dom Pérignon",
    },
    {
      tableId: "t12",
      state: "RESERVED",
      covers: 12,
      expectedSpend: 12 * SPEND,
      reservationId: "r_g1",
      note: "Group · tables 12+8 · deposit €200",
    },
    {
      tableId: "t08",
      state: "RESERVED",
      covers: 7,
      expectedSpend: 7 * SPEND,
      reservationId: "r_g2",
      note: "Group · 20:00",
    },
    {
      tableId: "t14",
      state: "CANCELLED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_late",
      note: "Late cancel · €184 recoverable",
    },
    { tableId: "t01", state: "RESERVED", covers: 2, expectedSpend: 2 * SPEND },
    { tableId: "t06", state: "RESERVED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "tr1", state: "RESERVED", covers: 4, expectedSpend: 4 * SPEND },
  ],
  "18:00": [
    { tableId: "t01", state: "SEATED", covers: 2, expectedSpend: 2 * SPEND },
    { tableId: "t06", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "b3", state: "SEATED", covers: 3, expectedSpend: 3 * SPEND },
    {
      tableId: "t12",
      state: "RESERVED",
      covers: 12,
      expectedSpend: 12 * SPEND,
    },
    {
      tableId: "t14",
      state: "CANCELLED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      note: "Released · at risk",
    },
  ],
  "19:00": [
    {
      tableId: "t03",
      state: "SEATED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_sophie",
      note: "Sophie · Tataki · Dom Pérignon",
    },
    { tableId: "t04", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "t06", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    {
      tableId: "t07",
      state: "SEATED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_daniel",
    },
    {
      tableId: "t12",
      state: "RESERVED",
      covers: 12,
      expectedSpend: 12 * SPEND,
      note: "Arriving 19:30",
    },
    { tableId: "t08", state: "RESERVED", covers: 7, expectedSpend: 7 * SPEND },
    {
      tableId: "t14",
      state: "CANCELLED",
      covers: 4,
      expectedSpend: 4 * SPEND,
    },
    { tableId: "tr1", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "tr2", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "b1", state: "SEATED", covers: 2, expectedSpend: 2 * SPEND },
  ],
  "20:00": [
    {
      tableId: "t12",
      state: "SEATED",
      covers: 12,
      expectedSpend: 12 * SPEND,
      note: "Group",
    },
    {
      tableId: "t08",
      state: "SEATED",
      covers: 7,
      expectedSpend: 7 * SPEND,
      note: "Group",
    },
    {
      tableId: "t03",
      state: "SEATED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_sophie",
    },
    { tableId: "t04", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "t06", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    {
      tableId: "t07",
      state: "SEATED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      reservationId: "r_daniel",
    },
    {
      tableId: "t14",
      state: "CANCELLED",
      covers: 4,
      expectedSpend: 4 * SPEND,
      note: "Released · €184 recoverable",
    },
    { tableId: "tr1", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "tr4", state: "AVAILABLE", note: "Prime-time empty" },
    { tableId: "tr5", state: "AVAILABLE", note: "Prime-time empty" },
    { tableId: "tr6", state: "AVAILABLE", note: "Prime-time empty" },
  ],
  "21:00": [
    { tableId: "t12", state: "TURNING" },
    { tableId: "t08", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "t04", state: "SEATED", covers: 2, expectedSpend: 2 * SPEND },
    { tableId: "b3", state: "SEATED", covers: 4, expectedSpend: 4 * SPEND },
    { tableId: "tr1", state: "AVAILABLE" },
  ],
};

/** Section revenue must reconcile with tonight forecast (€9,088). */
export const SECTION_REVENUE_TONIGHT = {
  main: 5400,
  bar: 1600,
  terrace: BERLIN_TONIGHT_FORECAST.revenue - 5400 - 1600,
} as const;
