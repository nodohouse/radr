/**
 * Compose helpers for Channel Economics.
 */

import type { ChannelEconomicsState, SalesChannelKind } from "./types";
import { demoBerlinLiveChannels } from "./demoBerlinLive";

export const CHANNEL_ECONOMICS_ROLES = [
  "cfo",
  "finance",
  "owner",
  "coo",
  "gm",
] as const;

export type ChannelEconomicsRole = (typeof CHANNEL_ECONOMICS_ROLES)[number];

export function canAccessChannelEconomics(role: string): boolean {
  return (CHANNEL_ECONOMICS_ROLES as readonly string[]).includes(role);
}

export function composeBerlinChannelEconomics(
  netSalesFromLive?: number,
): ChannelEconomicsState {
  return demoBerlinLiveChannels(netSalesFromLive);
}

/** Revenue shares across primary channels should sum ≈ 100. */
export function revenueShareIdentity(
  state: ChannelEconomicsState,
): { ok: boolean; sum: number } {
  const sum = round1(
    state.channels.reduce((s, c) => s + c.revenueSharePct, 0),
  );
  return { ok: Math.abs(sum - 100) <= 0.5, sum };
}

/** Contribution shares should sum ≈ 100. */
export function contributionShareIdentity(
  state: ChannelEconomicsState,
): { ok: boolean; sum: number } {
  const sum = round1(
    state.channels.reduce((s, c) => s + c.contributionSharePct, 0),
  );
  return { ok: Math.abs(sum - 100) <= 0.6, sum };
}

/** Channel net sales sum to operating net sales. */
export function channelNetSalesIdentity(
  state: ChannelEconomicsState,
): { ok: boolean; fromChannels: number } {
  const fromChannels = round2(
    state.channels.reduce((s, c) => s + c.netSales, 0),
  );
  return {
    ok: Math.abs(fromChannels - state.netSales) < 0.05,
    fromChannels,
  };
}

/** Provider contributions sum to delivery channel contribution. */
export function deliveryProviderContributionIdentity(
  state: ChannelEconomicsState,
): { ok: boolean; fromProviders: number; expected: number } {
  const delivery = state.channels.find((c) => c.kind === "delivery");
  if (!delivery?.providers) {
    return { ok: false, fromProviders: 0, expected: 0 };
  }
  const fromProviders = round2(
    delivery.providers.reduce((s, p) => s + p.contribution, 0),
  );
  return {
    ok: Math.abs(fromProviders - delivery.contribution) < 0.05,
    fromProviders,
    expected: delivery.contribution,
  };
}

/** Pause decision never auto-executes. */
export function pauseRequiresApproval(state: ChannelEconomicsState): boolean {
  return (
    state.pauseDecision.requiresApproval === true &&
    state.pauseDecision.status === "prepared"
  );
}

export function channelByKind(
  state: ChannelEconomicsState,
  kind: SalesChannelKind,
) {
  return state.channels.find((c) => c.kind === kind);
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
