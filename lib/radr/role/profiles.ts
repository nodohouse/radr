/**
 * First-class role profiles - same operating truth, different decision lens.
 * Demo personas only; live auth maps separately via platform RBAC.
 */

import type { RoleView } from "@/lib/product/types";
import type { ButlerRole } from "@/lib/radr/butler/types";
import type { Territory } from "@/lib/radr/domain";
import type { LocationScope } from "@/lib/product/demo/dashboard";

export type BriefModule =
  | "tonight"
  | "exposure"
  | "verified"
  | "recoverable"
  | "locations"
  | "drivers"
  | "pulse";

export type MetricEmphasis =
  | "service"
  | "money"
  | "locations"
  | "recovery"
  | "pulse";

export type FindingWeights = {
  territory: Partial<Record<Territory, number>>;
  urgency: { ACT_NOW: number; TODAY: number; WATCH: number };
  /** Multiplier on financialImpact.primaryValue (normalized later). */
  money: number;
  /** Prefer multi-location / group scope items. */
  groupScope: number;
};

export type RoleProfile = {
  id: RoleView;
  label: string;
  shortLabel: string;
  firstName: string;
  initials: string;
  butlerRole: ButlerRole;
  defaultScope: (homeId: string) => LocationScope;
  modules: BriefModule[];
  metricEmphasis: MetricEmphasis;
  findingWeights: FindingWeights;
  /** Primary CTA wording on the brief. */
  reviewCta: string;
  /** One-line POV for demo role switcher. */
  demoBlurb: string;
};

const TERR_FLAT: FindingWeights["territory"] = {
  BUY: 1,
  LABOR: 1,
  SELL: 1,
  RECOVER: 1,
};

