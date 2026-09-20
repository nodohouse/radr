/**
 * Exposure math - never equate gross exposed with expected loss.
 */

import { estimateContribution } from "@/lib/radr/findingIntelligence";
import type {
  AffectedMenuLine,
  ExpectedSubstitution,
  ForecastDemand,
  Ingredient,
  InventoryPosition,
  MenuAvailabilityRisk,
  MenuAvailabilityTrigger,
  MenuItem,
  MenuPreparedOption,
  MenuRevenueExposure,
  Recipe,
  SupplierOption,
} from "./types";

/** Default materiality: contribution at risk ≥ this €. */
export const MENU_RISK_MATERIALITY_EUR = 250;

export type GraphInput = {
  trigger: MenuAvailabilityTrigger;
  ingredient: Ingredient;
  recipes: Recipe[];
  menuItems: MenuItem[];
  inventory: InventoryPosition;
  forecasts: ForecastDemand[];
  substitutions: ExpectedSubstitution[];
  suppliers: SupplierOption[];
  /** Optional clock label for run-out estimate. */
  runOutBy?: string | null;
  illustrative?: boolean;
};

function lineExposure(line: AffectedMenuLine): {
  gross: number;
  expectedLoss: number;
  contribution: number;
} {
  const gross = line.shortfallPortions * line.menuPrice;
  // Guests who substitute recover substituteTicketRatio of the ticket;
  // remainder is expected revenue loss.
  const retained =
    line.shortfallPortions *
    line.menuPrice *
    line.substituteRate *
    line.substituteTicketRatio;
  const expectedLoss = Math.max(0, gross - retained);
  const contribution = estimateContribution(
    expectedLoss,
    line.contributionRate,
  );
  return { gross, expectedLoss, contribution };
}

export function computeRevenueExposure(
  lines: AffectedMenuLine[],
): MenuRevenueExposure {
  let grossRevenueAtRisk = 0;
  let expectedRevenueLoss = 0;
  let contributionAtRisk = 0;
  for (const line of lines) {
    const x = lineExposure(line);
    grossRevenueAtRisk += x.gross;
    expectedRevenueLoss += x.expectedLoss;
    contributionAtRisk += x.contribution;
  }
  const avgSub =
    lines.length === 0
      ? 0
      : lines.reduce((s, l) => s + l.substituteRate, 0) / lines.length;

  let confidence: MenuRevenueExposure["confidence"] = "MEDIUM";
  let confidenceNote =
    "Expected loss adjusts for historical substitution; not missing portions × menu price.";
  if (avgSub >= 0.35 && lines.every((l) => l.substituteRate > 0)) {
    confidence = "HIGH";
    confidenceNote =
      "Substitution rates drawn from comparable services at this location.";
  } else if (avgSub < 0.1) {
    confidence = "LOW";
    confidenceNote =
      "Limited substitution history - expected loss closer to gross exposure.";
  }

  return {
    grossRevenueAtRisk: Math.round(grossRevenueAtRisk),
    expectedRevenueLoss: Math.round(expectedRevenueLoss),
    contributionAtRisk: Math.round(contributionAtRisk),
    confidence,
    confidenceNote,
  };
}

function buildAffected(
  input: GraphInput,
): AffectedMenuLine[] {
  const recipeIds = new Set(
    input.recipes
      .filter((r) => r.ingredientId === input.ingredient.id)
      .map((r) => r.id),
  );
  const recipeById = new Map(input.recipes.map((r) => [r.id, r]));
  const subByItem = new Map(
    input.substitutions.map((s) => [s.menuItemId, s]),
  );
  const forecastByItem = new Map(
    input.forecasts.map((f) => [f.menuItemId, f]),
  );

  const items = input.menuItems.filter(
    (m) =>
      m.locationId === input.trigger.locationId && recipeIds.has(m.recipeId),
  );

  // Portions possible from on-hand, allocated by expected demand share
  const totalExpected = items.reduce((s, m) => {
    return s + (forecastByItem.get(m.id)?.expectedPortions ?? 0);
  }, 0);

  return items.map((m) => {
    const recipe = recipeById.get(m.recipeId)!;
    const expected = forecastByItem.get(m.id)?.expectedPortions ?? 0;
    const share = totalExpected > 0 ? expected / totalExpected : 1 / items.length;
    const unitsAvailableForItem = input.inventory.onHand * share;
    const portionsPossible = Math.floor(
      unitsAvailableForItem / recipe.unitsPerPortion,
    );
    const shortfall = Math.max(0, expected - portionsPossible);
    const sub = subByItem.get(m.id);
    return {
      menuItemId: m.id,
      menuItemName: m.name,
      expectedPortions: expected,
      portionsPossible,
      shortfallPortions: shortfall,
      menuPrice: m.menuPrice,
      contributionRate: m.contributionRate,
      substituteRate: sub?.substituteRate ?? 0.15,
      substituteTicketRatio: sub?.substituteTicketRatio ?? 0.7,
    };
  });
}

