/**
 * MCP adapter — maps Tool Gateway to MCP-shaped descriptors.
 * Preview only. Does not host a production MCP server.
 */

import { listToolDescriptors } from "./registry";
import { invokeTool } from "./gateway";
import type { ToolCallContext } from "./contracts";
import { TOOL_GATEWAY_VERSION } from "./contracts";

export type McpToolDescriptor = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean; destructiveHint?: boolean };
};

export function listMcpTools(): McpToolDescriptor[] {
  return listToolDescriptors()
    .filter((t) => !t.gated)
    .map((t) => ({
      name: `radr.${t.name}`,
      description: `${t.description} [RADR Tool Gateway ${TOOL_GATEWAY_VERSION} · developer preview]`,
      inputSchema: t.inputSchema,
      annotations: { readOnlyHint: t.read, destructiveHint: !t.read },
    }));
}

export function listGatedMcpTools(): McpToolDescriptor[] {
  return listToolDescriptors()
    .filter((t) => t.gated)
    .map((t) => ({
      name: `radr.${t.name}`,
      description: `${t.description} [GATED · not enabled in preview]`,
      inputSchema: t.inputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true },
    }));
}

export function callMcpTool(
  name: string,
  args: Record<string, unknown> = {},
  ctx: ToolCallContext = {},
) {
  const tool = name.replace(/^radr\./, "");
  return invokeTool(tool, args, {
    ...ctx,
    enforceAuth: ctx.enforceAuth ?? true,
  });
}
