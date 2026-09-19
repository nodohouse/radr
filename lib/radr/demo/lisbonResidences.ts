/**
 * Lisbon Residences — serviced apartments DEMO fixture.
 * Parallel to Canal House / Berlin; does not replace them.
 */

import type { Prediction } from "@/lib/radr/domain/intelligence";
import type { PerishableInventoryOpportunity } from "@/lib/radr/activeRevenue/liveRecovery";
import { predictionSchema } from "@/lib/radr/domain/intelligence";
import type { StayArrival } from "@/lib/radr/demo/stayGuests";

export const LISBON_RESIDENCES_LOCATION_ID = "loc_lis_residences";
export const LISBON_RESIDENCES_ORG_ID = "org_lisbon_residences";

export const LISBON_RESIDENCES = {
  id: LISBON_RESIDENCES_LOCATION_ID,
  name: "Lisbon Residences",
  city: "Lisbon",
  country: "Portugal",
  units: 84,
  street: "Rua da Misericórdia 78",
  unitTypes: ["Studio", "One Bed", "Two Bed", "Loft"] as const,
} as const;

export type ResidencesPulse = {
  occupancyPct: number;
  checkIns: number;
  checkOuts: number;
  turnovers: number;
  unitsReady: number;
  unitsCleaning: number;
  unitsDelayed: number;
  unitsMaintenance: number;
  needsYou: number;
  radrHandling: number;
  verifiedToday: number;
  adr: number;
  revpar: number;
  directSharePct: number;
  orphanNights: number;
  avgLos: number;
};

export const lisbonTonight = (): ResidencesPulse => ({
  occupancyPct: 78,
  checkIns: 9,
  checkOuts: 7,
  turnovers: 5,
  unitsReady: 71,
  unitsCleaning: 5,
  unitsDelayed: 1,
  unitsMaintenance: 1,
  needsYou: 2,
  radrHandling: 3,
  verifiedToday: 164,
  adr: 142,
  revpar: 111,
  directSharePct: 34,
  orphanNights: 1,
  avgLos: 4.2,
});

export type ResidencesUnitStatus =
  | "ready"
  | "cleaning"
  | "delayed"
  | "occupied"
  | "maintenance";

export type ResidencesUnit = {
  id: string;
  number: string;
  type: (typeof LISBON_RESIDENCES.unitTypes)[number];
  status: ResidencesUnitStatus;
  guestName?: string;
  checkInAt?: string;
  checkOutAt?: string;
  note?: string;
  radar?: string;
};

export function lisbonUnits(): ResidencesUnit[] {
  return [
    {
      id: "u24",
      number: "24",
      type: "One Bed",
      status: "delayed",
      guestName: "Silva",
      checkInAt: "15:00",
      note: "Cleaning projected 15:18 · 18 min late",
      radar: "Kitchen deep-clean still open · +12 min vs studio",
    },
    {
      id: "u31",
      number: "31",
      type: "Two Bed",
      status: "maintenance",
      note: "AC repair · blocks tomorrow arrival",
      radar: "AC ×2 unit — whole stay blocked, not just one bedroom",
    },
    {
      id: "u12",
      number: "12",
      type: "Studio",
      status: "ready",
      note: "Orphan Tuesday night · open for 1-night",
      radar: "Strong orphan-night candidate · disclose no separate bedroom",
    },
    {
      id: "u48",
      number: "48",
      type: "Loft",
      status: "cleaning",
      checkOutAt: "11:00",
      note: "Checkout done · next arrival 16:00",
      radar: "Mezzanine stairs — confirm guest mobility before assign",
    },
    {
      id: "u7",
      number: "7",
      type: "One Bed",
      status: "occupied",
      guestName: "Chen",
      checkOutAt: "10:00",
    },
    {
      id: "u55",
      number: "55",
      type: "Studio",
      status: "ready",
      guestName: "Okoro",
      checkInAt: "14:00",
      note: "Returning · 3 prior stays",
      radar: "Returning guest · desk + Wi‑Fi were reasons for rebook",
    },
  ];
}

/** Who is arriving today — residences continuity signals. */
export function lisbonStayArrivals(): StayArrival[] {
  return [
    {
      id: "la1",
      time: "14:00",
      unit: "55",
      unitKind: "unit",
      guestName: "Okoro",
      partySize: 1,
      nights: 12,
      unitType: "Studio",
      priorStays: 3,
      signals: ["returning", "remote_work", "long_stay", "direct"],
      specialNote: "Rebooked for desk + reliable Wi‑Fi after prior stays",
      prepare: "Confirm desk clear · Wi‑Fi credentials card ready",
      whyItMatters: "Returning remote worker · relationship inventory",
      unitStatus: "ready",
      channel: "direct",
    },
    {
      id: "la2",
      time: "15:00",
      unit: "24",
      unitKind: "unit",
      guestName: "Silva",
      partySize: 2,
      nights: 5,
      unitType: "One Bed",
      priorStays: 0,
      signals: ["first_stay", "honeymoon", "early_checkin", "ota"],
      specialNote: "Honeymoon noted on booking · flowers requested",
      prepare: "Welcome flowers · kitchen deep-clean must finish before 15:00",
      whyItMatters: "Occasion + delayed turnover risk on first stay",
      unitStatus: "delayed",
      channel: "ota",
    },
    {
      id: "la3",
      time: "16:00",
      unit: "48",
      unitKind: "unit",
      guestName: "Bergström",
      partySize: 2,
      nights: 4,
      unitType: "Loft",
      priorStays: 0,
      signals: ["first_stay", "accessibility", "direct"],
      specialNote: "Guest asked about stairs — loft has mezzanine only",
      prepare: "Confirm mobility OK or reassign to One Bed before arrival",
      whyItMatters: "Accessibility mismatch · do not surprise at door",
      unitStatus: "cleaning",
      channel: "direct",
    },
    {
      id: "la4",
      time: "17:00",
      unit: "12",
      unitKind: "unit",
      guestName: "Orphan hold",
      partySize: 1,
      nights: 1,
      unitType: "Studio",
      priorStays: 0,
      signals: ["first_stay"],
      specialNote: "Tuesday orphan night · rate prepared",
      prepare: "Disclose studio (no separate bedroom) if sold",
      whyItMatters: "Perishable night · honesty on unit type",
      unitStatus: "ready",
      channel: "direct",
    },
  ];
}

