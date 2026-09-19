/**
 * Canonical Finding model - RADR intelligence output.
 * UI and persistence must converge on this shape.
 */

import { z } from "zod";
import {
  confidenceBandSchema,
  findingStatusSchema,
  findingUrgencySchema,
  territorySchema,
} from "./enums";

export const findingDriverSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export type FindingDriver = z.infer<typeof findingDriverSchema>;

export const findingEvidenceSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  value: z.string().min(1),
  sourceId: z.string().optional(),
  /** Prefer explicit kind; UI falls back to label heuristics. */
  kind: z.enum(["ACTUAL", "FORECAST", "ESTIMATE", "INFERENCE"]).optional(),
});

export type FindingEvidence = z.infer<typeof findingEvidenceSchema>;

export const findingTimeframeSchema = z.object({
  start: z.string().min(1),
  end: z.string().min(1),
  /** Human label when exact ISO bounds are unknown (demo migration). */
  label: z.string().optional(),
});

export type FindingTimeframe = z.infer<typeof findingTimeframeSchema>;

/**
 * Financial impact in major currency units + ISO currency.
 * Prefer Money helpers when writing new calculators; major units match current UI.
 */
export const financialImpactSchema = z.object({
  grossValue: z.number().optional(),
  bookingValue: z.number().optional(),
  revenueAtRisk: z.number().optional(),
  contributionAtRisk: z.number().optional(),
  avoidableCost: z.number().optional(),
  recoverableValue: z.number().optional(),
  verifiedValue: z.number().optional(),
  /** Primary display amount for lists */
  primaryValue: z.number(),
  primaryLabel: z.string().min(1),
  currency: z.string().min(3).max(3),
});

export type FinancialImpact = z.infer<typeof financialImpactSchema>;

export const findingRecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  expectedCost: z.number().optional(),
  expectedBenefit: z.number().optional(),
  expectedRevenueProtected: z.number().optional(),
  expectedContributionProtected: z.number().optional(),
  expectedNetBenefit: z.number().optional(),
  channels: z.array(z.string()).optional(),
});

export type FindingRecommendation = z.infer<typeof findingRecommendationSchema>;

export const findingConfidenceSchema = z.object({
  score: z.number().min(0).max(100),
  band: confidenceBandSchema,
  explanation: z.string().min(1),
});

export type FindingConfidence = z.infer<typeof findingConfidenceSchema>;

export const dataSourceFreshnessSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  lastSyncLabel: z.string().min(1),
  ageMinutes: z.number().nonnegative(),
});

export type DataSourceFreshness = z.infer<typeof dataSourceFreshnessSchema>;

/**
 * Transient presentation until Action engine owns CTAs.
 * Persisted as jsonb for demo; strip when UI reads Action records.
 */
export const findingPresentationSchema = z.object({
  kindLabel: z.string().min(1),
  headline: z.string().min(1),
  recommendShort: z.string().min(1),
  ctaLabel: z.string().min(1),
  financialNote: z.string().optional(),
  actionCreated: z.boolean().optional(),
  actionedNote: z.string().optional(),
  primaryAction: z.object({
    kind: z.enum(["mark", "open", "send", "review"]),
    label: z.string().min(1),
    href: z.string().optional(),
  }),
  secondaryHref: z.string().min(1),
  secondaryLabel: z.string().min(1),
  eventId: z.string().optional(),
  /** Inline verification note until Verification row is linked. */
  verificationStatus: z.enum([
    "IDENTIFIED",
    "MONITORING",
    "VERIFIED",
    "NOT_APPLICABLE",
  ]),
  verificationMethod: z.string().min(1),
  dataSources: z.array(dataSourceFreshnessSchema).default([]),
});

export type FindingPresentation = z.infer<typeof findingPresentationSchema>;

export const findingSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),
  locationName: z.string().optional(),

  territory: territorySchema,
  category: z.string().min(1),
  subtype: z.string().min(1),

  title: z.string().min(1),
  summary: z.string().min(1),
  explanation: z.string().min(1),

  status: findingStatusSchema,
  urgency: findingUrgencySchema,
  priorityScore: z.number(),

  confidenceScore: z.number().min(0).max(100),
  confidenceBand: confidenceBandSchema,
  confidenceExplanation: z.string().min(1),

  timeframe: findingTimeframeSchema,
  financialImpact: financialImpactSchema,
  drivers: z.array(findingDriverSchema).default([]),
  recommendation: findingRecommendationSchema,
  evidence: z.array(findingEvidenceSchema).default([]),
  sourceIds: z.array(z.string()).default([]),

  /** Stable fingerprint for deduplication (Phase 4). */
  dedupeKey: z.string().min(1),

  /** Optional link to a Service Period context object. */
  servicePeriodId: z.string().optional(),

  presentation: findingPresentationSchema.optional(),

  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Finding = z.infer<typeof findingSchema>;

export function parseFinding(input: unknown): Finding {
  return findingSchema.parse(input);
}

export function isFindingOpen(status: Finding["status"]): boolean {
  return status !== "RESOLVED" && status !== "DISMISSED" && status !== "VERIFIED";
}

export function primaryImpactValue(f: Finding): number {
  return f.financialImpact.primaryValue;
}
