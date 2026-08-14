/**
 * Architecture + ingestion — status must stay honest.
 * LIVE = exists today. EARLY ACCESS = limited/partial. PLANNED = not shipped.
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
  "Revenue",
  "Files",
] as const;

export const PIPELINE = [
  "Ingest",
  "Normalize",
  "Compare",
  "Detect △",
  "Act",
  "Verify",
] as const;

export const INGEST_CHANNELS: readonly IngestChannel[] = [
  {
    id: "files",
    title: "File ingestion",
    body: "Upload CSV, Excel, PDF, invoices, statements, contracts and schedules.",
    examples: ["CSV", "Excel", "PDF", "Invoice", "Contract"],
    status: "LIVE",
  },
  {
    id: "manual",
    title: "Manual entry",
    body: "Targets, contract terms, rules, expected values and thresholds.",
    examples: ["Contract terms", "Rules", "Thresholds"],
    status: "LIVE",
  },
  {
    id: "native",
    title: "Native integrations",
    body: "Connect directly to systems through APIs.",
    examples: [
      "PMS",
      "POS",
      "Procurement",
      "Workforce",
      "Accounting",
      "Payments",
    ],
    status: "EARLY ACCESS",
  },
  {
    id: "sftp",
    title: "Secure file transfer",
    body: "Scheduled exports into RADR via SFTP.",
    status: "PLANNED",
  },
  {
    id: "email",
    title: "Email ingestion",
    body: "Forward invoices, credit notes, statements and reports to a secure RADR inbox.",
    status: "PLANNED",
  },
  {
    id: "warehouse",
    title: "Database / warehouse",
    body: "Read-only connection to a warehouse, database or BI export.",
    status: "PLANNED",
  },
  {
    id: "webhook",
    title: "Webhook / event",
    body: "Real-time transactional events where supported.",
    status: "PLANNED",
  },
] as const;

export const EXPECTED_SOURCES = [
  "Contract",
  "Historical pattern",
  "Forecast",
  "Budget",
  "Policy",
  "Schedule target",
  "Commercial terms",
  "Benchmark",
  "Prior resolution",
  "User-defined rule",
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
