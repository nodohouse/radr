/**
 * Margin Response — strongest response to a margin shock.
 * Not "menu pricing." Price-needed-to-hit-margin is one input among Futures.
 */

import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";

export type ShockClass =
  | "CONTRACT_VARIANCE"
  | "MARKET_PRICE_CHANGE"
  | "PACK_SIZE_CHANGE"
  | "TEMPORARY_SURCHARGE"
  | "DATA_CONFLICT"
  | "UNCLASSIFIED";

export type MarginResponseId =
  | "absorb"
  | "raise_item"
  | "category_rebalance"
  | "change_bundle"
  | "switch_supplier"
  | "negotiate"
  | "promote_substitute"
  | "wait"
  | "dispute";

export type PropagationNode = {
  id: string;
  kind:
    | "SUPPLIER"
    | "SKU"
    | "INGREDIENT"
    | "RECIPE"
    | "MENU_ITEM"
    | "BASKET"
    | "CHANNEL"
    | "CATEGORY"
    | "LOCATION"
    | "PNL";
  label: string;
  detail?: string;
  euro?: number;
  depth: number;
};

export type MarginFuture = {
  id: MarginResponseId;
  label: string;
  feasible: boolean;
  expectedContributionEuro: number | null;
  transactionsAffected: number | null;
  basketEffect: string;
  guestPriceExposure: "low" | "medium" | "high" | "uncertain";
  supplierDependency: string;
  mainUncertainty: string;
  priceNeededNote?: string;
  recommended?: boolean;
  isNoAction?: boolean;
  economicEffectNote?: string;
};

export type MenuComplexityDrivers = {
  uniqueIngredientCount: number;
  lowTurnSkus: number;
  prepSteps: number;
  prepMinutes: number;
  stationDependency: string;
  supplierDependencyCount: number;
  moqExposure: boolean;
  wasteSpoilagePct: number;
  trainingComplexity: "low" | "medium" | "high";
};

export type ComplexityAdjustedContribution = {
  directContributionEuro: number;
  complexityTaxEuro: number;
  adjustedContributionEuro: number;
  drivers: MenuComplexityDrivers;
  verdict: string;
  demo: true;
};

/** Coca-Cola 330ml cost shock — illustrative Margin Response Finding → Decision. */
export const COKE_MARGIN_SHOCK = {
  id: "shock_coke_berlin",
  sku: "Coca-Cola 330ml",
  supplier: "Beverage Co · Berlin",
  locationId: DEMO_LOCATIONS.berlin.id,
  locationName: "Berlin Mitte",
  priorUnitCostEuro: 0.42,
  newUnitCostEuro: 0.52,
  deltaEuro: 0.1,
  deltaPct: 23.8,
  weeklyVolume: 1840,
  weeklyExposureEuro: 184,
  monthlyExposureEuro: 796,
  shockClass: "MARKET_PRICE_CHANGE" as ShockClass,
  shockClassNote:
    "Invoice unit price rose · contract rate unchanged on paper · market list confirmed — not a silent data conflict",
  disputeFirst: false,
  category: "Beverage",
  priceNeededToRestoreMarginEuro: 0.55,
  priceNeededNote:
    "€0.55 restores theoretical item margin — not the Decision. Volume, basket, and category architecture may dominate.",
  elasticityEvidence: "INSUFFICIENT" as const,
  elasticityNote: "PRICE RESPONSE UNCERTAIN — insufficient location price-history sample",
  demo: true as const,
};

export const COKE_PROPAGATION: PropagationNode[] = [
  {
    id: "n_sup",
    kind: "SUPPLIER",
    label: "Beverage Co",
    detail: "Invoice · market list",
    depth: 0,
  },
  {
    id: "n_sku",
    kind: "SKU",
    label: "Coca-Cola 330ml",
    detail: "+€0.10 / unit · +23.8%",
    euro: COKE_MARGIN_SHOCK.deltaEuro,
    depth: 1,
  },
  {
    id: "n_ing",
    kind: "INGREDIENT",
    label: "Coke 330 · recipe unit",
    detail: "BOM link · observed",
    depth: 2,
  },
  {
    id: "n_coke",
    kind: "MENU_ITEM",
    label: "Coca-Cola",
    detail: "High volume · anchor beverage",
    euro: 96,
    depth: 3,
  },
  {
    id: "n_diet",
    kind: "MENU_ITEM",
    label: "Diet Coke",
    detail: "Same SKU family",
    euro: 41,
    depth: 3,
  },
  {
    id: "n_bundle",
    kind: "BASKET",
    label: "Lunch drink bundle",
    detail: "Attach rate 38%",
    euro: 28,
    depth: 4,
  },
  {
    id: "n_ch",
    kind: "CHANNEL",
    label: "Dine-in · delivery",
    detail: "Delivery fee unchanged",
    depth: 4,
  },
  {
    id: "n_cat",
    kind: "CATEGORY",
    label: "Beverage category",
    detail: "Weekly contribution pressure",
    euro: COKE_MARGIN_SHOCK.weeklyExposureEuro,
    depth: 5,
  },
  {
    id: "n_loc",
    kind: "LOCATION",
    label: "Berlin Mitte",
    detail: "P&L week",
    euro: COKE_MARGIN_SHOCK.weeklyExposureEuro,
    depth: 6,
  },
  {
    id: "n_pnl",
    kind: "PNL",
    label: "Contribution exposure",
    detail: `~€${COKE_MARGIN_SHOCK.monthlyExposureEuro} / month if absorbed`,
    euro: COKE_MARGIN_SHOCK.monthlyExposureEuro,
    depth: 7,
  },
];

