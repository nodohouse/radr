import { hotelDecisionsWorkspace } from "./hotelData";
import { restaurantDecisionsWorkspace } from "./restaurantData";
import type { DecisionsWorkspaceModel } from "./types";
import {
  withCanonicalHotelRecords,
  withCanonicalRestaurantRecords,
} from "./withCanonicalRecords";

export type { DecisionsWorkspaceModel } from "./types";
export * from "./types";
export { HOTEL_FLAGSHIP_DECISION_ID } from "./hotelData";
export * from "./ledgerQuery";
export * from "./hotelActions";
export * from "./hotelCrossLinks";
export * from "./hotelPersonaLens";
export {
  detailFromRecord,
  judgmentRowFromRecord,
} from "./fromDecisionRecord";

export function getDecisionsWorkspace(
  industry: "restaurants" | "hotels" = "restaurants",
): DecisionsWorkspaceModel {
  if (industry === "hotels") {
    return withCanonicalHotelRecords(hotelDecisionsWorkspace);
  }
  return withCanonicalRestaurantRecords(restaurantDecisionsWorkspace);
}
