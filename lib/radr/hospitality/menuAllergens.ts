/**
 * Demo menu allergen graph - Berlin Mitte.
 * Containment is fixture-verified; never invent "safe".
 */

import type { AllergenCode, MenuAllergenLine } from "./types";

const PEANUT_MENU: MenuAllergenLine[] = [
  {
    menuItemId: "mi_satay",
    name: "Satay Chicken",
    containment: "CONTAINS",
    detail: "Peanut sauce",
  },
  {
    menuItemId: "mi_peanut_noodles",
    name: "Peanut Noodles",
    containment: "CONTAINS",
    detail: "Peanut dressing",
  },
  {
    menuItemId: "mi_dessert_x",
    name: "Sesame Caramel Tart",
    containment: "CONTAINS",
    detail: "Peanut brittle garnish",
  },
  {
    menuItemId: "mi_crispy_rice",
    name: "Crispy Rice",
    containment: "POSSIBLE_CROSS_CONTACT",
    detail: "Shared fryer with peanut items",
  },
  {
    menuItemId: "mi_salad",
    name: "House Green Salad",
    containment: "POSSIBLE_CROSS_CONTACT",
    detail: "Prep board shared with satay mise",
  },
  {
    menuItemId: "mi_tataki",
    name: "Tuna Tataki",
    containment: "NO_IDENTIFIED_INGREDIENT",
    detail: "No identified peanut ingredient in current menu data · confirm with kitchen",
  },
  {
    menuItemId: "mi_wagyu",
    name: "Wagyu Don",
    containment: "NO_IDENTIFIED_INGREDIENT",
    detail: "No identified peanut ingredient in current menu data · confirm with kitchen",
  },
];

const SHELLFISH_MENU: MenuAllergenLine[] = [
  {
    menuItemId: "mi_nigiri",
    name: "Bluefin Nigiri",
    containment: "CONTAINS",
    detail: "Fish - shellfish-adjacent service; restaurant treats as seafood risk zone",
  },
  {
    menuItemId: "mi_prawn",
    name: "Prawn Tempura",
    containment: "CONTAINS",
    detail: "Shellfish",
  },
  {
    menuItemId: "mi_crab",
    name: "Soft-Shell Crab",
    containment: "CONTAINS",
    detail: "Shellfish",
  },
  {
    menuItemId: "mi_miso",
    name: "Miso Black Cod",
    containment: "POSSIBLE_CROSS_CONTACT",
    detail: "Shared seafood prep",
  },
  {
    menuItemId: "mi_fries",
    name: "Truffle Fries",
    containment: "POSSIBLE_CROSS_CONTACT",
    detail: "Shared fryer with prawn tempura",
  },
];

export function menuLinesForAllergen(allergen: AllergenCode): MenuAllergenLine[] {
  switch (allergen) {
    case "peanut":
    case "tree_nut":
      return PEANUT_MENU;
    case "shellfish":
      return SHELLFISH_MENU;
    default:
      return [];
  }
}

export function countContainment(
  allergen: AllergenCode,
): { contains: number; crossContact: number } {
  const lines = menuLinesForAllergen(allergen);
  return {
    contains: lines.filter((l) => l.containment === "CONTAINS").length,
    crossContact: lines.filter((l) => l.containment === "POSSIBLE_CROSS_CONTACT")
      .length,
  };
}
