/**
 * Location AttentionState — single channel for status + exposure language.
 * Never show Quiet when material exposure or negative outliers exist.
 */

export type LocationAttentionState =
  | "QUIET"
  | "WATCH"
  | "ACTIONABLE"
  | "NEEDS_JUDGMENT"
  | "RADR_HANDLING"
  | "VERIFYING";

export type LocationAttentionInput = {
  needsYouCount: number;
  handlingCount?: number;
  verifyingCount?: number;
  /** Immediate / decision exposure euros (absolute) */
  activeExposureEuro: number;
  /** Annualized or structural exposure (e.g. procurement) */
  annualizedExposureEuro?: number;
  outlierPolarity?: "positive" | "negative" | "neutral" | null;
};

export function deriveLocationAttention(
  input: LocationAttentionInput,
): LocationAttentionState {
  if (input.needsYouCount > 0) return "NEEDS_JUDGMENT";
  if ((input.verifyingCount ?? 0) > 0) return "VERIFYING";
  if ((input.handlingCount ?? 0) > 0) return "RADR_HANDLING";
  if (
    input.outlierPolarity === "negative" ||
    input.activeExposureEuro > 0 ||
    (input.annualizedExposureEuro ?? 0) > 0
  ) {
    return input.activeExposureEuro > 500 ||
      (input.annualizedExposureEuro ?? 0) > 2000
      ? "ACTIONABLE"
      : "WATCH";
  }
  return "QUIET";
}

export function locationAttentionLabel(state: LocationAttentionState): string {
  switch (state) {
    case "NEEDS_JUDGMENT":
      return "Needs judgment";
    case "RADR_HANDLING":
      return "RADR handling";
    case "VERIFYING":
      return "Verifying";
    case "ACTIONABLE":
      return "Actionable";
    case "WATCH":
      return "Watching";
    case "QUIET":
      return "Quiet";
  }
}
