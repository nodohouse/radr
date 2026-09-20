/**
 * Canonical DEMO world - import this instead of scattering literals.
 * Selectors still own displayed totals.
 */

export {
  DEMO_AS_OF_ISO,
  DEMO_BUSINESS_DATE,
  DEMO_CURRENCY,
  DEMO_FORECAST_EXPOSURE_DELTA,
  DEMO_LOCATION_ID,
  DEMO_LOCATION_NAME,
  DEMO_ORG_ID,
  DEMO_TIMEZONE,
  DEMO_TOMORROW_DATE,
  DEMO_YESTERDAY_DATE,
} from "./demoClock";

/** Atomic story amounts. Aggregates must be derived, not retyped in UI. */
export const CANONICAL_EVENTS = {
  laborAtRisk: 290,
  buyRecoverable: 118,
  cancellationPotential: 192,
  cancellationObservedVerified: 184,
  sellGrossOpportunity: 420,
  sellAdditionalCost: 72,
  sellExpectedNet: 348,
} as const;

/** Unresolved exposure = open LABOR + BUY only. Verified Value excluded. */
export function canonicalUnresolvedExposure(): number {
  return CANONICAL_EVENTS.laborAtRisk + CANONICAL_EVENTS.buyRecoverable;
}

export function assertCanonicalLedger(): {
  exposure: number;
  verified: number;
  sellNet: number;
} {
  const labor = Number(CANONICAL_EVENTS.laborAtRisk);
  const buy = Number(CANONICAL_EVENTS.buyRecoverable);
  const exposure = labor + buy;
  if (exposure !== 408) {
    throw new Error(`Canonical exposure must be 408, got ${exposure}`);
  }
  const verified = Number(CANONICAL_EVENTS.cancellationObservedVerified);
  const potential = Number(CANONICAL_EVENTS.cancellationPotential);
  if (verified > potential) {
    throw new Error(
      `Verified (${verified}) cannot exceed potential (${potential})`,
    );
  }
  // Potential is an estimate; verified is observed. They must remain distinct story amounts.
  if (Math.abs(verified - potential) < 1) {
    throw new Error("Potential must not silently become Verified Value");
  }
  const sellNet =
    Number(CANONICAL_EVENTS.sellGrossOpportunity) -
    Number(CANONICAL_EVENTS.sellAdditionalCost);
  if (sellNet !== Number(CANONICAL_EVENTS.sellExpectedNet)) {
    throw new Error(
      `Sell net ${sellNet} ≠ expected ${CANONICAL_EVENTS.sellExpectedNet}`,
    );
  }
  return { exposure, verified, sellNet };
}
