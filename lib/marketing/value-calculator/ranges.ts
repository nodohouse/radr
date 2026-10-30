/**
 * V2 guided calculator — dropdown / range options.
 * Calculations use low / base (mid) / high. Never invent exact typed values by default.
 */

import type { CategoryId, VerticalId } from "./assumptions";
import type { CurrencyCode, OtherKind } from "./types";

export type NumericRange = { low: number; base: number; high: number };

export type RangeOption<T extends string = string> = {
  id: T;
  label: string;
  /** Resolved numeric range when applicable; null = unknown / assumed later */
  range: NumericRange | null;
};

export const LOCATION_OPTIONS: RangeOption[] = [
  { id: "1", label: "1", range: { low: 1, base: 1, high: 1 } },
  { id: "2_3", label: "2–3", range: { low: 2, base: 2.5, high: 3 } },
  { id: "4_5", label: "4–5", range: { low: 4, base: 4.5, high: 5 } },
  { id: "6_10", label: "6–10", range: { low: 6, base: 8, high: 10 } },
  { id: "11_20", label: "11–20", range: { low: 11, base: 15.5, high: 20 } },
  { id: "21_50", label: "21–50", range: { low: 21, base: 35.5, high: 50 } },
  { id: "51_100", label: "51–100", range: { low: 51, base: 75.5, high: 100 } },
  { id: "100_plus", label: "100+", range: { low: 100, base: 150, high: 200 } },
];

/** Revenue bands in USD; scaled for other currencies via FX factors (reporting only). */
export const REVENUE_OPTIONS_USD: RangeOption[] = [
  { id: "u2", label: "Under $2M", range: { low: 500_000, base: 1_250_000, high: 2_000_000 } },
  { id: "2_5", label: "$2–5M", range: { low: 2_000_000, base: 3_500_000, high: 5_000_000 } },
  { id: "5_10", label: "$5–10M", range: { low: 5_000_000, base: 7_500_000, high: 10_000_000 } },
  { id: "10_25", label: "$10–25M", range: { low: 10_000_000, base: 17_500_000, high: 25_000_000 } },
  { id: "25_50", label: "$25–50M", range: { low: 25_000_000, base: 37_500_000, high: 50_000_000 } },
  { id: "50_100", label: "$50–100M", range: { low: 50_000_000, base: 75_000_000, high: 100_000_000 } },
  { id: "100_250", label: "$100–250M", range: { low: 100_000_000, base: 175_000_000, high: 250_000_000 } },
  { id: "250_500", label: "$250–500M", range: { low: 250_000_000, base: 375_000_000, high: 500_000_000 } },
  { id: "500_plus", label: "$500M+", range: { low: 500_000_000, base: 750_000_000, high: 1_000_000_000 } },
  { id: "unknown", label: "I’m not sure", range: null },
];

/** Approximate FX vs USD for displaying range labels only; user figures stay in selected currency. */
export const FX_VS_USD: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  SGD: 1.35,
  JPY: 150,
  HKD: 7.8,
  AUD: 1.55,
  MXN: 17,
  BRL: 5.1,
  ZAR: 18.5,
  OTHER: 1,
};

