/**
 * Venue-aware terminology — never hardcode cover/table/room in core UI.
 */

import type { HospitalityOperatingProfile } from "@/lib/radr/domain/hospitalityOperatingProfile";
import type { UniversalPhase } from "@/lib/radr/domain/hospitalityOperatingProfile";

export type TerminologyTokens = {
  inventoryUnitSingular: string;
  inventoryUnitPlural: string;
  demandUnit: string;
  demandUnitPlural: string;
  recoveryOpenedLabel: string;
  guestLabel: string;
  /** Universal phase → venue-native label */
  phaseLabel: Record<UniversalPhase, string>;
  /** Short operating rhythm for chrome (Pre-shift · Live · …) */
  rhythmLabels: {
    prepare: string;
    operate: string;
    turnover: string;
    after: string;
  };
};

const RESTAURANT_TERMS: TerminologyTokens = {
  inventoryUnitSingular: "Table",
  inventoryUnitPlural: "Tables",
  demandUnit: "Cover",
  demandUnitPlural: "Covers",
  recoveryOpenedLabel: "Table opened",
  guestLabel: "Guest",
  phaseLabel: {
    PREPARE: "Pre-shift",
    OPERATE: "Live service",
    TURNOVER: "Closing",
    RECOVER: "Recover",
    VERIFY: "Verify",
    LEARN: "After",
  },
  rhythmLabels: {
    prepare: "Pre-shift",
    operate: "Live",
    turnover: "Closing",
    after: "After",
  },
};

const BOUTIQUE_HOTEL_TERMS: TerminologyTokens = {
  inventoryUnitSingular: "Room",
  inventoryUnitPlural: "Rooms",
  demandUnit: "Room night",
  demandUnitPlural: "Room nights",
  recoveryOpenedLabel: "Room night opened",
  guestLabel: "Guest",
  phaseLabel: {
    PREPARE: "Pre-arrival",
    OPERATE: "In-house",
    TURNOVER: "Turnover",
    RECOVER: "Recover",
    VERIFY: "Verify",
    LEARN: "Post-stay",
  },
  rhythmLabels: {
    prepare: "House brief",
    operate: "In-house",
    turnover: "Turnover",
    after: "Post-stay",
  },
};

const VACATION_TERMS: TerminologyTokens = {
  inventoryUnitSingular: "Unit",
  inventoryUnitPlural: "Units",
  demandUnit: "Night",
  demandUnitPlural: "Nights",
  recoveryOpenedLabel: "Nights opened",
  guestLabel: "Guest",
  phaseLabel: {
    PREPARE: "Pre-check-in",
    OPERATE: "Stay",
    TURNOVER: "Turnover",
    RECOVER: "Recover",
    VERIFY: "Verify",
    LEARN: "Post-stay",
  },
  rhythmLabels: {
    prepare: "House brief",
    operate: "Stay",
    turnover: "Turnover",
    after: "Post-stay",
  },
};

const SPA_TERMS: TerminologyTokens = {
  inventoryUnitSingular: "Treatment slot",
  inventoryUnitPlural: "Treatment slots",
  demandUnit: "Appointment",
  demandUnitPlural: "Appointments",
  recoveryOpenedLabel: "Treatment slot opened",
  guestLabel: "Guest",
  phaseLabel: {
    PREPARE: "Pre-session",
    OPERATE: "Live",
    TURNOVER: "Reset",
    RECOVER: "Recover",
    VERIFY: "Verify",
    LEARN: "After",
  },
  rhythmLabels: {
    prepare: "Pre-session",
    operate: "Live",
    turnover: "Reset",
    after: "After",
  },
};

export function terminologyForProfile(
  profile: HospitalityOperatingProfile | null | undefined,
): TerminologyTokens {
  if (!profile) return RESTAURANT_TERMS;
  switch (profile.id) {
    case "boutique_hotel":
    case "hotel":
    case "resort_mixed":
      return BOUTIQUE_HOTEL_TERMS;
    case "serviced_apartments":
    case "vacation_rental":
      return VACATION_TERMS;
    case "spa":
      return SPA_TERMS;
    case "bar":
      return {
        ...RESTAURANT_TERMS,
        inventoryUnitSingular: "Table",
        demandUnit: "Cover",
        demandUnitPlural: "Covers",
      };
    default:
      return RESTAURANT_TERMS;
  }
}

export function phaseLabel(
  profile: HospitalityOperatingProfile | null | undefined,
  phase: UniversalPhase,
): string {
  return terminologyForProfile(profile).phaseLabel[phase];
}
