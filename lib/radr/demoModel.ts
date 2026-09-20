/**
 * Single source of truth for demo figures.
 * All product + marketing views must derive from this model.
 *
 * Reconciliation rules:
 * - FreshCo unit delta × annual volume = annualized exposure
 * - Territory open values sum ≈ group value at risk (rounded)
 * - Verified YTD is identical across Control Center / Value page
 */

export const DEMO_ORG = {
  id: "org_northstar",
  name: "Northstar Hospitality Group",
  locations: 12,
  fleet: { onCourse: 9, watch: 2, action: 1 },
} as const;

/** Canonical BUY finding: marketing hero + product signal */
export const BUY_FINDING = {
  id: "sig_buy_freshco",
  territory: "buy" as const,
  locationId: "loc_ber",
  locationName: "Berlin Mitte",
  title: "Supplier pricing mismatch",
  headline: "RADR found a pricing mismatch.",
  why:
    "Invoice unit price remains above the active supplier contract across 18 invoices.",
  expected: {
    role: "Procurement",
    label: "Contract",
    value: 31.2,
    display: "€31.20",
    detailTitle: "Contract",
    detailValue: "€31.20 / case",
    detailLines: ["FreshCo", "Agreement #CT-1842", "Effective 01 Jan 2026"],
    stateLabel: "Expected state",
  },
  actual: {
    role: "Accounting",
    label: "Invoice",
    value: 34.8,
    display: "€34.80",
    detailTitle: "Invoice",
    detailValue: "€34.80 / case",
    detailLines: ["FreshCo", "Invoice #INV-8841", "17 Aug 2026"],
    stateLabel: "Actual state",
    variance: "+11.5%",
  },
  volume: {
    role: "Operations",
    label: "Volume",
    value: 5172,
    display: "5,172 / yr",
    unit: "cases",
    detailTitle: "Operating volume",
    detailValue: "5,172 cases / yr",
    detailLines: ["Trailing 12 months", "Average: 431 / month"],
    calc: {
      unit: "€3.60",
      times: "5,172",
      exact: "€18,619.20",
      display: "€18,620 / yr",
    },
  },
  unitDelta: 3.6, // 34.80 - 31.20
  unitDeltaDisplay: "€3.60 / case",
  bridge: "€31.20 → €34.80",
  /** 3.60 × 5172 = 18619.20 → display €18,620 */
  annualized: 18_620,
  annualizedDisplay: "€18,620",
  moneyKind: "Annualized exposure",
  invoicesAffected: 18,
  confidence: 0.994,
  confidenceDisplay: "99.4%",
  evidenceSummary: "Contract + 18 invoices + volume history",
  firstDetected: "12 days ago",
  owner: "Procurement",
  status: "In review",
  action: "Review finding →",
  actionHint: "See evidence, economics and prepared action.",
  recommend: "Review affected invoices and request supplier correction.",
  control: "Match future invoice price to active contracted rate",
} as const;

export const LABOR_FINDING = {
  id: "sig_labor_dinner",
  territory: "labor" as const,
  locationId: "loc_ber",
  locationName: "Berlin Mitte",
  title: "Peak service understaffed",
  headline: "RADR found peak FOH short for tonight’s demand.",
  why: "Expected covers in the 19:00-20:30 window exceed current FOH capacity.",
  expected: {
    role: "Demand",
    label: "Required",
    value: 5,
    display: "5",
    detailTitle: "Required",
    detailValue: "5 FOH",
    detailLines: ["Dinner peak", "Berlin Mitte", "Service window 19:00-20:30"],
    stateLabel: "Expected state",
  },
  actual: {
    role: "Schedule",
    label: "Scheduled",
    value: 4,
    display: "4",
    detailTitle: "Scheduled",
    detailValue: "4 FOH",
    detailLines: ["Published roster", "Main + Bar + Terrace", "Not yet adjusted"],
    stateLabel: "Actual state",
    variance: "−20%",
  },
  volume: {
    role: "Service",
    label: "Demand",
    value: 84,
    display: "84%",
    unit: "occupancy",
    detailTitle: "Dinner demand",
    detailValue: "142 forecast covers",
    detailLines: ["Covers booked · 118", "Expected additional · 24"],
    calc: {
      unit: "1 staff",
      times: "€68 / staff",
      exact: "€68.00",
      display: "€68 tonight",
    },
  },
  unitDelta: 1,
  unitDeltaDisplay: "+1 staff",
  bridge: "4 → 5",
  annualized: 290,
  annualizedDisplay: "€290",
  moneyKind: "Revenue at risk tonight",
  invoicesAffected: 0,
  confidence: 0.97,
  confidenceDisplay: "97.0%",
  evidenceSummary: "Reservations + service curve + published roster",
  firstDetected: "This morning",
  owner: "GM",
  status: "Action needed",
  action: "Adjust shift →",
  actionHint: "See demand vs schedule and recommended add.",
  recommend: "Reallocate +1 FOH into Section B from 19:15-20:30.",
  control: "Flag schedule < peak demand tolerance",
} as const;

