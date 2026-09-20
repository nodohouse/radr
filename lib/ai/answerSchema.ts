/**
 * Ask RADR answer schema - structured, tool-grounded.
 * Money never originates here; tools own calculations.
 */

import { z } from "zod";
import type { ButlerResponse, ButlerSession, ButlerTopic } from "@/lib/radr/butler/types";

export const askRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  locationScope: z.string().default("loc_ber"),
  period: z.string().default("yesterday"),
  page: z.string().optional(),
  role: z
    .enum(["location_manager", "regional_manager", "group_cfo"])
    .default("group_cfo"),
  allowedLocationIds: z.union([z.literal("all"), z.array(z.string())]).default("all"),
  /** Server-set only - ignored if client-supplied on LIVE. */
  organizationId: z.string().optional(),
  userId: z.string().optional(),
  conversationId: z.string().optional(),
  session: z
    .object({
      topic: z.string().optional(),
      locationId: z.string().optional(),
      locationName: z.string().optional(),
      findingId: z.string().optional(),
      lastQuery: z.string().optional(),
      history: z
        .array(
          z.object({
            query: z.string(),
            title: z.string(),
            at: z.string(),
          }),
        )
        .default([]),
    })
    .optional(),
  selectedEntityId: z.string().optional(),
  selectedEntityLabel: z.string().optional(),
  /** Operating canvas - perspective over the same operation. */
  lens: z.enum(["operate", "money", "risk", "service"]).optional(),
  /** Operating canvas - service-time scrubber (15-minute resolution). */
  serviceTime: z.string().optional(),
  /** Operating canvas - selected finding for Trace / Ask. */
  selectedFindingId: z.string().optional(),
});

export type AskRequest = z.infer<typeof askRequestSchema>;

export type AskMode = "llm" | "tools" | "unconfigured";

export type AskAnalyzingStep = {
  id: string;
  label: string;
  status: "pending" | "done" | "skip";
};

export type AskResult = {
  mode: AskMode;
  response: ButlerResponse;
  session: ButlerSession;
  analyzing: AskAnalyzingStep[];
  toolsCalled: string[];
  configured: boolean;
};

export function emptySession(): ButlerSession {
  return { history: [] };
}

export function asTopic(t: string | undefined): ButlerTopic {
  const known: ButlerTopic[] = [
    "attention",
    "location_risk",
    "labor",
    "reservations",
    "waitlist",
    "cancellations",
    "table14",
    "verified_value",
    "exposure_breakdown",
    "amsterdam",
    "zuid",
    "supplier",
    "forecast",
    "term",
    "action",
    "general",
    "command",
  ];
  if (t && (known as string[]).includes(t)) return t as ButlerTopic;
  return "general";
}
