/**
 * Hospitality Intelligence - occasions, service requirements, allergy safety.
 *
 * RADR handles machine work so people can take care of people.
 *
 * NEVER infer medical allergies. Only explicit guest / reservation / staff sources.
 * Never treat preference / vegan / religious restriction as allergy.
 */

export type HospitalityPriority =
  | "CRITICAL"
  | "PREPARE"
  | "RECOGNIZE"
  | "INFORM";

export type ServiceMomentKind =
  | "birthday"
  | "anniversary"
  | "engagement"
  | "celebration"
  | "returning"
  | "service_recovery";

export type ServiceRequirementKind =
  | "private_dining"
  | "accessible"
  | "quiet_table"
  | "terrace"
  | "dietary"
  | "children"
  | "setup";

/** Explicit allergens only - never inferred. */
export type AllergenCode =
  | "peanut"
  | "tree_nut"
  | "shellfish"
  | "fish"
  | "gluten"
  | "dairy"
  | "egg"
  | "sesame"
  | "soy";

/**
 * Operational communication status - not medical verification.
 */
export type AllergyOpsStatus =
  | "UNCONFIRMED"
  | "CONFIRMED"
  | "FOH_ACKNOWLEDGED"
  | "KITCHEN_ACKNOWLEDGED"
  | "SERVICE_COMPLETE";

export type AllergenContainment =
  | "CONTAINS"
  | "POSSIBLE_CROSS_CONTACT"
  | "UNKNOWN_NEEDS_CONFIRMATION"
  | "NO_IDENTIFIED_INGREDIENT";

export type HospitalitySource = {
  system: string;
  field: string;
  originalText: string;
  recordedAt: string;
};

export type ServiceMoment = {
  id: string;
  reservationId: string;
  tableLabel: string | null;
  time: string;
  partySize: number;
  kind: ServiceMomentKind;
  label: string;
  guestLabel: string | null;
  priority: "RECOGNIZE" | "INFORM";
};

export type ServiceRequirement = {
  id: string;
  reservationId: string;
  tableLabel: string | null;
  time: string;
  partySize: number;
  kind: ServiceRequirementKind;
  label: string;
  note: string;
  priority: "PREPARE" | "INFORM";
};

export type AllergyAlert = {
  id: string;
  reservationId: string;
  tableLabel: string;
  time: string;
  partySize: number;
  /** Which guest in party - operational, not medical ID. */
  guestOfParty: string;
  guestLabel: string | null;
  allergen: AllergenCode;
  allergenLabel: string;
  /** Only when guest/source explicitly stated severity. */
  severityExplicit: "severe" | null;
  status: AllergyOpsStatus;
  /** True when free-text was ambiguous (e.g. "no nuts please"). */
  needsClarification: boolean;
  clarificationHint: string | null;
  fohInstruction: string;
  kitchenInstruction: string;
  source: HospitalitySource;
  /** Prior visit record - must reconfirm tonight. */
  fromPriorVisit: boolean;
  menuContainsCount: number;
  menuCrossContactCount: number;
  fohAcknowledged: boolean;
  kitchenAcknowledged: boolean;
  priority: "CRITICAL";
};

export type DietaryNote = {
  id: string;
  reservationId: string;
  tableLabel: string | null;
  time: string;
  kind: "vegetarian" | "vegan" | "gluten_related" | "preference";
  label: string;
  note: string;
  /** Never an allergy. */
  isAllergy: false;
};

export type MenuAllergenLine = {
  menuItemId: string;
  name: string;
  containment: AllergenContainment;
  detail: string;
};

export type HospitalityAccess = {
  canSeeNamedGuests: boolean;
  canSeeOccasions: boolean;
  canSeeServiceRequirements: boolean;
  /** Individual allergy / dietary detail. */
  canSeeAllergyDetail: boolean;
  /** Kitchen preparation view. */
  canSeeKitchenSafety: boolean;
  aggregatesOnly: boolean;
};

export type SafetyReadiness = {
  allergyReservations: number;
  confirmed: number;
  needsConfirmation: number;
  fohAcknowledged: number;
  kitchenAcknowledged: number;
  /** Something still blocks ready-for-service. */
  needsActionBeforeOpen: boolean;
  actionSummary: string | null;
};
