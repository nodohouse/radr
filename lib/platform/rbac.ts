/**
 * Scope-based RBAC. Role names are convenience; permissions are authoritative.
 */

export type RadrRole =
  | "GROUP_ADMIN"
  | "CFO"
  | "REGIONAL_MANAGER"
  | "GENERAL_MANAGER"
  | "OPERATIONS"
  | "FINANCE"
  | "VIEWER";

export type Permission =
  | "org:admin"
  | "location:read"
  | "location:write"
  | "finding:read"
  | "finding:write"
  | "action:read"
  | "action:write"
  | "action:confirm"
  | "integration:manage"
  | "billing:read"
  | "audit:read"
  | "butler:read"
  | "butler:write";

const ROLE_PERMISSIONS: Record<RadrRole, Permission[]> = {
  GROUP_ADMIN: [
    "org:admin",
    "location:read",
    "location:write",
    "finding:read",
    "finding:write",
    "action:read",
    "action:write",
    "action:confirm",
    "integration:manage",
    "billing:read",
    "audit:read",
    "butler:read",
    "butler:write",
  ],
  CFO: [
    "location:read",
    "finding:read",
    "action:read",
    "action:confirm",
    "billing:read",
    "audit:read",
    "butler:read",
  ],
  REGIONAL_MANAGER: [
    "location:read",
    "finding:read",
    "finding:write",
    "action:read",
    "action:write",
    "action:confirm",
    "butler:read",
    "butler:write",
  ],
  GENERAL_MANAGER: [
    "location:read",
    "finding:read",
    "finding:write",
    "action:read",
    "action:write",
    "action:confirm",
    "butler:read",
    "butler:write",
  ],
  OPERATIONS: [
    "location:read",
    "finding:read",
    "action:read",
    "action:write",
    "butler:read",
  ],
  FINANCE: [
    "location:read",
    "finding:read",
    "action:read",
    "billing:read",
    "butler:read",
  ],
  VIEWER: ["location:read", "finding:read", "action:read", "butler:read"],
};

export type AccessContext = {
  userId: string;
  organizationId: string;
  role: RadrRole;
  /** Location IDs this user may access; "all" for group roles */
  locationIds: string[] | "all";
};

export function permissionsForRole(role: RadrRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(ctx: AccessContext, permission: Permission): boolean {
  return permissionsForRole(ctx.role).includes(permission);
}

export function canAccessLocation(
  ctx: AccessContext,
  locationId: string,
): boolean {
  if (!hasPermission(ctx, "location:read")) return false;
  if (ctx.locationIds === "all") return true;
  if (locationId === "all" || locationId.startsWith("region_")) {
    return (
      ctx.role === "GROUP_ADMIN" ||
      ctx.role === "CFO" ||
      ctx.role === "REGIONAL_MANAGER"
    );
  }
  return ctx.locationIds.includes(locationId);
}

export function assertLocationAccess(
  ctx: AccessContext,
  locationId: string,
): void {
  if (!canAccessLocation(ctx, locationId)) {
    throw new Error("Permission denied for location");
  }
}
