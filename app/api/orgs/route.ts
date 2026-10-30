import { NextResponse } from "next/server";
import { z } from "zod";
import {
  listMembershipsForUser,
  requireAuthIdentity,
  setActiveOrganizationCookie,
} from "@/lib/authz";
import { resolvePostAuthDestination } from "@/lib/identity/postAuth";

const selectSchema = z.object({
  organizationId: z.string().min(1),
});

/** List memberships + resolve post-auth destination. */
export async function GET() {
  const identity = await requireAuthIdentity({ redirectToLogin: false });
  const memberships = await listMembershipsForUser(identity.userId);
  const destination = await resolvePostAuthDestination(identity);
  return NextResponse.json({
    organizations: memberships.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      roleId: m.membership.roleId,
    })),
    destination,
  });
}

/** Select active organization. */
export async function POST(request: Request) {
  const identity = await requireAuthIdentity({ redirectToLogin: false });
  const body = selectSchema.parse(await request.json());
  const memberships = await listMembershipsForUser(identity.userId);
  const match = memberships.find((m) => m.organization.id === body.organizationId);
  if (!match) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }
  await setActiveOrganizationCookie(body.organizationId);
  return NextResponse.json({ ok: true, organizationId: body.organizationId });
}
