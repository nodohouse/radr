import { NextResponse } from "next/server";
import { getAuthIdentity } from "@/lib/identity/provider";
import { AuthzError, requirePermission } from "@/lib/authz";
import { sameOriginMutation } from "@/lib/onboarding/requiredFields";
import {
  readJsonWithinLimit,
  RequestBodyError,
} from "@/lib/security/request-body";
import { clientKeyFromRequest, rateLimit } from "@/lib/security/rate-limit";
import {
  outcomeInput,
  OutcomeConflict,
  recordReviewedOutcome,
} from "@/lib/outcomes/service";
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: Request) {
  if (!sameOriginMutation(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers },
    );
  const identity = await getAuthIdentity();
  if (!identity)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers },
    );
  const limit = rateLimit({
    key: clientKeyFromRequest(request, `outcomes:${identity.userId}`),
    limit: 12,
    windowMs: 60000,
  });
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { ...headers, "Retry-After": String(limit.retryAfterSec) },
      },
    );
  // A serverless temporary filesystem must never masquerade as durable storage.
  if (
    process.env.NODE_ENV === "production" &&
    !/^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL || "")
  )
    return NextResponse.json(
      { error: "Outcome storage is not configured." },
      { status: 503, headers },
    );
  try {
    const parsed = outcomeInput.safeParse(
      await readJsonWithinLimit(request, 16000),
    );
    if (!parsed.success)
      return NextResponse.json(
        { error: "Complete the outcome, evidence and review fields." },
        { status: 400, headers },
      );
    await requirePermission(
      identity.userId,
      parsed.data.organizationId,
      "decision.approve",
      parsed.data.locationId,
    );
    const result = await recordReviewedOutcome(parsed.data, identity.userId);
    return NextResponse.json(result, {
      status: result.replayed ? 200 : 201,
      headers,
    });
  } catch (error) {
    if (error instanceof AuthzError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers },
      );
    if (error instanceof RequestBodyError)
      return NextResponse.json(
        { error: "Invalid request." },
        { status: error.status, headers },
      );
    if (error instanceof OutcomeConflict)
      return NextResponse.json(
        { error: error.message },
        { status: 409, headers },
      );
    return NextResponse.json(
      { error: "Outcome could not be saved. Please retry." },
      { status: 503, headers },
    );
  }
}
