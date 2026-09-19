/**
 * Four canonical demo personas — role + scope + presentation priority.
 * One Decision object; different filter + emphasis.
 */

import type { RoleView } from "@/lib/product/types";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  ALL_DEMO_LOCATION_IDS,
  DEMO_LOCATIONS,
  DEMO_ORG,
  type DemoLocationId,
} from "./demoOrg";

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
  | "revenue_canal";

export type RoleContext = {
  personaId: DemoPersonaId;
  role: RoleView;
  label: string;
  shortLabel: string;
  firstName: string;
  initials: string;
  organizationId: string;
  allowedLocationIds: DemoLocationId[];
  /** Include group / structural Decisions (loc_group). */
  includeGroup: boolean;
  defaultLocationId: DemoLocationId | "all";
  scopeType: ScopeType;
  presentationPriority: PresentationPriority[];
  /** Decision IDs explicitly allowed even if location filter would exclude. */
  allowDecisionIds?: string[];
  /** Decision IDs always hidden for this persona. */
  denyDecisionIds?: string[];
};

export const DEMO_PERSONAS: Record<DemoPersonaId, RoleContext> = {
  gm_berlin: {
    personaId: "gm_berlin",
    role: "gm",
    label: "General Manager · Berlin Mitte",
    shortLabel: "GM · Berlin",
    firstName: "Sarah",
    initials: "SR",
    organizationId: DEMO_ORG.id,
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
    shortLabel: "COO · All",
    firstName: "Marcus",
    initials: "MA",
    organizationId: DEMO_ORG.id,
    allowedLocationIds: [...ALL_DEMO_LOCATION_IDS],
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
    organizationId: DEMO_ORG.id,
    allowedLocationIds: [...ALL_DEMO_LOCATION_IDS],
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
  revenue_canal: {
    personaId: "revenue_canal",
    role: "revenue_manager",
    label: "Revenue · Canal House",
    shortLabel: "Revenue · Canal",
    firstName: "Nina",
    initials: "NI",
    organizationId: DEMO_ORG.id,
    allowedLocationIds: [DEMO_LOCATIONS.canal.id],
    includeGroup: false,
    defaultLocationId: DEMO_LOCATIONS.canal.id,
    scopeType: "LOCATION",
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
};

/** Only these four appear in demo persona switchers. */
export const DEMO_PERSONA_ORDER: DemoPersonaId[] = [
  "gm_berlin",
  "coo_all",
  "cfo_group",
  "revenue_canal",
];

/** Map any RoleView onto a canonical demo persona. */
export function personaFromRoleView(role: RoleView): DemoPersonaId {
  switch (role) {
    case "coo":
    case "regional":
    case "owner":
      return "coo_all";
    case "cfo":
    case "finance":
      return "cfo_group";
    case "revenue_manager":
    case "hotel_gm":
      return "revenue_canal";
    case "gm":
    case "fb_operator":
    case "head_chef":
    case "kitchen":
    case "host":
    case "server":
    case "housekeeping_manager":
    default:
      return "gm_berlin";
  }
}

export function roleContextFor(role: RoleView): RoleContext {
  return DEMO_PERSONAS[personaFromRoleView(role)];
}

export function personaLabel(role: RoleView): string {
  return roleContextFor(role).label;
}
