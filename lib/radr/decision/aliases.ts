/**
 * Decision ID aliases — near-miss / legacy seed IDs → canonical Record IDs.
 * One object everywhere. Prefer DECISION_IDS / HOTEL_DECISION_IDS at call sites.
 */

import { DECISION_IDS } from "./ids";

/**
 * Map non-canonical IDs onto Decision Record store keys.
 * Keep this list small; retire aliases by rewriting fixtures.
 */
export const DECISION_ID_ALIASES: Record<string, string> = {
  /** Legacy hotel channel seed → D-2201 OTA Record */
  dec_hotel_channel_canal: DECISION_IDS.ota,
  /** Workspace near-miss → same Record */
  dec_hotel_ota_close_canal: DECISION_IDS.ota,
  /** Short form used in demand intel */
  dec_hotel_ota: DECISION_IDS.ota,
  /** Restaurant workspace legacy labor row */
  dec_labor_schedule: DECISION_IDS.labor,
  /** Restaurant workspace capacity filler → peak flagship */
  dec_service_capacity: DECISION_IDS.peak,
};

/** Resolve any Decision id (alias or canonical) to the Record store key. */
export function resolveCanonicalDecisionId(id: string): string {
  return DECISION_ID_ALIASES[id] ?? id;
}

/** True when `id` is an alias (not the canonical Record key). */
export function isDecisionIdAlias(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(DECISION_ID_ALIASES, id);
}
