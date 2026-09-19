/**
 * Live Shift - normalized economic event + shift state contracts.
 *
 * Backend owns economic truth. Frontend consumes ShiftEconomicState;
 * do not recompute recognition rules in UI components.
 *
 * Recognition (no double-counting):
 * - SALE / DELIVERY_ORDER (settled) → gross + net path once
 * - PAYMENT → paymentsReceived only (never +netSales)
 * - REFUND / VOID → reverse recognized sales
 * - DISCOUNT / COMP → leakage buckets; reduce netSales once
 * - OPEN_CHECK → openChecks value only until SALE settles
 * - DEPOSIT → depositsHeld; not net sales until earned
 */

import type { LiveStreamSeries } from "./streamSeries";
import type { FnBCategorySplit } from "@/lib/radr/fnb";

export type LiveEventType =
  | "SALE"
  | "PAYMENT"
  | "REFUND"
  | "DISCOUNT"
  | "COMP"
  | "VOID"
  | "CANCELLATION"
  | "DEPOSIT"
  | "DELIVERY_ORDER"
  | "FEE"
  | "ADJUSTMENT"
  | "CHECK_OPENED"
  | "COVERS";

export type LiveSourceSystem =
  | "POS"
  | "PAYMENTS"
  | "RESERVATIONS"
  | "DELIVERY"
  | "MANUAL"
  | "DEMO";

export type OperatingEvent = {
  id: string;
  organizationId: string;
  locationId: string;
  locationName: string;
  timestamp: string;
  source: LiveSourceSystem;
  eventType: LiveEventType;
  /** Major currency units (EUR). */
  amount: number;
  currency: "EUR";
  serviceId: string;
  serviceLabel: string;
  orderId?: string;
  reservationId?: string;
  paymentId?: string;
  employeeId?: string;
  channel?: "dine_in" | "bar" | "terrace" | "delivery" | "other";
  reason?: string;
  label: string;
  /** When true, amount already recognized via linked SALE - skip net again. */
  settlementOfSaleId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export type SourceFreshness = {
  source: LiveSourceSystem;
  status: "LIVE" | "DELAYED" | "STALE" | "ILLUSTRATIVE";
  lastEventAt: string | null;
  ageSeconds: number | null;
};

export type ShiftEconomicState = {
  organizationId: string;
  locationId: string;
  locationName: string;
  serviceId: string;
  serviceLabel: string;
  businessDate: string;
  currency: "EUR";
  asOf: string;
  illustrative: boolean;

  grossSales: number;
  discounts: number;
  comps: number;
  refunds: number;
  netSales: number;
  tips: number;
  tax: number;
  deliveryGross: number;
  deliveryFees: number;
  paymentsReceived: number;
  openCheckValue: number;
  openCheckCount: number;
  depositsHeld: number;

  covers: number;
  averageSpend: number;

  forecastClose: number;
  expectedByNow: number;
  /** netSales - expectedByNow */
  vsExpectedAbs: number;
  /** (netSales / expectedByNow) - 1 */
  vsExpectedPct: number;

  /** € per minute over lookback window. */
  velocityPerMinute: number;
  expectedVelocityPerMinute: number;

  estimatedContribution: number | null;
  estimatedContributionPct: number | null;

  /** Sparse series for calm sparkline (minutes from service open → net). */
  actualSeries: { t: number; net: number }[];
  expectedSeries: { t: number; net: number }[];
  /**
   * Income-stream lines for the pace chart:
   * total, dine-in, delivery, and delivery providers.
   */
  streamSeries: LiveStreamSeries[];

  sources: SourceFreshness[];
  recentEvents: OperatingEvent[];

  /**
   * Food vs beverage split of net sales.
   * Not the same as seating channel "bar".
   */
  fnb: FnBCategorySplit;
};

export type WhatChangedWindow = {
  minutes: number;
  sales: number;
  refunds: number;
  comps: number;
  discounts: number;
  covers: number;
  netMovement: number;
  lines: string[];
};

export type RevenueBridgeStep = {
  label: string;
  amount: number;
};

export type RevenueBridge = {
  expected: number;
  steps: RevenueBridgeStep[];
  actual: number;
};

export type RoleLiveSummary = {
  kicker: string;
  primary: { amount: string; label: string };
  lines: { label: string; value: string; tone?: "good" | "watch" | "neutral" }[];
  narrative: string;
};
