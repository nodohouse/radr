/**
 * Demo settings — shared between Settings UI and product behavior.
 * Persistence: localStorage `radr.demoSettings.v1` (demo only).
 *
 * Policies are the source of GM ≤ €250 / GM+CFO €250–€2k copy.
 */

export const DEMO_SETTINGS_KEY = "radr.demoSettings.v1";

export type AutonomyLadder =
  | "observe"
  | "recommend"
  | "prepare"
  | "approve"
  | "auto";

export type DemoPolicyId =
  | "service_capacity"
  | "supplier_emergency"
  | "menu_price"
  | "delivery_throttle"
  | "labor_rebalance"
  | "housekeeping_reassign"
  | "hotel_channel_hold";

export type PolicyCategory =
  | "financial"
  | "operations"
  | "guest"
  | "procurement"
  | "labor";

export type DemoPolicy = {
  id: DemoPolicyId;
  name: string;
  category: PolicyCategory;
  scope: string;
  threshold: string;
  approvers: string;
  owner: string;
  autonomy: AutonomyLadder;
  duration: string;
  reversibility: string;
  audit: string;
  status: "active" | "paused";
  /** Extra governance fields (shown in Settings policy detail). */
  actionClasses?: string;
  locationScope?: string;
  expiry?: string;
  suppliers?: string;
  transport?: string;
  rushFee?: string;
  evidence?: string;
};

export type AccessRoleId =
  | "admin"
  | "finance"
  | "operations"
  | "location_manager"
  | "viewer";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  /** Display title (job). */
  role: string;
  /** RBAC access role — not persona lens. */
  accessRole: AccessRoleId;
  scope: string;
  status: "active" | "invited" | "revoked";
  lastActive: string;
  /** Real roster member — not a demo persona lens. */
  kind: "member";
};

export type DemoLocationSettingsRow = {
  locationId: string;
  hours: string;
  ownership: string;
  systems: string;
  overrides: string;
};

export type LocationOverride = {
  currency?: string | null;
  timezone?: string | null;
  closeClock?: string | null;
};

export type ContextSignalMode = "enabled" | "watching" | "off";

export type DemoSettingsState = {
  orgName: string;
  currency: string;
  timezone: string;
  /** e.g. calendar_year · 4-4-5 */
  fiscalCalendar: string;
  /** restaurant_model · hotel_model · hybrid */
  operatingModel: string;
  berlinClose: string;
  /** Per-location overrides keyed by location id. */
  locationOverrides: Record<string, LocationOverride>;
  contextWeather: ContextSignalMode;
  contextEvents: ContextSignalMode;
  contextHolidays: ContextSignalMode;
  contextSchoolHolidays: ContextSignalMode;
  forecastComparison: "plan" | "forecast" | "prior";
  forecastRevenueHorizonDays: number;
  forecastLiveHorizonMin: number;
  forecastWarnBelow: number;
  forecastReviewBelow: number;
  forecastNoAutoBelow: number;
  mfaRequired: boolean;
  approvalGmMax: number;
  autonomyScheduling: string;
  autonomyByClass: Record<string, AutonomyLadder>;
  notifyNeedsYouEmail: boolean;
  notifyApprovalEmail: boolean;
  notifyVerifiedInApp: boolean;
  quietHoursEnabled: boolean;
  attentionMaterialityEuro: number;
  policies: DemoPolicy[];
  users: DemoUser[];
};

