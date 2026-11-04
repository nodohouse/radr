import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { HOSPITALITY_REPORT } from "./report";
export const REPORT_COOKIE = "radr_report_access";
export const REPORT_TTL_SECONDS = 30 * 60;
export const reportLeadSchema = z
  .object({
    requestId: z.string().uuid().optional(),
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(254),
    company: z.string().trim().min(2).max(200),
    role: z.enum([
      "owner",
      "finance",
      "operations",
      "general-manager",
      "other",
    ]),
    locations: z.enum(["1", "2-5", "6-20", "21-50", "50+"]),
    requestContact: z.boolean().default(false),
    marketingOptIn: z.boolean().default(false),
    website: z.string().max(200).optional().default(""),
  })
  .strict();
export function reportDeliveryReady() {
  return Boolean(
    (process.env.REPORT_LEAD_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL) &&
      reportSigningKey(),
  );
}
function reportSigningKey() {
  const secret =
    process.env.REPORT_DOWNLOAD_SECRET || process.env.BETTER_AUTH_SECRET;
  return secret
    ? createHmac("sha256", secret).update("radr:report-download:v1").digest()
    : null;
}
export function createReportGrant(now = Date.now()) {
  const key = reportSigningKey();
  if (!key) throw new Error("Report download signing is not configured");
  const data = Buffer.from(
    JSON.stringify({
      report: HOSPITALITY_REPORT.id,
      expires: now + REPORT_TTL_SECONDS * 1000,
      nonce: randomUUID(),
    }),
  ).toString("base64url");
  return `${data}.${createHmac("sha256", key).update(data).digest("base64url")}`;
}
export function verifyReportGrant(token: string | undefined, now = Date.now()) {
  const key = reportSigningKey();
  if (!key || !token || token.length > 1024) return false;
  try {
    const [data, signature, ...rest] = token.split(".");
    if (!data || !signature || rest.length) return false;
    const actual = Buffer.from(signature, "base64url");
    const expected = createHmac("sha256", key).update(data).digest();
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return false;
    const body = JSON.parse(Buffer.from(data, "base64url").toString());
    return (
      body.report === HOSPITALITY_REPORT.id &&
      typeof body.nonce === "string" &&
      Number.isFinite(body.expires) &&
      body.expires > now &&
      body.expires <= now + REPORT_TTL_SECONDS * 1000
    );
  } catch {
    return false;
  }
}
