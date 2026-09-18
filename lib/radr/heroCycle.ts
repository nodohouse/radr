/**
 * Homepage hero intelligence cycle - single source of truth.
 * Numbers stay continuous across Signal → Finding → Action → Verified.
 * Currency follows the venue location.
 *
 * LABOR (Berlin, EUR): €290 at risk → €14 residual → €276 protected
 * RECOVER (NYC, USD): $4,280 owed → $4,280 recovered
 * SELL (New York, USD): €166 at risk → €12 residual → €154 recovered
 * BUY (Paris, EUR): €118 variance → €118 credit confirmed
 */

export type HeroTerritory = "labor" | "recover" | "sell" | "buy";
export type HeroPhase = "signal" | "finding" | "action" | "verified";
export type HeroMoneyTone = "risk" | "owed";
export type HeroCurrency = "EUR" | "USD";

export const HERO_PHASES: readonly HeroPhase[] = [
  "signal",
  "finding",
  "action",
  "verified",
] as const;

export type HeroEvidenceRow = {
  labelKey: string;
  value: string;
};

export type HeroCycleScenario = {
  id: HeroTerritory;
  /** i18n key under homepage.hero.cycle.* */
  key: HeroTerritory;
  location: string;
  time: string;
  /** Peak / service window shown in SIGNAL + ACTION */
  window: string;
  /** Local operating currency for this venue */
  currency: HeroCurrency;
  money: {
    /** FINDING exposure / owed amount */
    atRisk: number;
    /** VERIFIED outcome */
    verified: number;
    /** Residual still exposed after action (optional) */
    residual?: number;
    /** Semantic tone for at-risk state */
    tone: HeroMoneyTone;
  };
  /** Shared metrics - identical in SIGNAL and FINDING */
  metrics: ReadonlyArray<HeroEvidenceRow>;
  verifiedMetrics: ReadonlyArray<HeroEvidenceRow>;
};

export const HERO_CYCLES: readonly HeroCycleScenario[] = [
  {
    id: "labor",
    key: "labor",
    location: "Berlin Mitte",
    time: "7:07 PM",
    window: "7:15-8:30 PM",
    currency: "EUR",
    money: { atRisk: 290, verified: 276, residual: 14, tone: "risk" },
    metrics: [
      { labelKey: "forecastCovers", value: "142" },
      { labelKey: "fohScheduled", value: "4" },
      { labelKey: "fohRequired", value: "5" },
    ],
    verifiedMetrics: [
      { labelKey: "fohAdded", value: "7:12 PM" },
      { labelKey: "capacityHeld", value: "Above forecast" },
      { labelKey: "residualRisk", value: "€14" },
    ],
  },
  {
    id: "recover",
    key: "recover",
    location: "New York SoHo",
    time: "11:22 AM",
    window: "Credit · CN-4410",
    currency: "USD",
    money: { atRisk: 4280, verified: 4280, tone: "owed" },
    metrics: [
      { labelKey: "creditNote", value: "CN-4410" },
      { labelKey: "supplier", value: "FreshCo" },
      { labelKey: "ledgerStatus", value: "Missing" },
    ],
    verifiedMetrics: [
      { labelKey: "creditNote", value: "CN-4410" },
      { labelKey: "ledgerStatus", value: "Posted" },
      { labelKey: "settled", value: "$4,280" },
    ],
  },
  {
    id: "sell",
    key: "sell",
    location: "New York Flatiron",
    time: "8:04 PM",
    window: "8:00 PM · Table 14",
    currency: "EUR",
    money: { atRisk: 166, verified: 154, residual: 12, tone: "risk" },
    metrics: [
      { labelKey: "coversReleased", value: "4" },
      { labelKey: "bookingValue", value: "€166" },
      { labelKey: "waitlist", value: "3 ready" },
    ],
    verifiedMetrics: [
      { labelKey: "rebooked", value: "Table 14" },
      { labelKey: "channel", value: "Waitlist" },
      { labelKey: "posMatch", value: "€154" },
    ],
  },
  {
    id: "buy",
    key: "buy",
    location: "Paris Marais",
    time: "9:41 AM",
    window: "Invoice · INV-8841",
    currency: "EUR",
    money: { atRisk: 118, verified: 118, tone: "owed" },
    metrics: [
      { labelKey: "contractPrice", value: "€31.20" },
      { labelKey: "invoicePrice", value: "€34.80" },
      { labelKey: "variance", value: "€118" },
    ],
    verifiedMetrics: [
      { labelKey: "creditRef", value: "CR-2204" },
      { labelKey: "supplier", value: "FreshCo" },
      { labelKey: "posted", value: "Confirmed" },
    ],
  },
] as const;

/**
 * Phase enter times (ms from scenario start).
 * SIGNAL 0-2s · FINDING 2-4.5s · ACTION 4.5-7s · VERIFIED 7-12s
 */
export const HERO_CYCLE_TIMING = {
  signal: 0,
  finding: 2000,
  action: 4500,
  verified: 7000,
  /** Hold verified then advance scenario */
  nextScenario: 12000,
} as const;

function assertContinuous(s: HeroCycleScenario) {
  const { atRisk, verified, residual } = s.money;
  if (residual != null && atRisk - residual !== verified) {
    throw new Error(
      `Hero ${s.id} money math inconsistent: ${atRisk} − ${residual} ≠ ${verified}`,
    );
  }
  if (residual == null && atRisk !== verified) {
    throw new Error(
      `Hero ${s.id} money math inconsistent: atRisk ${atRisk} ≠ verified ${verified}`,
    );
  }
}

for (const s of HERO_CYCLES) assertContinuous(s);
