/**
 * Full-viewport delta rain: curated, seeded templates.
 * Density weighted: left (headline) sparse · center mid · right richest.
 */

import type { TerritoryId } from "./brandTokens";

export type DeltaTerritory = TerritoryId;
export type DeltaDepth = "back" | "mid" | "front";

export type DeltaSpec = {
  id: string;
  territory: DeltaTerritory;
  value: string;
  label: string;
  impact: string;
  captureEuro: number;
  material: boolean;
  detail?: {
    expected?: string;
    actual?: string;
    unit?: string;
    annualized?: string;
  };
};

export const DELTA_POOL: DeltaSpec[] = [
  {
    id: "buy_freshco",
    territory: "BUY",
    value: "€418",
    label: "Supplier pricing",
    impact: "€18.6k / yr",
    captureEuro: 418,
    material: true,
    detail: {
      expected: "€31.20",
      actual: "€34.80",
      unit: "€3.60 / case",
      annualized: "€18,620",
    },
  },
  {
    id: "recover_payout",
    territory: "RECOVER",
    value: "€332",
    label: "Delivery payout",
    impact: "Recoverable",
    captureEuro: 332,
    material: true,
  },
  {
    id: "labor_dinner",
    territory: "LABOR",
    value: "€840",
    label: "Dinner staffing",
    impact: "Preventable",
    captureEuro: 840,
    material: true,
  },
  {
    id: "sell_menu",
    territory: "SELL",
    value: "€1.30",
    label: "Menu contribution",
    impact: "€34.2k upside",
    captureEuro: 1300,
    material: true,
  },
  {
    id: "buy_invoice",
    territory: "BUY",
    value: "€84",
    label: "Invoice variance",
    impact: "Repeated",
    captureEuro: 84,
    material: true,
  },
  {
    id: "recover_credit",
    territory: "RECOVER",
    value: "€4.3k",
    label: "Supplier credit",
    impact: "Outstanding",
    captureEuro: 4300,
    material: true,
  },
  {
    id: "sell_channel",
    territory: "SELL",
    value: "€3.60",
    label: "Promotion",
    impact: "Margin drag",
    captureEuro: 360,
    material: true,
  },
  {
    id: "labor_ot",
    territory: "LABOR",
    value: "€1.2k",
    label: "Overtime",
    impact: "Above plan",
    captureEuro: 1200,
    material: true,
  },
  {
    id: "buy_annual",
    territory: "BUY",
    value: "€18.6k / yr",
    label: "Supplier pricing",
    impact: "BUY",
    captureEuro: 1860,
    material: true,
  },
  {
    id: "labor_agency",
    territory: "LABOR",
    value: "€620",
    label: "Agency cost",
    impact: "Preventable",
    captureEuro: 620,
    material: true,
  },
  {
    id: "sell_fee",
    territory: "SELL",
    value: "€218",
    label: "Channel fee",
    impact: "Leakage",
    captureEuro: 218,
    material: true,
  },
  {
    id: "buy_unit",
    territory: "BUY",
    value: "€3.60",
    label: "Unit price",
    impact: "Per case",
    captureEuro: 190,
    material: true,
  },
  // Ambient texture
  { id: "amb_29", territory: "BUY", value: "€29", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_46", territory: "SELL", value: "€46", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_67", territory: "RECOVER", value: "€67", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_76", territory: "BUY", value: "€76", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_91", territory: "LABOR", value: "€91", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_118", territory: "LABOR", value: "€118", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_155", territory: "BUY", value: "€155", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_02", territory: "SELL", value: "0.2 pts", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_11", territory: "BUY", value: "1.1%", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_38", territory: "BUY", value: "€38", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_203", territory: "SELL", value: "€203", label: "", impact: "", captureEuro: 0, material: false },
  { id: "amb_72", territory: "RECOVER", value: "€72", label: "", impact: "", captureEuro: 0, material: false },
];

export type TrailStyle = "beam" | "particles" | "broken";

export type ParticleConfig = {
  slot: number;
  specId: string;
  /** Viewport x%: full width 4→97, density-weighted */
  x: number;
  yStart: number;
  depth: DeltaDepth;
  /** Descent duration seconds */
  duration: number;
  delay: number;
  scale: number;
  opacity: number;
  /** Max horizontal drift px over full descent */
  driftX: number;
  trail: number;
  trailStyle: TrailStyle;
  /** Lands into data-net after detect (material only) */
  lands: boolean;
};

/**
 * ~28 templates · ~20-32 visible with staggered cycles.
 * Left zone thinner · right denser · green-dominant territories.
 */
