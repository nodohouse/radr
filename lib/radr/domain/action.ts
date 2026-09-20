/**
 * Canonical Action model - operator work from a Finding recommendation.
 *
 * Product direction (Finished Work):
 * Finding → Evidence → Economics → Recommendation → Prepared Action →
 * Approval → Execution (only when capability + policy allow) → Verify.
 *
 * Optional preparation fields extend the existing Action without forking
 * a second action model. Execution remains governed; do not imply send /
 * schedule / price changes unless `executionCapability` supports it.
 */

import { z } from "zod";
import { actionStatusSchema } from "./enums";

/** How far RADR may go for this action class (org policy binds at runtime). */
export const delegationLevelSchema = z.enum([
  "OBSERVE",
  "RECOMMEND",
  "PREPARE",
  "EXECUTE_WITH_APPROVAL",
  "EXECUTE_UNDER_POLICY",
  "VERIFY_AND_LEARN",
]);
export type DelegationLevel = z.infer<typeof delegationLevelSchema>;

export const executionCapabilitySchema = z.enum([
  "NONE",
  "DRAFT_ONLY",
  "SUPPORTED",
]);
export type ExecutionCapability = z.infer<typeof executionCapabilitySchema>;

/**
 * How the action may leave RADR.
 * MANUAL = operator confirms they sent/applied it outside RADR.
 * CONNECTOR_WITH_APPROVAL = write path exists after approval.
 * POLICY_ALLOWED = org policy permits auto-exec under constraints.
 * UNSUPPORTED = no write path; prepare only.
 */
export const executionModeSchema = z.enum([
  "MANUAL",
  "CONNECTOR_WITH_APPROVAL",
  "POLICY_ALLOWED",
  "UNSUPPORTED",
]);
export type ExecutionMode = z.infer<typeof executionModeSchema>;

export const actionSchema = z.object({
  id: z.string().min(1),
  findingId: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),

  title: z.string().min(1),
  description: z.string().min(1),
  actionType: z.string().optional(),

  status: actionStatusSchema,

  assignedToUserId: z.string().optional().nullable(),

  expectedCost: z.number().optional(),
  expectedBenefit: z.number().optional(),
  expectedNetBenefit: z.number().optional(),
  currency: z.string().min(3).max(3).default("EUR"),

  /** Optional: prepared payload summary for operator review (not execution). */
  preparedSummary: z.string().optional(),
  /** Structured payload for connector or manual checklist. */
  structuredPayload: z.record(z.string(), z.unknown()).optional(),
  targetSystem: z.string().optional(),
  targetEntity: z.string().optional(),
  /** Optional: role expected to approve before execution. */
  requiredApproverRole: z.string().optional(),
  /** Optional: what systems can actually do today. Default NONE. */
  executionCapability: executionCapabilitySchema.optional(),
  executionMode: executionModeSchema.optional(),
  /** Optional: maximum delegation this action type may request. */
  maxDelegationLevel: delegationLevelSchema.optional(),
  /** Optional: evidence ids / keys attached to the prepared action. */
  evidenceRefs: z.array(z.string()).optional(),
  /** Optional: whether the action is reversible after execution. */
  reversible: z.boolean().optional(),
  /** Shadow Mode: prepare and record; never execute. */
  shadowMode: z.boolean().optional(),
  expiresAt: z.string().optional().nullable(),

  startedAt: z.string().optional().nullable(),
  completedAt: z.string().optional().nullable(),

  createdBy: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Action = z.infer<typeof actionSchema>;

export function parseAction(input: unknown): Action {
  return actionSchema.parse(input);
}

/** Build a proposed Action from a Finding recommendation. */
export function proposeActionFromFinding(input: {
  id: string;
  findingId: string;
  organizationId: string;
  locationId: string;
  title: string;
  description: string;
  expectedCost?: number;
  expectedBenefit?: number;
  expectedNetBenefit?: number;
  currency?: string;
  createdBy: string;
  now?: string;
  preparedSummary?: string;
  requiredApproverRole?: string;
  executionCapability?: ExecutionCapability;
  executionMode?: ExecutionMode;
  maxDelegationLevel?: DelegationLevel;
  evidenceRefs?: string[];
  reversible?: boolean;
  shadowMode?: boolean;
  actionType?: string;
  targetSystem?: string;
  targetEntity?: string;
  structuredPayload?: Record<string, unknown>;
  expiresAt?: string | null;
}): Action {
  const now = input.now ?? new Date().toISOString();
  const capability = input.executionCapability ?? "DRAFT_ONLY";
  return actionSchema.parse({
    id: input.id,
    findingId: input.findingId,
    organizationId: input.organizationId,
    locationId: input.locationId,
    title: input.title,
    description: input.description,
    actionType: input.actionType,
    status: "PROPOSED",
    expectedCost: input.expectedCost,
    expectedBenefit: input.expectedBenefit,
    expectedNetBenefit: input.expectedNetBenefit,
    currency: input.currency ?? "EUR",
    preparedSummary: input.preparedSummary ?? input.description,
    structuredPayload: input.structuredPayload,
    targetSystem: input.targetSystem,
    targetEntity: input.targetEntity,
    requiredApproverRole: input.requiredApproverRole ?? "GM",
    executionCapability: capability,
    executionMode:
      input.executionMode ??
      (capability === "SUPPORTED"
        ? "CONNECTOR_WITH_APPROVAL"
        : capability === "DRAFT_ONLY"
          ? "MANUAL"
          : "UNSUPPORTED"),
    maxDelegationLevel: input.maxDelegationLevel ?? "EXECUTE_WITH_APPROVAL",
    evidenceRefs: input.evidenceRefs,
    reversible: input.reversible ?? true,
    shadowMode: input.shadowMode ?? false,
    expiresAt: input.expiresAt,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  });
}
