/**
 * MoneyImpact — canonical economic measure for Decisions / Futures / UI.
 *
 * Sign convention (global):
 *   + = economic benefit
 *   − = economic loss / exposure
 *
 * Never compare unlike kinds without an explicit conversion.
 */

export type MoneyImpactKind =
  | "EXPOSURE"
  | "EXPECTED_CONTRIBUTION"
  | "PROTECTED"
  | "INCREMENTAL"
  | "ACTUAL"
  | "VERIFIED";

export type MoneyImpact = {
  amountEuro: number;
  kind: MoneyImpactKind;
  currency: "EUR";
  /** Short public label — never omit when kind is EXPOSURE */
  label: string;
  horizon?: string;
  scope?: string;
};

/**
 * Incremental vs do-nothing under Peak convention:
 * no-action expectedContribution is 0 (exposure lives on Decision.exposureEuro).
 * If a legacy fixture still stores negative no-action, treat baseline as 0
 * and map the negative to EXPOSURE — never double-count into incremental.
 */
export function incrementalVsNoActionEuro(
  selectedExpectedEuro: number,
  noActionExpectedEuro: number | null | undefined,
): number {
  const baseline =
    noActionExpectedEuro == null || noActionExpectedEuro < 0
      ? 0
      : noActionExpectedEuro;
  return selectedExpectedEuro - baseline;
}

export function exposureFromNoAction(
  noActionExpectedEuro: number | null | undefined,
  exposureEuro?: number,
): MoneyImpact | null {
  if (exposureEuro != null && exposureEuro > 0) {
    return {
      amountEuro: -Math.abs(exposureEuro),
      kind: "EXPOSURE",
      currency: "EUR",
      label: "Contribution exposed if no action",
    };
  }
  if (noActionExpectedEuro != null && noActionExpectedEuro < 0) {
    return {
      amountEuro: noActionExpectedEuro,
      kind: "EXPOSURE",
      currency: "EUR",
      label: "Contribution exposed if no action",
    };
  }
  return null;
}
