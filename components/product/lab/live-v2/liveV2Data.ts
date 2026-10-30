/**
 * Live V2 prototype — Soho · New York GM / CFO intelligence lenses.
 * Same geometry. Different questions.
 */

export type LiveV2Persona = "gm" | "cfo";
export type LiveV2ZoneId =
  | "main"
  | "kitchen"
  | "bar"
  | "terrace"
  | "delivery";

export type LiveV2Severity = "healthy" | "watch" | "pressure" | "intervene";

export type LiveV2Metric = {
  label: string;
  value: string;
  after?: string;
};

export type LiveV2ZoneLens = {
  title: string;
  primary: string;
  secondary: string;
  tertiary?: string;
  severity: LiveV2Severity;
  severityLabel: string;
};

export type LiveV2Inspector = {
  headline: string;
  severity: LiveV2Severity;
  severityLabel: string;
  metrics: LiveV2Metric[];
  radrSees: string;
  decision: string;
  expected: { label: string; before: string; after: string }[];
  expectedValue: string;
  confidence?: string;
};

export type LiveV2PersonaPack = {
  id: LiveV2Persona;
  label: string;
  question: string;
  lens: "Operations" | "Financial";
  period: string;
  hero: {
    kicker: string;
    line1: string;
    line2: string;
    attention: string;
  };
  zones: Record<LiveV2ZoneId, LiveV2ZoneLens>;
  inspectors: Partial<Record<LiveV2ZoneId, LiveV2Inspector>>;
  defaultFocus?: LiveV2ZoneId;
};

export const ZONE_ORDER: LiveV2ZoneId[] = [
  "main",
  "kitchen",
  "bar",
  "terrace",
  "delivery",
];

export const ZONE_CAMERA: Record<
  LiveV2ZoneId,
  { x: number; y: number; w: number; h: number }
> = {
  main: { x: 280, y: 140, w: 420, h: 300 },
  kitchen: { x: 40, y: 260, w: 340, h: 280 },
  bar: { x: 520, y: 80, w: 320, h: 240 },
  terrace: { x: 520, y: 320, w: 360, h: 260 },
  delivery: { x: 240, y: 420, w: 300, h: 220 },
};

export const OVERVIEW_CAMERA = { x: 0, y: 20, w: 960, h: 640 };

/** Label anchors in SVG scene space (move with camera). */
export const ZONE_LABEL_AT: Record<LiveV2ZoneId, { x: number; y: number }> = {
  main: { x: 430, y: 250 },
  kitchen: { x: 175, y: 355 },
  bar: { x: 680, y: 145 },
  terrace: { x: 730, y: 365 },
  delivery: { x: 395, y: 470 },
};

export const GM_PACK: LiveV2PersonaPack = {
  id: "gm",
  label: "GM",
  question: "Can the floor run dinner successfully right now?",
  lens: "Operations",
  period: "Live",
  hero: {
    kicker: "Soho · New York · Live · 19:48",
    line1: "Dinner demand is ahead.",
    line2: "Kitchen pressure peaks in 18 minutes.",
    attention: "Kitchen and delivery need a call before peak.",
  },
  zones: {
    main: {
      title: "Main Dining",
      primary: "82% occupied",
      secondary: "14 tables active",
      tertiary: "3 tables turning",
      severity: "pressure",
      severityLabel: "High pressure",
    },
    kitchen: {
      title: "Kitchen",
      primary: "91% load",
      secondary: "Avg ticket 18m",
      tertiary: "2 prep risks",
      severity: "pressure",
      severityLabel: "High pressure",
    },
    bar: {
      title: "Bar",
      primary: "63% occupied",
      secondary: "Healthy",
      severity: "healthy",
      severityLabel: "Healthy",
    },
    terrace: {
      title: "Terrace",
      primary: "41% occupied",
      secondary: "€460 recoverable",
      severity: "watch",
      severityLabel: "Opportunity",
    },
    delivery: {
      title: "Delivery",
      primary: "34% of demand",
      secondary: "Above 22% target",
      severity: "watch",
      severityLabel: "Watch",
    },
  },
  inspectors: {
    kitchen: {
      headline: "Kitchen",
      severity: "pressure",
      severityLabel: "High pressure",
      metrics: [
        { label: "Hot line", value: "91%", after: "83%" },
        { label: "Cold station", value: "76%" },
        { label: "Average ticket", value: "18m", after: "14m" },
        { label: "Prep gaps", value: "2" },
        { label: "Stock risk", value: "1 item" },
      ],
      radrSees:
        "Delivery is stacking on the hot line during dine-in peak — ticket time is stretching before second turns.",
      decision: "Throttle delivery intake for 12 minutes (GM service call).",
      expected: [
        { label: "Kitchen load", before: "91%", after: "83%" },
        { label: "Ticket time", before: "18m", after: "14m" },
      ],
      expectedValue: "+€280 protected contribution tonight",
      confidence: "78% · dine-in satisfaction weighted",
    },
  },
  defaultFocus: undefined,
};

export const CFO_PACK: LiveV2PersonaPack = {
  id: "cfo",
  label: "CFO",
  question:
    "Is Soho · New York financially healthy — and where is contribution leaking?",
  lens: "Financial",
  period: "Today",
  hero: {
    kicker: "Soho · New York · Today",
    line1: "Revenue is ahead.",
    line2: "Contribution is €974 behind plan.",
    attention: "Delivery mix and kitchen COGS explain most of the gap vs plan.",
  },
  zones: {
    main: {
      title: "Main Dining",
      primary: "Revenue €9.8k",
      secondary: "Contribution 31.4%",
      tertiary: "+€640 vs plan",
      severity: "healthy",
      severityLabel: "Healthy",
    },
    kitchen: {
      title: "Kitchen",
      primary: "COGS 32.8%",
      secondary: "+2.4pp vs plan",
      tertiary: "€410 exposed",
      severity: "watch",
      severityLabel: "Exposed",
    },
    bar: {
      title: "Bar",
      primary: "Revenue €2.6k",
      secondary: "Contribution 38%",
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
      tertiary: "Intervene",
      severity: "intervene",
      severityLabel: "Intervene",
    },
  },
  inspectors: {
    delivery: {
      headline: "Delivery",
      severity: "intervene",
      severityLabel: "Contribution exposed",
      metrics: [
        { label: "Channel share", value: "34%" },
        { label: "Target", value: "22%" },
        { label: "Revenue", value: "€3,840" },
        { label: "Contribution", value: "€680" },
        { label: "Expected contribution", value: "€1,100" },
        { label: "Exposure", value: "€420", after: "€140" },
      ],
      radrSees:
        "Delivery revenue is positive, but channel share is displacing higher-contribution dine-in during peak — same throttle the GM sees, framed as euros.",
      decision: "Throttle delivery intake for 12 minutes (CFO exposure call).",
      expected: [
        { label: "Contribution exposure", before: "€420", after: "€140" },
      ],
      expectedValue: "+€280 contribution if executed",
      confidence: "82% · channel mix model",
    },
  },
};

export function packFor(persona: LiveV2Persona): LiveV2PersonaPack {
  return persona === "cfo" ? CFO_PACK : GM_PACK;
}
