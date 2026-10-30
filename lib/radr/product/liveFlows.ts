/**
 * Live money / order / stock / delivery / resource flows — canonical fixtures.
 * OBSERVED · MODELED · ACCRUED · SETTLED · ESTIMATED. No React-side invention.
 */

import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { IntelJudgment } from "@/lib/radr/intelligence/moduleRegistry";

export type EvidenceClass =
  | "OBSERVED"
  | "MODELED"
  | "SETTLED"
  | "ESTIMATED"
  | "ACCRUED";

export type MoneyFlowStep = {
  id: string;
  label: string;
  amount: number;
  kind: "inflow" | "reduction" | "result";
  evidence: EvidenceClass;
  channel?: string;
};

export type MoneySource = {
  id: string;
  label: string;
  amount: number;
  evidence: EvidenceClass;
};

export type MoneyFlowReport = {
  sources: MoneySource[];
  steps: MoneyFlowStep[];
  contributionPace: number;
  grossRevenue: number;
  radrRead: string;
  judgment: IntelJudgment;
};

export type OrderChannelRow = {
  id: string;
  label: string;
  orders: number;
  revenue: number;
  sharePct: number;
  vsComparableOrders: number;
  feeDragEuro: number | null;
  evidence: EvidenceClass;
  pending?: number;
  avgPrepMin?: number;
};

export type OrderFlowReport = {
  channels: OrderChannelRow[];
  totalOrders: number;
  last30mOrders: number;
  last30mDeltaPct: number;
  last30mGross: number;
  last30mFees: number;
  last30mContribution: number;
  radrRead: string;
  judgment: IntelJudgment;
};

export type DeliveryChannelDetail = {
  id: string;
  label: string;
  ordersTonight: number;
  pending: number;
  gross: number;
  feesEstimated: number;
  avgPrepMin: number;
  vsComparablePct: number;
};

export type DeliveryStreamReport = {
  channels: DeliveryChannelDetail[];
  ordersReceived: number;
  ordersFulfilled: number;
  ordersPending: number;
  avgBasket: number;
  avgPrepMin: number;
  lateOrders: number;
  cancellations: number;
  feesEuro: number;
  contributionEstimate: number;
  revenueUpliftEuro: number;
  contributionDragEuro: number;
  kitchenLoadDeltaPct: number;
  ordersVsComparablePct: number;
  freshnessSeconds: number;
  freshnessLabel: string;
  radrRead: string;
  judgment: IntelJudgment;
};

export type StockWatchItem = {
  id: string;
  label: string;
  remaining: number;
  unit: string;
  burnPerHour: number;
  expectedDemand: number;
  projectedStockoutAt: string | null;
  state: "ENOUGH" | "RUNNING_LOW" | "PROJECTED_STOCKOUT" | "OUT" | "UNKNOWN";
  revenueAtRisk: number;
  evidence: EvidenceClass;
  affectedDishes: string[];
  availableEquivalentDishes: number;
  expectedDishDemand: number;
  relatedDecisionId: string | null;
  radrRead: string;
};

export type StockWatchReport = {
  items: StockWatchItem[];
  judgment: IntelJudgment;
  relatedDecisionId: string | null;
};

export type ResourceSignal = {
  id: string;
  resourceType: string;
  vertical: "restaurant" | "hotel" | "apartment";
  currentQuantity: number;
  unit: string;
  consumptionRate: number;
  forecastDemand: number;
  projectedRemaining: number;
  projectedConstraintAt: string | null;
  economicImpact: number;
  evidenceState: EvidenceClass;
  label: string;
};

export type SinceChangedItem = {
  id: string;
  label: string;
  delta: string;
};

export type SinceChangedReport = {
  sinceLabel: string;
  items: SinceChangedItem[];
};

export type OrderRateBucket = {
  label: string;
  actual: number | null;
  expected: number;
  forecast: number | null;
};

export type OrderRateReport = {
  buckets: OrderRateBucket[];
  radrRead: string;
};