export const ROLE_PROFILES: Record<RoleView, RoleProfile> = {
  gm: {
    id: "gm",
    label: "General Manager",
    shortLabel: "GM",
    firstName: "Sarah",
    initials: "SR",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight", "pulse"],
    metricEmphasis: "service",
    reviewCta: "Review tonight",
    demoBlurb: "Live operation · people · service · financial impact",
    findingWeights: {
      territory: { LABOR: 1.45, SELL: 1.25, BUY: 0.95, RECOVER: 0.85 },
      urgency: { ACT_NOW: 1.4, TODAY: 1.15, WATCH: 0.7 },
      money: 0.9,
      groupScope: 0.7,
    },
  },
  hotel_gm: {
    id: "hotel_gm",
    label: "Hotel General Manager",
    shortLabel: "Hotel GM",
    firstName: "Elena",
    initials: "EL",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight", "pulse"],
    metricEmphasis: "service",
    reviewCta: "Review property",
    demoBlurb: "Occupancy · room readiness · arrivals · guest moments",
    findingWeights: {
      territory: { LABOR: 1.5, SELL: 1.2, BUY: 0.8, RECOVER: 1.15 },
      urgency: { ACT_NOW: 1.45, TODAY: 1.2, WATCH: 0.75 },
      money: 1.0,
      groupScope: 0.65,
    },
  },
  revenue_manager: {
    id: "revenue_manager",
    label: "Revenue Manager",
    shortLabel: "Revenue",
    firstName: "Noah",
    initials: "NH",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["pulse", "drivers"],
    metricEmphasis: "money",
    reviewCta: "Review pace",
    demoBlurb: "Occupancy · ADR · RevPAR · channel mix · pickup",
    findingWeights: {
      territory: { SELL: 1.5, RECOVER: 1.2, LABOR: 0.7, BUY: 0.7 },
      urgency: { ACT_NOW: 1.2, TODAY: 1.3, WATCH: 1.0 },
      money: 1.35,
      groupScope: 0.9,
    },
  },
  housekeeping_manager: {
    id: "housekeeping_manager",
    label: "Housekeeping Manager",
    shortLabel: "Housekeeping",
    firstName: "Priya",
    initials: "PR",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight"],
    metricEmphasis: "service",
    reviewCta: "Review readiness",
    demoBlurb: "Departures · room readiness · turnaround · arrivals",
    findingWeights: {
      territory: { LABOR: 1.6, SELL: 0.6, BUY: 0.5, RECOVER: 0.7 },
      urgency: { ACT_NOW: 1.5, TODAY: 1.2, WATCH: 0.8 },
      money: 0.7,
      groupScope: 0.5,
    },
  },
  coo: {
    id: "coo",
    label: "COO / Operations",
    shortLabel: "COO",
    firstName: "Maya",
    initials: "MY",
    butlerRole: "regional_manager",
    defaultScope: () => "all",
    modules: ["locations", "drivers", "pulse"],
    metricEmphasis: "locations",
    reviewCta: "Review exceptions",
    demoBlurb: "Multi-site exceptions · drivers · operating pulse",
    findingWeights: {
      territory: { LABOR: 1.15, SELL: 1.1, BUY: 1.25, RECOVER: 1.2 },
      urgency: { ACT_NOW: 1.25, TODAY: 1.25, WATCH: 0.9 },
      money: 1.05,
      groupScope: 1.55,
    },
  },
  cfo: {
    id: "cfo",
    label: "CFO",
    shortLabel: "CFO",
    firstName: "Alex",
    initials: "AX",
    butlerRole: "group_cfo",
    defaultScope: () => "all",
    modules: ["exposure", "verified", "recoverable", "locations", "drivers"],
    metricEmphasis: "money",
    reviewCta: "Review highest value",
    demoBlurb: "Contribution · exposure · recoverable € · not floor tables",
    findingWeights: {
      territory: { BUY: 1.85, RECOVER: 1.9, LABOR: 0.62, SELL: 0.8 },
      urgency: { ACT_NOW: 1.05, TODAY: 1.3, WATCH: 0.95 },
      money: 1.65,
      groupScope: 1.25,
    },
  },
  regional: {
    id: "regional",
    label: "Area / Regional Manager",
    shortLabel: "Regional",
    firstName: "Lena",
    initials: "LB",
    butlerRole: "regional_manager",
    defaultScope: () => "region_nl",
    modules: ["locations", "tonight", "pulse"],
    metricEmphasis: "locations",
    reviewCta: "Review your locations",
    demoBlurb: "Area performance · exceptions across venues",
    findingWeights: {
      territory: { LABOR: 1.25, SELL: 1.2, BUY: 1.0, RECOVER: 0.95 },
      urgency: { ACT_NOW: 1.35, TODAY: 1.2, WATCH: 0.8 },
      money: 1.05,
      groupScope: 1.15,
    },
  },
  owner: {
    id: "owner",
    label: "Owner",
    shortLabel: "Owner",
    firstName: "Tom",
    initials: "TH",
    butlerRole: "group_cfo",
    defaultScope: () => "all",
    modules: ["pulse", "verified", "exposure"],
    metricEmphasis: "pulse",
    reviewCta: "Review what needs you",
    demoBlurb: "Executive pulse · contribution · verified value · no table noise",
    findingWeights: {
      territory: TERR_FLAT,
      urgency: { ACT_NOW: 1.3, TODAY: 1.1, WATCH: 0.55 },
      money: 1.25,
      groupScope: 1.1,
    },
  },
  finance: {
    id: "finance",
    label: "Finance",
    shortLabel: "Finance",
    firstName: "James",
    initials: "JO",
    butlerRole: "group_cfo",
    defaultScope: () => "all",
    modules: ["recoverable", "verified", "drivers"],
    metricEmphasis: "recovery",
    reviewCta: "Review recoveries",
    demoBlurb: "Recoverable money · verified outcomes · drivers",
    findingWeights: {
      territory: { BUY: 1.5, RECOVER: 1.55, LABOR: 0.7, SELL: 0.75 },
      urgency: { ACT_NOW: 1.15, TODAY: 1.2, WATCH: 0.95 },
      money: 1.4,
      groupScope: 1.1,
    },
  },
  fb_operator: {
    id: "fb_operator",
    label: "F&B / Hotel Operator",
    shortLabel: "F&B",
    firstName: "Sara",
    initials: "SN",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight", "pulse"],
    metricEmphasis: "service",
    reviewCta: "Review service",
    demoBlurb: "Service flow · labor · sell · guest impact",
    findingWeights: {
      territory: { LABOR: 1.4, SELL: 1.35, BUY: 0.9, RECOVER: 0.8 },
      urgency: { ACT_NOW: 1.45, TODAY: 1.2, WATCH: 0.65 },
      money: 0.85,
      groupScope: 0.65,
    },
  },
  head_chef: {
    id: "head_chef",
    label: "Head Chef",
    shortLabel: "Chef",
    firstName: "Kenji",
    initials: "KT",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight", "pulse"],
    metricEmphasis: "service",
    reviewCta: "Fix kitchen",
    demoBlurb: "Kitchen readiness · prep · stock · allergies",
    findingWeights: {
      territory: { BUY: 1.6, SELL: 1.2, LABOR: 0.9, RECOVER: 0.4 },
      urgency: { ACT_NOW: 1.5, TODAY: 1.2, WATCH: 0.6 },
      money: 0.55,
      groupScope: 0.4,
    },
  },
  kitchen: {
    id: "kitchen",
    label: "Kitchen",
    shortLabel: "Kitchen",
    firstName: "Line",
    initials: "LN",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight"],
    metricEmphasis: "service",
    reviewCta: "Open prep",
    demoBlurb: "Prep board · tickets · station pressure",
    findingWeights: {
      territory: { BUY: 1.5, SELL: 1.0, LABOR: 0.7, RECOVER: 0.3 },
      urgency: { ACT_NOW: 1.55, TODAY: 1.1, WATCH: 0.5 },
      money: 0.35,
      groupScope: 0.3,
    },
  },
  host: {
    id: "host",
    label: "Host",
    shortLabel: "Host",
    firstName: "Nora",
    initials: "NR",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight", "pulse"],
    metricEmphasis: "service",
    reviewCta: "Open hospitality",
    demoBlurb: "Guests · seating · occasions · recovery",
    findingWeights: {
      territory: { SELL: 1.5, LABOR: 1.1, BUY: 0.5, RECOVER: 0.4 },
      urgency: { ACT_NOW: 1.35, TODAY: 1.15, WATCH: 0.7 },
      money: 0.4,
      groupScope: 0.35,
    },
  },
  server: {
    id: "server",
    label: "Server",
    shortLabel: "Server",
    firstName: "Eli",
    initials: "EL",
    butlerRole: "location_manager",
    defaultScope: (home) => home,
    modules: ["tonight"],
    metricEmphasis: "service",
    reviewCta: "Open section",
    demoBlurb: "Section service · guest moments",
    findingWeights: {
      territory: { SELL: 1.4, LABOR: 1.0, BUY: 0.4, RECOVER: 0.3 },
      urgency: { ACT_NOW: 1.4, TODAY: 1.1, WATCH: 0.65 },
      money: 0.25,
      groupScope: 0.25,
    },
  },
};

