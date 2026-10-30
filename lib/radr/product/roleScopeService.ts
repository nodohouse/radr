/**
 * RoleScopeService — canonical role × org × location access.
 * Widgets must not invent their own location filters.
 */

import type { RoleView } from "@/lib/product/types";
import {
  roleContextFor,
  type RoleContext,
  type ScopeType,
} from "@/lib/radr/product/personas";
import {
  orgIdForVertical,
  locationIdsForVertical,
} from "@/lib/radr/demo/verticalScope";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type RoleScope = {
  role: RoleView;
  vertical: DemoVerticalFamily;
  organizationId: string;
  allowedLocationIds: readonly string[];
  defaultLocationId: string | "all";
  scopeType: ScopeType;
  label: string;
  shortLabel: string;
  firstName: string;
  initials: string;
  personaId: string;
};

/** Single entry point for role location scope. */
export function resolveRoleScope(
  role: RoleView,
  vertical: DemoVerticalFamily,
): RoleScope {
  const ctx: RoleContext = roleContextFor(role, vertical);
  const orgLocations = [...locationIdsForVertical(vertical)];

  // COO / CFO / portfolio roles: always full org unless LOCATION-scoped persona
  let allowed =
    ctx.scopeType === "LOCATION"
      ? ctx.allowedLocationIds.filter((id) => orgLocations.includes(id))
      : orgLocations;

  // Defense: never leak opposite vertical
  const allowedSet = locationIdsForVertical(vertical);
  allowed = allowed.filter((id) => allowedSet.has(id));

  if (allowed.length === 0) {
    allowed = orgLocations;
  }

  return {
    role,
    vertical,
    organizationId: orgIdForVertical(vertical),
    allowedLocationIds: allowed,
    defaultLocationId: ctx.defaultLocationId,
    scopeType: ctx.scopeType,
    label: ctx.label,
    shortLabel: ctx.shortLabel,
    firstName: ctx.firstName,
    initials: ctx.initials,
    personaId: ctx.personaId,
  };
}

export function locationInScope(
  locationId: string | undefined | null,
  scope: RoleScope,
): boolean {
  if (!locationId) return scope.scopeType !== "LOCATION";
  return scope.allowedLocationIds.includes(locationId);
}

export function isPortfolioScope(scope: RoleScope): boolean {
  return scope.scopeType === "PORTFOLIO" || scope.scopeType === "GROUP";
}