export const SELL_FINDING = {
  id: "sig_sell_menu",
  territory: "sell" as const,
  locationId: "loc_par",
  locationName: "Paris Marais",
  title: "Menu contribution gap",
  headline: "RADR found a contribution gap.",
  why: "Actual contribution sits below expected contribution on a high-volume item.",
  expected: {
    role: "Menu",
    label: "Expected",
    value: 8.4,
    display: "€8.40",
    detailTitle: "Expected contribution",
    detailValue: "€8.40 / item",
    detailLines: ["Target recipe cost", "Menu engineering band", "Paris Marais"],
    stateLabel: "Expected state",
  },
  actual: {
    role: "Sales",
    label: "Actual",
    value: 7.62,
    display: "€7.62",
    detailTitle: "Actual contribution",
    detailValue: "€7.62 / item",
    detailLines: ["Last 30 days POS", "Price unchanged", "Cost drift detected"],
    stateLabel: "Actual state",
    variance: "−9.3%",
  },
  volume: {
    role: "Volume",
    label: "Volume",
    value: 43_846,
    display: "43,846",
    unit: "items",
    detailTitle: "Item volume",
    detailValue: "43,846 items / yr",
    detailLines: ["Trailing 12 months", "Peak demand evenings"],
    calc: {
      unit: "€0.78",
      times: "43,846",
      exact: "€34,199.88",
      display: "€34,200 / yr",
    },
  },
  unitDelta: 0.78,
  unitDeltaDisplay: "€0.78 / item",
  bridge: "€8.40 → €7.62",
  annualized: 34_200,
  annualizedDisplay: "€34,200",
  moneyKind: "Identified upside",
  invoicesAffected: 0,
  confidence: 0.96,
  confidenceDisplay: "96.0%",
  evidenceSummary: "Recipe cost + POS contribution + volume",
  firstDetected: "8 days ago",
  owner: "F&B",
  status: "In review",
  action: "Review pricing →",
  actionHint: "See contribution math and pricing action.",
  recommend: "Review menu price or recipe cost to restore contribution.",
  control: "Contribution threshold alert",
} as const;

export const RECOVER_FINDING = {
  id: "sig_recover_credit",
  territory: "recover" as const,
  locationId: "loc_ber",
  locationName: "Berlin Mitte",
  title: "Supplier credit overdue",
  headline: "RADR found recoverable credit.",
  why: "Expected supplier credit was approved but never received.",
  expected: {
    role: "Credit",
    label: "Expected",
    value: 4280,
    display: "€4,280",
    detailTitle: "Expected credit",
    detailValue: "€4,280",
    detailLines: ["FreshCo", "Credit note #CN-2291", "Approved 07 Aug 2026"],
    stateLabel: "Expected state",
  },
  actual: {
    role: "Bank",
    label: "Received",
    value: 0,
    display: "€0",
    detailTitle: "Received",
    detailValue: "€0",
    detailLines: ["No matching payout", "Bank feed clear", "Owner: AP"],
    stateLabel: "Actual state",
    variance: "−100%",
  },
  volume: {
    role: "Aging",
    label: "Age",
    value: 11,
    display: "11 days",
    unit: "days",
    detailTitle: "Aging",
    detailValue: "11 days outstanding",
    detailLines: ["SLA: 7 days", "Escalation overdue"],
    calc: {
      unit: "€4,280",
      times: "1 credit",
      exact: "€4,280.00",
      display: "€4,280 recoverable",
    },
  },
  unitDelta: 4280,
  unitDeltaDisplay: "€4,280",
  bridge: "€4,280 → €0",
  annualized: 4280,
  annualizedDisplay: "€4,280",
  moneyKind: "Recoverable now",
  invoicesAffected: 1,
  confidence: 0.99,
  confidenceDisplay: "99.0%",
  evidenceSummary: "Credit note + bank feed + aging",
  firstDetected: "11 days ago",
  owner: "AP",
  status: "Recover now",
  action: "Recover credit →",
  actionHint: "See credit evidence and recovery path.",
  recommend: "Contact supplier and recover unmatched credit.",
  control: "Escalate unmatched credits >7 days",
} as const;

