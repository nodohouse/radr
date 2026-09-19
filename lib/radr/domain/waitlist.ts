/**
 * Canonical WaitlistEntry - recovery / demand / pressure signal.
 */

import { z } from "zod";
import { waitlistStatusSchema } from "./enums";

export const waitlistEntrySchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),

  externalId: z.string().min(1),
  provider: z.string().optional(),

  requestedServiceTime: z.string().min(1),
  partySize: z.number().int().positive(),
  status: waitlistStatusSchema,

  quotedWaitMinutes: z.number().int().nonnegative().optional().nullable(),
  actualWaitMinutes: z.number().int().nonnegative().optional().nullable(),
  seatingPreference: z.string().optional().nullable(),

  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),

  matchedReservationId: z.string().optional().nullable(),

  /** Economics helpers for recovery engine (Phase 7). */
  expectedValue: z.number().optional(),
  convertProbability: z.number().min(0).max(1).optional(),
});

export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>;

export function parseWaitlistEntry(input: unknown): WaitlistEntry {
  return waitlistEntrySchema.parse(input);
}
