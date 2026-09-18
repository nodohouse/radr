/**
 * Server-side Ask RADR tenant / location scope resolution.
 * Client role and allowedLocationIds claims are never trusted.
 */

import { CLIENT_ERRORS } from "@/lib/security/errors";
import type { RadrEnvironment } from "@/lib/radr/env";
import type { ButlerRole } from "@/lib/radr/butler/types";

export const ASK_DEMO_ORG = "org_northstar";
export const ASK_DEMO_LOCATION = "loc_ber";
export const ASK_DEMO_USER = "butler_demo";

export type AskSecureAuthOk = {
  ok: true;
  organizationId: string;
  userId: string;
  role: ButlerRole;
  /** Never `"all"` until location RBAC exists. */
  allowedLocationIds: string[];
  locationScope: string;
};

export type AskSecureAuthErr = {
  ok: false;
  status: 401 | 403;
  error: string;
};

export type AskSecureAuth = AskSecureAuthOk | AskSecureAuthErr;

/**
 * Pure resolver for Ask tool auth. Call after loading membership + org locations
 * when env is LIVE; DEMO/SANDBOX ignore membership and stay on the demo tenant.
 */
export function buildAskSecureAuth(input: {
  env: RadrEnvironment;
  sessionUserId: string | null;
  organizationId: string | null;
  orgLocationIds: string[];
  requestedLocationScope: string;
}): AskSecureAuth {
  const role: ButlerRole = "location_manager";

  if (input.env === "LIVE") {
    if (!input.sessionUserId) {
      return { ok: false, status: 401, error: CLIENT_ERRORS.unauthorized };
    }
    if (!input.organizationId) {
      return {
        ok: false,
        status: 403,
        error: "No organization membership for this account.",
      };
    }
    const allowed = input.orgLocationIds;
    const locationScope = allowed.includes(input.requestedLocationScope)
      ? input.requestedLocationScope
      : (allowed[0] ?? input.requestedLocationScope);
    return {
      ok: true,
      organizationId: input.organizationId,
      userId: input.sessionUserId,
      role,
      allowedLocationIds: allowed,
      locationScope,
    };
  }

  // DEMO / SANDBOX - public demo capped to a single location (not group CFO).
  const allowed = [ASK_DEMO_LOCATION];
  return {
    ok: true,
    organizationId: ASK_DEMO_ORG,
    userId: input.sessionUserId ?? ASK_DEMO_USER,
    role,
    allowedLocationIds: allowed,
    locationScope: allowed.includes(input.requestedLocationScope)
      ? input.requestedLocationScope
      : ASK_DEMO_LOCATION,
  };
}