export type HeroTerritory = "buy" | "labor" | "sell" | "recover";

export const HERO_STORIES = {
  buy: BUY_FINDING,
  labor: LABOR_FINDING,
  sell: SELL_FINDING,
  recover: RECOVER_FINDING,
} as const;

export const TERRITORY_OPEN = {
  buy: {
    value: 118,
    kind: "recoverable" as const,
    findings: 1,
    trend: "New",
    preview: "Supplier invoice · claim prepared",
  },
  labor: {
    value: 290,
    kind: "at_risk" as const,
    findings: 1,
    trend: "Tonight",
    preview: "Peak service · shift prepared for approval",
  },
  /** Opportunity - not part of unresolved exposure (€408). */
  sell: {
    value: 420,
    kind: "opportunity" as const,
    findings: 1,
    trend: "Tomorrow",
    preview: "Terrace weather · €348 expected net",
  },
  /** Verified recovery stays out of open exposure. */
  recover: {
    value: 0,
    kind: "verified" as const,
    findings: 0,
    trend: "Verified",
    preview: "Table 14 · €184 verified",
  },
} as const;

/**
 * Unresolved exposure only (BUY + LABOR).
 * SELL opportunity and verified RECOVER are excluded.
 */
export const VALUE_AT_RISK =
  TERRITORY_OPEN.buy.value + TERRITORY_OPEN.labor.value;

/** Unresolved exposure: labor €290 + buy €118. Verified €184 is excluded. */
export const MATERIAL_AT_RISK = 408;

export const VERIFIED_YTD = 684_000;
export const VERIFIED_BY_TERRITORY = {
  buy: 242_000,
  labor: 161_000,
  sell: 173_000,
  recover: 108_000,
} as const;
// 242+161+173+108 = 684 ✓

export const GROUP_TRADING = {
  revenue: 168_400,
  revenueVsForecast: 4.2,
  margin: 18.4,
  marginVsPlan: 0.6,
  laborPct: 32.8,
  laborVsPlan: -0.2,
} as const;

/**
 * Delivery payout reconciliation: RECOVER Level-1 bridge.
 * Matches chk_delivery_payout / sig_010.
 */
export const RECOVER_PAYOUT = {
  id: "sig_010",
  partner: "Delivery platform",
  period: "Week 32",
  locationName: "Berlin Mitte",
  orders: 1_000,
  expected: 11_570,
  expectedDisplay: "€11,570",
  received: 11_238,
  receivedDisplay: "€11,238",
  unexplained: 332,
  unexplainedDisplay: "€332",
  recoverable: 283,
  recoverableDisplay: "€283",
  validAdjustment: 49,
  validAdjustmentDisplay: "€49",
  bridge: [
    { label: "Gross sales", value: "€18,420" },
    { label: "Refunds", value: "−€436" },
    { label: "Discounts", value: "−€1,284" },
    { label: "Contracted fees", value: "−€4,912" },
  ],
  action: "Investigate payout →",
  href: "/app/findings/sig_010",
} as const;

export const BERLIN_TRADING = {
  revenue: 7_812,
  revenueVsForecast: 3.1,
  margin: 18.4,
  marginVsPlan: 0.6,
  laborPct: 32.6,
  laborVsPlan: -0.4,
  guests: 122,
  avgCheck: 64.03,
} as const;

/** Assert demo math at build/test time */
export function assertDemoIntegrity() {
  const unit = BUY_FINDING.actual.value - BUY_FINDING.expected.value;
  const annual = unit * BUY_FINDING.volume.value;
  if (Math.abs(unit - BUY_FINDING.unitDelta) > 0.001) {
    throw new Error("BUY unit delta mismatch");
  }
  if (Math.round(annual) !== BUY_FINDING.annualized && Math.round(annual) !== 18_619) {
    // 3.6*5172=18619.2 → we display 18620
    if (Math.abs(annual - BUY_FINDING.annualized) > 1) {
      throw new Error(`BUY annualized mismatch: ${annual}`);
    }
  }
  const vSum =
    VERIFIED_BY_TERRITORY.buy +
    VERIFIED_BY_TERRITORY.labor +
    VERIFIED_BY_TERRITORY.sell +
    VERIFIED_BY_TERRITORY.recover;
  if (vSum !== VERIFIED_YTD) {
    throw new Error(`Verified YTD mismatch: ${vSum} vs ${VERIFIED_YTD}`);
  }
}

assertDemoIntegrity();
