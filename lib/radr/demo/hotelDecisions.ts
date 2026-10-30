/**
 * Hotel Decision catalog — deep Decision families for Northstar Hotels.
 * Same Decision object model as restaurant. Different classes + economics.
 *
 * SSOT: docs/HOTEL_DECISION_CATALOG.md
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type HotelDecisionSeed = {
  id: string;
  displayId: string;
  family: string;
  title: string;
  verb: string;
  locationId: string;
  locationLabel: string;
  economicEuro: number;
  economicFormatted: string;
  deadlineLabel: string;
  attention: "needs_you" | "handling" | "watching";
  why: string;
  futures: { id: string; label: string; value: string; preferred?: boolean }[];
};

/** Extend display map conceptually — IDs stay stable in demos. */
export const HOTEL_DECISION_IDS = {
  readiness: DECISION_IDS.hotelReadiness,
  channel: DECISION_IDS.ota, // existing D-2201
  cancelRecover: "dec_hotel_cancel_recover_canal",
  overbook: "dec_hotel_overbook_canal",
  upsell: "dec_hotel_upsell_canal",
  hkStaff: "dec_hotel_hk_staff_canal",
  groupDisplace: "dec_hotel_group_canal",
  maintenance: "dec_hotel_ooo_canal",
  breakfast: "dec_hotel_breakfast_canal",
  rateDemand: "dec_hotel_rate_canal",
} as const;

export function hotelNeedsYouDecisions(): HotelDecisionSeed[] {
  return [
    {
      id: HOTEL_DECISION_IDS.readiness,
      displayId: "D-H-9201",
      family: "ROOM_READINESS",
      title: "Reassign 2 housekeepers · check-in wave",
      verb: "REASSIGN 2 HOUSEKEEPERS",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 1840,
      economicFormatted: "€1,840",
      deadlineLabel: "before 14:40",
      attention: "needs_you",
      why: "42 arrivals · 31 ready · 7 at risk · Floor 3 behind",
      futures: [
        { id: "keep", label: "Keep allocation", value: "€0 · 7 at risk" },
        {
          id: "reassign",
          label: "Reassign 2 HK",
          value: "+€1,840 protected",
          preferred: true,
        },
        { id: "vip", label: "Prioritize VIP + early", value: "+€920" },
        { id: "extra", label: "Call flex labor", value: "+€1,620 · −€280 labor" },
      ],
    },
    {
      id: HOTEL_DECISION_IDS.channel,
      displayId: "D-2201",
      family: "CHANNEL_ALLOCATION",
      title: "Hold premium rooms direct 72 hours",
      verb: "HOLD DIRECT 72H",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 3100,
      economicFormatted: "€3,100",
      deadlineLabel: "tonight",
      attention: "needs_you",
      why: "Canal View inventory · OTA ask vs direct pickup probability",
      futures: [
        {
          id: "hold",
          label: "Hold direct 72h",
          value: "+€3,100 net",
          preferred: true,
        },
        { id: "release", label: "Release to OTA", value: "+€0 · commission drag" },
        { id: "rate", label: "Raise rate", value: "+€1,800" },
      ],
    },
    {
      id: HOTEL_DECISION_IDS.hkStaff,
      displayId: "D-2408",
      family: "HOUSEKEEPING_STAFFING",
      title: "Close 14:00–15:00 housekeeping gap",
      verb: "CALL FLEXIBLE LABOR",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 620,
      economicFormatted: "€620",
      deadlineLabel: "40m",
      attention: "needs_you",
      why: "Required 11.4 FTE · scheduled 9.2 · gap −2.2",
      futures: [
        { id: "ot", label: "Overtime", value: "+€420 · −€180 labor" },
        {
          id: "flex",
          label: "Call flexible labor",
          value: "+€620",
          preferred: true,
        },
        { id: "realloc", label: "Reallocate floors", value: "+€310" },
      ],
    },
    {
      id: HOTEL_DECISION_IDS.cancelRecover,
      displayId: "D-2412",
      family: "CANCELLATION_RECOVERY",
      title: "Recover cancelled Canal View · 20h out",
      verb: "TARGETED CRM OFFER",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 890,
      economicFormatted: "€890",
      deadlineLabel: "20h",
      attention: "needs_you",
      why: "Premium cancel · refill via direct vs OTA",
      futures: [
        { id: "direct", label: "Direct only", value: "+€520 expected" },
        {
          id: "crm",
          label: "Targeted CRM",
          value: "+€890",
          preferred: true,
        },
        { id: "ota", label: "OTA release", value: "+€640 · −commission" },
        { id: "none", label: "No action", value: "€0 · empty risk" },
      ],
    },
  ];
}

