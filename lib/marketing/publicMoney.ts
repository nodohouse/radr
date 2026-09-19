/**
 * Canonical public economic fixtures — ONE store for money semantics.
 * Public copy must not invent labels independent of this module.
 */

import {
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_SUPPLIER,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";

export type MoneyMetricType =
  | "expected_incremental_contribution"
  | "invoice_variance"
  | "exposure"
  | "expected_protected"
  | "observed_net"
  | "verified_recovered"
  | "verified_protected";

export type MoneyState =
  | "observed"
  | "expected"
  | "predicted"
  | "recommended"
  | "verified"
  | "exposed";

export type MoneyScope =
  | "invoice"
  | "service"
  | "room_block"
  | "unit_night"
  | "decision"
  | "portfolio_sample";

export type AttributionState =
  | "unattributed"
  | "weakly_attributed"
  | "strongly_attributed"
  | "not_applicable";

export type PublicMoney = {
  amount: number;
  currency: "EUR";
  metricType: MoneyMetricType;
  state: MoneyState;
  scope: MoneyScope;
  baseline: string;
  attribution: AttributionState;
  timeWindow: string;
  /** Human-facing label — use everywhere */
  label: string;
  displayId: string;
};

function eur(
  amount: number,
  rest: Omit<PublicMoney, "amount" | "currency">,
): PublicMoney {
  return { amount, currency: "EUR", ...rest };
}

/** D-1911 — €620 = expected incremental contribution vs seat-now */
export const MONEY_D1911_EXPECTED = eur(CANON_PEAK.expectedProtectedEuro, {
  metricType: "expected_incremental_contribution",
  state: "expected",
  scope: "service",
  baseline: "vs seat-now",
  attribution: "not_applicable",
  timeWindow: "tonight",
  label: "Expected incremental contribution vs seat-now",
  displayId: "D-1911",
});

export const MONEY_D1911_OBSERVED = eur(
  CANON_PEAK.observedContributionEuro ?? CANON_PEAK.actualProtectedEuro,
  {
    metricType: "observed_net",
    state: "observed",
    scope: "service",
    baseline: "vs seat-now path",
    attribution: "unattributed",
    timeWindow: "same service",
    label: "Observed incremental contribution",
    displayId: "D-1911",
  },
);

export const MONEY_D1911_VERIFIED = eur(verifiedEuro(CANON_PEAK), {
  metricType: "verified_protected",
  state: "verified",
  scope: "decision",
  baseline: "vs seat-now",
  attribution: "strongly_attributed",
  timeWindow: "same service",
  label: "Verified protected · strongly attributed",
  displayId: "D-1911",
});

/** D-4102 — €273 = supplier variance / current invoice exposure (NOT expected value) */
export const MONEY_D4102_VARIANCE = eur(CANON_SUPPLIER.exposureEuro, {
  metricType: "invoice_variance",
  state: "exposed",
  scope: "invoice",
  baseline: "vs contract unit price",
  attribution: "not_applicable",
  timeWindow: "current invoice",
  label: "Supplier variance / current invoice exposure",
  displayId: "D-4102",
});

export const MONEY_D4102_VERIFIED = eur(verifiedEuro(CANON_SUPPLIER), {
  metricType: "verified_recovered",
  state: "verified",
  scope: "invoice",
  baseline: "vs contract",
  attribution:
    verifiedEuro(CANON_SUPPLIER) === 0
      ? "not_applicable"
      : "strongly_attributed",
  timeWindow: "settlement window",
  label:
    verifiedEuro(CANON_SUPPLIER) === 0
      ? "Closed · no verified recovery"
      : "Verified recovered",
  displayId: "D-4102",
});

/** D-3104 — expected net €112 · observed €118 · verified recovered €40 */
export const MONEY_D3104_EXPECTED = eur(CANON_ORPHAN.expectedProtectedEuro, {
  metricType: "expected_protected",
  state: "expected",
  scope: "unit_night",
  baseline: "vs fill-now path",
  attribution: "not_applicable",
  timeWindow: "orphan night window",
  label: "Expected net contribution",
  displayId: "D-3104",
});

export const MONEY_D3104_OBSERVED = eur(
  CANON_ORPHAN.observedContributionEuro ?? CANON_ORPHAN.actualProtectedEuro,
  {
    metricType: "observed_net",
    state: "observed",
    scope: "unit_night",
    baseline: "realized net",
    attribution: "unattributed",
    timeWindow: "gap night",
    label: "Observed net contribution",
    displayId: "D-3104",
  },
);

export const MONEY_D3104_VERIFIED = eur(
  CANON_ORPHAN.verifiedIncrementalEuro ?? verifiedEuro(CANON_ORPHAN),
  {
    metricType: "verified_recovered",
    state: "verified",
    scope: "unit_night",
    baseline: "vs counterfactual fill",
    attribution: "strongly_attributed",
    timeWindow: "after stay",
    label: "Verified recovered value",
    displayId: "D-3104",
  },
);

/** D-2201 — exposure €4,200 · expected protected €3,100 · verified €2,960 */
export const MONEY_D2201_EXPOSURE = eur(CANON_OTA.exposureEuro, {
  metricType: "exposure",
  state: "exposed",
  scope: "room_block",
  baseline: "contribution drag if mix slips",
  attribution: "not_applicable",
  timeWindow: "72h",
  label: "Contribution exposure",
  displayId: "D-2201",
});

export const MONEY_D2201_EXPECTED = eur(CANON_OTA.expectedProtectedEuro, {
  metricType: "expected_protected",
  state: "expected",
  scope: "room_block",
  baseline: "vs OTA release",
  attribution: "not_applicable",
  timeWindow: "72h",
  label: "Expected protected contribution",
  displayId: "D-2201",
});

export const MONEY_D2201_VERIFIED = eur(verifiedEuro(CANON_OTA), {
  metricType: "verified_protected",
  state: "verified",
  scope: "decision",
  baseline: "vs OTA release",
  attribution: "strongly_attributed",
  timeWindow: "after hold window",
  label: "Verified protected contribution",
  displayId: "D-2201",
});

export const PUBLIC_MONEY_FIXTURES = {
  "D-1911": {
    expected: MONEY_D1911_EXPECTED,
    observed: MONEY_D1911_OBSERVED,
    verified: MONEY_D1911_VERIFIED,
  },
  "D-4102": {
    variance: MONEY_D4102_VARIANCE,
    verified: MONEY_D4102_VERIFIED,
  },
  "D-3104": {
    expected: MONEY_D3104_EXPECTED,
    observed: MONEY_D3104_OBSERVED,
    verified: MONEY_D3104_VERIFIED,
  },
  "D-2201": {
    exposure: MONEY_D2201_EXPOSURE,
    expected: MONEY_D2201_EXPECTED,
    verified: MONEY_D2201_VERIFIED,
  },
} as const;

export function formatPublicMoney(m: PublicMoney): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: 0,
  }).format(m.amount);
}
