import { BRAND } from "../config/brand";

/** ONE coherent demo operation — powers the entire homepage. */

export const DEMO = {
  locations: 18,
  period: "30-day scan",
  periodLabel: "30 DAYS",
  final: 176_740,
  signalCount: 4,
  /** Illustrative demo — never claim as live customer ROI */
  illustrative: true,
} as const;

/**
 * Transparent value methodology for the shared demo.
 * Do not sum nightly / monthly / annual figures without labels.
 */
export const VALUE = {
  annualizedExposure: 172_460,
  recoverableNow: 4_280,
  totalOnRadr: 176_740,
  annualizedLabel: "Annualized exposure",
  recoverableLabel: "Recoverable now",
  totalLabel: "Value on RADR",
  methodNote:
    "Illustrative demo · annualized exposure + recoverable now = value on RADR",
} as const;

export type ChannelId = "buy" | "recover" | "labor" | "sell";

export type DemoSignal = {
  id: string;
  order: number;
  channel: ChannelId;
  channelLabel: string;
  euros: number;
  /** Display amount with context, e.g. €18,620 */
  amount: string;
  /** Period qualifier shown with amount */
  period: string;
  title: string;
  tag: string;
  action: string;
  /** Cumulative total AFTER this signal resolves */
  runningTotal: number;
  source: {
    kind: "invoice" | "credit" | "schedule" | "pricing";
    label: string;
    detail: string;
    should: { label: string; value: string };
    actual: { label: string; value: string };
    unitDelta: string;
  };
};

/**
 * Signal order = discovery order in the live scan.
 * BUY → RECOVER → LABOR → SELL
 * 18620 + 4280 = 22900
 * 22900 + 11840 = 34740
 * 34740 + 142000 = 176740
 */
export const SIGNALS: readonly DemoSignal[] = [
  {
    id: "01",
    order: 1,
    channel: "buy",
    channelLabel: "BUY",
    euros: 18_620,
    amount: "€18,620",
    period: " / year",
    title: "Supplier pricing mismatch",
    tag: "Review",
    action: "Review supplier charge →",
    runningTotal: 18_620,
    source: {
      kind: "invoice",
      label: "Supplier invoice",
      detail: "Avocado Hass 18ct",
      should: { label: "Contract", value: "€31.20" },
      actual: { label: "Invoice", value: "€34.80" },
      unitDelta: "€3.60 / case",
    },
  },
  {
    id: "02",
    order: 2,
    channel: "recover",
    channelLabel: "RECOVER",
    euros: 4_280,
    amount: "€4,280",
    period: " / credit",
    title: "Credit never received",
    tag: "Recoverable",
    action: "Open credit case →",
    runningTotal: 22_900,
    source: {
      kind: "credit",
      label: "Credit note",
      detail: "Supplier credit expected",
      should: { label: "Expected", value: "€4,280" },
      actual: { label: "Received", value: "€0" },
      unitDelta: "€4,280",
    },
  },
  {
    id: "03",
    order: 3,
    channel: "labor",
    channelLabel: "LABOR",
    euros: 11_840,
    amount: "€11,840",
    period: " / year",
    title: "Scheduled above demand",
    tag: "Avoidable",
    action: "Review tonight's schedule →",
    runningTotal: 34_740,
    source: {
      kind: "schedule",
      label: "Thursday dinner",
      detail: "Staffing vs demand",
      should: { label: "Needed", value: "11" },
      actual: { label: "Scheduled", value: "14" },
      unitDelta: "△ 3 · €840 / night",
    },
  },
  {
    id: "04",
    order: 4,
    channel: "sell",
    channelLabel: "SELL",
    euros: 142_000,
    amount: "€142,000",
    period: " / year",
    title: "Pricing opportunity",
    tag: "Missed revenue",
    action: "Review rate recommendation →",
    runningTotal: 176_740,
    source: {
      kind: "pricing",
      label: "Deluxe · Saturday",
      detail: "Demand high",
      should: { label: "Optimal", value: "€395" },
      actual: { label: "Current", value: "€360" },
      unitDelta: "€35 / room",
    },
  },
] as const;

/** Cumulative totals after each signal (same order as SIGNALS) */
export const RUNNING_TOTALS = SIGNALS.map((s) => s.runningTotal);

export const RADR_MISSION = BRAND.mission;

/** @deprecated use SIGNALS — kept as alias for gradual migration */
export const HERO_SIGNALS = SIGNALS;
export const HERO_TOTALS = RUNNING_TOTALS;
export const HERO_FINAL = DEMO.final;

export function formatEuro(n: number) {
  return `€${Math.max(0, Math.round(n)).toLocaleString("en-IE")}`;
}

export function signalByChannel(channel: ChannelId) {
  return SIGNALS.find((s) => s.channel === channel)!;
}
