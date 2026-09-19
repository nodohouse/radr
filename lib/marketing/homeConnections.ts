/**
 * Public homepage connection preview — curated subset of Developer catalog.
 * Resting UI: ~16–18 sources. Full catalog lives in Developers.
 */

import {
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS_LABEL,
  type IntegrationProvider,
} from "@/lib/integrations/registry";
import { GOOGLE_STACK_IDS } from "@/lib/integrations/capabilityStory";

export type ConnectionMethod = {
  id: string;
  label: string;
  note: string;
};

export const CONNECTION_METHODS: ConnectionMethod[] = [
  { id: "rest", label: "REST API / OAuth", note: "Partner & public APIs" },
  { id: "webhook", label: "Webhook", note: "Event push where supported" },
  { id: "csv", label: "CSV / Document", note: "Files · AVAILABLE path" },
  { id: "sftp", label: "SFTP", note: "Batch exports" },
  { id: "warehouse", label: "Warehouse", note: "BYOD path" },
  { id: "custom", label: "Custom connector", note: "Scoped implementation" },
];

export const SYSTEM_LAYERS = [
  "POS",
  "PMS",
  "Reservations",
  "Accounting",
  "Payments",
  "Labor",
  "Delivery",
  "Procurement",
  "Files / warehouse",
  "External signals",
] as const;

/**
 * Resting homepage map — three visual clusters only.
 * Taxonomy richness lives in hover cards + Developers catalog.
 */
export const HOME_CAPABILITY_GROUPS = [
  {
    id: "operations",
    label: "Operations",
    providerIds: [
      "toast",
      "lightspeed-restaurant",
      "opentable",
      "sevenrooms",
      "mews",
      "apaleo",
      "oracle-opera-cloud",
      "siteminder",
    ] as const,
  },
  {
    id: "finance",
    label: "Finance",
    providerIds: ["xero", "netsuite", "adyen", "stripe"] as const,
  },
  {
    id: "channels-context",
    label: "Channels & context",
    providerIds: [
      "uber-eats",
      "deliveroo",
      "booking-connectivity",
      "open-meteo",
      "predicthq",
      "ticketmaster",
      "google-stack",
    ] as const,
  },
] as const;

/** Real provider ids on homepage (excl. google-stack pseudo) */
export const SIGNAL_MAP_VISIBLE_IDS = [
  "toast",
  "lightspeed-restaurant",
  "opentable",
  "sevenrooms",
  "mews",
  "apaleo",
  "oracle-opera-cloud",
  "siteminder",
  "xero",
  "netsuite",
  "adyen",
  "stripe",
  "uber-eats",
  "deliveroo",
  "booking-connectivity",
  "open-meteo",
  "predicthq",
  "ticketmaster",
  "files-csv",
  ...GOOGLE_STACK_IDS,
] as const;

/** @deprecated — prefer HOME_CAPABILITY_GROUPS */
export const HOME_CONNECTION_GROUPS = [
  {
    id: "operations",
    label: "Operations",
    providerIds: [
      "toast",
      "lightspeed-restaurant",
      "opentable",
      "sevenrooms",
      "mews",
      "apaleo",
      "oracle-opera-cloud",
      "siteminder",
    ],
  },
  {
    id: "finance",
    label: "Finance",
    providerIds: ["xero", "netsuite", "adyen", "stripe"],
  },
  {
    id: "channels",
    label: "Channels & context",
    providerIds: [
      "uber-eats",
      "deliveroo",
      "booking-connectivity",
      "open-meteo",
      "predicthq",
      "ticketmaster",
      "files-csv",
    ],
  },
  {
    id: "custom",
    label: "Custom data",
    providerIds: ["files-csv", "byod-warehouse"],
  },
] as const;

const HOME_PROVIDER_IDS = [
  ...SIGNAL_MAP_VISIBLE_IDS,
  "square",
  "personio",
  "mollie",
  "byod-warehouse",
] as const;

export const SIGNAL_MAP_OUTPUTS = [
  "Decisions",
  "Futures",
  "Actions",
  "Verified Value",
  "Memory",
] as const;

export function providerById(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find((p) => p.id === id);
}

export function homeConnectionProviders(): IntegrationProvider[] {
  const ids = new Set<string>(HOME_PROVIDER_IDS);
  return INTEGRATION_PROVIDERS.filter((p) => ids.has(p.id));
}

export function statusLabel(p: IntegrationProvider): string {
  return INTEGRATION_STATUS_LABEL[p.status];
}

export function connectionMethodLabel(p: IntegrationProvider): string {
  if (p.accessType === "FILE_EXPORT") return "CSV / Document";
  if (p.id === "byod-warehouse") return "Warehouse";
  if (p.authMethods.includes("sftp")) return "SFTP";
  if (p.accessType === "CUSTOM") return "Custom connector";
  if (
    p.webhookSupport &&
    (p.accessType === "PUBLIC_API" || p.accessType === "PARTNER_API")
  ) {
    return "REST API / Webhook";
  }
  if (p.accessType === "WEBHOOK") return "Webhook";
  if (p.accessType === "PUBLIC_API" || p.accessType === "PARTNER_API") {
    return "REST API / OAuth";
  }
  return "REST API / OAuth";
}

export const CATALOG_COUNT = INTEGRATION_PROVIDERS.length;
