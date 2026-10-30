/**
 * Demo personas — role + scope + presentation priority.
 * Persona is a lens (what RADR shows first), not RBAC.
 */

import type { RoleView } from "@/lib/product/types";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  DEMO_LOCATIONS,
} from "./demoOrg";
import {
  NORTHSTAR_HOTELS,
  NORTHSTAR_RESTAURANTS,
} from "@/lib/radr/demo/organizations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";

export type ScopeType = "LOCATION" | "PORTFOLIO" | "GROUP";

export type PresentationPriority =
  | "deadline"
  | "ops"
  | "economics"
  | "verification"
  | "attribution"
  | "pattern"
  | "group"
  | "inventory"
  | "channel";

export type DemoPersonaId =
  | "gm_berlin"
  | "coo_all"
  | "cfo_group"
  | "owner_group"
  | "service_berlin"
  | "chef_berlin"
  | "hotel_cfo"
  | "hotel_gm_canal"
  | "revenue_portfolio"
  | "hotel_ops"
  | "housekeeping_canal"
  | "front_office_canal";

export type RoleContext = {
  personaId: DemoPersonaId;
  role: RoleView;
  label: string;
  shortLabel: string;
  firstName: string;
  initials: string;
  organizationId: string;
  allowedLocationIds: string[];
  /** Include group / structural Decisions (loc_group). */
  includeGroup: boolean;
  defaultLocationId: string | "all";
  scopeType: ScopeType;
  presentationPriority: PresentationPriority[];
  /** Decision IDs explicitly allowed even if location filter would exclude. */
  allowDecisionIds?: string[];
  /** Decision IDs always hidden for this persona. */
  denyDecisionIds?: string[];
};

const RESTAURANT_LOCATION_IDS = NORTHSTAR_RESTAURANTS.locations.map(
  (l) => l.id,
);
const HOTEL_LOCATION_IDS = NORTHSTAR_HOTELS.locations.map((l) => l.id);