export function lisbonArrivalForUnit(
  unitNumber: string,
): StayArrival | undefined {
  return lisbonStayArrivals().find((a) => a.unit === unitNumber);
}

export type ResidencesAttentionItem = {
  id: string;
  territory: "LABOR" | "RECOVER" | "SELL" | "BUY";
  kicker: string;
  title: string;
  body: string;
  stakeEuro: number;
  stakeLabel: string;
  cta: string;
  radrDid?: string;
  href: string;
};

export function lisbonAttention(): ResidencesAttentionItem[] {
  return [
    {
      id: "lis_u24_turnover",
      territory: "LABOR",
      kicker: "TURNOVER",
      title: "Unit 24 cleaning likely 18 min late",
      body: "Guest arriving 15:00 · cleaner mid-route on floor 2.",
      radrDid: "Prepared reallocation: finish 48 first, then 24.",
      stakeEuro: 280,
      stakeLabel: "guest / stay exposure",
      cta: "Approve reallocation",
      href: "/app/service",
    },
    {
      id: "lis_u31_maint",
      territory: "RECOVER",
      kicker: "MAINTENANCE",
      title: "Unit 31 maintenance blocking tomorrow",
      body: "AC repair ETA unclear · tomorrow arrival at risk.",
      radrDid: "Held guest messaging · prepared relocation options.",
      stakeEuro: 420,
      stakeLabel: "stay revenue at risk",
      cta: "Review options",
      href: "/app/service?unit=31",
    },
  ];
}

export type ResidencesHandlingItem = {
  id: string;
  label: string;
  status: string;
};

export function lisbonHandling(): ResidencesHandlingItem[] {
  return [
    {
      id: "h1",
      label: "Watching Unit 48 turnaround vs 16:00 arrival",
      status: "RADR is watching",
    },
    {
      id: "h2",
      label: "Prepared orphan-night rate for Unit 12 Tuesday",
      status: "Prepared for approval",
    },
    {
      id: "h3",
      label: "Verified early check-in contribution · Unit 55 last week",
      status: "Verified",
    },
  ];
}

export function lisbonOrphanNight(): {
  unit: string;
  night: string;
  euro: number;
  fillProbability: number;
} {
  return {
    unit: "12",
    night: "Tuesday",
    euro: 164,
    fillProbability: 0.64,
  };
}

export function lisbonPerishableInventory(): PerishableInventoryOpportunity[] {
  const orphan = lisbonOrphanNight();
  return [
    {
      id: "pi_orphan_u12",
      inventoryType: "unit_night",
      availableFrom: "2026-09-15T00:00:00+01:00",
      expiresAt: "2026-09-16T00:00:00+01:00",
      capacity: 1,
      expectedValue: orphan.euro,
      expectedContribution: 118,
      recommendedChannel: "direct",
      recommendedAction: "Open 1-night stay at adjusted price",
      status: "OPEN",
    },
  ];
}

export function lisbonPredictions(): Prediction[] {
  return [
    predictionSchema.parse({
      id: "pred_u24_late",
      type: "turnover_completion",
      entityType: "unit",
      entityId: "u24",
      timeHorizon: "today",
      what: "Unit 24 likely 18 min late for 15:00 check-in",
      pointEstimate: 18,
      unit: "minutes",
      confidence: "high",
      drivers: [
        { id: "d1", label: "Cleaner mid-route floor 2", direction: "down" },
        { id: "d2", label: "Avg clean 42 min for One Bed", direction: "neutral" },
      ],
      historicalBaseline: "One Bed turnovers finish on time 71% of days",
      recommendedAction: "Reallocate cleaner from Unit 48 path",
      visibleToRoles: ["gm", "housekeeping_manager"],
      verticals: ["serviced_apartments"],
    }),
    predictionSchema.parse({
      id: "pred_orphan_u12",
      type: "orphan_night",
      entityType: "unit",
      entityId: "u12",
      timeHorizon: "tuesday",
      what: "Orphan Tuesday night · Unit 12",
      pointEstimate: 64,
      unit: "percent_fill",
      confidence: "medium",
      drivers: [
        { id: "d1", label: "Historical 1-night fill 64%", direction: "up" },
        { id: "d2", label: "Direct demand soft midweek", direction: "down" },
      ],
      historicalBaseline: "Same unit midweek orphan fill ~64%",
      recommendedAction: "Open 1-night stay at adjusted price",
      visibleToRoles: ["gm", "revenue_manager", "owner", "cfo"],
      verticals: ["serviced_apartments"],
    }),
  ];
}

export function lisbonFirstInsight(): string {
  return "9 check-ins today; Unit 24 turnover projected late and Unit 31 maintenance threatens tomorrow.";
}

export function residencesUnitStatusLabel(status: ResidencesUnitStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "cleaning":
      return "Cleaning";
    case "delayed":
      return "At risk";
    case "occupied":
      return "Occupied";
    case "maintenance":
      return "Maintenance";
  }
}