export type LiveSourceFreshness = {
  id: string;
  label: string;
  seconds: number;
  state: "LIVE" | "CURRENT" | "DELAYED" | "STALE";
};

export type CancellationFlow = {
  cancelled: number;
  coversReleased: number;
  waitlistFilled: number;
  directRebook: number;
  unrecovered: number;
  revenueAffected: number;
  recovered: number;
  exposed: number;
  radrRead: string;
  judgment: IntelJudgment;
  relatedDecisionId: string | null;
};

export type CoverFlowStage = {
  id: string;
  label: string;
  count: number;
  branch?: boolean;
};

function finalizeMoney(
  sources: MoneySource[],
  reductions: Omit<MoneyFlowStep, "kind">[],
  radrRead: string,
  judgment: IntelJudgment,
): MoneyFlowReport {
  const gross = sources.reduce((a, s) => a + s.amount, 0);
  const redSteps: MoneyFlowStep[] = reductions.map((r) => ({
    ...r,
    kind: "reduction" as const,
  }));
  const redSum = redSteps.reduce((a, s) => a + s.amount, 0);
  const contrib = gross + redSum;
  const steps: MoneyFlowStep[] = [
    {
      id: "gross",
      label: "Gross revenue",
      amount: gross,
      kind: "inflow",
      evidence: "OBSERVED",
    },
    ...redSteps,
    {
      id: "contrib",
      label: "Operating contribution pace",
      amount: contrib,
      kind: "result",
      evidence: "MODELED",
    },
  ];
  return {
    sources,
    steps,
    contributionPace: contrib,
    grossRevenue: gross,
    radrRead,
    judgment,
  };
}

/** Berlin dinner — sources sum to €18,420 · contribution €7,190. */
export function getRestaurantMoneyFlow(): MoneyFlowReport {
  return finalizeMoney(
    [
      { id: "dine_in", label: "Dine-in", amount: 12_840, evidence: "OBSERVED" },
      { id: "bar", label: "Bar", amount: 1_120, evidence: "OBSERVED" },
      { id: "direct", label: "Direct digital", amount: 1_620, evidence: "OBSERVED" },
      { id: "uber", label: "Uber Eats", amount: 1_940, evidence: "OBSERVED" },
      { id: "deliveroo", label: "Deliveroo", amount: 900, evidence: "OBSERVED" },
    ],
    [
      { id: "discounts", label: "Discounts / comps", amount: -410, evidence: "OBSERVED" },
      { id: "refunds", label: "Refunds", amount: -120, evidence: "OBSERVED" },
      { id: "fees", label: "Channel fees", amount: -610, evidence: "ACCRUED" },
      { id: "cogs", label: "Ingredient consumption", amount: -4_910, evidence: "MODELED" },
      { id: "labor", label: "Labor accrued", amount: -5_180, evidence: "ACCRUED" },
    ],
    "Contribution pace is modeled from observed sales less accrued fees, modeled COGS, and labor accrual — not settled P&L.",
    "WATCHING",
  );
}

