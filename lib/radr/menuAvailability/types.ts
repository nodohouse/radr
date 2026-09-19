/**
 * Menu Availability Risk - ingredient → revenue dependency graph.
 *
 * Translate upstream shortages into financial exposure + prepared options.
 * Never treat missing portions × menu price as expected loss without
 * substitution / cannibalization adjustment.
 */

export type MenuTriggerKind =
  | "DELIVERY_SHORT"
  | "DELIVERY_DELAYED"
  | "INVENTORY_BELOW_FORECAST"
  | "INGREDIENT_UNAVAILABLE"
  | "PRICE_INCREASE"
  | "ITEM_86"
  | "PREP_SHORTAGE"
  | "EQUIPMENT_OUTAGE";

export type Ingredient = {
  id: string;
  name: string;
  unit: "kg" | "g" | "L" | "portion";
};

export type Recipe = {
  id: string;
  name: string;
  ingredientId: string;
  /** Ingredient units required per finished portion. */
  unitsPerPortion: number;
};

export type MenuItem = {
  id: string;
  name: string;
  recipeId: string;
  locationId: string;
  /** Menu selling price (major units). */
  menuPrice: number;
  /** Estimated contribution rate on this item (0-1). */
  contributionRate: number;
  channel?: "dine_in" | "bar" | "terrace";
};

export type InventoryPosition = {
  ingredientId: string;
  locationId: string;
  onHand: number;
  unit: Ingredient["unit"];
  asOf: string;
};

export type SupplierOption = {
  id: string;
  name: string;
  ingredientId: string;
  approved: boolean;
  leadMinutes: number;
  /** Available quantity in ingredient units. */
  availableQty: number;
  unitCost: number;
};

export type DeliveryEvent = {
  id: string;
  supplierId: string;
  ingredientId: string;
  locationId: string;
  expectedQty: number;
  receivedQty: number;
  status: "SHORT" | "DELAYED" | "COMPLETE";
  asOf: string;
};

export type ForecastDemand = {
  menuItemId: string;
  serviceId: string;
  /** Expected portions for the remainder of service. */
  expectedPortions: number;
};

/** Historical probability a guest substitutes another item when primary is 86'd. */
export type ExpectedSubstitution = {
  menuItemId: string;
  /** 0-1 share of shortfall guests who still spend on a substitute. */
  substituteRate: number;
  /** Average substitute ticket as fraction of original menu price. */
  substituteTicketRatio: number;
  note: string;
};

export type MenuAvailabilityTrigger = {
  id: string;
  kind: MenuTriggerKind;
  locationId: string;
  locationName: string;
  serviceId: string;
  serviceLabel: string;
  ingredientId: string;
  asOf: string;
  summary: string;
  /** e.g. short by 8kg */
  shortageQty?: number;
  shortageUnit?: Ingredient["unit"];
};

export type AffectedMenuLine = {
  menuItemId: string;
  menuItemName: string;
  expectedPortions: number;
  portionsPossible: number;
  shortfallPortions: number;
  menuPrice: number;
  contributionRate: number;
  substituteRate: number;
  substituteTicketRatio: number;
};

/**
 * GROSS REVENUE AT RISK - shortfall × menu price (upper bound, no substitution).
 * EXPECTED REVENUE LOSS - after likely substitution / cannibalization.
 * CONTRIBUTION AT RISK - expected revenue loss × contribution rate.
 */
export type MenuRevenueExposure = {
  grossRevenueAtRisk: number;
  expectedRevenueLoss: number;
  contributionAtRisk: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceNote: string;
};

export type MenuPreparedOption = {
  id: string;
  title: string;
  detail: string;
  kind:
    | "ALTERNATE_SUPPLIER"
    | "SUBSTITUTE_INGREDIENT"
    | "TRANSFER_STOCK"
    | "EIGHTY_SIX"
    | "NOTIFY"
    | "PROMOTE_SUBSTITUTE";
  /** Estimated contribution protected if approved (major units). */
  valueProtected: number;
  requiresApproval: true;
  executableNow: false;
};

export type MenuAvailabilityRisk = {
  id: string;
  trigger: MenuAvailabilityTrigger;
  ingredientName: string;
  headline: string;
  /** Human timing, e.g. may run out by 20:15 */
  runOutBy: string | null;
  portionsExpected: number;
  portionsAvailable: number;
  affected: AffectedMenuLine[];
  exposure: MenuRevenueExposure;
  options: MenuPreparedOption[];
  /** Only surface when financially material. */
  material: boolean;
  illustrative: boolean;
};
