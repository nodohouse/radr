/**
 * Shift Pulse — live turbulence + time-series for the operating day.
 * Every marker → Decision + € + because. Not a BI chart wall.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { LabSeed } from "./labState";

export type PulseIndustry = "restaurant" | "hotel";
export type PulseWindow = "shift" | "24h";

export type TurbulenceMarker = {
  id: string;
  /** Index into series */
  at: number;
  label: string;
  severity: "calm" | "watch" | "hot";
  euro: number;
  grade: "Expected" | "Verified";
  because: string;
  decisionId: string;
  displayId: string;
  seed?: LabSeed;
};

export type PulseSeriesPoint = {
  t: string;
  /** Minutes from window start */
  m: number;
  moneyIn: number | null; // actual left of NOW
  moneyInForecast: number;
  moneyOut: number | null;
  moneyOutForecast: number;
  net: number | null;
  netForecast: number;
  isNow?: boolean;
};

export type PulseMetric = {
  id: string;
  label: string;
  value: string;
  direction?: "in" | "out" | "net" | "pace";
  because: string;
};

export type ShiftPulseModel = {
  industry: PulseIndustry;
  windowLabel: string;
  netEuro: number;
  netGrade: "Expected" | "Verified";
  netBecause: string;
  paceLabel: string;
  paceBecause: string;
  expectedClose: string;
  metrics: PulseMetric[];
  markers: TurbulenceMarker[];
  series: PulseSeriesPoint[];
  nowIndex: number;
};

/** Berlin Mitte dinner — restaurant service day */
export const RESTAURANT_SERIES: PulseSeriesPoint[] = [
  { t: "18:00", m: 0, moneyIn: 980, moneyInForecast: 1020, moneyOut: 120, moneyOutForecast: 110, net: 860, netForecast: 910 },
  { t: "18:15", m: 15, moneyIn: 1680, moneyInForecast: 1720, moneyOut: 210, moneyOutForecast: 190, net: 1470, netForecast: 1530 },
  { t: "18:30", m: 30, moneyIn: 2480, moneyInForecast: 2550, moneyOut: 380, moneyOutForecast: 320, net: 2100, netForecast: 2230 },
  { t: "18:42", m: 42, moneyIn: 3120, moneyInForecast: 3120, moneyOut: 620, moneyOutForecast: 480, net: 2500, netForecast: 2640, isNow: true },
  { t: "19:00", m: 60, moneyIn: null, moneyInForecast: 4120, moneyOut: null, moneyOutForecast: 890, net: null, netForecast: 3230 },
  { t: "19:15", m: 75, moneyIn: null, moneyInForecast: 4680, moneyOut: null, moneyOutForecast: 980, net: null, netForecast: 3700 },
  { t: "19:30", m: 90, moneyIn: null, moneyInForecast: 5020, moneyOut: null, moneyOutForecast: 1040, net: null, netForecast: 3980 },
  { t: "20:00", m: 120, moneyIn: null, moneyInForecast: 5480, moneyOut: null, moneyOutForecast: 1120, net: null, netForecast: 4360 },
];

