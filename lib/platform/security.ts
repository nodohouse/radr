/**
 * Security helpers - webhook signatures, headers. No fake certifications.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function signWebhookPayload(
  payload: string,
  secret: string,
): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyWebhookSignature(input: {
  payload: string;
  secret: string;
  signature: string;
}): boolean {
  const expected = signWebhookPayload(input.payload, input.secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(input.signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Baseline secure headers for app responses (document + apply in middleware later). */
export const SECURE_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

/**
 * Privacy: fields that must not be ingested for reservations by default.
 */
export const RESERVATION_PII_BLOCKLIST = [
  "guestName",
  "guest_name",
  "email",
  "phone",
  "mobile",
  "privateNotes",
  "private_notes",
  "specialRequests",
] as const;

export function stripReservationPii<T extends Record<string, unknown>>(
  payload: T,
): Partial<T> {
  const out: Record<string, unknown> = { ...payload };
  for (const key of RESERVATION_PII_BLOCKLIST) {
    delete out[key];
  }
  return out as Partial<T>;
}
