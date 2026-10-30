/**
 * Identity provider boundary.
 *
 * Authentication providers (better-auth today; WorkOS AuthKit later) supply
 * AuthIdentity only. RADR domain authorization never imports provider SDKs.
 */

import { betterAuthIdentityProvider } from "./betterAuthProvider";

export type AuthIdentity = {
  userId: string;
  email: string;
  emailVerified: boolean;
  name?: string | null;
  image?: string | null;
};

export type IdentityProvider = {
  getAuthIdentity: (headers: Headers) => Promise<AuthIdentity | null>;
};

let activeProvider: IdentityProvider = betterAuthIdentityProvider;

export function setIdentityProvider(provider: IdentityProvider): void {
  activeProvider = provider;
}

export function getIdentityProvider(): IdentityProvider {
  return activeProvider;
}

export async function getAuthIdentity(
  requestHeaders?: Headers,
): Promise<AuthIdentity | null> {
  const { headers } = await import("next/headers");
  const h = requestHeaders ?? (await headers());
  return getIdentityProvider().getAuthIdentity(h);
}
