/**
 * Control Center lens — persona × vertical × scope → presentation.
 * Role changes the question, not the product architecture.
 */

import type { RoleView } from "@/lib/product/types";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import type { AppNavItem } from "@/lib/product/appNav";
import { RAIL_PRIMARY_NAV, railPrimaryNavForVertical } from "@/lib/product/appNav";

export type CcLensBand = {
  id: string;
  label: string;
  /** Prefer live amounts from bridge when id matches driver */
  bridgeHint?: RegExp;
  /** Fallback display when bridge missing */
  fallbackValue: string;
  fallbackVs: string;
  tone: "pos" | "neg" | "watch" | "neutral";
};

/** Level-1 object that dominates the first viewport for this persona. */
export type CcHeroObject =
  | "portfolio"
  | "exceptions"
  | "pulse"
  | "readiness"
  | "pace"
  | "rooms";

export type ControlCenterLens = {
  role: RoleView;
  vertical: "restaurant" | "hotel";
  scopeDefault: "all" | "home";
  periodDefault: DashPeriod;
  question: string;
  heroPrimary: string;
  heroAdverse: string;
  /** One-line executive conclusion — not a paragraph. */
  why: string;
  band: CcLensBand[];
  pulseCaption: string;
  tableTitle: string;
  heroObject: CcHeroObject;
  railReviewEmphasis: "financial" | "operational" | "service" | "kitchen" | "rooms" | "pace";
  navPriorityIds: string[];
};

