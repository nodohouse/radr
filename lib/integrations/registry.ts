/**
 * Integration provider registry. Single source of truth for marketing + docs.
 * Status must stay honest. Never mark a commercial provider available without a shipped adapter.
 */

export type IntegrationStatus =
  | "available"
  | "beta"
  | "building"
  | "planned"
  | "custom"
  | "partner_access";

export type IntegrationCategory =
  | "pos"
  | "reservations"
  | "pms"
  | "channels"
  | "aparthotel"
  | "labor"
  | "accounting"
  | "payments"
  | "delivery"
  | "purchasing"
  | "banking"
  | "external-signals"
  | "custom";

export type AccessType =
  | "PUBLIC_API"
  | "PARTNER_API"
  | "CUSTOMER_SUPPLIED"
  | "WEBHOOK"
  | "FILE_EXPORT"
  | "CUSTOM"
  | "SYNTHETIC";

/** Template branch — prevents third-party provider prose on RADR-owned paths. */
export type IntegrationType =
  | "THIRD_PARTY_API"
  | "RADR_REFERENCE"
  | "FILE_UPLOAD"
  | "WAREHOUSE"
  | "CUSTOM";

export type AuthMethod =
  | "oauth2"
  | "api_key"
  | "client_credentials"
  | "partner_credentials"
  | "sftp"
  | "none";

export type DataEntity =
  | "locations"
  | "orders"
  | "reservations"
  | "waitlist"
  | "tables"
  | "labor"
  | "invoices"
  | "payments"
  | "payouts"
  | "forecasts"
  | "weather"
  | "events"
  | "files";

export type IntegrationProvider = {
  id: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  accessType: AccessType;
  /** Template branch. Prefer explicit; otherwise derived via integrationTypeOf(). */
  integrationType?: IntegrationType;
  authMethods: AuthMethod[];
  capabilities: DataEntity[];
  regions: string[];
  docsUrl?: string;
  apiAvailable: boolean;
  realtimeSupport: boolean;
  webhookSupport: boolean;
  dataEntities: DataEntity[];
  /** Explicit write surface. Default false - never imply send/update from read status. */
  supportsWriteActions?: boolean;
  writeActions?: string[];
  notes?: string;
  lastReviewed?: string;
};

export const INTEGRATION_STATUS_LABEL: Record<IntegrationStatus, string> = {
  available: "Available",
  beta: "Beta",
  building: "Building",
  planned: "Planned",
  custom: "Scoped custom implementation",
  partner_access: "Partner access",
};

export function integrationTypeOf(p: IntegrationProvider): IntegrationType {
  if (p.integrationType) return p.integrationType;
  if (p.accessType === "SYNTHETIC") return "RADR_REFERENCE";
  if (p.accessType === "FILE_EXPORT") return "FILE_UPLOAD";
  if (p.id === "byod-warehouse") return "WAREHOUSE";
  if (p.status === "custom" || p.accessType === "CUSTOM") return "CUSTOM";
  return "THIRD_PARTY_API";
}

export const INTEGRATION_CATEGORY_LABEL: Record<IntegrationCategory, string> = {
  pos: "POS",
  reservations: "Reservations",
  pms: "Hotel PMS",
  channels: "Channel / distribution",
  aparthotel: "Aparthotel / STR PMS",
  labor: "Labor",
  accounting: "Accounting",
  payments: "Payments",
  delivery: "Delivery",
  purchasing: "Purchasing",
  banking: "Banking",
  "external-signals": "External signals",
  custom: "Custom / BYOD",
};

/**
 * Canonical catalog. Marketing and docs import this list only.
 */
