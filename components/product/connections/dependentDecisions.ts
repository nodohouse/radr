/**
 * Decisions that lean on a connected system (presentation mapping for Connections).
 * Unhealthy sources reuse Data Health's canonical links; healthy ones list the
 * demo Decisions their evidence class feeds.
 */

import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import { HOTEL_DECISION_IDS } from "@/lib/radr/demo/hotelDecisions";

export type DependentDecision = { id: string; label: string };

const d = (id: string): DependentDecision => ({ id, label: displayDecisionId(id) });

const BY_SOURCE: Record<string, DependentDecision[]> = {
  lightspeed: [d(DECISION_IDS.peak), d(DECISION_IDS.menuPeak)],
  sevenrooms: [d(DECISION_IDS.peak), d("dec_table_recover_berlin")],
  opentable: [d(DECISION_IDS.peak)],
  "toast-kds": [d(DECISION_IDS.peak)],
  stripe: [d(DECISION_IDS.settlement), d(DECISION_IDS.supplier)],
  deliverect: [d(DECISION_IDS.peak), d(DECISION_IDS.menuPeak)],
  xero: [d(DECISION_IDS.supplier)],
  weather: [d(DECISION_IDS.rain)],
  mews: [d(HOTEL_DECISION_IDS.readiness), d(HOTEL_DECISION_IDS.channel)],
};

export function dependentDecisionsFor(sourceId: string): DependentDecision[] {
  return BY_SOURCE[sourceId] ?? [];
}
