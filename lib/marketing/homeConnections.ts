/**
 * Public homepage connection preview — filters the Developer catalog.
 * Never invent providers or statuses.
 */

import {
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS_LABEL,
  type IntegrationProvider,
} from "@/lib/integrations/registry";

export type ConnectionMethod = {
  id: string;
  label: string;
  note: string;
};

/** Methods architecture supports / plans — not a claim of live coverage for every provider */
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
] as const;

const HOME_PROVIDER_IDS = [
  "toast",
  "lightspeed-restaurant",
  "square",
  "opentable",
  "sevenrooms",
  "deliveroo",
  "uber-eats",
  "mews",
  "apaleo",
  "siteminder",
  "booking-connectivity",
  "guesty",
  "hostaway",
  "hospitable",
  "xero",
  "quickbooks-online",
  "stripe",
  "mollie",
  "files-csv",
  "byod-warehouse",
] as const;

export type HomeConnectionGroup = {
  id: string;
  label: string;
  providerIds: readonly string[];
};

export const HOME_CONNECTION_GROUPS: HomeConnectionGroup[] = [
  {
    id: "restaurant",
    label: "Restaurant",
    providerIds: [
      "toast",
      "lightspeed-restaurant",
      "square",
      "opentable",
      "sevenrooms",
      "deliveroo",
      "uber-eats",
    ],
  },
  {
    id: "hotel",
    label: "Hotel",
    providerIds: ["mews", "apaleo", "siteminder", "booking-connectivity"],
  },
  {
    id: "serviced",
    label: "Serviced apartment",
    providerIds: ["guesty", "hostaway", "hospitable"],
  },
  {
    id: "finance",
    label: "Finance",
    providerIds: ["xero", "quickbooks-online", "files-csv"],
  },
  {
    id: "payments",
    label: "Payments",
    providerIds: ["stripe", "mollie"],
  },
];

export function providerById(id: string): IntegrationProvider | undefined {
  return INTEGRATION_PROVIDERS.find((p) => p.id === id);
}

export function homeConnectionProviders(): IntegrationProvider[] {
  return HOME_PROVIDER_IDS.map((id) => providerById(id)).filter(
    (p): p is IntegrationProvider => Boolean(p),
  );
}

export function statusLabel(p: IntegrationProvider): string {
  return INTEGRATION_STATUS_LABEL[p.status];
}
