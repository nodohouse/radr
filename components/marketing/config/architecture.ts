/**
 * Architecture + ingestion: status must stay honest.
 * LIVE = exists today. EARLY ACCESS = limited/partial. PLANNED = not shipped.
 *
 * Provider-level catalog lives in `lib/integrations/registry.ts` (SSOT for /developers).
 * This file remains the marketing channel summary for /product/connections.
 */
export type IngestStatus = "LIVE" | "EARLY ACCESS" | "PLANNED";

export type IngestChannel = {
  id: string;
  title: string;
  body: string;
  examples?: readonly string[];
  status: IngestStatus;
};

export const STACK_SOURCES = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue management",
  "Files",
] as const;

/** Canonical architectural verbs */
export const PIPELINE = [
  "Ingest",
  "Normalize",
  "Understand",
  "Compare",
  "Detect △",
  "Explain",
  "Act",
  "Control",
  "Verify",
] as const;

export const LAYER_FLOW = [
  "Systems",
  "RADR operating model",
  "Decision intelligence",
  "Control",
  "Verified value",
] as const;

export const INGEST_CHANNELS: readonly IngestChannel[] = [
  {
    id: "files",
    title: "Files",
    body: "CSV, Excel, PDF, contracts, invoices, statements and schedules.",
    examples: ["CSV", "Excel", "PDF", "Invoice", "Contract"],
    status: "LIVE",
  },
  {
    id: "manual",
    title: "Manual input",
    body: "Targets, commercial terms, rules, budgets and approved values.",
    examples: ["Terms", "Rules", "Budgets"],
    status: "LIVE",
  },
  {
    id: "native",
    title: "Native integrations",
    body: "APIs into PMS, POS, procurement, workforce, accounting, payments, delivery and revenue-management systems.",
    examples: ["PMS", "POS", "Procurement", "Workforce", "Accounting"],
    status: "EARLY ACCESS",
  },
  {
    id: "sftp",
    title: "Secure exports",
    body: "Scheduled exports / SFTP where supported.",
    status: "PLANNED",
  },
  {
    id: "email",
    title: "Email",
    body: "Forwarded operational documents where supported.",
    status: "PLANNED",
  },
  {
    id: "warehouse",
    title: "Warehouse / database",
    body: "Read-only structured data connections where supported.",
    status: "PLANNED",
  },
] as const;

export const EXPECTED_SOURCES = [
  "Contract terms",
  "Forecast",
  "Budget",
  "Commercial policy",
  "Historical pattern",
  "Staffing target",
  "Expected payout",
  "Approved rate",
  "User-defined rule",
  "Prior resolution",
  "Operational model",
] as const;

export const OPERATING_MODEL_ENTITIES = [
  "Supplier",
  "Item",
  "Location",
  "Date",
  "Employee",
  "Shift",
  "Channel",
  "Invoice",
  "Contract",
  "Rate",
  "Transaction",
  "Credit",
  "Payout",
  "Menu item",
  "Room type",
  "Booking",
  "Revenue",
  "Labor cost",
] as const;

/** Entity-resolution example for normalization */
export const ENTITY_ALIASES = [
  "FreshCo",
  "AVO-H18",
  "Hass Avocado 18ct",
  "Avocado Hass",
  "SKU 4812",
] as const;

export const ENTITY_CANONICAL = {
  item: "Avocado Hass 18ct",
  supplier: "FreshCo",
} as const;

export const VALUE_STATES = [
  { id: "identified", label: "Identified", detail: "Potential impact" },
  { id: "actioned", label: "Actioned", detail: "Dispute / action submitted" },
  { id: "resolved", label: "Resolved", detail: "Correction accepted" },
  { id: "recovered", label: "Recovered", detail: "Credit / value received" },
  { id: "verified", label: "Verified", detail: "Finance confirms value" },
] as const;
