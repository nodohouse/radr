import { NextResponse } from "next/server";
import { z } from "zod";
import {
  DEMO_ACCESS_COOKIE,
  DEMO_ACCESS_SECONDS,
  createDemoGrant,
  demoSessionReady,
} from "@/lib/identity/demoSession";
import { clientKeyFromRequest, rateLimit } from "@/lib/security/rate-limit";
import {
  readJsonWithinLimit,
  RequestBodyError,
} from "@/lib/security/request-body";
import { sameOriginMutation } from "@/lib/onboarding/requiredFields";

export const runtime = "nodejs";
const accessSchema = z
  .object({ vertical: z.enum(["restaurant", "hotel"]) })
  .strict();
const reply = (body: unknown, status: number) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Preview-only entry: contact details never leave the browser or create an account. */
export async function POST(request: Request) {
  if (!request.headers.get("origin") || !sameOriginMutation(request))
    return reply({ error: "Invalid request origin." }, 403);
  const limit = rateLimit({
    key: clientKeyFromRequest(request, "demo-access"),
    limit: 10,
    windowMs: 60000,
  });
  if (!limit.ok)
    return NextResponse.json(
      { error: "Please try again in a minute." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(limit.retryAfterSec),
        },
      },
    );
  let body: unknown;
  try {
    body = await readJsonWithinLimit(request, 2000);
  } catch (error) {
    return reply(
      { error: "Check your demo selection." },
      error instanceof RequestBodyError ? error.status : 400,
    );
  }
  const parsed = accessSchema.safeParse(body);
  if (!parsed.success)
    return reply({ error: "Choose a hotel or restaurant demo." }, 400);
  if (!demoSessionReady())
    return reply(
      {
        error:
          "Demo access is temporarily unavailable. Please try again shortly.",
      },
      503,
    );
  const response = reply(
    {
      ok: true,
      next: `/app/enter?vertical=${parsed.data.vertical}&go=1`,
      contactDetailsSaved: false,
    },
    200,
  );
  response.cookies.set(DEMO_ACCESS_COOKIE, createDemoGrant(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_ACCESS_SECONDS,
  });
  return response;
}
