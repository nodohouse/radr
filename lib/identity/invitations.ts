/**
 * Organization invitations — token hashed at rest, expire + revoke supported.
 */

import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invitations,
  locationAccess,
  organizationMembers,
  type Invitation,
} from "@/lib/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { AuthzError, assertLocationsInOrganization, requirePermission } from "@/lib/authz";
import { newId } from "@/lib/ids";
import { ROLE_BY_ID, type RoleKey } from "@/lib/platform/rbac";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function hashInviteToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function generateInviteToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashInviteToken(raw) };
}

export async function createInvitation(params: {
  actorUserId: string;
  organizationId: string;
  email: string;
  roleId: string;
  locationScope?: "all" | "group" | "locations";
  locationIds?: string[];
  groupId?: string | null;
}): Promise<{ invitation: Invitation; rawToken: string }> {
  await requirePermission(params.actorUserId, params.organizationId, "user.invite");

  if (!ROLE_BY_ID[params.roleId]) {
    throw new AuthzError("Invalid role", 400);
  }
  // Prevent privilege escalation to owner unless actor is owner
  if (params.roleId === "role_owner") {
    const { roleId: actorRole } = await requirePermission(
      params.actorUserId,
      params.organizationId,
      "org.admin",
    );
    if (actorRole !== "role_owner") {
      throw new AuthzError("Only owners can invite owners", 403);
    }
  }

  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) {
    throw new AuthzError("Invalid email", 400);
  }

  const scope = params.locationScope ?? "all";
  const locationIds = params.locationIds ?? [];
  if (scope === "locations") {
    await assertLocationsInOrganization(params.organizationId, locationIds);
  }

  const { raw, hash } = generateInviteToken();
  const now = new Date();
  const id = newId();

  const [invitation] = await db
    .insert(invitations)
    .values({
      id,
      organizationId: params.organizationId,
      email,
      roleId: params.roleId,
      tokenHash: hash,
      status: "pending",
      locationScope: scope,
      locationIds,
      groupId: params.groupId ?? null,
      invitedBy: params.actorUserId,
      expiresAt: new Date(now.getTime() + INVITE_TTL_MS),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await writeAuditLog({
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    action: "INVITATION_CREATED",
    resourceType: "invitation",
    resourceId: id,
    metadata: { email, roleId: params.roleId },
  });

  return { invitation: invitation!, rawToken: raw };
}

export async function getPendingInvitationByToken(
  rawToken: string,
): Promise<Invitation | null> {
  const hash = hashInviteToken(rawToken);
  const now = new Date();
  const [row] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.tokenHash, hash),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, now),
        isNull(invitations.revokedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listPendingInvitationsForEmail(
  email: string,
): Promise<Invitation[]> {
  const normalized = email.trim().toLowerCase();
  const now = new Date();
  return db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, normalized),
        eq(invitations.status, "pending"),
        gt(invitations.expiresAt, now),
      ),
    );
}

export async function acceptInvitation(params: {
  rawToken: string;
  userId: string;
  userEmail: string;
}): Promise<{ organizationId: string; membershipId: string }> {
  const invitation = await getPendingInvitationByToken(params.rawToken);
  if (!invitation) {
    throw new AuthzError("Invitation invalid or expired", 400);
  }

  const email = params.userEmail.trim().toLowerCase();
  if (email !== invitation.email) {
    throw new AuthzError(
      "Signed-in email does not match this invitation",
      403,
    );
  }

  const existing = await db
    .select({ id: organizationMembers.id })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, invitation.organizationId),
        eq(organizationMembers.userId, params.userId),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(invitations)
      .set({
        status: "accepted",
        acceptedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(invitations.id, invitation.id));
    return {
      organizationId: invitation.organizationId,
      membershipId: existing[0].id,
    };
  }

  const membershipId = newId();
  const now = new Date();
  const legacyRole =
    invitation.roleId === "role_owner"
      ? "OWNER"
      : invitation.roleId === "role_admin"
        ? "ADMIN"
        : "MEMBER";

  await db.insert(organizationMembers).values({
    id: membershipId,
    organizationId: invitation.organizationId,
    userId: params.userId,
    role: legacyRole,
    roleId: invitation.roleId,
    status: "active",
    invitedBy: invitation.invitedBy,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(locationAccess).values({
    id: newId(),
    membershipId,
    scope: invitation.locationScope,
    groupId: invitation.groupId,
    locationIds: invitation.locationIds ?? [],
    createdAt: now,
    updatedAt: now,
  });

  await db
    .update(invitations)
    .set({
      status: "accepted",
      acceptedAt: now,
      updatedAt: now,
    })
    .where(eq(invitations.id, invitation.id));

  await writeAuditLog({
    organizationId: invitation.organizationId,
    actorUserId: params.userId,
    action: "INVITATION_ACCEPTED",
    resourceType: "invitation",
    resourceId: invitation.id,
    metadata: { membershipId },
  });

  await writeAuditLog({
    organizationId: invitation.organizationId,
    actorUserId: params.userId,
    action: "MEMBER_ADDED",
    resourceType: "membership",
    resourceId: membershipId,
    metadata: { roleId: invitation.roleId },
  });

  return { organizationId: invitation.organizationId, membershipId };
}

export async function revokeInvitation(params: {
  actorUserId: string;
  organizationId: string;
  invitationId: string;
}): Promise<void> {
  await requirePermission(params.actorUserId, params.organizationId, "user.invite");

  const [row] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.id, params.invitationId),
        eq(invitations.organizationId, params.organizationId),
      ),
    )
    .limit(1);

  if (!row) {
    throw new AuthzError("Not found", 404);
  }

  const now = new Date();
  await db
    .update(invitations)
    .set({
      status: "revoked",
      revokedAt: now,
      updatedAt: now,
    })
    .where(eq(invitations.id, params.invitationId));

  await writeAuditLog({
    organizationId: params.organizationId,
    actorUserId: params.actorUserId,
    action: "INVITATION_REVOKED",
    resourceType: "invitation",
    resourceId: params.invitationId,
    metadata: {},
  });
}

export function roleKeyFromId(roleId: string): RoleKey | null {
  return (ROLE_BY_ID[roleId]?.key as RoleKey) ?? null;
}
