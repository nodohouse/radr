import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  documents,
  organizationMembers,
  organizations,
  type Document,
  type MembershipRole,
  type Organization,
  type OrganizationMember,
} from "@/lib/db/schema";

export class AuthzError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthzError";
    this.status = status;
  }
}

export async function getSessionOrNull() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getSessionOrNull();
  if (!session) {
    redirect("/login");
  }
  return session;
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

export async function getPrimaryOrganizationForUser(
  userId: string,
): Promise<{ organization: Organization; membership: OrganizationMember } | null> {
  const rows = await db
    .select({
      organization: organizations,
      membership: organizationMembers,
    })
    .from(organizationMembers)
    .innerJoin(
      organizations,
      eq(organizations.id, organizationMembers.organizationId),
    )
    .where(eq(organizationMembers.userId, userId))
    .limit(1);

  return rows[0] ?? null;
}

/**
 * Tenant isolation for documents:
 * access is granted only when the actor is a member of the document's organization.
 * Never trust a client-supplied organizationId alone.
 */
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
    throw new AuthzError("Document not found", 404);
  }

  const membership = await requireOrganizationMembership(
    userId,
    document.organizationId,
  );

  return { document, membership };
}

export async function requireUploadAuthorization(
  userId: string,
  organizationId: string,
): Promise<OrganizationMember> {
  return requireOrganizationMembership(userId, organizationId, [
    "OWNER",
    "ADMIN",
    "MEMBER",
  ]);
}

/** Pure helper used by tests — decides whether a membership may access a resource org. */
export function canAccessOrganization(
  membershipOrgId: string | null | undefined,
  resourceOrgId: string,
): boolean {
  if (!membershipOrgId) return false;
  return membershipOrgId === resourceOrgId;
}
