/**
 * RADR motion vocabulary: five concepts only.
 * Use these timings everywhere. No random bounce / fade-up soup.
 */
export const RADR_MOTION = {
  /** SCAN: searching the operation */
  scan: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  /** LOCK: something financially meaningful identified */
  lock: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  /** DELTA: expected vs actual separates */
  delta: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  /** TRACE: relationship lines draw */
  trace: { duration: 0.55, ease: [0.4, 0, 0.2, 1] as const },
  /** RESOLVE: exposure → action / value / control */
  resolve: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  /** UI chrome */
  hover: { duration: 0.16, ease: "easeOut" as const },
  tooltip: { duration: 0.14, ease: "easeOut" as const },
  /** Drawer / overlay: no bounce */
  panel: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
  scope: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
} as const;

export type RadrMotionKind = keyof typeof RADR_MOTION;
