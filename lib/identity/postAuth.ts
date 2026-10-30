/**
 * Post-auth destination router.
 * invite → create org → single org → multi-org selector.
 */

import { listMembershipsForUser } from "@/lib/authz";
import { listPendingInvitationsForEmail } from "@/lib/identity/invitations";
import type { AuthIdentity } from "@/lib/identity/provider";
import { extractProgress } from "@/lib/onboarding/engine/progress";

export type PostAuthDestination =
  | { kind: "accept_invite"; path: string; invitationId: string }
  | { kind: "create_org"; path: "/onboarding" }
  | { kind: "select_org"; path: "/select-org" }
  | { kind: "continue_onboarding"; path: "/onboarding" }
  | { kind: "app"; path: "/app"; organizationId: string };

export async function resolvePostAuthDestination(
  identity: AuthIdentity,
  options: { inviteToken?: string | null; preferredNext?: string | null } = {},
): Promise<PostAuthDestination> {
  if (options.inviteToken) {
    return {
      kind: "accept_invite",
      path: `/invite/accept?token=${encodeURIComponent(options.inviteToken)}`,
      invitationId: "",
    };
  }

  const pending = await listPendingInvitationsForEmail(identity.email);
  if (pending.length > 0 && pending[0]) {
    // Surface first pending invite via accept page once token is known —
    // email-only pending without token goes to onboarding with notice.
    return { kind: "create_org", path: "/onboarding" };
  }

  const memberships = await listMembershipsForUser(identity.userId);

  if (memberships.length === 0) {
    return { kind: "create_org", path: "/onboarding" };
  }

  if (memberships.length > 1) {
    return { kind: "select_org", path: "/select-org" };
  }

  const primary = memberships[0]!;
  const progress = extractProgress(primary.organization.onboarding);
  const done =
    progress.completedStepIds.includes("go_live") ||
    (primary.organization.onboarding as Record<string, unknown>)?.step ===
      "done";

  if (!done) {
    return { kind: "continue_onboarding", path: "/onboarding" };
  }

  if (
    options.preferredNext &&
    options.preferredNext.startsWith("/") &&
    !options.preferredNext.startsWith("//")
  ) {
    return {
      kind: "app",
      path: options.preferredNext as "/app",
      organizationId: primary.organization.id,
    };
  }

  return {
    kind: "app",
    path: "/app",
    organizationId: primary.organization.id,
  };
}