export const COKE_MARGIN_FUTURES: MarginFuture[] = [
  {
    id: "absorb",
    label: "Absorb cost",
    feasible: true,
    expectedContributionEuro: 0,
    transactionsAffected: COKE_MARGIN_SHOCK.weeklyVolume,
    basketEffect: "No guest price move · full exposure lands in contribution",
    guestPriceExposure: "low",
    supplierDependency: "Unchanged",
    mainUncertainty: "How long market price stays elevated",
    isNoAction: true,
    economicEffectNote: "Baseline · absorb full weekly exposure",
  },
  {
    id: "raise_item",
    label: "Raise Coke only (+€0.20)",
    feasible: true,
    expectedContributionEuro: 142,
    transactionsAffected: 1680,
    basketEffect: "Item margin recovers · attach risk on lunch bundles",
    guestPriceExposure: "medium",
    supplierDependency: "Unchanged",
    mainUncertainty: COKE_MARGIN_SHOCK.elasticityNote,
    priceNeededNote: COKE_MARGIN_SHOCK.priceNeededNote,
  },
  {
    id: "category_rebalance",
    label: "Beverage category rebalance",
    feasible: true,
    expectedContributionEuro: 168,
    transactionsAffected: 920,
    basketEffect:
      "Small move on anchor · larger on premium soft · protect bundle attach",
    guestPriceExposure: "medium",
    supplierDependency: "Unchanged",
    mainUncertainty: "Guest perception of category architecture",
    recommended: true,
  },
  {
    id: "negotiate",
    label: "Negotiate / prepare procurement case",
    feasible: true,
    expectedContributionEuro: 110,
    transactionsAffected: null,
    basketEffect: "No guest change if successful",
    guestPriceExposure: "low",
    supplierDependency: "Pressure on current supplier",
    mainUncertainty: "Supplier willingness · cross-location leverage",
  },
  {
    id: "switch_supplier",
    label: "Switch supplier",
    feasible: false,
    expectedContributionEuro: null,
    transactionsAffected: null,
    basketEffect: "Not feasible this week — MOQ + delivery slot lock",
    guestPriceExposure: "low",
    supplierDependency: "Blocked by ops constraint",
    mainUncertainty: "Lead time · brand consistency",
    economicEffectNote: "Economic effect not yet modeled · constraint binds",
  },
  {
    id: "wait",
    label: "Wait · option value",
    feasible: true,
    expectedContributionEuro: 40,
    transactionsAffected: null,
    basketEffect: "Preserve price position · reassess after 2 invoice cycles",
    guestPriceExposure: "low",
    supplierDependency: "Watch",
    mainUncertainty: "Whether surcharge is temporary",
  },
];

/** Cross-location SKU leverage — illustrative. */
export const COKE_SUPPLIER_LEVERAGE = [
  {
    location: "Berlin",
    unitCostEuro: 0.52,
    volumeWeek: 1840,
    contractEuro: 0.42,
  },
  {
    location: "Amsterdam",
    unitCostEuro: 0.48,
    volumeWeek: 980,
    contractEuro: 0.44,
  },
  {
    location: "Lisbon",
    unitCostEuro: 0.46,
    volumeWeek: 640,
    contractEuro: 0.45,
  },
] as const;

export function tunaComplexityAdjusted(): ComplexityAdjustedContribution {
  const drivers: MenuComplexityDrivers = {
    uniqueIngredientCount: 3,
    lowTurnSkus: 2,
    prepSteps: 6,
    prepMinutes: 11,
    stationDependency: "Cold station",
    supplierDependencyCount: 2,
    moqExposure: true,
    wasteSpoilagePct: 6,
    trainingComplexity: "high",
  };
  const direct = 14.2;
  const tax = 3.8;
  return {
    directContributionEuro: direct,
    complexityTaxEuro: tax,
    adjustedContributionEuro: +(direct - tax).toFixed(2),
    drivers,
    verdict:
      "DIRECT MARGIN STRONG · SYSTEM ECONOMICS WEAK — unique SKUs + cold-station minutes + spoilage",
    demo: true,
  };
}

export function simulateCokePriceRaise(deltaEuro: number): {
  modeled: true;
  deltaEuro: number;
  expectedIncrementalEuro: number;
  note: string;
} {
  // Deterministic demo fixture — not hallucinated elasticity.
  const perUnitRecover = Math.min(deltaEuro, COKE_MARGIN_SHOCK.deltaEuro + 0.05);
  const expected = Math.round(perUnitRecover * 1680 * 0.72);
  return {
    modeled: true,
    deltaEuro,
    expectedIncrementalEuro: expected,
    note:
      "MODELED SCENARIO · DEMO — attach risk held constant; elasticity evidence insufficient for guest response claim",
  };
}
