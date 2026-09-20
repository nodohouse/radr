/**
 * Operating Unit — capacity / revenue / labor cell inside a Location.
 * Organization → Location → OperatingUnit.
 */

import { z } from "zod";

export const operatingUnitTypeSchema = z.enum([
  "ROOMS",
  "RESTAURANT",
  "BAR",
  "CAFE",
  "DELIVERY",
  "SPA",
  "EVENTS",
  "BANQUETING",
  "VACATION_RENTAL",
  "SERVICED_APARTMENTS",
  "HOUSEKEEPING",
  "BREAKFAST",
  "OTHER",
]);
export type OperatingUnitType = z.infer<typeof operatingUnitTypeSchema>;

export const inventoryKindSchema = z.enum([
  "table",
  "seat",
  "private_room",
  "terrace",
  "bar_seat",
  "room",
  "room_night",
  "bed",
  "unit",
  "unit_night",
  "treatment_slot",
  "therapist_hour",
  "event_slot",
  "event_seat",
  "other",
]);
export type InventoryKind = z.infer<typeof inventoryKindSchema>;

export const operatingUnitSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),
  unitType: operatingUnitTypeSchema,
  label: z.string().min(1),
  inventoryKind: inventoryKindSchema,
  /** Nominal capacity (tables, rooms, slots, …). */
  capacity: z.number().nonnegative().optional(),
  revenueStreams: z.array(z.string()).default([]),
  laborGroups: z.array(z.string()).default([]),
  /** Optional HH:MM local windows, opaque for now. */
  operatingHours: z
    .object({
      open: z.string().optional(),
      close: z.string().optional(),
    })
    .optional(),
  kpiKeys: z.array(z.string()).default([]),
  phaseKeys: z.array(z.string()).default([]),
  connectedSystemFamilies: z.array(z.string()).default([]),
});

export type OperatingUnit = z.infer<typeof operatingUnitSchema>;

export function parseOperatingUnit(input: unknown): OperatingUnit {
  return operatingUnitSchema.parse(input);
}
