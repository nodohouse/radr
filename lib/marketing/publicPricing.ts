import type { PublicPlanId } from "./conversionJourney";

/** Published offer arithmetic only. This does not create a payment or entitlement. */
export const PUBLIC_PRICING = {
  currency: "EUR",
  commitmentMonths: 12,
  billingFrequency: "monthly",
  corePerLocation: 249,
  expandPerLocation: 199,
  expandMinimumLocations: 2,
  expandMaximumLocations: 5,
} as const;

export function standardPlanQuote(locations: number) {
  if (!Number.isSafeInteger(locations) || locations < 1 || locations > 5)
    return null;
  const plan: PublicPlanId = locations === 1 ? "start" : "expand";
  const perLocation =
    locations === 1
      ? PUBLIC_PRICING.corePerLocation
      : PUBLIC_PRICING.expandPerLocation;
  const monthlyTotal = locations * perLocation;
  return {
    plan,
    locations,
    perLocation,
    monthlyTotal,
    commitmentMonths: PUBLIC_PRICING.commitmentMonths,
    commitmentTotal: monthlyTotal * PUBLIC_PRICING.commitmentMonths,
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
