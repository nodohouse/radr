import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  createOrganizationWithLocation,
  getWorkspaceForUser,
  patchOnboardingState,
  userHasOrganization,
} from "@/lib/onboarding";
import { onboardingPatchSchema, onboardingSchema } from "@/lib/validation";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { CLIENT_ERRORS } from "@/lib/security/errors";
import {
  clientKeyFromRequest,
  rateLimit,
} from "@/lib/security/rate-limit";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.unauthorized },
      { status: 401 },
    );
  }
  const workspace = await getWorkspaceForUser(session.user.id);
  return NextResponse.json({
    ok: true,
    workspace,
    hasOrganization: Boolean(workspace),
  });
}

export async function POST(request: Request) {
  const rl = rateLimit({
    key: clientKeyFromRequest(request, "onboarding-post"),
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.rateLimited },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.unauthorized },
      { status: 401 },
    );
  }

  if (await userHasOrganization(session.user.id)) {
    return NextResponse.json(
      { error: "Workspace already created" },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: CLIENT_ERRORS.badRequest },
      { status: 400 },
    );
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.badRequest },
      { status: 400 },
    );
  }

  const result = await createOrganizationWithLocation({
    userId: session.user.id,
    input: parsed.data,
  });

  return NextResponse.json({ ok: true, ...result });
}

export async function PATCH(request: Request) {
  const rl = rateLimit({
    key: clientKeyFromRequest(request, "onboarding-patch"),
    limit: 40,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.rateLimited },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.unauthorized },
      { status: 401 },
    );
  }

  const workspace = await getWorkspaceForUser(session.user.id);
  if (!workspace) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.notFound },
      { status: 404 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: CLIENT_ERRORS.badRequest },
      { status: 400 },
    );
  }

  const parsed = onboardingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.badRequest },
      { status: 400 },
    );
  }

  // Soft UI flags: any member. Structural fields: OWNER/ADMIN only.
  const softKeys = new Set([
    "tourDismissed",
    "checklistDismissed",
    "firstWelcomeSeen",
  ]);
  const keys = Object.keys(parsed.data);
  const hasStructural = keys.some((k) => !softKeys.has(k));
  if (
    hasStructural &&
    workspace.role !== "OWNER" &&
    workspace.role !== "ADMIN"
  ) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.forbidden },
      { status: 403 },
    );
  }

  const next = await patchOnboardingState(
    workspace.organizationId,
    parsed.data as Partial<import("@/lib/onboarding/types").OnboardingState>,
  );

  if (parsed.data.demoEnabled) {
    trackOnboarding("demo_selected", {}, workspace.organizationId);
  }
  if (parsed.data.step === "done" || parsed.data.completedAt) {
    trackOnboarding("onboarding_completed", {}, workspace.organizationId);
  }
  if (parsed.data.tourDismissed) {
    trackOnboarding("tour_dismissed", {}, workspace.organizationId);
  }
  if (parsed.data.checklistDismissed) {
    trackOnboarding("checklist_dismissed", {}, workspace.organizationId);
  }

  return NextResponse.json({ ok: true, onboarding: next });
}