export function getRestaurantOrderFlow(): OrderFlowReport {
  const channels: OrderChannelRow[] = [
    {
      id: "dine_in",
      label: "Dine-in",
      orders: 124,
      revenue: 12_840,
      sharePct: 69.7,
      vsComparableOrders: 8,
      feeDragEuro: null,
      evidence: "OBSERVED",
    },
    {
      id: "direct",
      label: "Direct digital",
      orders: 18,
      revenue: 1_620,
      sharePct: 8.8,
      vsComparableOrders: 3,
      feeDragEuro: 42,
      evidence: "OBSERVED",
      pending: 2,
      avgPrepMin: 14,
    },
    {
      id: "uber",
      label: "Uber Eats",
      orders: 26,
      revenue: 1_940,
      sharePct: 10.5,
      vsComparableOrders: 7,
      feeDragEuro: 420,
      evidence: "OBSERVED",
      pending: 6,
      avgPrepMin: 18,
    },
    {
      id: "deliveroo",
      label: "Deliveroo",
      orders: 14,
      revenue: 900,
      sharePct: 4.9,
      vsComparableOrders: 4,
      feeDragEuro: 190,
      evidence: "OBSERVED",
      pending: 2,
      avgPrepMin: 16,
    },
    {
      id: "other",
      label: "Other",
      orders: 3,
      revenue: 1_120,
      sharePct: 6.1,
      vsComparableOrders: 0,
      feeDragEuro: null,
      evidence: "OBSERVED",
    },
  ];
  // Align other to keep total revenue = 18420: 12840+1620+1940+900+1120 = 18420
  return {
    channels,
    totalOrders: channels.reduce((a, c) => a + c.orders, 0),
    last30mOrders: 48,
    last30mDeltaPct: 14,
    last30mGross: 3_920,
    last30mFees: 420,
    last30mContribution: 1_480,
    radrRead:
      "Delivery share is lifting gross while accrued fee drag offsets contribution — WATCHING.",
    judgment: "WATCHING",
  };
}

export function getDeliveryStream(): DeliveryStreamReport {
  const channels: DeliveryChannelDetail[] = [
    {
      id: "uber",
      label: "Uber Eats",
      ordersTonight: 26,
      pending: 6,
      gross: 1_940,
      feesEstimated: 440,
      avgPrepMin: 18,
      vsComparablePct: 31,
    },
    {
      id: "deliveroo",
      label: "Deliveroo",
      ordersTonight: 14,
      pending: 2,
      gross: 900,
      feesEstimated: 170,
      avgPrepMin: 16,
      vsComparablePct: 22,
    },
  ];
  const pending = channels.reduce((a, c) => a + c.pending, 0);
  const fees = channels.reduce((a, c) => a + c.feesEstimated, 0);
  const received = channels.reduce((a, c) => a + c.ordersTonight, 0);
  return {
    channels,
    ordersReceived: received,
    ordersFulfilled: received - pending,
    ordersPending: pending,
    avgBasket: 71,
    avgPrepMin: 17,
    lateOrders: 2,
    cancellations: 1,
    feesEuro: fees,
    contributionEstimate: -180,
    revenueUpliftEuro: 920,
    contributionDragEuro: -180,
    kitchenLoadDeltaPct: 8,
    ordersVsComparablePct: 31,
    freshnessSeconds: 180,
    freshnessLabel: "Delivery · 3m freshness",
    radrRead:
      "Delivery is adding revenue but reducing expected contribution by €180 and adding 8pp to peak station load. WATCHING.",
    judgment: "WATCHING",
  };
}

export function getStockWatch(): StockWatchReport {
  const tuna: StockWatchItem = {
    id: "tuna",
    label: "Tuna",
    remaining: 24,
    unit: "portions",
    burnPerHour: 12,
    expectedDemand: 31,
    projectedStockoutAt: "21:18",
    state: "PROJECTED_STOCKOUT",
    revenueAtRisk: 720,
    evidence: "MODELED",
    affectedDishes: ["Tuna Tataki", "Spicy Tuna Roll", "Tuna Crudo"],
    availableEquivalentDishes: 24,
    expectedDishDemand: 38,
    relatedDecisionId: DECISION_IDS.menuPeak,
    radrRead:
      "MODELED stock · 24 portions left · burn 12/h · expected demand 31 · projected stockout 21:18 · €720 revenue at risk across Tataki / Roll / Crudo.",
  };
  return {
    items: [tuna],
    judgment: "DECISION_FORMED",
    relatedDecisionId: DECISION_IDS.menuPeak,
  };
}

