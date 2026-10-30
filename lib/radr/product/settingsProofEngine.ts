/**
 * Settings governance proof engine — presentation + IA over demoSettings.
 */

export type SettingsSectionId =
  | "organization"
  | "locations"
  | "context"
  | "forecasting"
  | "workforce"
  | "access"
  | "policies"
  | "autonomy"
  | "attention"
  | "notifications"
  | "integrations"
  | "audit";

export type SettingsNavItem = {
  id: SettingsSectionId;
  name: string;
  detail: string;
  /** Keywords for settings search. */
  keywords: string[];
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "organization",
    name: "Organization",
    detail: "Name · currency · timezone",
    keywords: ["org", "name", "currency", "timezone", "fiscal", "operating model"],
  },
  {
    id: "locations",
    name: "Locations",
    detail: "Operating model per venue",
    keywords: ["venue", "property", "override", "capacity", "areas"],
  },
  {
    id: "context",
    name: "Context",
    detail: "Locale · calendars · external signals",
    keywords: ["weather", "holidays", "events", "locale", "calendar"],
  },
  {
    id: "forecasting",
    name: "Forecasting",
    detail: "Horizons · comparisons · thresholds",
    keywords: ["forecast", "plan", "confidence", "horizon", "seasonality"],
  },
  {
    id: "workforce",
    name: "Workforce",
    detail: "Human roles · labor targets",
    keywords: ["labor", "staffing", "shift", "agency", "roles"],
  },
  {
    id: "access",
    name: "Users & Access",
    detail: "Roles · invitations · scopes",
    keywords: ["users", "rbac", "invite", "admin", "viewer", "access"],
  },
  {
    id: "policies",
    name: "Policies & Approvals",
    detail: "Thresholds · owners · approval rules",
    keywords: ["policy", "approval", "threshold", "owner", "escalation"],
  },
  {
    id: "autonomy",
    name: "Autonomy",
    detail: "Observe → prepare → approve → execute",
    keywords: [
      "operator",
      "autonomy",
      "execute",
      "prepare",
      "delivery",
      "digital worker",
    ],
  },
  {
    id: "attention",
    name: "Attention",
    detail: "Materiality · prioritization · noise control",
    keywords: ["materiality", "interrupt", "noise", "briefing", "alert"],
  },
  {
    id: "notifications",
    name: "Notifications",
    detail: "Channels · quiet hours · escalation",
    keywords: ["email", "push", "quiet hours", "escalation", "briefing"],
  },
  {
    id: "integrations",
    name: "Integrations",
    detail: "Connection governance · permissions",
    keywords: ["connections", "write", "credentials", "providers", "xero"],
  },
  {
    id: "audit",
    name: "Audit Trail",
    detail: "Changes · actions · approvals · exports",
    keywords: ["audit", "history", "who changed", "export", "security"],
  },
];

const SECTION_IDS = new Set(SETTINGS_NAV.map((n) => n.id));

/** Group-level governance story (stable across restaurant/hotel demo switch). */
export const GOVERNANCE_SUMMARY = {
  locationsTotal: 24,
  restaurants: 22,
  hotels: 2,
  personas: 6,
  policiesActive: 12,
  policyCategories: 4,
} as const;

export const CURRENCY_OPTIONS = [
  { id: "EUR", label: "EUR (Euro)" },
  { id: "GBP", label: "GBP (Pound sterling)" },
  { id: "USD", label: "USD (US dollar)" },
  { id: "CHF", label: "CHF (Swiss franc)" },
] as const;

export const TIMEZONE_OPTIONS = [
  { id: "Europe/Berlin", label: "Europe/Berlin" },
  { id: "Europe/London", label: "Europe/London" },
  { id: "Europe/Paris", label: "Europe/Paris" },
  { id: "Asia/Dubai", label: "Asia/Dubai" },
  { id: "America/New_York", label: "America/New_York" },
] as const;

export const FISCAL_OPTIONS = [
  { id: "calendar_year", label: "Calendar year (Jan – Dec)" },
  { id: "april_year", label: "April year (Apr – Mar)" },
  { id: "4-4-5", label: "4-4-5 retail calendar" },
] as const;

