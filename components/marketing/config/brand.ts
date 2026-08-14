/**
 * Locked RADR brand building blocks.
 * Do not invent alternate taglines on marketing surfaces.
 */
export const BRAND = {
  name: "RADR",
  wordmark: "R△DR",
  category: "Margin intelligence",
  promise: "Nothing off the RADR.",
  coreIdea: "△ is the difference.",
  productLoop: ["Find it.", "Fix it.", "Keep it fixed."] as const,
  explanation:
    "RADR continuously compares what happened with what should have happened — then finds, explains and quantifies the difference.",
  plainValue:
    "RADR finds the money you're losing, missing or leaving behind.",
  beachhead: "Built first for hospitality.",
  vision: "Every complex operation on RADR.",
  mission:
    "RADR watches your operation 24/7 and finds the money you're losing, missing or leaving behind.",
} as const;

export type BrandConfig = typeof BRAND;
