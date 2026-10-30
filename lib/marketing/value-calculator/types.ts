import type { CategoryId, VerticalId } from "./assumptions";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "AED"
  | "SGD"
  | "JPY"
  | "HKD"
  | "AUD"
  | "MXN"
  | "BRL"
  | "ZAR"
  | "OTHER";

export type OtherKind =
  | "resort"
  | "apartments"
  | "bar"
  | "multi_venue"
  | "other";

export type SystemFragmentation = "1_2" | "3_5" | "6_plus";
export type ReconcileCadence = "realtime" | "daily" | "weekly" | "monthly";
export type ManualRecon = "low" | "medium" | "high";
export type DecisionStandardization = "high" | "medium" | "low";

export type ValueCalculatorInput = {
  vertical: VerticalId;
  otherKind?: OtherKind;
  locations: number;
  /** Annual revenue in reporting currency. 0 if unknown. */
  annualRevenue: number;
  currency: CurrencyCode;
  /** Optional metrics — undefined = unknown / assumed */
  laborPct?: number;
  foodCogsPct?: number;
  purchasingPct?: number;
  deliveryMixPct?: number;
  occupancy?: number;
  otaMixPct?: number;
  roomRevenueShare?: number;
  restaurantShare?: number;
  hotelShare?: number;
  /** Empty or includes "unsure" → all applicable */
  painAreas: CategoryId[] | "unsure";
  systems: SystemFragmentation;
  reconcileCadence: ReconcileCadence;
  manualRecon: ManualRecon;
  decisionStandardization: DecisionStandardization;
  /** 0.05–0.5, default 0.2 */
  captureRate?: number;
  /** Optional annual RADR investment — enables ROI */
  annualInvestment?: number;
  /** Optional rate overrides (sensitivity) keyed by assumption id */
  rateOverrides?: Partial<
    Record<
      string,
      { low?: number; base?: number; high?: number }
    >
  >;
};

export type CategoryResult = {
  id: CategoryId;
  label: string;
  low: number;
  modeled: number;
  high: number;
  evidenceReadiness: number;
  priority: number;
  evidenceNeeded: string[];
  assumptionId: string;
  assumedBase: boolean;
};

export type ConfidenceLevel = "low" | "medium" | "high";

export type ValueCalculatorResult = {
  total: { low: number; modeled: number; high: number };
  headline: { low: number; modeled: number };
  categories: CategoryResult[];
  confidence: ConfidenceLevel;
  confidenceReasons: string[];
  startingOpportunity: CategoryId | null;
  startingWhy: string[];
  captureScenario: {
    rate: number;
    capturedLow: number;
    capturedModeled: number;
  };
  roi: null | {
    investment: number;
    netLow: number;
    netModeled: number;
    roiLow: number;
    roiModeled: number;
    paybackMonthsModeled: number | null;
  };
  verifiedValue: 0;
  currency: CurrencyCode;
  methodology: {
    disclaimer: string;
    assumptionIds: string[];
    overlapGroupsApplied: string[];
    portfolioCapApplied: boolean;
  };
};

export const CURRENCY_SYMBOL: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
  SGD: "S$",
  JPY: "¥",
  HKD: "HK$",
  AUD: "A$",
  MXN: "MX$",
  BRL: "R$",
  ZAR: "R",
  OTHER: "",
};
