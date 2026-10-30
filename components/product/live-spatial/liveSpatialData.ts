/**
 * RADR Live Spatial — deterministic restaurant operating model.
 * SIMULATED LIVE DEMO · not production telemetry.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type LiveLevel = "estate" | "venue";
export type LiveLens = "operations" | "financial";
export type LiveHorizon = "now" | "30" | "60" | "120";
export type LiveZoneId =
  | "main"
  | "kitchen"
  | "bar"
  | "terrace"
  | "delivery"
  | "entrance";
export type LiveStationId = "hot" | "cold" | "prep" | "pass" | "dish";
export type LiveSeverity = "healthy" | "watch" | "pressure" | "intervene";

export type ZoneLens = {
  title: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  severity: LiveSeverity;
  severityLabel: string;
};

export type InspectorMetric = { label: string; value: string; after?: string };

export type ZoneInspector = {
  zone: LiveZoneId;
  headline: string;
  severity: LiveSeverity;
  severityLabel: string;
  metrics: InspectorMetric[];
  bottleneck?: string;
  cause?: string;
  next30?: string;
  financial?: string;
  radrSees: string;
  decision: string;
  decisionId: string;
  expected: { label: string; before: string; after: string }[];
  expectedValue: string;
  confidence: string;
  compare?: {
    doNothing: string[];
    radr: string[];
  };
};

export type StationInspector = {
  id: LiveStationId;
  label: string;
  metrics: InspectorMetric[];
  radrSees: string;
};

export type TableInspector = {
  id: string;
  zone: LiveZoneId;
  covers: number;
  seated: string;
  stage: string;
  ticket: string;
  expectedFinish: string;
  nextReservation: string;
  turnRisk: "LOW" | "MED" | "HIGH";
  radrSees: string;
  actions: string[];
};

export type LiveEvent = {
  id: string;
  at: string;
  label: string;
  zone: LiveZoneId;
  category: string;
};

export type FreshnessRow = {
  id: string;
  label: string;
  ago: string;
  demo: boolean;
};

export const ZONE_ORDER: LiveZoneId[] = [
  "main",
  "kitchen",
  "bar",
  "terrace",
  "delivery",
  "entrance",
];

export const OVERVIEW_CAMERA = { x: 0, y: 20, w: 960, h: 640 };

/** Milder zoom — stay within ~2× of 4K master; detail plates cover focus */
export const ZONE_CAMERA: Record<
  LiveZoneId,
  { x: number; y: number; w: number; h: number }
> = {
  main: { x: 220, y: 120, w: 520, h: 380 },
  kitchen: { x: 520, y: 160, w: 420, h: 360 },
  bar: { x: 400, y: 60, w: 400, h: 300 },
  terrace: { x: 20, y: 160, w: 420, h: 360 },
  delivery: { x: 560, y: 340, w: 380, h: 280 },
  entrance: { x: 160, y: 40, w: 320, h: 240 },
};

export const ZONE_LABEL_AT: Record<LiveZoneId, { x: number; y: number }> = {
  terrace: { x: 160, y: 300 },
  main: { x: 420, y: 280 },
  kitchen: { x: 740, y: 300 },
  bar: { x: 560, y: 130 },
  delivery: { x: 780, y: 460 },
  entrance: { x: 280, y: 100 },
};

export const STATION_HITS: Record<
  LiveStationId,
  { x: number; y: number; w: number; h: number; label: string }
> = {
  prep: { x: 620, y: 240, w: 62, h: 30, label: "Prep" },
  cold: { x: 690, y: 230, w: 58, h: 30, label: "Cold" },
  hot: { x: 760, y: 250, w: 72, h: 34, label: "Hot" },
  pass: { x: 700, y: 320, w: 70, h: 26, label: "Pass" },
  dish: { x: 640, y: 340, w: 50, h: 28, label: "Dish" },
};

export const LOCATION_SLUG = "nyc-soho";
export const LOCATION_ID = "loc_berlin_mitte";
export const CLOCK_LABEL = "19:48";

export const FRESHNESS: FreshnessRow[] = [
  { id: "pos", label: "POS", ago: "12s", demo: true },
  { id: "kds", label: "KDS", ago: "8s", demo: true },
  { id: "del", label: "Delivery", ago: "31s", demo: true },
  { id: "res", label: "Reservations", ago: "1m", demo: true },
];

