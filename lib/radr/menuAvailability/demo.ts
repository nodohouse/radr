/**
 * Deterministic Berlin dinner demo - Bluefin tuna short delivery.
 * Illustrative only. Numbers are fixture-owned, not live POS.
 */

import {
  DEMO_AS_OF_ISO,
  DEMO_LOCATION_ID,
  DEMO_LOCATION_NAME,
} from "@/lib/radr/demoClock";
import { recomputeMenuAvailabilityRisk } from "./exposure";
import type {
  ExpectedSubstitution,
  ForecastDemand,
  Ingredient,
  InventoryPosition,
  MenuAvailabilityRisk,
  MenuAvailabilityTrigger,
  MenuItem,
  Recipe,
  SupplierOption,
} from "./types";

const INGREDIENT: Ingredient = {
  id: "ing_bluefin",
  name: "Bluefin tuna",
  unit: "kg",
};

const RECIPES: Recipe[] = [
  {
    id: "rcp_tuna_tataki",
    name: "Tuna tataki",
    ingredientId: "ing_bluefin",
    unitsPerPortion: 0.12,
  },
  {
    id: "rcp_tuna_crudo",
    name: "Tuna crudo",
    ingredientId: "ing_bluefin",
    unitsPerPortion: 0.1,
  },
  {
    id: "rcp_tuna_don",
    name: "Tuna donburi",
    ingredientId: "ing_bluefin",
    unitsPerPortion: 0.15,
  },
];

const MENU: MenuItem[] = [
  {
    id: "mi_tataki",
    name: "Tuna Tataki",
    recipeId: "rcp_tuna_tataki",
    locationId: DEMO_LOCATION_ID,
    menuPrice: 86,
    contributionRate: 0.62,
  },
  {
    id: "mi_crudo",
    name: "Bluefin Nigiri",
    recipeId: "rcp_tuna_crudo",
    locationId: DEMO_LOCATION_ID,
    menuPrice: 92,
    contributionRate: 0.64,
  },
  {
    id: "mi_don",
    name: "Chef's Omakase",
    recipeId: "rcp_tuna_don",
    locationId: DEMO_LOCATION_ID,
    menuPrice: 78,
    contributionRate: 0.58,
  },
];

/** On hand after short delivery - ~9 portions blended across dishes. */
const INVENTORY: InventoryPosition = {
  ingredientId: "ing_bluefin",
  locationId: DEMO_LOCATION_ID,
  onHand: 1.08,
  unit: "kg",
  asOf: DEMO_AS_OF_ISO,
};

const FORECASTS: ForecastDemand[] = [
  {
    menuItemId: "mi_tataki",
    serviceId: "svc_ber_dinner_2026_08_19",
    expectedPortions: 18,
  },
  {
    menuItemId: "mi_crudo",
    serviceId: "svc_ber_dinner_2026_08_19",
    expectedPortions: 9,
  },
  {
    menuItemId: "mi_don",
    serviceId: "svc_ber_dinner_2026_08_19",
    expectedPortions: 4,
  },
];

const SUBSTITUTIONS: ExpectedSubstitution[] = [
  {
    menuItemId: "mi_tataki",
    substituteRate: 0.22,
    substituteTicketRatio: 0.75,
    note: "Some guests move to yellowfin tataki or salmon.",
  },
  {
    menuItemId: "mi_crudo",
    substituteRate: 0.18,
    substituteTicketRatio: 0.7,
    note: "Crudo guests substitute less often.",
  },
  {
    menuItemId: "mi_don",
    substituteRate: 0.35,
    substituteTicketRatio: 0.82,
    note: "Donburi guests accept yellowfin more readily.",
  },
];

const SUPPLIERS: SupplierOption[] = [
  {
    id: "sup_nordic_backup",
    name: "Nordic Seafood Express",
    ingredientId: "ing_bluefin",
    approved: true,
    leadMinutes: 75,
    availableQty: 4,
    unitCost: 48,
  },
];

const TRIGGER: MenuAvailabilityTrigger = {
  id: "trg_tuna_short_ber",
  kind: "DELIVERY_SHORT",
  locationId: DEMO_LOCATION_ID,
  locationName: DEMO_LOCATION_NAME,
  serviceId: "svc_ber_dinner_2026_08_19",
  serviceLabel: "Dinner",
  ingredientId: "ing_bluefin",
  asOf: DEMO_AS_OF_ISO,
  summary: "Bluefin delivery short - 8kg expected, 1.05kg usable on hand for service.",
  shortageQty: 8,
  shortageUnit: "kg",
};

/**
 * Demo menu risk for Control Center. Returns null if not material
 * (should be material for this fixture).
 */
export function demoMenuAvailabilityRisk(): MenuAvailabilityRisk | null {
  const risk = recomputeMenuAvailabilityRisk({
    trigger: TRIGGER,
    ingredient: INGREDIENT,
    recipes: RECIPES,
    menuItems: MENU,
    inventory: INVENTORY,
    forecasts: FORECASTS,
    substitutions: SUBSTITUTIONS,
    suppliers: SUPPLIERS,
    runOutBy: "20:15",
    illustrative: true,
  });
  return risk.material ? risk : null;
}

/** Graph fixtures for tests / recomputation demos. */
export const DEMO_MENU_GRAPH = {
  trigger: TRIGGER,
  ingredient: INGREDIENT,
  recipes: RECIPES,
  menuItems: MENU,
  inventory: INVENTORY,
  forecasts: FORECASTS,
  substitutions: SUBSTITUTIONS,
  suppliers: SUPPLIERS,
} as const;
