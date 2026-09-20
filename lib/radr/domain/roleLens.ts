/**
 * RoleLens — what this person decides, already knows, misses, and needs predicted.
 * Extends demo RoleProfile without replacing RBAC.
 */

import { z } from "zod";

export const controlCenterModuleSchema = z.enum([
  "house_brief",
  "overnight",
  "in_house",
  "attention",
  "handling",
  "arrival_moments",
  "property_units",
  "revenue_pace",
  "channel_mix",
  "housekeeping_board",
  "financial_exceptions",
  "contribution",
  "fleet_health",
  "kitchen_pressure",
  "pre_shift",
  "turnover_board",
  "orphan_nights",
  "portfolio_strip",
  "predictions",
]);
export type ControlCenterModule = z.infer<typeof controlCenterModuleSchema>;

export const roleLensSchema = z.object({
  roleId: z.string().min(1),
  verticals: z.array(z.string()).min(1),
  primaryResponsibility: z.string().min(1),
  decisions: z.array(z.string()).default([]),
  knownMetrics: z.array(z.string()).default([]),
  missedSignals: z.array(z.string()).default([]),
  predictedSignals: z.array(z.string()).default([]),
  controlCenterModules: z.array(controlCenterModuleSchema).default([]),
  typicalActions: z.array(z.string()).default([]),
  verifiedOutcomes: z.array(z.string()).default([]),
  /** Metric definition ids to surface by default */
  metricIds: z.array(z.string()).default([]),
  /** Prediction types this role may see */
  predictionTypes: z.array(z.string()).default([]),
});
export type RoleLens = z.infer<typeof roleLensSchema>;
