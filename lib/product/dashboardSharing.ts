/**
 * Dashboard sharing — demo ACL (localStorage).
 * Dashboard share ≠ data authorization; scoped rendering still applies.
 */

import type { DashboardVisibility, RadrDashboard } from "@/lib/product/dashboards";

export type ShareSubjectKind = "person" | "team" | "role";
export type SharePermission = "view" | "edit" | "owner";

export type DashboardShareEntry = {
  id: string;
  kind: ShareSubjectKind;
  label: string;
  permission: SharePermission;
};

export type ShareCatalogItem = {
  id: string;
  kind: ShareSubjectKind;
  label: string;
  hint: string;
};

/** Deterministic invite catalog for the demo. */
export const SHARE_CATALOG: ShareCatalogItem[] = [
  { id: "person_jordan", kind: "person", label: "Jordan Blake", hint: "Owner · CFO" },
  { id: "person_maya", kind: "person", label: "Maya Chen", hint: "GM · Soho · New York" },
  { id: "person_luca", kind: "person", label: "Luca Ortega", hint: "COO" },
  { id: "person_sofia", kind: "person", label: "Sofia Meyer", hint: "Head Chef" },
  { id: "team_finance", kind: "team", label: "Finance team", hint: "4 people" },
  { id: "team_ops", kind: "team", label: "Operations leads", hint: "6 people" },
  { id: "team_kitchen", kind: "team", label: "Kitchen managers", hint: "5 people" },
  { id: "role_gm", kind: "role", label: "GMs · All locations", hint: "Role" },
  { id: "role_cfo", kind: "role", label: "CFO / Finance", hint: "Role" },
  { id: "role_chef", kind: "role", label: "Head Chefs", hint: "Role" },
];

const TEMPLATE_DEFAULTS: Record<string, DashboardShareEntry[]> = {
  dash_gm: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_maya", kind: "person", label: "Maya Chen", permission: "edit" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "view" },
    { id: "role_gm", kind: "role", label: "GMs · All locations", permission: "view" },
  ],
  dash_coo: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_luca", kind: "person", label: "Luca Ortega", permission: "edit" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "edit" },
  ],
  dash_cfo: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_finance", kind: "team", label: "Finance team", permission: "edit" },
  ],
  dash_friday_dinner: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_maya", kind: "person", label: "Maya Chen", permission: "edit" },
  ],
  dash_restaurant_live: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_maya", kind: "person", label: "Maya Chen", permission: "edit" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "view" },
    { id: "role_gm", kind: "role", label: "GMs · All locations", permission: "view" },
    { id: "person_sofia", kind: "person", label: "Sofia Meyer", permission: "view" },
  ],
  dash_head_chef: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_sofia", kind: "person", label: "Sofia Meyer", permission: "edit" },
  ],
  dash_hotel_gm: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "role_gm", kind: "role", label: "GMs · All properties", permission: "view" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "view" },
  ],
  dash_hotel_cfo: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_finance", kind: "team", label: "Finance team", permission: "edit" },
    { id: "person_luca", kind: "person", label: "Luca Ortega", permission: "view" },
  ],
  dash_hotel_revenue: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_finance", kind: "team", label: "Finance team", permission: "edit" },
  ],
  dash_hotel_ops: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "edit" },
  ],
  dash_hotel_front_office: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_ops", kind: "team", label: "Front office leads", permission: "edit" },
  ],
  dash_hotel_hk: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "team_ops", kind: "team", label: "Housekeeping leads", permission: "view" },
  ],
  dash_hotel_morning_brief: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "role_gm", kind: "role", label: "GMs · All properties", permission: "view" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "view" },
  ],
  dash_hotel_portfolio: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_luca", kind: "person", label: "Luca Ortega", permission: "edit" },
    { id: "team_finance", kind: "team", label: "Finance team", permission: "view" },
  ],
  dash_hotel_coo: [
    { id: "person_jordan", kind: "person", label: "Jordan Blake", permission: "owner" },
    { id: "person_luca", kind: "person", label: "Luca Ortega", permission: "edit" },
    { id: "team_ops", kind: "team", label: "Operations leads", permission: "view" },
  ],
};

const OWNER_DEFAULT: DashboardShareEntry = {
  id: "person_jordan",
  kind: "person",
  label: "Jordan Blake",
  permission: "owner",
};

export function defaultSharedWith(dashboardId: string): DashboardShareEntry[] {
  return TEMPLATE_DEFAULTS[dashboardId]
    ? TEMPLATE_DEFAULTS[dashboardId]!.map((e) => ({ ...e }))
    : [{ ...OWNER_DEFAULT }];
}

export function normalizeSharedWith(
  entries: DashboardShareEntry[] | undefined | null,
  dashboardId: string,
): DashboardShareEntry[] {
  if (!Array.isArray(entries) || entries.length === 0) {
    return defaultSharedWith(dashboardId);
  }
  const cleaned = entries
    .filter(
      (e) =>
        e &&
        typeof e.id === "string" &&
        (e.kind === "person" || e.kind === "team" || e.kind === "role") &&
        (e.permission === "view" ||
          e.permission === "edit" ||
          e.permission === "owner") &&
        typeof e.label === "string",
    )
    .map((e) => ({
      id: e.id,
      kind: e.kind,
      label: e.label,
      permission: e.permission,
    }));
  return cleaned.length ? cleaned : defaultSharedWith(dashboardId);
}

/** People/teams/roles with access, excluding the sole owner when counting “shared with”. */
export function sharedCollaboratorCount(dash: RadrDashboard): number {
  const list = normalizeSharedWith(dash.sharedWith, dash.id);
  return list.filter((e) => e.permission !== "owner").length;
}

export function shareMetaLabel(dash: RadrDashboard): string {
  const n = sharedCollaboratorCount(dash);
  if (dash.visibility === "PRIVATE" && n === 0) return "Private";
  if (dash.visibility === "ORGANIZATION") return "Organization";
  if (dash.visibility === "ROLE" && n === 0) {
    const role = dash.roleTemplate?.toUpperCase() ?? "ROLE";
    return `Role · ${role}`;
  }
  if (n <= 0) return "Private";
  return `Shared with ${n} ${n === 1 ? "user" : "users"}`;
}

export function visibilityForShares(
  sharedWith: DashboardShareEntry[],
): DashboardVisibility {
  const others = sharedWith.filter((e) => e.permission !== "owner");
  if (others.length === 0) return "PRIVATE";
  if (others.some((e) => e.kind === "role")) return "ROLE";
  if (others.some((e) => e.kind === "team")) return "SHARED";
  return "SHARED";
}

export function availableToInvite(
  current: DashboardShareEntry[],
): ShareCatalogItem[] {
  const have = new Set(current.map((e) => e.id));
  return SHARE_CATALOG.filter((c) => !have.has(c.id));
}

export function permissionLabel(p: SharePermission): string {
  if (p === "owner") return "Owner";
  if (p === "edit") return "Edit";
  return "View";
}
