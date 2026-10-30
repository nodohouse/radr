/**
 * Tool descriptors for discovery (REST / MCP preview).
 */

import {
  GATED_TOOL_NAMES,
  READ_TOOL_NAMES,
  type GatedToolName,
  type GatewayToolName,
  type ToolDescriptor,
} from "./contracts";

const DESCRIPTIONS: Record<GatewayToolName | GatedToolName, string> = {
  get_group_pulse: "Group operating pulse: revenue/contribution tension, needs you, system proof.",
  get_location_status: "Location-day status timeline for restaurant, hotel, or apartments.",
  get_live_service: "Live service surface: pace, join story, money, stock, demand.",
  get_revenue_pace: "Revenue pace for restaurant, hotel, apartments, or group MTD.",
  get_money_flow: "Money in / reductions / contribution pace with evidence tags.",
  get_inventory_risk: "Stock watch and resource constraints.",
  get_decisions: "List Decisions by attention state and exposure.",
  get_decision: "Single Decision object with recommendation and economics.",
  get_decision_trace: "Evidence → action → verification path for a Decision.",
  get_futures: "Futures for a Decision.",
  get_verified_value: "Verified Value aggregate from Decision ledger (SoT).",
  get_data_health: "Integration / source health for the role.",
  get_operating_memory: "Operating Memory compounding for Berlin peak capacity.",
  explain_variance: "Contribution bridge / variance drivers vs plan.",
  approve_decision: "Approve a Decision (gated).",
  prepare_supplier_dispute: "Prepare supplier dispute payload (gated).",
  release_inventory: "Release inventory hold (gated).",
  adjust_channel_availability: "Adjust channel availability (gated).",
  prepare_shift_change: "Prepare shift change (gated).",
  send_operator_message: "Send operator message (gated).",
};

function schemaFor(name: GatewayToolName | GatedToolName): Record<string, unknown> {
  const base = {
    type: "object",
    properties: {
      role: { type: "string" },
      locationId: { type: "string" },
      period: { type: "string", enum: ["live", "today", "wtd", "mtd", "ytd"] },
    },
  };
  if (name === "get_decision" || name === "get_decision_trace" || name === "get_futures") {
    return {
      ...base,
      properties: {
        ...base.properties,
        id: { type: "string", description: "Decision id or display id (e.g. D-4102)" },
      },
      required: ["id"],
    };
  }
  if (name === "get_decisions") {
    return {
      ...base,
      properties: {
        ...base.properties,
        state: { type: "string", enum: ["needs_you", "handling", "verified", "all"] },
        min_exposure: { type: "number" },
      },
    };
  }
  if (name === "get_money_flow" || name === "get_revenue_pace") {
    return {
      ...base,
      properties: {
        ...base.properties,
        vertical: {
          type: "string",
          enum: ["restaurant", "hotel", "apartment", "group"],
        },
      },
    };
  }
  return base;
}

export function listToolDescriptors(): ToolDescriptor[] {
  return [
    ...READ_TOOL_NAMES.map((name) => ({
      name,
      description: DESCRIPTIONS[name],
      read: true,
      gated: false,
      inputSchema: schemaFor(name),
    })),
    ...GATED_TOOL_NAMES.map((name) => ({
      name,
      description: DESCRIPTIONS[name],
      read: false,
      gated: true,
      inputSchema: schemaFor(name),
    })),
  ];
}
