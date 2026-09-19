/**
 * Domain MetricDefinition — role × vertical KPI registry.
 * Distinct from platform admin metrics in lib/platform/metricDefinitions.ts.
 */

import { z } from "zod";

export const metricVisibilitySchema = z.enum([
  "default",
  "optional",
  "hidden",
  "admin",
]);
export type MetricVisibility = z.infer<typeof metricVisibilitySchema>;

export const metricUnitSchema = z.enum([
  "euro",
  "percent",
  "count",
  "ratio",
  "minutes",
  "score",
  "text",
]);
export type MetricUnit = z.infer<typeof metricUnitSchema>;

export const metricDefinitionSchema = z.object({
  id: z.string().min(1),
  verticals: z.array(z.string()).min(1),
  roles: z.array(z.string()).default([]),
  label: z.string().min(1),
  description: z.string().default(""),
  formula: z.string().optional(),
  sources: z.array(z.string()).default([]),
  freshness: z.enum(["live", "hourly", "daily", "period"]).default("live"),
  unit: metricUnitSchema,
  aggregation: z
    .enum(["sum", "avg", "last", "max", "min", "ratio"])
    .default("last"),
  priority: z.number().int().min(1).max(100).default(50),
  drilldown: z.string().optional(),
  confidence: z.enum(["low", "medium", "high"]).optional(),
  visibility: metricVisibilitySchema.default("default"),
  /** Intelligence classification for this metric when shown */
  intelligenceClass: z
    .enum(["KNOWN", "MISSED", "PREDICTED", "ACTIONABLE", "VERIFIED"])
    .default("KNOWN"),
});
export type MetricDefinition = z.infer<typeof metricDefinitionSchema>;