export const EVENTS: LiveEvent[] = [
  { id: "e1", at: "19:46", label: "+8 walk-ins", zone: "entrance", category: "Demand" },
  { id: "e2", at: "19:45", label: "Kitchen +6pp", zone: "kitchen", category: "Kitchen" },
  { id: "e3", at: "19:44", label: "Table 12 → payment", zone: "main", category: "Capacity" },
  { id: "e4", at: "19:43", label: "Delivery +3pp", zone: "delivery", category: "Delivery" },
];

const OPS_ZONES_NOW: Record<LiveZoneId, ZoneLens> = {
  main: {
    title: "Main Dining",
    primary: "78%",
    secondary: "48 covers",
    tertiary: "14 / 18 tables",
    severity: "healthy",
    severityLabel: "Healthy",
  },
  kitchen: {
    title: "Kitchen",
    primary: "91% load",
    secondary: "18m tickets",
    tertiary: "HIGH PRESSURE",
    severity: "pressure",
    severityLabel: "High pressure",
  },
  bar: {
    title: "Bar",
    primary: "63%",
    secondary: "6m tickets",
    severity: "healthy",
    severityLabel: "Healthy",
  },
  terrace: {
    title: "Terrace",
    primary: "41%",
    secondary: "Open seats",
    severity: "healthy",
    severityLabel: "Healthy",
  },
  delivery: {
    title: "Delivery",
    primary: "34% share",
    secondary: "12 orders",
    severity: "watch",
    severityLabel: "Watch",
  },
  entrance: {
    title: "Entrance",
    primary: "8 waiting",
    secondary: "Walk-ins",
    severity: "watch",
    severityLabel: "Watch",
  },
};

const FIN_ZONES_NOW: Record<LiveZoneId, ZoneLens> = {
  main: {
    title: "Main Dining",
    primary: "€9.8k revenue",
    secondary: "31.4% contribution",
    severity: "healthy",
    severityLabel: "Healthy",
  },
  kitchen: {
    title: "Kitchen",
    primary: "32.8% COGS",
    secondary: "€410 exposed",
    severity: "watch",
    severityLabel: "Exposed",
  },
  bar: {
    title: "Bar",
    primary: "€2.6k revenue",
    secondary: "38% contribution",
    severity: "healthy",
    severityLabel: "Healthy",
  },
  terrace: {
    title: "Terrace",
    primary: "€460 recoverable",
    secondary: "Opportunity",
    severity: "watch",
    severityLabel: "Opportunity",
  },
  delivery: {
    title: "Delivery",
    primary: "34% channel share",
    secondary: "€420 contribution exposure",
    severity: "intervene",
    severityLabel: "Intervene",
  },
  entrance: {
    title: "Entrance",
    primary: "8 waiting",
    secondary: "€180 recoverable",
    severity: "watch",
    severityLabel: "Watch",
  },
};

