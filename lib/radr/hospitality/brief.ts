/**
 * Compose Hospitality Tonight brief - material signals only.
 * Priority order in detail: CRITICAL → PREPARE → RECOGNIZE → INFORM.
 */

import type { RoleView } from "@/lib/product/types";
import { hospitalityAccessForRole } from "./access";
import {
  DEMO_ALLERGY_ALERTS,
  DEMO_DIETARY_NOTES,
  DEMO_HOSPITALITY_AGG,
  DEMO_SERVICE_MOMENTS,
  DEMO_SERVICE_REQUIREMENTS,
} from "./demoTonight";
import { menuLinesForAllergen } from "./menuAllergens";
import type {
  AllergyAlert,
  DietaryNote,
  HospitalityAccess,
  SafetyReadiness,
  ServiceMoment,
  ServiceRequirement,
} from "./types";

export type HospitalityTonightBrief = {
  material: boolean;
  /** Surface on CC even when quiet - only if needsAction. */
  needsAction: boolean;
  reservedCovers: number;
  returningGuests: number;
  birthdays: number;
  engagements: number;
  anniversaries: number;
  terraceRequests: number;
  quietTableRequests: number;
  privateDiningSetups: number;
  dietaryNotes: number;
  allergyAlerts: number;
  kitchenCritical: number;
  serviceNotesNeedingAttention: number;
  safety: SafetyReadiness;
  moments: ServiceMoment[] | null;
  requirements: ServiceRequirement[] | null;
  allergies: AllergyAlert[] | null;
  dietary: DietaryNote[] | null;
  /** Top critical row for CC / queue. */
  topCritical: AllergyAlert | null;
  access: HospitalityAccess;
};

function safetyFromAlerts(alerts: AllergyAlert[]): SafetyReadiness {
  const allergyReservations = alerts.filter((a) => !a.needsClarification || a.severityExplicit).length;
  // Count distinct operational allergy reservations (exclude pure ambiguity from "ready" math carefully)
  const ops = alerts.filter((a) => !a.needsClarification);
  const confirmed = ops.filter(
    (a) =>
      a.status === "CONFIRMED" ||
      a.status === "FOH_ACKNOWLEDGED" ||
      a.status === "KITCHEN_ACKNOWLEDGED" ||
      a.status === "SERVICE_COMPLETE",
  ).length;
  const needsConfirmation =
    ops.filter((a) => a.status === "UNCONFIRMED").length +
    alerts.filter((a) => a.needsClarification).length;
  const fohAcknowledged = alerts.filter((a) => a.fohAcknowledged).length;
  const kitchenAcknowledged = alerts.filter((a) => a.kitchenAcknowledged).length;
  const blocked = alerts.find(
    (a) =>
      (!a.kitchenAcknowledged && a.severityExplicit === "severe") ||
      a.needsClarification,
  );
  return {
    allergyReservations: Math.max(allergyReservations, ops.length),
    confirmed,
    needsConfirmation,
    fohAcknowledged,
    kitchenAcknowledged,
    needsActionBeforeOpen: Boolean(blocked),
    actionSummary: blocked
      ? blocked.needsClarification
        ? `${blocked.tableLabel} · clarify nut note before order`
        : `${blocked.tableLabel} · ${blocked.allergenLabel} · kitchen not acknowledged`
      : null,
  };
}

export function composeHospitalityTonightBrief(
  role: RoleView,
): HospitalityTonightBrief {
  const access = hospitalityAccessForRole(role);
  const agg = DEMO_HOSPITALITY_AGG;
  const alerts = DEMO_ALLERGY_ALERTS;
  const safety = safetyFromAlerts(alerts);

  const topCritical =
    alerts.find((a) => !a.kitchenAcknowledged && a.severityExplicit === "severe") ??
    alerts.find((a) => a.needsClarification) ??
    null;

  const material =
    safety.needsActionBeforeOpen ||
    agg.birthdays > 0 ||
    agg.allergyAlerts > 0 ||
    agg.privateDiningSetups > 0 ||
    agg.engagements > 0;

  return {
    material,
    needsAction: safety.needsActionBeforeOpen,
    reservedCovers: agg.reservedCovers,
    returningGuests: agg.returningGuests,
    birthdays: agg.birthdays,
    engagements: agg.engagements,
    anniversaries: agg.anniversaries,
    terraceRequests: agg.terraceRequests,
    quietTableRequests: agg.quietTableRequests,
    privateDiningSetups: agg.privateDiningSetups,
    dietaryNotes: agg.dietaryNotes,
    allergyAlerts: agg.allergyAlerts,
    kitchenCritical: agg.kitchenCritical,
    serviceNotesNeedingAttention: agg.serviceNotesNeedingAttention,
    safety,
    moments: access.canSeeOccasions ? DEMO_SERVICE_MOMENTS : null,
    requirements: access.canSeeServiceRequirements
      ? DEMO_SERVICE_REQUIREMENTS
      : null,
    allergies: access.canSeeAllergyDetail ? alerts : null,
    dietary: access.canSeeAllergyDetail ? DEMO_DIETARY_NOTES : null,
    topCritical: access.canSeeAllergyDetail ? topCritical : null,
    access,
  };
}

export function menuGuidanceForAllergy(alert: AllergyAlert) {
  return menuLinesForAllergen(alert.allergen);
}
