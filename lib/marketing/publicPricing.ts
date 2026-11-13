import type { PublicPlanId } from "./conversionJourney";

/** Published offer arithmetic only. This does not create a payment or entitlement. */
export const PUBLIC_PRICING = {
  currency: "EUR",
  commitmentMonths: 12,
  billingFrequency: "annual",
  corePerLocation: 249,
  expandPerLocation: 199,
  coreMonthlyInstalment: 299,
  expandMonthlyInstalment: 239,
  expandMinimumLocations: 2,
  expandMaximumLocations: 5,
} as const;

export type BillingChoice = "annual" | "monthly";
export function billingChoice(value: unknown): BillingChoice {
  return value === "monthly" ? "monthly" : "annual";
}

export function standardPlanQuote(
  locations: number,
  billing: BillingChoice = "annual",
) {
  if (!Number.isSafeInteger(locations) || locations < 1 || locations > 5)
    return null;
  const plan: PublicPlanId = locations === 1 ? "start" : "expand";
  const annualRate =
    locations === 1
      ? PUBLIC_PRICING.corePerLocation
      : PUBLIC_PRICING.expandPerLocation;
  const monthlyRate =
    locations === 1
      ? PUBLIC_PRICING.coreMonthlyInstalment
      : PUBLIC_PRICING.expandMonthlyInstalment;
  const perLocation = billing === "annual" ? annualRate : monthlyRate;
  const monthlyTotal = locations * perLocation;
  const commitmentTotal = monthlyTotal * PUBLIC_PRICING.commitmentMonths;
  const annualSaving =
    (monthlyRate - annualRate) * locations * PUBLIC_PRICING.commitmentMonths;
  return {
    plan,
    locations,
    perLocation,
    billing,
    monthlyTotal,
    commitmentMonths: PUBLIC_PRICING.commitmentMonths,
    commitmentTotal,
    dueOnActivation: billing === "annual" ? commitmentTotal : monthlyTotal,
    annualSaving: billing === "annual" ? annualSaving : 0,
    currency: PUBLIC_PRICING.currency,
  };
}

export function formatPublicPrice(amount: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: PUBLIC_PRICING.currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
