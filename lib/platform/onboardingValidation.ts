/**
 * Onboarding validation - coverage before RADR READY.
 */

export type CoverageLevel = "GOOD" | "PARTIAL" | "MISSING";

export type OnboardingCheck = {
  key: string;
  label: string;
  level: CoverageLevel;
  detail: string;
};

export type OnboardingValidation = {
  ready: boolean;
  checks: OnboardingCheck[];
};

export function validateOnboardingCoverage(input: {
  locationsMapped: boolean;
  currencyPresent: boolean;
  timezonePresent: boolean;
  reservationDataValid: boolean;
  posTotalsReconcile: boolean;
  laborDataValid: boolean;
  freshnessHealthy: boolean;
}): OnboardingValidation {
  const checks: OnboardingCheck[] = [
    {
      key: "locations",
      label: "Locations mapped",
      level: input.locationsMapped ? "GOOD" : "MISSING",
      detail: input.locationsMapped ? "At least one location" : "Add a location",
    },
    {
      key: "currency",
      label: "Currency",
      level: input.currencyPresent ? "GOOD" : "MISSING",
      detail: input.currencyPresent ? "Present" : "Set location currency",
    },
    {
      key: "timezone",
      label: "Timezone",
      level: input.timezonePresent ? "GOOD" : "MISSING",
      detail: input.timezonePresent ? "Present" : "Set timezone",
    },
    {
      key: "reservations",
      label: "Reservation data",
      level: input.reservationDataValid ? "GOOD" : "PARTIAL",
      detail: input.reservationDataValid ? "Valid" : "Connect or validate bookings",
    },
    {
      key: "pos",
      label: "POS totals",
      level: input.posTotalsReconcile ? "GOOD" : "PARTIAL",
      detail: input.posTotalsReconcile ? "Reconcile OK" : "POS not reconciled",
    },
    {
      key: "labor",
      label: "Labor data",
      level: input.laborDataValid ? "GOOD" : "PARTIAL",
      detail: input.laborDataValid ? "Valid" : "Connect labor",
    },
    {
      key: "freshness",
      label: "Freshness",
      level: input.freshnessHealthy ? "GOOD" : "PARTIAL",
      detail: input.freshnessHealthy ? "Healthy" : "Sources stale",
    },
  ];

  const ready = checks.every((c) => c.level === "GOOD");
  return { ready, checks };
}