export function getResourceSignals(
  vertical: "restaurant" | "hotel" | "apartment" = "restaurant",
): ResourceSignal[] {
  if (vertical === "hotel") {
    return [
      {
        id: "deluxe_king",
        resourceType: "room_type",
        vertical: "hotel",
        currentQuantity: 3,
        unit: "sellable",
        consumptionRate: 4,
        forecastDemand: 4,
        projectedRemaining: -1,
        projectedConstraintAt: "16:00",
        economicImpact: 992,
        evidenceState: "OBSERVED",
        label: "Deluxe King",
      },
    ];
  }
  if (vertical === "apartment") {
    return [
      {
        id: "clean_units",
        resourceType: "clean_units",
        vertical: "apartment",
        currentQuantity: 4,
        unit: "units",
        consumptionRate: 9,
        forecastDemand: 9,
        projectedRemaining: -2,
        projectedConstraintAt: "14:30",
        economicImpact: 328,
        evidenceState: "OBSERVED",
        label: "Clean units",
      },
    ];
  }
  return [
    {
      id: "tuna",
      resourceType: "ingredient",
      vertical: "restaurant",
      currentQuantity: 24,
      unit: "portions",
      consumptionRate: 12,
      forecastDemand: 31,
      projectedRemaining: -7,
      projectedConstraintAt: "21:18",
      economicImpact: 720,
      evidenceState: "MODELED",
      label: "Tuna",
    },
    {
      id: "kitchen",
      resourceType: "station_capacity",
      vertical: "restaurant",
      currentQuantity: 89,
      unit: "% pressure",
      consumptionRate: 5,
      forecastDemand: 94,
      projectedRemaining: 6,
      projectedConstraintAt: "20:18",
      economicImpact: 620,
      evidenceState: "MODELED",
      label: "Kitchen pressure",
    },
  ];
}

export function getSinceChanged(): SinceChangedReport {
  return {
    sinceLabel: "Since 19:30",
    items: [
      { id: "pace", label: "Revenue pace", delta: "+1.1pp" },
      { id: "uber", label: "Uber Eats", delta: "+7 orders" },
      { id: "cancel", label: "Cancellations", delta: "+3" },
      { id: "tuna", label: "Tuna", delta: "−12 portions" },
      { id: "walk", label: "Walk-in forecast", delta: "+6" },
      { id: "kit", label: "Kitchen", delta: "+4pp" },
      { id: "dec", label: "D-1911", delta: "formed" },
    ],
  };
}

export function getOrderRate(): OrderRateReport {
  return {
    buckets: [
      { label: "19:00", actual: 22, expected: 20, forecast: null },
      { label: "19:15", actual: 28, expected: 24, forecast: null },
      { label: "19:30", actual: 34, expected: 30, forecast: null },
      { label: "19:45", actual: 31, expected: 29, forecast: null },
      { label: "20:00", actual: null, expected: 33, forecast: 36 },
      { label: "20:15", actual: null, expected: 30, forecast: 34 },
      { label: "20:30", actual: null, expected: 26, forecast: 28 },
    ],
    radrRead: "Order rate ahead of expected — pressure climbs into the 20:00 window.",
  };
}

export function getLiveSourceFreshness(): LiveSourceFreshness[] {
  return [
    { id: "pos", label: "POS", seconds: 102, state: "LIVE" },
    { id: "reservations", label: "Reservations", seconds: 120, state: "LIVE" },
    { id: "delivery", label: "Delivery", seconds: 180, state: "CURRENT" },
    { id: "inventory", label: "Inventory", seconds: 420, state: "DELAYED" },
    { id: "accounting", label: "Accounting", seconds: 21_600, state: "STALE" },
  ];
}

export function getCancellationFlow(): CancellationFlow {
  return {
    cancelled: 6,
    coversReleased: 18,
    waitlistFilled: 10,
    directRebook: 4,
    unrecovered: 4,
    revenueAffected: 1_120,
    recovered: 760,
    exposed: 360,
    radrRead: "€360 still exposed — recovery Decision open on waitlist path.",
    judgment: "DECISION_FORMED",
    relatedDecisionId: "dec_table_recover_berlin",
  };
}

