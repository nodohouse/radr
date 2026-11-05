import { NextResponse } from "next/server";
import {
  readJsonWithinLimit,
  RequestBodyError,
} from "@/lib/security/request-body";
import { randomUUID } from "node:crypto";
import { sameOriginMutation } from "@/lib/onboarding/requiredFields";
import { clientKeyFromRequest, rateLimit } from "@/lib/security/rate-limit";
import {
  createReportGrant,
  reportDeliveryReady,
  reportLeadSchema,
  REPORT_COOKIE,
  REPORT_TTL_SECONDS,
} from "@/lib/marketing/reportGate";
import { PRIVACY_NOTICE_VERSION } from "@/lib/privacy/disclosures";
import { HOSPITALITY_REPORT } from "@/lib/marketing/report";
export const runtime = "nodejs";
const reply = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  if (!sameOriginMutation(request))
    return reply({ error: "Invalid request origin." }, 403);
  const limit = rateLimit({
    key: clientKeyFromRequest(request, "report-lead"),
    limit: 5,
    windowMs: 60000,
  });
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSec),
          "Cache-Control": "no-store",
        },
      },
    );
  let body: unknown;
  try {
    body = await readJsonWithinLimit(request, 12000);
  } catch (error) {
    if (error instanceof RequestBodyError && error.status === 413)
      return reply({ error: "The request is too large." }, 413);
    return reply({ error: "Please check the required fields." }, 400);
  }
  const parsed = reportLeadSchema.safeParse(body);
  if (!parsed.success || parsed.data.website)
    return reply(
      {
        error: "Please complete the required fields.",
      },
      400,
    );
  if (!reportDeliveryReady())
    return reply(
      {
        error:
          "Report requests are not available yet. Please try again shortly. Your details have not been submitted.",
      },
      503,
    );
  const requestId = parsed.data.requestId || randomUUID();
  const { website, ...lead } = parsed.data;
  void website;
  try {
    const response = await fetch(
      (process.env.REPORT_LEAD_WEBHOOK_URL || process.env.CONTACT_WEBHOOK_URL)!,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": requestId,
          ...(process.env.REPORT_LEAD_WEBHOOK_TOKEN
            ? {
                Authorization: `Bearer ${process.env.REPORT_LEAD_WEBHOOK_TOKEN}`,
              }
            : {}),
        },
        body: JSON.stringify({
          ...lead,
          interest: lead.requestContact
            ? "report-and-sales-follow-up"
            : "playbook-download",
          source: "radr-report",
          reportId: HOSPITALITY_REPORT.id,
          receivedAt: new Date().toISOString(),
          requestId,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          followUpRequested: lead.requestContact,
        }),
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok)
      return reply(
        {
          error:
            "Your request could not be delivered. Please try again. The report has not been unlocked.",
        },
        502,
      );
  } catch {
    return reply(
      {
        error:
          "Your request could not be delivered. Please try again. The report has not been unlocked.",
      },
      502,
    );
  }
  const response = reply(
    { ok: true, downloadUrl: "/api/reports/download" },
    200,
  );
  response.cookies.set(REPORT_COOKIE, createReportGrant(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/reports",
    maxAge: REPORT_TTL_SECONDS,
  });
  return response;
}
