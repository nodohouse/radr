/**
 * Tool Gateway contracts — stable envelopes for UI · Ask · REST · MCP.
 * Economic amounts come only from domain selectors. No invented euros.
 */

export const TOOL_GATEWAY_VERSION = "2026.09.preview";

export type ToolEvidenceState =
  | "OBSERVED"
  | "MODELED"
  | "ACCRUED"
  | "SETTLED"
  | "MIXED"
  | "UNKNOWN";

export type ToolPeriod = "live" | "today" | "wtd" | "mtd" | "ytd" | "custom";

export type GatewayToolName =
  | "get_group_pulse"
  | "get_location_status"
  | "get_live_service"
  | "get_revenue_pace"
  | "get_money_flow"
  | "get_inventory_risk"
  | "get_decisions"
  | "get_decision"
  | "get_decision_trace"
  | "get_futures"
  | "get_verified_value"
  | "get_data_health"
  | "get_operating_memory"
  | "explain_variance";

/** Write-path stubs — not executable in this preview. */
export type GatedToolName =
  | "approve_decision"
  | "prepare_supplier_dispute"
  | "release_inventory"
  | "adjust_channel_availability"
  | "prepare_shift_change"
  | "send_operator_message";

export type ToolProvenanceRef = {
  source: string;
  method: string;
  freshness?: string;
  grade?: ToolEvidenceState;
};

export type ToolCallContext = {
  organizationId?: string;
  userId?: string;
  role?: string;
  locationScope?: string;
  period?: ToolPeriod;
  /** When false, skip RBAC (trusted internal UI/demo compose). Default true for API/MCP. */
  enforceAuth?: boolean;
  requestId?: string;
};

export type ToolEnvelope<T = unknown> = {
  tool: GatewayToolName | GatedToolName;
  version: string;
  tenantScope: string;
  locationScope: string;
  period: ToolPeriod;
  evidenceState: ToolEvidenceState;
  provenance: ToolProvenanceRef[];
  data: T | null;
  error: string | null;
  gated?: boolean;
  requestId: string;
  latencyMs: number;
};

export type ToolDescriptor = {
  name: GatewayToolName | GatedToolName;
  description: string;
  read: boolean;
  gated: boolean;
  inputSchema: Record<string, unknown>;
};

export const READ_TOOL_NAMES: GatewayToolName[] = [
  "get_group_pulse",
  "get_location_status",
  "get_live_service",
  "get_revenue_pace",
  "get_money_flow",
  "get_inventory_risk",
  "get_decisions",
  "get_decision",
  "get_decision_trace",
  "get_futures",
  "get_verified_value",
  "get_data_health",
  "get_operating_memory",
  "explain_variance",
];

export const GATED_TOOL_NAMES: GatedToolName[] = [
  "approve_decision",
  "prepare_supplier_dispute",
  "release_inventory",
  "adjust_channel_availability",
  "prepare_shift_change",
  "send_operator_message",
];