export function hotelHandlingDecisions(): HotelDecisionSeed[] {
  return [
    {
      id: HOTEL_DECISION_IDS.maintenance,
      displayId: "D-2420",
      family: "MAINTENANCE_OOO",
      title: "Expedite OOO repair · 3 rooms",
      verb: "EXPEDITE MAINTENANCE",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 1620,
      economicFormatted: "€1,620",
      deadlineLabel: "handling",
      attention: "handling",
      why: "Repair €420 · revenue protected €1,620 · 94% occ expected",
      futures: [],
    },
    {
      id: HOTEL_DECISION_IDS.upsell,
      displayId: "D-2424",
      family: "UPSELL_ANCILLARY",
      title: "Pre-arrival upgrade offers · 14 eligible",
      verb: "PREPARE UPGRADE OFFERS",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
      economicEuro: 740,
      economicFormatted: "€740",
      deadlineLabel: "handling",
      attention: "handling",
      why: "Premium inventory available · conversion model ready",
      futures: [],
    },
    {
      id: HOTEL_DECISION_IDS.overbook,
      displayId: "D-2428",
      family: "OVERBOOKING",
      title: "Deluxe projected −2 availability",
      verb: "CLOSE CHANNEL + UPGRADE PATH",
      locationId: "loc_ams_harbour",
      locationLabel: "Harbour",
      economicEuro: 1100,
      economicFormatted: "€1,100",
      deadlineLabel: "handling",
      attention: "handling",
      why: "Controlled oversell vs walk contingency",
      futures: [],
    },
  ];
}

export function hotelVerifiedExamples() {
  return [
    {
      id: "vv_ota_avoided",
      label: "OTA commission avoided",
      euro: 1840,
      kind: "avoided" as const,
      decisionId: "dec_hotel_vv_ota_avoided",
      sourceDecisionId: HOTEL_DECISION_IDS.channel,
      displayId: "D-2201·V",
      family: "CHANNEL_ALLOCATION",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
    },
    {
      id: "vv_premium_protected",
      label: "Premium room revenue protected",
      euro: 1620,
      kind: "protected" as const,
      decisionId: "dec_hotel_vv_readiness",
      sourceDecisionId: HOTEL_DECISION_IDS.readiness,
      displayId: "D-HK-09·V",
      family: "ROOM_READINESS",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
    },
    {
      id: "vv_cancel_recovered",
      label: "Cancelled room recovered",
      euro: 890,
      kind: "recovered" as const,
      decisionId: "dec_hotel_vv_cancel",
      sourceDecisionId: HOTEL_DECISION_IDS.cancelRecover,
      displayId: "D-2410·V",
      family: "CANCEL_RECOVER",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
    },
    {
      id: "vv_ooo_restored",
      label: "OOO room restored",
      euro: 1620,
      kind: "recovered" as const,
      decisionId: "dec_hotel_vv_ooo",
      sourceDecisionId: HOTEL_DECISION_IDS.maintenance,
      displayId: "D-2418·V",
      family: "MAINTENANCE_OOO",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
    },
    {
      id: "vv_upgrade",
      label: "Upgrade contribution created",
      euro: 740,
      kind: "created" as const,
      decisionId: "dec_hotel_vv_upgrade",
      sourceDecisionId: HOTEL_DECISION_IDS.upsell,
      displayId: "D-2422·V",
      family: "ANCILLARY_UPSELL",
      locationId: "loc_canal_house",
      locationLabel: "Mercer House",
    },
  ];
}

/** Sum of hotel Verified Value examples (MTD demo). */
export function hotelVerifiedTotal(): number {
  return hotelVerifiedExamples().reduce((s, v) => s + v.euro, 0);
}
