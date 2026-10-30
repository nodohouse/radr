/**
 * Tool Gateway REST preview — same contracts as MCP / Ask / UI.
 * Not production enterprise OAuth. Demo-safe.
 */

import { NextResponse } from "next/server";
import {
  invokeTool,
  listGatewayTools,
  TOOL_GATEWAY_VERSION,
} from "@/lib/radr/tools";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  if (name === "_list" || name === "list") {
    return NextResponse.json({
      preview: true,
      version: TOOL_GATEWAY_VERSION,
      label: "COMING TO DEVELOPER PREVIEW",
      tools: listGatewayTools().map((t) => ({
        name: t.name,
        description: t.description,
        read: t.read,
        gated: t.gated,
      })),
    });
  }

  const url = new URL(_req.url);
  const args: Record<string, unknown> = {};
  url.searchParams.forEach((v, k) => {
    if (k === "min_exposure") args[k] = Number(v);
    else args[k] = v;
  });

  const result = invokeTool(name, args, {
    role: typeof args.role === "string" ? args.role : "cfo",
    locationScope:
      typeof args.locationId === "string" ? args.locationId : "all",
    enforceAuth: false,
    organizationId: "org_northstar",
    userId: "demo_preview",
  });

  return NextResponse.json({
    ...result,
    preview: true,
    label: "COMING TO DEVELOPER PREVIEW",
  });
}

export async function POST(req: Request, ctx: Ctx) {
  const { name } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const result = invokeTool(name, body, {
    role: typeof body.role === "string" ? body.role : "cfo",
    locationScope:
      typeof body.locationId === "string" ? body.locationId : "all",
    enforceAuth: false,
    organizationId: "org_northstar",
    userId: "demo_preview",
  });
  return NextResponse.json({
    ...result,
    preview: true,
    label: "COMING TO DEVELOPER PREVIEW",
  });
}
