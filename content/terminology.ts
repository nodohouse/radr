/**
 * Editorial terminology — public RADR vocabulary.
 * CI and copy reviews should fail on DEPRECATED terms in marketing surfaces.
 */

export const APPROVED_TERMS = {
  primaryCategory: "The adaptive decision system for hospitality",
  decisionGap: "The Decision Gap",
  customerLoop: [
    "CONNECT",
    "UNDERSTAND",
    "FUTURES",
    "DECIDE",
    "VERIFY",
    "REMEMBER",
  ] as const,
  decisionLifecycle: [
    "DETECTED",
    "UNDERSTOOD",
    "SIMULATED",
    "RECOMMENDED",
    "APPROVED",
    "OBSERVED",
    "VERIFIED",
    "LEARNED",
  ] as const,
  technicalPipeline: [
    "EVENT",
    "NORMALIZED OPERATING STATE",
    "FINDING",
    "DECISION",
    "SCENARIO / FUTURES",
    "ACTION",
    "OUTCOME",
    "VERIFIED VALUE",
    "MEMORY",
  ] as const,
  finding:
    "A detected relationship, anomaly, exposure, opportunity or pattern. A Finding becomes a Decision only when it is material, time-relevant, sufficiently evidenced, actionable, and capable of changing the outcome.",
  lenses: ["BUY", "LABOR", "SELL", "RECOVER"] as const,
  objects: [
    "Operating State",
    "Operating Model",
    "Finding",
    "Decision",
    "Futures",
    "Prepared Actions",
    "Verified Value",
    "Operating Memory",
    "Operating DNA",
    "Decision Trace",
    "Economic Clock",
    "Control Center",
    "Ask RADR",
  ] as const,
} as const;

/** Public marketing must not use these as primary category or product nouns. */
export const DEPRECATED_PUBLIC_TERMS = [
  "Operating Twin",
  "Attention Intelligence",
  "AI Operating System",
  "Decision OS",
  "decision orchestration fabric",
  "hospitality cognition layer",
  "hospitality brain",
  "agentic intelligence mesh",
  "Why interface",
] as const;

/**
 * Allowed as supporting descriptor only — never as the primary public category.
 * Primary: The decision layer for hospitality.
 * Investor: System of Decision Record for hospitality.
 */
export const SECONDARY_ONLY = [
  "Verified Decision Intelligence",
  "Adaptive Decision System",
  "decision intelligence",
  "margin intelligence",
  "operating judgment",
  "Economic Decision Layer",
  "Decision Infrastructure",
] as const;
