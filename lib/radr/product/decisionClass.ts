/**
 * Customer-facing Decision classes — not internal BUY/SELL/LABOR/RECOVER.
 * Display as human title case — never SCREAMING taxonomy.
 */

import type { DecisionRecord } from "@/lib/radr/decision/record";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

export type CustomerDecisionClass =
  | "Service capacity"
  | "Menu economics"
  | "Supplier / AP"
  | "Cancellation recovery"
  | "Perishable revenue"
  | "Procurement"
  | "Reconciliation"
  | "Channel hold"
  | "Operating pattern"
  | "Decision";

const BY_ID: Partial<Record<string, CustomerDecisionClass>> = {
  [DECISION_IDS.peak]: "Service capacity",
  [DECISION_IDS.marginCoke]: "Menu economics",
  [DECISION_IDS.supplier]: "Supplier / AP",
  [DECISION_IDS.tableRecover]: "Cancellation recovery",
  [DECISION_IDS.ota]: "Channel hold",
  [DECISION_IDS.orphan]: "Perishable revenue",
  [DECISION_IDS.tuna]: "Procurement",
  [DECISION_IDS.playbook]: "Operating pattern",
  [DECISION_IDS.menuPeak]: "Menu economics",
  [DECISION_IDS.socialDemand]: "Operating pattern",
  [DECISION_IDS.guestVoice]: "Operating pattern",
};

export function customerDecisionClass(
  r: Pick<DecisionRecord, "id" | "decisionType" | "territories">,
): CustomerDecisionClass {
  const byId = BY_ID[r.id];
  if (byId) return byId;
  const t = (r.decisionType ?? "").toLowerCase();
  if (t.includes("supplier") || t.includes("invoice")) return "Supplier / AP";
  if (t.includes("margin") || t.includes("menu")) return "Menu economics";
  if (t.includes("cancel") || t.includes("recover"))
    return "Cancellation recovery";
  if (t.includes("orphan") || t.includes("perish")) return "Perishable revenue";
  if (t.includes("reconcil") || t.includes("settlement"))
    return "Reconciliation";
  if (t.includes("peak") || t.includes("capacity") || t.includes("service"))
    return "Service capacity";
  return "Decision";
}
