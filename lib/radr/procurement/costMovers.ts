/**
 * Procurement cost movers — vendor SKU economics (demo SSOT).
 */

export type CostMoverHorizon = "7D" | "30D" | "90D" | "1Y";

export type PricePoint = {
  label: string;
  contract: number;
  paid: number;
};

export type VendorSkuCostMover = {
  skuId: string;
  name: string;
  vendor: string;
  unit: string;
  contractRate: number;
  currentRate: number;
  changePct30d: number;
  exposureEuro: number;
  fillRatePct: number;
  leadTimeDays: number;
  priceSeries: Record<CostMoverHorizon, PricePoint[]>;
  radrRead: string;
  relatedDecisionId: string | null;
};

export type TunaVendorFork = {
  id: string;
  vendor: string;
  unitPrice: number;
  leadTimeDays: number;
  fillRatePct: number;
  expectedContributionEuro: number;
  note: string;
  recommended?: boolean;
};

export const COST_MOVER_SKUS: VendorSkuCostMover[] = [
  {
    skuId: "sku_tuna_bluefin",
    name: "Bluefin tuna · sashimi grade",
    vendor: "Nordic Seafood",
    unit: "kg",
    contractRate: 42.5,
    currentRate: 46.8,
    changePct30d: 8.4,
    exposureEuro: 1840,
    fillRatePct: 91,
    leadTimeDays: 1,
    priceSeries: buildSeries(42.5, 46.8),
    radrRead:
      "Tuna pace vs peak covers is tightening. Rush premium historically erodes margin unless feature-swap is prepared.",
    relatedDecisionId: "dec_tuna_berlin",
  },
  {
    skuId: "sku_olive_oil",
    name: "Extra virgin olive oil",
    vendor: "Mediterranean Direct",
    unit: "L",
    contractRate: 6.8,
    currentRate: 7.45,
    changePct30d: 9.6,
    exposureEuro: 273,
    fillRatePct: 98,
    leadTimeDays: 3,
    priceSeries: buildSeries(6.8, 7.45),
    radrRead:
      "Invoice €7.45/L vs contract €6.80/L on 420 L — AP variance Decision formed (D-4102).",
    relatedDecisionId: "dec_supplier_berlin",
  },
  {
    skuId: "sku_chicken_supreme",
    name: "Chicken supreme · 180g",
    vendor: "Berlin Proteins",
    unit: "kg",
    contractRate: 8.9,
    currentRate: 9.35,
    changePct30d: 3.2,
    exposureEuro: 96,
    fillRatePct: 100,
    leadTimeDays: 2,
    priceSeries: buildSeries(8.9, 9.35),
    radrRead: "Within contract band but drifting — watch next delivery window.",
    relatedDecisionId: null,
  },
  {
    skuId: "sku_coke_postmix",
    name: "Coke post-mix · BIB",
    vendor: "BeverageCo",
    unit: "L",
    contractRate: 0.42,
    currentRate: 0.44,
    changePct30d: 1.8,
    exposureEuro: 38,
    fillRatePct: 99,
    leadTimeDays: 5,
    priceSeries: buildSeries(0.42, 0.44),
    radrRead: "Low exposure · fee-stable · no Decision required.",
    relatedDecisionId: null,
  },
];

export const TUNA_VENDOR_FORKS: TunaVendorFork[] = [
  {
    id: "nordic_rush",
    vendor: "Nordic Seafood · rush",
    unitPrice: 48.2,
    leadTimeDays: 1,
    fillRatePct: 91,
    expectedContributionEuro: 1520,
    note: "Obvious rush path · premium baked in",
  },
  {
    id: "atlantic_swap",
    vendor: "Atlantic Catch · standing",
    unitPrice: 44.1,
    leadTimeDays: 2,
    fillRatePct: 88,
    expectedContributionEuro: 1580,
    note: "Lower unit cost · longer prep window",
    recommended: true,
  },
  {
    id: "feature_swap",
    vendor: "No rush · feature Truffle Pasta",
    unitPrice: 0,
    leadTimeDays: 0,
    fillRatePct: 100,
    expectedContributionEuro: 1640,
    note: "Historically highest verified protection at Soho · New York",
  },
];

function buildSeries(
  contract: number,
  paid: number,
): Record<CostMoverHorizon, PricePoint[]> {
  const mk = (n: number, labels: string[]) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / Math.max(n - 1, 1);
      // Deterministic wobble (no Math.random)
      const wobble = ((i % 5) - 2) * 0.008 * contract;
      const paidPt = contract + (paid - contract) * t * t + wobble;
      return {
        label: labels[i] ?? String(i + 1),
        contract,
        paid: Math.round(paidPt * 100) / 100,
      };
    });
  const may30 = ["May 1", "May 4", "May 8", "May 11", "May 15", "May 18", "May 22", "May 25", "May 28", "May 30"];
  const may7 = ["May 24", "May 25", "May 26", "May 27", "May 28", "May 29", "May 30"];
  const q = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  const y = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  return {
    "7D": mk(7, may7),
    "30D": mk(10, may30),
    "90D": mk(12, q),
    "1Y": mk(12, y),
  };
}

export function getCostMovers(): VendorSkuCostMover[] {
  return COST_MOVER_SKUS;
}

export function getTunaVendorForks(): TunaVendorFork[] {
  return TUNA_VENDOR_FORKS;
}

export function primaryCostMover(): VendorSkuCostMover {
  return COST_MOVER_SKUS[1]!;
}
