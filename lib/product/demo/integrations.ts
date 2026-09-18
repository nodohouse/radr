import type { Area } from "../types";

export type ConnectorStatus =
  | "CONNECTED"
  | "DEMO"
  | "SIMULATED"
  | "AVAILABLE"
  | "COMING_SOON";

export type Integration = {
  id: string;
  name: string;
  category: string;
  status: ConnectorStatus;
  lastSync: string;
  territories: Area[];
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "pos",
    name: "POS",
    category: "Sales",
    status: "CONNECTED",
    lastSync: "2 min ago",
    territories: ["sell", "labor"],
  },
  {
    id: "workforce",
    name: "Workforce",
    category: "Labor",
    status: "CONNECTED",
    lastSync: "8 min ago",
    territories: ["labor"],
  },
  {
    id: "procurement",
    name: "Procurement",
    category: "Buy",
    status: "CONNECTED",
    lastSync: "14 min ago",
    territories: ["buy"],
  },
  {
    id: "accounting",
    name: "Accounting",
    category: "Finance",
    status: "CONNECTED",
    lastSync: "32 min ago",
    territories: ["buy", "recover"],
  },
  {
    id: "inventory",
    name: "Inventory",
    category: "Buy",
    status: "SIMULATED",
    lastSync: "1 hr ago",
    territories: ["buy"],
  },
  {
    id: "delivery",
    name: "Delivery",
    category: "Sell",
    status: "DEMO",
    lastSync: "18 min ago",
    territories: ["sell", "recover"],
  },
  {
    id: "pms",
    name: "PMS",
    category: "Demand",
    status: "AVAILABLE",
    lastSync: "-",
    territories: ["sell", "labor"],
  },
  {
    id: "banking",
    name: "Banking",
    category: "Cash",
    status: "COMING_SOON",
    lastSync: "-",
    territories: ["recover"],
  },
];

export const COVERAGE: {
  area: Area;
  pct: number;
  missing: string;
}[] = [
  { area: "buy", pct: 94, missing: "2 supplier contracts pending upload" },
  { area: "labor", pct: 98, missing: "Agency timesheets for 1 location" },
  { area: "sell", pct: 100, missing: "Full POS coverage" },
  {
    area: "recover",
    pct: 87,
    missing: "Supplier rebate agreements for 3 locations",
  },
];

export const INGESTION = [
  { label: "POS transactions", value: "12,840" },
  { label: "Invoices", value: "1,284" },
  { label: "Schedules", value: "342" },
  { label: "Supplier credits", value: "68" },
  { label: "Contracts", value: "18" },
] as const;

export const VALUE_LEDGER = [
  {
    amount: 4280,
    kind: "Supplier credit",
    location: "Berlin Mitte",
    signalId: "sig_002",
    verified: "Bank settlement matched",
    date: "17 Aug 2026",
  },
  {
    amount: 18620,
    kind: "Cost avoided",
    location: "Amsterdam Central",
    signalId: "sig_001",
    verified: "Contract price restored · 14 invoices",
    date: "12 Aug 2026",
  },
  {
    amount: 14200,
    kind: "Margin captured",
    location: "Tokyo Shibuya",
    signalId: "sig_004",
    verified: "Menu price adjusted · contribution restored",
    date: "9 Aug 2026",
  },
  {
    amount: 8400,
    kind: "Loss prevented",
    location: "New York Flatiron",
    signalId: "sig_003",
    verified: "Labor control fired · hours cut before shift",
    date: "8 Aug 2026",
  },
] as const;