/** Horizon mutates severity + primary metrics (spatial rewrite). */
export function zonesFor(
  lens: LiveLens,
  horizon: LiveHorizon,
  simCalm: boolean,
): Record<LiveZoneId, ZoneLens> {
  const base =
    lens === "financial"
      ? structuredClone(FIN_ZONES_NOW)
      : structuredClone(OPS_ZONES_NOW);

  if (horizon === "30") {
    base.kitchen.primary = lens === "financial" ? "COGS 33.4%" : "94% load";
    base.kitchen.secondary = lens === "financial" ? "€520 exposed" : "19m avg ticket";
    base.kitchen.severity = "intervene";
    base.kitchen.severityLabel = "Peak inbound";
    base.main.primary = lens === "financial" ? "Revenue €10.4k" : "86% occupied";
    base.main.secondary = lens === "financial" ? "+2.1% vs plan" : "3 clearing · 2 at risk";
    base.main.severity = "watch";
    base.delivery.primary = lens === "financial" ? "38% channel" : "38% share";
    base.delivery.severity = "intervene";
    base.entrance.primary = lens === "financial" ? "€220 recoverable" : "11 waiting";
    base.entrance.severity = "intervene";
    base.terrace.primary = lens === "financial" ? "€620 recoverable" : "58% · demand up";
    base.terrace.severity = "watch";
    base.bar.primary = lens === "financial" ? "€2.1k revenue" : "71% · 8m tickets";
  } else if (horizon === "60") {
    base.kitchen.primary = lens === "financial" ? "COGS 31.9%" : "88% load";
    base.kitchen.severity = "watch";
    base.kitchen.severityLabel = "Easing";
    base.main.primary = lens === "financial" ? "Revenue €11.1k" : "91% occupied";
    base.main.secondary = lens === "financial" ? "Contribution 30.8%" : "1 turn at risk";
    base.delivery.primary = lens === "financial" ? "29% channel" : "29% share";
    base.entrance.primary = lens === "financial" ? "€90 recoverable" : "4 waiting";
    base.entrance.severity = "watch";
    base.terrace.primary = lens === "financial" ? "€480 recoverable" : "52%";
  } else if (horizon === "120") {
    base.kitchen.primary = lens === "financial" ? "COGS 30.2%" : "54% load";
    base.kitchen.severity = "healthy";
    base.kitchen.severityLabel = "Healthy";
    base.main.primary = lens === "financial" ? "Revenue €12.4k" : "62% occupied";
    base.main.severity = "healthy";
    base.delivery.severity = "healthy";
    base.delivery.primary = lens === "financial" ? "18% channel" : "18% share";
    base.entrance.primary = lens === "financial" ? "—" : "1 waiting";
    base.entrance.severity = "healthy";
    base.terrace.primary = lens === "financial" ? "Window closed" : "28% · cooling";
    base.terrace.severity = "healthy";
  }

  if (simCalm) {
    base.kitchen.primary = lens === "financial" ? "COGS 31.1%" : "83% load";
    base.kitchen.secondary = lens === "financial" ? "€140 exposed" : "14m avg ticket";
    base.kitchen.severity = "watch";
    base.kitchen.severityLabel = "Simulated relief";
    base.delivery.primary = lens === "financial" ? "24% channel" : "24% demand";
    base.delivery.severity = "watch";
    base.delivery.severityLabel = "Throttled";
  }

  return base;
}

export function briefingFor(lens: LiveLens, horizon: LiveHorizon): {
  kicker: string;
  line: string;
} {
  if (horizon !== "now") {
    return {
      kicker: `FORECAST +${horizon} · Confidence 84%`,
      line:
        horizon === "30"
          ? "Kitchen peaks at 96% around 20:06. €520 contribution at risk if unmanaged."
          : horizon === "60"
            ? "Pressure eases after the wave. One table turn still at risk."
            : "Service winds down. Terrace recoverable window mostly closed.",
    };
  }
  if (lens === "financial") {
    return {
      kicker: `TODAY`,
      line: "Contribution $974 behind plan. Delivery mix explains most of the gap.",
    };
  }
  return {
    kicker: "Kitchen becomes the constraint in 18 min.",
    line: "$420 contribution exposed.",
  };
}

export function horizonSnap(horizon: LiveHorizon, simCalm: boolean) {
  if (simCalm) {
    return {
      occupancy: "80%",
      kitchen: "83%",
      delivery: "24%",
      waitlist: "4 parties",
    };
  }
  const map = {
    now: { occupancy: "78%", kitchen: "91%", delivery: "34%", waitlist: "6 parties" },
    "30": { occupancy: "86%", kitchen: "94%", delivery: "38%", waitlist: "9 parties" },
    "60": { occupancy: "91%", kitchen: "88%", delivery: "29%", waitlist: "4 parties" },
    "120": { occupancy: "62%", kitchen: "54%", delivery: "18%", waitlist: "1 party" },
  } as const;
  return map[horizon];
}

