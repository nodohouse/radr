import { NextResponse } from "next/server";
import { z } from "zod";
import { AuthzError, requireAuthIdentity, setActiveOrganizationCookie } from "@/lib/authz";
import {
  acceptInvitation,
  createInvitation,
  getPendingInvitationByToken,
  revokeInvitation,
} from "@/lib/identity/invitations";

const createSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  roleId: z.string().min(1),
  locationScope: z.enum(["all", "group", "locations"]).optional(),
  locationIds: z.array(z.string()).optional(),
  groupId: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const identity = await requireAuthIdentity({ redirectToLogin: false });
    const body = createSchema.parse(await request.json());
    const { invitation, rawToken } = await createInvitation({
      actorUserId: identity.userId,
      organizationId: body.organizationId,
      email: body.email,
      roleId: body.roleId,
      locationScope: body.locationScope,
      locationIds: body.locationIds,
      groupId: body.groupId,
    });

    // Raw token returned once — client/email delivery owns it. Never log.
    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
      token: rawToken,
      acceptPath: `/invite/accept?token=${encodeURIComponent(rawToken)}`,
    });
  } catch (e) {
    if (e instanceof AuthzError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw e;
  }
}

const acceptSchema = z.object({
  token: z.string().min(10),
});

export async function PUT(request: Request) {
  try {
    const identity = await requireAuthIdentity({ redirectToLogin: false });
    const body = acceptSchema.parse(await request.json());
    const pending = await getPendingInvitationByToken(body.token);
    if (!pending) {
      return NextResponse.json(
        { error: "Invitation invalid or expired" },
        { status: 400 },
      );
    }
    const result = await acceptInvitation({
      rawToken: body.token,
      userId: identity.userId,
      userEmail: identity.email,
    });
    await setActiveOrganizationCookie(result.organizationId);
    return NextResponse.json({
      organizationId: result.organizationId,
      membershipId: result.membershipId,
      next: "/app",
    });
  } catch (e) {
    if (e instanceof AuthzError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw e;
  }
}

const revokeSchema = z.object({
  organizationId: z.string().min(1),
  invitationId: z.string().min(1),
});

export async function DELETE(request: Request) {
  try {
    const identity = await requireAuthIdentity({ redirectToLogin: false });
    const body = revokeSchema.parse(await request.json());
    await revokeInvitation({
      actorUserId: identity.userId,
      organizationId: body.organizationId,
      invitationId: body.invitationId,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AuthzError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    throw e;
  }
}
