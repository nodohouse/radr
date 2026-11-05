/**
 * Tool Gateway REST preview — same contracts as MCP / Ask / UI.
 * Not production enterprise OAuth. Demo-safe.
 */

import { NextResponse } from "next/server";
import {
  readJsonWithinLimit,
  RequestBodyError,
} from "@/lib/security/request-body";
import { getRadrEnvironment } from "@/lib/radr/env";
import { sameOriginMutation } from "@/lib/onboarding/requiredFields";
import { clientKeyFromRequest, rateLimit } from "@/lib/security/rate-limit";

function previewGuard(request: Request) {
  if (getRadrEnvironment() !== "DEMO")
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const limit = rateLimit({
    key: clientKeyFromRequest(request, "tool-preview"),
    limit: 30,
    windowMs: 60000,
  });
  if (!limit.ok)
    return NextResponse.json(
      { error: "Too many requests." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } },
    );
  return null;
}
import {
  invokeTool,
  listGatewayTools,
  TOOL_GATEWAY_VERSION,
} from "@/lib/radr/tools";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ name: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const denied = previewGuard(_req);
  if (denied) return denied;
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
  if (!sameOriginMutation(req))
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  const denied = previewGuard(req);
  if (denied) return denied;
  const { name } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    const parsed = await readJsonWithinLimit(req, 16000);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    body = parsed as Record<string, unknown>;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof RequestBodyError
            ? error.message
            : "Invalid request.",
      },
      { status: error instanceof RequestBodyError ? error.status : 400 },
    );
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