export const DEMO_POLICIES: DemoPolicy[] = [
  {
    id: "service_capacity",
    name: "SERVICE CAPACITY",
    category: "operations",
    scope: "Restaurant · floor / kitchen · delivery pressure",
    threshold:
      "Kitchen ≥90% · inbound ≥30 covers <25m · GM may hold seating",
    approvers: "GM · escalate COO on multi-venue collision",
    owner: "COO",
    autonomy: "approve",
    duration: "Hold window ≤ 20 min · auto-review at expiry",
    reversibility: "Easy · resume seating / release waitlist",
    audit: "Decision Room · ledger · override logged · D-1911 class",
    status: "active",
    actionClasses: "Hold seating · waitlist · prepare channel throttle",
    locationScope: "Per restaurant · inherits org defaults",
    expiry: "Hold expires ≤ 20 min unless re-approved",
    evidence: "Kitchen % · inbound covers · ticket time · table state",
  },
  {
    id: "supplier_emergency",
    name: "SUPPLIER EMERGENCY ORDER",
    category: "procurement",
    scope: "BOH · procurement · same-day courier",
    threshold: "GM ≤ €250 · GM+CFO €250–€2,000 · above €2k executive",
    approvers: "GM / GM+CFO",
    owner: "CFO",
    autonomy: "approve",
    duration: "Same-day courier · cancel before dispatch",
    reversibility: "Medium · cancel before dispatch · partial after",
    audit: "PO prepared · receipt confirmation required · D-8204 class",
    status: "active",
    actionClasses: "Emergency top-up · alternate SKU · transfer from sister",
    locationScope: "Ordering location · may draw sister stock",
    expiry: "Quote valid until courier dispatch",
    suppliers: "Primary dry · approved emergency panel",
    transport: "Same-day courier · cold chain if required",
    rushFee: "Shown on prepared PO · included in threshold check",
    evidence: "Stock gap · forecast burn · supplier quote · receipt",
  },
  {
    id: "menu_price",
    name: "MENU PRICE CHANGE",
    category: "financial",
    scope: "Menu · location",
    threshold: "≤3% GM · >3% GM + CFO",
    approvers: "GM / GM+CFO",
    owner: "CFO",
    autonomy: "recommend",
    duration: "Until next menu cycle",
    reversibility: "Easy · within POS",
    audit: "Price change Decision · POS write prepared only",
    status: "active",
    actionClasses: "Recommend price · prepare POS payload",
    locationScope: "Per location menu",
  },
  {
    id: "delivery_throttle",
    name: "DELIVERY THROTTLE",
    category: "operations",
    scope: "All restaurants",
    threshold:
      "RADR may throttle delivery up to 15 min when kitchen >90%, expected contribution protected >€150, confidence >80%",
    approvers: "GM · escalate COO",
    owner: "COO",
    autonomy: "prepare",
    duration: "Auto-undo after window (default 25m)",
    reversibility: "Easy · auto-undo",
    audit: "Throttle prepared · channel write not faked",
    status: "active",
    actionClasses: "Prepare throttle · approval to publish",
    locationScope: "Per restaurant channel pack",
  },
  {
    id: "labor_rebalance",
    name: "LABOR REBALANCE",
    category: "labor",
    scope: "Restaurant · FOH / bar · peak window",
    threshold:
      "Kitchen ≥90% · do not add FOH into bottleneck · GM may rebalance / throttle",
    approvers: "GM · escalate COO on multi-venue collision",
    owner: "COO",
    autonomy: "approve",
    duration: "Peak window · auto-review at service close",
    reversibility: "Easy · restore roster positions",
    audit: "Decision Room · ledger · override logged · D-1920 class",
    status: "active",
    actionClasses:
      "Rebalance FOH · hold agency · prepare delivery throttle · alter breaks",
    locationScope: "Per restaurant · inherits org defaults",
    expiry: "Window expires at service close unless re-approved",
    evidence: "Kitchen % · covers · ticket time · roster · delivery intake",
  },
  {
    id: "housekeeping_reassign",
    name: "HOUSEKEEPING REASSIGNMENT",
    category: "operations",
    scope: "Hotel · HK floor",
    threshold: "Arrival wave shortfall ≥ 10 rooms",
    approvers: "HK Lead / GM",
    owner: "Hotel Ops",
    autonomy: "prepare",
    duration: "Shift",
    reversibility: "Easy · reassign back",
    audit: "HK Decision · roster system of record",
    status: "active",
    actionClasses:
      "Reassign up to 1 worker · execute within policy · 2+ workers · GM approval required",
    locationScope: "Per property",
    evidence: "PMS arrivals · HK progress · room readiness · attendant capacity",
  },
  {
    id: "hotel_channel_hold",
    name: "HOTEL CHANNEL INVENTORY HOLD",
    category: "financial",
    scope: "Hotel · OTA / direct",
    threshold: "Premium inventory · high demand night",
    approvers: "Revenue Manager or GM",
    owner: "Revenue",
    autonomy: "prepare",
    duration: "72h hold window",
    reversibility: "Medium · release to OTA",
    audit: "Channel Decision · RMS write prepared only",
    status: "active",
    actionClasses: "Prepare hold · approval to push RMS",
    locationScope: "Per property · channel mix",
  },
];