export const RESTAURANT_MARKERS: TurbulenceMarker[] = [
  {
    id: "mk_delivery",
    at: 2,
    label: "Delivery spike",
    severity: "watch",
    euro: 180,
    grade: "Expected",
    because: "Channel take +31% vs plan — margin compresses",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
  {
    id: "mk_kitchen",
    at: 3,
    label: "Kitchen 92%",
    severity: "hot",
    euro: 620,
    grade: "Expected",
    because: "38 inbound · seat-now burns 9 second turns",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
  {
    id: "mk_cancel",
    at: 3,
    label: "Walk-aways",
    severity: "watch",
    euro: 210,
    grade: "Expected",
    because: "2 walk-aways after hold — recoverable if Wait-12 holds",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
];

export const RESTAURANT_PULSE: ShiftPulseModel = {
  industry: "restaurant",
  windowLabel: "Tonight · 18:00–close",
  netEuro: 2500,
  netGrade: "Expected",
  netBecause: "Pace behind forecast · Wait-12 still open",
  paceLabel: "−€140 vs forecast",
  paceBecause: "Delivery tax + cancels pulling net under plan",
  expectedClose: "€4,360 Expected",
  metrics: [
    {
      id: "covers_in",
      label: "Value in",
      value: "€3,120",
      direction: "in",
      because: "56 covers seated · second turns still ahead",
    },
    {
      id: "money_out",
      label: "Value out",
      value: "€620",
      direction: "out",
      because: "Delivery take · cancels · comps running",
    },
    {
      id: "at_risk",
      label: "Value at risk",
      value: "€620 Expected",
      direction: "pace",
      because: "Peak compression · Wait-12 still open",
    },
    {
      id: "pace",
      label: "Vs forecast",
      value: "−€140",
      direction: "net",
      because: "Tracking under plan without Wait-12",
    },
  ],
  markers: RESTAURANT_MARKERS,
  series: RESTAURANT_SERIES,
  nowIndex: 3,
};

/** Boutique hotel — arrivals night */
export const HOTEL_SERIES: PulseSeriesPoint[] = [
  { t: "14:00", m: 0, moneyIn: 420, moneyInForecast: 480, moneyOut: 80, moneyOutForecast: 60, net: 340, netForecast: 420 },
  { t: "15:00", m: 60, moneyIn: 980, moneyInForecast: 1100, moneyOut: 180, moneyOutForecast: 140, net: 800, netForecast: 960 },
  { t: "16:00", m: 120, moneyIn: 1680, moneyInForecast: 1820, moneyOut: 320, moneyOutForecast: 240, net: 1360, netForecast: 1580 },
  { t: "17:00", m: 180, moneyIn: 2240, moneyInForecast: 2480, moneyOut: 520, moneyOutForecast: 360, net: 1720, netForecast: 2120, isNow: true },
  { t: "18:00", m: 240, moneyIn: null, moneyInForecast: 3120, moneyOut: null, moneyOutForecast: 480, net: null, netForecast: 2640 },
  { t: "19:00", m: 300, moneyIn: null, moneyInForecast: 3580, moneyOut: null, moneyOutForecast: 540, net: null, netForecast: 3040 },
  { t: "20:00", m: 360, moneyIn: null, moneyInForecast: 3820, moneyOut: null, moneyOutForecast: 580, net: null, netForecast: 3240 },
];

export const HOTEL_MARKERS: TurbulenceMarker[] = [
  {
    id: "mk_ota",
    at: 2,
    label: "OTA tax",
    severity: "watch",
    euro: 280,
    grade: "Expected",
    because: "OTA mix heavy vs direct — contribution diluted",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
  {
    id: "mk_orphan",
    at: 3,
    label: "Orphan nights",
    severity: "hot",
    euro: 640,
    grade: "Expected",
    because: "2 unsold nights after cancel cluster — window to 20:00",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
  {
    id: "mk_noshow",
    at: 3,
    label: "No-show risk",
    severity: "watch",
    euro: 420,
    grade: "Expected",
    because: "3 late cancels · 1 no-show after 18:00",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    seed: "service",
  },
];

export const HOTEL_PULSE: ShiftPulseModel = {
  industry: "hotel",
  windowLabel: "Tonight · arrivals",
  netEuro: 1720,
  netGrade: "Expected",
  netBecause: "Pickup soft · orphan exposure open",
  paceLabel: "−€400 vs forecast",
  paceBecause: "Cancels + OTA tax pulling net under plan",
  expectedClose: "€3,240 Expected",
  metrics: [
    {
      id: "arrivals_in",
      label: "Money in",
      value: "€2,240",
      direction: "in",
      because: "28 OTA · 10 direct · 2 VIP · upgrades pending",
    },
    {
      id: "money_out",
      label: "Money out",
      value: "€520",
      direction: "out",
      because: "Cancels · no-shows · OTA distribution tax",
    },
    {
      id: "net",
      label: "Net now",
      value: "€1,720",
      direction: "net",
      because: "Expected until night audit — not Verified",
    },
    {
      id: "pace",
      label: "Vs forecast",
      value: "−€400",
      direction: "pace",
      because: "Occupancy tracking · orphan risk rising",
    },
  ],
  markers: HOTEL_MARKERS,
  series: HOTEL_SERIES,
  nowIndex: 3,
};

/** Recover / AP window — CFO Monday */
export const RECOVER_SERIES: PulseSeriesPoint[] = [
  { t: "D−14", m: 0, moneyIn: 42000, moneyInForecast: 42000, moneyOut: 9800, moneyOutForecast: 9600, net: 32200, netForecast: 32400 },
  { t: "D−11", m: 3, moneyIn: 44800, moneyInForecast: 45000, moneyOut: 10800, moneyOutForecast: 10200, net: 34000, netForecast: 34800 },
  { t: "D−7", m: 7, moneyIn: 46200, moneyInForecast: 46800, moneyOut: 11600, moneyOutForecast: 10800, net: 34600, netForecast: 36000 },
  { t: "Today", m: 14, moneyIn: 48200, moneyInForecast: 48200, moneyOut: 12400, moneyOutForecast: 11200, net: 35800, netForecast: 37000, isNow: true },
  { t: "D+3", m: 17, moneyIn: null, moneyInForecast: 49800, moneyOut: null, moneyOutForecast: 11800, net: null, netForecast: 38000 },
  { t: "D+7", m: 21, moneyIn: null, moneyInForecast: 51200, moneyOut: null, moneyOutForecast: 12100, net: null, netForecast: 39100 },
];

export const RECOVER_MARKERS: TurbulenceMarker[] = [
  {
    id: "mk_ap",
    at: 3,
    label: "AP credit verified",
    severity: "watch",
    euro: 273,
    grade: "Verified",
    because: "Credit memo applied · matched to original invoice",
    decisionId: DECISION_IDS.supplier,
    displayId: "D-4102",
    seed: "recover",
  },
  {
    id: "mk_po",
    at: 3,
    label: "Above-contract PO held",
    severity: "watch",
    euro: 273,
    grade: "Verified",
    because: "Next PO blocked until verified credit path reviewed",
    decisionId: DECISION_IDS.supplier,
    displayId: "D-4102",
    seed: "recover",
  },
];

export const RECOVER_PULSE: ShiftPulseModel = {
  industry: "restaurant",
  windowLabel: "Rolling 14d · money truth",
  netEuro: 35800,
  netGrade: "Verified",
  netBecause: "One recovered credit · Verified Value banked",
  paceLabel: "−€1,200 vs plan",
  paceBecause: "Prior window before credit applied",
  expectedClose: "€39,100 Expected",
  metrics: [
    {
      id: "value_in",
      label: "Value in",
      value: "€48.2k",
      direction: "in",
      because: "POS close · last 14 nights",
    },
    {
      id: "value_out",
      label: "Value out",
      value: "€12.4k",
      direction: "out",
      because: "AP · delivery tax · comps",
    },
    {
      id: "at_risk",
      label: "Value at risk",
      value: "€410 Expected",
      direction: "pace",
      because: "Open supplier / settlement exceptions still open",
    },
    {
      id: "recovered",
      label: "Value recovered",
      value: "€273 Verified",
      direction: "in",
      because: "Credit memo applied · matched to invoice",
    },
  ],
  markers: RECOVER_MARKERS,
  series: RECOVER_SERIES,
  nowIndex: 3,
};

/** @deprecated alias for chips UI */
export type TurbulenceChip = TurbulenceMarker;

export function pulseForContext(
  seed: LabSeed,
  industry: PulseIndustry = "restaurant",
): ShiftPulseModel {
  if (seed === "recover" || seed === "margin-response") return RECOVER_PULSE;
  if (industry === "hotel") return HOTEL_PULSE;
  return RESTAURANT_PULSE;
}
