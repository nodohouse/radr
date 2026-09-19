/**
 * Locked RADR brand building blocks.
 * Hierarchy: Adaptive Decision System > Verified Decision Intelligence > System of Decision Record.
 * Prefer importing from `@/lib/marketing/brand` for new surfaces.
 */
import { CATEGORY, LIFECYCLE_PUBLIC } from "@/lib/marketing/brand";

export const BRAND = {
  name: "RADR",
  wordmark: "R△DR",
  /** Primary public category */
  category: "Adaptive Decision System",
  /** Locked category line under wordmark / footer */
  tagline: CATEGORY.primary,
  /** Secondary descriptor */
  secondary: CATEGORY.secondary,
  /** Product position */
  layer: CATEGORY.decisionLayer,
  /** Technical / enterprise */
  systemOfRecord: CATEGORY.systemOfRecord,
  ambition: "Hospitality decision intelligence",
  promise: CATEGORY.slogan,
  coreIdea: "△ is the difference.",
  productLoop: [
    "Observe.",
    "Understand.",
    "Predict.",
    "Simulate.",
    "Decide.",
    "Act.",
    "Verify.",
    "Learn.",
  ] as const,
  definition:
    "RADR is the adaptive decision system for hospitality. It finds the operating decisions that change the P&L — simulates options, verifies outcomes, and learns.",
  plainValue:
    "Your operation is making decisions every minute. RADR finds the ones that change the P&L.",
  explanation:
    "Your operation leaves signals. RADR turns them into decisions — across POS, PMS, labor, accounting and channels, or from files and APIs alone.",
  beachhead: "Built for hospitality.",
  vision: "Every complex operation on RADR.",
  mission:
    "Know what changed. Know what matters. Know what to do. Know whether it worked. Know what we learned.",
} as const;

export const PRODUCT_LOOP = LIFECYCLE_PUBLIC.map((label) => ({
  id: label.toLowerCase(),
  label,
  body: "",
}));

export const OUTCOMES = [
  {
    t: "Attention returned",
    d: "Only material decisions reach the operator.",
  },
  {
    t: "Better decisions",
    d: "Evidence, economics and confidence before you act.",
  },
  {
    t: "Prepared actions",
    d: "RADR carries work to approval — or handles it.",
  },
  {
    t: "Verified outcomes",
    d: "Claim only what you can prove.",
  },
  {
    t: "Operating memory",
    d: "Every verified outcome makes the next decision better.",
  },
  {
    t: "Less operational work",
    d: "Hospitality teams keep providing hospitality.",
  },
] as const;

export const TERRITORIES = [
  { id: "buy", label: "BUY", body: "What you spend." },
  { id: "labor", label: "LABOR", body: "How you staff." },
  { id: "sell", label: "SELL", body: "How you monetize." },
  { id: "recover", label: "RECOVER", body: "What you're owed." },
] as const;

export type BrandConfig = typeof BRAND;
