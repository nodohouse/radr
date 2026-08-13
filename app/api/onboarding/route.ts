import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createOrganizationWithLocation, userHasOrganization } from "@/lib/onboarding";
import { onboardingSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await userHasOrganization(session.user.id)) {
    return NextResponse.json(
      { error: "Onboarding already completed" },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await createOrganizationWithLocation({
    userId: session.user.id,
    input: parsed.data,
  });

  return NextResponse.json({ ok: true, ...result });
}
