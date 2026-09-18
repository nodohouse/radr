/**
 * Composable Control Center modules — decision/value objects, not chart widgets.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { canonicalVerifiedTotal } from "@/lib/radr/product/verifiedValueCanon";

export type ModuleCategory =
  | "BUY"
  | "SELL"
  | "LABOR"
  | "RECOVER"
  | "VALUE"
  | "MEMORY";

export type ModuleGrade = "Expected" | "Verified";

export type LabModule = {
  id: string;
  category: ModuleCategory;
  decisionId: string;
  displayId: string;
  title: string;
  euro: number;
  euroLabel: string;
  clock: string;
  grade: ModuleGrade;
  /** One-line reasoning — required on every money module */
  because: string;
  blurb: string;
  href: string;
};

export const LAB_MODULE_CATALOG: LabModule[] = [
  {
    id: "mod_peak",
    category: "SELL",
    decisionId: DECISION_IDS.peak,
    displayId: "D-1911",
    title: "WAIT 12 MINUTES",
    euro: 620,
    euroLabel: "Expected contribution",
    clock: "Decide by 18:53 · ~11m",
    grade: "Expected",
    because: "Kitchen 92% · seat-now burns 9 second turns",
    blurb: "38 inbound + delivery +31% — hold walk-ins, throttle delivery.",
    href: "/app/lab/control-center?seed=service",
  },
  {
    id: "mod_menu",
    category: "SELL",
    decisionId: DECISION_IDS.menuPeak,
    displayId: "D-7110",
    title: "DE-EMPHASIZE PEAK WINDOW",
    euro: 610,
    euroLabel: "Expected protected",
    clock: "Tonight · 19:00–20:30",
    grade: "Expected",
    because: "Signature mix burns cold-station minutes at peak",
    blurb: "BUY × LABOR × SELL — feature swap before rush-order.",
    href: "/app/lab/decisions/d-7110",
  },
  {
    id: "mod_labor",
    category: "LABOR",
    decisionId: DECISION_IDS.labor,
    displayId: "D-1920",
    title: "HOLD LABOR PLAN",
    euro: 410,
    euroLabel: "Expected protected",
    clock: "Tonight service",
    grade: "Expected",
    because: "Headcount in plan — risk is kitchen mix, not roster",
    blurb: "Do not add labor; protect contribution via Wait-12 path.",
    href: "/app/lab/decisions/d-1920",
  },
  {
    id: "mod_supplier",
    category: "RECOVER",
    decisionId: DECISION_IDS.supplier,
    displayId: "D-4102",
    title: "AP CREDIT APPLIED",
    euro: 273,
    euroLabel: "Verified recovered",
    clock: "Matched to invoice",
    grade: "Verified",
    because: "Credit memo applied · matched to the original invoice",
    blurb: "€273 recovered and matched to the original invoice.",
    href: "/app/lab/control-center?seed=recover",
  },
  {
    id: "mod_buy_oil",
    category: "BUY",
    decisionId: DECISION_IDS.supplier,
    displayId: "D-4102",
    title: "HOLD ABOVE-CONTRACT PO",
    euro: 273,
    euroLabel: "Same recovery",
    clock: "This week",
    grade: "Verified",
    because: "Next PO blocked until credit path reviewed",
    blurb: "Linked to the same recovery — not a separate estimate.",
    href: "/app/lab/control-center?seed=recover",
  },
  {
    id: "mod_tuna_v",
    category: "VALUE",
    decisionId: DECISION_IDS.tuna,
    displayId: "D-1842",
    title: "TUNA SHORTFALL · VERIFIED",
    euro: 1590,
    euroLabel: "Verified protected",
    clock: "Verified · 12 Sep",
    grade: "Verified",
    because: "POS close + stock adjustment matched on ledger",
    blurb: "Trace sealed — book-matchable Verified Value.",
    href: "/app/lab/value?band=verified",
  },
  {
    id: "mod_value_ladder",
    category: "VALUE",
    decisionId: DECISION_IDS.peak,
    displayId: "LEDGER",
    title: "VERIFIED VALUE LADDER",
    euro: canonicalVerifiedTotal("cfo"),
    euroLabel: "Verified total",
    clock: "Since last check",
    grade: "Verified",
    because: "Identified → Expected → Observed → Attributed → Verified",
    blurb: "Portfolio total = sum of Verified records in CFO scope.",
    href: "/app/lab/value?band=verified",
  },
  {
    id: "mod_memory",
    category: "MEMORY",
    decisionId: DECISION_IDS.playbook,
    displayId: "PLAYBOOK",
    title: "FRIDAY PEAK CAPACITY",
    euro: 0,
    euroLabel: "12 comparable services",
    clock: "Playbook v3",
    grade: "Verified",
    because: "Feature-swap-first beat rush-order on 3 verified nights",
    blurb: "What we tried → observed → verified → next Friday.",
    href: "/app/lab/memory?scope=playbook",
  },
];

export type CenterRole = "gm" | "cfo" | "clevel";

export const ROLE_PRESETS: Record<
  CenterRole,
  { label: string; moduleIds: string[]; note: string }
> = {
  gm: {
    label: "GM",
    moduleIds: ["mod_peak", "mod_labor", "mod_menu", "mod_memory"],
    note: "Sell + Labor · tonight",
  },
  cfo: {
    label: "CFO",
    moduleIds: ["mod_supplier", "mod_buy_oil", "mod_tuna_v", "mod_value_ladder"],
    note: "Recover + Buy · Verified Value",
  },
  clevel: {
    label: "C-level",
    moduleIds: ["mod_value_ladder", "mod_peak", "mod_supplier", "mod_memory"],
    note: "Verified + material decisions",
  },
};

export function modulesByIds(ids: string[]): LabModule[] {
  return ids
    .map((id) => LAB_MODULE_CATALOG.find((m) => m.id === id))
    .filter(Boolean) as LabModule[];
}

export const CATEGORY_ORDER: ModuleCategory[] = [
  "SELL",
  "LABOR",
  "BUY",
  "RECOVER",
  "VALUE",
  "MEMORY",
];
