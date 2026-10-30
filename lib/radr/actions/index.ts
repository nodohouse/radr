/**
 * Action Fabric — governed actions connected to Decisions.
 * Architecture only. No fake execution.
 */

export type ActionLevel =
  | "OBSERVE"
  | "RECOMMEND"
  | "PREPARE"
  | "EXECUTE_WITH_APPROVAL"
  | "EXECUTE_WITHIN_POLICY"
  | "VERIFY";

export type ActionDomain =
  | "WORKFORCE"
  | "RESERVATIONS"
  | "DELIVERY"
  | "PROCUREMENT"
  | "HOTEL"
  | "APARTMENTS"
  | "MENU"
  | "CHANNEL";

export type ActionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "EXECUTING"
  | "EXECUTED"
  | "FAILED"
  | "CANCELLED"
  | "VERIFIED";

export type RadrAction = {
  id: string;
  type: string;
  domain: ActionDomain;
  decisionId: string | null;
  targetSystem: string;
  parameters: Record<string, string | number | boolean>;
  requiresApproval: boolean;
  policy: string;
  level: ActionLevel;
  status: ActionStatus;
  requestedBy: string;
  executedBy: string | null;
  executedAt: string | null;
  result: string | null;
  auditReference: string | null;
};

/** Prepared actions for D-1911 — not written back. */
export function peakPreparedActions(): RadrAction[] {
  return [
    {
      id: "act_peak_hold",
      type: "hold_tables",
      domain: "RESERVATIONS",
      decisionId: "dec_peak_berlin",
      targetSystem: "table_management",
      parameters: { tables: 2, minutes: 12 },
      requiresApproval: true,
      policy: "Peak hold when kitchen ≥90% and inbound ≥30",
      level: "PREPARE",
      status: "PENDING_APPROVAL",
      requestedBy: "RADR",
      executedBy: null,
      executedAt: null,
      result: null,
      auditReference: null,
    },
    {
      id: "act_peak_throttle",
      type: "throttle_delivery",
      domain: "DELIVERY",
      decisionId: "dec_peak_berlin",
      targetSystem: "deliverect",
      parameters: { prepTimeDeltaMin: 8, pauseSlowItems: true },
      requiresApproval: true,
      policy: "Delivery throttle within operational policy",
      level: "PREPARE",
      status: "PENDING_APPROVAL",
      requestedBy: "RADR",
      executedBy: null,
      executedAt: null,
      result: null,
      auditReference: null,
    },
  ];
}
