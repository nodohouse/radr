import { canonicalVerifiedTotal } from "@/lib/radr/product/verifiedValueCanon";
/**
 * Role lenses — whole Center composition, not cosmetic chips.
 */

import type { CenterRole } from "./labModules";
import type { BriefPacket } from "./labServiceBrief";
import { defaultPacketForRole } from "./labServiceBrief";
import type { LabSeed } from "./labState";

export type KpiKey =
  | "expected_tonight"
  | "verified"
  | "active_exposure"
  | "needs_you"
  | "revenue_in"
  | "money_out"
  | "recover_exposure"
  | "identified"
  | "expected_ladder"
  | "verified_ladder";

export type RoleLens = {
  role: CenterRole;
  title: string;
  subtitle: string;
  demoPath: string;
  kpis: KpiKey[];
  showPulse: boolean;
  pulseMode: "ops" | "pnl" | "summary";
  showBrief: boolean;
  defaultBriefPacket: BriefPacket;
  showFloorNotes: boolean;
  showWinLoss: boolean;
  showThemes: boolean;
  heroPrefer: LabSeed | "active";
  catalogEmphasis: Array<"BUY" | "SELL" | "LABOR" | "RECOVER" | "VALUE">;
};

export const ROLE_LENSES: Record<CenterRole, RoleLens> = {
  gm: {
    role: "gm",
    title: "Control Center",
    subtitle: "Ops tonight · who’s coming · what to hold",
    demoPath: "GM night-of · Wait-12 + FOH brief",
    kpis: ["expected_tonight", "needs_you", "active_exposure", "verified"],
    showPulse: true,
    pulseMode: "ops",
    showBrief: true,
    defaultBriefPacket: "foh",
    showFloorNotes: true,
    showWinLoss: false,
    showThemes: false,
    heroPrefer: "service",
    catalogEmphasis: ["SELL", "LABOR"],
  },
  cfo: {
    role: "cfo",
    title: "Control Center",
    subtitle: "Money in / out · Recover + Buy · Verified Value",
    demoPath: "CFO Monday morning · AP credit + Trace",
    kpis: ["revenue_in", "money_out", "recover_exposure", "verified"],
    showPulse: true,
    pulseMode: "pnl",
    showBrief: true,
    defaultBriefPacket: "cfo",
    showFloorNotes: false,
    showWinLoss: true,
    showThemes: false,
    heroPrefer: "recover",
    catalogEmphasis: ["RECOVER", "BUY", "VALUE"],
  },
  clevel: {
    role: "clevel",
    title: "Control Center",
    subtitle: "Portfolio · Identified → Expected → Verified",
    demoPath: "C-level · three money themes",
    kpis: ["identified", "expected_ladder", "verified_ladder", "needs_you"],
    showPulse: true,
    pulseMode: "summary",
    showBrief: false,
    defaultBriefPacket: defaultPacketForRole("clevel"),
    showFloorNotes: false,
    showWinLoss: true,
    showThemes: true,
    heroPrefer: "active",
    catalogEmphasis: ["VALUE", "SELL", "RECOVER"],
  },
};

export type MoneyTheme = {
  id: string;
  title: string;
  euro: number;
  grade: "Expected" | "Verified";
  because: string;
  wedge: string;
  href: string;
};

export const CLEVEL_THEMES: MoneyTheme[] = [
  {
    id: "t1",
    title: "Peak contribution at risk",
    euro: 620,
    grade: "Expected",
    because: "Kitchen constraint before seats — Wait-12 still open",
    wedge: "SELL × LABOR",
    href: "/app/lab/control-center?seed=service",
  },
  {
    id: "t2",
    title: "AP leakage open",
    euro: 273,
    grade: "Expected",
    because: "Invoice above contract · credit memo not posted",
    wedge: "RECOVER × BUY",
    href: "/app/lab/control-center?seed=recover",
  },
  {
    id: "t3",
    title: "Verified protection banked",
    euro: canonicalVerifiedTotal("coo"),
    grade: "Verified",
    because: "Sum of Verified records in portfolio scope",
    wedge: "VALUE",
    href: "/app/lab/value?band=verified",
  },
];
