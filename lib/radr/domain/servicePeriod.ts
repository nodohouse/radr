/**
 * Service Period foundation - bounded hospitality operating window.
 * Not the full Service Twin. Findings may reference a period id.
 */

import { z } from "zod";

export const servicePeriodTypeSchema = z.enum([
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "LATE",
  "EVENT",
  "HOTEL_DAY",
  "CUSTOM",
]);
export type ServicePeriodType = z.infer<typeof servicePeriodTypeSchema>;

export const servicePeriodStatusSchema = z.enum([
  "PLANNED",
  "ACTIVE",
  "CLOSED",
  "CANCELLED",
]);
export type ServicePeriodStatus = z.infer<typeof servicePeriodStatusSchema>;

export const servicePeriodSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),
  date: z.string().min(1),
  type: servicePeriodTypeSchema,
  label: z.string().optional(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  expectedCovers: z.number().nonnegative().optional(),
  actualCovers: z.number().nonnegative().optional(),
  expectedRevenue: z.number().optional(),
  actualRevenue: z.number().optional(),
  laborScheduled: z.number().optional(),
  laborActual: z.number().optional(),
  capacity: z.number().optional(),
  cancellations: z.number().int().nonnegative().optional(),
  waitlistDemand: z.number().int().nonnegative().optional(),
  weatherContext: z.string().optional(),
  eventContext: z.string().optional(),
  status: servicePeriodStatusSchema.default("PLANNED"),
  currency: z.string().min(3).max(3).default("EUR"),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type ServicePeriod = z.infer<typeof servicePeriodSchema>;

export function parseServicePeriod(input: unknown): ServicePeriod {
  return servicePeriodSchema.parse(input);
}

/** Canonical Berlin dinner window for the demo clock. */
export function demoBerlinDinnerPeriod(): ServicePeriod {
  return servicePeriodSchema.parse({
    id: "sp_ber_2026-08-19_dinner",
    organizationId: "org_northstar",
    locationId: "loc_ber",
    date: "2026-08-19",
    type: "DINNER",
    label: "Dinner",
    startTime: "2026-08-19T17:00:00+02:00",
    endTime: "2026-08-19T23:00:00+02:00",
    expectedCovers: 184,
    capacity: 96,
    waitlistDemand: 3,
    cancellations: 1,
    weatherContext: "Warm dry evening · terrace demand elevated tomorrow",
    status: "ACTIVE",
    currency: "EUR",
    createdAt: "2026-08-19T12:00:00+02:00",
    updatedAt: "2026-08-19T17:30:00+02:00",
  });
}
