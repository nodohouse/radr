/**
 * Financial Operating Layer - types.
 *
 * RADR prepares, reconciles, explains. Accounting remains source of record.
 * Prefer LIVE CONTRIBUTION over "profit" unless a full P&L is supported.
 */

import type { FnBCategorySplit } from "@/lib/radr/fnb";

export type FinancialConfidence =
  | "complete"
  | "estimated"
  | "partial"
  | "stale";

export type MoneyFlowKind = "in" | "out" | "left";

export type WaterfallLineKind =
  | "start"
  | "less"
  | "result"
  | "margin"
  | "variance";

export type FinancialSource = {
  key: string;
  label: string;
  status: FinancialConfidence;
  lastSyncLabel: string;
};

export type VarianceBlock = {
  actual: number;
  plan: number;
  /** actual − plan (signed major currency or pts depending on unit) */
  variance: number;
  unit: "EUR" | "pts" | "pct";
  why: string[];
};

export type WaterfallLine = {
  id: string;
  kind: WaterfallLineKind;
  label: string;
  amount: number;
  /** Optional secondary (e.g. margin %) */
  secondary?: string;
  variance?: VarianceBlock;
  definitionId: string;
  confidence: FinancialConfidence;
  why: string[];
  sources: FinancialSource[];
  evidenceHref?: string;
};

export type MoneyFlowItem = {
  id: string;
  label: string;
  amount: number;
  definitionId: string;
  confidence: FinancialConfidence;
  why: string[];
};

export type MoneyFlowColumn = {
  kind: MoneyFlowKind;
  title: string;
  items: MoneyFlowItem[];
  totalLabel: string;
  total: number;
};

export type FinanceAttention = {
  id: string;
  label: string;
  amount: number;
  amountLabel: string;
  why: string;
  href: string;
  tone: "attention" | "watch" | "ready";
};

export type FinancialOperatingState = {
  organizationId: string;
  locationId: string;
  locationName: string;
  serviceLabel: string;
  phaseLabel: string;
  businessDate: string;
  currency: "EUR";
  asOf: string;
  illustrative: boolean;

  grossSales: number;
  discounts: number;
  refunds: number;
  comps: number;
  netSales: number;

  cogs: number;
  /** Food vs beverage category split of net sales (+ category COGS / contribution). */
  fnb: FnBCategorySplit;
  directLabor: number;
  channelFees: number;
  paymentFees: number;
  /** Economic impact of comps + refunds beyond retail (contribution lens) */
  compsRefundsEconomic: number;

  liveContribution: number;
  contributionMarginPct: number;
  expectedContributionMarginPct: number;
  /** contributionMarginPct − expected (pts) */
  marginVariancePts: number;

  laborPlan: number;
  laborProjectedClose: number;

  deposits: number;
  deliveryGross: number;

  verifiedToday: number;
  overallConfidence: FinancialConfidence;

  waterfall: WaterfallLine[];
  moneyFlow: MoneyFlowColumn[];
  attentions: FinanceAttention[];
};