function buildOptions(
  input: GraphInput,
  exposure: MenuRevenueExposure,
  lines: AffectedMenuLine[],
): MenuPreparedOption[] {
  const options: MenuPreparedOption[] = [];
  const shortfall = lines.reduce((s, l) => s + l.shortfallPortions, 0);
  const avgContrib =
    lines.length === 0
      ? 0.6
      : lines.reduce((s, l) => s + l.contributionRate, 0) / lines.length;
  /** Upside if shortfall is fully restored (contribution on gross path). */
  const fullProtect = estimateContribution(
    exposure.grossRevenueAtRisk,
    avgContrib,
  );

  const backup = input.suppliers.find(
    (s) =>
      s.ingredientId === input.ingredient.id &&
      s.approved &&
      s.availableQty > 0,
  );
  if (backup) {
    const unitsPer = input.recipes.find(
      (r) => r.ingredientId === input.ingredient.id,
    )?.unitsPerPortion ?? 0.12;
    const portionsRecoverable = Math.floor(backup.availableQty / unitsPer);
    const share = Math.min(1, portionsRecoverable / Math.max(1, shortfall));
    options.push({
      id: "opt_backup_supplier",
      title: `Source ${backup.availableQty}${input.ingredient.unit} from ${backup.name}`,
      detail: `Approved backup · ~${backup.leadMinutes} min lead · requires approval before order.`,
      kind: "ALTERNATE_SUPPLIER",
      valueProtected: Math.round(fullProtect * share),
      requiresApproval: true,
      executableNow: false,
    });
  }

  const subFriendly = lines.filter((l) => l.substituteRate >= 0.2);
  if (subFriendly.length > 0) {
    options.push({
      id: "opt_substitute",
      title: `Substitute yellowfin on ${subFriendly.length} dish${subFriendly.length === 1 ? "" : "es"}`,
      detail:
        "Protects contribution via known guest substitution - menu change needs approval.",
      kind: "SUBSTITUTE_INGREDIENT",
      // Substitution protects less than full restore; above expected-loss floor.
      valueProtected: Math.round(
        Math.max(exposure.contributionAtRisk * 0.85, fullProtect * 0.55),
      ),
      requiresApproval: true,
      executableNow: false,
    });
  }

  options.push({
    id: "opt_notify",
    title: "Notify kitchen and GM",
    detail: "Surface run-out timing and remaining portions - no menu change yet.",
    kind: "NOTIFY",
    valueProtected: 0,
    requiresApproval: true,
    executableNow: false,
  });

  return options
    .filter((o) => o.kind === "NOTIFY" || o.valueProtected > 0)
    .sort((a, b) => b.valueProtected - a.valueProtected)
    .slice(0, 3);
}

export function recomputeMenuAvailabilityRisk(
  input: GraphInput,
  materialityEur = MENU_RISK_MATERIALITY_EUR,
): MenuAvailabilityRisk {
  const affected = buildAffected(input);
  const portionsExpected = affected.reduce(
    (s, l) => s + l.expectedPortions,
    0,
  );
  const portionsAvailable = affected.reduce(
    (s, l) => s + l.portionsPossible,
    0,
  );
  const exposure = computeRevenueExposure(affected);
  const options = buildOptions(input, exposure, affected);
  const material =
    exposure.contributionAtRisk >= materialityEur &&
    portionsExpected > portionsAvailable;

  const headline =
    input.runOutBy != null
      ? `${input.ingredient.name} may run out by ${input.runOutBy}.`
      : `${input.ingredient.name} cannot cover expected demand.`;

  return {
    id: `menu_risk_${input.trigger.id}`,
    trigger: input.trigger,
    ingredientName: input.ingredient.name,
    headline,
    runOutBy: input.runOutBy ?? null,
    portionsExpected,
    portionsAvailable,
    affected,
    exposure,
    options: options.filter((o) => o.kind !== "NOTIFY" || options.length === 1),
    material,
    illustrative: input.illustrative ?? true,
  };
}