const RESTAURANT_LENSES: Partial<Record<RoleView, Omit<ControlCenterLens, "role" | "vertical">>> = {
  cfo: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the organization financially healthy, and where is value leaking?",
    heroPrimary: "Revenue is ahead across the group.",
    heroAdverse: "Three locations explain 82% of the contribution gap.",
    why: "Revenue is ahead across the group. Three locations explain 82% of the contribution gap.",
    band: [
      { id: "sales", label: "Revenue", bridgeHint: /sales/i, fallbackValue: "+€6,800", fallbackVs: "+11% vs plan", tone: "pos" },
      { id: "contrib", label: "Contribution", bridgeHint: /contrib/i, fallbackValue: "−€4,780", fallbackVs: "vs plan today", tone: "neg" },
      { id: "cogs", label: "COGS", bridgeHint: /cogs/i, fallbackValue: "−€4,120", fallbackVs: "+8% vs plan", tone: "neg" },
      { id: "labor", label: "Labor", bridgeHint: /labor/i, fallbackValue: "−€3,200", fallbackVs: "+12% vs plan", tone: "neg" },
    ],
    pulseCaption: "Contribution trajectory · group operating day",
    tableTitle: "Portfolio health",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "locations", "intelligence", "value", "decisions", "service", "house", "memory"],
  },
  finance: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the organization financially healthy, and where is value leaking?",
    heroPrimary: "Revenue is ahead across the group.",
    heroAdverse: "Three locations are losing contribution.",
    why: "Revenue +4.2%; contribution −1.8%, driven by labor and channel mix.",
    band: [
      { id: "sales", label: "Revenue", bridgeHint: /sales/i, fallbackValue: "+€6,800", fallbackVs: "+11% vs plan", tone: "pos" },
      { id: "contrib", label: "Contribution", bridgeHint: /contrib/i, fallbackValue: "−€4,780", fallbackVs: "vs plan today", tone: "neg" },
      { id: "cogs", label: "COGS", bridgeHint: /cogs/i, fallbackValue: "−€4,120", fallbackVs: "+8% vs plan", tone: "neg" },
      { id: "labor", label: "Labor", bridgeHint: /labor/i, fallbackValue: "−€3,200", fallbackVs: "+12% vs plan", tone: "neg" },
    ],
    pulseCaption: "Contribution trajectory · group operating day",
    tableTitle: "Portfolio health",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "locations", "intelligence", "value", "decisions", "service", "house", "memory"],
  },
  owner: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the business healthy, and is RADR making it better?",
    heroPrimary: "The estate is growing.",
    heroAdverse: "Verified Value still trails exposure.",
    why: "3 locations explain most of today's contribution gap.",
    band: [
      { id: "sales", label: "Revenue", bridgeHint: /sales/i, fallbackValue: "+€6,800", fallbackVs: "+11% vs plan", tone: "pos" },
      { id: "contrib", label: "Contribution", bridgeHint: /contrib/i, fallbackValue: "−€4,780", fallbackVs: "vs plan", tone: "neg" },
      { id: "verified", label: "Verified", fallbackValue: "€3,793", fallbackVs: "MTD +18%", tone: "pos" },
      { id: "exposure", label: "Exposure", fallbackValue: "€6,450", fallbackVs: "open Decisions", tone: "watch" },
    ],
    pulseCaption: "Estate pulse · verified vs exposed",
    tableTitle: "Locations needing attention",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "value", "locations", "decisions", "intelligence", "memory", "service", "house"],
  },
  coo: {
    scopeDefault: "all",
    periodDefault: "today",
    question: "Is the estate operating properly, and where will operations fail next?",
    heroPrimary: "Most locations are holding.",
    heroAdverse: "Soho · New York needs intervention tonight.",
    why: "Labor and delivery pressure concentrate in two sites; the rest of the estate is within plan.",
    band: [
      { id: "pressure", label: "Needs you", fallbackValue: "3", fallbackVs: "open judgments", tone: "neg" },
      { id: "labor", label: "Labor", bridgeHint: /labor/i, fallbackValue: "+12%", fallbackVs: "vs plan peak", tone: "neg" },
      { id: "service", label: "Service risk", fallbackValue: "2", fallbackVs: "locations", tone: "watch" },
      { id: "data", label: "Data health", fallbackValue: "92%", fallbackVs: "sources fresh", tone: "pos" },
    ],
    pulseCaption: "Operating exceptions · across the estate",
    tableTitle: "Location operating state",
    railReviewEmphasis: "operational",
    heroObject: "exceptions",
    navPriorityIds: ["control-center", "decisions", "locations", "service", "house", "intelligence", "value", "memory"],
  },
  regional: {
    scopeDefault: "all",
    periodDefault: "today",
    question: "Is the estate operating properly, and where will operations fail next?",
    heroPrimary: "Most locations are holding.",
    heroAdverse: "Soho · New York needs intervention tonight.",
    why: "Labor and delivery pressure concentrate in two sites; the rest of the estate is within plan.",
    band: [
      { id: "pressure", label: "Needs you", fallbackValue: "3", fallbackVs: "open judgments", tone: "neg" },
      { id: "labor", label: "Labor", bridgeHint: /labor/i, fallbackValue: "+12%", fallbackVs: "vs plan peak", tone: "neg" },
      { id: "service", label: "Service risk", fallbackValue: "2", fallbackVs: "locations", tone: "watch" },
      { id: "data", label: "Data health", fallbackValue: "92%", fallbackVs: "sources fresh", tone: "pos" },
    ],
    pulseCaption: "Operating exceptions · across the estate",
    tableTitle: "Location operating state",
    railReviewEmphasis: "operational",
    heroObject: "exceptions",
    navPriorityIds: ["control-center", "decisions", "locations", "service", "house", "intelligence", "value", "memory"],
  },
  gm: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "What do I need to know to run my restaurant today?",
    heroPrimary: "Dinner is ahead.",
    heroAdverse: "Kitchen is now the constraint.",
    why: "Dinner is ahead. Kitchen is now the constraint.",
    band: [
      { id: "sales", label: "Sales", bridgeHint: /sales/i, fallbackValue: "+€6,800", fallbackVs: "+11% vs plan", tone: "pos" },
      { id: "cogs", label: "COGS", bridgeHint: /cogs/i, fallbackValue: "−€4,120", fallbackVs: "+8% vs plan", tone: "neg" },
      { id: "labor", label: "Labor", bridgeHint: /labor/i, fallbackValue: "−€3,200", fallbackVs: "+12% vs plan", tone: "neg" },
      { id: "channels", label: "Channels", bridgeHint: /channel/i, fallbackValue: "−€2,460", fallbackVs: "+9% vs plan", tone: "neg" },
    ],
    pulseCaption: "Covers, revenue and contribution through service",
    tableTitle: "Location performance",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "decisions", "service", "house", "intelligence", "value", "memory", "locations"],
  },
  fb_operator: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can we execute service successfully over the next few hours?",
    heroPrimary: "Bookings are full for peak.",
    heroAdverse: "Table turns slow after 20:10.",
    why: "Walk-ins and delivery load stack on the same window as labor pressure.",
    band: [
      { id: "covers", label: "Covers", fallbackValue: "142", fallbackVs: "peak forecast", tone: "pos" },
      { id: "wait", label: "Waitlist", fallbackValue: "18", fallbackVs: "covers queued", tone: "watch" },
      { id: "labor", label: "FOH labor", bridgeHint: /labor/i, fallbackValue: "+22%", fallbackVs: "vs plan now", tone: "neg" },
      { id: "recover", label: "Recoverable", fallbackValue: "+$620", fallbackVs: "hold 12 min", tone: "pos" },
    ],
    pulseCaption: "Service pressure · next 120 minutes",
    tableTitle: "Service state",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "service", "decisions", "house", "intelligence", "value", "memory", "locations"],
  },
  host: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can we execute service successfully over the next few hours?",
    heroPrimary: "Bookings are full for peak.",
    heroAdverse: "Table turns slow after 20:10.",
    why: "Walk-ins and delivery load stack on the same window as labor pressure.",
    band: [
      { id: "covers", label: "Covers", fallbackValue: "142", fallbackVs: "peak forecast", tone: "pos" },
      { id: "wait", label: "Waitlist", fallbackValue: "18", fallbackVs: "covers queued", tone: "watch" },
      { id: "labor", label: "FOH labor", bridgeHint: /labor/i, fallbackValue: "+22%", fallbackVs: "vs plan now", tone: "neg" },
      { id: "recover", label: "Recoverable", fallbackValue: "+$620", fallbackVs: "hold 12 min", tone: "pos" },
    ],
    pulseCaption: "Service pressure · next 120 minutes",
    tableTitle: "Service state",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "service", "decisions", "house", "intelligence", "value", "memory", "locations"],
  },
  server: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can we execute service successfully over the next few hours?",
    heroPrimary: "Bookings are full for peak.",
    heroAdverse: "Table turns slow after 20:10.",
    why: "Walk-ins and delivery load stack on the same window as labor pressure.",
    band: [
      { id: "covers", label: "Covers", fallbackValue: "142", fallbackVs: "peak forecast", tone: "pos" },
      { id: "wait", label: "Waitlist", fallbackValue: "18", fallbackVs: "covers queued", tone: "watch" },
      { id: "labor", label: "FOH labor", bridgeHint: /labor/i, fallbackValue: "+22%", fallbackVs: "vs plan now", tone: "neg" },
      { id: "recover", label: "Recoverable", fallbackValue: "+$620", fallbackVs: "hold 12 min", tone: "pos" },
    ],
    pulseCaption: "Service pressure · next 120 minutes",
    tableTitle: "Service state",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "service", "decisions", "house", "intelligence", "value", "memory", "locations"],
  },
  head_chef: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Are we prepared to execute service without product, prep, or kitchen constraints?",
    heroPrimary: "Prep is almost ready.",
    heroAdverse: "Two items threaten dinner service.",
    why: "Tuna prep finishes short and caster sugar sits below house par before peak burn.",
    band: [
      { id: "prep", label: "Prep gap", fallbackValue: "7", fallbackVs: "portions short", tone: "neg" },
      { id: "stock", label: "Stock risk", fallbackValue: "2", fallbackVs: "items below par", tone: "watch" },
      { id: "line", label: "Hot line", fallbackValue: "94%", fallbackVs: "pressure 20:10", tone: "neg" },
      { id: "delivery", label: "Delivery load", fallbackValue: "+18%", fallbackVs: "kitchen impact", tone: "watch" },
    ],
    pulseCaption: "Kitchen pressure · prep vs demand",
    tableTitle: "Station readiness",
    railReviewEmphasis: "kitchen",
    heroObject: "readiness",
    navPriorityIds: ["control-center", "house", "decisions", "intelligence", "service", "value", "memory", "locations"],
  },
  kitchen: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Are we prepared to execute service without product, prep, or kitchen constraints?",
    heroPrimary: "Prep is almost ready.",
    heroAdverse: "Two items threaten dinner service.",
    why: "Tuna prep finishes short and caster sugar sits below house par before peak burn.",
    band: [
      { id: "prep", label: "Prep gap", fallbackValue: "7", fallbackVs: "portions short", tone: "neg" },
      { id: "stock", label: "Stock risk", fallbackValue: "2", fallbackVs: "items below par", tone: "watch" },
      { id: "line", label: "Hot line", fallbackValue: "94%", fallbackVs: "pressure 20:10", tone: "neg" },
      { id: "delivery", label: "Delivery load", fallbackValue: "+18%", fallbackVs: "kitchen impact", tone: "watch" },
    ],
    pulseCaption: "Kitchen pressure · prep vs demand",
    tableTitle: "Station readiness",
    railReviewEmphasis: "kitchen",
    heroObject: "readiness",
    navPriorityIds: ["control-center", "house", "decisions", "intelligence", "service", "value", "memory", "locations"],
  },
};

