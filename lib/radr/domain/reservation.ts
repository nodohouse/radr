/**
 * Canonical Reservation - operational demand entity.
 * Avoid guest PII (name, phone, email, private notes) by default.
 */

import { z } from "zod";
import { reservationStatusSchema } from "./enums";

export const reservationSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),

  externalId: z.string().min(1),
  provider: z.string().min(1),

  serviceTime: z.string().min(1),
  partySize: z.number().int().positive(),
  status: reservationStatusSchema,

  bookingChannel: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  cancelledAt: z.string().optional().nullable(),
  noShowAt: z.string().optional().nullable(),

  tableIds: z.array(z.string()).default([]),
  sectionId: z.string().optional().nullable(),

  depositAmount: z.number().optional(),
  prepaidAmount: z.number().optional(),
  currency: z.string().min(3).max(3).optional(),

  groupBooking: z.boolean().default(false),
  specialBookingType: z.string().optional().nullable(),
  waitlistSourceId: z.string().optional().nullable(),

  /** Expected spend economics (derived / configured, not guest PII). */
  expectedSpendPerCover: z.number().optional(),
  expectedBookingValue: z.number().optional(),
});

export type DomainReservation = z.infer<typeof reservationSchema>;

export function parseReservation(input: unknown): DomainReservation {
  return reservationSchema.parse(input);
}
