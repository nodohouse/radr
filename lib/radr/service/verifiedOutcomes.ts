/**
 * Service Intelligence → Verified Value closeout shapes.
 * Cancellation recovery + smart-floor optimization both close the RADR loop.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { getCancellationRecoveryScenario } from "@/lib/radr/scenarios/store";

export type ServiceVerifiedOutcome = {
  id: string;
  class: "cancellation_recovery" | "smart_floor";
  decisionId: string;
  opportunityEuro: number;
  expectedEuro: number;
  observedEuro: number;
  verifiedEuro: number;
  counterfactual: string;
  note: string;
};

export function serviceVerifiedOutcomes(): ServiceVerifiedOutcome[] {
  const cancel = getCancellationRecoveryScenario();
  const outcomes: ServiceVerifiedOutcome[] = [];

  if (cancel?.verification) {
    outcomes.push({
      id: "vv_cancel_t14",
      class: "cancellation_recovery",
      decisionId: DECISION_IDS.tableRecover,
      opportunityEuro: cancel.potentialRecoverableMajor,
      expectedEuro: cancel.potentialRecoverableMajor,
      observedEuro: cancel.verifiedValueMajor,
      verifiedEuro: cancel.verifiedValueMajor,
      counterfactual: "empty table",
      note: "Slot offered to matching parties · replacement booking observed on POS",
    });
  }

  // Smart-floor closeout — observed below expected (honest delta for Memory)
  outcomes.push({
    id: "vv_smart_floor_peak",
    class: "smart_floor",
    decisionId: DECISION_IDS.peak,
    opportunityEuro: 620,
    expectedEuro: 620,
    observedEuro: 438,
    verifiedEuro: 438,
    counterfactual: "176 covers capacity · no reallocation",
    note: "Additional bookings after floor reallocation · Memory learns why delta vs €620 expected",
  });

  return outcomes;
}
