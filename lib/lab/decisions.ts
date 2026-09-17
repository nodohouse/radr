import { autopilotForSeed } from "./autopilot";
import { minutesUntilDeadline, SERVICE_CLOCK } from "./clock";
import { DECISION } from "./ids";
import type { DecisionHero, DecisionMode, FutureOption, SeedId } from "./types";

const SERVICE_FUTURES: FutureOption[] = [
  { id: "seat_now", title: "Seat now", euro: 0, note: "Kitchen →97% · turns slip" },
  {
    id: "wait_12",
    title: "Wait 12 min",
    euro: 620,
    note: "Hold walk-ins · throttle delivery",
    recommended: true,
  },
  { id: "hard_stop", title: "Kill delivery", euro: 180, note: "Protects kitchen · over-corrects" },
];

const RECOVER_FUTURES: FutureOption[] = [
  { id: "seat_now", title: "Pay as invoiced", euro: 0, note: "Variance compounds" },
  {
    id: "wait_12",
    title: "Dispute + yield",
    euro: 273,
    note: "AP credit path · REC",
    recommended: true,
  },
  { id: "hard_stop", title: "Reprice menu", euro: null, note: "Does not resolve source" },
];

const HOTEL_FUTURES: FutureOption[] = [
  { id: "seat_now", title: "Leave orphan", euro: 0, note: "2 nights unsold after 20:00" },
  {
    id: "wait_12",
    title: "Release + reprice",
    euro: 640,
    note: "Open remaining · protect direct",
    recommended: true,
  },
  { id: "hard_stop", title: "Stop-sell OTA", euro: 220, note: "Protects mix · over-corrects pickup" },
];

export function getDecisionHero(
  seed: SeedId,
  mode: DecisionMode,
  selectedFuture: string,
): DecisionHero {
  if (seed === "recover") {
    const future = RECOVER_FUTURES.find((f) => f.id === selectedFuture) ?? RECOVER_FUTURES[1]!;
    const live = mode !== "futures" && mode !== "approved";
    const euro = live ? 273 : (future.euro ?? 0);
    return {
      id: DECISION.supplier.id,
      displayId: DECISION.supplier.displayId,
      title: live ? "DISPUTE AP CREDIT" : future.title.toUpperCase(),
      sub: live
        ? "Dispute INV-88421 · hold next above-contract PO · check yield · no reprice"
        : future.note,
      wedge: "RECOVER",
      euro,
      grade: "Expected",
      because: "INV-88421 above contract — CM draft pending Trace",
      moneyMeta: "AP variance · recoverable",
      deadlineLabel: "28 Sep",
      clockLabel: "11 days",
      recommendedFuture: "wait_12",
      futures: RECOVER_FUTURES,
      whyLines: [
        "Contract €6.80/L · Invoice €7.45/L · 420 L",
        "→ Invoice variance €273 in AP",
        "→ Dispute recovers €273 Expected — Verified only when CM posts",
      ],
      actions: [
        {
          system: "AP",
          title: "Dispute supplier variance",
          detail: "INV-88421 · prepare credit memo CM-DRAFT",
          policy: "ask",
        },
        {
          system: "Purchasing",
          title: "Hold next above-contract exception",
          detail: "Prepared · not written back",
          policy: "auto",
        },
        {
          system: "Kitchen",
          title: "Investigate usage / yield",
          detail: "+4% usage separate from price effect",
          policy: "demo",
        },
      ],
      autopilot: autopilotForSeed("recover"),
      seed,
    };
  }

  if (seed === "hotel") {
    const future = HOTEL_FUTURES.find((f) => f.id === selectedFuture) ?? HOTEL_FUTURES[1]!;
    const live = mode !== "futures" && mode !== "approved";
    const euro = live ? 640 : (future.euro ?? 0);
    return {
      id: DECISION.hotelOrphan.id,
      displayId: DECISION.hotelOrphan.displayId,
      title: live ? "RELEASE ORPHAN NIGHTS" : future.title.toUpperCase(),
      sub: live
        ? "Release 2 unsold nights · hold remaining premium on direct · reprice before 20:00"
        : future.note,
      wedge: "SELL",
      euro,
      grade: "Expected",
      because: "Cancellation cluster left 2 orphan nights · pickup window closes 20:00",
      moneyMeta: "Incremental vs leave-orphan · tonight",
      deadlineLabel: "20:00",
      clockLabel: "78 min",
      recommendedFuture: "wait_12",
      futures: HOTEL_FUTURES,
      whyLines: [
        "3 late cancels + 1 no-show risk · 2 unit-nights unsold",
        "→ OTA mix already heavy — dumping to OTA taxes contribution",
        "→ Release + reprice on direct protects €640 Expected",
      ],
      actions: [
        {
          system: "CHANNEL",
          title: "Hold remaining premium on direct",
          detail: "Prepared stop on last 3 deluxe · not written to channel manager",
          policy: "auto",
        },
        {
          system: "PMS",
          title: "Release orphan nights",
          detail: "Open 2 unit-nights for same-day pickup",
          policy: "ask",
        },
        {
          system: "RECOVER",
          title: "No-show fee path",
          detail: "Draft fee / waiver packet — demo/policy",
          policy: "demo",
        },
      ],
      autopilot: autopilotForSeed("hotel"),
      seed,
    };
  }

  const future = SERVICE_FUTURES.find((f) => f.id === selectedFuture) ?? SERVICE_FUTURES[1]!;
  const live = mode !== "futures" && mode !== "approved";
  const euro = live ? 620 : (future.euro ?? 0);
  return {
    id: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
    title: live ? "WAIT 12 MINUTES" : future.title.toUpperCase(),
    sub: live
      ? `Hold 2 walk-ins · throttle 25m · feature high €/min · resume ${SERVICE_CLOCK.resumeLabel}`
      : future.note,
    wedge: "SELL",
    euro,
    grade: "Expected",
    because: "Kitchen 92% · seat-now burns 9 second turns",
    moneyMeta: "Incremental vs seat-now · tonight",
    deadlineLabel: SERVICE_CLOCK.deadlineLabel,
    clockLabel: `${minutesUntilDeadline()} min`,
    recommendedFuture: "wait_12",
    futures: SERVICE_FUTURES,
    whyLines: [
      "38 inbound + delivery +31% · kitchen 92%",
      "→ Seat-now →97% · 9 turns exposed",
      "→ Wait protects €620 expected — Verified only after POS close",
    ],
    actions: [
      {
        system: "FLOOR",
        title: "Hold next walk-in table",
        detail: `Resume ${SERVICE_CLOCK.resumeLabel}`,
        policy: "ask",
      },
      {
        system: "DELIVERY",
        title: "Throttle 25 minutes",
        detail: "Prepared · not written back",
        policy: "auto",
      },
      {
        system: "MENU",
        title: "Feature faster high-€/min dish",
        detail: "Peak window only · demo/policy",
        policy: "demo",
      },
    ],
    autopilot: autopilotForSeed("service"),
    seed,
  };
}

