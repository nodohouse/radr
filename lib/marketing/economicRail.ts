/**
 * Shared economic data for kinetic rails / marquees.
 * Illustrative — not customer results.
 */

export type EconomicTone = "exposure" | "verified" | "neutral" | "urgent";

export type EconomicRailItem = {
  id: string;
  euro: string;
  label: string;
  meta?: string;
  tone?: EconomicTone;
  detail?: string;
};

export const HOME_RAIL: EconomicRailItem[] = [
  {
    id: "d4102",
    euro: "€273",
    label: "Contract variance",
    meta: "D-4102",
    tone: "exposure",
    detail: "Invoice €7.45/L · Contract €6.80/L · 420 L",
  },
  {
    id: "settle",
    euro: "€293",
    label: "Settlement gap",
    meta: "Pending",
    tone: "exposure",
    detail: "Expected €9,814 · Actual €9,521",
  },
  {
    id: "food",
    euro: "+2.3pts",
    label: "Food cost",
    meta: "Drivers",
    tone: "urgent",
    detail: "Price · yield · waste · mix",
  },
  {
    id: "procure",
    euro: "3×",
    label: "Locations · 3 prices",
    meta: "SKU",
    tone: "neutral",
    detail: "Berlin · Amsterdam · Lisbon — normalize before leverage",
  },
  {
    id: "room",
    euro: "€184",
    label: "Room-night at risk",
    meta: "19h left",
    tone: "urgent",
    detail: "Cancelled · recovery window open",
  },
  {
    id: "credit",
    euro: "€273",
    label: "Credit issued · not applied",
    meta: "AP",
    tone: "exposure",
    detail: "CM issued — never matched to the invoice",
  },
  {
    id: "noshow",
    euro: "47m",
    label: "No-show · time left",
    meta: "Recover",
    tone: "urgent",
    detail: "Perishable inventory still recoverable",
  },
  {
    id: "rebate",
    euro: "—",
    label: "Rebate earned · not posted",
    meta: "AP",
    tone: "exposure",
    detail: "Earned rebate missing from the ledger",
  },
  {
    id: "delivery",
    euro: "+11%",
    label: "Delivery fees",
    meta: "Leak",
    tone: "neutral",
    detail: "Fee movement without contribution check",
  },
  {
    id: "verified",
    euro: "€590",
    label: "Verified",
    meta: "Service",
    tone: "verified",
    detail: "Illustrative Verified outcome · matched evidence",
  },
];

export const LEAK_MARQUEE: EconomicRailItem[] = [
  { id: "m1", euro: "—", label: "Unapplied credit", tone: "exposure" },
  { id: "m2", euro: "—", label: "Price dispersion", tone: "neutral" },
  { id: "m3", euro: "€293", label: "Settlement gap", tone: "exposure" },
  { id: "m4", euro: "—", label: "Yield loss", tone: "urgent" },
  { id: "m5", euro: "€184", label: "Cancelled room", tone: "urgent" },
  { id: "m6", euro: "—", label: "Missed rebate", tone: "exposure" },
  { id: "m7", euro: "—", label: "Duplicate charge", tone: "exposure" },
  { id: "m8", euro: "—", label: "No-show", tone: "urgent" },
  { id: "m9", euro: "—", label: "Refund mismatch", tone: "exposure" },
];

export const PATTERN_STRIP = [
  "Contract variance",
  "Settlement mismatch",
  "Yield loss",
  "Price dispersion",
  "No-show exposure",
  "Room-night expiry",
  "Unapplied credit",
  "Rebate gap",
  "Delivery fee leakage",
] as const;

export const PRICING_PROOF_RAIL: EconomicRailItem[] = [
  {
    id: "p1",
    euro: "€273",
    label: "Supplier recovery",
    meta: "Illustrative",
    tone: "verified",
  },
  {
    id: "p2",
    euro: "€293",
    label: "Reconciled",
    meta: "Illustrative",
    tone: "verified",
  },
  {
    id: "p3",
    euro: "€184",
    label: "Perishable value",
    meta: "Illustrative",
    tone: "verified",
  },
  {
    id: "p4",
    euro: "€590",
    label: "Verified service outcome",
    meta: "Illustrative",
    tone: "verified",
  },
];
