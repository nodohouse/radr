import { DECISION } from "./ids";
import type { ValueLine } from "./types";

export const VALUE_LADDER = [
  {
    id: "identified",
    label: "Identified",
    because: "Material money themes spotted across systems",
  },
  {
    id: "expected",
    label: "Expected",
    because: "Modeled if Decision path holds — not cash",
  },
  {
    id: "observed",
    label: "Observed",
    because: "Service/period closed · numbers landed",
  },
  {
    id: "attributed",
    label: "Attributed",
    because: "Linked to Decision + prepared action",
  },
  {
    id: "verified",
    label: "Verified",
    because: "Ledger-matched Trace · book fields sealed",
  },
] as const;

export const VALUE_LINES: ValueLine[] = [
  {
    id: DECISION.tuna.id,
    displayId: DECISION.tuna.displayId,
    title: "Tuna Tataki shortfall before peak",
    euro: 1590,
    grade: "Verified",
    because: "Peak contribution protected · POS close",
    band: "verified",
  },
  {
    id: "dec_menu_verified_demo",
    displayId: DECISION.menuPeak.displayId,
    title: "DE-EMPHASIZE 19:00–20:30 ONLY",
    euro: 610,
    grade: "Verified",
    because: "Peak de-emphasis · STRONGLY_ATTRIBUTED · DEMO",
    band: "verified",
  },
  {
    id: "dec_stock_demo",
    displayId: "D-7302",
    title: "PROTECT STOCK · SHIFT PROMOTION",
    euro: 280,
    grade: "Verified",
    because: "Stock protected · MODELED attribution · DEMO SIGNAL — not verified campaign revenue",
    band: "verified",
  },
  {
    id: "dec_mix_demo",
    displayId: "D-7401",
    title: "FIX KITCHEN MIX",
    euro: 350,
    grade: "Verified",
    because: "Kitchen-mix intervention · STRONGLY_ATTRIBUTED · DEMO",
    band: "verified",
  },
  {
    id: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
    title: "WAIT 12 MINUTES",
    euro: 620,
    grade: "Expected",
    because: "Kitchen 92% · seat-now burns 9 second turns",
    band: "active",
    seed: "service",
  },
  {
    id: DECISION.supplier.id,
    displayId: DECISION.supplier.displayId,
    title: "DISPUTE AP CREDIT",
    euro: 273,
    grade: "Expected",
    because: "INV-88421 above contract — CM not posted",
    band: "active",
    seed: "recover",
  },
  {
    id: DECISION.hotelOrphan.id,
    displayId: DECISION.hotelOrphan.displayId,
    title: "RELEASE ORPHAN NIGHTS",
    euro: 640,
    grade: "Expected",
    because: "2 unsold nights · pickup window still open",
    band: "pending",
    seed: "hotel",
  },
];

export const VERIFIED_TOTAL = 2830;
export const ACTIVE_EXPOSURE = 1061;
