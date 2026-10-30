/**
 * RADR domain authorization.
 * Uses IdentityProvider for identity — never better-auth session types.
 * Permissions + location scope are authoritative; role labels are not.
 */

import { and, eq, inArray } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  documents,
  locationAccess,
  locationGroupMembers,
  locations,
  organizationMembers,
  organizations,
  type Document,
  type MembershipRole,
  type Organization,
  type OrganizationMember,
} from "@/lib/db/schema";
import {
  getAuthIdentity,
  type AuthIdentity,
} from "@/lib/identity/provider";
import { ACTIVE_ORG_COOKIE } from "@/lib/identity/orgCookie";
import {
  legacyRoleToRoleId,
  roleHasPermission,
  type Permission,
} from "@/lib/platform/rbac";

export class AuthzError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthzError";
    this.status = status;
  }
}

export async function requireAuthIdentity(
  options: { redirectToLogin?: boolean } = {},
): Promise<AuthIdentity> {
  const identity = await getAuthIdentity();
  if (!identity) {
    if (options.redirectToLogin !== false) {
      redirect("/login");
    }
    throw new AuthzError("Unauthorized", 401);
  }
  return identity;
}

/** @deprecated Prefer requireAuthIdentity / getAuthIdentity. */
export async function getSessionOrNull() {
  const identity = await getAuthIdentity();
  if (!identity) return null;
  return {
    user: {
      id: identity.userId,
      email: identity.email,
      emailVerified: identity.emailVerified,
      name: identity.name ?? "",
      image: identity.image ?? null,
    },
  };
}

/** @deprecated Prefer requireAuthIdentity. */
export async function requireSession() {
  const identity = await requireAuthIdentity();
  return {
    user: {
      id: identity.userId,
      email: identity.email,
      emailVerified: identity.emailVerified,
      name: identity.name ?? "",
      image: identity.image ?? null,
    },
  };
}

export function resolveRoleId(membership: OrganizationMember): string {
  if (membership.roleId) return membership.roleId;
  return legacyRoleToRoleId(membership.role);
}

export async function getMembership(
  userId: string,
  organizationId: string,
): Promise<OrganizationMember | null> {
  const [membership] = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
      ),
    )
    .limit(1);

  return membership ?? null;
}

export function assertMembershipRole(
  membership: OrganizationMember | null,
  allowed: MembershipRole[] = ["OWNER", "ADMIN", "MEMBER"],
): OrganizationMember {
  if (!membership) {
    throw new AuthzError("Not a member of this organization", 403);
  }
  if (!allowed.includes(membership.role)) {
    throw new AuthzError("Insufficient role for this action", 403);
  }
  return membership;
}

export async function requireOrganizationMembership(
  userId: string,
  organizationId: string,
  allowed: MembershipRole[] = ["OWNER", "ADMIN", "MEMBER"],
): Promise<OrganizationMember> {
  const membership = await getMembership(userId, organizationId);
  return assertMembershipRole(membership, allowed);
}

export async function requireMembership(
  userId: string,
  organizationId: string,
): Promise<OrganizationMember> {
  const membership = await getMembership(userId, organizationId);
  if (!membership || membership.status !== "active") {
    throw new AuthzError("Not a member of this organization", 403);
  }
  return membership;
}

/**
 * Resolve location IDs the membership may access.
 * Returns "all" when scope is org-wide.
 */
export async function resolveLocationIds(
  membership: OrganizationMember,
): Promise<string[] | "all"> {
  const [access] = await db
    .select()
    .from(locationAccess)
    .where(eq(locationAccess.membershipId, membership.id))
    .limit(1);

  if (!access || access.scope === "all") {
    return "all";
  }

  if (access.scope === "locations") {
    return access.locationIds ?? [];
  }

  if (access.scope === "group" && access.groupId) {
    const rows = await db
      .select({ locationId: locationGroupMembers.locationId })
      .from(locationGroupMembers)
      .where(eq(locationGroupMembers.groupId, access.groupId));
    return rows.map((r) => r.locationId);
  }

  return [];
}

export async function listAccessibleLocationIds(
  membership: OrganizationMember,
): Promise<string[]> {
  const scope = await resolveLocationIds(membership);
  if (scope === "all") {
    return listLocationIdsForOrganization(membership.organizationId);
  }
  if (scope.length === 0) return [];
  const orgLocations = await listLocationIdsForOrganization(
    membership.organizationId,
  );
  const allowed = new Set(orgLocations);
  return scope.filter((id) => allowed.has(id));
}

