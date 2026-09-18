/**
 * Verified Work - concrete finished work units, not invented hours saved.
 */

import { z } from "zod";

export const verifiedWorkTypeSchema = z.enum([
  "INVOICE_RECONCILED",
  "SUPPLIER_DISCREPANCY_INVESTIGATED",
  "SUPPLIER_CLAIM_PREPARED",
  "CANCELLATION_MATCHED",
  "OPERATING_BRIEF_ASSEMBLED",
  "STAFFING_ADJUSTMENT_PREPARED",
  "EXCEPTION_RESOLVED",
]);
export type VerifiedWorkType = z.infer<typeof verifiedWorkTypeSchema>;

export const verifiedWorkStatusSchema = z.enum([
  "COMPLETED",
  "RETAINED",
]);
export type VerifiedWorkStatus = z.infer<typeof verifiedWorkStatusSchema>;

export const verifiedWorkEventSchema = z.object({
  id: z.string().min(1),
  organizationId: z.string().min(1),
  locationId: z.string().min(1),
  findingId: z.string().optional(),
  workType: verifiedWorkTypeSchema,
  status: verifiedWorkStatusSchema.default("COMPLETED"),
  count: z.number().int().positive().default(1),
  label: z.string().min(1),
  evidenceRefs: z.array(z.string()).default([]),
  completedAt: z.string().min(1),
});

export type VerifiedWorkEvent = z.infer<typeof verifiedWorkEventSchema>;

const memory = new Map<string, VerifiedWorkEvent>();

export function recordVerifiedWork(
  input: z.input<typeof verifiedWorkEventSchema>,
): VerifiedWorkEvent {
  const event = verifiedWorkEventSchema.parse(input);
  memory.set(event.id, event);
  return event;
}

export function listVerifiedWork(organizationId: string): VerifiedWorkEvent[] {
  return [...memory.values()].filter(
    (e) => e.organizationId === organizationId,
  );
}

export function verifiedWorkSummary(organizationId: string): {
  totalEvents: number;
  byType: Partial<Record<VerifiedWorkType, number>>;
} {
  const events = listVerifiedWork(organizationId);
  const byType: Partial<Record<VerifiedWorkType, number>> = {};
  for (const e of events) {
    byType[e.workType] = (byType[e.workType] ?? 0) + e.count;
  }
  return { totalEvents: events.length, byType };
}

/** Seed demo work for Northstar without inventing time savings. */
export function seedDemoVerifiedWork(): VerifiedWorkEvent[] {
  const org = "org_northstar";
  const loc = "loc_ber";
  const seeds: z.input<typeof verifiedWorkEventSchema>[] = [
    {
      id: "vw_brief_1",
      organizationId: org,
      locationId: loc,
      workType: "OPERATING_BRIEF_ASSEMBLED",
      label: "Morning operating brief assembled",
      count: 1,
      completedAt: "2026-08-19T08:05:00+02:00",
    },
    {
      id: "vw_inv_1",
      organizationId: org,
      locationId: loc,
      findingId: "fnd_buy_loc_ber",
      workType: "SUPPLIER_DISCREPANCY_INVESTIGATED",
      label: "Supplier invoice variance investigated",
      count: 1,
      evidenceRefs: ["ev_inv", "ev_contract"],
      completedAt: "2026-08-19T16:10:00+02:00",
    },
    {
      id: "vw_claim_1",
      organizationId: org,
      locationId: loc,
      findingId: "fnd_buy_loc_ber",
      workType: "SUPPLIER_CLAIM_PREPARED",
      label: "Supplier credit claim prepared",
      count: 1,
      completedAt: "2026-08-19T16:12:00+02:00",
    },
    {
      id: "vw_cancel_1",
      organizationId: org,
      locationId: loc,
      findingId: "fnd_cancel_recovery_t14",
      workType: "CANCELLATION_MATCHED",
      label: "Cancelled reservation matched to waitlist",
      count: 1,
      completedAt: "2026-08-18T18:05:00+02:00",
    },
    {
      id: "vw_staff_1",
      organizationId: org,
      locationId: loc,
      findingId: "pf_labor_peak",
      workType: "STAFFING_ADJUSTMENT_PREPARED",
      label: "Peak FOH coverage adjustment prepared",
      count: 1,
      completedAt: "2026-08-19T16:40:00+02:00",
    },
  ];
  return seeds.map((s) => recordVerifiedWork(s));
}

export function __resetVerifiedWorkMemory(): void {
  memory.clear();
}