export const ROLE_ORDER: RoleView[] = [
  "gm",
  "hotel_gm",
  "housekeeping_manager",
  "revenue_manager",
  "head_chef",
  "kitchen",
  "host",
  "server",
  "owner",
  "coo",
  "regional",
  "cfo",
  "finance",
  "fb_operator",
];

/** Demo POV switcher groups - same truth, different lens. */
export const DEMO_ROLE_GROUPS: {
  label: string;
  roles: RoleView[];
}[] = [
  {
    label: "Operations",
    roles: ["gm", "hotel_gm", "regional", "coo", "fb_operator"],
  },
  {
    label: "Hotel",
    roles: ["hotel_gm", "housekeeping_manager", "revenue_manager"],
  },
  {
    label: "Finance",
    roles: ["cfo", "finance"],
  },
  {
    label: "Service",
    roles: ["head_chef", "kitchen", "host", "server"],
  },
  {
    label: "Executive",
    roles: ["owner"],
  },
];

export function getRoleProfile(role: RoleView): RoleProfile {
  return ROLE_PROFILES[role] ?? ROLE_PROFILES.gm;
}

export function defaultScopeForRole(
  role: RoleView,
  homeId: string,
): LocationScope {
  return getRoleProfile(role).defaultScope(homeId);
}
