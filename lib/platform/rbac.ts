/**
 * RADR permission catalog + role seed map.
 * Role names are convenience; permissions are authoritative for authorization.
 * Auth provider (better-auth today) never sees these — RADR domain owns them.
 */

export type Permission =
  | "decision.read"
  | "decision.approve"
  | "decision.execute"
  | "verified_value.read"
  | "settings.edit"
  | "user.invite"
  | "user.manage"
  | "location.read"
  | "location.edit"
  | "integration.manage"
  | "security.manage"
  | "developer.manage"
  | "audit.read"
  | "document.upload"
  | "document.read"
  | "org.admin"
  | "butler.use";

export type RoleKey =
  | "owner"
  | "admin"
  | "cfo"
  | "coo"
  | "gm"
  | "revenue"
  | "fnb"
  | "finance"
  | "operations"
  | "it"
  | "viewer";

export type RoleDefinition = {
  id: string;
  key: RoleKey;
  name: string;
  system: true;
  permissions: Permission[];
};

const ALL_ADMIN: Permission[] = [
  "decision.read",
  "decision.approve",
  "decision.execute",
  "verified_value.read",
  "settings.edit",
  "user.invite",
  "user.manage",
  "location.read",
  "location.edit",
  "integration.manage",
  "security.manage",
  "developer.manage",
  "audit.read",
  "document.upload",
  "document.read",
  "org.admin",
  "butler.use",
];

/** Seeded system roles — SSOT for migration + runtime checks. */
export const SYSTEM_ROLES: RoleDefinition[] = [
  {
    id: "role_owner",
    key: "owner",
    name: "Owner",
    system: true,
    permissions: ALL_ADMIN,
  },
  {
    id: "role_admin",
    key: "admin",
    name: "Admin",
    system: true,
    permissions: ALL_ADMIN.filter((p) => p !== "developer.manage"),
  },
  {
    id: "role_cfo",
    key: "cfo",
    name: "CFO",
    system: true,
    permissions: [
      "decision.read",
      "decision.approve",
      "verified_value.read",
      "settings.edit",
      "location.read",
      "audit.read",
      "document.read",
      "document.upload",
      "butler.use",
    ],
  },
  {
    id: "role_coo",
    key: "coo",
    name: "COO",
    system: true,
    permissions: [
      "decision.read",
      "decision.approve",
      "decision.execute",
      "verified_value.read",
      "location.read",
      "location.edit",
      "settings.edit",
      "document.read",
      "document.upload",
      "butler.use",
    ],
  },
  {
    id: "role_gm",
    key: "gm",
    name: "General Manager",
    system: true,
    permissions: [
      "decision.read",
      "decision.approve",
      "decision.execute",
      "verified_value.read",
      "location.read",
      "location.edit",
      "document.read",
      "document.upload",
      "butler.use",
    ],
  },
  {
    id: "role_revenue",
    key: "revenue",
    name: "Revenue",
    system: true,
    permissions: [
      "decision.read",
      "verified_value.read",
      "location.read",
      "document.read",
      "butler.use",
    ],
  },
  {
    id: "role_fnb",
    key: "fnb",
    name: "Head Chef / F&B",
    system: true,
    permissions: [
      "decision.read",
      "location.read",
      "document.read",
      "document.upload",
      "butler.use",
    ],
  },
  {
    id: "role_finance",
    key: "finance",
    name: "Finance",
    system: true,
    permissions: [
      "decision.read",
      "verified_value.read",
      "location.read",
      "document.read",
      "document.upload",
      "audit.read",
      "butler.use",
    ],
  },
  {
    id: "role_operations",
    key: "operations",
    name: "Operations",
    system: true,
    permissions: [
      "decision.read",
      "location.read",
      "location.edit",
      "document.read",
      "document.upload",
      "butler.use",
    ],
  },
  {
    id: "role_it",
    key: "it",
    name: "IT / Data",
    system: true,
    permissions: [
      "location.read",
      "integration.manage",
      "security.manage",
      "developer.manage",
      "user.invite",
      "user.manage",
      "settings.edit",
      "audit.read",
      "document.read",
      "butler.use",
    ],
  },
  {
    id: "role_viewer",
    key: "viewer",
    name: "Viewer",
    system: true,
    permissions: [
      "decision.read",
      "verified_value.read",
      "location.read",
      "document.read",
      "butler.use",
    ],
  },
];

export const ROLE_BY_KEY: Record<RoleKey, RoleDefinition> = Object.fromEntries(
  SYSTEM_ROLES.map((r) => [r.key, r]),
) as Record<RoleKey, RoleDefinition>;

export const ROLE_BY_ID: Record<string, RoleDefinition> = Object.fromEntries(
  SYSTEM_ROLES.map((r) => [r.id, r]),
);

/** Map legacy membership_role enum → system role id. */
export function legacyRoleToRoleId(
  legacy: "OWNER" | "ADMIN" | "MEMBER",
): string {
  if (legacy === "OWNER") return ROLE_BY_KEY.owner.id;
  if (legacy === "ADMIN") return ROLE_BY_KEY.admin.id;
  return ROLE_BY_KEY.viewer.id;
}

export function permissionsForRoleKey(key: RoleKey): Permission[] {
  return ROLE_BY_KEY[key].permissions;
}

export function permissionsForRoleId(roleId: string): Permission[] {
  return ROLE_BY_ID[roleId]?.permissions ?? [];
}

export function roleHasPermission(
  roleId: string,
  permission: Permission,
): boolean {
  return permissionsForRoleId(roleId).includes(permission);
}

/** @deprecated Prefer RoleKey + Permission. Kept for transitional callers. */
export type RadrRole =
  | "GROUP_ADMIN"
  | "CFO"
  | "REGIONAL_MANAGER"
  | "GENERAL_MANAGER"
  | "OPERATIONS"
  | "FINANCE"
  | "VIEWER";

/** @deprecated Prefer Permission (`resource.action`). */
export type LegacyPermission =
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

const LEGACY_ROLE_MAP: Record<RadrRole, RoleKey> = {
  GROUP_ADMIN: "admin",
  CFO: "cfo",
  REGIONAL_MANAGER: "coo",
  GENERAL_MANAGER: "gm",
  OPERATIONS: "operations",
  FINANCE: "finance",
  VIEWER: "viewer",
};

export function permissionsForRole(role: RadrRole): Permission[] {
  return permissionsForRoleKey(LEGACY_ROLE_MAP[role]);
}

export type AccessContext = {
  userId: string;
  organizationId: string;
  roleId: string;
  /** Location IDs this user may access; "all" for org-wide scope */
  locationIds: string[] | "all";
};

export function hasPermission(
  ctx: AccessContext,
  permission: Permission,
): boolean {
  return roleHasPermission(ctx.roleId, permission);
}

export function canAccessLocation(
  ctx: AccessContext,
  locationId: string,
): boolean {
  if (!hasPermission(ctx, "location.read")) return false;
  if (ctx.locationIds === "all") return true;
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