export function getCoverFlow(): CoverFlowStage[] {
  return [
    { id: "booked", label: "Booked", count: 252 },
    { id: "arrived", label: "Arrived", count: 228 },
    { id: "seated", label: "Seated", count: 220 },
    { id: "served", label: "Served", count: 214 },
    { id: "cancelled", label: "Cancelled", count: 6, branch: true },
    { id: "noshow", label: "No-show", count: 1, branch: true },
    { id: "walkin", label: "Walk-in", count: 14, branch: true },
  ];
}

/** Group CFO — sources sum to €62,400. */
export function getGroupMoneyFlow(): MoneyFlowReport {
  return finalizeMoney(
    [
      { id: "restaurants", label: "Restaurants", amount: 38_200, evidence: "OBSERVED" },
      { id: "rooms", label: "Hotel rooms", amount: 12_400, evidence: "OBSERVED" },
      { id: "apartments", label: "Serviced apartments", amount: 6_800, evidence: "OBSERVED" },
      { id: "delivery", label: "Delivery / direct", amount: 3_100, evidence: "OBSERVED" },
      { id: "other", label: "Other", amount: 1_900, evidence: "OBSERVED" },
    ],
    [
      { id: "discounts", label: "Discounts / comps", amount: -1_180, evidence: "OBSERVED" },
      { id: "refunds", label: "Refunds", amount: -420, evidence: "OBSERVED" },
      { id: "fees", label: "Channel / OTA fees", amount: -2_460, evidence: "ACCRUED" },
      { id: "cogs", label: "COGS estimate", amount: -16_800, evidence: "MODELED" },
      { id: "labor", label: "Labor accrual", amount: -17_920, evidence: "ACCRUED" },
    ],
    "Group contribution pace is modeled. Settlement exceptions and COGS remain the material watch.",
    "WATCHING",
  );
}

export type HotelMoneyFlowReport = MoneyFlowReport & {
  roomRevenue: number;
  otaCommission: number;
};

export function getHotelMoneyFlow(): HotelMoneyFlowReport {
  const base = finalizeMoney(
    [
      { id: "rooms", label: "Rooms", amount: 18_640, evidence: "OBSERVED" },
      { id: "fb", label: "F&B", amount: 1_240, evidence: "OBSERVED" },
      { id: "upsell", label: "Upsells / packages", amount: 1_840, evidence: "OBSERVED" },
      { id: "spa", label: "Spa", amount: 620, evidence: "OBSERVED" },
    ],
    [
      { id: "cancel", label: "Cancellations / refunds", amount: -380, evidence: "OBSERVED" },
      { id: "ota", label: "OTA commissions accrued", amount: -1_120, evidence: "ACCRUED" },
      { id: "fees", label: "Payment fees", amount: -210, evidence: "ACCRUED" },
    ],
    "Rooms revenue soft vs expected-now. OTA commission accrual is the main estimated drag.",
    "WATCHING",
  );
  return {
    ...base,
    roomRevenue: 18_640,
    otaCommission: 1_120,
  };
}

export type HotelRoomInventory = {
  roomType: string;
  sellableRemaining: number;
  arrivalsRemaining: number;
  notReady: number;
  pressure: boolean;
};

export function getHotelRoomInventory(): HotelRoomInventory[] {
  return [
    {
      roomType: "Deluxe King",
      sellableRemaining: 3,
      arrivalsRemaining: 4,
      notReady: 1,
      pressure: true,
    },
    {
      roomType: "Classic Twin",
      sellableRemaining: 6,
      arrivalsRemaining: 5,
      notReady: 2,
      pressure: false,
    },
    {
      roomType: "Suite",
      sellableRemaining: 1,
      arrivalsRemaining: 2,
      notReady: 1,
      pressure: true,
    },
  ];
}

export type HotelTopSeller = {
  id: string;
  label: string;
  revenue: number;
};

export function getHotelTopSellers(): HotelTopSeller[] {
  return [
    { id: "deluxe", label: "Deluxe King", revenue: 8_400 },
    { id: "breakfast", label: "Breakfast package", revenue: 2_100 },
    { id: "late", label: "Late checkout", revenue: 840 },
    { id: "spa", label: "Spa upgrade", revenue: 620 },
  ];
}

