import { DEMO, formatEuro, type ChannelId } from "./demo";

/**
 * Illustrative live-scan pool for the hero money meter.
 * Independent of SIGNALS (which still power Delta / Coverage).
 * Official demo lock: annualized €172,460 + recoverable €4,280 = €176,740.
 */

export type LiveSignal = {
  id: string;
  channel: ChannelId;
  channelLabel: string;
  title: string;
  tag: string;
  action: string;
  /** Raw / immediate display, e.g. €84 or €840 / night */
  rawLabel: string;
  /** What gets added to annualized meter (0 if recoverable-only) */
  annualizedAdd: number;
  /** What gets added to recoverable meter */
  recoverableAdd: number;
  source: {
    should: { label: string; value: string };
    actual: { label: string; value: string };
    delta: string;
  };
};

export type ScanMoment = {
  id: string;
  kind: "cuts" | "eightyfour" | "complete" | "closing";
  kicker?: string;
  headline: string;
  body?: string;
};

export type ScanBeat =
  | { type: "signal"; signal: LiveSignal; delayMs: number }
  | { type: "moment"; moment: ScanMoment; delayMs: number }
  | { type: "lock"; delayMs: number };

/** Signal catalog: reuse by id in the script */
export const LIVE_POOL: Record<string, LiveSignal> = {
  delivery_fee: {
    id: "s01",
    channel: "buy",
    channelLabel: "BUY",
    title: "Wrong delivery fee",
    tag: "Actionable",
    action: "Review delivery charge →",
    rawLabel: "€84",
    annualizedAdd: 4_368,
    recoverableAdd: 0,
    source: {
      should: { label: "Contract fee", value: "€12" },
      actual: { label: "Charged", value: "€96" },
      delta: "△ €84",
    },
  },
  overtime: {
    id: "s02",
    channel: "labor",
    channelLabel: "LABOR",
    title: "Overtime developing",
    tag: "Avoidable",
    action: "Review tonight's roster →",
    rawLabel: "€216",
    annualizedAdd: 11_232,
    recoverableAdd: 0,
    source: {
      should: { label: "Planned OT", value: "€0" },
      actual: { label: "Projected", value: "€216" },
      delta: "△ €216 / night",
    },
  },
  commission: {
    id: "s03",
    channel: "sell",
    channelLabel: "SELL",
    title: "Commission mismatch",
    tag: "Missed revenue",
    action: "Review channel rate →",
    rawLabel: "€1,240",
    annualizedAdd: 14_880,
    recoverableAdd: 0,
    source: {
      should: { label: "Agreed", value: "12%" },
      actual: { label: "Charged", value: "18%" },
      delta: "△ €1,240",
    },
  },
  agency: {
    id: "s04",
    channel: "labor",
    channelLabel: "LABOR",
    title: "Agency shift avoidable",
    tag: "Avoidable",
    action: "Review agency booking →",
    rawLabel: "€680 / shift",
    annualizedAdd: 680,
    recoverableAdd: 0,
    source: {
      should: { label: "Core staff", value: "Covered" },
      actual: { label: "Agency", value: "1 shift" },
      delta: "△ €680",
    },
  },
  variance: {
    id: "s05",
    channel: "buy",
    channelLabel: "BUY",
    title: "Food cost variance",
    tag: "Review",
    action: "Open variance case →",
    rawLabel: "€420",
    annualizedAdd: 420,
    recoverableAdd: 0,
    source: {
      should: { label: "Target", value: "28.4%" },
      actual: { label: "Actual", value: "31.1%" },
      delta: "△ €420",
    },
  },
  supplier_core: {
    id: "s06",
    channel: "buy",
    channelLabel: "BUY",
    title: "Supplier price above contract",
    tag: "Review",
    action: "Review supplier charge →",
    rawLabel: "€3.60 / case",
    annualizedAdd: 18_620,
    recoverableAdd: 0,
    source: {
      should: { label: "Contract", value: "€31.20" },
      actual: { label: "Invoice", value: "€34.80" },
      delta: "△ €3.60 / case",
    },
  },
  credit_core: {
    id: "s07",
    channel: "recover",
    channelLabel: "RECOVER",
    title: "Supplier credit never received",
    tag: "Recoverable",
    action: "Open credit case →",
    rawLabel: "€4,280",
    annualizedAdd: 0,
    recoverableAdd: 4_280,
    source: {
      should: { label: "Expected", value: "€4,280" },
      actual: { label: "Received", value: "€0" },
      delta: "△ €4,280",
    },
  },
  labor_core: {
    id: "s08",
    channel: "labor",
    channelLabel: "LABOR",
    title: "Scheduled above forecast demand",
    tag: "Avoidable",
    action: "Review tonight's schedule →",
    rawLabel: "€840 / night",
    annualizedAdd: 43_680,
    recoverableAdd: 0,
    source: {
      should: { label: "Needed", value: "11" },
      actual: { label: "Scheduled", value: "14" },
      delta: "△ 3 people · €840 / night",
    },
  },
  rooms: {
    id: "s09",
    channel: "sell",
    channelLabel: "SELL",
    title: "Saturday rooms priced below demand",
    tag: "Missed revenue",
    action: "Review rate recommendation →",
    rawLabel: "€8,400 / month",
    annualizedAdd: 37_480,
    recoverableAdd: 0,
    source: {
      should: { label: "Demand rate", value: "€395" },
      actual: { label: "Listed", value: "€360" },
      delta: "△ €35 / room",
    },
  },
  menu: {
    id: "s10",
    channel: "sell",
    channelLabel: "SELL",
    title: "Menu item underpriced",
    tag: "Missed revenue",
    action: "Review contribution →",
    rawLabel: "€14,200 / year",
    annualizedAdd: 14_200,
    recoverableAdd: 0,
    source: {
      should: { label: "Target margin", value: "68%" },
      actual: { label: "Current", value: "51%" },
      delta: "△ underpriced",
    },
  },
  delivery_rate: {
    id: "s11",
    channel: "sell",
    channelLabel: "SELL",
    title: "Delivery commission above agreed rate",
    tag: "Actionable",
    action: "Review platform terms →",
    rawLabel: "€11,760 / year",
    annualizedAdd: 11_760,
    recoverableAdd: 0,
    source: {
      should: { label: "Agreed", value: "15%" },
      actual: { label: "Charged", value: "22%" },
      delta: "△ rate gap",
    },
  },
  unapproved: {
    id: "s12",
    channel: "buy",
    channelLabel: "BUY",
    title: "Unapproved price increase",
    tag: "Review",
    action: "Challenge supplier increase →",
    rawLabel: "€9,420 / year",
    annualizedAdd: 9_420,
    recoverableAdd: 0,
    source: {
      should: { label: "Approved", value: "€0 change" },
      actual: { label: "Invoiced", value: "+6.2%" },
      delta: "△ unapproved",
    },
  },
  staffing: {
    id: "s13",
    channel: "labor",
    channelLabel: "LABOR",
    title: "Staffing above target",
    tag: "Avoidable",
    action: "Align to forecast →",
    rawLabel: "€2,140 / week",
    annualizedAdd: 5_720,
    recoverableAdd: 0,
    source: {
      should: { label: "Target hours", value: "412" },
      actual: { label: "Scheduled", value: "448" },
      delta: "△ 36 hours",
    },
  },
  // Post-lock cycling examples (zero meter impact)
  duplicate_invoice: {
    id: "c01",
    channel: "buy",
    channelLabel: "BUY",
    title: "Duplicate invoice detected",
    tag: "Verify",
    action: "Review duplicate →",
    rawLabel: "€2,840",
    annualizedAdd: 0,
    recoverableAdd: 0,
    source: {
      should: { label: "Pay once", value: "€2,840" },
      actual: { label: "Submitted", value: "×2" },
      delta: "△ duplicate",
    },
  },
  rebate: {
    id: "c02",
    channel: "recover",
    channelLabel: "RECOVER",
    title: "Rebate missing",
    tag: "Recoverable",
    action: "Chase rebate →",
    rawLabel: "€12,600",
    annualizedAdd: 0,
    recoverableAdd: 0,
    source: {
      should: { label: "Due", value: "€12,600" },
      actual: { label: "Received", value: "€0" },
      delta: "△ missing",
    },
  },
  refund: {
    id: "c03",
    channel: "recover",
    channelLabel: "RECOVER",
    title: "Refund not processed",
    tag: "Recoverable",
    action: "Process refund →",
    rawLabel: "€1,840",
    annualizedAdd: 0,
    recoverableAdd: 0,
    source: {
      should: { label: "Refund", value: "€1,840" },
      actual: { label: "Status", value: "Open" },
      delta: "△ unpaid",
    },
  },
  ota: {
    id: "c04",
    channel: "recover",
    channelLabel: "RECOVER",
    title: "OTA settlement short",
    tag: "Recoverable",
    action: "Reconcile settlement →",
    rawLabel: "€3,620",
    annualizedAdd: 0,
    recoverableAdd: 0,
    source: {
      should: { label: "Expected", value: "€41,200" },
      actual: { label: "Settled", value: "€37,580" },
      delta: "△ €3,620",
    },
  },
  promo: {
    id: "c05",
    channel: "sell",
    channelLabel: "SELL",
    title: "Promotion destroying contribution",
    tag: "Missed revenue",
    action: "Review promo →",
    rawLabel: "€6,820 / campaign",
    annualizedAdd: 0,
    recoverableAdd: 0,
    source: {
      should: { label: "Contribution", value: "Positive" },
      actual: { label: "Campaign", value: "−€6,820" },
      delta: "△ destroyed margin",
    },
  },
};

