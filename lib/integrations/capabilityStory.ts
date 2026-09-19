/**
 * Capability storytelling for public integrations.
 * ACCESS status lives on IntegrationProvider.
 * This file holds POTENTIAL signals / RADR use — never "we receive".
 */

import type { IntegrationProvider } from "./registry";
import { INTEGRATION_CATEGORY_LABEL, INTEGRATION_STATUS_LABEL } from "./registry";

export type CapabilityStory = {
  potentialSignals: readonly string[];
  combineWith: string;
  /** Short Decision examples — 1–2 lines */
  radrCouldSee: readonly string[];
  /** Optional vertical focus for homepage chips */
  verticals?: readonly string[];
};

/**
 * Potential signals only — fields an authorized connection *could* expose.
 * Do not invent scopes or claim receipt.
 */
export const INTEGRATION_CAPABILITY_STORY: Record<string, CapabilityStory> = {
  toast: {
    potentialSignals: [
      "Orders / checks",
      "Menu items · modifiers",
      "Prices · discounts",
      "Payments",
      "Dining channel · timestamps",
    ],
    combineWith: "Reservations · delivery · supplier cost",
    radrCouldSee: [
      "Which menu mix is creating contribution pressure?",
      "Where is discount leakage tonight?",
    ],
  },
  "lightspeed-restaurant": {
    potentialSignals: [
      "Orders",
      "Items · prices",
      "Discounts",
      "Payments",
      "Location · daypart",
    ],
    combineWith: "Reservations · labor · delivery",
    radrCouldSee: [
      "Sales mix vs kitchen capacity.",
      "Daypart contribution shifts.",
    ],
  },
  square: {
    potentialSignals: [
      "Orders",
      "Items · prices",
      "Payments",
      "Refunds",
      "Location",
    ],
    combineWith: "Accounting · delivery · labor",
    radrCouldSee: [
      "What actually sold vs what was settled.",
      "Refund and discount leakage.",
    ],
  },
  clover: {
    potentialSignals: ["Orders", "Items", "Payments", "Location"],
    combineWith: "Accounting · labor",
    radrCouldSee: ["Sales reality for contribution Decisions."],
  },
  "oracle-simphony": {
    potentialSignals: ["Orders", "Checks", "Items", "Location"],
    combineWith: "Reservations · labor · accounting",
    radrCouldSee: ["Enterprise POS evidence for multi-location Decisions."],
  },
  opentable: {
    potentialSignals: [
      "Reservations",
      "Availability",
      "Party size · arrival time",
      "Booking channel",
      "Guest context · reviews (where permitted)",
    ],
    combineWith: "POS · KDS · weather",
    radrCouldSee: [
      "Arrival compression before service.",
      "Cancellation inventory before it expires.",
    ],
  },
  sevenrooms: {
    potentialSignals: [
      "Reservations · waitlist",
      "Tables · dining areas",
      "Party size · status",
      "Guest context",
    ],
    combineWith: "POS · labor · weather",
    radrCouldSee: [
      "Second-turn risk forming.",
      "Recoverable table inventory.",
    ],
  },
  resy: {
    potentialSignals: ["Reservations", "Availability", "Party size", "Status"],
    combineWith: "POS · weather",
    radrCouldSee: ["Arrival density vs kitchen capacity."],
  },
  thefork: {
    potentialSignals: ["Reservations", "Availability", "Party size", "Channel"],
    combineWith: "POS · delivery",
    radrCouldSee: ["Booking pressure before covers arrive."],
  },
  mews: {
    potentialSignals: [
      "Reservations",
      "Rooms / resources",
      "Stay state",
      "Rates · availability",
      "Order / payment items (where available)",
    ],
    combineWith: "Channel manager · payments · events",
    radrCouldSee: [
      "Premium inventory exposure.",
      "Pickup vs channel economics.",
    ],
  },
  apaleo: {
    potentialSignals: [
      "Reservations",
      "Inventory",
      "Rates · restrictions",
      "Stay state",
    ],
    combineWith: "Channels · payments · events",
    radrCouldSee: ["Occupancy pressure with contribution context."],
  },
  "oracle-opera-cloud": {
    potentialSignals: [
      "Reservations",
      "Room inventory",
      "Rates",
      "Guest / stay state",
    ],
    combineWith: "Channels · housekeeping · events",
    radrCouldSee: ["Enterprise PMS evidence for channel Decisions."],
  },
  cloudbeds: {
    potentialSignals: ["Reservations", "Inventory", "Rates", "Channel"],
    combineWith: "Payments · events",
    radrCouldSee: ["Pickup and orphan-night exposure."],
  },
  siteminder: {
    potentialSignals: [
      "Availability",
      "Rates · restrictions",
      "Channel mix",
      "Inventory distribution",
    ],
    combineWith: "PMS · events · payments",
    radrCouldSee: [
      "Channel inventory and rate context.",
      "OTA mix vs direct contribution.",
    ],
  },
  "booking-connectivity": {
    potentialSignals: [
      "Reservations",
      "Availability",
      "Rates",
      "Channel status",
    ],
    combineWith: "PMS · channel manager",
    radrCouldSee: ["Booking.com demand vs house economics."],
  },
  personio: {
    potentialSignals: [
      "Scheduled labor (aggregate)",
      "Attendance / absence",
      "Hours · role · department",
      "Location",
    ],
    combineWith: "Demand · POS · reservations",
    radrCouldSee: [
      "Capacity coverage vs demand.",
      "Absence exposure before service.",
    ],
  },
  deputy: {
    potentialSignals: [
      "Schedules (aggregate)",
      "Attendance",
      "Hours · role",
      "Location",
    ],
    combineWith: "POS · reservations · weather",
    radrCouldSee: ["Labor-vs-demand mismatch."],
  },
  planday: {
    potentialSignals: [
      "Schedules (aggregate)",
      "Absence",
      "Hours · department",
      "Location",
    ],
    combineWith: "Demand · POS",
    radrCouldSee: ["Coverage gaps before peak."],
  },
  xero: {
    potentialSignals: [
      "Invoices · credit notes",
      "Payments",
      "Vendor balances",
      "Account codes",
    ],
    combineWith: "Supplier docs · POS · payments",
    radrCouldSee: [
      "Supplier recovery cases Finance can match.",
      "Credit application gaps.",
    ],
  },
  "quickbooks-online": {
    potentialSignals: [
      "Invoices · credits",
      "Payments",
      "Vendor balances",
      "Ledger evidence",
    ],
    combineWith: "Supplier docs · payments",
    radrCouldSee: ["AP leakage and verification paths."],
  },
  netsuite: {
    potentialSignals: [
      "Invoices · credits",
      "Payments",
      "Vendor balances",
      "Journal / ledger evidence",
    ],
    combineWith: "POS · payments · supplier docs",
    radrCouldSee: ["Multi-entity AP exceptions and recovery."],
  },
  "exact-online": {
    potentialSignals: ["Invoices", "Credits", "Payments", "Vendor balances"],
    combineWith: "Supplier docs · payments",
    radrCouldSee: ["Regional AP recovery evidence."],
  },
  sage: {
    potentialSignals: ["Invoices", "Credits", "Payments", "Vendor balances"],
    combineWith: "Supplier docs · payments",
    radrCouldSee: ["Close exceptions and credit application."],
  },
  adyen: {
    potentialSignals: [
      "Payments",
      "Fees",
      "Refunds",
      "Settlement batches",
      "Payouts · chargebacks",
    ],
    combineWith: "POS · delivery · accounting",
    radrCouldSee: [
      "Expected €9,814 · settled €9,521 · €293 unexplained.",
    ],
  },
  stripe: {
    potentialSignals: [
      "Payments",
      "Refunds · fees",
      "Payouts",
      "Payment status",
    ],
    combineWith: "POS · accounting · delivery",
    radrCouldSee: ["Settlement gaps and refund mismatches."],
  },
  mollie: {
    potentialSignals: ["Payments", "Refunds", "Settlements", "Payouts"],
    combineWith: "POS · accounting",
    radrCouldSee: ["Processor vs books reconciliation."],
  },
  "uber-eats": {
    potentialSignals: [
      "Orders",
      "Menu · availability",
      "Store status",
      "Order lifecycle",
      "Payout evidence (where permitted)",
    ],
    combineWith: "POS · kitchen · payments",
    radrCouldSee: [
      "Delivery contribution vs kitchen pressure.",
      "Channel mix Decisions.",
    ],
  },
  deliveroo: {
    potentialSignals: [
      "Orders",
      "Menu availability",
      "Store status",
      "Channel volume",
    ],
    combineWith: "POS · kitchen · payments",
    radrCouldSee: ["Delivery pressure vs in-house contribution."],
  },
  doordash: {
    potentialSignals: ["Orders", "Menu", "Store status", "Lifecycle"],
    combineWith: "POS · kitchen",
    radrCouldSee: ["Delivery mix and settlement context."],
  },
  "open-meteo": {
    potentialSignals: [
      "Temperature",
      "Precipitation · wind",
      "Weather condition",
      "Forecast",
    ],
    combineWith: "Terrace capacity · reservations · delivery",
    radrCouldSee: [
      "Terrace capacity may disappear at 19:20.",
      "Delivery pressure may rise simultaneously.",
    ],
  },
  predicthq: {
    potentialSignals: [
      "Nearby events",
      "Event type · time",
      "Venue · location",
      "Demand surge (where supported)",
    ],
    combineWith: "Reservations · rooms · labor",
    radrCouldSee: ["Thursday will behave like Saturday."],
  },
  ticketmaster: {
    potentialSignals: [
      "Nearby events",
      "Event date / time",
      "Venue",
      "Category",
    ],
    combineWith: "Reservations · rooms · labor",
    radrCouldSee: ["Arena night demand before bookings fully show it."],
  },
  "google-business-profile": {
    potentialSignals: [
      "Search / Maps impressions",
      "Directions · calls",
      "Website / booking clicks",
      "Food orders · menu interactions",
      "Reviews",
    ],
    combineWith: "Reservations · POS · weather",
    radrCouldSee: [
      "Demand rising before reservations fully show it.",
      "Reviews deteriorated while FOH staffing stayed normal.",
    ],
  },
  "google-analytics-4": {
    potentialSignals: [
      "Users · sessions",
      "Traffic source · campaign",
      "Engagement",
      "Conversion events",
      "Revenue / ecommerce (where configured)",
    ],
    combineWith: "Bookings · Search Console · revenue",
    radrCouldSee: [
      "Campaign demand vs operating pressure.",
      "Direct-booking funnel context.",
    ],
  },
  "google-search-console": {
    potentialSignals: [
      "Queries",
      "Impressions · clicks",
      "CTR · average position",
      "Page · country · device",
    ],
    combineWith: "GA4 · bookings · revenue",
    radrCouldSee: [
      "Destination demand rising before booking pace catches up.",
    ],
  },
  "google-places": {
    potentialSignals: [
      "Nearby places · categories",
      "Place information",
      "Opening information (where available)",
      "Ratings / counts (where supported)",
    ],
    combineWith: "Events · reservations · local demand",
    radrCouldSee: [
      "Neighborhood structure and venue density context.",
    ],
  },
  "files-csv": {
    potentialSignals: [
      "Invoices · credit memos",
      "Contracts · supplier statements",
      "Payments · CSV exports",
      "Accounting exports",
    ],
    combineWith: "AP · payments · POS evidence",
    radrCouldSee: [
      "First recovery pilot without a large API project.",
    ],
  },
  "byod-warehouse": {
    potentialSignals: ["Warehouse tables", "Exports", "Mapped entities"],
    combineWith: "Operating Twin · Decisions",
    radrCouldSee: ["Scoped custom evidence into Decisions."],
  },
  "radr-demo-reservations": {
    potentialSignals: ["Synthetic reservations", "Waitlist", "Locations"],
    combineWith: "Demo Decisions",
    radrCouldSee: ["Sandbox Decision flows without third-party access."],
  },
};

export function capabilityStoryFor(
  id: string,
): CapabilityStory | undefined {
  return INTEGRATION_CAPABILITY_STORY[id];
}

/** Honest access label for marketing — never "connected". */
export function accessStatusLabel(p: IntegrationProvider): string {
  if (p.category === "external-signals") return "External data";
  if (p.status === "custom") return "Scoped custom";
  return INTEGRATION_STATUS_LABEL[p.status];
}

export function categoryLabel(p: IntegrationProvider): string {
  return INTEGRATION_CATEGORY_LABEL[p.category];
}

/** Google stack shown as one homepage tile */
export const GOOGLE_STACK_IDS = [
  "google-business-profile",
  "google-analytics-4",
  "google-search-console",
  "google-places",
] as const;

export type GoogleStackId = (typeof GOOGLE_STACK_IDS)[number];
