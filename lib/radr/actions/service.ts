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
    Pick<
      Action,
      "assignedToUserId" | "startedAt" | "completedAt" | "executionMode"
    >
  >,
): Action | null {
  const result = transitionActionSafe(actionId, status, patch);
  return result.ok ? result.action : null;
}

export function transitionActionSafe(
  actionId: string,
  status: Action["status"],
  patch?: Partial<
    Pick<
      Action,
      "assignedToUserId" | "startedAt" | "completedAt" | "executionMode"
    >
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
        ? (patch?.startedAt ?? new Date().toISOString())
        : existing.startedAt,
    completedAt:
      status === "COMPLETED"
        ? (patch?.completedAt ?? new Date().toISOString())
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
  evidenceIds?: string[];
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
    evidenceIds: input.evidenceIds,
  });
  const prior = memoryVerifications.get(verification.id);
  if (prior) {
    const stable = (value: Verification) =>
      JSON.stringify({ ...value, createdAt: "", updatedAt: "" });
    if (stable(prior) !== stable(verification))
      throw new Error("Conflicting verification ID");
    return prior;
  }
  memoryVerifications.set(verification.id, verification);
  return verification;
}

export function verifiedValueLedger(verifications: Verification[]): {
  identified: number;
  verified: number;
  byTerritory: Record<string, number>;
} {
  const unique = new Map<string, Verification>();
  const outcomes = new Set<string>();
  for (const v of verifications) {
    const parsed = buildVerification({ ...v, now: v.createdAt });
    if (parsed.verifiedValue !== v.verifiedValue)
      throw new Error("Invalid verified amount");
    const prior = unique.get(v.id);
    if (prior) {
      if (JSON.stringify(prior) !== JSON.stringify(v))
        throw new Error("Conflicting verification ID");
      continue;
    }
    if (v.strength !== "ESTIMATED") {
      for (const evidenceId of new Set(v.evidenceIds)) {
        const key = JSON.stringify([
          v.organizationId,
          v.locationId,
          v.findingId,
          evidenceId,
        ]);
        if (outcomes.has(key))
          throw new Error("Evidence already counted for this outcome");
        outcomes.add(key);
      }
    }
    unique.set(v.id, v);
  }
  const rows = [...unique.values()];
  if (new Set(rows.map((v) => v.organizationId)).size > 1)
    throw new Error("Cannot combine tenant ledgers");
  if (new Set(rows.map((v) => v.currency)).size > 1)
    throw new Error(
      "Cannot combine currencies without an explicit conversion policy",
    );
  const digits = rows.length
    ? (new Intl.NumberFormat("en", {
        style: "currency",
        currency: rows[0].currency,
      }).resolvedOptions().maximumFractionDigits ?? 2)
    : 2;
  const factor = 10 ** digits;
  const sumMoney = (field: "expectedValue" | "verifiedValue") => {
    let minorTotal = 0;
    for (const row of rows) {
      const scaled = row[field] * factor;
      const minor = Math.round(scaled);
      if (!Number.isSafeInteger(minor) || Math.abs(scaled - minor) > 0.00001)
        throw new Error("Amount exceeds currency precision or safe range");
      minorTotal += minor;
      if (!Number.isSafeInteger(minorTotal))
        throw new Error("Ledger total exceeds safe range");
    }
    return minorTotal / factor;
  };
  return {
    identified: sumMoney("expectedValue"),
    verified: sumMoney("verifiedValue"),
    byTerritory: {},
  };
}

export { conservativeVerifiedValue };

/** Test helper */
export function __resetActionMemory(): void {
  memoryActions.clear();
  memoryVerifications.clear();
}
