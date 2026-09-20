/**
 * Action + Verification domain services.
 */

import {
  type Action,
  type Finding,
  type Verification,
  proposeActionFromFinding,
  buildVerification,
  conservativeVerifiedValue,
} from "@/lib/radr/domain";
import { assertActionTransition } from "@/lib/radr/actions/transitions";

const memoryActions = new Map<string, Action>();
const memoryVerifications = new Map<string, Verification>();

function defaultApproverRole(finding: Finding): string {
  if (finding.territory === "BUY") return "Finance";
  if (finding.territory === "LABOR") return "GM";
  if (finding.territory === "SELL") return "GM";
  if (finding.territory === "RECOVER") return "GM";
  return "GM";
}

export function createActionFromFinding(
  finding: Finding,
  createdBy: string,
  id?: string,
): Action {
  const rec = finding.recommendation;
  const action = proposeActionFromFinding({
    id: id ?? `act_${finding.id}_${Date.now()}`,
    findingId: finding.id,
    organizationId: finding.organizationId,
    locationId: finding.locationId,
    title: rec.title,
    description: rec.description,
    expectedCost: rec.expectedCost,
    expectedBenefit: rec.expectedBenefit,
    expectedNetBenefit: rec.expectedNetBenefit,
    currency: finding.financialImpact.currency,
    preparedSummary: rec.description,
    requiredApproverRole: defaultApproverRole(finding),
    executionCapability: "DRAFT_ONLY",
    executionMode: "MANUAL",
    maxDelegationLevel: "EXECUTE_WITH_APPROVAL",
    evidenceRefs: finding.evidence.map((e) => e.id ?? e.label).filter(Boolean),
    reversible: true,
    actionType: finding.category,
    targetSystem:
      finding.territory === "BUY"
        ? "supplier_email"
        : finding.territory === "RECOVER"
          ? "reservations"
          : finding.territory === "LABOR"
            ? "labor"
            : undefined,
    createdBy,
    now: finding.updatedAt,
  });
  memoryActions.set(action.id, action);
  return action;
}

export type TransitionActionResult =
  | { ok: true; action: Action }
  | { ok: false; error: string; code: string };

export function transitionAction(
  actionId: string,
  status: Action["status"],
  patch?: Partial<
    Pick<Action, "assignedToUserId" | "startedAt" | "completedAt" | "executionMode">
  >,
): Action | null {
  const result = transitionActionSafe(actionId, status, patch);
  return result.ok ? result.action : null;
}

export function transitionActionSafe(
  actionId: string,
  status: Action["status"],
  patch?: Partial<
    Pick<Action, "assignedToUserId" | "startedAt" | "completedAt" | "executionMode">
  >,
): TransitionActionResult {
  const existing = memoryActions.get(actionId);
  if (!existing) {
    return { ok: false, code: "UNKNOWN_ACTION", error: "Action not found." };
  }
  const candidate: Action = {
    ...existing,
    ...patch,
  };
  const gate = assertActionTransition(candidate, status);
  if (!gate.ok) {
    return { ok: false, code: gate.code, error: gate.message };
  }
  const next: Action = {
    ...candidate,
    status,
    updatedAt: new Date().toISOString(),
    startedAt:
      status === "IN_PROGRESS"
        ? patch?.startedAt ?? new Date().toISOString()
        : existing.startedAt,
    completedAt:
      status === "COMPLETED"
        ? patch?.completedAt ?? new Date().toISOString()
        : existing.completedAt,
  };
  memoryActions.set(actionId, next);
  return { ok: true, action: next };
}

export function getAction(actionId: string): Action | undefined {
  return memoryActions.get(actionId);
}

export function listActionsForFinding(findingId: string): Action[] {
  return [...memoryActions.values()].filter((a) => a.findingId === findingId);
}

export function verifyOutcome(input: {
  id: string;
  finding: Finding;
  actionId?: string;
  expectedValue: number;
  observedValue: number;
  attribution: Verification["attribution"];
  method: string;
  notes?: string;
  strength?: Verification["strength"];
}): Verification {
  if (input.strength === "ESTIMATED") {
    throw new Error(
      "ESTIMATED attribution cannot create Verified Value. Persist as expected impact only.",
    );
  }
  const verification = buildVerification({
    id: input.id,
    organizationId: input.finding.organizationId,
    locationId: input.finding.locationId,
    findingId: input.finding.id,
    actionId: input.actionId,
    expectedValue: input.expectedValue,
    observedValue: input.observedValue,
    currency: input.finding.financialImpact.currency,
    attribution: input.attribution,
    strength: input.strength ?? "SUPPORTED",
    method: input.method,
    notes: input.notes,
  });
  memoryVerifications.set(verification.id, verification);
  return verification;
}

export function verifiedValueLedger(verifications: Verification[]): {
  identified: number;
  verified: number;
  byTerritory: Record<string, number>;
} {
  const verified = verifications
    .filter((v) => v.strength !== "ESTIMATED")
    .reduce((s, v) => s + v.verifiedValue, 0);
  return {
    identified: verifications.reduce((s, v) => s + v.expectedValue, 0),
    verified,
    byTerritory: {},
  };
}

export { conservativeVerifiedValue };

/** Test helper */
export function __resetActionMemory(): void {
  memoryActions.clear();
  memoryVerifications.clear();
}
