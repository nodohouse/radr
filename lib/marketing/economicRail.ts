/**
 * Shared economic data for kinetic rails / marquees.
 * Illustrative — not customer results.
 * Mixes hospitality verticals; euros from canonical fixtures only.
 */

import type { EconomicTone } from "./economicRailTypes";
import {
  CANON_OTA,
  CANON_ORPHAN,
  CANON_PEAK,
  CANON_SUPPLIER,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export type { EconomicTone };

export type EconomicRailItem = {
  id: string;
  euro: string;
  label: string;
  meta?: string;
  tone?: EconomicTone;
  detail?: string;
};

const money = formatDecisionMoney;

export const HOME_RAIL: EconomicRailItem[] = [
  {
    id: "peak",
    euro: money(CANON_PEAK.expectedProtectedEuro),
    label: "Peak capacity",
    meta: "Restaurant",
    tone: "urgent",
    detail: "Berlin Mitte · wait 12 vs seat-now",
  },
  {
    id: "premium",
    euro: money(CANON_OTA.exposureEuro),
    label: "Premium inventory",
    meta: "Hotel",
    tone: "exposure",
    detail: "Canal House · hold 4 premium direct",
  },
  {
    id: "orphan",
    // Gross night at risk · CANON_ORPHAN.exposureEuro (€164). Pass brief cited €184;
    // keep fixture so Home / Platform / Value stay coherent.
    euro: money(CANON_ORPHAN.exposureEuro),
    label: "Night at risk",
    meta: "Serviced",
    tone: "urgent",
    detail: "Chiado · orphan night · recovery window",
  },
  {
    id: "d4102",
    euro: money(CANON_SUPPLIER.exposureEuro),
    label: "Contract variance",
    meta: "Finance",
    tone: "exposure",
    detail: "Invoice €7.45/L · Contract €6.80/L · 420 L",
  },
  {
    id: "settle",
    euro: "€293",
    label: "Settlement gap",
    meta: "Reconciliation",
    tone: "exposure",
    detail: "Expected €9,814 · Actual €9,521",
  },
  {
    id: "verified",
    euro: money(CANON_PEAK.actualProtectedEuro),
    label: "Verified.",
    tone: "verified",
    detail: "Illustrative Verified outcome · matched evidence",
  },
  {
    id: "d4102v",
    euro: money(CANON_SUPPLIER.actualProtectedEuro),
    label: "Verified · D-4102",
    meta: "DEMO",
    tone: "verified",
    detail: "Credit matched to original invoice",
  },
];

export const LEAK_MARQUEE: EconomicRailItem[] = [
  { id: "uc", euro: "—", label: "Unapplied credit", tone: "exposure" },
  { id: "dup", euro: "—", label: "Duplicate charge", tone: "exposure" },
  { id: "sg", euro: "€293", label: "Settlement gap", tone: "exposure" },
  { id: "yl", euro: "—", label: "Yield loss", tone: "urgent" },
  { id: "rb", euro: "—", label: "Missed rebate", tone: "exposure" },
  { id: "ns", euro: "—", label: "No-show", tone: "urgent" },
  { id: "cx", euro: "—", label: "Room cancellation", tone: "urgent" },
  { id: "pd", euro: "—", label: "Price dispersion", tone: "neutral" },
  { id: "rf", euro: "—", label: "Refund mismatch", tone: "exposure" },
];

export const PRICING_PROOF_RAIL: EconomicRailItem[] = [
  {
    id: "v1",
    euro: money(CANON_PEAK.actualProtectedEuro),
    label: "Verified · D-1911",
    meta: "DEMO",
    tone: "verified",
  },
  {
    id: "v2",
    euro: money(CANON_OTA.actualProtectedEuro),
    label: "Verified · D-2201",
    meta: "DEMO",
    tone: "verified",
  },
  {
    id: "v3",
    euro: money(CANON_SUPPLIER.actualProtectedEuro),
    label: "Verified · D-4102",
    meta: "DEMO",
    tone: "verified",
  },
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
  "Refund mismatch",
] as const;
