/**
 * F&B category economics - food vs beverage as first-class operating lens.
 *
 * Seating channel "bar" ≠ beverage category. Main dining sells wine too.
 * Contribution here is operating contribution, not profit.
 */

export type FnBCategory = "food" | "beverage";

export type FnBCategorySplit = {
  /** Net sales attributed to food. */
  foodRevenue: number;
  /** Net sales attributed to beverage / drinks. */
  beverageRevenue: number;
  foodSharePct: number;
  beverageSharePct: number;
  /** Contribution after category COGS estimate (not profit). */
  foodContribution: number;
  beverageContribution: number;
  foodContributionMarginPct: number;
  beverageContributionMarginPct: number;
  foodCogs: number;
  beverageCogs: number;
};

/** Berlin Mitte dinner - drinks typically ~35% of F&B net. */
export const BERLIN_BEVERAGE_SHARE_PCT = 34.8;

/** Typical contribution margins after category COGS (demo). */
export const BERLIN_FOOD_CONTRIB_MARGIN_PCT = 52;
export const BERLIN_BEVERAGE_CONTRIB_MARGIN_PCT = 72;

export function splitFnBNetSales(
  netSales: number,
  beverageSharePct: number = BERLIN_BEVERAGE_SHARE_PCT,
  options?: {
    foodMarginPct?: number;
    beverageMarginPct?: number;
  },
): FnBCategorySplit {
  const bevShare = Math.min(100, Math.max(0, beverageSharePct));
  const foodShare = Math.round((100 - bevShare) * 10) / 10;
  const beverageRevenue =
    Math.round(netSales * (bevShare / 100) * 100) / 100;
  const foodRevenue = Math.round((netSales - beverageRevenue) * 100) / 100;

  const foodMargin =
    options?.foodMarginPct ?? BERLIN_FOOD_CONTRIB_MARGIN_PCT;
  const bevMargin =
    options?.beverageMarginPct ?? BERLIN_BEVERAGE_CONTRIB_MARGIN_PCT;

  const foodContribution =
    Math.round(foodRevenue * (foodMargin / 100) * 100) / 100;
  const beverageContribution =
    Math.round(beverageRevenue * (bevMargin / 100) * 100) / 100;

  return {
    foodRevenue,
    beverageRevenue,
    foodSharePct: foodShare,
    beverageSharePct: Math.round(bevShare * 10) / 10,
    foodContribution,
    beverageContribution,
    foodContributionMarginPct: foodMargin,
    beverageContributionMarginPct: bevMargin,
    foodCogs: Math.round((foodRevenue - foodContribution) * 100) / 100,
    beverageCogs:
      Math.round((beverageRevenue - beverageContribution) * 100) / 100,
  };
}

export type FnBMixItem = {
  id: string;
  name: string;
  category: FnBCategory;
  /** Units sold (portions / glasses / bottles). */
  units: number;
  unitLabel: "portions" | "glasses" | "bottles" | "covers";
  /** Share within its category revenue (0-100). */
  categoryMixPct: number;
  /** Share of total F&B net sales (0-100). */
  totalMixPct: number;
  contributionEur: number;
  vsTypicalPct: number;
  tag?: "bestseller" | "signature" | "surprise" | "soft";
};

/**
 * Attach total-mix % using known category share of F&B.
 * item.totalMixPct ≈ categoryShareOfTotalPct × (categoryMixPct / 100)
 */
export function withTotalMixPct(
  items: Omit<FnBMixItem, "totalMixPct">[],
  categoryShareOfTotalPct: number,
): FnBMixItem[] {
  return items.map((item) => ({
    ...item,
    totalMixPct:
      Math.round(
        categoryShareOfTotalPct * (item.categoryMixPct / 100) * 10,
      ) / 10,
  }));
}

/** Berlin post-shift drink mix - aligns with Active Revenue wine/aperitif SKUs. */
export function berlinDrinkMixFixture(
  beverageShareOfTotalPct: number = BERLIN_BEVERAGE_SHARE_PCT,
): FnBMixItem[] {
  return withTotalMixPct(
    [
      {
        id: "bev_burgundy_btg",
        name: "Burgundy · by the glass",
        category: "beverage",
        units: 44,
        unitLabel: "glasses",
        categoryMixPct: 18.4,
        contributionEur: 612,
        vsTypicalPct: 16,
        tag: "bestseller",
      },
      {
        id: "bev_sparkling",
        name: "House sparkling",
        category: "beverage",
        units: 38,
        unitLabel: "glasses",
        categoryMixPct: 14.2,
        contributionEur: 486,
        vsTypicalPct: 11,
        tag: "signature",
      },
      {
        id: "bev_negroni",
        name: "Negroni",
        category: "beverage",
        units: 29,
        unitLabel: "glasses",
        categoryMixPct: 11.1,
        contributionEur: 378,
        vsTypicalPct: 24,
        tag: "surprise",
      },
      {
        id: "bev_aperitif",
        name: "Aperitif · spritz",
        category: "beverage",
        units: 22,
        unitLabel: "glasses",
        categoryMixPct: 7.8,
        contributionEur: 242,
        vsTypicalPct: 6,
      },
      {
        id: "bev_soft",
        name: "Soft / zero",
        category: "beverage",
        units: 51,
        unitLabel: "glasses",
        categoryMixPct: 5.4,
        contributionEur: 98,
        vsTypicalPct: -8,
        tag: "soft",
      },
    ],
    beverageShareOfTotalPct,
  );
}

export function berlinFoodMixFixture(
  foodShareOfTotalPct: number,
): FnBMixItem[] {
  return withTotalMixPct(
    [
      {
        id: "dish_schnitzel",
        name: "Wiener Schnitzel",
        category: "food",
        units: 38,
        unitLabel: "portions",
        categoryMixPct: 14.2,
        contributionEur: 912,
        vsTypicalPct: 18,
        tag: "bestseller",
      },
      {
        id: "dish_trout",
        name: "Charred trout · dill",
        category: "food",
        units: 27,
        unitLabel: "portions",
        categoryMixPct: 11.8,
        contributionEur: 784,
        vsTypicalPct: 22,
        tag: "surprise",
      },
      {
        id: "dish_risotto",
        name: "Saffron risotto",
        category: "food",
        units: 21,
        unitLabel: "portions",
        categoryMixPct: 8.4,
        contributionEur: 546,
        vsTypicalPct: 4,
        tag: "signature",
      },
      {
        id: "dish_burger",
        name: "House burger",
        category: "food",
        units: 9,
        unitLabel: "portions",
        categoryMixPct: 3.1,
        contributionEur: 126,
        vsTypicalPct: -28,
        tag: "soft",
      },
    ],
    foodShareOfTotalPct,
  );
}
