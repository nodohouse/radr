/**
 * Central marketing motion tokens.
 * Prefer transform + opacity. No bounce / overshoot.
 */

export const MOTION = {
  ease: [0.22, 1, 0.36, 1] as const,
  easeCss: "cubic-bezier(0.22, 1, 0.36, 1)",

  /** Hover, focus, micro feedback */
  micro: 0.14,
  /** Buttons, cards, tips */
  standard: 0.22,
  /** Content crossfade / stage body */
  content: 0.36,
  /** Shared element / sticky stage */
  section: 0.52,

  ms: {
    micro: 140,
    standard: 220,
    content: 360,
    section: 520,
  },
} as const;

export const heroEnter = {
  duration: 0.48,
  ease: MOTION.ease,
} as const;

export const stageSwap = {
  duration: MOTION.content,
  ease: MOTION.ease,
} as const;
