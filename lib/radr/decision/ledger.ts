/**
 * Decision Ledger — chronological decision history, not a generic audit dump.
 */

import type { DecisionLifecycleStatus } from "./lifecycle";

export type DecisionLedgerKind =
  | "signal"
  | "understand"
  | "predict"
  | "simulate"
  | "recommend"
  | "approve"
  | "act"
  | "observe"
  | "verify"
  | "learn"
  | "playbook"
  | "note";

export type DecisionLedgerEvent = {
  id: string;
  at: string; // ISO or display time HH:mm for demos
  kind: DecisionLedgerKind;
  title: string;
  detail?: string;
  amountEuro?: number;
  statusAfter?: DecisionLifecycleStatus;
};

export function sortLedger(
  events: DecisionLedgerEvent[],
): DecisionLedgerEvent[] {
  return [...events].sort((a, b) => a.at.localeCompare(b.at));
}
