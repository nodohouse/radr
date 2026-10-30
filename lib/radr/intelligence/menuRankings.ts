/**
 * Menu rankings + action states + basket pairs.
 * SELL × MARGIN × CAPACITY × INVENTORY.
 *
 * Rankings are independent sorts — never assume identical order.
 */

import { berlinMenuItems, type DemoMenuItem } from "@/data/demo/menuIntelligence";
import { LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type MenuRankKind = "sellers" | "contributors" | "operators";

export type MenuActionState = "PUSH" | "HOLD" | "REWORK";

export type RankedDish = {
  itemId: string;
  name: string;
  imageSrc: string | null;
  units: number;
  revenue: number;
  contribution: number;
  contributionPerKitchenMin: number;
  vsPacePct: number;
  badge: string | null;
  action: MenuActionState;
  actionWhy: string;
  /** Primary metric for the active ranking tab */
  primaryMetric: string;
  station: string;
};

export type BasketPair = {
  id: string;
  pair: string;
  imageSrc: string | null;
  basketCount: number;
  attachLift: string;
  avgBasket: string;
  incremental: number;
  promoteNow: boolean;
  holdReason: string | null;
  /** Explicit constraint dimensions */
  inventory: string;
  kitchen: string;
  servicePressure: string;
  contributionNote: string;
};

function unitsOf(item: DemoMenuItem): number {
  return Math.max(1, Math.round(420 * (item.salesMixPct / 100)));
}

/** Dish rankings — bar/beverage stay in basket pairs, not chart rankings. */
function rankingPool(): DemoMenuItem[] {
  return berlinMenuItems().filter((m) => {
    const station = m.station.toLowerCase();
    return station !== "bar";
  });
}

function isPeakWindow(forcePeak?: boolean): boolean {
  if (forcePeak != null) return forcePeak;
  return (
    LIVE_SCENARIO.clockLabel >= "19:00" && LIVE_SCENARIO.clockLabel < "20:30"
  );
}

function actionFor(
  item: DemoMenuItem,
  peak: boolean,
): { action: MenuActionState; why: string } {
  const tuna = item.itemId === "mi_tuna_tataki";
  const pasta = item.itemId === "mi_truffle_pasta";
  const constrained =
    (item.prepTimeMin ?? 0) > 8 ||
    tuna ||
    (item.capacityMetric.comparedToPeerPct != null &&
      item.capacityMetric.comparedToPeerPct < -5);

  if (tuna && peak) {
    return {
      action: "HOLD",
      why: "STAR overall · HOLD 19:00–20:30 · cold station constrained",
    };
  }
  if (pasta || (!constrained && item.contribution >= 10)) {
    return {
      action: "PUSH",
      why: "Demand + economics + kitchen-efficient",
    };
  }
  if (item.contribution < 7 || (item.salesMixPct ?? 0) < 4) {
    return {
      action: "REWORK",
      why: "Weak demand or contribution vs complexity",
    };
  }
  return {
    action: "HOLD",
    why: "Good product · do not increase demand under constraint",
  };
}

function primaryFor(
  kind: MenuRankKind,
  units: number,
  contribution: number,
  cpk: number,
): string {
  if (kind === "sellers") return `${units} sold`;
  if (kind === "contributors") return `€${contribution.toLocaleString("en-IE")} total`;
  return `€${cpk.toFixed(2)} / kitchen min`;
}

export function getMenuRankings(
  kind: MenuRankKind = "sellers",
  opts?: { peak?: boolean },
): RankedDish[] {
  const peak = isPeakWindow(opts?.peak);
  const scored = rankingPool().map((item) => {
    const units = unitsOf(item);
    const revenue = Math.round(units * item.price);
    const contribution = Math.round(units * item.contribution);
    const cpk = item.capacityMetric.contributionPerUnit;
    const { action, why } = actionFor(item, peak);
    const vsPacePct =
      item.itemId === "mi_tuna_tataki"
        ? 18
        : item.itemId === "mi_truffle_pasta"
          ? 9
          : Math.round((item.capacityMetric.comparedToPeerPct ?? 0) * 0.5);
    return {
      item,
      units,
      revenue,
      contribution,
      cpk,
      vsPacePct,
      action,
      why,
    };
  });

  const sorted =
    kind === "sellers"
      ? [...scored].sort((a, b) => b.units - a.units)
      : kind === "contributors"
        ? [...scored].sort((a, b) => b.contribution - a.contribution)
        : [...scored].sort((a, b) => b.cpk - a.cpk);

  return sorted.slice(0, 8).map((s, i) => ({
    itemId: s.item.itemId,
    name: s.item.name,
    imageSrc: s.item.imageSrc ?? null,
    units: s.units,
    revenue: s.revenue,
    contribution: s.contribution,
    contributionPerKitchenMin: s.cpk,
    vsPacePct: s.vsPacePct,
    badge:
      kind === "operators" && i === 0
        ? "#1 contribution / kitchen minute"
        : kind === "contributors" && i === 0
          ? "#1 contribution"
          : kind === "sellers" && i === 0
            ? "#1 demand"
            : null,
    action: s.action,
    actionWhy: s.why,
    primaryMetric: primaryFor(kind, s.units, s.contribution, s.cpk),
    station: s.item.station,
  }));
}

/** Assert the three rankings are not identical orderings. */
export function rankingsAreDistinct(): boolean {
  const sellers = getMenuRankings("sellers").map((d) => d.itemId);
  const contrib = getMenuRankings("contributors").map((d) => d.itemId);
  const ops = getMenuRankings("operators").map((d) => d.itemId);
  const same =
    sellers.join() === contrib.join() && contrib.join() === ops.join();
  return !same;
}

/**
 * Compact Control Center Menu Pulse — top 5.
 * #1 best seller · #2 best operator (if different) · then next sellers.
 */
export function getMenuPulse(): RankedDish[] {
  const sellers = getMenuRankings("sellers");
  const ops = getMenuRankings("operators");
  const bestSeller = sellers[0];
  const bestOp = ops[0];
  if (!bestSeller) return [];

  const out: RankedDish[] = [{ ...bestSeller }];
  if (bestOp && bestOp.itemId !== bestSeller.itemId) {
    out.push({
      ...bestOp,
      badge: "#1 contribution / kitchen minute",
    });
  }
  for (const s of sellers) {
    if (out.length >= 5) break;
    if (out.some((d) => d.itemId === s.itemId)) continue;
    out.push(s);
  }
  return out.slice(0, 5);
}

export function getBasketPairs(opts?: { peak?: boolean }): BasketPair[] {
  const items = berlinMenuItems();
  const tuna = items.find((m) => m.itemId === "mi_tuna_tataki");
  const pasta = items.find((m) => m.itemId === "mi_truffle_pasta");
  const negroni = items.find((m) => m.itemId === "mi_negroni");
  const wine = items.find((m) => m.itemId === "mi_wine_glass");
  const peak = isPeakWindow(opts?.peak);

  return [
    {
      id: "tuna_negroni",
      pair: "Tuna Tataki + Negroni",
      imageSrc: tuna?.imageSrc ?? negroni?.imageSrc ?? null,
      basketCount: 34,
      attachLift: "+6pp",
      avgBasket: "€44",
      incremental: negroni?.contribution ?? 9,
      promoteNow: !peak,
      holdReason: peak
        ? "DO NOT PUSH NOW · Tuna constrained · cold station at peak"
        : null,
      inventory: peak ? "Yellowfin limited" : "OK",
      kitchen: peak ? "Cold station saturated" : "Cold station OK",
      servicePressure: peak ? "High · 19:00–20:30" : "Normal",
      contributionNote: "Strong basket economics",
    },
    {
      id: "pasta_wine",
      pair: "Truffle Pasta + House White",
      imageSrc: pasta?.imageSrc ?? wine?.imageSrc ?? null,
      basketCount: 41,
      attachLift: "+4pp",
      avgBasket: "€48",
      incremental: 8.1,
      promoteNow: true,
      holdReason: null,
      inventory: "OK",
      kitchen: "Low capacity impact",
      servicePressure: "Low",
      contributionNote: "+€8.10 incremental contribution",
    },
  ];
}

export const MENU_INTEL_DECISION = DECISION_IDS.menuPeak;
