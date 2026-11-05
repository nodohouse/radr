import { NextResponse } from "next/server";
import { z } from "zod";
import {
  listMembershipsForUser,
  setActiveOrganizationCookie,
} from "@/lib/authz";
import { getAuthIdentity } from "@/lib/identity/provider";
import { resolvePostAuthDestination } from "@/lib/identity/postAuth";
import { sameOriginMutation } from "@/lib/onboarding/requiredFields";
import {
  readJsonWithinLimit,
  RequestBodyError,
} from "@/lib/security/request-body";
const selectSchema = z
  .object({ organizationId: z.string().min(1).max(200) })
  .strict();
const privateHeaders = { "Cache-Control": "private, no-store" };
/** Memberships always come from the server identity, never a caller-supplied user. */
export async function GET() {
  const identity = await getAuthIdentity();
  if (!identity)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  const memberships = await listMembershipsForUser(identity.userId);
  const destination = await resolvePostAuthDestination(identity);
  return NextResponse.json(
    {
      organizations: memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        roleId: m.membership.roleId,
      })),
      destination,
    },
    { headers: privateHeaders },
  );
}
export async function POST(request: Request) {
  if (!sameOriginMutation(request))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403, headers: privateHeaders },
    );
  const identity = await getAuthIdentity();
  if (!identity)
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: privateHeaders },
    );
  let raw: unknown;
  try {
    raw = await readJsonWithinLimit(request, 4000);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request." },
      {
        status: error instanceof RequestBodyError ? error.status : 400,
        headers: privateHeaders,
      },
    );
  }
  const parsed = selectSchema.safeParse(raw);
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400, headers: privateHeaders },
    );
  const memberships = await listMembershipsForUser(identity.userId);
  if (
    !memberships.some((m) => m.organization.id === parsed.data.organizationId)
  )
    return NextResponse.json(
      { error: "Not a member" },
      { status: 403, headers: privateHeaders },
    );
  await setActiveOrganizationCookie(parsed.data.organizationId);
  return NextResponse.json(
    { ok: true, organizationId: parsed.data.organizationId },
    { headers: privateHeaders },
  );
}