export const DEMO_PERSONAS: Record<DemoPersonaId, RoleContext> = {
  gm_berlin: {
    personaId: "gm_berlin",
    role: "gm",
    label: "General Manager",
    shortLabel: "GM",
    firstName: "Daniel",
    initials: "DN",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [DEMO_LOCATIONS.berlin.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.berlin.id,
    scopeType: "LOCATION",
    presentationPriority: ["deadline", "ops", "economics"],
    denyDecisionIds: [DECISION_IDS.playbook, DECISION_IDS.ota, DECISION_IDS.orphan],
  },
  coo_all: {
    personaId: "coo_all",
    role: "coo",
    label: "COO · All locations",
    shortLabel: "COO · Group",
    firstName: "Marcus",
    initials: "MA",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [...RESTAURANT_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "PORTFOLIO",
    presentationPriority: ["pattern", "group", "deadline", "economics"],
  },
  cfo_group: {
    personaId: "cfo_group",
    role: "cfo",
    label: "CFO · Group",
    shortLabel: "CFO · Group",
    firstName: "Elena",
    initials: "EL",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [...RESTAURANT_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "GROUP",
    presentationPriority: [
      "economics",
      "verification",
      "attribution",
      "pattern",
      "group",
    ],
  },
  owner_group: {
    personaId: "owner_group",
    role: "owner",
    label: "Owner · Group",
    shortLabel: "Owner · Group",
    firstName: "Tom",
    initials: "TH",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [...RESTAURANT_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "GROUP",
    presentationPriority: ["verification", "economics", "group", "pattern"],
  },
  service_berlin: {
    personaId: "service_berlin",
    role: "fb_operator",
    label: "Service Manager",
    shortLabel: "Service",
    firstName: "Nora",
    initials: "NR",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [DEMO_LOCATIONS.berlin.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.berlin.id,
    scopeType: "LOCATION",
    presentationPriority: ["deadline", "ops", "economics"],
    denyDecisionIds: [DECISION_IDS.playbook, DECISION_IDS.ota, DECISION_IDS.orphan],
  },
  chef_berlin: {
    personaId: "chef_berlin",
    role: "head_chef",
    label: "Head Chef",
    shortLabel: "Chef",
    firstName: "Mira",
    initials: "MI",
    organizationId: NORTHSTAR_RESTAURANTS.id,
    allowedLocationIds: [DEMO_LOCATIONS.berlin.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.berlin.id,
    scopeType: "LOCATION",
    presentationPriority: ["ops", "deadline", "economics"],
    denyDecisionIds: [DECISION_IDS.playbook, DECISION_IDS.ota, DECISION_IDS.orphan],
  },
  hotel_cfo: {
    personaId: "hotel_cfo",
    role: "cfo",
    label: "CFO · Hotels",
    shortLabel: "CFO · Portfolio",
    firstName: "Elena",
    initials: "EL",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [...HOTEL_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "GROUP",
    presentationPriority: [
      "economics",
      "channel",
      "verification",
      "group",
    ],
  },
  hotel_gm_canal: {
    personaId: "hotel_gm_canal",
    role: "hotel_gm",
    label: "General Manager",
    shortLabel: "GM",
    firstName: "Nina",
    initials: "NI",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [DEMO_LOCATIONS.canal.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.canal.id,
    scopeType: "LOCATION",
    presentationPriority: ["deadline", "inventory", "channel", "economics"],
    allowDecisionIds: [DECISION_IDS.hotelReadiness, DECISION_IDS.ota],
    denyDecisionIds: [
      DECISION_IDS.peak,
      DECISION_IDS.tableRecover,
      DECISION_IDS.supplier,
      DECISION_IDS.tuna,
      DECISION_IDS.playbook,
      DECISION_IDS.orphan,
      DECISION_IDS.marginCoke,
      DECISION_IDS.menuPeak,
    ],
  },
  revenue_portfolio: {
    personaId: "revenue_portfolio",
    role: "revenue_manager",
    label: "Revenue Manager · Portfolio",
    shortLabel: "Revenue · Portfolio",
    firstName: "Noah",
    initials: "NH",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [...HOTEL_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "PORTFOLIO",
    presentationPriority: ["inventory", "channel", "economics", "deadline"],
    allowDecisionIds: [DECISION_IDS.ota],
    denyDecisionIds: [
      DECISION_IDS.peak,
      DECISION_IDS.tableRecover,
      DECISION_IDS.supplier,
      DECISION_IDS.tuna,
      DECISION_IDS.playbook,
      DECISION_IDS.orphan,
    ],
  },
  hotel_ops: {
    personaId: "hotel_ops",
    role: "coo",
    label: "Operations · All properties",
    shortLabel: "Ops · Portfolio",
    firstName: "Maya",
    initials: "MY",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [...HOTEL_LOCATION_IDS],
    includeGroup: true,
    defaultLocationId: "all",
    scopeType: "PORTFOLIO",
    presentationPriority: ["ops", "deadline", "inventory", "group"],
    allowDecisionIds: [DECISION_IDS.hotelReadiness],
  },
  housekeeping_canal: {
    personaId: "housekeeping_canal",
    role: "housekeeping_manager",
    label: "Housekeeping",
    shortLabel: "HK",
    firstName: "Priya",
    initials: "PR",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [DEMO_LOCATIONS.canal.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.canal.id,
    scopeType: "LOCATION",
    presentationPriority: ["ops", "deadline", "inventory"],
    allowDecisionIds: [DECISION_IDS.hotelReadiness],
    denyDecisionIds: [
      DECISION_IDS.peak,
      DECISION_IDS.tableRecover,
      DECISION_IDS.supplier,
      DECISION_IDS.tuna,
      DECISION_IDS.playbook,
      DECISION_IDS.orphan,
      DECISION_IDS.marginCoke,
      DECISION_IDS.ota,
    ],
  },
  front_office_canal: {
    personaId: "front_office_canal",
    role: "host",
    label: "Front Office",
    shortLabel: "FO",
    firstName: "Sam",
    initials: "SM",
    organizationId: NORTHSTAR_HOTELS.id,
    allowedLocationIds: [DEMO_LOCATIONS.canal.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.canal.id,
    scopeType: "LOCATION",
    presentationPriority: ["deadline", "ops", "inventory"],
    allowDecisionIds: [DECISION_IDS.hotelReadiness],
    denyDecisionIds: [
      DECISION_IDS.peak,
      DECISION_IDS.tableRecover,
      DECISION_IDS.supplier,
      DECISION_IDS.tuna,
      DECISION_IDS.playbook,
      DECISION_IDS.orphan,
      DECISION_IDS.marginCoke,
    ],
  },
};

/** Restaurant demo persona switcher order. */
export const DEMO_PERSONA_ORDER_RESTAURANT: DemoPersonaId[] = [
  "cfo_group",
  "coo_all",
  "gm_berlin",
  "service_berlin",
  "chef_berlin",
  "owner_group",
];

/** Hotel demo persona switcher order. */
export const DEMO_PERSONA_ORDER_HOTEL: DemoPersonaId[] = [
  "hotel_cfo",
  "hotel_gm_canal",
  "revenue_portfolio",
  "hotel_ops",
  "housekeeping_canal",
  "front_office_canal",
];

/** @deprecated Use demoPersonaOrderForVertical — restaurant default. */
export const DEMO_PERSONA_ORDER: DemoPersonaId[] = DEMO_PERSONA_ORDER_RESTAURANT;

export function demoPersonaOrderForVertical(
  v: DemoVerticalFamily,
): DemoPersonaId[] {
  return v === "hotel" ? DEMO_PERSONA_ORDER_HOTEL : DEMO_PERSONA_ORDER_RESTAURANT;
}

/** Map any RoleView onto a canonical demo persona for the active vertical. */
export function personaFromRoleView(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): DemoPersonaId {
  if (vertical === "hotel") {
    switch (role) {
      case "cfo":
      case "finance":
      case "owner":
        return "hotel_cfo";
      case "revenue_manager":
        return "revenue_portfolio";
      case "housekeeping_manager":
        return "housekeeping_canal";
      case "coo":
      case "regional":
        return "hotel_ops";
      case "host":
      case "server":
      case "fb_operator":
        return "front_office_canal";
      case "hotel_gm":
      case "gm":
      default:
        return "hotel_gm_canal";
    }
  }

  switch (role) {
    case "coo":
    case "regional":
      return "coo_all";
    case "owner":
      return "owner_group";
    case "cfo":
    case "finance":
      return "cfo_group";
    case "fb_operator":
    case "host":
    case "server":
      return "service_berlin";
    case "head_chef":
    case "kitchen":
      return "chef_berlin";
    case "gm":
    default:
      return "gm_berlin";
  }
}

export function roleContextFor(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): RoleContext {
  const base = DEMO_PERSONAS[personaFromRoleView(role, vertical)];
  const orgId =
    vertical === "hotel" ? NORTHSTAR_HOTELS.id : NORTHSTAR_RESTAURANTS.id;

  if (
    base.scopeType === "GROUP" ||
    base.scopeType === "PORTFOLIO" ||
    base.defaultLocationId === "all"
  ) {
    const allowed =
      vertical === "hotel" ? HOTEL_LOCATION_IDS : RESTAURANT_LOCATION_IDS;
    return {
      ...base,
      organizationId: orgId,
      allowedLocationIds: [...allowed],
    };
  }

  return { ...base, organizationId: orgId };
}

export function personaLabel(
  role: RoleView,
  vertical: DemoVerticalFamily = "restaurant",
): string {
  return roleContextFor(role, vertical).label;
}

/**
 * Explicit vertical persona mapping — never invent "Hotel Chef".
 * Used when switching Restaurants ↔ Hotels while preserving intent.
 */
export function mapRoleAcrossVertical(
  role: RoleView,
  from: DemoVerticalFamily,
  to: DemoVerticalFamily,
): RoleView {
  if (from === to) return role;
  if (to === "hotel") {
    switch (role) {
      case "cfo":
      case "finance":
      case "owner":
        return role === "owner" ? "owner" : "cfo";
      case "coo":
      case "regional":
        return "coo";
      case "revenue_manager":
        return "revenue_manager";
      case "housekeeping_manager":
        return "housekeeping_manager";
      case "fb_operator":
      case "host":
      case "server":
        return "host"; // Front Office lens
      case "head_chef":
      case "kitchen":
        return "coo"; // hotel ops — no Chef persona
      case "hotel_gm":
      case "gm":
      default:
        return "hotel_gm";
    }
  }
  // hotel → restaurant
  switch (role) {
    case "cfo":
    case "finance":
    case "owner":
      return role === "owner" ? "owner" : "cfo";
    case "coo":
    case "regional":
      return "coo";
    case "revenue_manager":
      return "coo";
    case "housekeeping_manager":
      return "head_chef";
    case "host":
    case "server":
    case "fb_operator":
      return "fb_operator";
    case "hotel_gm":
    case "gm":
    default:
      return "gm";
  }
}
