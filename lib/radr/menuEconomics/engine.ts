/**
 * Menu economics engine — contribution depth beyond bestsellers.
 * Bestseller ≠ best item. Kitchen burden and pairings matter.
 */

import type { DishIntel } from "@/lib/radr/lookback/demoMenuWrapped";
import { listDishIntel } from "@/lib/radr/lookback/demoMenuWrapped";
import type { HiddenSignal } from "@/lib/radr/domain/hiddenSignal";
import { parseHiddenSignal } from "@/lib/radr/domain/hiddenSignal";

/** Demo kitchen minutes per plate (prep + pass) — estimated when not on dish. */
const KITCHEN_MINUTES: Record<string, number> = {
  dish_tataki: 6.5,
  dish_truffle: 4.2,
  dish_miso: 5.0,
  dish_salmon: 7.8,
};

export type MenuEconomicsRow = {
  dishId: string;
  name: string;
  units: number;
  revenue: number;
  contribution: number;
  marginPct: number;
  kitchenMinutes: number;
  contributionPerKitchenMinute: number;
  contributionPerCover: number;
  stockouts: number;
  returningAffinityPct: number;
  volumeRank: number;
  economicsRank: number;
  /** Volume leader but weak vs peers on contribution / kitchen min */
  bestsellerWeakEconomics: boolean;
  wastePct: number;
  channelDeliveryPct: number;
};

export type PairingDiscovery = {
  anchorDishId: string;
  anchorName: string;
  pairedItem: string;
  times: number;
  attachmentPct: number;
  baselineAttachPct: number;
  liftPts: number;
  /** Association support = times / anchor units */
  support: number;
  confidence: number;
  sampleSize: number;
  epistemic: "ASSOCIATED" | "HISTORICALLY_FOLLOWED";
  meetsThreshold: boolean;
};

const MIN_PAIRING_SAMPLE = 100;
const MIN_LIFT_PTS = 8;

function kitchenMinutesFor(dish: DishIntel): number {
  return KITCHEN_MINUTES[dish.id] ?? 5.5;
}

export function computeMenuEconomics(
  dishes: DishIntel[] = listDishIntel(),
): MenuEconomicsRow[] {
  const withMetrics = dishes.map((d) => {
    const kitchenMinutes = kitchenMinutesFor(d);
    const contributionPerKitchenMinute =
      kitchenMinutes > 0 ? d.contribution / (d.units * kitchenMinutes) : 0;
    return {
      dishId: d.id,
      name: d.name,
      units: d.units,
      revenue: d.revenue,
      contribution: d.contribution,
      marginPct: d.marginPct,
      kitchenMinutes,
      contributionPerKitchenMinute,
      contributionPerCover: d.units > 0 ? d.contribution / d.units : 0,
      stockouts: d.stockouts,
      returningAffinityPct: d.returningAffinityPct,
      wastePct: d.wastePct,
      channelDeliveryPct: d.channelMix.delivery,
      volumeRank: 0,
      economicsRank: 0,
      bestsellerWeakEconomics: false,
    };
  });

  const byVolume = [...withMetrics].sort((a, b) => b.units - a.units);
  const byEcon = [...withMetrics].sort(
    (a, b) => b.contributionPerKitchenMinute - a.contributionPerKitchenMinute,
  );

  return withMetrics.map((row) => {
    const volumeRank = byVolume.findIndex((r) => r.dishId === row.dishId) + 1;
    const economicsRank = byEcon.findIndex((r) => r.dishId === row.dishId) + 1;
    const topVolume = volumeRank === 1;
    const notBestEconomics = economicsRank > 1;
    return {
      ...row,
      volumeRank,
      economicsRank,
      bestsellerWeakEconomics: topVolume && notBestEconomics,
    };
  });
}

/**
 * Pairing discovery with support / confidence / baseline lift.
 * Language stays ASSOCIATED unless thresholds are strong.
 */
export function discoverPairings(
  dishes: DishIntel[] = listDishIntel(),
  baselineWineAttachPct = 24,
): PairingDiscovery[] {
  const out: PairingDiscovery[] = [];
  for (const d of dishes) {
    for (const p of d.pairings) {
      const support = d.units > 0 ? p.times / d.units : 0;
      const confidence = p.attachmentPct / 100;
      const liftPts = p.attachmentPct - baselineWineAttachPct;
      const meetsThreshold =
        p.times >= MIN_PAIRING_SAMPLE && liftPts >= MIN_LIFT_PTS;
      out.push({
        anchorDishId: d.id,
        anchorName: d.name,
        pairedItem: p.name,
        times: p.times,
        attachmentPct: p.attachmentPct,
        baselineAttachPct: baselineWineAttachPct,
        liftPts,
        support,
        confidence,
        sampleSize: p.times,
        epistemic: meetsThreshold ? "HISTORICALLY_FOLLOWED" : "ASSOCIATED",
        meetsThreshold,
      });
    }
  }
  return out.sort((a, b) => b.liftPts - a.liftPts);
}

