/**
 * Service Intelligence — Decision-layer capacity objects.
 * Reservation systems remain systems of record; RADR judges and orchestrates.
 */

import type { ServiceTableState } from "./tableStates";

export type ServiceViewMode = "floor" | "timeline" | "recovery";

export type ReservationSource =
  | "opentable"
  | "sevenrooms"
  | "resy"
  | "thefork"
  | "quandoo"
  | "website"
  | "walk_in"
  | "demo";

export type ReservationStatus =
  | "booked"
  | "confirmed"
  | "arriving"
  | "seated"
  | "completed"
  | "cancelled"
  | "no_show"
  | "held";

export type GuestFlexibility = {
  earliestMinutes?: number; // vs preferred start, e.g. -30
  latestMinutes?: number; // e.g. +45
  areaPreferences?: Array<"MAIN" | "BAR" | "TERRACE">;
  terraceOk?: boolean;
  accessibility?: boolean;
  highChair?: boolean;
  vip?: boolean;
  returning?: boolean;
};

/** Canonical reservation — cross-system, not a booking CMS record. */
export type ServiceReservation = {
  id: string;
  source: ReservationSource;
  externalId: string;
  locationId: string;
  partyLabel: string;
  partySize: number;
  start: string; // HH:mm venue-local
  expectedEnd: string;
  actualSeated?: string | null;
  actualReleased?: string | null;
  tableIds: string[];
  area: "MAIN" | "BAR" | "TERRACE";
  status: ReservationStatus;
  flexibility: GuestFlexibility;
  expectedContributionEuro: number;
  depositEuro?: number;
  notes?: string;
  constraints?: string[];
  protected?: boolean;
  confidence: number; // 0–1
};

/** Waitlist / notify-me / unavailable demand / walk-in queue. */
export type UnfulfilledDemand = {
  id: string;
  source: ReservationSource;
  partyLabel: string;
  partySize: number;
  preferredTime: string;
  flexibility: GuestFlexibility;
  date: string;
  contactable: boolean;
  createdAt: string;
  expiresAt?: string;
  waitMinutes?: number;
  state: "waiting" | "notified" | "offered" | "booked" | "expired" | "declined";
  expectedContributionEuro: number;
  areaPreferences?: Array<"MAIN" | "BAR" | "TERRACE">;
};

export type RecoverableCapacityOpportunity = {
  id: string;
  locationId: string;
  area: "MAIN" | "BAR" | "TERRACE";
  tableIds: string[];
  start: string;
  end: string;
  partySizeFit: { min: number; max: number };
  source:
    | "late_cancellation"
    | "early_release"
    | "no_show"
    | "short_gap"
    | "floor_rearrangement"
    | "unused_join";
  confidence: number;
  expectedCovers: number;
  expectedContributionEuro: number;
  compatibleDemandIds: string[];
  operationalImpact: "low" | "medium" | "high";
  state: "open" | "prepared" | "offered" | "booked" | "expired" | "dismissed";
  decisionId?: string;
};

export type DemandMatch = {
  demandId: string;
  rank: number;
  fitPct: number;
  reason: string;
};

export type FloorMove = {
  reservationId: string;
  partyLabel: string;
  fromTableIds: string[];
  toTableIds: string[];
  reason: string;
};

export type FloorOptimizationPlan = {
  id: string;
  locationId: string;
  asOf: string;
  improved: boolean;
  summary: string;
  deltaCovers: number;
  expectedContributionEuro: number;
  kitchenCurrentPct: number;
  kitchenOptimizedPct: number;
  guestDisruption: "none" | "low" | "medium" | "high";
  moveCount: number;
  protectedUnchanged: number;
  moves: FloorMove[];
  pressureCurrent: Record<string, number>;
  pressureOptimized: Record<string, number>;
  confidence: number;
  /** Valid RADR outcome — optimizer may conclude no change. */
  noChangeReason?: string;
};

export type TimelineBlock = {
  id: string;
  tableId: string;
  area: "MAIN" | "BAR" | "TERRACE";
  kind: "booking" | "walk_in" | "hold" | "gap" | "turn" | "recoverable";
  start: string;
  end: string;
  label: string;
  partySize?: number;
  state: ServiceTableState;
  reservationId?: string;
  material?:
    | "late_risk"
    | "early_finish"
    | "turn_risk"
    | "cancellation"
    | "waiting_demand"
    | "pressure"
    | "decision"
    | null;
  decisionId?: string;
  contributionEuro?: number;
};

export type WalkInParty = {
  id: string;
  partyLabel: string;
  partySize: number;
  waitMinutes: number;
  estimatedSeatMinutes: number;
  compatibleTableIds: string[];
  state: "waiting" | "quoted" | "held" | "seating";
};

export type ServiceTonightSummary = {
  bookedCovers: number;
  walkInsForecast: number;
  waitingCount: number;
  recoverableGaps: number;
  recoverableEuro: number;
  decisionsNeedingJudgment: number;
};

export type ArrivalStrip = {
  windowMinutes: number;
  expectedCovers: number;
  parties: number;
  vipCount: number;
  lateRiskCount: number;
};

export type ServiceActionLog = {
  id: string;
  decisionId?: string;
  kind: string;
  oldState: string;
  newState: string;
  reason: string;
  actor: "radr" | "operator";
  policyId?: string;
  approvalRequired: boolean;
  timestamp: string;
  reversible: boolean;
  externalResult?: "pending" | "ok" | "failed" | "unsupported";
};
