/**
 * Ask RADR orchestrator - intent/tools/compose (+ optional LLM tool selection).
 */

import type { ButlerContext, ButlerSession } from "@/lib/radr/butler/types";
import {
  askRequestSchema,
  emptySession,
  type AskAnalyzingStep,
  type AskRequest,
  type AskResult,
} from "./answerSchema";
import { resolveAskContext } from "./context";
import { composeAskAnswer, nextAskSession } from "./compose";
import { planAsk, planFromClassification } from "./planner";
import { getLlmConfig, llmClassifyIntent, llmPlanTools } from "./provider";
import { buildAskSystemPrompt } from "./systemPrompt";
import {
  ASK_TOOL_DEFS,
  authFromButlerContext,
  executeAskTool,
  type AskToolName,
  type ToolResult,
} from "./tools";

function analyzingFrom(
  labels: { id: string; label: string }[],
  done: boolean,
): AskAnalyzingStep[] {
  return labels.map((l) => ({
    id: l.id,
    label: l.label,
    status: done ? "done" : "pending",
  }));
}

function unconfiguredResponse(suggestions = true) {
  return {
    title: "AI analysis isn't configured",
    summary:
      "Ask RADR LLM mode needs OPENAI_API_KEY on the server. Demo tool analysis still answers operational questions from RADR demo data.",
    answer:
      "AI analysis isn't configured in this environment. Tool-grounded demo analysis remains available for operational questions.",
    actions: [
      { label: "Control Center", href: "/app" },
      { label: "View findings", href: "/app/findings" },
    ],
    evidence: suggestions
      ? [
          { label: "Try", value: "What needs my attention?" },
          { label: "Try", value: "What's tonight looking like?" },
          { label: "Try", value: "How many people are on the waitlist?" },
        ]
      : [],
    sources: [
      {
        system: "RADR",
        detail: "Configure OPENAI_API_KEY for generative tool selection",
      },
    ],
    warnings: [
      {
        message: "LLM provider not configured. Using deterministic tool planner.",
        severity: "info" as const,
      },
    ],
    followUps: [
      "What needs my attention?",
      "What's tonight looking like?",
      "Are we understaffed tonight?",
    ],
    toolUsed: "searchEntities",
    topic: "general" as const,
  };
}

export async function orchestrateAsk(
  raw: AskRequest,
): Promise<AskResult> {
  const req = askRequestSchema.parse(raw);
  const session = (req.session as ButlerSession | undefined) ?? emptySession();
  let ctx = resolveAskContext(req.question, req, session);
  const auth = authFromButlerContext({
    locationScope: req.locationScope,
    period: req.period,
    role: req.role,
    allowedLocationIds: req.allowedLocationIds,
    organizationId: req.organizationId,
    userId: req.userId,
    page: req.page,
    selectedEntityId: req.selectedEntityId,
    selectedEntityLabel: req.selectedEntityLabel,
  });

  const llm = getLlmConfig();
  let plan = planAsk(req.question, ctx, session);

  // Optional LLM understanding - overrides weak / clarify classifications only.
  // Numbers still come exclusively from tools.
  if (llm.configured) {
    const llmIntent = await llmClassifyIntent(
      req.question,
      `${ctx.locationName} · ${ctx.periodLabel}`,
    );
    if (
      llmIntent &&
      llmIntent.intent !== "CLARIFY" &&
      (plan.intent === "CLARIFY" ||
        llmIntent.confidence >= plan.classification.confidence + 0.05)
    ) {
      plan = planFromClassification(
        {
          intent: llmIntent.intent,
          confidence: llmIntent.confidence,
          reason: "llm_classify",
        },
        ctx,
      );
    }
  }

  // Default compare pairs when the question names a fleet but not both IDs
  if (plan.intent === "LOCATION_COMPARISON" && !ctx.compareWith) {
    if (/west village/i.test(req.question)) {
      ctx = {
        ...ctx,
        locationId: "loc_nyc_wvill",
        compareWith: "loc_nyc",
        locationIds: ["loc_nyc_wvill", "loc_nyc"],
        locationName: "New York West Village",
      };
    } else if (/new york|nyc/i.test(req.question)) {
      ctx = {
        ...ctx,
        locationId: "loc_nyc",
        compareWith: "loc_nyc_wvill",
        locationIds: ["loc_nyc", "loc_nyc_wvill"],
        locationName: "New York Flatiron",
      };
    }
  }

  let toolNames: AskToolName[] = plan.tools;
  let mode: AskResult["mode"] = "tools";

  if (llm.configured) {
    const llmPlan = await llmPlanTools(
      buildAskSystemPrompt(ctx),
      req.question,
      [...ASK_TOOL_DEFS],
    );
    if (llmPlan?.toolNames?.length) {
      const allowed = new Set(ASK_TOOL_DEFS.map((t) => t.name));
      if (
        plan.intent !== "CONTROL_CENTER_SUMMARY" &&
        plan.intent !== "DATA_PROVENANCE"
      ) {
        allowed.delete("get_findings");
        allowed.delete("get_group_summary");
        allowed.delete("get_location_summary");
      }
      const picked = llmPlan.toolNames.filter((n): n is AskToolName =>
        allowed.has(n as AskToolName),
      );
      if (picked.length) {
        toolNames = Array.from(new Set([...plan.tools, ...picked]));
        mode = "llm";
      }
    }
  }

  if (process.env.RADR_DEBUG_BUTLER === "1") {
    console.info("[BUTLER QUERY PLAN]", JSON.stringify(plan.queryPlan));
  }

  // Slash / navigation commands stay local
  if (req.question.trim().startsWith("/")) {
    const response = {
      title: "Commands",
      summary: "Type a question, or use suggested prompts.",
      answer: "Commands",
      actions: [
        { label: "Overview", href: "/app" },
        { label: "Service", href: "/app/service" },
        { label: "Findings", href: "/app/findings" },
      ],
      evidence: [],
      toolUsed: "searchEntities",
      topic: "command" as const,
    };
    return {
      mode: llm.configured ? "llm" : "tools",
      response,
      session: nextAskSession(session, req.question, response, ctx),
      analyzing: [],
      toolsCalled: [],
      configured: llm.configured,
    };
  }

  const results: ToolResult[] = toolNames.map((name) =>
    executeAskTool(name, auth, ctx, {
      locationId: ctx.locationId,
      a: ctx.locationIds[0],
      b: ctx.compareWith ?? ctx.locationIds[1],
    }),
  );

  let response = composeAskAnswer(
    plan.intent,
    ctx,
    results,
    req.question,
    plan.classification,
  );

  // Truly unknown / clarify without LLM
  if (plan.intent === "CLARIFY" && !llm.configured) {
    mode = "tools";
  }

  if (
    plan.intent === "FOLLOW_UP" &&
    !llm.configured &&
    response.toolUsed === "searchEntities"
  ) {
    response = {
      ...unconfiguredResponse(),
      summary:
        "I couldn't map that follow-up. Ask about staffing, reservations, margin, or attention.",
      answer: "Clarify the subject of your follow-up.",
    };
    mode = "unconfigured";
  }

  const next = nextAskSession(session, req.question, response, ctx);

  return {
    mode,
    response,
    session: next,
    analyzing: analyzingFrom(plan.analyzing, true),
    toolsCalled: toolNames,
    configured: llm.configured,
  };
}

