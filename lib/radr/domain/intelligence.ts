/**
 * Known → Missed → Predicted → Actionable → Verified
 * Core RADR intelligence classification across all verticals.
 */

import { z } from "zod";

export const intelligenceClassSchema = z.enum([
  "KNOWN",
  "MISSED",
  "PREDICTED",
  "ACTIONABLE",
  "VERIFIED",
]);
export type IntelligenceClass = z.infer<typeof intelligenceClassSchema>;

/**
 * Prediction confidence — lowercase bands (distinct from Finding ConfidenceBand HIGH/MEDIUM/LOW).
 * Never fake precision.
 */
export const predictionConfidenceBandSchema = z.enum([
  "low",
  "medium",
  "high",
]);
export type PredictionConfidenceBand = z.infer<
  typeof predictionConfidenceBandSchema
>;

export const predictionDriverSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  direction: z.enum(["up", "down", "neutral"]).optional(),
});
export type PredictionDriver = z.infer<typeof predictionDriverSchema>;

/**
 * Explainable prediction — WHAT / WHY / HOW SURE / WHAT TO DO.
 * Demo fixtures use this shape; live ML can fill the same contract later.
 */
export const predictionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.string().min(1),
  timeHorizon: z.string().min(1),
  /** Human WHAT line */
  what: z.string().min(1),
  pointEstimate: z.number().optional(),
  lowerBound: z.number().optional(),
  upperBound: z.number().optional(),
  unit: z.string().optional(),
  confidence: predictionConfidenceBandSchema,
  drivers: z.array(predictionDriverSchema).default([]),
  historicalBaseline: z.string().optional(),
  modelVersion: z.string().default("demo-v0"),
  createdAt: z.string().optional(),
  /** WHAT SHOULD I DO */
  recommendedAction: z.string().optional(),
  /** Roles that should see this prediction */
  visibleToRoles: z.array(z.string()).default([]),
  verticals: z.array(z.string()).default([]),
  actualOutcome: z.number().optional(),
  error: z.number().optional(),
});
export type Prediction = z.infer<typeof predictionSchema>;

/**
 * Normalized value-at-risk / exposure across verticals.
 */
export const valueExposureSchema = z.object({
  id: z.string().min(1),
  revenueExposure: z.number().nonnegative().default(0),
  contributionExposure: z.number().nonnegative().default(0),
  guestImpact: z.enum(["none", "low", "medium", "high"]).default("none"),
  operationalImpact: z.enum(["none", "low", "medium", "high"]).default("none"),
  confidence: predictionConfidenceBandSchema.default("medium"),
  deadline: z.string().optional(),
  currency: z.string().default("EUR"),
  label: z.string().optional(),
});
export type ValueExposure = z.infer<typeof valueExposureSchema>;

export const recoveryLifecycleSchema = z.enum([
  "DETECTED",
  "RECOMMENDED",
  "ACTIONED",
  "RECOVERED",
  "VERIFIED",
]);
export type RecoveryLifecycle = z.infer<typeof recoveryLifecycleSchema>;

/**
 * Universal recovery opportunity — table / room_night / unit_night.
 */
export const recoveryOpportunitySchema = z.object({
  id: z.string().min(1),
  inventoryType: z.enum([
    "table",
    "seat",
    "room_night",
    "unit_night",
    "other",
  ]),
  label: z.string().min(1),
  status: recoveryLifecycleSchema,
  exposure: valueExposureSchema.optional(),
  recommendedChannel: z.string().optional(),
  recommendedAction: z.string().optional(),
  expiresAt: z.string().optional(),
  vertical: z.string().optional(),
});
export type RecoveryOpportunity = z.infer<typeof recoveryOpportunitySchema>;

/**
 * Money operators are not visibly losing — missed upside.
 */
export const missedOpportunitySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  opportunityValue: z.number().nonnegative(),
  probability: z.number().min(0).max(1).optional(),
  deadline: z.string().optional(),
  vertical: z.string().optional(),
  intelligenceClass: z
    .literal("MISSED")
    .default("MISSED"),
});
export type MissedOpportunity = z.infer<typeof missedOpportunitySchema>;

/** Project major-euro exposure into ValueExposure. */
export function valueExposureFromMajor(opts: {
  id: string;
  revenue?: number;
  contribution?: number;
  guestImpact?: ValueExposure["guestImpact"];
  operationalImpact?: ValueExposure["operationalImpact"];
  confidence?: PredictionConfidenceBand;
  deadline?: string;
  label?: string;
}): ValueExposure {
  return valueExposureSchema.parse({
    id: opts.id,
    revenueExposure: opts.revenue ?? 0,
    contributionExposure: opts.contribution ?? 0,
    guestImpact: opts.guestImpact ?? "none",
    operationalImpact: opts.operationalImpact ?? "none",
    confidence: opts.confidence ?? "medium",
    deadline: opts.deadline,
    label: opts.label,
  });
}
