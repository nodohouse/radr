/**
 * Provenance / "How is this calculated?" for material numbers.
 */

export type ProvenanceBlock = {
  label: string;
  value: string;
  definition: string;
  formula: string;
  sources: { label: string; detail: string }[];
  timeRange?: string;
  lastUpdate?: string;
  confidence?: string;
  assumptions?: string[];
};

export function provenanceForCancellationRecovery(): ProvenanceBlock {
  return {
    label: "Verified value",
    value: "€184",
    definition:
      "Observed POS revenue linked to the recovery event after a late cancellation.",
    formula: "verified = min(potential_recoverable, observed_pos_total)",
    sources: [
      {
        label: "Reservations",
        detail: "r_late cancelled 17:42 · Table 14 · 4 covers · €256 booking value",
      },
      {
        label: "Waitlist",
        detail: "wl_t14_match · 3 covers · €192 expected",
      },
      {
        label: "POS",
        detail: "pos_t14_replace · closed 21:36 · €184",
      },
    ],
    timeRange: "2026-08-18 · Berlin (Europe/Berlin)",
    lastUpdate: "21:37",
    confidence: "HIGH",
    assumptions: [
      "Potential €192 is not claimed as verified.",
      "Natural walk-in recovery is not double-counted into verified.",
      "Attribution: RADR-recommended action with operator acceptance.",
    ],
  };
}

export const METRIC_COPY = {
  covers:
    "The number of guests served or expected to be served.",
  bookedCovers:
    "Guests attached to confirmed reservations.",
  forecastCovers:
    "Total guests RADR expects, including booked covers, expected walk-ins, waitlist conversion, and no-show adjustments.",
  bookingValue:
    "Expected spend attached to a reservation before service (covers × expected spend per cover).",
  valueAtRisk:
    "Financial exposure remaining after modeled natural recovery.",
  recoverableValue:
    "Portion of exposure RADR believes can still be protected through an action.",
  verifiedValue:
    "Conservatively proven value from observed evidence after an action. Never exceeds observed result.",
  laborCostPct: "Labor cost as a share of revenue for the period.",
  operatingMargin:
    "Contribution relative to revenue after the location's agreed cost definition.",
  confidence:
    "How strongly data freshness, completeness, and match certainty support the claim.",
} as const;