/**
 * Ordered demo narrative.
 * annualized adds → 172,460 ; recoverable → 4,280 ; value → 176,740
 */
export const SCAN_SCRIPT: readonly ScanBeat[] = [
  { type: "signal", signal: LIVE_POOL.delivery_fee!, delayMs: 2800 },
  { type: "signal", signal: LIVE_POOL.overtime!, delayMs: 2600 },
  { type: "signal", signal: LIVE_POOL.agency!, delayMs: 2200 },
  { type: "signal", signal: LIVE_POOL.variance!, delayMs: 2000 },
  { type: "signal", signal: LIVE_POOL.commission!, delayMs: 2400 },
  {
    type: "moment",
    moment: {
      id: "m-cuts",
      kind: "cuts",
      kicker: "Pattern",
      headline: "Small deltas.\nBig margin.",
      body: "Most margin doesn't disappear in one dramatic event. It leaks through thousands of small differences.",
    },
    delayMs: 4200,
  },
  {
    type: "moment",
    moment: {
      id: "m-84",
      kind: "eightyfour",
      kicker: "The RADR idea",
      headline: "You wouldn't chase €84.\nRADR would.",
      body: "Because €84 happening 200 times isn't €84.",
    },
    delayMs: 4800,
  },
  { type: "signal", signal: LIVE_POOL.supplier_core!, delayMs: 3200 },
  { type: "signal", signal: LIVE_POOL.credit_core!, delayMs: 3000 },
  { type: "signal", signal: LIVE_POOL.labor_core!, delayMs: 3200 },
  { type: "signal", signal: LIVE_POOL.rooms!, delayMs: 2800 },
  { type: "signal", signal: LIVE_POOL.menu!, delayMs: 2800 },
  { type: "signal", signal: LIVE_POOL.delivery_rate!, delayMs: 2800 },
  { type: "signal", signal: LIVE_POOL.unapproved!, delayMs: 2800 },
  { type: "signal", signal: LIVE_POOL.staffing!, delayMs: 3000 },
  { type: "lock", delayMs: 1600 },
  {
    type: "moment",
    moment: {
      id: "m-done",
      kind: "complete",
      kicker: "Demo complete",
      headline: "Value on RADR",
      body: `${DEMO.locations} locations · 27 signals · ${formatEuro(DEMO.final)} value identified`,
    },
    delayMs: 4200,
  },
  {
    type: "moment",
    moment: {
      id: "m-close",
      kind: "closing",
      kicker: "Continuous",
      headline: "Nothing off the RADR.",
      body: "RADR doesn't just find the big mistake. It watches every transaction, schedule, price, credit and payout for the small differences that move your margin.",
    },
    delayMs: 5000,
  },
];

/** After lock: cosmetic cycle, meters frozen */
export const POST_LOCK_CYCLE: readonly LiveSignal[] = [
  LIVE_POOL.duplicate_invoice!,
  LIVE_POOL.rebate!,
  LIVE_POOL.refund!,
  LIVE_POOL.ota!,
  LIVE_POOL.promo!,
  LIVE_POOL.delivery_fee!,
  LIVE_POOL.agency!,
];

export const METER_TARGETS = {
  annualized: 172_460,
  recoverable: 4_280,
  value: DEMO.final,
} as const;

/** Verify script math in dev: sum of annualized/recoverable adds before lock */
export function assertMeterMath(): { annualized: number; recoverable: number } {
  let annualized = 0;
  let recoverable = 0;
  for (const beat of SCAN_SCRIPT) {
    if (beat.type === "lock") break;
    if (beat.type === "signal") {
      annualized += beat.signal.annualizedAdd;
      recoverable += beat.signal.recoverableAdd;
    }
  }
  return { annualized, recoverable };
}
