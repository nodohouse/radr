/**
 * Canonical Decision Trace registry.
 */

import { TRACE_D4102 } from "./d4102";
import { TRACE_D4188 } from "./d4188";
import type { DecisionTraceRecord } from "./types";

export const DECISION_TRACES: Record<string, DecisionTraceRecord> = {
  "D-4102": TRACE_D4102,
  "D-4188": TRACE_D4188,
};

export function getDecisionTrace(
  displayId: string,
): DecisionTraceRecord | undefined {
  return DECISION_TRACES[displayId];
}

export function listDecisionTraces(): DecisionTraceRecord[] {
  return Object.values(DECISION_TRACES);
}

export type {
  DecisionLifecycleState,
  DecisionTraceRecord,
  EpistemicGrade,
  OutcomeKind,
  TraceSourceDisagreement,
  VerificationStrength,
} from "./types";
export { TRACE_D4102 } from "./d4102";
export { TRACE_D4188 } from "./d4188";
