import type { CfoControlCenterModel, CfoIndustry } from "./types";
import { restaurantCfoCenter } from "./restaurantData";
import { hotelCfoCenter } from "./hotelData";

export type {
  CfoControlCenterModel,
  CfoIndustry,
  DriverId,
  BridgeStep,
  PortfolioRow,
} from "./types";
export { restaurantCfoCenter } from "./restaurantData";
export { hotelCfoCenter } from "./hotelData";

export function parseCfoIndustry(
  value: string | null | undefined,
): CfoIndustry {
  if (value === "hotels" || value === "hotel") return "hotels";
  return "restaurants";
}

export function getCfoControlCenter(
  industry: CfoIndustry,
): CfoControlCenterModel {
  return industry === "hotels" ? hotelCfoCenter : restaurantCfoCenter;
}

export function listPhrase(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function composeHeroBody(
  hero: CfoControlCenterModel["hero"],
): string {
  const entities = listPhrase(hero.focusEntities);
  const drivers = listPhrase(hero.drivers);
  return `${entities} drive a ${hero.gapAmount} ${hero.gapNoun}. Primary drivers: ${drivers}. ${hero.radrStatus}`;
}
