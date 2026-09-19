/**
 * Mutable scenario store for DEMO gold-standard loops.
 * LIVE will replace with DB repositories implementing the same ports.
 */

import {
  buildCancellationRecoveryScenario,
  CANCELLATION_RECOVERY_ID,
  type CancellationRecoveryScenario,
} from "./cancellationRecovery";
import {
  buildSupplierVarianceScenario,
  SUPPLIER_VARIANCE_ID,
  type SupplierScenarioPhase,
  type SupplierVarianceScenario,
} from "./supplierVariance";
import { retainCancellationRecoveryOutcome } from "@/lib/radr/outcomeHistory";
import { seedDemoVerifiedWork } from "@/lib/radr/verifiedWork";

let cancellation: CancellationRecoveryScenario =
  buildCancellationRecoveryScenario("VERIFIED");

// Seed outcome retention for the default verified demo state.
retainCancellationRecoveryOutcome({
  findingId: cancellation.finding.id,
  organizationId: cancellation.finding.organizationId,
  locationId: cancellation.finding.locationId,
  expectedValueMajor: cancellation.potentialRecoverableMajor,
  observedValueMajor: cancellation.pos.observedRevenueMajor,
  verifiedValueMajor:
    cancellation.verification?.verifiedValue ??
    cancellation.pos.observedRevenueMajor,
});

seedDemoVerifiedWork();
let supplier: SupplierVarianceScenario =
  buildSupplierVarianceScenario("DETECTED");

export function getCancellationRecoveryScenario(): CancellationRecoveryScenario {
  return cancellation;
}

export function resetCancellationRecoveryScenario(
  phase: CancellationRecoveryScenario["actionStatus"] = "PROPOSED",
): CancellationRecoveryScenario {
  cancellation = buildCancellationRecoveryScenario(phase);
  return cancellation;
}

export function acceptCancellationRecoveryAction(): CancellationRecoveryScenario {
  cancellation = buildCancellationRecoveryScenario("ACCEPTED");
  return cancellation;
}

export function seatCancellationRecovery(): CancellationRecoveryScenario {
  cancellation = buildCancellationRecoveryScenario("COMPLETED");
  return cancellation;
}

export function verifyCancellationRecovery(): CancellationRecoveryScenario {
  cancellation = buildCancellationRecoveryScenario("VERIFIED");
  retainCancellationRecoveryOutcome({
    findingId: cancellation.finding.id,
    organizationId: cancellation.finding.organizationId,
    locationId: cancellation.finding.locationId,
    expectedValueMajor: cancellation.potentialRecoverableMajor,
    observedValueMajor: cancellation.pos.observedRevenueMajor,
    verifiedValueMajor:
      cancellation.verification?.verifiedValue ??
      cancellation.pos.observedRevenueMajor,
  });
  return cancellation;
}

export function getSupplierVarianceScenario(): SupplierVarianceScenario {
  return supplier;
}

export function resetSupplierVarianceScenario(
  phase: SupplierScenarioPhase = "DETECTED",
): SupplierVarianceScenario {
  supplier = buildSupplierVarianceScenario(phase);
  return supplier;
}

export function requestSupplierCreditApproval(): SupplierVarianceScenario {
  supplier = buildSupplierVarianceScenario("APPROVAL_REQUIRED");
  return supplier;
}

export function approveSupplierCredit(): SupplierVarianceScenario {
  supplier = buildSupplierVarianceScenario("APPROVED");
  return supplier;
}

export function executeSupplierCreditRequest(): SupplierVarianceScenario {
  supplier = buildSupplierVarianceScenario("EXECUTING");
  return supplier;
}

export function verifySupplierCredit(): SupplierVarianceScenario {
  supplier = buildSupplierVarianceScenario("VERIFIED");
  return supplier;
}

export function getScenarioFindingById(id: string) {
  if (
    id === CANCELLATION_RECOVERY_ID ||
    id === cancellation.finding.id
  ) {
    return cancellation.finding;
  }
  if (id === SUPPLIER_VARIANCE_ID || id === supplier.finding.id) {
    return supplier.finding;
  }
  return null;
}

export function getVerifiedValueFromScenarios(): {
  identified: number;
  actionable: number;
  actioned: number;
  recovered: number;
  verified: number;
  currency: string;
  attribution: string;
  sources: string[];
  byTerritory: { BUY: number; LABOR: number; SELL: number; RECOVER: number };
} {
  const cancelVerified = cancellation.verification?.verifiedValue ?? 0;
  const cancelAccepted = cancellation.actionStatus !== "PROPOSED";
  const supplierVerified = supplier.verification?.verifiedValue ?? 0;
  const supplierActioned =
    supplier.phase === "APPROVED" ||
    supplier.phase === "EXECUTING" ||
    supplier.phase === "VERIFIED";

  const identified =
    cancellation.reservation.expectedBookingValueMajor +
    supplier.invoice.variance;
  const actionable =
    cancellation.potentialRecoverableMajor + supplier.invoice.variance;
  const actioned =
    (cancelAccepted ? cancellation.potentialRecoverableMajor : 0) +
    (supplierActioned ? supplier.invoice.variance : 0);
  const verified = cancelVerified + supplierVerified;

  return {
    identified,
    actionable,
    actioned,
    recovered: verified,
    verified,
    currency: "EUR",
    attribution:
      supplierVerified || cancelVerified
        ? "RADR_RECOMMENDED"
        : "UNCERTAIN",
    sources: ["cancellation_recovery", "supplier_variance"],
    byTerritory: {
      BUY: supplierVerified,
      LABOR: 0,
      SELL: 0,
      RECOVER: cancelVerified,
    },
  };
}

/** Butler SoT answer for Table 14 recovery question */
export function butlerTable14RecoveryAnswer(): {
  answer: string;
  why: string;
  impactEuro: number;
  evidence: { label: string; value: string }[];
  confidence: string;
  recommendedNextStep: string;
} {
  const s = getCancellationRecoveryScenario();
  const verified = s.verification?.verifiedValue ?? null;
  return {
    answer: verified
      ? `€${verified} verified from the Table 14 cancellation recovery.`
      : `€${s.potentialRecoverableMajor} potentially recoverable from Table 14. Not yet verified.`,
    why: verified
      ? "Replacement party seated; POS closed at €184. RADR claims observed revenue, not the €192 waitlist expectation."
      : "Waitlist match on released 20:00 inventory. Verification requires seating and POS close.",
    impactEuro: verified ?? s.potentialRecoverableMajor,
    evidence: [
      {
        label: "Reservation",
        value: `${s.reservation.id} · Table ${s.reservation.tableId}`,
      },
      {
        label: "Potential recoverable",
        value: `€${s.potentialRecoverableMajor}`,
      },
      {
        label: "Observed POS",
        value: verified ? `€${s.pos.observedRevenueMajor}` : "Pending",
      },
      {
        label: "Verified",
        value: verified ? `€${verified}` : "Not yet",
      },
      {
        label: "Finding",
        value: s.finding.id,
      },
    ],
    confidence: s.finding.confidenceBand,
    recommendedNextStep: verified
      ? "Open Verified Value ledger"
      : "Accept recovery action on the finding",
  };
}
