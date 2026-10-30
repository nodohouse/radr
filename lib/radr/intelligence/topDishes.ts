/**
 * Top dishes intelligence — derived from menu fixtures.
 */

import { berlinMenuItems, type DemoMenuItem } from "@/data/demo/menuIntelligence";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { IntelJudgment } from "@/lib/radr/intelligence/moduleRegistry";

export type TopDishRow = {
  itemId: string;
  name: string;
  imageSrc: string | null;
  units: number;
  revenue: number;
  contribution: number;
  contributionPerKitchenMin: number;
  vsComparablePct: number;
  rankRevenue: number;
  rankKitchenMin: number;
};

export type TopDishesReport = {
  periodLabel: string;
  rows: TopDishRow[];
  radrRead: string;
  judgment: IntelJudgment;
  relatedDecisionId: string | null;
  available: boolean;
  needsDataLabel: string | null;
};

function estimateUnits(item: DemoMenuItem): number {
  // Deterministic from mix — ~420 covers * mix
  return Math.max(1, Math.round(420 * (item.salesMixPct / 100)));
}

export function getTopDishes(
  period: "tonight" | "today" | "7d" | "mtd" = "tonight",
): TopDishesReport {
  const items = berlinMenuItems();
  if (items.length === 0) {
    return {
      periodLabel: period,
      rows: [],
      radrRead: "Needs POS item-level sales.",
      judgment: "NEEDS_DATA",
      relatedDecisionId: null,
      available: false,
      needsDataLabel: "Connect POS →",
    };
  }

  const scored = items.map((item) => {
    const units = estimateUnits(item);
    const revenue = Math.round(units * item.price);
    const contribution = Math.round(units * item.contribution);
    const contributionPerKitchenMin =
      item.capacityMetric.contributionPerUnit;
    const vsComparablePct = Math.round(
      (item.capacityMetric.comparedToPeerPct ?? 0) *
        (item.name.includes("Tuna") ? 1 : 0.6),
    );
    return {
      item,
      units,
      revenue,
      contribution,
      contributionPerKitchenMin,
      vsComparablePct,
    };
  });

  const byRevenue = [...scored].sort((a, b) => b.revenue - a.revenue);
  const byKitchen = [...scored].sort(
    (a, b) => b.contributionPerKitchenMin - a.contributionPerKitchenMin,
  );

  const rows: TopDishRow[] = byRevenue.slice(0, 4).map((s, i) => {
    const kitchenRank =
      byKitchen.findIndex((x) => x.item.itemId === s.item.itemId) + 1;
    return {
      itemId: s.item.itemId,
      name: s.item.name,
      imageSrc: s.item.imageSrc ?? null,
      units: s.units,
      revenue: s.revenue,
      contribution: s.contribution,
      contributionPerKitchenMin: s.contributionPerKitchenMin,
      vsComparablePct:
        s.item.name.includes("Tuna") ? 18 : s.vsComparablePct || -4,
      rankRevenue: i + 1,
      // Tuna is intentionally a kitchen-minute lagging star in the demo.
      rankKitchenMin: s.item.name.includes("Tuna")
        ? Math.max(kitchenRank, 6)
        : kitchenRank,
    };
  });

  const tuna = rows.find((r) => r.name.includes("Tuna"));
  const radrRead = tuna
    ? `${tuna.name} is #${tuna.rankRevenue} by revenue but #${tuna.rankKitchenMin} by contribution per kitchen minute during peak.`
    : "Menu mix is within expected contribution bands.";

  return {
    periodLabel:
      period === "tonight"
        ? "Tonight"
        : period === "today"
          ? "Today"
          : period === "7d"
            ? "7 days"
            : "MTD",
    rows,
    radrRead,
    judgment: tuna && tuna.rankKitchenMin >= 4 ? "DECISION_FORMED" : "WATCHING",
    relatedDecisionId: DECISION_IDS.menuPeak,
    available: true,
    needsDataLabel: null,
  };
}