export function getApartmentMoneyFlow(): MoneyFlowReport {
  return finalizeMoney(
    [
      { id: "booking", label: "Booking revenue", amount: 6_820, evidence: "OBSERVED" },
      { id: "upsell", label: "Upsells", amount: 280, evidence: "OBSERVED" },
    ],
    [
      { id: "refunds", label: "Refunds", amount: -140, evidence: "OBSERVED" },
      { id: "ota", label: "OTA fees", amount: -380, evidence: "ACCRUED" },
      { id: "cleaning", label: "Cleaning cost", amount: -920, evidence: "ACCRUED" },
      { id: "maint", label: "Maintenance estimate", amount: -180, evidence: "MODELED" },
    ],
    "Revenue within range. Cleaning SLA and gap nights drive operating Decisions — not pricing.",
    "DECISION_FORMED",
  );
}

export type LiveScenarioId =
  | "normal_night"
  | "delivery_surge"
  | "tuna_stockout"
  | "event_surge"
  | "rain_terrace"
  | "cancellation_spike"
  | "labor_shortage"
  | "high_refunds"
  | "hotel_arrival_surge"
  | "hotel_readiness"
  | "apartment_cleaning";

export function liveScenarioIds(): LiveScenarioId[] {
  return [
    "normal_night",
    "delivery_surge",
    "tuna_stockout",
    "event_surge",
    "rain_terrace",
    "cancellation_spike",
    "labor_shortage",
    "high_refunds",
    "hotel_arrival_surge",
    "hotel_readiness",
    "apartment_cleaning",
  ];
}


/** Group day cumulative revenue waypoints for CFO Live hero. */
export function getGroupDaySeries(): {
  label: string;
  actual: number;
  expected: number;
  target: number;
  observed: boolean;
}[] {
  return [
    { label: "OPEN", actual: 0, expected: 0, target: 0, observed: true },
    { label: "12:00", actual: 18_200, expected: 17_600, target: 17_400, observed: true },
    { label: "16:00", actual: 41_100, expected: 39_800, target: 39_200, observed: true },
    { label: "NOW", actual: 62_400, expected: 60_800, target: 59_900, observed: true },
    { label: "+1H", actual: 0, expected: 71_200, target: 69_800, observed: false },
    { label: "+2H", actual: 0, expected: 79_400, target: 77_600, observed: false },
    { label: "CLOSE", actual: 0, expected: 91_200, target: 89_600, observed: false },
  ];
}

/** Canal House rooms revenue waypoints. */
export function getHotelDaySeries(): {
  label: string;
  actual: number;
  expected: number;
  target: number;
  observed: boolean;
}[] {
  return [
    { label: "OPEN", actual: 0, expected: 0, target: 0, observed: true },
    { label: "10:00", actual: 6_200, expected: 6_800, target: 6_900, observed: true },
    { label: "12:00", actual: 11_400, expected: 12_100, target: 12_400, observed: true },
    { label: "NOW", actual: 18_640, expected: 19_420, target: 19_800, observed: true },
    { label: "+2H", actual: 0, expected: 22_800, target: 23_400, observed: false },
    { label: "CLOSE", actual: 0, expected: 28_900, target: 29_800, observed: false },
  ];
}

/** Chiado apartments revenue waypoints. */
export function getApartmentDaySeries(): {
  label: string;
  actual: number;
  expected: number;
  target: number;
  observed: boolean;
}[] {
  return [
    { label: "OPEN", actual: 0, expected: 0, target: 0, observed: true },
    { label: "09:00", actual: 2_100, expected: 2_050, target: 2_000, observed: true },
    { label: "NOW", actual: 6_820, expected: 6_740, target: 6_600, observed: true },
    { label: "+2H", actual: 0, expected: 8_100, target: 7_900, observed: false },
    { label: "CLOSE", actual: 0, expected: 11_400, target: 11_200, observed: false },
  ];
}