export async function requirePermission(
  userId: string,
  organizationId: string,
  permission: Permission,
  locationId?: string,
): Promise<{
  membership: OrganizationMember;
  roleId: string;
  locationIds: string[] | "all";
}> {
  const membership = await requireMembership(userId, organizationId);
  const roleId = resolveRoleId(membership);

  if (!roleHasPermission(roleId, permission)) {
    throw new AuthzError("Insufficient permission for this action", 403);
  }

  const locationIds = await resolveLocationIds(membership);

  if (locationId) {
    if (locationIds !== "all" && !locationIds.includes(locationId)) {
      throw new AuthzError("Location out of scope", 403);
    }
    const [loc] = await db
      .select({ id: locations.id, organizationId: locations.organizationId })
      .from(locations)
      .where(eq(locations.id, locationId))
      .limit(1);
    if (!loc || loc.organizationId !== organizationId) {
      throw new AuthzError("Not found", 404);
    }
  }

  return { membership, roleId, locationIds };
}

export async function listMembershipsForUser(userId: string): Promise<
  Array<{ organization: Organization; membership: OrganizationMember }>
> {
  return db
    .select({
      organization: organizations,
      membership: organizationMembers,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.status, "active"),
      ),
    );
}

export async function getPrimaryOrganizationForUser(
  userId: string,
): Promise<{ organization: Organization; membership: OrganizationMember } | null> {
  const rows = await listMembershipsForUser(userId);
  return rows[0] ?? null;
}

/** Validate active-org cookie against membership; fall back to primary. */
export async function resolveActiveOrganization(
  userId: string,
): Promise<{ organization: Organization; membership: OrganizationMember } | null> {
  const jar = await cookies();
  const requested = jar.get(ACTIVE_ORG_COOKIE)?.value ?? null;
  const memberships = await listMembershipsForUser(userId);
  if (memberships.length === 0) return null;

  if (requested) {
    const match = memberships.find((m) => m.organization.id === requested);
    if (match) return match;
  }
  return memberships[0] ?? null;
}

export async function setActiveOrganizationCookie(
  organizationId: string,
): Promise<void> {
  const jar = await cookies();
  jar.set(ACTIVE_ORG_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

/** Location IDs for an organization. */
export async function listLocationIdsForOrganization(
  organizationId: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.organizationId, organizationId));
  return rows.map((r) => r.id);
}

export async function requireDocumentAccess(
  userId: string,
  documentId: string,
): Promise<{ document: Document; membership: OrganizationMember }> {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document) {
    throw new AuthzError("Not found", 404);
  }

  try {
    const { membership } = await requirePermission(
      userId,
      document.organizationId,
      "document.read",
      document.locationId ?? undefined,
    );
    return { document, membership };
  } catch (e) {
    if (e instanceof AuthzError && e.status === 403) {
      throw new AuthzError("Not found", 404);
    }
    throw e;
  }
}

export async function requireUploadAuthorization(
  userId: string,
  organizationId: string,
  locationId?: string,
): Promise<OrganizationMember> {
  const { membership } = await requirePermission(
    userId,
    organizationId,
    "document.upload",
    locationId,
  );
  return membership;
}

/** Pure helper used by tests. */
export function canAccessOrganization(
  membershipOrgId: string | null | undefined,
  resourceOrgId: string,
): boolean {
  if (!membershipOrgId) return false;
  return membershipOrgId === resourceOrgId;
}

/** Test helper: filter location list by scope. */
export function filterLocationsByScope(
  orgLocationIds: string[],
  scope: string[] | "all",
): string[] {
  if (scope === "all") return orgLocationIds;
  const allowed = new Set(scope);
  return orgLocationIds.filter((id) => allowed.has(id));
}

export async function assertLocationsInOrganization(
  organizationId: string,
  locationIds: string[],
): Promise<void> {
  if (locationIds.length === 0) return;
  const rows = await db
    .select({ id: locations.id })
    .from(locations)
    .where(
      and(
        eq(locations.organizationId, organizationId),
        inArray(locations.id, locationIds),
      ),
    );
  if (rows.length !== locationIds.length) {
    throw new AuthzError("Invalid location scope", 400);
  }
}

/** Used by middleware helpers — cookie presence only is not authz. */
export async function headersHasSessionCookie(): Promise<boolean> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  return /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/.test(cookie);
}
