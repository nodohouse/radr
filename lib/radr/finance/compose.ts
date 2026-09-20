/**
 * Compose helpers for the Financial Operating Layer.
 */

import type { FinancialOperatingState, WaterfallLine } from "./types";
import { demoBerlinLiveFinance } from "./demoBerlinLive";

/** Waterfall identity: start − sum(less) = result contribution. */
export function waterfallContributionIdentity(
  state: FinancialOperatingState,
): { ok: boolean; expected: number; fromLines: number } {
  const start = state.waterfall.find((l) => l.kind === "start");
  const less = state.waterfall.filter((l) => l.kind === "less");
  const result = state.waterfall.find((l) => l.kind === "result");
  if (!start || !result) {
    return { ok: false, expected: 0, fromLines: 0 };
  }
  const fromLines =
    Math.round(
      (start.amount - less.reduce((s, l) => s + l.amount, 0)) * 100,
    ) / 100;
  const expected = result.amount;
  return {
    ok: Math.abs(fromLines - expected) < 0.02,
    expected,
    fromLines,
  };
}

export function moneyLeftMatchesContribution(
  state: FinancialOperatingState,
): boolean {
  const left = state.moneyFlow.find((c) => c.kind === "left");
  if (!left) return false;
  return Math.abs(left.total - state.liveContribution) < 0.02;
}

export function lineById(
  state: FinancialOperatingState,
  id: string,
): WaterfallLine | undefined {
  return state.waterfall.find((l) => l.id === id);
}

/** Finance-capable product roles for the operating layer. */
export const FINANCE_LAYER_ROLES = [
  "cfo",
  "finance",
  "owner",
  "coo",
] as const;

export type FinanceLayerRole = (typeof FINANCE_LAYER_ROLES)[number];

export function canAccessFinanceLayer(role: string): boolean {
  return (FINANCE_LAYER_ROLES as readonly string[]).includes(role);
}

export function composeBerlinFinanceOperatingBrief(
  netSalesFromLive?: number,
): FinancialOperatingState {
  return demoBerlinLiveFinance(netSalesFromLive);
}