/** Operating detail for Settings → Locations (demo). */
export const DEMO_LOCATION_SETTINGS: DemoLocationSettingsRow[] = [
  {
    locationId: "loc_berlin_mitte",
    hours: "11:30–23:00",
    ownership: "Owned",
    systems: "POS · labor · delivery · AP",
    overrides: "Close 23:00 · peak hold policy on",
  },
  {
    locationId: "loc_berlin_kreuzberg",
    hours: "12:00–23:00",
    ownership: "Owned",
    systems: "POS · labor · delivery · AP",
    overrides: "Delivery-heavy · refund watch",
  },
  {
    locationId: "loc_hamburg_hafen",
    hours: "11:00–22:30",
    ownership: "Owned",
    systems: "POS · labor · reservations",
    overrides: "Premium attach focus",
  },
  {
    locationId: "loc_frankfurt_westend",
    hours: "11:30–22:00",
    ownership: "Owned",
    systems: "POS · labor · AP",
    overrides: "Procurement shock watch",
  },
  {
    locationId: "loc_munich_altstadt",
    hours: "11:00–23:00",
    ownership: "Owned",
    systems: "POS · labor · reservations",
    overrides: "Labor-heavy lunch",
  },
  {
    locationId: "loc_koln_ehrenfeld",
    hours: "12:00–22:30",
    ownership: "Owned",
    systems: "POS · labor · delivery",
    overrides: "Discount-spend watch",
  },
  {
    locationId: "loc_dusseldorf_medienhafen",
    hours: "11:30–23:00",
    ownership: "Owned",
    systems: "POS · labor · reservations · delivery",
    overrides: "Premium mix",
  },
  {
    locationId: "loc_stuttgart_mitte",
    hours: "11:30–22:00",
    ownership: "Owned",
    systems: "POS · labor · AP",
    overrides: "Stable baseline",
  },
  {
    locationId: "loc_canal_house",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel · labor",
    overrides: "Primary boutique · readiness watch",
  },
  {
    locationId: "loc_ams_harbour",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel · labor",
    overrides: "Larger urban wave",
  },
  {
    locationId: "loc_schiphol_gate",
    hours: "24h · airport",
    ownership: "Owned",
    systems: "PMS · HK · channel",
    overrides: "Airport business mix",
  },
  {
    locationId: "loc_lisbon_alfama",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel",
    overrides: "Leisure seasonality",
  },
  {
    locationId: "loc_berlin_mitte_hotel",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel · labor",
    overrides: "High OTA share",
  },
  {
    locationId: "loc_paris_opera",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel",
    overrides: "Strong direct",
  },
  {
    locationId: "loc_london_clerkenwell",
    hours: "24h front desk",
    ownership: "Owned",
    systems: "PMS · HK · channel · labor",
    overrides: "Boutique city",
  },
  {
    locationId: "loc_munich_airport",
    hours: "24h · airport",
    ownership: "Owned",
    systems: "PMS · HK · channel",
    overrides: "Airport business",
  },
];

export function locationSettingsRow(
  locationId: string,
): DemoLocationSettingsRow | undefined {
  return DEMO_LOCATION_SETTINGS.find((r) => r.locationId === locationId);
}

