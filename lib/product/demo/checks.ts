/**
 * RADR Checks: continuous financial reconciliations across systems.
 * CHECK = what RADR watches. SIGNAL = a deviation. Not the same thing.
 */

import type { Area } from "../types";

export type CheckStatus = "ACTIVE" | "LEARNING" | "NEEDS_REVIEW" | "PAUSED";

export type RadrCheck = {
  id: string;
  name: string;
  area: Area;
  /** One-line expected = actual */
  rule: string;
  status: CheckStatus;
  lastChecked: string;
  sources: readonly string[];
  expectedLogic: string;
  tolerance: string;
  owner: string;
  firings30d: number;
  identified30d: number;
  verified30d: number;
  protected30d?: number;
  /** Optional worked example (delivery payout) */
  example?: {
    title: string;
    period: string;
    lines: readonly { label: string; value: string; tone?: "muted" | "strong" | "delta" }[];
    expected: string;
    actual: string;
    delta: string;
    whyExpected: readonly string[];
    explained?: readonly { label: string; value: string }[];
    actionable?: string;
    signalId?: string;
  };
};

export const RADR_CHECKS: readonly RadrCheck[] = [
  {
    id: "chk_delivery_payout",
    name: "Delivery payout",
    area: "recover",
    rule: "Expected payout = actual payout",
    status: "NEEDS_REVIEW",
    lastChecked: "2 minutes ago",
    sources: ["Delivery platform", "POS", "Accounting", "Contract"],
    expectedLogic:
      "Gross sales − refunds − discounts − contracted platform fees ± approved adjustments.",
    tolerance: "±€2 or ±0.25%",
    owner: "Finance",
    firings30d: 4,
    identified30d: 4_820,
    verified30d: 3_940,
    example: {
      title: "Platform payout · Week 32",
      period: "Berlin Mitte · 1,000 orders",
      lines: [
        { label: "Gross sales", value: "€18,420" },
        { label: "Refunds", value: "−€436", tone: "muted" },
        { label: "Discounts", value: "−€1,284", tone: "muted" },
        { label: "Fees", value: "−€4,912", tone: "muted" },
        { label: "Expected payout", value: "€11,570", tone: "strong" },
        { label: "Actual payout", value: "€11,238", tone: "strong" },
        { label: "Δ", value: "€332", tone: "delta" },
      ],
      expected: "€11,570",
      actual: "€11,238",
      delta: "€332",
      whyExpected: [
        "Gross sales from POS-matched delivery orders",
        "Minus refunds and discounts in the payout window",
        "Minus contracted platform commission rates",
        "Plus/minus approved settlement adjustments",
      ],
      explained: [
        { label: "Incorrect commission", value: "€199" },
        { label: "Missing reimbursement", value: "€84" },
        { label: "Valid settlement adjustment", value: "€49" },
      ],
      actionable: "€283 recoverable · €49 valid adjustment",
      signalId: "sig_010",
    },
  },
  {
    id: "chk_supplier_pricing",
    name: "Supplier pricing",
    area: "buy",
    rule: "Invoice price = contracted price",
    status: "ACTIVE",
    lastChecked: "8 minutes ago",
    sources: ["Procurement", "Accounting", "Contracts", "Invoices"],
    expectedLogic: "Active contracted unit price for supplier + item.",
    tolerance: "€0.00 (exact match)",
    owner: "Procurement",
    firings30d: 18,
    identified30d: 18_620,
    verified30d: 12_440,
    protected30d: 12_440,
  },
  {
    id: "chk_invoice_qty",
    name: "Invoice quantities",
    area: "buy",
    rule: "Ordered quantity = invoiced quantity",
    status: "ACTIVE",
    lastChecked: "14 minutes ago",
    sources: ["Procurement", "Invoices", "Receiving"],
    expectedLogic: "PO / receiving quantity for the invoice period.",
    tolerance: "0 units",
    owner: "Procurement",
    firings30d: 6,
    identified30d: 3_240,
    verified30d: 2_110,
  },
  {
    id: "chk_duplicate_invoice",
    name: "Duplicate invoices",
    area: "buy",
    rule: "No duplicate invoice identity",
    status: "ACTIVE",
    lastChecked: "22 minutes ago",
    sources: ["Accounting", "Invoices"],
    expectedLogic: "Unique supplier invoice number within fiscal year.",
    tolerance: "None",
    owner: "Finance",
    firings30d: 1,
    identified30d: 1_860,
    verified30d: 1_860,
  },
  {
    id: "chk_labor_demand",
    name: "Scheduled vs required labor",
    area: "labor",
    rule: "Scheduled hours ≤ demand model + tolerance",
    status: "ACTIVE",
    lastChecked: "5 minutes ago",
    sources: ["Workforce", "POS", "Forecast"],
    expectedLogic: "Demand model by daypart × productivity standard.",
    tolerance: "±1 FTE or ±5%",
    owner: "Operations",
    firings30d: 11,
    identified30d: 8_420,
    verified30d: 4_180,
  },
  {
    id: "chk_overtime",
    name: "Overtime",
    area: "labor",
    rule: "Overtime within approved thresholds",
    status: "LEARNING",
    lastChecked: "31 minutes ago",
    sources: ["Workforce", "Payroll"],
    expectedLogic: "Contracted overtime rules per location and role.",
    tolerance: "Location policy",
    owner: "Operations",
    firings30d: 3,
    identified30d: 2_140,
    verified30d: 640,
  },
  {
    id: "chk_menu_contribution",
    name: "Menu contribution",
    area: "sell",
    rule: "Contribution ≥ expected contribution",
    status: "ACTIVE",
    lastChecked: "11 minutes ago",
    sources: ["POS", "Recipe cost", "Menu"],
    expectedLogic: "Recipe cost + target contribution for the menu item.",
    tolerance: "±€0.15 / item",
    owner: "Revenue",
    firings30d: 9,
    identified30d: 34_200,
    verified30d: 6_840,
  },
  {
    id: "chk_delivery_commission",
    name: "Delivery commissions",
    area: "sell",
    rule: "Platform fee = contracted rate",
    status: "ACTIVE",
    lastChecked: "2 minutes ago",
    sources: ["Delivery platform", "Contract", "POS"],
    expectedLogic: "Contracted commission % × eligible sales.",
    tolerance: "±0.25%",
    owner: "Finance",
    firings30d: 5,
    identified30d: 6_840,
    verified30d: 2_210,
  },
  {
    id: "chk_supplier_credit",
    name: "Supplier credits",
    area: "recover",
    rule: "Issued credit = received settlement",
    status: "ACTIVE",
    lastChecked: "6 minutes ago",
    sources: ["Accounting", "Bank", "Supplier statements"],
    expectedLogic: "Open credit notes must settle within aging policy.",
    tolerance: "7 days",
    owner: "Finance",
    firings30d: 7,
    identified30d: 9_140,
    verified30d: 5_280,
  },
  {
    id: "chk_payment_fees",
    name: "Payment fees",
    area: "sell",
    rule: "Card fees = contracted MDR",
    status: "LEARNING",
    lastChecked: "45 minutes ago",
    sources: ["Payments", "Contract", "POS"],
    expectedLogic: "Contracted merchant discount rate × card volume.",
    tolerance: "±0.10%",
    owner: "Finance",
    firings30d: 2,
    identified30d: 1_420,
    verified30d: 0,
  },
  {
    id: "chk_waste",
    name: "Waste / theoretical usage",
    area: "buy",
    rule: "Theoretical usage ≈ actual usage",
    status: "LEARNING",
    lastChecked: "1 hour ago",
    sources: ["Recipe", "POS", "Inventory"],
    expectedLogic: "Recipe × sales volume vs inventory depletion.",
    tolerance: "±3%",
    owner: "Operations",
    firings30d: 4,
    identified30d: 2_680,
    verified30d: 410,
  },
  {
    id: "chk_agency_rates",
    name: "Agency rates",
    area: "labor",
    rule: "Agency rate = contracted rate",
    status: "ACTIVE",
    lastChecked: "18 minutes ago",
    sources: ["Workforce", "Contracts", "Payroll"],
    expectedLogic: "Active agency rate card by role and location.",
    tolerance: "€0.00 / hour",
    owner: "Operations",
    firings30d: 2,
    identified30d: 3_160,
    verified30d: 1_980,
  },
] as const;

export function checkById(id: string) {
  return RADR_CHECKS.find((c) => c.id === id);
}

export function checksByArea(area: Area | "all") {
  if (area === "all") return [...RADR_CHECKS];
  return RADR_CHECKS.filter((c) => c.area === area);
}

export const CHECK_COUNTS = {
  active: RADR_CHECKS.filter((c) => c.status === "ACTIVE").length,
  learning: RADR_CHECKS.filter((c) => c.status === "LEARNING").length,
  needReview: RADR_CHECKS.filter((c) => c.status === "NEEDS_REVIEW").length,
  total: RADR_CHECKS.length,
} as const;

export const TERRITORY_TAGLINE: Record<Area, string> = {
  buy: "What you spend.",
  labor: "How you staff.",
  sell: "How you monetize.",
  recover: "What you're owed.",
};
