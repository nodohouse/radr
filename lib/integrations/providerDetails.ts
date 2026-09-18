/**
 * Derived catalog helpers. Keep prose/scannable metadata out of duplicate lists.
 * Registry remains the SSOT for status, capabilities, and official docs.
 */

import type {
  AccessType,
  AuthMethod,
  DataEntity,
  IntegrationProvider,
  IntegrationStatus,
  IntegrationType,
} from "./registry";
import { integrationTypeOf } from "./registry";

export const STATUS_LEGEND: {
  status: IntegrationStatus;
  label: string;
  meaning: string;
}[] = [
  {
    status: "available",
    label: "Available",
    meaning: "Integration path works in RADR today.",
  },
  {
    status: "beta",
    label: "Beta",
    meaning: "Working in limited / early access.",
  },
  {
    status: "partner_access",
    label: "Partner access",
    meaning: "Requires provider approval or partnership before RADR can enable it.",
  },
  {
    status: "building",
    label: "Building",
    meaning: "Actively under development.",
  },
  {
    status: "planned",
    label: "Planned",
    meaning: "Not implemented yet.",
  },
  {
    status: "custom",
    label: "Scoped custom implementation",
    meaning: "No generic plug-and-play adapter; scoped to the customer’s systems.",
  },
];

export const AUTH_METHOD_LABEL: Record<AuthMethod, string> = {
  oauth2: "OAuth 2.0",
  api_key: "API key",
  client_credentials: "Client credentials",
  partner_credentials: "Partner credentials",
  sftp: "SFTP",
  none: "None (synthetic / files)",
};

export const REGION_LABEL: Record<string, string> = {
  global: "Global",
  eu: "Europe",
  uk: "UK",
  us: "North America",
  ca: "Canada",
  other: "Other",
};

export const ENTITY_LABEL: Record<DataEntity, string> = {
  locations: "Locations",
  orders: "Orders",
  reservations: "Reservations",
  waitlist: "Waitlist",
  tables: "Tables",
  labor: "Labor",
  invoices: "Invoices",
  payments: "Payments",
  payouts: "Payouts",
  forecasts: "Forecasts",
  weather: "Weather",
  events: "Events",
  files: "Files",
};

const RADR_TARGET: Partial<Record<DataEntity, string>> = {
  locations: "RADR Location",
  orders: "RADR Order",
  reservations: "RADR Reservation",
  waitlist: "RADR WaitlistEntry",
  tables: "RADR Table",
  labor: "RADR LaborShift",
  invoices: "RADR Invoice",
  payments: "RADR Payment",
  payouts: "RADR Payout",
  forecasts: "RADR Forecast",
  weather: "RADR ExternalSignal",
  events: "RADR ExternalSignal",
  files: "RADR ingest file / mapped entity",
};

export function shortBlurb(p: IntegrationProvider): string {
  if (!p.notes) return "See provider detail for access and capabilities.";
  const first = p.notes.split(/(?<=\.)\s+/)[0] ?? p.notes;
  return first.length > 120 ? `${first.slice(0, 117)}…` : first;
}

export function accessRequirement(p: IntegrationProvider): string {
  const kind = integrationTypeOf(p);
  if (kind === "RADR_REFERENCE") {
    return "RADR-provided synthetic / reference adapter. Usable for demos and testing — not a third-party production reservation provider.";
  }
  if (kind === "FILE_UPLOAD") {
    return "File / document upload. No live vendor API required. Session auth for the upload path.";
  }
  if (kind === "WAREHOUSE" || kind === "CUSTOM") {
    return "Scoped custom implementation. Authentication is connection-specific; deployment depends on the customer’s systems, data model, and security requirements.";
  }
  switch (p.accessType as AccessType) {
    case "PARTNER_API":
      return "Partner authorization required. RADR cannot enable this solely from a customer API key unless the provider permits it.";
    case "PUBLIC_API":
      return p.status === "available" || p.status === "beta"
        ? "Public API. Authorize under the provider’s terms for the entities listed here."
        : "Public API exists. RADR adapter status is shown above — do not assume a live path until Available or Beta.";
    case "CUSTOMER_SUPPLIED":
      return "Customer-supplied API access. Implementation depends on credentials the customer can grant.";
    case "WEBHOOK":
      return "Webhook-oriented access. Signature verification required per official docs.";
    default:
      return "See status and notes for access requirements.";
  }
}

export function dataMappings(
  p: IntegrationProvider,
): { from: string; to: string }[] {
  return p.dataEntities.map((e) => ({
    from: `${p.name} · ${ENTITY_LABEL[e]}`,
    to: RADR_TARGET[e] ?? `RADR · ${ENTITY_LABEL[e]}`,
  }));
}

