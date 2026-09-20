/**
 * Year-on-the-menu “wrapped” - demo operating intelligence.
 * Claims are labeled when estimated / partial. No invented sentiment without a source.
 */

import type { RoleView } from "@/lib/product/types";
import type { FiscalYearId, LookbackTone } from "./demoLookback";
import { FISCAL_YEARS } from "./demoLookback";

export type MenuMomentKind =
  | "dish_of_year"
  | "contribution_champion"
  | "guest_favorite"
  | "hidden_gem"
  | "margin_killer"
  | "cost_pressure"
  | "biggest_cost_increase"
  | "stockout"
  | "waste"
  | "pairing"
  | "upsell"
  | "delivery_hero"
  | "delivery_trap"
  | "regulars_favorite"
  | "buy_more"
  | "buy_less";

export type MenuMetric = {
  label: string;
  value: string;
  tone?: LookbackTone;
  hint?: string;
};

export type MenuMoment = {
  id: string;
  kind: MenuMomentKind;
  /** Large editorial kicker */
  kicker: string;
  /** Dish / ingredient name */
  title: string;
  /** WHAT · one memorable result */
  lead?: string;
  metrics: MenuMetric[];
  /** WHY · short evidence */
  why: string[];
  /** SO WHAT · business implication */
  soWhat?: string;
  /** NOW WHAT · RADR recommendation */
  radrSays?: string;
  /** Optional impact line e.g. Potential annual improvement */
  impactLabel?: string;
  impactValue?: string;
  impactTone?: LookbackTone;
  /** Integrity: Estimated · Cost data partial · From stockout history */
  evidenceNote?: string;
  dishId?: string;
  /** Optional plate photography (demo / approved assets) */
  image?: string;
  /** Visual plate tone when no photo */
  plate?: "tuna" | "pasta" | "aubergine" | "salmon" | "wine" | "chicken" | "ingredient";
};

export type DishIntel = {
  id: string;
  name: string;
  category: string;
  image?: string;
  units: number;
  revenue: number;
  contribution: number;
  marginPct: number;
  vsPriorPct: number;
  foodCostPct: number;
  wastePct: number;
  wasteEstimated: boolean;
  stockouts: number;
  returningAffinityPct: number;
  channelMix: { dineIn: number; delivery: number };
  trend: "growing" | "stable" | "declining" | "seasonal" | "new";
  matrix: "star" | "workhorse" | "hidden_gem" | "review";
  recommendation: "keep" | "grow" | "fix" | "remove";
  recommendationWhy: string;
  strategicNote?: string;
  ingredients: { name: string; costTrendPct: number; sharePct: number }[];
  pairings: { name: string; times: number; attachmentPct: number }[];
  scenarios?: {
    id: string;
    label: string;
    contribution: number;
    note: string;
  }[];
  substitution?: {
    source: string;
    retainedPct: number;
    flows: { name: string; pct: number }[];
  };
};

export type MenuDecisionLane = {
  id: "keep" | "grow" | "fix" | "remove";
  label: string;
  items: { dishId: string; name: string; note: string }[];
};

export type MenuPlanAction = {
  id: string;
  rank: number;
  title: string;
  why: string[];
  action: string;
  options?: string[];
  dishId?: string;
  /** Likely business impact - range OK, no fake precision */
  impactLabel?: string;
  impactValue?: string;
  confidence?: string;
  drivers?: string[];
};

export type PurchasingChange = {
  id: string;
  item: string;
  change: string;
  detail: string;
  tone: LookbackTone;
};

export type MenuWrappedBrief = {
  fiscalYearId: FiscalYearId;
  yearLabel: string;
  nextYearLabel: string;
  scopeLine: string;
  health: {
    strong: number;
    review: number;
    replace: number;
    line: string;
  };
  moments: MenuMoment[];
  decisions: MenuDecisionLane[];
  plan: MenuPlanAction[];
  purchasing: PurchasingChange[];
  dishes: DishIntel[];
};

function eur(n: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function num(n: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);
}

