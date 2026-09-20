"use client";

import type { CSSProperties } from "react";

export type DeltaSize = "xs" | "sm" | "md" | "lg" | "brand" | "cap";
export type DeltaTone =
  | "brand"
  | "positive"
  | "negative"
  | "neutral"
  | "inherit"
  | "buy"
  | "labor"
  | "sell"
  | "recover";

export type DeltaAsset = "glass" | "orbit" | "svg";

type Props = {
  size?: DeltaSize;
  /** Override pixel size (e.g. marketing beacon) */
  pixelSize?: number;
  tone?: DeltaTone;
  className?: string;
  /** One-shot perimeter pulse (detection moments). Never continuous. */
  pulse?: boolean;
  /**
   * Brand mark rendering:
   * - glass / orbit = uploaded theme PNGs (canonical brand look)
   * - svg = vector ring for tiny UI / non-brand tones
   */
  asset?: DeltaAsset;
  /** Soft outer bloom, only for svg fallback */
  glow?: boolean;
  title?: string;
  style?: CSSProperties;
};

/**
 * Uploaded brand deltas (Aug 2026 theme):
 * - glass: thick rounded emerald frame on black
 * - orbit: frame + faint circle + sparks
 */
export const DELTA_ASSETS = {
  glass: "/brand/delta-glass-trim.png?v=3",
  orbit: "/brand/delta-orbit-trim.png?v=3",
} as const;

/**
 * Vector fallback: rounded hollow frame (not sharp mathematical △).
 * Used for xs-lg / territory tones where a PNG would be muddy.
 */
const VIEW = "0 0 100 100";
const RING_OUTER =
  "M 34.41 40.00 Q 50.00 13.00 65.59 40.00 L 69.92 47.50 Q 85.51 74.50 54.33 74.50 L 45.67 74.50 Q 14.49 74.50 30.08 47.50 L 34.41 40.00 Z";
const RING_INNER =
  "M 39.61 44.50 Q 50.00 26.50 60.39 44.50 L 63.42 49.75 Q 73.82 67.75 53.03 67.75 L 46.97 67.75 Q 26.18 67.75 36.58 49.75 L 39.61 44.50 Z";
const RING = `${RING_OUTER} ${RING_INNER}`;

const SIZE_PX: Record<Exclude<DeltaSize, "cap">, number> = {
  xs: 10,
  sm: 12,
  md: 16,
  lg: 24,
  brand: 34,
};

function resolveAsset(
  size: DeltaSize,
  tone: DeltaTone,
  asset: DeltaAsset | undefined,
): DeltaAsset {
  if (asset) return asset;
  // Brand moments → use the uploaded mark, not a stroked approximation
  if (
    (size === "brand" || size === "cap") &&
    (tone === "brand" || tone === "positive" || tone === "inherit")
  ) {
    return "glass";
  }
  return "svg";
}

export function DeltaMark({
  size = "md",
  pixelSize,
  tone = "brand",
  className = "",
  pulse = false,
  asset,
  glow,
  title,
  style,
}: Props) {
  const isCap = size === "cap";
  const px = isCap ? undefined : (pixelSize ?? SIZE_PX[size]);
  const mode = resolveAsset(size, tone, asset);
  const showGlow =
    glow ?? (mode === "svg" && (tone === "brand" || size === "brand"));

  if (mode === "glass" || mode === "orbit") {
    return (
      <span
        className={`rp-delta rp-delta--${size} rp-delta--${tone} rp-delta--asset ${className}`.trim()}
        data-pulse={pulse ? "true" : undefined}
        data-fit={isCap ? "cap" : undefined}
        data-asset={mode}
        style={{
          ...(px ? { width: px, height: px } : null),
          ...style,
        }}
        aria-hidden={title ? undefined : true}
        title={title}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="rp-delta-img"
          src={DELTA_ASSETS[mode]}
          alt=""
          draggable={false}
          width={px ?? 64}
          height={px ?? 64}
        />
      </span>
    );
  }

  return (
    <span
      className={`rp-delta rp-delta--${size} rp-delta--${tone} ${className}`.trim()}
      data-pulse={pulse ? "true" : undefined}
      data-fit={isCap ? "cap" : undefined}
      data-glow={showGlow ? "true" : undefined}
      style={{
        ...(px ? { width: px, height: px } : null),
        ...style,
      }}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      <svg
        className="rp-delta-svg"
        viewBox={VIEW}
        width={isCap ? "100%" : px}
        height={isCap ? "100%" : px}
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        {showGlow ? (
          <path
            className="rp-delta-bloom"
            d={RING_OUTER}
            fill="none"
            stroke="currentColor"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        <path
          className="rp-delta-path"
          d={RING}
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
}

/** Typographic △ for inline R△DR. Uses uploaded glass mark */
export function DeltaGlyph({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`rp-delta-glyph ${className}`.trim()} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={DELTA_ASSETS.glass} alt="" draggable={false} />
    </span>
  );
}