const HOTEL_LENSES: Partial<Record<RoleView, Omit<ControlCenterLens, "role" | "vertical">>> = {
  cfo: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the hotel organization financially healthy, and where is profitability leaking?",
    heroPrimary: "Occupancy is ahead.",
    heroAdverse: "OTA mix is reducing room contribution.",
    why: "Occupancy ahead; OTA mix and HK overtime compress contribution.",
    band: [
      { id: "occ", label: "Occupancy", fallbackValue: "89%", fallbackVs: "+2.4% vs plan", tone: "pos" },
      { id: "adr", label: "ADR", fallbackValue: "€248", fallbackVs: "−1.8% vs plan", tone: "neg" },
      { id: "revpar", label: "RevPAR", fallbackValue: "€221", fallbackVs: "−€16 vs plan", tone: "neg" },
      { id: "contrib", label: "Contribution", fallbackValue: "−€4.7k", fallbackVs: "channel + HK", tone: "neg" },
    ],
    pulseCaption: "Portfolio contribution · occupancy vs channel mix",
    tableTitle: "Property health",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "locations", "intelligence", "value", "decisions", "service", "house", "memory"],
  },
  finance: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the hotel organization financially healthy, and where is profitability leaking?",
    heroPrimary: "Occupancy is ahead.",
    heroAdverse: "OTA mix is reducing room contribution.",
    why: "Occupancy ahead; OTA mix and HK overtime compress contribution.",
    band: [
      { id: "occ", label: "Occupancy", fallbackValue: "89%", fallbackVs: "+2.4% vs plan", tone: "pos" },
      { id: "adr", label: "ADR", fallbackValue: "€248", fallbackVs: "−1.8% vs plan", tone: "neg" },
      { id: "revpar", label: "RevPAR", fallbackValue: "€221", fallbackVs: "−€16 vs plan", tone: "neg" },
      { id: "contrib", label: "Contribution", fallbackValue: "−€4.7k", fallbackVs: "channel + HK", tone: "neg" },
    ],
    pulseCaption: "Portfolio contribution · occupancy vs channel mix",
    tableTitle: "Property health",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "locations", "intelligence", "value", "decisions", "service", "house", "memory"],
  },
  hotel_gm: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can my property operate successfully today while hitting financial targets?",
    heroPrimary: "Occupancy is strong.",
    heroAdverse: "Room contribution isn’t.",
    why: "89% occupied · 31/42 ready · €1,840 exposed · Floor 3 behind the arrival wave.",
    band: [
      { id: "occ", label: "Occupancy", fallbackValue: "89%", fallbackVs: "+2.4% vs plan", tone: "pos" },
      { id: "adr", label: "ADR", fallbackValue: "€248", fallbackVs: "−1.8% vs plan", tone: "neg" },
      { id: "ready", label: "Readiness", fallbackValue: "31/42", fallbackVs: "7 at risk", tone: "neg" },
      { id: "pickup", label: "7D pickup", fallbackValue: "+11", fallbackVs: "vs expected +6", tone: "pos" },
    ],
    pulseCaption: "Housekeeping → arrivals · operating day",
    tableTitle: "Property performance",
    railReviewEmphasis: "rooms",
    heroObject: "rooms",
    navPriorityIds: ["control-center", "decisions", "service", "house", "intelligence", "value", "memory", "locations"],
  },
  gm: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can my property operate successfully today while hitting financial targets?",
    heroPrimary: "Occupancy is strong.",
    heroAdverse: "Room contribution isn’t.",
    why: "89% occupied · 31/42 ready · €1,840 exposed · Floor 3 behind the arrival wave.",
    band: [
      { id: "occ", label: "Occupancy", fallbackValue: "89%", fallbackVs: "+2.4% vs plan", tone: "pos" },
      { id: "adr", label: "ADR", fallbackValue: "€248", fallbackVs: "−1.8% vs plan", tone: "neg" },
      { id: "ready", label: "Readiness", fallbackValue: "31/42", fallbackVs: "7 at risk", tone: "neg" },
      { id: "pickup", label: "7D pickup", fallbackValue: "+11", fallbackVs: "vs expected +6", tone: "pos" },
    ],
    pulseCaption: "Housekeeping → arrivals · operating day",
    tableTitle: "Property performance",
    railReviewEmphasis: "rooms",
    heroObject: "rooms",
    navPriorityIds: ["control-center", "decisions", "service", "house", "intelligence", "value", "memory", "locations"],
  },
  revenue_manager: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Where is demand changing, and what inventory or pricing action should we take?",
    heroPrimary: "Tomorrow is filling faster than expected.",
    heroAdverse: "Soft midweek inventory is still exposed.",
    why: "7-day pickup leads plan while OTA share on shoulder nights dilutes contribution.",
    band: [
      { id: "pickup", label: "7D pickup", fallbackValue: "+11", fallbackVs: "vs expected +6", tone: "pos" },
      { id: "occ", label: "Occ forecast", fallbackValue: "92%", fallbackVs: "tonight", tone: "pos" },
      { id: "adr", label: "ADR", fallbackValue: "€248", fallbackVs: "−1.8% vs plan", tone: "neg" },
      { id: "rooms", label: "Rooms left", fallbackValue: "18", fallbackVs: "premium hold", tone: "watch" },
    ],
    pulseCaption: "Booking pace · pickup vs forecast",
    tableTitle: "Property pace",
    railReviewEmphasis: "pace",
    heroObject: "pace",
    navPriorityIds: ["control-center", "locations", "intelligence", "decisions", "value", "service", "house", "memory"],
  },
  housekeeping_manager: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Will all required rooms be ready for incoming guests?",
    heroPrimary: "Arrival wave starts at 15:00.",
    heroAdverse: "11 priority rooms still need inspection.",
    why: "Floor 3 is behind; reassigning two attendants protects check-in contribution.",
    band: [
      { id: "dirty", label: "Dirty", fallbackValue: "24", fallbackVs: "in HK now", tone: "watch" },
      { id: "ready", label: "Ready", fallbackValue: "31", fallbackVs: "of 42 arrivals", tone: "neg" },
      { id: "risk", label: "At risk", fallbackValue: "7", fallbackVs: "before 15:00", tone: "neg" },
      { id: "ooo", label: "OOO", fallbackValue: "3", fallbackVs: "rooms blocked", tone: "watch" },
    ],
    pulseCaption: "Room readiness · departure → clean → inspect",
    tableTitle: "Floor readiness",
    railReviewEmphasis: "rooms",
    heroObject: "rooms",
    navPriorityIds: ["control-center", "house", "decisions", "service", "locations", "intelligence", "value", "memory"],
  },
  coo: {
    scopeDefault: "all",
    periodDefault: "today",
    question: "Where will operational execution break today?",
    heroPrimary: "Arrival waves are manageable.",
    heroAdverse: "Two properties show readiness gaps.",
    why: "Housekeeping throughput and OOO rooms concentrate risk before the evening check-in peak.",
    band: [
      { id: "ready", label: "Readiness gaps", fallbackValue: "2", fallbackVs: "properties", tone: "neg" },
      { id: "arrivals", label: "Arrivals", fallbackValue: "186", fallbackVs: "group today", tone: "neutral" },
      { id: "ooo", label: "OOO", fallbackValue: "11", fallbackVs: "rooms", tone: "watch" },
      { id: "labor", label: "HK labor", fallbackValue: "+9%", fallbackVs: "vs plan", tone: "neg" },
    ],
    pulseCaption: "Estate operations · readiness exceptions",
    tableTitle: "Property operating state",
    railReviewEmphasis: "operational",
    heroObject: "exceptions",
    navPriorityIds: ["control-center", "decisions", "locations", "service", "house", "intelligence", "value", "memory"],
  },
  host: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can we execute today's arrival and guest journey smoothly?",
    heroPrimary: "Arrival peak starts at 15:00.",
    heroAdverse: "Front desk pressure builds before rooms are ready.",
    why: "42 arrivals · 7 early · 4 VIP · 11 rooms still need inspection before the wave.",
    band: [
      { id: "arrivals", label: "Arrivals", fallbackValue: "42", fallbackVs: "today", tone: "neutral" },
      { id: "early", label: "Early", fallbackValue: "7", fallbackVs: "before 14:00", tone: "watch" },
      { id: "ready", label: "Ready", fallbackValue: "31/42", fallbackVs: "rooms inspected", tone: "neg" },
      { id: "vip", label: "VIPs", fallbackValue: "4", fallbackVs: "this afternoon", tone: "watch" },
    ],
    pulseCaption: "Front desk pressure · next 2 hours",
    tableTitle: "Arrival state",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "service", "decisions", "house", "locations", "intelligence", "value", "memory"],
  },
  fb_operator: {
    scopeDefault: "home",
    periodDefault: "today",
    question: "Can we execute today's arrival and guest journey smoothly?",
    heroPrimary: "Arrival peak starts at 15:00.",
    heroAdverse: "Front desk pressure builds before rooms are ready.",
    why: "42 arrivals · 7 early · 4 VIP · 11 rooms still need inspection before the wave.",
    band: [
      { id: "arrivals", label: "Arrivals", fallbackValue: "42", fallbackVs: "today", tone: "neutral" },
      { id: "early", label: "Early", fallbackValue: "7", fallbackVs: "before 14:00", tone: "watch" },
      { id: "ready", label: "Ready", fallbackValue: "31/42", fallbackVs: "rooms inspected", tone: "neg" },
      { id: "vip", label: "VIPs", fallbackValue: "4", fallbackVs: "this afternoon", tone: "watch" },
    ],
    pulseCaption: "Front desk pressure · next 2 hours",
    tableTitle: "Arrival state",
    railReviewEmphasis: "service",
    heroObject: "pulse",
    navPriorityIds: ["control-center", "service", "decisions", "house", "locations", "intelligence", "value", "memory"],
  },
  owner: {
    scopeDefault: "all",
    periodDefault: "mtd",
    question: "Is the hotel business healthy, and is RADR making it better?",
    heroPrimary: "Portfolio occupancy is ahead.",
    heroAdverse: "Two properties drag contribution.",
    why: "Group RevPAR beats plan while channel mix and readiness gaps concentrate leak.",
    band: [
      { id: "occ", label: "Occupancy", fallbackValue: "89%", fallbackVs: "+2.4% vs plan", tone: "pos" },
      { id: "revpar", label: "RevPAR", fallbackValue: "€221", fallbackVs: "−€16 vs plan", tone: "neg" },
      { id: "verified", label: "Verified", fallbackValue: "€4.2k", fallbackVs: "MTD", tone: "pos" },
      { id: "exposure", label: "Exposure", fallbackValue: "€6.1k", fallbackVs: "open Decisions", tone: "watch" },
    ],
    pulseCaption: "Portfolio pulse · verified vs exposed",
    tableTitle: "Properties needing attention",
    railReviewEmphasis: "financial",
    heroObject: "portfolio",
    navPriorityIds: ["control-center", "value", "locations", "decisions", "intelligence", "memory", "service", "house"],
  },
};

const FALLBACK_RESTAURANT = RESTAURANT_LENSES.gm!;
const FALLBACK_HOTEL = HOTEL_LENSES.hotel_gm!;

export function controlCenterLensFor(
  role: RoleView,
  vertical: "restaurant" | "hotel",
): ControlCenterLens {
  const table = vertical === "hotel" ? HOTEL_LENSES : RESTAURANT_LENSES;
  const base = table[role] ?? (vertical === "hotel" ? FALLBACK_HOTEL : FALLBACK_RESTAURANT);
  return { ...base, role, vertical };
}

/**
 * Primary rail — ONE stable order for every persona and route.
 * Persona lenses change Control Center composition, not nav order.
 * (navPriorityIds remain for lens metadata / future emphasis, not reordering.)
 */
export function railNavForPersona(
  _role: RoleView,
  vertical: "restaurant" | "hotel",
): AppNavItem[] {
  const base = railPrimaryNavForVertical(vertical);
  return base.length ? base : RAIL_PRIMARY_NAV;
}