/** Sync path for tests + client fallback: tools planner only. */
export function orchestrateAskSync(
  question: string,
  butlerCtx: ButlerContext,
  session?: ButlerSession,
): AskResult {
  const req: AskRequest = {
    question,
    locationScope: butlerCtx.locationScope,
    period: butlerCtx.period,
    page: butlerCtx.page,
    role: butlerCtx.role,
    allowedLocationIds: butlerCtx.allowedLocationIds,
    session,
    selectedEntityId: butlerCtx.selectedEntityId,
    selectedEntityLabel: butlerCtx.selectedEntityLabel,
  };
  const parsed = askRequestSchema.parse(req);
  const sess = (parsed.session as ButlerSession | undefined) ?? emptySession();
  let ctx = resolveAskContext(parsed.question, parsed, sess);
  const auth = authFromButlerContext(butlerCtx);
  const plan = planAsk(parsed.question, ctx, sess);
  if (
    plan.intent === "LOCATION_COMPARISON" &&
    !ctx.compareWith
  ) {
    if (/west village/i.test(parsed.question)) {
      ctx = {
        ...ctx,
        locationId: "loc_nyc_wvill",
        compareWith: "loc_nyc",
        locationIds: ["loc_nyc_wvill", "loc_nyc"],
        locationName: "New York West Village",
      };
    } else if (/new york|nyc/i.test(parsed.question)) {
      ctx = {
        ...ctx,
        locationId: "loc_nyc",
        compareWith: "loc_nyc_wvill",
        locationIds: ["loc_nyc", "loc_nyc_wvill"],
        locationName: "New York Flatiron",
      };
    } else if (sess.locationId && sess.locationId !== ctx.locationId) {
      ctx = {
        ...ctx,
        compareWith: sess.locationId,
        locationIds: [ctx.locationId, sess.locationId],
      };
    }
  }
  const results = plan.tools.map((name) =>
    executeAskTool(name, auth, ctx, {
      locationId: ctx.locationId,
      a: ctx.locationIds[0],
      b: ctx.compareWith ?? ctx.locationIds[1],
    }),
  );
  const response = composeAskAnswer(
    plan.intent,
    ctx,
    results,
    parsed.question,
    plan.classification,
  );

  if (process.env.RADR_DEBUG_BUTLER === "1") {
    console.info("[BUTLER QUERY PLAN]", JSON.stringify(plan.queryPlan));
  }

  return {
    mode: getLlmConfig().configured ? "llm" : "tools",
    response,
    session: nextAskSession(sess, parsed.question, response, ctx),
    analyzing: analyzingFrom(plan.analyzing, true),
    toolsCalled: plan.tools,
    configured: getLlmConfig().configured,
  };
}
