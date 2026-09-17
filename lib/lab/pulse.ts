import { SERVICE_CLOCK } from "./clock";
import { parseHm } from "./format";
import { DECISION } from "./ids";
import type {
  Industry,
  PulseModel,
  PulsePoint,
  PulseSeries,
  PulseWindow,
  SeedId,
  TurbulenceMark,
} from "./types";

const RESTAURANT_SERIES: PulseSeries[] = [
  { id: "in", label: "Money IN · covers", direction: "in", color: "#00b96b" },
  { id: "out", label: "Money OUT · tax / cancels / comps", direction: "out", color: "#c45a4a" },
  { id: "net", label: "Net contribution", direction: "net", color: "#121212" },
  { id: "forecast", label: "Forecast close", direction: "forecast", color: "#00c853" },
];

const HOTEL_SERIES: PulseSeries[] = [
  { id: "in", label: "Money IN · rooms / upsells", direction: "in", color: "#00b96b" },
  { id: "out", label: "Money OUT · cancels / OTA / refunds", direction: "out", color: "#c45a4a" },
  { id: "net", label: "Net contribution", direction: "net", color: "#121212" },
  { id: "forecast", label: "Forecast / pickup", direction: "forecast", color: "#00c853" },
];

function point(
  t: string,
  inEuro: number,
  outEuro: number,
  forecastEuro: number,
): PulsePoint {
  return {
    t,
    minutes: parseHm(t),
    inEuro,
    outEuro,
    netEuro: inEuro - outEuro,
    forecastEuro,
  };
}

/** Restaurant dinner: covers IN vs delivery/cancel/comp OUT. Calculated, not LLM-invented. */
const SERVICE_SHIFT: PulsePoint[] = [
  point("18:00", 180, 40, 220),
  point("18:06", 520, 130, 540),
  point("18:12", 980, 280, 1020),
  point("18:18", 1480, 490, 1580),
  point("18:24", 2100, 740, 2280),
  point("18:30", 2780, 960, 3040),
  point("18:36", 3480, 1150, 3820),
  point("18:42", 4120, 1280, 4580),
  point("19:00", 4120, 1280, 5200),
  point("20:00", 4120, 1280, 6100),
  point("21:00", 4120, 1280, 6680),
  point("22:00", 4120, 1280, 7040),
];

const SERVICE_DAY: PulsePoint[] = [
  point("08:00", 0, 0, 40),
  point("10:00", 210, 40, 280),
  point("12:00", 980, 220, 1180),
  point("14:00", 1640, 410, 1980),
  point("16:00", 1860, 520, 2460),
  point("18:00", 2040, 560, 2680),
  ...SERVICE_SHIFT.filter((p) => p.minutes > parseHm("18:00")).map((p) => ({
    ...p,
    inEuro: p.inEuro + 1860,
    outEuro: p.outEuro + 520,
    netEuro: p.inEuro + 1860 - (p.outEuro + 520),
    forecastEuro: p.forecastEuro + 2460,
  })),
];

const HOTEL_SHIFT: PulsePoint[] = [
  point("14:00", 420, 80, 480),
  point("15:00", 980, 210, 1120),
  point("16:00", 1640, 390, 1860),
  point("17:00", 2280, 620, 2640),
  point("18:00", 2860, 880, 3380),
  point("18:42", 3420, 1180, 4120),
  point("20:00", 3420, 1180, 4680),
  point("22:00", 3420, 1180, 5100),
];

const HOTEL_DAY: PulsePoint[] = [
  point("00:00", 0, 0, 80),
  point("06:00", 180, 40, 320),
  point("10:00", 640, 160, 980),
  point("14:00", 1280, 340, 1860),
  ...HOTEL_SHIFT.filter((p) => p.minutes > parseHm("14:00")).map((p) => ({
    ...p,
    inEuro: p.inEuro + 860,
    outEuro: p.outEuro + 260,
    netEuro: p.inEuro + 860 - (p.outEuro + 260),
    forecastEuro: p.forecastEuro + 980,
  })),
];

const RECOVER_SHIFT: PulsePoint[] = [
  point("04 Sep", 31800, 7900, 24100),
  point("07 Sep", 36400, 9100, 27600),
  point("10 Sep", 40100, 10200, 30100),
  point("13 Sep", 43800, 11180, 32800),
  point("16 Sep", 46800, 12120, 34800),
  point("17 Sep", 48200, 12400, 35800),
].map((p, i) => ({
  ...p,
  minutes: 4 + i * 2,
  t: p.t,
}));

const SERVICE_TURBULENCE: TurbulenceMark[] = [
  {
    id: "t_delivery",
    minutes: parseHm("18:24"),
    t: "18:24",
    label: "Delivery spike",
    severity: "watch",
    euro: 180,
    grade: "Expected",
    because: "Delivery +31% vs plan · channel take compressing dine-in contribution",
    decisionId: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
  },
  {
    id: "t_cancels",
    minutes: parseHm("18:30"),
    t: "18:30",
    label: "Cancel cluster",
    severity: "hot",
    euro: 210,
    grade: "Expected",
    because: "2 walk-aways after 18:30 hold · recoverable if Wait-12 holds",
    decisionId: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
  },
  {
    id: "t_kitchen",
    minutes: parseHm("18:36"),
    t: "18:36",
    label: "Kitchen 92%",
    severity: "hot",
    euro: 620,
    grade: "Expected",
    because: "38 inbound + delivery pressure → Wait-12 protects second turns",
    decisionId: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
  },
];

