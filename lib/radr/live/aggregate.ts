/**
 * Recognition rules - one economic fact, one count.
 */

import type { OperatingEvent, ShiftEconomicState } from "./types";
import { splitFnBNetSales } from "@/lib/radr/fnb";

const emptyState = (
  partial: Pick<
    ShiftEconomicState,
    | "organizationId"
    | "locationId"
    | "locationName"
    | "serviceId"
    | "serviceLabel"
    | "businessDate"
    | "asOf"
    | "illustrative"
    | "forecastClose"
    | "expectedByNow"
  >,
): ShiftEconomicState => ({
  ...partial,
  currency: "EUR",
  grossSales: 0,
  discounts: 0,
  comps: 0,
  refunds: 0,
  netSales: 0,
  tips: 0,
  tax: 0,
  deliveryGross: 0,
  deliveryFees: 0,
  paymentsReceived: 0,
  openCheckValue: 0,
  openCheckCount: 0,
  depositsHeld: 0,
  covers: 0,
  averageSpend: 0,
  vsExpectedAbs: 0,
  vsExpectedPct: 0,
  velocityPerMinute: 0,
  expectedVelocityPerMinute: 0,
  estimatedContribution: null,
  estimatedContributionPct: null,
  actualSeries: [],
  expectedSeries: [],
  streamSeries: [],
  sources: [],
  recentEvents: [],
  fnb: splitFnBNetSales(0),
});

/**
 * Fold events in chronological order into shift economics.
 * PAYMENT with settlementOfSaleId never increments netSales.
 */
export function aggregateOperatingEvents(
  events: OperatingEvent[],
  base: Parameters<typeof emptyState>[0] & {
    expectedVelocityPerMinute?: number;
    contributionRate?: number;
    actualSeries?: { t: number; net: number }[];
    expectedSeries?: { t: number; net: number }[];
    streamSeries?: ShiftEconomicState["streamSeries"];
    sources?: ShiftEconomicState["sources"];
  },
): ShiftEconomicState {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
  const state = emptyState(base);
  const recognizedSales = new Set<string>();

  for (const e of sorted) {
    const amt = e.amount;
    switch (e.eventType) {
      case "SALE": {
        if (recognizedSales.has(e.id)) break;
        recognizedSales.add(e.id);
        state.grossSales += amt;
        state.netSales += amt;
        if (e.channel === "delivery") state.deliveryGross += amt;
        break;
      }
      case "DELIVERY_ORDER": {
        if (recognizedSales.has(e.id)) break;
        recognizedSales.add(e.id);
        state.grossSales += amt;
        state.netSales += amt;
        state.deliveryGross += amt;
        break;
      }
      case "PAYMENT": {
        state.paymentsReceived += amt;
        // Settlement of an already-recognized sale: do not touch netSales.
        if (e.settlementOfSaleId && recognizedSales.has(e.settlementOfSaleId)) {
          break;
        }
        break;
      }
      case "REFUND": {
        state.refunds += Math.abs(amt);
        state.netSales -= Math.abs(amt);
        break;
      }
      case "VOID": {
        state.refunds += Math.abs(amt);
        state.grossSales -= Math.abs(amt);
        state.netSales -= Math.abs(amt);
        break;
      }
      case "DISCOUNT": {
        state.discounts += Math.abs(amt);
        state.netSales -= Math.abs(amt);
        break;
      }
      case "COMP": {
        state.comps += Math.abs(amt);
        state.netSales -= Math.abs(amt);
        break;
      }
      case "FEE": {
        state.deliveryFees += Math.abs(amt);
        break;
      }
      case "DEPOSIT": {
        state.depositsHeld += amt;
        break;
      }
      case "CHECK_OPENED": {
        state.openCheckValue += amt;
        state.openCheckCount += 1;
        break;
      }
      case "COVERS": {
        state.covers += Math.round(amt);
        break;
      }
      case "CANCELLATION":
      case "ADJUSTMENT":
        break;
      default:
        break;
    }
  }

  state.netSales = Math.max(0, Math.round(state.netSales * 100) / 100);
  state.grossSales = Math.max(0, Math.round(state.grossSales * 100) / 100);
  state.averageSpend =
    state.covers > 0 ? Math.round((state.netSales / state.covers) * 100) / 100 : 0;

  state.vsExpectedAbs = Math.round((state.netSales - base.expectedByNow) * 100) / 100;
  state.vsExpectedPct =
    base.expectedByNow > 0
      ? Math.round((state.vsExpectedAbs / base.expectedByNow) * 1000) / 10
      : 0;

  const lookback = sorted.slice(-12);
  if (lookback.length >= 2) {
    const t0 = new Date(lookback[0]!.timestamp).getTime();
    const t1 = new Date(lookback[lookback.length - 1]!.timestamp).getTime();
    const minutes = Math.max(1, (t1 - t0) / 60_000);
    const salesInWindow = lookback
      .filter((e) => e.eventType === "SALE" || e.eventType === "DELIVERY_ORDER")
      .reduce((s, e) => s + e.amount, 0);
    state.velocityPerMinute = Math.round((salesInWindow / minutes) * 100) / 100;
  }
  state.expectedVelocityPerMinute = base.expectedVelocityPerMinute ?? 18.5;

  if (base.contributionRate != null) {
    state.estimatedContribution =
      Math.round(state.netSales * base.contributionRate * 100) / 100;
    state.estimatedContributionPct = Math.round(base.contributionRate * 1000) / 10;
  }

  state.actualSeries = base.actualSeries ?? [];
  state.expectedSeries = base.expectedSeries ?? [];
  state.streamSeries = base.streamSeries ?? [];
  state.sources = base.sources ?? [];
  state.recentEvents = sorted.slice(-24).reverse();
  state.asOf = sorted[sorted.length - 1]?.timestamp ?? base.asOf;
  state.fnb = splitFnBNetSales(state.netSales);

  return state;
}