export const ZONE_INSPECTORS: Record<LiveLens, Record<LiveZoneId, ZoneInspector>> = {
  operations: {
    kitchen: {
      zone: "kitchen",
      headline: "Kitchen",
      severity: "pressure",
      severityLabel: "High pressure",
      metrics: [
        { label: "Hot line", value: "91%", after: "83%" },
        { label: "Cold station", value: "76%" },
        { label: "Pass", value: "84%", after: "72%" },
        { label: "Avg ticket", value: "18m", after: "14m" },
        { label: "Oldest ticket", value: "24m" },
        { label: "Orders waiting", value: "17", after: "9" },
        { label: "Orders/hour", value: "42" },
      ],
      bottleneck: "Hot line",
      cause: "Delivery inflow +18% vs expected",
      next30: "Expected peak 96% at 20:06",
      financial: "€420 contribution exposed",
      radrSees:
        "Delivery is responsible for 18% of current hot-line load increase — ticket time stretches before second turns.",
      decision: "Throttle delivery intake for 12 minutes.",
      decisionId: DECISION_IDS.peak,
      expected: [
        { label: "Delivery share", before: "34%", after: "24%" },
        { label: "Kitchen load", before: "91%", after: "83%" },
        { label: "Avg ticket", before: "18m", after: "14m" },
        { label: "Exposure", before: "€420", after: "€140" },
      ],
      expectedValue: "+€280 protected",
      confidence: "78% · dine-in satisfaction weighted",
      compare: {
        doNothing: [
          "20:06 · Kitchen 97%",
          "Ticket 22m",
          "3 table turns at risk",
          "€420 exposed",
        ],
        radr: [
          "20:06 · Kitchen 84%",
          "Ticket 14m",
          "1 table turn at risk",
          "€140 exposed",
        ],
      },
    },
    main: {
      zone: "main",
      headline: "Main Dining",
      severity: "pressure",
      severityLabel: "High pressure",
      metrics: [
        { label: "Tables occupied", value: "14 / 18" },
        { label: "Covers seated", value: "48" },
        { label: "Tables paying", value: "3" },
        { label: "Departures · 20m", value: "11" },
        { label: "Reservations · 30m", value: "26 covers" },
        { label: "Walk-ins forecast", value: "8" },
        { label: "Recoverable", value: "1 table / €180" },
      ],
      bottleneck: "Turn pressure",
      cause: "Kitchen ticket stretch delaying second turns",
      next30: "26 covers arriving · 1 table short without recovery",
      financial: "€180 recoverable capacity",
      radrSees:
        "Paying tables and late turns concentrate on the dining core — kitchen relief unlocks the next booking wave.",
      decision: "Hold walk-in seating on Table 6 until kitchen eases.",
      decisionId: DECISION_IDS.peak,
      expected: [
        { label: "Turn risk tables", before: "3", after: "1" },
      ],
      expectedValue: "+€180 protected covers",
      confidence: "81% · booking pace model",
    },
    bar: {
      zone: "bar",
      headline: "Bar",
      severity: "healthy",
      severityLabel: "Healthy",
      metrics: [
        { label: "Load", value: "63%" },
        { label: "Cocktail ticket", value: "6m" },
        { label: "Active checks", value: "9" },
        { label: "Guests · 15m", value: "12 expected" },
      ],
      cause: "Dining payment wave reaches bar ~20:03",
      next30: "Bartender load rises with payment wave",
      financial: "Revenue pace on plan",
      radrSees:
        "Bar is healthy now — dining payment wave creates a short cocktail queue after 20:00.",
      decision: "No action — watch payment wave.",
      decisionId: DECISION_IDS.peak,
      expected: [],
      expectedValue: "No material Decision",
      confidence: "88%",
    },
    terrace: {
      zone: "terrace",
      headline: "Terrace",
      severity: "watch",
      severityLabel: "Opportunity",
      metrics: [
        { label: "Occupied", value: "41%" },
        { label: "Weather", value: "22°C · clear" },
        { label: "Rain risk", value: "Rises 21:10" },
        { label: "Recoverable", value: "€460 tonight" },
      ],
      next30: "Seat 2 walk-ins outside before 20:30",
      financial: "€460 recoverable",
      radrSees:
        "Terrace under-utilized before weather window closes — seat walk-ins outside while kitchen still holds.",
      decision: "Seat 2 walk-ins on terrace before 20:30.",
      decisionId: DECISION_IDS.rain,
      expected: [
        { label: "Recoverable", before: "€460", after: "€280 booked" },
      ],
      expectedValue: "+€180 seated",
      confidence: "74% · weather + walk-in model",
    },
    delivery: {
      zone: "delivery",
      headline: "Delivery",
      severity: "watch",
      severityLabel: "Watch",
      metrics: [
        { label: "Demand share", value: "34%", after: "24%" },
        { label: "Target", value: "22%" },
        { label: "Orders queued", value: "12", after: "5" },
        { label: "Hot-line load", value: "+18%" },
        { label: "Exposure", value: "€420", after: "€140" },
      ],
      bottleneck: "Hot-line coupling",
      cause: "Delivery stacking during dine-in peak",
      next30: "Share drifts to 38% without throttle",
      financial: "€420 contribution exposed",
      radrSees:
        "Delivery → Hot line → Pass. Delivery drives 18% of the hot-line load increase.",
      decision: "Throttle delivery intake for 12 minutes.",
      decisionId: DECISION_IDS.peak,
      expected: [
        { label: "Delivery share", before: "34%", after: "24%" },
        { label: "Exposure", before: "€420", after: "€140" },
      ],
      expectedValue: "+€280 protected",
      confidence: "82% · channel mix model",
      compare: {
        doNothing: ["20:06 · Share 38%", "Kitchen 97%", "€420 exposed"],
        radr: ["20:06 · Share 24%", "Kitchen 84%", "€140 exposed"],
      },
    },
    entrance: {
      zone: "entrance",
      headline: "Entrance",
      severity: "watch",
      severityLabel: "Watch",
      metrics: [
        { label: "Waiting", value: "8" },
        { label: "Avg wait", value: "11m" },
        { label: "Walk-ins · 20m", value: "+6 expected" },
        { label: "Tables ready", value: "1" },
      ],
      cause: "Kitchen ticket stretch delaying seating",
      next30: "Waitlist grows if kitchen stays above 90%",
      financial: "€180 recoverable seating",
      radrSees:
        "Eight parties waiting — seating unlocks when kitchen eases and dining turns clear.",
      decision: "Offer bar wait to parties of 2 while kitchen recovers.",
      decisionId: DECISION_IDS.peak,
      expected: [],
      expectedValue: "Attention only",
      confidence: "80%",
    },
  },
  financial: {
    kitchen: {
      zone: "kitchen",
      headline: "Kitchen",
      severity: "watch",
      severityLabel: "Exposed",
      metrics: [
        { label: "COGS", value: "32.8%", after: "31.1%" },
        { label: "Labor", value: "€1.2k tonight" },
        { label: "Contribution exposure", value: "€410", after: "€140" },
      ],
      cause: "Delivery displacing higher-contribution dine-in",
      financial: "€410 exposed",
      radrSees:
        "Same throttle the GM sees — framed as contribution protection.",
      decision: "Throttle delivery intake for 12 minutes.",
      decisionId: DECISION_IDS.peak,
      expected: [
        { label: "Exposure", before: "€410", after: "€140" },
      ],
      expectedValue: "+€270 contribution",
      confidence: "82%",
    },
    main: {
      zone: "main",
      headline: "Main Dining",
      severity: "healthy",
      severityLabel: "Healthy",
      metrics: [
        { label: "Revenue", value: "€9.8k" },
        { label: "Contribution", value: "31.4%" },
        { label: "vs Plan", value: "+€640" },
      ],
      radrSees: "Dine-in contribution holds when kitchen clears turns.",
      decision: "Protect dine-in capacity during peak.",
      decisionId: DECISION_IDS.peak,
      expected: [],
      expectedValue: "+€640 vs plan holding",
      confidence: "85%",
    },
    bar: {
      zone: "bar",
      headline: "Bar",
      severity: "healthy",
      severityLabel: "Healthy",
      metrics: [
        { label: "Revenue", value: "€2.6k" },
        { label: "Contribution", value: "38%" },
      ],
      radrSees: "Bar contribution healthy — no Decision.",
      decision: "No action.",
      decisionId: DECISION_IDS.peak,
      expected: [],
      expectedValue: "—",
      confidence: "90%",
    },
    terrace: {
      zone: "terrace",
      headline: "Terrace",
      severity: "watch",
      severityLabel: "Opportunity",
      metrics: [
        { label: "Recoverable", value: "€460" },
        { label: "Contribution", value: "High attach" },
      ],
      radrSees: "Recoverable revenue before weather closes.",
      decision: "Seat walk-ins on terrace.",
      decisionId: DECISION_IDS.rain,
      expected: [{ label: "Booked", before: "€0", after: "€180" }],
      expectedValue: "+€180",
      confidence: "74%",
    },
    delivery: {
      zone: "delivery",
      headline: "Delivery",
      severity: "intervene",
      severityLabel: "Intervene",
      metrics: [
        { label: "Channel share", value: "34%", after: "24%" },
        { label: "Revenue", value: "€3,840" },
        { label: "Contribution", value: "€680" },
        { label: "Expected", value: "€1,100" },
        { label: "Exposure", value: "€420", after: "€140" },
      ],
      radrSees:
        "Revenue positive, contribution displaced — same throttle, euro frame.",
      decision: "Throttle delivery intake for 12 minutes.",
      decisionId: DECISION_IDS.peak,
      expected: [
        { label: "Exposure", before: "€420", after: "€140" },
      ],
      expectedValue: "+€280 contribution",
      confidence: "82%",
      compare: {
        doNothing: ["Exposure €420", "Share 38%"],
        radr: ["Exposure €140", "Share 24%"],
      },
    },
    entrance: {
      zone: "entrance",
      headline: "Entrance",
      severity: "watch",
      severityLabel: "Watch",
      metrics: [
        { label: "Waiting parties", value: "8" },
        { label: "Recoverable", value: "€180" },
        { label: "Lost cover risk", value: "€240" },
      ],
      radrSees: "Waitlist value erodes while kitchen blocks seating.",
      decision: "Offer bar wait to parties of 2.",
      decisionId: DECISION_IDS.peak,
      expected: [],
      expectedValue: "Attention only",
      confidence: "78%",
    },
  },
};

