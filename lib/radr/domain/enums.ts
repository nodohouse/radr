import { z } from "zod";

export const territorySchema = z.enum(["BUY", "LABOR", "SELL", "RECOVER"]);
export type Territory = z.infer<typeof territorySchema>;

export const findingStatusSchema = z.enum([
  "DETECTED",
  "OPEN",
  "REVIEWED",
  "ACTIONED",
  "MONITORING",
  "RESOLVED",
  "VERIFIED",
  "DISMISSED",
]);
export type FindingStatus = z.infer<typeof findingStatusSchema>;

export const findingUrgencySchema = z.enum(["ACT_NOW", "TODAY", "WATCH"]);
export type FindingUrgency = z.infer<typeof findingUrgencySchema>;

export const confidenceBandSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type ConfidenceBand = z.infer<typeof confidenceBandSchema>;

export const actionStatusSchema = z.enum([
  "PROPOSED",
  "ACCEPTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
/** Governance mapping for product copy: APPROVED→ACCEPTED, EXECUTING→IN_PROGRESS. FAILED is recorded as CANCELLED + failure note until schema extends. */
export type ActionStatus = z.infer<typeof actionStatusSchema>;

export const attributionSchema = z.enum([
  "NATURAL",
  "OPERATOR",
  "RADR_RECOMMENDED",
  "UNCERTAIN",
]);
export type Attribution = z.infer<typeof attributionSchema>;

/**
 * How strongly verified value can be attributed to a RADR action.
 * DIRECT: action ↔ transaction linked.
 * SUPPORTED: strong evidence, imperfect causality.
 * ESTIMATED: modeled impact only - never claim as Verified Value.
 */
export const verificationStrengthSchema = z.enum([
  "DIRECT",
  "SUPPORTED",
  "ESTIMATED",
]);
export type VerificationStrength = z.infer<typeof verificationStrengthSchema>;

export const reservationStatusSchema = z.enum([
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
  "unknown",
]);
export type DomainReservationStatus = z.infer<typeof reservationStatusSchema>;

export const waitlistStatusSchema = z.enum([
  "waiting",
  "notified",
  "seated",
  "expired",
  "cancelled",
  "matched",
]);
export type WaitlistStatus = z.infer<typeof waitlistStatusSchema>;

/** Display labels for urgency (UI chrome). */
export const URGENCY_LABEL: Record<FindingUrgency, string> = {
  ACT_NOW: "ACT NOW",
  TODAY: "TODAY",
  WATCH: "WATCH",
};
