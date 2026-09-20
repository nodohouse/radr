/**
 * Ask RADR API - server-side tool orchestration (+ optional LLM).
 *
 * Authorization rules:
 * - LIVE: session required. Resolve real org membership + org location IDs.
 * Client role/scope claims are ignored. allowedLocationIds is never `"all"`
 * until location RBAC exists.
 * - DEMO/SANDBOX: public demo allowed but throttled; anonymous callers are
 * capped to location_manager + a single demo location (not group CFO).
 * - LLM never decides tenant; tools use server-built auth only.
 * - OPENAI_API_KEY stays server-side only.
 */

import { NextResponse } from "next/server";
import {
  getPrimaryOrganizationForUser,
  getSessionOrNull,
  listLocationIdsForOrganization,
} from "@/lib/authz";
import { askRequestSchema, orchestrateAsk } from "@/lib/ai";
import { buildAskSecureAuth } from "@/lib/ai/askTenant";
import { getRadrEnvironment } from "@/lib/radr/env";
import {
  CLIENT_ERRORS,
  correlationId,
  logServerError,
} from "@/lib/security/errors";
import {
  clientKeyFromRequest,
  rateLimit,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = rateLimit({
    key: clientKeyFromRequest(req, "ask-radr"),
    limit: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: CLIENT_ERRORS.rateLimited },
      {
        status: 429,
        headers: { "Retry-After": String(rl.retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: CLIENT_ERRORS.badRequest }, { status: 400 });
  }

  const parsed = askRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: CLIENT_ERRORS.badRequest }, { status: 400 });
  }

  const session = await getSessionOrNull();
  const env = getRadrEnvironment();
  const data = parsed.data;

  let organizationId: string | null = null;
  let orgLocationIds: string[] = [];

  if (env === "LIVE") {
    if (!session) {
      return NextResponse.json(
        { error: CLIENT_ERRORS.unauthorized },
        { status: 401 },
      );
    }
    const primary = await getPrimaryOrganizationForUser(session.user.id);
    if (!primary) {
      return NextResponse.json(
        { error: "No organization membership for this account." },
        { status: 403 },
      );
    }
    organizationId = primary.organization.id;
    orgLocationIds = await listLocationIdsForOrganization(organizationId);
  }

  const resolved = buildAskSecureAuth({
    env,
    sessionUserId: session?.user.id ?? null,
    organizationId,
    orgLocationIds,
    requestedLocationScope: data.locationScope,
  });

  if (!resolved.ok) {
    return NextResponse.json(
      { error: resolved.error },
      { status: resolved.status },
    );
  }

  const secured = {
    ...data,
    role: resolved.role,
    allowedLocationIds: resolved.allowedLocationIds,
    locationScope: resolved.locationScope,
    organizationId: resolved.organizationId,
    userId: resolved.userId,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, payload: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`),
        );
      };

      try {
        send("status", {
          phase: "analyzing",
          location: secured.locationScope,
          message: "Resolving context",
        });

        const result = await orchestrateAsk(secured);

        for (const step of result.analyzing) {
          send("analyzing", step);
        }

        send("result", {
          mode: result.mode,
          configured: result.configured,
          toolsCalled: result.toolsCalled,
          response: result.response,
          session: result.session,
        });
        send("done", { ok: true });
      } catch (e) {
        const id = logServerError("ask-radr", e, correlationId());
        send("error", {
          message: CLIENT_ERRORS.generic,
          correlationId: id,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