export const STATION_INSPECTORS: Record<LiveStationId, StationInspector> = {
  hot: {
    id: "hot",
    label: "Hot line",
    metrics: [
      { label: "Load", value: "91%" },
      { label: "Queue", value: "11" },
      { label: "Oldest ticket", value: "24m" },
      { label: "Throughput", value: "42/hr" },
      { label: "Next 15 min demand", value: "+18%" },
      { label: "Primary demand", value: "Ribeye / burger / delivery" },
      { label: "Stock risk", value: "Ribeye" },
    ],
    radrSees: "Delivery SKUs concentrate on grill — dine-in mains waiting behind.",
  },
  cold: {
    id: "cold",
    label: "Cold station",
    metrics: [
      { label: "Load", value: "76%" },
      { label: "Oldest", value: "11m" },
      { label: "Prep gaps", value: "1" },
    ],
    radrSees: "Cold holding — Tuna prep short may hit 20:20.",
  },
  prep: {
    id: "prep",
    label: "Prep",
    metrics: [
      { label: "Readiness", value: "93%" },
      { label: "At risk", value: "2 items" },
    ],
    radrSees: "Prep mostly ready — two items short for second turn.",
  },
  pass: {
    id: "pass",
    label: "Pass",
    metrics: [
      { label: "Congestion", value: "84%" },
      { label: "Plates waiting", value: "7" },
    ],
    radrSees: "Pass backs up when hot line exceeds 90%.",
  },
  dish: {
    id: "dish",
    label: "Dish",
    metrics: [
      { label: "Load", value: "58%" },
      { label: "Turnaround", value: "4m" },
    ],
    radrSees: "Dish not the constraint tonight.",
  },
};

