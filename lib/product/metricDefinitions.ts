/**
 * Metric definitions: thin compatibility layer over centralized terminology.
 * Prefer importing from `@/lib/radr/terminology` for new work.
 */

import {
  TERMINOLOGY,
  type TermDefinition,
  type TermId,
} from "@/lib/radr/terminology";

export type MetricDefinition = TermDefinition;

/** @deprecated Prefer TERMINOLOGY / TermId. Kept for existing MetricExplain call sites */
export const METRIC_DEFINITIONS = TERMINOLOGY;

export type MetricId = TermId;