function pct(n: number, digits = 1) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(digits).replace(".", ",")}%`;
}

function plainPct(n: number, digits = 1) {
  return `${n.toFixed(digits).replace(".", ",")}%`;
}

const DISHES: DishIntel[] = [
  {
    id: "dish_tataki",
    name: "Tuna Tataki",
    category: "Starter",
    image: "/menu/menu-tuna-tataki.jpg",
    units: 8420,
    revenue: 151_560,
    contribution: 94_280,
    marginPct: 62.2,
    vsPriorPct: 18,
    foodCostPct: 24.8,
    wastePct: 1.8,
    wasteEstimated: true,
    stockouts: 17,
    returningAffinityPct: 31,
    channelMix: { dineIn: 78, delivery: 22 },
    trend: "growing",
    matrix: "star",
    recommendation: "keep",
    recommendationWhy:
      "High demand, strong contribution, returning-guest affinity, and manageable waste.",
    ingredients: [
      { name: "Bluefin tuna", costTrendPct: 22.9, sharePct: 58 },
      { name: "Sesame / garnish", costTrendPct: 4, sharePct: 12 },
    ],
    pairings: [{ name: "Riesling", times: 1842, attachmentPct: 41 }],
  },
  {
    id: "dish_truffle",
    name: "Truffle Pasta",
    category: "Main",
    image: "/menu/menu-truffle-pasta.jpg",
    units: 5180,
    revenue: 142_000,
    contribution: 108_400,
    marginPct: 76.3,
    vsPriorPct: 9,
    foodCostPct: 19.4,
    wastePct: 1.2,
    wasteEstimated: true,
    stockouts: 3,
    returningAffinityPct: 22,
    channelMix: { dineIn: 88, delivery: 12 },
    trend: "stable",
    matrix: "star",
    recommendation: "keep",
    recommendationWhy:
      "Highest contribution on the menu with low waste and controlled food cost.",
    ingredients: [
      { name: "Fresh pasta", costTrendPct: 6, sharePct: 28 },
      { name: "Truffle oil / shave", costTrendPct: 11, sharePct: 34 },
    ],
    pairings: [{ name: "Barolo glass", times: 920, attachmentPct: 28 }],
  },
  {
    id: "dish_miso",
    name: "Miso Aubergine",
    category: "Vegetarian",
    image: "/menu/menu-miso-aubergine.jpg",
    units: 1240,
    revenue: 28_520,
    contribution: 20_530,
    marginPct: 72,
    vsPriorPct: 22,
    foodCostPct: 18.1,
    wastePct: 0.9,
    wasteEstimated: true,
    stockouts: 9,
    returningAffinityPct: 27,
    channelMix: { dineIn: 70, delivery: 30 },
    trend: "growing",
    matrix: "hidden_gem",
    recommendation: "grow",
    recommendationWhy:
      "Excellent margin and repeat with low volume - underexposed on the menu.",
    ingredients: [
      { name: "Aubergine", costTrendPct: 3, sharePct: 40 },
      { name: "Miso / glaze", costTrendPct: 5, sharePct: 22 },
    ],
    pairings: [{ name: "Junmai sake", times: 310, attachmentPct: 19 }],
  },
  {
    id: "dish_salmon",
    name: "Salmon Teriyaki",
    category: "Main",
    image: "/menu/menu-salmon-teriyaki.jpg",
    units: 4820,
    revenue: 89_600,
    contribution: 18_240,
    marginPct: 20.4,
    vsPriorPct: -11,
    foodCostPct: 41.2,
    wastePct: 8.4,
    wasteEstimated: true,
    stockouts: 2,
    returningAffinityPct: 14,
    channelMix: { dineIn: 55, delivery: 45 },
    trend: "declining",
    matrix: "workhorse",
    recommendation: "fix",
    recommendationWhy:
      "Still popular, but ingredient inflation and waste crushed contribution. Demand −11% while cost +27%.",
    strategicNote:
      "Not remove-only: some guests still expect a salmon main. Rework before exit.",
    ingredients: [
      { name: "Salmon", costTrendPct: 27, sharePct: 62 },
      { name: "Teriyaki glaze", costTrendPct: 8, sharePct: 10 },
    ],
    pairings: [{ name: "House white", times: 640, attachmentPct: 18 }],
    scenarios: [
      {
        id: "sc_price",
        label: "Price → €26,00",
        contribution: 6.9,
        note: "Per cover contribution if price moves from €24,00.",
      },
      {
        id: "sc_garnish",
        label: "Simplify garnish",
        contribution: 7.4,
        note: "Recipe cost cut without changing the protein.",
      },
      {
        id: "sc_alt",
        label: "Alternative fish",
        contribution: 9.1,
        note: "Swap to a lower-cost fish with similar plate language.",
      },
      {
        id: "sc_remove",
        label: "Remove item",
        contribution: 0,
        note: "Historical stockouts suggest ~73% contribution retained via substitution.",
      },
    ],
    substitution: {
      source: "From 17 prior stockout evenings",
      retainedPct: 73,
      flows: [
        { name: "Chicken Yakitori", pct: 46 },
        { name: "Tuna Tataki", pct: 27 },
        { name: "Vegetarian item", pct: 12 },
        { name: "No substitute", pct: 15 },
      ],
    },
  },
  {
    id: "dish_chicken",
    name: "Chicken Don",
    category: "Delivery / Main",
    units: 3960,
    revenue: 71_280,
    contribution: 29_940,
    marginPct: 42,
    vsPriorPct: 14,
    foodCostPct: 28,
    wastePct: 2.1,
    wasteEstimated: true,
    stockouts: 4,
    returningAffinityPct: 19,
    channelMix: { dineIn: 32, delivery: 68 },
    trend: "growing",
    matrix: "star",
    recommendation: "keep",
    recommendationWhy:
      "Delivery hero: fast prep, low refund rate, solid contribution after channel costs.",
    ingredients: [
      { name: "Chicken thigh", costTrendPct: 7, sharePct: 48 },
      { name: "Rice / sauce", costTrendPct: 4, sharePct: 20 },
    ],
    pairings: [],
  },
  {
    id: "dish_exit",
    name: "Sea Bass Ceviche",
    category: "Starter",
    units: 680,
    revenue: 14_960,
    contribution: 3_120,
    marginPct: 20.9,
    vsPriorPct: -18,
    foodCostPct: 38,
    wastePct: 6.2,
    wasteEstimated: true,
    stockouts: 1,
    returningAffinityPct: 6,
    channelMix: { dineIn: 90, delivery: 10 },
    trend: "declining",
    matrix: "review",
    recommendation: "remove",
    recommendationWhy:
      "Low demand, weak contribution, and no signature role - weak menu balance case.",
    strategicNote:
      "Not a brand signature. Ingredient overlap with Tataki makes exit cleaner.",
    ingredients: [{ name: "Sea bass", costTrendPct: 16, sharePct: 55 }],
    pairings: [],
    substitution: {
      source: "From limited 86 events",
      retainedPct: 81,
      flows: [
        { name: "Tuna Tataki", pct: 52 },
        { name: "Miso Aubergine", pct: 21 },
        { name: "No substitute", pct: 27 },
      ],
    },
  },
];

function dishById(id: string) {
  return DISHES.find((d) => d.id === id)!;
}

const PLATE_IMAGES: Partial<
  Record<NonNullable<MenuMoment["plate"]>, string>
> = {
  tuna: "/menu/menu-tuna-tataki.jpg",
  pasta: "/menu/menu-truffle-pasta.jpg",
  aubergine: "/menu/menu-miso-aubergine.jpg",
  salmon: "/menu/menu-salmon-teriyaki.jpg",
  chicken: "/menu/menu-chicken.jpg",
  wine: "/menu/menu-wine.jpg",
};

function buildMoments(bucket: ReturnType<typeof menuRoleBucket>): MenuMoment[] {
  const tataki = dishById("dish_tataki");
  const truffle = dishById("dish_truffle");
  const miso = dishById("dish_miso");
  const salmon = dishById("dish_salmon");
  const chicken = dishById("dish_chicken");

  const all: Record<string, MenuMoment> = {
    dish_of_year: {
      id: "m_doty",
      kind: "dish_of_year",
      kicker: "Dish of the year",
      title: tataki.name,
      lead: "Best seller is not enough - this one also made money.",
      plate: "tuna",
      dishId: tataki.id,
      metrics: [
        { label: "Sold", value: num(tataki.units) },
        { label: "Revenue", value: eur(tataki.revenue) },
        { label: "Contribution", value: eur(tataki.contribution) },
        { label: "Margin", value: plainPct(tataki.marginPct) },
        { label: "Vs last year", value: pct(tataki.vsPriorPct), tone: "good" },
      ],
      why: [
        "High demand with strong contribution - not volume alone",
        "31% of returning dinner guests ordered it at least once",
        "Low waste relative to protein risk",
      ],
      soWhat: "Signature demand that also pays - protect it like a revenue asset.",
      radrSays: "Keep featured. Protect Thu-Sat supply - stockouts left money on the table.",
      impactLabel: "Contribution exposed by stockouts",
      impactValue: "€11.820,00",
      impactTone: "watch",
      evidenceNote: "Waste estimated from prep variance · affinity from returning-guest POS",
    },
    contribution_champion: {
      id: "m_champ",
      kind: "contribution_champion",
      kicker: "Contribution champion",
      title: truffle.name,
      lead: "Not the most ordered - the most valuable.",
      plate: "pasta",
      dishId: truffle.id,
      metrics: [
        { label: "Contribution", value: eur(truffle.contribution) },
        { label: "€1 ingredient →", value: "€4,80 contribution" },
        { label: "Food cost", value: plainPct(truffle.foodCostPct) },
        { label: "Waste", value: plainPct(truffle.wastePct), hint: "Estimated" },
      ],
      why: [
        "Highest euro contribution on the board",
        "Food cost held at 19,4%",
        "Waste stayed quiet at ~1,2%",
      ],
      soWhat: "Highest euro contribution on the board - volume is not the scoreboard.",
      radrSays: "Protect recipe discipline. Do not discount this plate.",
      evidenceNote: "Waste estimated",
    },
    guest_favorite: {
      id: "m_guest",
      kind: "guest_favorite",
      kicker: "Guest favorite",
      title: tataki.name,
      plate: "tuna",
      dishId: tataki.id,
      metrics: [
        {
          label: "Returning dinner guests",
          value: plainPct(31, 0),
          hint: "ordered at least once",
        },
        { label: "Repeat-order rate", value: plainPct(38, 0) },
        { label: "Substitution when 86’d", value: "Low" },
      ],
      why: [
        "From returning-guest POS affinity - not a star rating scrape",
        "Low substitution when available",
      ],
      evidenceNote: "Behavioral signals from returning-guest tickets",
    },
    hidden_gem: {
      id: "m_gem",
      kind: "hidden_gem",
      kicker: "Hidden gem",
      title: miso.name,
      lead: "Lower volume. Excellent economics.",
      plate: "aubergine",
      dishId: miso.id,
      metrics: [
        { label: "Orders", value: num(miso.units) },
        { label: "Contribution margin", value: plainPct(miso.marginPct), tone: "good" },
        { label: "Waste", value: plainPct(miso.wastePct), hint: "Estimated" },
        { label: "Demand", value: pct(miso.vsPriorPct), tone: "good" },
      ],
      why: [
        "72% contribution margin with very low waste",
        "Strong repeat for its volume band",
        "Nine stockouts - demand is already ahead of visibility",
      ],
      soWhat: "Demand is already ahead of visibility - growth without new SKUs.",
      radrSays: "Make it more visible on the menu and in FOH recommendations.",
      impactLabel: "Lost contribution from stockouts (est.)",
      impactValue: "€4.420,00",
      impactTone: "watch",
      evidenceNote: "Waste estimated",
    },
    margin_killer: {
      id: "m_kill",
      kind: "margin_killer",
      kicker: "Margin killer",
      title: salmon.name,
      lead: "€89.600 revenue. Only €18.240 contribution.",
      plate: "salmon",
      dishId: salmon.id,
      metrics: [
        { label: "Sold", value: num(salmon.units) },
        { label: "Revenue", value: eur(salmon.revenue) },
        { label: "Contribution", value: eur(salmon.contribution), tone: "bad" },
        { label: "Margin", value: plainPct(salmon.marginPct), tone: "bad" },
        { label: "Ingredient cost", value: "+27% YoY", tone: "bad" },
        { label: "Waste", value: plainPct(salmon.wastePct), hint: "Estimated", tone: "bad" },
      ],
      why: [
        "Demand −11% while salmon purchase cost +27%",
        "Contribution compressed by ~€14.800 from cost alone",
        "Still a guest expectation for some - rework before remove",
      ],
      soWhat: "Looked popular. Barely paid for the year.",
      radrSays: "Reprice, reformulate, or replace before the next print.",
      impactLabel: "Potential annual improvement",
      impactValue: "+€12.000-€16.000",
      impactTone: "good",
      evidenceNote: "Waste estimated · cost from supplier invoices",
    },
    cost_pressure: {
      id: "m_cost",
      kind: "cost_pressure",
      kicker: "Ingredients that changed your year",
      title: "Salmon",
      plate: "ingredient",
      dishId: salmon.id,
      metrics: [
        { label: "Avg purchase cost", value: "+27%", tone: "bad" },
        { label: "Annual spend", value: eur(82_400) },
        { label: "Used across", value: "4 menu items" },
        { label: "Contribution compression", value: "−€14.800,00", tone: "bad" },
      ],
      why: [
        "Largest hit: Salmon Teriyaki",
        "Same protein pressure touches lunch specials and staff meal variance",
      ],
      radrSays: "Renegotiate, substitute, reprice, or redesign the recipe - pick one before Q1.",
      evidenceNote: "From supplier cost history",
    },
    biggest_cost: {
      id: "m_bluefin",
      kind: "biggest_cost_increase",
      kicker: "Biggest cost increase",
      title: "Bluefin tuna",
      plate: "ingredient",
      dishId: tataki.id,
      metrics: [
        { label: "2025", value: "€28,40/kg" },
        { label: "2026", value: "€34,90/kg" },
        { label: "Change", value: "+22,9%", tone: "bad" },
        { label: "Contribution impact", value: "−€9.840,00", tone: "bad" },
      ],
      why: ["Tataki still carried the year - price held the margin story"],
      radrSays: "Hold supplier dual-source · review plate price only if bluefin climbs again.",
      evidenceNote: "From purchase orders",
    },
    stockout: {
      id: "m_stock",
      kind: "stockout",
      kicker: "Couldn't keep in stock",
      title: tataki.name,
      plate: "tuna",
      dishId: tataki.id,
      metrics: [
        { label: "Stockout events", value: "17" },
        { label: "Contribution exposed", value: eur(11_820), tone: "watch" },
        { label: "Most common", value: "Thu-Sat dinner" },
      ],
      why: ["Demand already proved · supply lagged peak nights"],
      radrSays: "Increase Thu-Sat par by ~14% or add supplier redundancy.",
      evidenceNote: "From availability + POS void/86 logs",
    },
    waste: {
      id: "m_waste",
      kind: "waste",
      kicker: "Most wasted",
      title: "Salmon",
      plate: "salmon",
      dishId: salmon.id,
      metrics: [
        { label: "Estimated waste value", value: eur(5_640), tone: "bad" },
        { label: "Of purchased volume", value: plainPct(8.4), tone: "bad" },
        { label: "Primary driver", value: "Sun-Mon over-ordering" },
      ],
      why: ["Early-week pars did not match cover reality"],
      radrSays: "Reduce early-week salmon par before touching peak-night supply.",
      evidenceNote: "Estimated from prep variance + spoilage logs",
    },
    pairing: {
      id: "m_pair",
      kind: "pairing",
      kicker: "Pairing of the year",
      title: "Tuna Tataki + Riesling",
      plate: "wine",
      dishId: tataki.id,
      metrics: [
        { label: "Ordered together", value: num(1842) },
        { label: "Attachment rate", value: plainPct(41, 0) },
        { label: "Incremental contribution", value: eur(22_180), tone: "good" },
      ],
      why: ["Basket relationship from POS - not a curated list guess"],
      soWhat: "Attachment already behaves like a house standard - reinforce it.",
      radrSays: "Keep as FOH default suggestion · lift Riesling par +12%.",
      impactLabel: "Incremental contribution",
      impactValue: "€22.180,00",
      impactTone: "good",
      evidenceNote: "From POS basket pairs",
    },
    upsell: {
      id: "m_upsell",
      kind: "upsell",
      kicker: "Best upsell",
      title: "Wine pairing",
      plate: "wine",
      metrics: [
        { label: "Offered", value: num(2420) },
        { label: "Accepted", value: num(1080) },
        { label: "Verified incremental", value: eur(31_200), tone: "good" },
      ],
      why: ["Attributed only where offer → accept was logged"],
      evidenceNote: "Verified where offer acceptance was recorded",
    },
    delivery_hero: {
      id: "m_delhero",
      kind: "delivery_hero",
      kicker: "Delivery hero",
      title: chicken.name,
      plate: "chicken",
      dishId: chicken.id,
      metrics: [
        { label: "Of delivery orders", value: plainPct(18, 0) },
        { label: "Contribution margin", value: plainPct(chicken.marginPct) },
        { label: "Refund rate", value: "Low" },
      ],
      why: ["Fast prep · low packaging cost · holds after commission"],
      soWhat: "Holds after commission - rare for delivery proteins.",
      radrSays: "Keep featured on delivery · do not bury under promo discounting.",
    },
    delivery_trap: {
      id: "m_deltrap",
      kind: "delivery_trap",
      kicker: "Delivery trap",
      title: salmon.name,
      plate: "salmon",
      dishId: salmon.id,
      metrics: [
        { label: "Delivery revenue", value: eur(40_320) },
        { label: "After channel + COGS", value: eur(4_800), tone: "bad" },
        { label: "Effective margin", value: plainPct(11.9), tone: "bad" },
      ],
      why: ["Commission, promotions, packaging, and protein cost stacked"],
      radrSays: "Reprice on delivery or remove from the channel - keep dine-in while reworking.",
      evidenceNote: "Channel costs from connector fees + packaging estimates",
    },
    regulars: {
      id: "m_reg",
      kind: "regulars_favorite",
      kicker: "Regulars' favorite",
      title: tataki.name,
      plate: "tuna",
      dishId: tataki.id,
      metrics: [
        { label: "Returning-guest orders", value: num(2840) },
        { label: "Repeat-order rate", value: plainPct(38, 0) },
      ],
      why: ["Removal risk is high while affinity stays this strong"],
      evidenceNote: "Returning-guest POS",
    },
    buy_more: {
      id: "m_buymore",
      kind: "buy_more",
      kicker: "Buy more",
      title: "Miso aubergine ingredients",
      plate: "aubergine",
      dishId: miso.id,
      metrics: [
        { label: "Demand", value: "+22%", tone: "good" },
        { label: "Stockouts", value: "9", tone: "watch" },
        { label: "Lost contribution est.", value: eur(4_420), tone: "watch" },
        { label: "Recommended 2027 par", value: "+12%" },
      ],
      why: ["Demand already outran purchasing"],
      radrSays: "Recommendation only - not an automatic order.",
      evidenceNote: "Lost contribution estimated from stockout windows",
    },
    buy_less: {
      id: "m_buyless",
      kind: "buy_less",
      kicker: "Buy less",
      title: "Salmon",
      plate: "salmon",
      dishId: salmon.id,
      metrics: [
        { label: "Demand", value: "−11%", tone: "bad" },
        { label: "Waste", value: plainPct(8.4), hint: "Estimated" },
        { label: "Annual purchasing", value: eur(42_180) },
        { label: "Recommended par", value: "−16%" },
        { label: "Avoided waste est.", value: "€4.900,00 / year" },
      ],
      why: ["Over-bought relative to declining demand"],
      radrSays: "Cut early-week par first. Peak-night supply is a separate decision.",
      evidenceNote: "Waste and avoided waste estimated",
    },
  };

  // Curated sets: max 2 major stories per dishId unless strategically paired.
  const byBucket: Record<string, string[]> = {
    portfolio: [
      "dish_of_year",
      "contribution_champion",
      "hidden_gem",
      "margin_killer",
      "delivery_hero",
      "pairing",
    ],
    gm: [
      "dish_of_year",
      "contribution_champion",
      "hidden_gem",
      "margin_killer",
      "delivery_hero",
      "pairing",
      "upsell",
    ],
    kitchen: [
      "contribution_champion",
      "margin_killer",
      "hidden_gem",
      "waste",
      "buy_more",
      "biggest_cost",
    ],
    finance: [
      "contribution_champion",
      "margin_killer",
      "cost_pressure",
      "delivery_trap",
      "dish_of_year",
      "buy_less",
    ],
    ops: [
      "dish_of_year",
      "delivery_hero",
      "delivery_trap",
      "waste",
      "pairing",
      "upsell",
    ],
  };

  const ids = byBucket[bucket] ?? byBucket.portfolio!;
  const picked = ids.map((k) => all[k]!).filter(Boolean);
  return curateMoments(picked, 6).map((m) => ({
    ...m,
    image:
      m.image ??
      (m.dishId ? dishById(m.dishId).image : undefined) ??
      (m.plate ? PLATE_IMAGES[m.plate] : undefined),
  }));
}

/** Prefer diverse dishes - at most 2 moments sharing a dishId. */
function curateMoments(moments: MenuMoment[], limit: number): MenuMoment[] {
  const counts = new Map<string, number>();
  const out: MenuMoment[] = [];
  for (const m of moments) {
    const key = m.dishId ?? m.id;
    const n = counts.get(key) ?? 0;
    if (n >= 2) continue;
    counts.set(key, n + 1);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}

function menuRoleBucket(
  role: RoleView,
): "gm" | "finance" | "portfolio" | "kitchen" | "ops" {
  if (role === "gm") return "gm";
  if (role === "cfo" || role === "finance") return "finance";
  if (role === "owner" || role === "coo" || role === "regional") return "portfolio";
  if (role === "head_chef" || role === "kitchen") return "kitchen";
  return "ops";
}

export function composeMenuWrapped(input: {
  fiscalYearId?: FiscalYearId;
  roleView?: RoleView;
  scopeLabel?: string;
}): MenuWrappedBrief | null {
  const fy =
    FISCAL_YEARS.find((y) => y.id === (input.fiscalYearId ?? "fy2026")) ??
    FISCAL_YEARS[2]!;
  // Only meaningful on year lookback surfaces
  const role = input.roleView ?? "owner";
  const bucket = menuRoleBucket(role);
  const nextYear = fy.year + 1;

  const decisions: MenuDecisionLane[] = [
    {
      id: "keep",
      label: "Keep",
      items: [
        {
          dishId: "dish_tataki",
          name: "Tuna Tataki",
          note: "Star economics + regulars' affinity",
        },
        {
          dishId: "dish_truffle",
          name: "Truffle Pasta",
          note: "Contribution champion - protect price",
        },
        {
          dishId: "dish_chicken",
          name: "Chicken Don",
          note: "Delivery hero after channel costs",
        },
      ],
    },
    {
      id: "grow",
      label: "Grow",
      items: [
        {
          dishId: "dish_miso",
          name: "Miso Aubergine",
          note: "Hidden gem - raise visibility before adding SKUs",
        },
      ],
    },
    {
      id: "fix",
      label: "Fix",
      items: [
        {
          dishId: "dish_salmon",
          name: "Salmon Teriyaki",
          note: "Popular workhorse with crushed margin - rework, don’t confuse with success",
        },
      ],
    },
    {
      id: "remove",
      label: "Review for removal",
      items: [
        {
          dishId: "dish_exit",
          name: "Sea Bass Ceviche",
          note: "Low demand + weak contribution · not a signature · ~81% retained if exits",
        },
      ],
    },
  ];

  const plan: MenuPlanAction[] = [
    {
      id: "plan_salmon",
      rank: 1,
      title: "Rework Salmon Teriyaki",
      dishId: "dish_salmon",
      why: ["Cost +27%", "Demand −11%", "Margin 20,4%", "Waste ~8,4% (estimated)"],
      action: "Choose a path before next season print.",
      options: [
        "Reprice",
        "Change supplier",
        "Reduce portion cost",
        "Replace salmon",
        "Replace dish",
      ],
      impactLabel: "Potential annual improvement",
      impactValue: "+€12.000-€16.000",
      confidence: "Medium-high",
      drivers: ["cost inflation", "declining demand", "low substitution risk on dine-in"],
    },
    {
      id: "plan_miso",
      rank: 2,
      title: "Grow Miso Aubergine",
      dishId: "dish_miso",
      why: ["72% margin", "Strong repeat for volume", "9 stockouts - demand ahead of visibility"],
      action: "Feature higher on menu + FOH recommendation.",
      impactLabel: "Potential annual improvement",
      impactValue: "+€6.000-€9.000",
      confidence: "Medium",
      drivers: ["visibility gap", "proven margin", "stockout demand signal"],
    },
    {
      id: "plan_tataki_par",
      rank: 3,
      title: "Protect Tuna Tataki supply",
      dishId: "dish_tataki",
      why: ["17 stockouts", "€11.820 contribution exposed", "Thu-Sat dinner pattern"],
      action: "Raise Thu-Sat par ~14% or dual-source bluefin.",
      impactLabel: "Contribution to protect",
      impactValue: "~€8.000-€12.000",
      confidence: "High",
      drivers: ["proven demand", "peak-night pattern", "returning-guest affinity"],
    },
  ];

  const purchasing: PurchasingChange[] = [
    {
      id: "p_bluefin",
      item: "Bluefin",
      change: "+14% Thu-Sat par",
      detail: "Cover stockouts on proven demand nights",
      tone: "good",
    },
    {
      id: "p_salmon",
      item: "Salmon",
      change: "−16% weekly par",
      detail: "Cut early-week first · expected avoided waste ~€4.900/year",
      tone: "watch",
    },
    {
      id: "p_aubergine",
      item: "Aubergine",
      change: "+9%",
      detail: "Support Miso Aubergine growth",
      tone: "good",
    },
    {
      id: "p_riesling",
      item: "Riesling",
      change: "+12%",
      detail: "Pairing attachment already at 41%",
      tone: "good",
    },
    {
      id: "p_bass",
      item: "Sea bass",
      change: "Consider removing",
      detail: "If Sea Bass Ceviche exits - stop the overlapping buy",
      tone: "neutral",
    },
  ];

  return {
    fiscalYearId: fy.id,
    yearLabel: fy.label,
    nextYearLabel: String(nextYear),
    scopeLine: input.scopeLabel ?? "All locations",
    health: {
      strong: 14,
      review: 4,
      replace: 2,
      line: "From demand · contribution · cost trend · waste · operational complexity · strategic role",
    },
    moments: buildMoments(bucket),
    decisions,
    plan,
    purchasing,
    dishes: DISHES,
  };
}

export function getDishIntel(
  brief: MenuWrappedBrief,
  dishId: string,
): DishIntel | null {
  return brief.dishes.find((d) => d.id === dishId) ?? null;
}

/** Full demo dish catalog for economics engines. */
export function listDishIntel(): DishIntel[] {
  return DISHES;
}