export const PARTICLE_CONFIGS: ParticleConfig[] = [
  // == FAR / back (CSS-only ambient) ==
  { slot: 0, specId: "amb_29", x: 58, yStart: -12, depth: "back", duration: 18, delay: 0.4, scale: 0.72, opacity: 0.32, driftX: 10, trail: 40, trailStyle: "particles", lands: false },
  { slot: 1, specId: "amb_46", x: 76, yStart: -8, depth: "back", duration: 16.5, delay: 2.2, scale: 0.68, opacity: 0.28, driftX: -8, trail: 40, trailStyle: "beam", lands: false },
  { slot: 2, specId: "amb_67", x: 48, yStart: -14, depth: "back", duration: 17.2, delay: 4.0, scale: 0.7, opacity: 0.26, driftX: 12, trail: 40, trailStyle: "broken", lands: false },
  { slot: 3, specId: "amb_91", x: 68, yStart: -16, depth: "back", duration: 18.5, delay: 1.2, scale: 0.64, opacity: 0.34, driftX: 8, trail: 40, trailStyle: "beam", lands: false },
  { slot: 4, specId: "amb_155", x: 86, yStart: -10, depth: "back", duration: 15.8, delay: 5.5, scale: 0.66, opacity: 0.32, driftX: -10, trail: 40, trailStyle: "particles", lands: false },
  { slot: 5, specId: "amb_02", x: 94, yStart: -9, depth: "back", duration: 16.2, delay: 7.0, scale: 0.62, opacity: 0.30, driftX: -7, trail: 40, trailStyle: "beam", lands: false },
  { slot: 6, specId: "amb_203", x: 62, yStart: -18, depth: "back", duration: 17.4, delay: 8.8, scale: 0.66, opacity: 0.30, driftX: 10, trail: 40, trailStyle: "broken", lands: false },
  { slot: 7, specId: "amb_72", x: 82, yStart: -7, depth: "back", duration: 15.5, delay: 10.5, scale: 0.64, opacity: 0.28, driftX: -11, trail: 40, trailStyle: "particles", lands: false },

  // == MID ==
  { slot: 14, specId: "buy_invoice", x: 62, yStart: -10, depth: "mid", duration: 12.5, delay: 1.0, scale: 0.92, opacity: 0.62, driftX: -14, trail: 100, trailStyle: "beam", lands: false },
  { slot: 15, specId: "sell_fee", x: 78, yStart: -8, depth: "mid", duration: 11.8, delay: 3.4, scale: 0.9, opacity: 0.66, driftX: 12, trail: 100, trailStyle: "particles", lands: false },
  { slot: 16, specId: "labor_agency", x: 54, yStart: -12, depth: "mid", duration: 12.2, delay: 5.2, scale: 0.94, opacity: 0.68, driftX: -10, trail: 110, trailStyle: "broken", lands: false },
  { slot: 17, specId: "buy_unit", x: 72, yStart: -6, depth: "mid", duration: 11.4, delay: 7.0, scale: 0.95, opacity: 0.74, driftX: 14, trail: 120, trailStyle: "beam", lands: true },

  // == MATERIAL / front ==
  { slot: 21, specId: "buy_freshco", x: 58, yStart: -8, depth: "front", duration: 10.2, delay: 1.4, scale: 1.05, opacity: 0.95, driftX: -16, trail: 160, trailStyle: "beam", lands: true },
  { slot: 22, specId: "labor_dinner", x: 66, yStart: -10, depth: "front", duration: 9.8, delay: 3.0, scale: 1.02, opacity: 0.92, driftX: 14, trail: 150, trailStyle: "particles", lands: true },
  { slot: 23, specId: "recover_payout", x: 78, yStart: -6, depth: "front", duration: 9.4, delay: 2.2, scale: 1.08, opacity: 0.98, driftX: -12, trail: 170, trailStyle: "beam", lands: true },
  { slot: 24, specId: "sell_menu", x: 70, yStart: -12, depth: "front", duration: 10.0, delay: 4.8, scale: 1.0, opacity: 0.93, driftX: 10, trail: 150, trailStyle: "broken", lands: true },
  { slot: 25, specId: "recover_credit", x: 88, yStart: -8, depth: "front", duration: 8.8, delay: 6.4, scale: 1.08, opacity: 0.96, driftX: -14, trail: 170, trailStyle: "beam", lands: true },
  { slot: 26, specId: "buy_annual", x: 74, yStart: -14, depth: "front", duration: 10.6, delay: 8.0, scale: 1.1, opacity: 0.95, driftX: 8, trail: 160, trailStyle: "particles", lands: true },
  { slot: 27, specId: "labor_ot", x: 52, yStart: -9, depth: "front", duration: 10.4, delay: 2.6, scale: 1.04, opacity: 0.94, driftX: 9, trail: 150, trailStyle: "beam", lands: true },
  { slot: 28, specId: "sell_channel", x: 83, yStart: -11, depth: "front", duration: 9.6, delay: 5.5, scale: 1.02, opacity: 0.92, driftX: -8, trail: 150, trailStyle: "broken", lands: true },
];

export const SPEC_BY_ID = Object.fromEntries(
  DELTA_POOL.map((s) => [s.id, s]),
) as Record<string, DeltaSpec>;

/** Single radar origin: all hero geometry derives from this.
 * Y sits above VALUE ON RADR (~55px up from the prior 0.71 lock). */
export const RADAR_ORIGIN = { x: 0.69, y: 0.65 } as const;
export const RADAR_OX = RADAR_ORIGIN.x * 100;
export const RADAR_OY = RADAR_ORIGIN.y * 100;
export const BEAM_PERIOD_MS = 9000;
export const BEAM_START_DEG = -25;

export const ACCUMULATOR_BASE = 170_978;
export const ACCUMULATOR_CAP = 178_400;

export function formatAccumEuro(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export const SHORT_LABEL: Record<string, string> = {
  "Supplier pricing": "SUPPLIER PRICING",
  "Dinner staffing": "DINNER STAFFING",
  "Menu contribution": "MENU CONTRIBUTION",
  "Delivery payout": "DELIVERY PAYOUT",
  "Invoice variance": "INVOICE VARIANCE",
  "Supplier credit": "SUPPLIER CREDIT",
  "Channel fee": "CHANNEL FEE",
  "Unit price": "UNIT PRICE",
  Overtime: "OVERTIME",
  Promotion: "PROMOTION",
  "Agency cost": "AGENCY COST",
};
