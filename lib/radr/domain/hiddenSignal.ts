/**
 * HiddenSignal — relationships operators struggle to see across systems.
 * Not weather. Not revenue. Not occupancy alone.
 * Evidence-backed, economically relevant, actionable, explainable.
 */

import { z } from "zod";

export const hiddenSignalHorizonSchema = z.enum([
  "NOW",
  "TODAY",
  "THIS_WEEK",
  "THIS_MONTH",
  "STRUCTURAL",
]);
export type HiddenSignalHorizon = z.infer<typeof hiddenSignalHorizonSchema>;

export const hiddenSignalEpistemicSchema = z.enum([
  "ASSOCIATED",
  "HISTORICALLY_FOLLOWED",
  "EXPECTED",
  "CAUSAL",
]);
export type HiddenSignalEpistemic = z.infer<typeof hiddenSignalEpistemicSchema>;

export const hiddenSignalEvidenceRowSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  kind: z
    .enum(["ACTUAL", "BASELINE", "SAMPLE", "ESTIMATE", "INFERENCE"])
    .optional(),
});
export type HiddenSignalEvidenceRow = z.infer<
  typeof hiddenSignalEvidenceRowSchema
>;

export const hiddenSignalSchema = z.object({
  id: z.string().min(1),
  /** Story archetype e.g. BESTSELLER_WEAK_ECONOMICS */
  kind: z.string().min(1),
  vertical: z.enum([
    "restaurant",
    "hotel",
    "serviced_apartments",
    "group",
  ]),
  horizon: hiddenSignalHorizonSchema,
  /** External trigger if any (weather, event) — never the intelligence itself */
  trigger: z.string().optional(),
  headline: z.string().min(1),
  what: z.string().min(1),
  whyMatters: z.string().min(1),
  valueLabel: z.string().min(1),
  valueAmount: z.number().optional(),
  valuePositive: z.boolean().optional(),
  recommendation: z.string().min(1),
  epistemic: hiddenSignalEpistemicSchema.default("HISTORICALLY_FOLLOWED"),
  sampleSize: z.number().int().nonnegative().optional(),
  confidenceBand: z.enum(["HIGH", "MEDIUM", "LOW"]),
  confidenceExplanation: z.string().min(1),
  evidence: z.array(hiddenSignalEvidenceRowSchema).default([]),
  /** Systems that had to be joined to see this */
  systemsJoined: z.array(z.string()).default([]),
  /** Promote to Control Center only when material + timely + actionable */
  promoteToCockpit: z.boolean().default(false),
});
export type HiddenSignal = z.infer<typeof hiddenSignalSchema>;

export function parseHiddenSignal(input: unknown): HiddenSignal {
  return hiddenSignalSchema.parse(input);
}
