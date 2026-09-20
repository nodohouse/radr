/**
 * Recover money lifecycle from canonical scenarios + findings.
 * Found / still recoverable / in action / verified must reconcile.
 */

import type { Finding } from "@/lib/radr/domain";
import {
  getCancellationRecoveryScenario,
  getSupplierVarianceScenario,
  getVerifiedValueFromScenarios,
} from "@/lib/radr/scenarios/store";

export type RecoverLifecycle = {
  found: number;
  stillRecoverable: number;
  inAction: number;
  verified: number;
  currency: string;
};

export function recoverLifecycleFromCanonical(): RecoverLifecycle {
  const buy = getSupplierVarianceScenario();
  const cancel = getCancellationRecoveryScenario();
  const ledger = getVerifiedValueFromScenarios();

  const buyOpen = buy.phase === "VERIFIED" ? 0 : buy.invoice.variance;
  const cancelOpen = cancel.verification ? 0 : cancel.potentialRecoverableMajor;

  const buyInAction =
    buy.phase === "APPROVAL_REQUIRED" ||
    buy.phase === "APPROVED" ||
    buy.phase === "EXECUTING"
      ? buy.invoice.variance
      : 0;
  const cancelInAction =
    cancel.actionStatus !== "PROPOSED" && !cancel.verification
      ? cancel.potentialRecoverableMajor
      : 0;

  const stillRecoverable =
    (buyInAction ? 0 : buyOpen) + (cancelInAction ? 0 : cancelOpen);

  return {
    found: buy.invoice.variance + cancel.potentialRecoverableMajor,
    stillRecoverable,
    inAction: buyInAction + cancelInAction,
    verified: ledger.verified,
    currency: "EUR",
  };
}

export function recoverRowsFromCanonical() {
  const buy = getSupplierVarianceScenario();
  const cancel = getCancellationRecoveryScenario();
  return {
    supplier: {
      title: "Supplier pricing discrepancy",
      recoverable: buy.invoice.variance,
      status: buy.phase === "VERIFIED" ? "Verified" : "Recoverable",
      findingId: buy.finding.id,
    },
    cancellation: {
      title: "Cancellation recovery",
      potential: cancel.potentialRecoverableMajor,
      observed: cancel.pos.observedRevenueMajor,
      verified: cancel.verification?.verifiedValue ?? 0,
      status: cancel.verification ? "Verified" : "Recoverable",
      findingId: cancel.finding.id,
    },
  };
}

export function findingsProofChain(finding: Finding): {
  finding: string;
  opportunity: string | null;
  action: string;
  outcome: string | null;
  evidence: string | null;
  verified: string | null;
} {
  return {
    finding: finding.title,
    opportunity: finding.recommendation?.expectedBenefit
      ? `€${finding.recommendation.expectedBenefit} estimated`
      : null,
    action: finding.recommendation.title,
    outcome: finding.presentation?.actionedNote ?? null,
    evidence: finding.evidence[0]
      ? `${finding.evidence[0].label}: ${finding.evidence[0].value}`
      : null,
    verified:
      finding.financialImpact.verifiedValue != null
        ? `€${finding.financialImpact.verifiedValue}`
        : null,
  };
}