export const PCT_OPTIONS: RangeOption[] = [
  { id: "u20", label: "Under 20%", range: { low: 0.1, base: 0.15, high: 0.2 } },
  { id: "20_24", label: "20–24%", range: { low: 0.2, base: 0.22, high: 0.24 } },
  { id: "25_29", label: "25–29%", range: { low: 0.25, base: 0.27, high: 0.29 } },
  { id: "30_34", label: "30–34%", range: { low: 0.3, base: 0.32, high: 0.34 } },
  { id: "35_39", label: "35–39%", range: { low: 0.35, base: 0.37, high: 0.39 } },
  { id: "40_plus", label: "40%+", range: { low: 0.4, base: 0.45, high: 0.55 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const DELIVERY_OPTIONS: RangeOption[] = [
  { id: "0_5", label: "0–5%", range: { low: 0, base: 0.025, high: 0.05 } },
  { id: "6_15", label: "6–15%", range: { low: 0.06, base: 0.105, high: 0.15 } },
  { id: "16_30", label: "16–30%", range: { low: 0.16, base: 0.23, high: 0.3 } },
  { id: "31_50", label: "31–50%", range: { low: 0.31, base: 0.405, high: 0.5 } },
  { id: "50_plus", label: "50%+", range: { low: 0.5, base: 0.6, high: 0.75 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const PURCHASING_OPTIONS: RangeOption[] = [
  { id: "u10", label: "Under 10% of revenue", range: { low: 0.05, base: 0.075, high: 0.1 } },
  { id: "10_20", label: "10–20%", range: { low: 0.1, base: 0.15, high: 0.2 } },
  { id: "20_30", label: "20–30%", range: { low: 0.2, base: 0.25, high: 0.3 } },
  { id: "30_40", label: "30–40%", range: { low: 0.3, base: 0.35, high: 0.4 } },
  { id: "40_plus", label: "40%+", range: { low: 0.4, base: 0.45, high: 0.55 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const OCCUPANCY_OPTIONS: RangeOption[] = [
  { id: "u50", label: "Under 50%", range: { low: 0.3, base: 0.4, high: 0.5 } },
  { id: "50_59", label: "50–59%", range: { low: 0.5, base: 0.545, high: 0.59 } },
  { id: "60_69", label: "60–69%", range: { low: 0.6, base: 0.645, high: 0.69 } },
  { id: "70_79", label: "70–79%", range: { low: 0.7, base: 0.745, high: 0.79 } },
  { id: "80_89", label: "80–89%", range: { low: 0.8, base: 0.845, high: 0.89 } },
  { id: "90_plus", label: "90%+", range: { low: 0.9, base: 0.93, high: 0.98 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const ADR_OPTIONS_USD: RangeOption[] = [
  { id: "u100", label: "Under $100", range: { low: 50, base: 75, high: 100 } },
  { id: "100_149", label: "$100–149", range: { low: 100, base: 124.5, high: 149 } },
  { id: "150_199", label: "$150–199", range: { low: 150, base: 174.5, high: 199 } },
  { id: "200_299", label: "$200–299", range: { low: 200, base: 249.5, high: 299 } },
  { id: "300_499", label: "$300–499", range: { low: 300, base: 399.5, high: 499 } },
  { id: "500_plus", label: "$500+", range: { low: 500, base: 650, high: 900 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const OTA_OPTIONS: RangeOption[] = [
  { id: "u10", label: "Under 10%", range: { low: 0.02, base: 0.06, high: 0.1 } },
  { id: "10_20", label: "10–20%", range: { low: 0.1, base: 0.15, high: 0.2 } },
  { id: "21_35", label: "21–35%", range: { low: 0.21, base: 0.28, high: 0.35 } },
  { id: "36_50", label: "36–50%", range: { low: 0.36, base: 0.43, high: 0.5 } },
  { id: "50_plus", label: "50%+", range: { low: 0.5, base: 0.6, high: 0.75 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const COVERS_OPTIONS: RangeOption[] = [
  { id: "u100", label: "Under 100", range: { low: 40, base: 70, high: 100 } },
  { id: "100_250", label: "100–250", range: { low: 100, base: 175, high: 250 } },
  { id: "250_500", label: "250–500", range: { low: 250, base: 375, high: 500 } },
  { id: "500_1000", label: "500–1,000", range: { low: 500, base: 750, high: 1000 } },
  { id: "1000_plus", label: "1,000+", range: { low: 1000, base: 1500, high: 2500 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const ROOMS_OPTIONS: RangeOption[] = [
  { id: "u50", label: "Under 50", range: { low: 20, base: 35, high: 50 } },
  { id: "50_100", label: "50–100", range: { low: 50, base: 75, high: 100 } },
  { id: "101_200", label: "101–200", range: { low: 101, base: 150, high: 200 } },
  { id: "201_400", label: "201–400", range: { low: 201, base: 300, high: 400 } },
  { id: "401_800", label: "401–800", range: { low: 401, base: 600, high: 800 } },
  { id: "800_plus", label: "800+", range: { low: 800, base: 1100, high: 1600 } },
  { id: "unknown", label: "I don’t know", range: null },
];

export const MIXED_BALANCE_OPTIONS = [
  { id: "mostly_rest", label: "Mostly restaurants", restaurantShare: 0.75 },
  { id: "balanced", label: "Balanced", restaurantShare: 0.5 },
  { id: "mostly_hotel", label: "Mostly hotels", restaurantShare: 0.25 },
] as const;

export const SYSTEMS_OPTIONS = [
  { id: "1", label: "Mostly one system", map: "1_2" as const },
  { id: "2_4", label: "2–4 systems", map: "3_5" as const },
  { id: "5_7", label: "5–7 systems", map: "6_plus" as const },
  { id: "8_plus", label: "8+ systems", map: "6_plus" as const },
] as const;

export const RECONCILE_OPTIONS = [
  { id: "realtime", label: "Real time" },
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
] as const;

export const MANUAL_OPTIONS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
] as const;

export const STD_OPTIONS = [
  { id: "high", label: "High" },
  { id: "medium", label: "Medium" },
  { id: "low", label: "Low" },
] as const;

export const INVESTMENT_OPTIONS: RangeOption[] = [
  { id: "u10", label: "Under $10K", range: { low: 5_000, base: 7_500, high: 10_000 } },
  { id: "10_25", label: "$10–25K", range: { low: 10_000, base: 17_500, high: 25_000 } },
  { id: "25_50", label: "$25–50K", range: { low: 25_000, base: 37_500, high: 50_000 } },
  { id: "50_100", label: "$50–100K", range: { low: 50_000, base: 75_000, high: 100_000 } },
  { id: "100_250", label: "$100–250K", range: { low: 100_000, base: 175_000, high: 250_000 } },
  { id: "250_plus", label: "$250K+", range: { low: 250_000, base: 350_000, high: 500_000 } },
];

export const CAPTURE_PRESETS = [0.1, 0.2, 0.3, 0.4] as const;

export const VERTICAL_OPTIONS: {
  id: VerticalId;
  label: string;
}[] = [
  { id: "restaurant", label: "Restaurant / restaurant group" },
  { id: "hotel", label: "Hotel / hotel group" },
  { id: "mixed", label: "Mixed hospitality group" },
  { id: "other", label: "Other hospitality operation" },
];

export const OTHER_KIND_OPTIONS: { id: OtherKind; label: string }[] = [
  { id: "resort", label: "Resort" },
  { id: "apartments", label: "Serviced apartments" },
  { id: "bar", label: "Bar / club" },
  { id: "multi_venue", label: "Multi-venue hospitality" },
  { id: "other", label: "Other" },
];

export const PAIN_BY_VERTICAL: Record<
  VerticalId,
  { id: CategoryId; label: string }[]
> = {
  restaurant: [
    { id: "labor", label: "Labor" },
    { id: "food_waste", label: "Food / waste" },
    { id: "procurement", label: "Procurement" },
    { id: "supplier_ap", label: "Supplier / AP" },
    { id: "reconciliation", label: "Reconciliation" },
    { id: "revenue_pricing", label: "Pricing / menu mix" },
    { id: "perishable", label: "Perishable capacity" },
    { id: "guest_experience", label: "Guest / revenue" },
  ],
  hotel: [
    { id: "labor", label: "Labor" },
    { id: "procurement", label: "Procurement" },
    { id: "supplier_ap", label: "Supplier / AP" },
    { id: "reconciliation", label: "Reconciliation" },
    { id: "channel_mix", label: "Channel / OTA mix" },
    { id: "readiness", label: "Room readiness" },
    { id: "perishable", label: "Perishable room revenue" },
    { id: "revenue_pricing", label: "Pricing / yield" },
    { id: "guest_experience", label: "Guest recovery" },
  ],
  mixed: [
    { id: "labor", label: "Labor" },
    { id: "procurement", label: "Procurement" },
    { id: "supplier_ap", label: "Supplier / AP" },
    { id: "reconciliation", label: "Reconciliation" },
    { id: "perishable", label: "Perishable capacity" },
    { id: "channel_mix", label: "Channel / OTA mix" },
    { id: "food_waste", label: "Food / waste" },
    { id: "revenue_pricing", label: "Pricing / yield" },
  ],
  other: [
    { id: "labor", label: "Labor" },
    { id: "procurement", label: "Procurement" },
    { id: "supplier_ap", label: "Supplier / AP" },
    { id: "reconciliation", label: "Reconciliation" },
    { id: "perishable", label: "Perishable capacity" },
    { id: "revenue_pricing", label: "Pricing / revenue" },
    { id: "guest_experience", label: "Guest experience" },
  ],
};

export function optionById<T extends RangeOption>(
  list: T[],
  id: string | null | undefined,
): T | undefined {
  if (!id) return undefined;
  return list.find((o) => o.id === id);
}

export function formatRevenueLabel(
  opt: RangeOption,
  currency: CurrencyCode,
): string {
  if (!opt.range) return opt.label;
  if (currency === "USD") return opt.label;
  const fx = FX_VS_USD[currency] || 1;
  const fmt = (n: number) => {
    const v = Math.round((n * fx) / 1_000_000);
    return `${v}M`;
  };
  if (opt.id === "u2") return `Under ${fmt(2_000_000)} ${currency}`;
  if (opt.id === "500_plus") return `${fmt(500_000_000)}+ ${currency}`;
  return `${fmt(opt.range.low)}–${fmt(opt.range.high)} ${currency}`;
}

export function formatMoneyIntl(
  amount: number,
  currency: CurrencyCode,
): string {
  const code = currency === "OTHER" ? "USD" : currency;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  } catch {
    return `${Math.round(amount).toLocaleString("en")}`;
  }
}

export function formatRangeIntl(
  low: number,
  high: number,
  currency: CurrencyCode,
): string {
  return `${formatMoneyIntl(low, currency)} – ${formatMoneyIntl(high, currency)}`;
}
