/**
 * Canonical Verification model - conservative proof of financial outcome.
 */

import { z } from "zod";
import { attributionSchema, verificationStrengthSchema } from "./enums";

export const verificationSchema = z
  .object({
    id: z.string().min(1),
    organizationId: z.string().min(1),
    locationId: z.string().min(1),
    findingId: z.string().min(1),
    actionId: z.string().optional().nullable(),

    /** Counterfactual expected result (major units). */
    expectedValue: z.number().finite(),
    /** Observed result from evidence (major units). */
    observedValue: z.number().finite(),
    /**
     * Conservatively claimed value: min(expected, observed) unless overridden.
     * Never claim more than evidence supports.
     */
    verifiedValue: z.number().finite(),
    currency: z
      .string()
      .regex(/^[A-Z]{3}$/)
      .refine(
        (value) => Intl.supportedValuesOf("currency").includes(value),
        "Use a supported ISO currency code",
      ),

    attribution: attributionSchema,
    /** Causal strength of the verified claim. ESTIMATED must not be shown as Verified Value. */
    strength: verificationStrengthSchema.default("SUPPORTED"),
    method: z.string().min(1),
    notes: z.string().optional(),

    evidenceIds: z.array(z.string().trim().min(1)).default([]),

    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .superRefine((v, ctx) => {
    if (
      ![v.expectedValue, v.observedValue, v.verifiedValue].every(
        Number.isFinite,
      )
    )
      return;
    if (Intl.supportedValuesOf("currency").includes(v.currency)) {
      const digits =
        new Intl.NumberFormat("en", {
          style: "currency",
          currency: v.currency,
        }).resolvedOptions().maximumFractionDigits ?? 2;
      const factor = 10 ** digits;
      for (const key of [
        "expectedValue",
        "observedValue",
        "verifiedValue",
      ] as const) {
        const scaled = v[key] * factor;
        if (
          !Number.isSafeInteger(Math.round(scaled)) ||
          Math.abs(scaled - Math.round(scaled)) > 0.00001
        )
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key],
            message: "Amount exceeds currency precision or safe range",
          });
      }
    }
    if (v.strength !== "ESTIMATED" && !v.evidenceIds.length)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["evidenceIds"],
        message: "Verified outcomes require source evidence.",
      });
    if (v.strength !== "ESTIMATED" && v.attribution === "UNCERTAIN")
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["attribution"],
        message: "Uncertain attribution must remain estimated.",
      });
    const maximum =
      v.strength === "ESTIMATED"
        ? 0
        : conservativeVerifiedValue(v.expectedValue, v.observedValue);
    if (v.verifiedValue < 0 || v.verifiedValue > maximum)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["verifiedValue"],
        message: "Verified value exceeds supported outcome.",
      });
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
  if (!Number.isFinite(expectedValue) || !Number.isFinite(observedValue))
    throw new Error("Financial values must be finite");
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
  const verifiedValue =
    input.strength === "ESTIMATED"
      ? 0
      : conservativeVerifiedValue(input.expectedValue, input.observedValue);
  return verificationSchema.parse({
    ...input,
    strength: input.strength ?? "SUPPORTED",
    verifiedValue,
    evidenceIds: input.evidenceIds ?? [],
    createdAt: now,
    updatedAt: now,
  });
}