/** Canonical Settings deep-link for a policy (query params survive client nav). */
export function settingsPolicyHref(policyId?: DemoPolicyId | string): string {
  if (!policyId) return "/app/settings?section=policies&stay=1";
  return `/app/settings?section=policies&policy=${encodeURIComponent(policyId)}&stay=1`;
}

export function settingsSectionHref(section: string): string {
  return `/app/settings?section=${encodeURIComponent(section)}&stay=1`;
}

/** Map a Decision Record to its governing demo policy (deep-link target). */
export function policyRefForDecision(input: {
  id: string;
  decisionType?: string | null;
}): { policyId: DemoPolicyId; label: string } {
  const type = input.decisionType ?? "";
  if (
    input.id === "dec_peak_berlin" ||
    type === "peak_capacity_collision" ||
    type.includes("service_capacity")
  ) {
    return { policyId: "service_capacity", label: "SERVICE CAPACITY" };
  }
  if (
    input.id === "dec_labor_berlin" ||
    type === "labor_peak_rebalance" ||
    type.includes("labor")
  ) {
    return { policyId: "labor_rebalance", label: "LABOR REBALANCE" };
  }
  if (
    input.id === "dec_hotel_readiness_canal" ||
    type === "housekeeping_reassign" ||
    type.includes("housekeeping")
  ) {
    return {
      policyId: "housekeeping_reassign",
      label: "HOUSEKEEPING REASSIGNMENT",
    };
  }
  if (
    input.id === "dec_ota_canal" ||
    type.includes("channel") ||
    type.includes("ota")
  ) {
    return {
      policyId: "hotel_channel_hold",
      label: "HOTEL CHANNEL INVENTORY HOLD",
    };
  }
  if (
    input.id === "dec_margin_coke_berlin" ||
    input.id === "dec_menu_peak_berlin" ||
    type.includes("menu_price") ||
    type.includes("margin")
  ) {
    return { policyId: "menu_price", label: "MENU PRICE CHANGE" };
  }
  if (type.includes("delivery") || type.includes("throttle")) {
    return { policyId: "delivery_throttle", label: "DELIVERY THROTTLE" };
  }
  if (
    input.id === "dec_caster_sugar_berlin" ||
    input.id === "dec_supplier_berlin" ||
    type.includes("supplier") ||
    type.includes("stock")
  ) {
    return {
      policyId: "supplier_emergency",
      label:
        input.id === "dec_caster_sugar_berlin"
          ? "SUPPLIER EMERGENCY ORDER · GM ≤ €250"
          : "SUPPLIER EMERGENCY ORDER",
    };
  }
  return { policyId: "service_capacity", label: "Approvals" };
}

export const ACCESS_ROLE_LABELS: Record<AccessRoleId, string> = {
  admin: "Admin",
  finance: "Finance",
  operations: "Operations",
  location_manager: "Location manager",
  viewer: "Viewer",
};

export const DEMO_USERS_RESTAURANT: DemoUser[] = [
  {
    id: "u_elena",
    name: "Elena Voss",
    email: "elena.voss@northstar.demo",
    role: "CFO",
    accessRole: "finance",
    scope: "Group",
    status: "active",
    lastActive: "2m ago",
    kind: "member",
  },
  {
    id: "u_marcus",
    name: "Marcus Chen",
    email: "marcus.chen@northstar.demo",
    role: "COO",
    accessRole: "operations",
    scope: "All restaurants",
    status: "active",
    lastActive: "14m ago",
    kind: "member",
  },
  {
    id: "u_sarah",
    name: "Sarah Klein",
    email: "sarah.klein@northstar.demo",
    role: "GM Soho · New York",
    accessRole: "location_manager",
    scope: "Soho · New York",
    status: "active",
    lastActive: "1h ago",
    kind: "member",
  },
  {
    id: "u_jordan",
    name: "Jordan Blake",
    email: "jordan.blake@northstar.demo",
    role: "Platform admin",
    accessRole: "admin",
    scope: "Organization",
    status: "active",
    lastActive: "Just now",
    kind: "member",
  },
  {
    id: "u_viewer",
    name: "Alex Rivera",
    email: "alex.rivera@northstar.demo",
    role: "Board observer",
    accessRole: "viewer",
    scope: "Group · read-only",
    status: "invited",
    lastActive: "—",
    kind: "member",
  },
];