export function envPlaceholders(p: IntegrationProvider): string[] {
  const kind = integrationTypeOf(p);
  if (kind === "WAREHOUSE") {
    return [
      "# Authentication depends on the source — not one universal API_TOKEN.",
      "# Examples (choose what matches the connector):",
      "# PostgreSQL: DATABASE_URL=postgresql://user:pass@host:5432/db",
      "# Snowflake: SNOWFLAKE_ACCOUNT=… SNOWFLAKE_USER=… SNOWFLAKE_ROLE=…",
      "# BigQuery: GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json",
      "# S3-compatible: AWS_ACCESS_KEY_ID=… AWS_SECRET_ACCESS_KEY=… AWS_REGION=…",
    ];
  }
  if (kind === "RADR_REFERENCE") {
    return ["# No provider credentials — RADR synthetic / reference adapter."];
  }
  if (kind === "FILE_UPLOAD") {
    return [
      "# Session auth for document / CSV upload — no vendor API key.",
      "# Path: upload → schema mapping → validation → normalization → data-quality flags → operating state.",
    ];
  }
  if (kind === "CUSTOM") {
    return [
      "# Authentication is connection-specific.",
      "# Scoped with the customer — credentials, roles, and secrets vary by system.",
    ];
  }
  const key = p.id.toUpperCase().replace(/-/g, "_");
  const lines: string[] = [];
  if (
    p.authMethods.includes("oauth2") ||
    p.authMethods.includes("client_credentials") ||
    p.authMethods.includes("partner_credentials")
  ) {
    lines.push(`${key}_CLIENT_ID=your_client_id`);
    lines.push(`${key}_CLIENT_SECRET=your_client_secret`);
  }
  if (p.authMethods.includes("api_key")) {
    lines.push(`${key}_API_TOKEN=your_api_token`);
  }
  if (p.webhookSupport) {
    lines.push(`${key}_WEBHOOK_SECRET=your_webhook_secret`);
  }
  return lines.length
    ? lines
    : [`${key}_ACCESS_TOKEN=your_access_token`];
}

export function syncSummary(p: IntegrationProvider): string[] {
  const kind = integrationTypeOf(p);

  if (kind === "RADR_REFERENCE") {
    return [
      "Works now as a RADR-owned reference data source.",
      "Use it to generate reservation events, test normalized ingestion, exercise Findings / Decisions, and validate developer flows.",
      "Synthetic / reference data only — not a third-party production provider.",
      "No provider polling or webhooks — local / demo adapter path.",
    ];
  }

  if (kind === "FILE_UPLOAD") {
    return [
      "Works now for the upload path.",
      "UPLOAD → SCHEMA MAPPING → VALIDATION → NORMALIZATION → DATA QUALITY FLAGS → OPERATING STATE.",
      "Supports CSV and document upload; structured mappings expand over time.",
      "No third-party provider polling or webhooks.",
    ];
  }

  if (kind === "WAREHOUSE" || (kind === "CUSTOM" && p.status === "custom")) {
    return [
      "Scoped custom implementation — not a generic plug-and-play adapter.",
      "Deployment is scoped to the customer’s systems, data model, and security requirements.",
      "Authentication depends on the source (database credentials, service account, OAuth, warehouse role, access key, or signed credentials).",
    ];
  }

  if (p.status === "available") {
    const lines = [
      "Works now for the entities listed on this page.",
      "Incremental sync: API polling and/or webhooks where this provider supports them.",
    ];
    if (p.webhookSupport) {
      lines.push("Webhooks: supported by provider; verify signature per official docs.");
    }
    lines.push("Reconciliation: periodic catch-up against the source of record.");
    return lines;
  }
  if (p.status === "beta") {
    return [
      "Beta: some entities and sync paths work; others remain incomplete.",
      "Do not treat this as full production coverage until status moves to Available.",
    ];
  }
  if (p.status === "partner_access") {
    return [
      "Provider API may exist; RADR enablement depends on credentials / partnership.",
      "Do not assume a shipped adapter until status is Available or Beta.",
    ];
  }
  if (p.status === "building") {
    return [
      "Adapter under development.",
      "Sync details will publish when the path is Available.",
    ];
  }
  if (p.status === "custom") {
    return [
      "Scoped custom implementation — not a generic plug-and-play adapter.",
      "Authentication and sync are connection-specific.",
    ];
  }
  return [
    "Planned — not implemented yet.",
    "Do not treat example env vars as a working integration path.",
  ];
}

/** Whether to show the “official docs missing” third-party disclaimer. */
export function showMissingOfficialDocs(p: IntegrationProvider): boolean {
  const kind = integrationTypeOf(p);
  if (kind === "RADR_REFERENCE" || kind === "FILE_UPLOAD") return false;
  if (kind === "WAREHOUSE" || kind === "CUSTOM") return false;
  return !p.docsUrl;
}

export function formatReviewed(iso?: string): string {
  if (!iso) return "Not set";
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function codeGuideStatus(
  p: IntegrationProvider,
): "demo" | "available" | "custom" | "planned" | "pending" {
  const kind = integrationTypeOf(p);
  if (p.status === "available" && kind === "RADR_REFERENCE") return "demo";
  if (p.status === "available") return "available";
  if (p.status === "custom" || kind === "CUSTOM" || kind === "WAREHOUSE")
    return "custom";
  if (p.status === "planned") return "planned";
  return "pending";
}

export type { IntegrationType };