export const INTEGRATION_PROVIDERS: readonly IntegrationProvider[] = [
  {
    id: "radr-demo-reservations",
    name: "RADR Demo Reservations",
    category: "reservations",
    status: "available",
    accessType: "SYNTHETIC",
    integrationType: "RADR_REFERENCE",
    authMethods: ["none"],
    capabilities: ["reservations", "waitlist", "locations"],
    regions: ["global"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["reservations", "waitlist", "locations"],
    supportsWriteActions: false,
    writeActions: [],
    notes:
      "RADR-provided reference data source for testing and demonstration. Generates reservation events for normalized ingestion, Findings / Decisions, and developer flows — without third-party provider access. Synthetic/reference only; not a production reservation platform.",
    lastReviewed: "2026-09-17",
  },
  {
    id: "files-csv",
    name: "Files · CSV / Documents",
    category: "custom",
    status: "available",
    accessType: "FILE_EXPORT",
    integrationType: "FILE_UPLOAD",
    authMethods: ["none"],
    capabilities: ["files", "orders", "labor", "invoices", "reservations"],
    regions: ["global"],
    docsUrl: "/product/connections",
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["files"],
    notes:
      "Upload path works today: CSV and document upload → schema mapping → validation → normalization → data-quality flags → operating state. Structured mappings expand over time.",
    lastReviewed: "2026-09-17",
  },
  {
    id: "toast",
    name: "Toast",
    category: "pos",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["client_credentials", "oauth2"],
    capabilities: ["locations", "orders", "payments"],
    regions: ["us", "eu", "other"],
    docsUrl: "https://doc.toasttab.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "orders", "payments"],
    notes:
      "Official Toast Partner / custom / standard API paths exist. RADR has not shipped an adapter. Partnership or approved access required before implementation.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "square",
    name: "Square",
    category: "pos",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["locations", "orders", "payments"],
    regions: ["us", "eu", "other"],
    docsUrl: "https://developer.squareup.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "orders", "payments"],
    notes: "Confirm current OAuth scopes and rate limits before implementation. Not built in RADR yet.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "lightspeed-restaurant",
    name: "Lightspeed Restaurant",
    category: "pos",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "partner_credentials"],
    capabilities: ["locations", "orders"],
    regions: ["eu", "us", "other"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["locations", "orders"],
    notes: "Confirm official API access path with Lightspeed before coding endpoints.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "clover",
    name: "Clover",
    category: "pos",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2"],
    capabilities: ["locations", "orders", "payments"],
    regions: ["us", "eu"],
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "orders", "payments"],
    notes: "Partner / developer program details to be confirmed against official docs before adapter work.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "oracle-simphony",
    name: "Oracle MICROS / Simphony",
    category: "pos",
    status: "custom",
    accessType: "CUSTOM",
    authMethods: ["partner_credentials", "api_key"],
    capabilities: ["locations", "orders"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["locations", "orders"],
    notes: "Typically enterprise / partner access. Implementation path requires customer-supplied access details.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "ncr-aloha",
    name: "NCR Aloha",
    category: "pos",
    status: "custom",
    accessType: "CUSTOM",
    authMethods: ["partner_credentials"],
    capabilities: ["locations", "orders"],
    regions: ["us", "other"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["locations", "orders"],
    notes: "Enterprise / custom integration path. Do not invent endpoints.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "opentable",
    name: "OpenTable",
    category: "reservations",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "partner_credentials"],
    capabilities: ["reservations", "tables", "locations"],
    regions: ["global"],
    docsUrl: "https://www.opentable.com/restaurant-solutions/api-partners/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: false,
    dataEntities: ["reservations", "tables", "locations"],
    notes:
      "Partner network application required. Endpoint details only after approved access to official docs.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "sevenrooms",
    name: "SevenRooms",
    category: "reservations",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "client_credentials"],
    capabilities: ["reservations", "waitlist", "tables", "locations"],
    regions: ["global"],
    docsUrl: "https://api-docs.sevenrooms.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["reservations", "waitlist", "tables", "locations"],
    notes:
      "API docs are gated to provisioned accounts. Partnership / customer access required. Waitlist support expected but confirm scopes before coding.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "resy",
    name: "Resy",
    category: "reservations",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials"],
    capabilities: ["reservations", "locations"],
    regions: ["us", "other"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["reservations", "locations"],
    notes: "Access model to be confirmed with Resy / customer. No public RADR adapter.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "thefork",
    name: "TheFork",
    category: "reservations",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials", "oauth2"],
    capabilities: ["reservations", "locations"],
    regions: ["eu"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["reservations", "locations"],
    notes: "Confirm official partner API availability by region before implementation.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "deputy",
    name: "Deputy",
    category: "labor",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["labor", "locations"],
    regions: ["global"],
    docsUrl: "https://developer.deputy.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["labor", "locations"],
    notes:
      "Public REST API with OAuth or permanent tokens. Strong candidate for first real labor adapter. Not built in RADR yet.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "7shifts",
    name: "7shifts",
    category: "labor",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["labor", "locations"],
    regions: ["us", "ca", "other"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["labor", "locations"],
    notes: "Confirm current official API docs and scopes before adapter work.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "planday",
    name: "Planday",
    category: "labor",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["labor", "locations"],
    regions: ["eu"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["labor", "locations"],
    notes: "Confirm official developer documentation before implementation.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "xero",
    name: "Xero",
    category: "accounting",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["invoices", "payments"],
    regions: ["global"],
    docsUrl: "https://developer.xero.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["invoices", "payments"],
    notes: "OAuth accounting connector planned after credential vault exists.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "quickbooks-online",
    name: "QuickBooks Online",
    category: "accounting",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["invoices", "payments"],
    regions: ["us", "other"],
    docsUrl: "https://developer.intuit.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["invoices", "payments"],
    notes: "Confirm Intuit app review requirements before production use.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "payments",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["api_key", "oauth2"],
    capabilities: ["payments", "payouts"],
    regions: ["global"],
    docsUrl: "https://docs.stripe.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["payments", "payouts"],
    notes: "Never ingest PAN/CVV. Use Stripe objects / IDs only.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "mollie",
    name: "Mollie",
    category: "payments",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["api_key", "oauth2"],
    capabilities: ["payments", "payouts"],
    regions: ["eu"],
    docsUrl: "https://docs.mollie.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["payments", "payouts"],
    notes: "EU-focused payments. Confirm settlement objects against official docs.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "uber-eats",
    name: "Uber Eats",
    category: "delivery",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "partner_credentials"],
    capabilities: ["orders", "payouts"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["orders", "payouts"],
    notes: "Merchant / partner agreement typically required. Do not claim public API access.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "deliveroo",
    name: "Deliveroo",
    category: "delivery",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials"],
    capabilities: ["orders", "payouts"],
    regions: ["eu", "other"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["orders", "payouts"],
    notes: "Partner access required. Confirm region-specific programs before implementation.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "doordash",
    name: "DoorDash",
    category: "delivery",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "partner_credentials"],
    capabilities: ["orders", "payouts"],
    regions: ["us", "other"],
    apiAvailable: false,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["orders", "payouts"],
    notes: "Partner / Drive / Marketplace programs; confirm official access path.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "open-meteo",
    name: "Open-Meteo",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["none", "api_key"],
    capabilities: ["weather"],
    regions: ["global"],
    docsUrl: "https://open-meteo.com/en/docs",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["weather"],
    notes: "Weather signal adapter planned. No RADR implementation yet.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "predicthq",
    name: "PredictHQ",
    category: "external-signals",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["api_key"],
    capabilities: ["events"],
    regions: ["global"],
    docsUrl: "https://docs.predicthq.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["events"],
    notes: "Commercial / partner terms may apply. Confirm licensing before production use.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "truelayer",
    name: "TrueLayer",
    category: "banking",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2"],
    capabilities: ["payments", "payouts"],
    regions: ["eu", "uk"],
    docsUrl: "https://docs.truelayer.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["payments", "payouts"],
    notes: "Open banking requires explicit end-user authorization and suitable legal basis. Not built.",
    lastReviewed: "2026-08-24",
  },
  {
    id: "mews",
    name: "Mews",
    category: "pms",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "client_credentials"],
    capabilities: ["locations", "reservations", "forecasts"],
    regions: ["global"],
    docsUrl: "https://mews-systems.gitbook.io/connector-api/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "reservations", "forecasts"],
    notes:
      "Official Connector API exists. RADR has not shipped an adapter. Partner / customer credentials required before implementation.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "apaleo",
    name: "Apaleo",
    category: "pms",
    status: "partner_access",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["locations", "reservations", "forecasts"],
    regions: ["eu", "global"],
    docsUrl: "https://apaleo.dev/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "reservations", "forecasts"],
    notes: "Open API documented. No RADR production adapter yet.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "cloudbeds",
    name: "Cloudbeds",
    category: "pms",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["locations", "reservations"],
    regions: ["global"],
    docsUrl: "https://developers.cloudbeds.com/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["locations", "reservations"],
    notes: "Confirm current partner program and scopes before adapter work. Not built in RADR.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "oracle-opera-cloud",
    name: "Oracle OPERA Cloud",
    category: "pms",
    status: "custom",
    accessType: "CUSTOM",
    authMethods: ["partner_credentials", "oauth2"],
    capabilities: ["locations", "reservations"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["locations", "reservations"],
    notes:
      "Enterprise PMS path. Customer-supplied access and integration partner involvement typical. Do not invent endpoints.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "siteminder",
    name: "SiteMinder",
    category: "channels",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials", "oauth2"],
    capabilities: ["reservations", "locations", "forecasts"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["reservations", "locations", "forecasts"],
    notes:
      "Channel manager connectivity is partner-gated. RADR has not shipped an adapter.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "d-edge",
    name: "D-EDGE",
    category: "channels",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials"],
    capabilities: ["reservations", "locations", "forecasts"],
    regions: ["eu", "global"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["reservations", "locations", "forecasts"],
    notes: "Confirm official distribution API access by property before implementation.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "booking-connectivity",
    name: "Booking.com Connectivity",
    category: "channels",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["partner_credentials"],
    capabilities: ["reservations", "locations"],
    regions: ["global"],
    docsUrl: "https://developers.booking.com/",
    apiAvailable: false,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["reservations", "locations"],
    notes:
      "Connectivity partner program required. RADR does not claim live channel writes.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "guesty",
    name: "Guesty",
    category: "aparthotel",
    status: "partner_access",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["locations", "reservations"],
    regions: ["global"],
    docsUrl: "https://open-api-docs.guesty.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["locations", "reservations"],
    notes:
      "STR / aparthotel PMS API documented. No RADR adapter shipped.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "hostaway",
    name: "Hostaway",
    category: "aparthotel",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["api_key", "oauth2"],
    capabilities: ["locations", "reservations"],
    regions: ["global"],
    docsUrl: "https://api.hostaway.com/documentation",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["locations", "reservations"],
    notes: "Confirm rate limits and scopes against official docs. Not built in RADR yet.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "hospitable",
    name: "Hospitable",
    category: "aparthotel",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["locations", "reservations"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: true,
    dataEntities: ["locations", "reservations"],
    notes: "Partner / API access model to be confirmed before adapter design.",
    lastReviewed: "2026-09-16",
  },
  {
    id: "personio",
    name: "Personio",
    category: "labor",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["labor", "locations"],
    regions: ["eu"],
    docsUrl: "https://developer.personio.de/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["labor", "locations"],
    notes:
      "Labor adapter planned. Prefer aggregate schedule / attendance signals — not employee scoring. Confirm scopes before implementation.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "netsuite",
    name: "NetSuite",
    category: "accounting",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["invoices", "payments"],
    regions: ["global"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["invoices", "payments"],
    notes:
      "Enterprise ERP path. Auth model and endpoints to be confirmed against official docs before adapter work. No RADR adapter shipped.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "exact-online",
    name: "Exact Online",
    category: "accounting",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["invoices", "payments"],
    regions: ["eu"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["invoices", "payments"],
    notes: "Confirm OAuth scopes and rate limits before implementation.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "sage",
    name: "Sage",
    category: "accounting",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["oauth2", "api_key"],
    capabilities: ["invoices", "payments"],
    regions: ["eu", "uk", "other"],
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["invoices", "payments"],
    notes: "Product line and API path to be confirmed per customer region.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "adyen",
    name: "Adyen",
    category: "payments",
    status: "planned",
    accessType: "PARTNER_API",
    authMethods: ["api_key", "oauth2"],
    capabilities: ["payments", "payouts"],
    regions: ["global"],
    docsUrl: "https://docs.adyen.com/",
    apiAvailable: true,
    realtimeSupport: true,
    webhookSupport: true,
    dataEntities: ["payments", "payouts"],
    notes:
      "Partner / customer credentials required. Settlement and fee fields subject to account configuration. No RADR adapter shipped.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "google-business-profile",
    name: "Google Business Profile",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["forecasts"],
    regions: ["global"],
    docsUrl: "https://developers.google.com/my-business",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["forecasts"],
    notes:
      "Local demand / reputation signal. OAuth and customer authorization required. Field availability depends on Google APIs and account access. Not built in RADR yet.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "google-analytics-4",
    name: "Google Analytics 4",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["forecasts"],
    regions: ["global"],
    docsUrl: "https://developers.google.com/analytics",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["forecasts"],
    notes:
      "Marketing / demand context. Customer OAuth required. Ecommerce fields only where configured. Not a hospitality Decision source alone.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "google-search-console",
    name: "Google Search Console",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["oauth2"],
    capabilities: ["forecasts"],
    regions: ["global"],
    docsUrl: "https://developers.google.com/webmaster-tools",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["forecasts"],
    notes:
      "Search demand evidence. SEO is not an integration — Search Console is the source. OAuth required. Not built in RADR yet.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "google-places",
    name: "Google Places / Maps",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["api_key"],
    capabilities: ["events"],
    regions: ["global"],
    docsUrl: "https://developers.google.com/maps/documentation/places",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["events"],
    notes:
      "Contextual place / neighborhood data only. Do not claim Popular Times or live foot traffic — Places API is not a footfall API. Licensing and quotas apply.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "ticketmaster",
    name: "Ticketmaster Discovery",
    category: "external-signals",
    status: "planned",
    accessType: "PUBLIC_API",
    authMethods: ["api_key"],
    capabilities: ["events"],
    regions: ["us", "eu", "other"],
    docsUrl: "https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/",
    apiAvailable: true,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["events"],
    notes:
      "Event discovery context. Confirm API terms and rate limits before production use. Not a Decision alone — evidence for demand Futures.",
    lastReviewed: "2026-09-20",
  },
  {
    id: "byod-warehouse",
    name: "Bring your own warehouse",
    category: "custom",
    status: "custom",
    accessType: "CUSTOM",
    integrationType: "WAREHOUSE",
    authMethods: ["api_key"],
    capabilities: ["files"],
    regions: ["global"],
    apiAvailable: false,
    realtimeSupport: false,
    webhookSupport: false,
    dataEntities: ["files"],
    notes:
      "Scoped custom implementation. PostgreSQL, Snowflake, BigQuery, S3-compatible storage via connection-specific credentials — not one universal API_TOKEN. Architecture only; no auto-connect.",
    lastReviewed: "2026-09-17",
  },
] as const;

export function providersByCategory(
  category: IntegrationCategory,
): IntegrationProvider[] {
  return INTEGRATION_PROVIDERS.filter((p) => p.category === category);
}

export function providersByStatus(
  status: IntegrationStatus,
): IntegrationProvider[] {
  return INTEGRATION_PROVIDERS.filter((p) => p.status === status);
}

export function getProvider(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find((p) => p.id === id);
}
