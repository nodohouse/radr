/**
 * Shared financial classification for RADR.
 * Do not collapse these into a single “savings” number.
 */
export type FinancialClass =
  | "exposure"
  | "opportunity"
  | "missed_upside"
  | "recoverable"
  | "identified"
  | "actioned"
  | "recovered"
  | "prevented"
  | "protected"
  | "verified"
  | "realized";

export const FINANCIAL_LABEL: Record<FinancialClass, string> = {
  exposure: "Exposure",
  opportunity: "Opportunity",
  missed_upside: "Missed upside",
  recoverable: "Recoverable",
  identified: "Identified",
  actioned: "Actioned",
  recovered: "Recovered",
  prevented: "Prevented",
  protected: "Protected",
  verified: "Verified value",
  realized: "Realized",
};

/** Product demo chrome: never imply production customer data */
export const DEMO_BADGE = {
  short: "DEMO",
  chrome: "RADR / DEMO",
  simulated: "Simulated live data",
  environment: "Demo environment",
  illustrative: "Illustrative demo",
} as const;

export function impactClassLabel(
  t: "exposure" | "recoverable" | "missed_upside" | "preventable" | "verified",
): string {
  if (t === "preventable") return FINANCIAL_LABEL.exposure;
  if (t === "missed_upside") return FINANCIAL_LABEL.missed_upside;
  if (t === "recoverable") return FINANCIAL_LABEL.recoverable;
  if (t === "verified") return FINANCIAL_LABEL.verified;
  return FINANCIAL_LABEL.exposure;
}
