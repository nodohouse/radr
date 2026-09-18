/**
 * Extended Location profile fields for RADR operating definitions.
 * Complements Drizzle `locations` table.
 */

import { z } from "zod";

export const locationProfileSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  name: z.string().min(1),
  city: z.string().optional().nullable(),
  country: z.string().min(1),
  timezone: z.string().min(1),
  currency: z.string().min(3).max(3),
  reportingCurrency: z.string().min(3).max(3).optional().nullable(),
  seatCount: z.number().int().positive().optional().nullable(),
  groupBookingThreshold: z.number().int().positive().optional().nullable(),
  cancellationWindowHours: z.number().positive().optional().nullable(),
  /** Opaque JSON configs - never bury metric definitions only in code. */
  servicePeriods: z.unknown().optional().nullable(),
  openingHours: z.unknown().optional().nullable(),
  expectedSpendProfile: z.unknown().optional().nullable(),
  operatingMarginDefinition: z.unknown().optional().nullable(),
  laborCostDefinition: z.unknown().optional().nullable(),
});

export type LocationProfile = z.infer<typeof locationProfileSchema>;
