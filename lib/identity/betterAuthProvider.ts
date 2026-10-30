/**
 * better-auth adapter for the IdentityProvider boundary.
 * Swap this module for a WorkOS adapter later without touching RBAC/Settings.
 */

import { auth } from "@/lib/auth";
import type { AuthIdentity, IdentityProvider } from "./provider";

export const betterAuthIdentityProvider: IdentityProvider = {
  async getAuthIdentity(requestHeaders) {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session?.user) return null;
    return {
      userId: session.user.id,
      email: session.user.email,
      emailVerified: Boolean(session.user.emailVerified),
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    } satisfies AuthIdentity;
  },
};
