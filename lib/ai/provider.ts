/**
 * Optional LLM provider for Ask RADR.
 * Server-side only. Never import into client bundles that expose secrets.
 *
 * When configured:
 * - classifies intent (understanding)
 * - may suggest tools
 * Numbers always come from executeAskTool - never from the model.
 */

import {
  ASK_INTENT_CLASSES,
  type AskIntentClass,
} from "./intents";

export type LlmMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
};

export type LlmToolCall = {
  id: string;
  name: string;
  arguments: string;
};

export type LlmProviderConfig = {
  configured: boolean;
  provider: "openai" | "none";
  model: string;
};

export function getLlmConfig(): LlmProviderConfig {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { configured: false, provider: "none", model: "" };
  }
  return {
    configured: true,
    provider: "openai",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  };
}

async function openaiChat(
  messages: { role: string; content: string }[],
  extras: Record<string, unknown> = {},
): Promise<unknown | null> {
  const cfg = getLlmConfig();
  if (!cfg.configured) return null;
  const key = process.env.OPENAI_API_KEY!;
  const base = process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1";
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        messages,
        ...extras,
      }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * Classify user question into a RADR intent class.
 * Returns null if LLM unavailable - caller keeps rule-based plan.
 */
export async function llmClassifyIntent(
  question: string,
  contextLine: string,
): Promise<{ intent: AskIntentClass; confidence: number } | null> {
  const allowed = ASK_INTENT_CLASSES.join(", ");
  const json = (await openaiChat(
    [
      {
        role: "system",
        content: `You classify Ask RADR questions into exactly one intent.
Context: ${contextLine}
Allowed intents: ${allowed}
Rules:
- Prefer RESERVATION_SUMMARY for tonight / service outlook / "how will we do"
- Prefer LABOR_REQUIREMENT for staffing / call people in / understaffed
- Prefer MARGIN_ANALYSIS or REVENUE_ANALYSIS for trading performance
- Prefer CONTROL_CENTER_SUMMARY only for explicit "what needs attention" / overview
- Prefer CLARIFY only if the question has zero operational meaning
- Never invent numbers
Reply JSON only: {"intent":"...","confidence":0.0}`,
      },
      { role: "user", content: question },
    ],
    { response_format: { type: "json_object" } },
  )) as
    | {
        choices?: { message?: { content?: string } }[];
      }
    | null;

  const raw = json?.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { intent?: string; confidence?: number };
    const intent = parsed.intent as AskIntentClass | undefined;
    if (!intent || !ASK_INTENT_CLASSES.includes(intent)) return null;
    return {
      intent,
      confidence: Math.min(1, Math.max(0, Number(parsed.confidence) || 0.7)),
    };
  } catch {
    return null;
  }
}

/**
 * Optional OpenAI chat completion with tool calls.
 * Returns null if not configured or on failure (caller falls back to tools planner).
 */
export async function llmPlanTools(
  system: string,
  user: string,
  toolDefs: { name: string; description: string }[],
): Promise<{ toolNames: string[]; draft?: string } | null> {
  const cfg = getLlmConfig();
  if (!cfg.configured) return null;

  const json = (await openaiChat(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    {
      temperature: 0.1,
      tools: toolDefs.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: {
            type: "object",
            properties: {
              locationId: { type: "string" },
              a: { type: "string" },
              b: { type: "string" },
            },
          },
        },
      })),
      tool_choice: "auto",
    },
  )) as
    | {
        choices?: {
          message?: {
            content?: string;
            tool_calls?: { function: { name: string } }[];
          };
        }[];
      }
    | null;

  if (!json) return null;
  const msg = json.choices?.[0]?.message;
  const toolNames =
    msg?.tool_calls?.map((t) => t.function.name).filter(Boolean) ?? [];
  return { toolNames, draft: msg?.content ?? undefined };
}