export const DEMO_USERS_HOTEL: DemoUser[] = [
  {
    id: "u_elena_h",
    name: "Elena Voss",
    email: "elena.voss@northstar.demo",
    role: "CFO",
    accessRole: "finance",
    scope: "Group",
    status: "active",
    lastActive: "2m ago",
    kind: "member",
  },
  {
    id: "u_marcus_h",
    name: "Marcus Chen",
    email: "marcus.chen@northstar.demo",
    role: "COO",
    accessRole: "operations",
    scope: "All hotels",
    status: "active",
    lastActive: "14m ago",
    kind: "member",
  },
  {
    id: "u_nina",
    name: "Nina Hartmann",
    email: "nina.hartmann@northstar.demo",
    role: "Hotel GM",
    accessRole: "location_manager",
    scope: "Mercer House · New York",
    status: "active",
    lastActive: "35m ago",
    kind: "member",
  },
  {
    id: "u_jordan_h",
    name: "Jordan Blake",
    email: "jordan.blake@northstar.demo",
    role: "Platform admin",
    accessRole: "admin",
    scope: "Organization",
    status: "active",
    lastActive: "Just now",
    kind: "member",
  },
];

export const DEFAULT_AUTONOMY_BY_CLASS: Record<string, AutonomyLadder> = {
  observe: "observe",
  recommend: "recommend",
  prepare: "prepare",
  approval_required: "approve",
  auto_act: "auto",
  scheduling: "prepare",
  reservations: "recommend",
  procurement: "prepare",
  delivery: "prepare",
  supplier_disputes: "prepare",
  table_release: "auto",
};

export const DEFAULT_DEMO_SETTINGS: DemoSettingsState = {
  orgName: "Northstar Restaurants",
  currency: "EUR",
  timezone: "Europe/Berlin",
  fiscalCalendar: "calendar_year",
  operatingModel: "restaurant_model",
  berlinClose: "23:00",
  locationOverrides: {
    loc_berlin_mitte: { closeClock: "23:00" },
  },
  contextWeather: "enabled",
  contextEvents: "enabled",
  contextHolidays: "enabled",
  contextSchoolHolidays: "watching",
  forecastComparison: "plan",
  forecastRevenueHorizonDays: 7,
  forecastLiveHorizonMin: 120,
  forecastWarnBelow: 70,
  forecastReviewBelow: 55,
  forecastNoAutoBelow: 40,
  mfaRequired: false,
  approvalGmMax: 250,
  autonomyScheduling: "prepare",
  autonomyByClass: { ...DEFAULT_AUTONOMY_BY_CLASS },
  notifyNeedsYouEmail: true,
  notifyApprovalEmail: true,
  notifyVerifiedInApp: true,
  quietHoursEnabled: true,
  attentionMaterialityEuro: 80,
  policies: DEMO_POLICIES,
  users: DEMO_USERS_RESTAURANT,
};

function mergeSettings(
  partial: Partial<DemoSettingsState>,
): DemoSettingsState {
  // Always refresh policy catalog from DEMO_POLICIES so enrichment ships;
  // persisted approvalGmMax / autonomy remain on the settings object.
  return {
    ...DEFAULT_DEMO_SETTINGS,
    ...partial,
    locationOverrides: {
      ...DEFAULT_DEMO_SETTINGS.locationOverrides,
      ...(partial.locationOverrides ?? {}),
    },
    autonomyByClass: {
      ...DEFAULT_AUTONOMY_BY_CLASS,
      ...(partial.autonomyByClass ?? {}),
    },
    policies: DEMO_POLICIES,
    users: (partial.users?.length
      ? partial.users
      : DEFAULT_DEMO_SETTINGS.users
    ).map((u) => ({
      ...u,
      email: u.email ?? `${u.id}@northstar.demo`,
      accessRole: u.accessRole ?? "viewer",
      status: u.status ?? "active",
      lastActive: u.lastActive ?? "—",
    })),
  };
}

