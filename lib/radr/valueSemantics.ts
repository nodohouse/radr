/**
 * Financial value states - never mix exposure, opportunity, and verified.
 *
 * Canonical economic progression:
 * IDENTIFIED → EXPECTED → PREPARED → ACTIONED → OBSERVED → VERIFIED
 *
 * Legacy aliases kept for call-site compatibility:
 * ACTIONABLE ≡ PREPARED · PENDING_VERIFICATION ≡ OBSERVED
 */

import {
  isFindingOpen,
  type Finding,
  type FindingStatus,
} from "@/lib/radr/domain";

export type ValueState =
  | "IDENTIFIED"
  | "EXPECTED"
  | "PREPARED"
  | "ACTIONED"
  | "OBSERVED"
  | "VERIFIED"
  | "DISMISSED"
  | "EXPIRED"
  /** @deprecated Use PREPARED */
  | "ACTIONABLE"
  /** @deprecated Use OBSERVED */
  | "PENDING_VERIFICATION";

export type MoneyKind =
  | "exposure"
  | "recoverable"
  | "opportunity"
  | "verified"
  | "forecast";

export function moneyKindOfFinding(f: Finding): MoneyKind {
  if (f.status === "VERIFIED" || (f.financialImpact.verifiedValue ?? 0) > 0) {
    return "verified";
  }
  const label = f.financialImpact.primaryLabel.toLowerCase();
  if (f.financialImpact.revenueAtRisk && f.financialImpact.revenueAtRisk > 0) {
    return "exposure";
  }
  if (label.includes("opportunity") || label.includes("upside")) {
    return "opportunity";
  }
  if (
    f.financialImpact.recoverableValue ||
    label.includes("recover")
  ) {
    return "recoverable";
  }
  if (label.includes("forecast") || label.includes("expected")) {
    return "forecast";
  }
  return "exposure";
}

export function normalizeValueState(state: ValueState): ValueState {
  if (state === "ACTIONABLE") return "PREPARED";
  if (state === "PENDING_VERIFICATION") return "OBSERVED";
  return state;
}

export function valueStateOfFinding(f: Finding): ValueState {
  if (f.status === "DISMISSED") return "DISMISSED";
  if (f.status === "VERIFIED" || f.status === "RESOLVED") return "VERIFIED";
  if (f.status === "MONITORING") return "OBSERVED";
  if (f.status === "ACTIONED") return "ACTIONED";
  if (f.status === "REVIEWED" || f.status === "OPEN" || f.status === "DETECTED") {
    const rec = f.recommendation;
    if (
      rec &&
      (rec.expectedBenefit != null ||
        rec.expectedCost != null ||
        rec.expectedNetBenefit != null ||
        rec.expectedRevenueProtected != null)
    ) {
      return "PREPARED";
    }
    if (rec) return "EXPECTED";
    return "IDENTIFIED";
  }
  return "IDENTIFIED";
}

/** Display label for economic state (never call ESTIMATED “Verified”). */
export function economicStateLabel(state: ValueState): string {
  switch (normalizeValueState(state)) {
    case "IDENTIFIED":
      return "Identified";
    case "EXPECTED":
      return "Expected";
    case "PREPARED":
      return "Prepared";
    case "ACTIONED":
      return "Actioned";
    case "OBSERVED":
      return "Observed";
    case "VERIFIED":
      return "Verified";
    case "DISMISSED":
      return "Dismissed";
    case "EXPIRED":
      return "Expired";
    default:
      return state;
  }
}

export function countsTowardCurrentExposure(f: Finding): boolean {
  if (!isFindingOpen(f.status)) return false;
  const kind = moneyKindOfFinding(f);
  return kind === "exposure" || kind === "recoverable";
}

/** Unresolved labor risk + recoverable BUY. Excludes verified and opportunity. */
export function currentExposureFromFindings(findings: Finding[]): number {
  return findings
    .filter(countsTowardCurrentExposure)
    .reduce((s, f) => s + f.financialImpact.primaryValue, 0);
}

export function attentionNowFindings(findings: Finding[]): Finding[] {
  return findings
    .filter(countsTowardCurrentExposure)
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function verifiedFromFindings(findings: Finding[]): number {
  return findings.reduce((s, f) => {
    if (f.status !== "VERIFIED" && f.status !== "RESOLVED") return s;
    return s + (f.financialImpact.verifiedValue ?? 0);
  }, 0);
}

export function statusIsClosed(status: FindingStatus): boolean {
  return status === "RESOLVED" || status === "VERIFIED" || status === "DISMISSED";
}

/**
 * Operator-facing attention state. Maps onto existing Finding status - 
 * does not fork the Finding model.
 */
export type OperatorAttentionState =
  | "NEEDS_YOU"
  | "NEEDS_YOU_NOW"
  | "READY_FOR_APPROVAL"
  | "RADR_HANDLING"
  | "WAITING"
  | "WAITING_EXTERNAL"
  | "PENDING_VERIFICATION"
  | "VERIFIED"
  | "WATCH";

export function operatorAttentionState(f: Finding): OperatorAttentionState {
  if (f.status === "VERIFIED" || f.status === "RESOLVED") return "VERIFIED";
  if (f.status === "DISMISSED") return "VERIFIED";
  if (f.status === "MONITORING") return "PENDING_VERIFICATION";
  if (f.status === "ACTIONED") {
    // Actioned without verification → waiting on external systems.
    return "WAITING";
  }
  if (f.urgency === "WATCH") return "WATCH";
  const rec = f.recommendation;
  const prepared =
    rec != null &&
    (rec.expectedCost != null ||
      rec.expectedBenefit != null ||
      rec.expectedNetBenefit != null);
  if (prepared && (f.urgency === "ACT_NOW" || f.urgency === "TODAY")) {
    return "READY_FOR_APPROVAL";
  }
  if (prepared) return "NEEDS_YOU";
  return "NEEDS_YOU";
}

export function attentionStateLabel(state: OperatorAttentionState): string {
  switch (state) {
    case "NEEDS_YOU":
    case "NEEDS_YOU_NOW":
      return "Needs you";
    case "READY_FOR_APPROVAL":
      return "Ready for approval";
    case "RADR_HANDLING":
      return "RADR handling";
    case "WAITING":
    case "WAITING_EXTERNAL":
      return "Waiting";
    case "PENDING_VERIFICATION":
      return "Pending verification";
    case "VERIFIED":
      return "Verified";
    case "WATCH":
      return "Watch";
  }
}
