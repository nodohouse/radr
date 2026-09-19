/**
 * Action status state machine.
 * Prepared ≠ executed. Unsupported connectors cannot jump to COMPLETED.
 */

import type { Action, ExecutionCapability } from "@/lib/radr/domain";

export type ActionTransitionError = {
  ok: false;
  code:
    | "UNKNOWN_ACTION"
    | "INVALID_TRANSITION"
    | "EXECUTION_UNSUPPORTED"
    | "SHADOW_MODE";
  message: string;
};

export type ActionTransitionOk = { ok: true; from: Action["status"]; to: Action["status"] };

const ALLOWED: Record<Action["status"], ReadonlyArray<Action["status"]>> = {
  PROPOSED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["ASSIGNED", "IN_PROGRESS", "CANCELLED"],
  ASSIGNED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransitionAction(
  from: Action["status"],
  to: Action["status"],
): boolean {
  return ALLOWED[from]?.includes(to) ?? false;
}

export function assertActionTransition(
  action: Action,
  to: Action["status"],
): ActionTransitionOk | ActionTransitionError {
  if (!canTransitionAction(action.status, to)) {
    return {
      ok: false,
      code: "INVALID_TRANSITION",
      message: `Cannot move action from ${action.status} to ${to}.`,
    };
  }

  if (to === "COMPLETED" || to === "IN_PROGRESS") {
    if (action.shadowMode) {
      return {
        ok: false,
        code: "SHADOW_MODE",
        message:
          "Shadow Mode allows prepare and approve records only. Execution is blocked.",
      };
    }
    const capability: ExecutionCapability =
      action.executionCapability ?? "DRAFT_ONLY";
    if (capability === "NONE" || capability === "DRAFT_ONLY") {
      if (action.executionMode === "MANUAL") {
        // Manual confirmation of an operator-sent action is allowed.
        return { ok: true, from: action.status, to };
      }
      return {
        ok: false,
        code: "EXECUTION_UNSUPPORTED",
        message:
          "Connector cannot execute this action. Mark MANUAL confirmation or keep as approved draft.",
      };
    }
  }

  return { ok: true, from: action.status, to };
}

/** Finding loop / value progression - invalid skips. */
export const FINDING_VALUE_FLOW = [
  "IDENTIFIED",
  "EXPECTED",
  "PREPARED",
  "ACTIONED",
  "OBSERVED",
  "VERIFIED",
] as const;

export type EconomicProgressState = (typeof FINDING_VALUE_FLOW)[number];

export function canAdvanceEconomicState(
  from: EconomicProgressState,
  to: EconomicProgressState,
): boolean {
  const fi = FINDING_VALUE_FLOW.indexOf(from);
  const ti = FINDING_VALUE_FLOW.indexOf(to);
  if (fi < 0 || ti < 0) return false;
  // Allow same or forward one-or-more steps, never skip into VERIFIED from IDENTIFIED.
  if (to === "VERIFIED" && from !== "OBSERVED" && from !== "ACTIONED") {
    return false;
  }
  if (to === "OBSERVED" && fi < FINDING_VALUE_FLOW.indexOf("ACTIONED")) {
    return false;
  }
  return ti >= fi;
}
