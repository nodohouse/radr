"use client";

import type { SemanticState } from "@/lib/radr/product/semantic";
import { resolveSemantic } from "@/lib/radr/product/semantic";

type Props = {
  value: string;
  /** Signed delta for meaning resolution */
  deltaSigned?: number | null;
  higherIsBetter?: boolean;
  /** Override semantic (exposure, verified, live…) */
  semantic?: SemanticState;
  /** Optional caption under the value */
  label?: string;
  size?: "hero" | "primary" | "secondary" | "meta";
  className?: string;
};

/**
 * Accessible economic delta — glyph + color from business meaning.
 */
export function MetricDelta({
  value,
  deltaSigned = null,
  higherIsBetter = true,
  semantic: forced,
  label,
  size = "primary",
  className = "",
}: Props) {
  const resolved =
    forced != null
      ? resolveSemantic(deltaSigned ?? 0, higherIsBetter, { force: forced })
      : deltaSigned == null
        ? { direction: "flat" as const, semantic: "neutral" as const, glyph: "→" as const }
        : resolveSemantic(deltaSigned, higherIsBetter);

  return (
    <span
      className={`rp-metric-delta ${className}`.trim()}
      data-size={size}
      data-semantic={resolved.semantic}
      data-dir={resolved.direction}
    >
      <span className="rp-metric-delta-glyph" aria-hidden="true">
        {resolved.glyph}
      </span>
      <strong className="rp-metric-delta-val">{value}</strong>
      {label ? <em className="rp-metric-delta-label">{label}</em> : null}
    </span>
  );
}