/** Effective location fields after org defaults + overrides. */
export function effectiveLocationConfig(
  locationId: string,
  settings: DemoSettingsState = readDemoSettings(),
): {
  currency: string;
  timezone: string;
  closeClock: string | null;
  currencyInherited: boolean;
  timezoneInherited: boolean;
  closeInherited: boolean;
} {
  const o = settings.locationOverrides[locationId] ?? {};
  const closeDefault =
    locationId === "loc_berlin_mitte" ? settings.berlinClose : null;
  return {
    currency: o.currency || settings.currency,
    timezone: o.timezone || settings.timezone,
    closeClock: o.closeClock ?? closeDefault,
    currencyInherited: !o.currency,
    timezoneInherited: !o.timezone,
    closeInherited: o.closeClock == null,
  };
}

export function readDemoSettings(): DemoSettingsState {
  if (typeof window === "undefined") return DEFAULT_DEMO_SETTINGS;
  try {
    const raw = localStorage.getItem(DEMO_SETTINGS_KEY);
    if (!raw) return DEFAULT_DEMO_SETTINGS;
    return mergeSettings(JSON.parse(raw) as Partial<DemoSettingsState>);
  } catch {
    return DEFAULT_DEMO_SETTINGS;
  }
}

export function writeDemoSettings(next: DemoSettingsState): void {
  try {
    localStorage.setItem(DEMO_SETTINGS_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent("radr:demo-settings", { detail: next }),
    );
  } catch {
    /* ignore */
  }
}

/** Who must approve a euro amount under current policy. */
export function approvalAuthorityFor(
  amountEuro: number,
  settings: DemoSettingsState = readDemoSettings(),
): {
  label: string;
  level: "gm" | "gm_cfo" | "executive";
  gmMax: number;
} {
  const gmMax = settings.approvalGmMax;
  if (amountEuro <= gmMax) {
    return { label: `GM may approve (≤ €${gmMax})`, level: "gm", gmMax };
  }
  if (amountEuro <= 2000) {
    return {
      label: `GM + CFO (€${gmMax}–€2,000)`,
      level: "gm_cfo",
      gmMax,
    };
  }
  return { label: "Executive approval (> €2,000)", level: "executive", gmMax };
}

export function policyById(
  id: DemoPolicyId,
  settings: DemoSettingsState = readDemoSettings(),
): DemoPolicy | undefined {
  return settings.policies.find((p) => p.id === id) ?? DEMO_POLICIES.find((p) => p.id === id);
}

/** Autonomy ladder label for scheduling class. */
export function autonomyLabel(settings: DemoSettingsState = readDemoSettings()): string {
  switch (settings.autonomyScheduling) {
    case "observe":
      return "Observe only";
    case "recommend":
      return "Recommend";
    case "prepare":
      return "Prepare for approval";
    case "approve":
      return "Execute with approval";
    case "policy":
    case "auto":
      return "Auto-act within policy";
    default:
      return "Prepare for approval";
  }
}

export function autonomyLadderLabel(level: AutonomyLadder): string {
  switch (level) {
    case "observe":
      return "OBSERVE";
    case "recommend":
      return "RECOMMEND";
    case "prepare":
      return "PREPARE";
    case "approve":
      return "APPROVAL REQUIRED";
    case "auto":
      return "AUTO-ACT";
  }
}

export function subscribeDemoSettings(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onStorage = (e: StorageEvent) => {
    if (e.key === DEMO_SETTINGS_KEY) cb();
  };
  const onCustom = () => cb();
  window.addEventListener("storage", onStorage);
  window.addEventListener("radr:demo-settings", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("radr:demo-settings", onCustom);
  };
}
