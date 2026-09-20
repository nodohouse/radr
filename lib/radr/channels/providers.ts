/**
 * Normalized delivery provider catalog.
 * Prefer integration registry IDs; extend with planned aggregators for demos.
 * UI must consume DeliveryChannel / catalog entries - never hardcode provider names in views.
 */

import { INTEGRATION_PROVIDERS } from "@/lib/integrations/registry";

export type DeliveryProviderCatalogEntry = {
  id: string;
  name: string;
  /** Regions where this aggregator commonly operates */
  regions: string[];
  inRegistry: boolean;
};

const PLANNED_AGGREGATORS: DeliveryProviderCatalogEntry[] = [
  { id: "wolt", name: "Wolt", regions: ["eu"], inRegistry: false },
  { id: "glovo", name: "Glovo", regions: ["eu"], inRegistry: false },
  { id: "just-eat", name: "Just Eat", regions: ["eu", "uk"], inRegistry: false },
  { id: "bolt-food", name: "Bolt Food", regions: ["eu"], inRegistry: false },
  { id: "grubhub", name: "Grubhub", regions: ["us"], inRegistry: false },
  { id: "instacart", name: "Instacart", regions: ["us"], inRegistry: false },
];

/** All known delivery aggregators RADR can normalize. */
export function deliveryProviderCatalog(): DeliveryProviderCatalogEntry[] {
  const fromRegistry = INTEGRATION_PROVIDERS.filter(
    (p) => p.category === "delivery",
  ).map((p) => ({
    id: p.id,
    name: p.name,
    regions: p.regions,
    inRegistry: true,
  }));

  const seen = new Set(fromRegistry.map((p) => p.id));
  const extras = PLANNED_AGGREGATORS.filter((p) => !seen.has(p.id));
  return [...fromRegistry, ...extras];
}

export function deliveryProviderById(
  id: string,
): DeliveryProviderCatalogEntry | undefined {
  return deliveryProviderCatalog().find((p) => p.id === id);
}

export function requireDeliveryProvider(
  id: string,
): DeliveryProviderCatalogEntry {
  const p = deliveryProviderById(id);
  if (!p) {
    throw new Error(`Unknown delivery provider: ${id}`);
  }
  return p;
}