export function bestsellerWeakEconomicsSignal(
  rows: MenuEconomicsRow[] = computeMenuEconomics(),
): HiddenSignal | null {
  const weak = rows.find((r) => r.bestsellerWeakEconomics);
  if (!weak) return null;
  const better = [...rows].sort(
    (a, b) => b.contributionPerKitchenMinute - a.contributionPerKitchenMinute,
  )[0];
  if (!better || better.dishId === weak.dishId) return null;

  const liftPct = Math.round(
    ((better.contributionPerKitchenMinute - weak.contributionPerKitchenMinute) /
      weak.contributionPerKitchenMinute) *
      100,
  );
  const annualized = Math.round(
    (better.contributionPerCover - weak.contributionPerCover) *
      Math.min(weak.units, 2400) *
      0.15,
  );

  return parseHiddenSignal({
    id: "hs_engine_bestseller_weak",
    kind: "BESTSELLER_WEAK_ECONOMICS",
    vertical: "restaurant",
    horizon: "THIS_MONTH",
    headline: "Your bestseller is not your best dish.",
    what: `${weak.name} is #${weak.volumeRank} by volume. ${better.name} produces +${liftPct}% contribution per kitchen minute.`,
    whyMatters:
      "During peak service, promoting volume leaders can raise kitchen pressure while leaving contribution on the table.",
    valueLabel: "Annualized opportunity",
    valueAmount: Math.max(annualized, 4200),
    valuePositive: true,
    recommendation: `Increase ${better.name} prominence during peak periods.`,
    epistemic: "HISTORICALLY_FOLLOWED",
    sampleSize: weak.units,
    confidenceBand: "HIGH",
    confidenceExplanation:
      "POS volume + contribution + estimated kitchen minutes joined for this location.",
    evidence: [
      { label: `${weak.name} volume rank`, value: `#${weak.volumeRank}`, kind: "ACTUAL" },
      {
        label: `${weak.name} € / kitchen min`,
        value: `€${weak.contributionPerKitchenMinute.toFixed(2)}`,
        kind: "ESTIMATE",
      },
      {
        label: `${better.name} € / kitchen min`,
        value: `€${better.contributionPerKitchenMinute.toFixed(2)}`,
        kind: "ESTIMATE",
      },
      { label: `${weak.name} stockouts`, value: String(weak.stockouts), kind: "ACTUAL" },
    ],
    systemsJoined: ["POS", "Recipes", "Ticket times"],
    promoteToCockpit: false,
  });
}

export function topPairingSignal(
  pairings: PairingDiscovery[] = discoverPairings(),
): HiddenSignal | null {
  const top = pairings.find((p) => p.meetsThreshold);
  if (!top) return null;
  const incremental = Math.round(top.liftPts * 12 * top.sampleSize * 0.02);
  return parseHiddenSignal({
    id: `hs_pairing_${top.anchorDishId}`,
    kind: "PAIRING_OPPORTUNITY",
    vertical: "restaurant",
    horizon: "THIS_WEEK",
    headline: `Pairing lift · ${top.anchorName} → ${top.pairedItem}`,
    what: `Guests ordering ${top.anchorName} choose ${top.pairedItem} ${top.attachmentPct}% of the time vs ${top.baselineAttachPct}% baseline wine attach (+${top.liftPts} pts).`,
    whyMatters:
      "Surfacing the pairing on menu or server prompt can capture incremental contribution without inventing causality.",
    valueLabel: "Incremental contribution (est.)",
    valueAmount: incremental,
    valuePositive: true,
    recommendation: `Menu placement + server prompt for ${top.pairedItem} with ${top.anchorName}.`,
    epistemic: top.epistemic,
    sampleSize: top.sampleSize,
    confidenceBand: top.sampleSize >= 500 ? "HIGH" : "MEDIUM",
    confidenceExplanation: `Support ${(top.support * 100).toFixed(1)}% · confidence ${(top.confidence * 100).toFixed(0)}% · n=${top.sampleSize}. Associated with — not proven causal.`,
    evidence: [
      { label: "Attachment", value: `${top.attachmentPct}%`, kind: "ACTUAL" },
      { label: "Baseline attach", value: `${top.baselineAttachPct}%`, kind: "BASELINE" },
      { label: "Lift", value: `+${top.liftPts} pts`, kind: "INFERENCE" },
      { label: "Sample", value: String(top.sampleSize), kind: "SAMPLE" },
    ],
    systemsJoined: ["POS"],
    promoteToCockpit: false,
  });
}

export function menuEconomicsHiddenSignals(): HiddenSignal[] {
  return [bestsellerWeakEconomicsSignal(), topPairingSignal()].filter(
    (s): s is HiddenSignal => s != null,
  );
}