export const TABLES: TableInspector[] = [
  {
    id: "t14",
    zone: "main",
    covers: 4,
    seated: "19:03",
    stage: "Mains",
    ticket: "16m",
    expectedFinish: "20:12",
    nextReservation: "20:15",
    turnRisk: "HIGH",
    radrSees: "Likely 8–12 minutes beyond next booking.",
    actions: ["Hold next party", "Move next booking", "Offer bar wait", "Ignore"],
  },
  {
    id: "t6",
    zone: "main",
    covers: 2,
    seated: "—",
    stage: "Open",
    ticket: "—",
    expectedFinish: "—",
    nextReservation: "Walk-in hold",
    turnRisk: "MED",
    radrSees: "Hold for kitchen relief before seating walk-ins.",
    actions: ["Hold", "Seat", "Release"],
  },
  {
    id: "t12",
    zone: "main",
    covers: 4,
    seated: "18:40",
    stage: "Payment",
    ticket: "—",
    expectedFinish: "19:52",
    nextReservation: "20:00",
    turnRisk: "LOW",
    radrSees: "Clearing for next booking.",
    actions: ["Ignore"],
  },
  {
    id: "tt2",
    zone: "terrace",
    covers: 2,
    seated: "—",
    stage: "Open",
    ticket: "—",
    expectedFinish: "—",
    nextReservation: "Walk-in",
    turnRisk: "LOW",
    radrSees: "Seat walk-in before weather window.",
    actions: ["Seat", "Hold"],
  },
];

export const TABLE_POSITIONS: Record<
  string,
  { x: number; y: number; seats: 2 | 4 }
> = {
  t14: { x: 400, y: 300, seats: 4 },
  t6: { x: 340, y: 340, seats: 2 },
  t12: { x: 480, y: 310, seats: 4 },
  tt2: { x: 160, y: 360, seats: 2 },
};

export function estateBriefing() {
  return {
    kicker: "Live Estate",
    line: "3 need attention · $5.8k exposed now · $31.2k Verified Value MTD",
  };
}
