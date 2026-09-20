/**
 * Shared RADR motion language — website, product, tour.
 * Every animation communicates: TIME · CAUSALITY · STATE · CHOICE · OUTCOME · LEARNING.
 * No decorative motion.
 */

export const RADR_MOTION = {
  duration: {
    instant: 120,
    fast: 200,
    standard: 320,
    story: 600,
    cinematic: 900,
  },
  easing: {
    /** Calm settle — Decision focus */
    settle: "cubic-bezier(0.22, 1, 0.36, 1)",
    /** Causal enter — signal arrival */
    enter: "cubic-bezier(0.16, 1, 0.3, 1)",
    /** Exit / dim */
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    /** Linear scrub / rail */
    linear: "linear",
  },
  /** Signature story beats (ms) — hero film + tour share vocabulary */
  beats: {
    signalArrival: 400,
    signalConvergence: 900,
    futureBranch: 700,
    recommendationFocus: 500,
    contextUpdate: 450,
    outcomeResolution: 550,
    verification: 600,
    memoryFormation: 700,
  },
  /** Hero silent film loop (~20s) */
  heroFilmMs: 20000,
  /** Full product tour (~50s) */
  tourMs: 50000,
} as const;

export type RadrMotionDuration = keyof typeof RADR_MOTION.duration;

/** CSS custom-property map for injecting into :root / .radr / .rp-root */
export const RADR_MOTION_CSS_VARS = {
  "--radr-motion-instant": `${RADR_MOTION.duration.instant}ms`,
  "--radr-motion-fast": `${RADR_MOTION.duration.fast}ms`,
  "--radr-motion-standard": `${RADR_MOTION.duration.standard}ms`,
  "--radr-motion-story": `${RADR_MOTION.duration.story}ms`,
  "--radr-motion-cinematic": `${RADR_MOTION.duration.cinematic}ms`,
  "--radr-ease-settle": RADR_MOTION.easing.settle,
  "--radr-ease-enter": RADR_MOTION.easing.enter,
  "--radr-ease-exit": RADR_MOTION.easing.exit,
} as const;

export type MotionPrimitive =
  | "signal-arrival"
  | "signal-convergence"
  | "future-branch"
  | "recommendation-focus"
  | "context-update"
  | "outcome-resolution"
  | "verification"
  | "memory-formation";