export const OPERATING_MODEL_OPTIONS = [
  { id: "restaurant_model", label: "Restaurant model" },
  { id: "hotel_model", label: "Hotel model" },
  { id: "hybrid", label: "Hybrid hospitality group" },
] as const;

export function parseSettingsSection(
  raw: string | null,
): SettingsSectionId {
  if (!raw) return "organization";
  if (raw === "users" || raw === "access") return "access";
  if (raw === "connections" || raw === "data-health") return "integrations";
  if (raw === "security" || raw === "audit") return "audit";
  if (raw === "preferences" || raw === "developer") return "organization";
  if (SECTION_IDS.has(raw as SettingsSectionId)) {
    return raw as SettingsSectionId;
  }
  return "organization";
}

export function buildSettingsHref(
  pathname: string,
  section: SettingsSectionId,
  opts?: { policy?: string | null; stay?: string | null; highlight?: string | null },
): string {
  const params = new URLSearchParams();
  params.set("section", section);
  params.set("stay", opts?.stay ?? "1");
  if (section === "policies" && opts?.policy) {
    params.set("policy", opts.policy);
  }
  if (opts?.highlight) params.set("highlight", opts.highlight);
  return `${pathname}?${params.toString()}`;
}

export function filterSettingsNav(
  query: string,
): SettingsNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return SETTINGS_NAV;
  return SETTINGS_NAV.filter((n) =>
    [n.name, n.detail, ...n.keywords].join(" ").toLowerCase().includes(q),
  );
}

export function currencyLabel(code: string): string {
  return CURRENCY_OPTIONS.find((c) => c.id === code)?.label ?? code;
}

export function fiscalLabel(id: string): string {
  return FISCAL_OPTIONS.find((c) => c.id === id)?.label ?? id;
}

export function operatingModelLabel(id: string): string {
  return OPERATING_MODEL_OPTIONS.find((c) => c.id === id)?.label ?? id;
}

export type DemoPersonaChip = {
  personaId: string;
  title: string;
  subtitle: string;
  roleView: string;
};

/** Restaurant demo controls matching the mockup. */
export const DEMO_PERSONA_CHIPS_RESTAURANT: DemoPersonaChip[] = [
  {
    personaId: "cfo_group",
    title: "CFO · Group",
    subtitle: "Finance & strategic view",
    roleView: "cfo",
  },
  {
    personaId: "coo_all",
    title: "COO · Group",
    subtitle: "Operations view",
    roleView: "coo",
  },
  {
    personaId: "gm_berlin",
    title: "GM · Soho · New York",
    subtitle: "Venue management",
    roleView: "gm",
  },
  {
    personaId: "service_berlin",
    title: "Service · Soho · New York",
    subtitle: "Front-of-house",
    roleView: "host",
  },
  {
    personaId: "chef_berlin",
    title: "Chef · Soho · New York",
    subtitle: "Kitchen operations",
    roleView: "head_chef",
  },
  {
    personaId: "owner_group",
    title: "Owner · Group",
    subtitle: "Ownership view",
    roleView: "owner",
  },
];

export const DEMO_PERSONA_CHIPS_HOTEL: DemoPersonaChip[] = [
  {
    personaId: "hotel_cfo",
    title: "CFO · Group",
    subtitle: "Finance & strategic view",
    roleView: "cfo",
  },
  {
    personaId: "hotel_ops",
    title: "Ops · Portfolio",
    subtitle: "Operations view",
    roleView: "coo",
  },
  {
    personaId: "hotel_gm_canal",
    title: "GM · Canal House",
    subtitle: "Property management",
    roleView: "gm",
  },
  {
    personaId: "revenue_portfolio",
    title: "Revenue · Portfolio",
    subtitle: "Rate & inventory",
    roleView: "revenue_manager",
  },
  {
    personaId: "housekeeping_canal",
    title: "Housekeeping · Canal",
    subtitle: "Rooms readiness",
    roleView: "housekeeping_manager",
  },
  {
    personaId: "front_office_canal",
    title: "Front Office · Canal",
    subtitle: "Guest operations",
    roleView: "host",
  },
];
