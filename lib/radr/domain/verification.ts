/**
 * Canonical Verification model - conservative proof of financial outcome.
 */

import { z } from "zod";
import { attributionSchema, verificationStrengthSchema } from "./enums";

export const verificationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),
  findingId: z.string().min(1),
  actionId: z.string().optional().nullable(),

  /** Counterfactual expected result (major units). */
  expectedValue: z.number(),
  /** Observed result from evidence (major units). */
  observedValue: z.number(),
  /**
   * Conservatively claimed value: min(expected, observed) unless overridden.
   * Never claim more than evidence supports.
   */
  verifiedValue: z.number(),
  currency: z.string().min(3).max(3),

  attribution: attributionSchema,
  /** Causal strength of the verified claim. ESTIMATED must not be shown as Verified Value. */
  strength: verificationStrengthSchema.default("SUPPORTED"),
  method: z.string().min(1),
  notes: z.string().optional(),

  evidenceIds: z.array(z.string()).default([]),

  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Verification = z.infer<typeof verificationSchema>;

export function parseVerification(input: unknown): Verification {
  return verificationSchema.parse(input);
}

/** Conservative verified value: never exceed observed evidence. */
export function conservativeVerifiedValue(
  expectedValue: number,
  observedValue: number,
): number {
  return Math.max(0, Math.min(expectedValue, observedValue));
}

export function buildVerification(input: {
  id: string;
  organizationId: string;
  locationId: string;
  findingId: string;
  actionId?: string | null;
  expectedValue: number;
  observedValue: number;
  currency: string;
  attribution: z.infer<typeof attributionSchema>;
  strength?: z.infer<typeof verificationStrengthSchema>;
  method: string;
  notes?: string;
  evidenceIds?: string[];
  now?: string;
}): Verification {
  const now = input.now ?? new Date().toISOString();
  const verifiedValue = conservativeVerifiedValue(
    input.expectedValue,
    input.observedValue,
  );
  return verificationSchema.parse({
    ...input,
    strength: input.strength ?? "SUPPORTED",
    verifiedValue,
    evidenceIds: input.evidenceIds ?? [],
    createdAt: now,
    updatedAt: now,
  });
}
