import { ROLE_PRESETS } from "./modules";
import type { FloorNote, RoleId, RoleLens, ThemeCard, WinLoss } from "./types";

export const ROLE_LENSES: Record<RoleId, RoleLens> = {
  gm: {
    role: "gm",
    label: "GM",
    title: "Control Center",
    subtitle: "Ops tonight · who’s coming · what to hold",
    demoPath: "GM night-of · graph → Wait-12 → FOH brief",
    note: "Sell + Labor · tonight",
    defaultSeed: "service",
    defaultBrief: "foh",
    showBrief: true,
    showFloor: true,
    showWinLoss: false,
    showThemes: false,
    catalogEmphasis: ["SELL", "LABOR"],
    moduleIds: ROLE_PRESETS.gm,
    pulseEmphasis: "ops",
  },
  cfo: {
    role: "cfo",
    label: "CFO",
    title: "Control Center",
    subtitle: "Money in / out · Recover + Buy · Verified ladder",
    demoPath: "CFO Monday · in/out/forecast → Recover",
    note: "Recover + Buy · Verified ladder",
    defaultSeed: "recover",
    defaultBrief: "cfo",
    showBrief: true,
    showFloor: false,
    showWinLoss: true,
    showThemes: false,
    catalogEmphasis: ["RECOVER", "BUY", "VALUE"],
    moduleIds: ROLE_PRESETS.cfo,
    pulseEmphasis: "pnl",
  },
  clevel: {
    role: "clevel",
    label: "C-level",
    title: "Control Center",
    subtitle: "Pulse summary · top money themes · Verified",
    demoPath: "C-level · three money themes",
    note: "Verified + material decisions",
    defaultSeed: "service",
    defaultBrief: "gm",
    showBrief: false,
    showFloor: false,
    showWinLoss: true,
    showThemes: true,
    catalogEmphasis: ["VALUE", "SELL", "RECOVER"],
    moduleIds: ROLE_PRESETS.clevel,
    pulseEmphasis: "summary",
  },
};

export const SERVICE_FLOOR: FloorNote[] = [
  {
    id: "arriving",
    label: "Arriving",
    value: "4 covers · 20m",
    because: "density compresses — hold walk-ins first",
  },
  {
    id: "returning",
    label: "Returning",
    value: "2 regulars",
    because: "honor tables after Wait-12 resume 18:54",
  },
  {
    id: "vip",
    label: "VIP / allergy",
    value: "VIP 6 · T12 nut",
    because: "must sit 18:50 — already on Decision context",
  },
  {
    id: "turns",
    label: "Turn-risk",
    value: "T4 · T7 · T11",
    because: "linked to D-1911 · €620 Expected",
    hot: true,
  },
];

export const HOTEL_FLOOR: FloorNote[] = [
  {
    id: "arrivals",
    label: "Arriving",
    value: "8 rooms · 90m",
    because: "2 VIP keep booked inventory — do not release",
  },
  {
    id: "cancels",
    label: "Late cancels",
    value: "3 + 1 no-show risk",
    because: "created the orphan-night cluster on Pulse",
  },
  {
    id: "direct",
    label: "Hold on direct",
    value: "3 deluxe",
    because: "OTA mix already heavy — D-3308",
  },
  {
    id: "orphan",
    label: "Orphan nights",
    value: "2 unit-nights",
    because: "linked to D-3301 · €640 Expected",
    hot: true,
  },
];

export const THEMES: ThemeCard[] = [
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
    euro: 2830,
    grade: "Verified",
    because: "Ledger-matched tuna shortfall + prior closes",
    wedge: "VALUE",
    href: "/app/lab/value?band=verified",
  },
];

export const WIN_LOSS: WinLoss[] = [
  {
    kind: "win",
    label: "Protected",
    euro: 2830,
    grade: "Verified",
    because: "tuna shortfall Trace sealed on ledger",
    cta: "Open Trace",
    href: "/app/lab/value?band=verified",
  },
  {
    kind: "loss",
    label: "Leaking",
    euro: 273,
    grade: "Expected",
    because: "INV-88421 above contract — CM not posted",
    cta: "Open Recover",
    href: "/app/lab/control-center?seed=recover",
  },
];

export const HEALTH = {
  service: [
    { kind: "degraded" as const, source: "Delivery", detail: "Intake delayed ~4m." },
    { kind: "stale" as const, source: "Walk-in mix", detail: "€620 stays Expected, not Verified." },
  ],
  hotel: [
    { kind: "degraded" as const, source: "Channel", detail: "OTA pickup lag ~6m." },
    { kind: "stale" as const, source: "No-show file", detail: "€640 stays Expected until night audit." },
  ],
  recover: [
    { kind: "degraded" as const, source: "AP sync", detail: "Lag ~2h. INV-88421 still matches last good pull." },
    { kind: "stale" as const, source: "Yield", detail: "€273 stays Expected until CM posts." },
  ],
};