export type QueueCard = {
  id: string;
  displayId: string;
  title: string;
  euro: number;
  grade: "Expected" | "Verified";
  clock: string;
  because: string;
  wedge: "BUY" | "SELL" | "LABOR" | "RECOVER";
  seed?: SeedId;
  sortEuro: number;
  sortMin: number;
};

export const DECISION_QUEUE: QueueCard[] = [
  {
    id: DECISION.peak.id,
    displayId: DECISION.peak.displayId,
    title: "WAIT 12 MINUTES",
    euro: 620,
    grade: "Expected",
    clock: "Decide by 18:53 · 11m",
    because: "Kitchen 92% · seat-now burns 9 second turns",
    wedge: "SELL",
    seed: "service",
    sortEuro: 620,
    sortMin: 11,
  },
  {
    id: DECISION.menuPeak.id,
    displayId: DECISION.menuPeak.displayId,
    title: "DE-EMPHASIZE PEAK WINDOW",
    euro: 610,
    grade: "Expected",
    clock: "Tonight · 19:00–20:30",
    because: "Signature mix burns cold-station minutes at peak",
    wedge: "SELL",
    seed: "service",
    sortEuro: 610,
    sortMin: 90,
  },
  {
    id: DECISION.hotelOrphan.id,
    displayId: DECISION.hotelOrphan.displayId,
    title: "RELEASE ORPHAN NIGHTS",
    euro: 640,
    grade: "Expected",
    clock: "Tonight · before 20:00",
    because: "2 unsold nights after cancellation cluster",
    wedge: "SELL",
    seed: "hotel",
    sortEuro: 640,
    sortMin: 78,
  },
  {
    id: DECISION.labor.id,
    displayId: DECISION.labor.displayId,
    title: "HOLD LABOR PLAN",
    euro: 410,
    grade: "Expected",
    clock: "Tonight service",
    because: "Headcount OK — risk is kitchen mix, not roster",
    wedge: "LABOR",
    seed: "service",
    sortEuro: 410,
    sortMin: 180,
  },
  {
    id: DECISION.margin.id,
    displayId: DECISION.margin.displayId,
    title: "CATEGORY REBALANCE",
    euro: 168,
    grade: "Expected",
    clock: "This week · before next beverage feature",
    because: "This week · before next beverage feature",
    wedge: "SELL",
    seed: "service",
    sortEuro: 168,
    sortMin: 240,
  },
  {
    id: DECISION.supplier.id,
    displayId: DECISION.supplier.displayId,
    title: "DISPUTE AP CREDIT",
    euro: 273,
    grade: "Expected",
    clock: "28 Sep · 11d",
    because: "INV-88421 above contract — CM draft pending",
    wedge: "RECOVER",
    seed: "recover",
    sortEuro: 273,
    sortMin: 15840,
  },
];

export function queueForRole(role: "gm" | "cfo" | "clevel"): QueueCard[] {
  if (role === "cfo") {
    return [...DECISION_QUEUE].sort((a, b) => {
      const rank = (w: QueueCard["wedge"]) => (w === "RECOVER" ? 0 : w === "BUY" ? 1 : 2);
      return rank(a.wedge) - rank(b.wedge) || b.sortEuro - a.sortEuro;
    });
  }
  if (role === "clevel") {
    return [...DECISION_QUEUE].sort((a, b) => b.sortEuro - a.sortEuro);
  }
  return [...DECISION_QUEUE].sort((a, b) => a.sortMin - b.sortMin);
}
