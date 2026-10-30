/**
 * Business-semantic color — meaning, not arithmetic sign.
 *
 * Revenue +3% → positive (green)
 * Waste −12% → positive (green) when reduction is beneficial
 * COGS +11% → negative (red)
 * Exposure €788 → warning (amber)
 */

export type SemanticState =
  | "positive"
  | "negative"
  | "warning"
  | "neutral"
  | "verified"
  | "live"
  | "stale";

export type MetricDirection = "up" | "down" | "flat";

export type SemanticMetric = {
  /** Arithmetic direction of the delta */
  direction: MetricDirection;
  /** Business outcome meaning */
  semantic: SemanticState;
  /** Glyph for a11y (not color-only) */
  glyph: "↑" | "↓" | "→" | "△";
};

/**
 * @param deltaSigned — signed change (positive number = arithmetic up)
 * @param higherIsBetter — whether arithmetic up is a good business outcome
 * @param opts.force — override for exposure / watch / verified / live
 * @param opts.nearZero — treat |delta| below this as neutral
 */
export function resolveSemantic(
  deltaSigned: number,
  higherIsBetter: boolean,
  opts?: {
    force?: SemanticState;
    nearZero?: number;
  },
): SemanticMetric {
  if (opts?.force) {
    const glyph =
      opts.force === "warning"
        ? "△"
        : opts.force === "neutral"
          ? "→"
          : deltaSigned > 0
            ? "↑"
            : deltaSigned < 0
              ? "↓"
              : "→";
    return {
      direction:
        Math.abs(deltaSigned) < (opts.nearZero ?? 0.05)
          ? "flat"
          : deltaSigned > 0
            ? "up"
            : "down",
      semantic: opts.force,
      glyph,
    };
  }

  const near = opts?.nearZero ?? 0.05;
  if (Math.abs(deltaSigned) < near) {
    return { direction: "flat", semantic: "neutral", glyph: "→" };
  }

  const direction: MetricDirection = deltaSigned > 0 ? "up" : "down";
  const beneficial =
    (deltaSigned > 0 && higherIsBetter) ||
    (deltaSigned < 0 && !higherIsBetter);

  return {
    direction,
    semantic: beneficial ? "positive" : "negative",
    glyph: direction === "up" ? "↑" : "↓",
  };
}

/** CSS class hook: data-semantic="positive" */
export function semanticAttr(s: SemanticState): { "data-semantic": SemanticState } {
  return { "data-semantic": s };
}