const HOTEL_TURBULENCE: TurbulenceMark[] = [
  {
    id: "t_ota",
    minutes: parseHm("17:00"),
    t: "17:00",
    label: "OTA mix heavy",
    severity: "watch",
    euro: 420,
    grade: "Expected",
    because: "OTA take dilutes contribution vs direct · hold remaining premium on direct",
    decisionId: DECISION.hotelOta.id,
    displayId: DECISION.hotelOta.displayId,
  },
  {
    id: "t_orphan",
    minutes: parseHm("18:42"),
    t: "18:42",
    label: "Orphan-night risk",
    severity: "hot",
    euro: 640,
    grade: "Expected",
    because: "2 unsold nights after cancellation cluster · release / reprice window closes 20:00",
    decisionId: DECISION.hotelOrphan.id,
    displayId: DECISION.hotelOrphan.displayId,
  },
];

const RECOVER_TURBULENCE: TurbulenceMark[] = [
  {
    id: "t_ap",
    minutes: 14,
    t: "16 Sep",
    label: "AP variance",
    severity: "hot",
    euro: 273,
    grade: "Expected",
    because: "INV-88421 above contract €6.80/L · credit memo not posted",
    decisionId: DECISION.supplier.id,
    displayId: DECISION.supplier.displayId,
  },
];

export function industryForSeed(seed: SeedId): Industry {
  return seed === "hotel" ? "hotel" : "restaurant";
}

export function getPulseModel(seed: SeedId, window: PulseWindow = "shift"): PulseModel {
  if (seed === "hotel") {
    const points = window === "24h" ? HOTEL_DAY : HOTEL_SHIFT;
    const lastActual = points.filter((p) => p.minutes <= SERVICE_CLOCK.nowMinutes).at(-1) ?? points[0];
    return {
      industry: "hotel",
      seed,
      window,
      windowLabel: window === "24h" ? "Rolling 24h · arrivals" : "Tonight · arrivals / pickup",
      netEuro: lastActual.netEuro,
      netGrade: "Expected",
      netBecause: "2 orphan nights · OTA mix heavy · direct still open",
      forecastCloseEuro: 5100,
      forecastBecause: "Pickup vs occupancy · orphan-night risk until 20:00 — Expected, not Verified",
      series: HOTEL_SERIES,
      points,
      actualThroughMinutes: SERVICE_CLOCK.nowMinutes,
      turbulence: HOTEL_TURBULENCE,
      legendNote: "IN = arrivals + room + upsells · OUT = cancels / no-shows / refunds / OTA tax",
    };
  }

  if (seed === "recover") {
    const last = RECOVER_SHIFT.at(-1)!;
    return {
      industry: "restaurant",
      seed,
      window,
      windowLabel: "Rolling 14d · money out",
      netEuro: last.inEuro - last.outEuro,
      netGrade: "Expected",
      netBecause: "AP variance open · credit memo not posted",
      forecastCloseEuro: 35800,
      forecastBecause: "14-night POS close vs AP · €273 variance stays Expected until CM posts",
      series: [
        { id: "in", label: "Money IN · POS close", direction: "in", color: "#00b96b" },
        { id: "out", label: "Money OUT · AP + variance", direction: "out", color: "#c45a4a" },
        { id: "net", label: "Net contribution", direction: "net", color: "#121212" },
        { id: "forecast", label: "Forecast / tracking", direction: "forecast", color: "#00c853" },
      ],
      points: RECOVER_SHIFT,
      actualThroughMinutes: 17,
      turbulence: RECOVER_TURBULENCE,
      legendNote: "IN = POS close · OUT = AP + invoice variance · Verified €2,830 is a separate ledger line",
    };
  }

  const points = window === "24h" ? SERVICE_DAY : SERVICE_SHIFT;
  const lastActual =
    points.filter((p) => p.minutes <= SERVICE_CLOCK.nowMinutes).at(-1) ?? points[0];
  return {
    industry: "restaurant",
    seed,
    window,
    windowLabel: window === "24h" ? "Rolling 24h · service day" : "Tonight · 18:00–now",
    netEuro: lastActual.netEuro,
    netGrade: "Expected",
    netBecause: "Covers hold · delivery tax rising · Wait-12 still open",
    forecastCloseEuro: window === "24h" ? 9500 : 7040,
    forecastBecause: "Expected close if Wait-12 holds second turns — not Verified until POS close",
    series: RESTAURANT_SERIES,
    points,
    actualThroughMinutes: SERVICE_CLOCK.nowMinutes,
    turbulence: SERVICE_TURBULENCE,
    legendNote: "IN = seated contribution · OUT = delivery take + cancels/walk-aways + comps/voids",
  };
}

export function pulseNowPoint(model: PulseModel): PulsePoint {
  const actual = model.points.filter((p) => p.minutes <= model.actualThroughMinutes);
  return actual.at(-1) ?? model.points[0]!;
}
