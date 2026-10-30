/*
 RADR BRAND ASSET — IMMUTABLE.
 DO NOT REDRAW, MODIFY SVG GEOMETRY, REPOSITION THE FOCAL DOT,
 OR SUBSTITUTE LIVE TEXT/CSS.
 SOURCE OF TRUTH (approved soft board vector masters v4):
 /public/brand/radr-wordmark-master-v4.svg
 /public/brand/radr-mark-master-v4.svg
 Prior v2/v3 masters are archived — do not rewire.
*/

import type { CSSProperties } from "react";

export type FrozenRadrLogoVariant = "wordmark" | "mark";
export type FrozenRadrLogoTheme = "light" | "dark" | "mono";
export type FrozenRadrLogoSize = "sm" | "md" | "lg";

type Props = {
  variant?: FrozenRadrLogoVariant;
  theme?: FrozenRadrLogoTheme;
  size?: FrozenRadrLogoSize;
  /** Optional explicit width (px). Prefer size tokens. Never set independent height. */
  width?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
};

/** Intrinsic ratios from approved master-v4 viewBoxes — do not change. */
const ASPECT: Record<FrozenRadrLogoVariant, number> = {
  mark: 120 / 91.81, // viewBox="-10 -7.65 120 91.81"
  wordmark: 568 / 122, // viewBox="-14 8 568 122"
};

/** Display widths (px). Height is always auto. */
const WIDTH: Record<FrozenRadrLogoVariant, Record<FrozenRadrLogoSize, number>> =
  {
    mark: { sm: 24, md: 32, lg: 48 },
    wordmark: { sm: 108, md: 138, lg: 200 },
  };

const SRC: Record<
  FrozenRadrLogoVariant,
  Record<FrozenRadrLogoTheme, string>
> = {
  mark: {
    light: "/brand/radr-mark-master-v4.svg",
    dark: "/brand/radr-mark-master-v4-white.svg",
    mono: "/brand/radr-mark-master-v4-mono-black.svg",
  },
  wordmark: {
    light: "/brand/radr-wordmark-master-v4.svg",
    dark: "/brand/radr-wordmark-master-v4-white.svg",
    mono: "/brand/radr-wordmark-master-v4-mono-black.svg",
  },
};

/**
 * Single immutable logo rendering path for public RADR surfaces.
 * Renders approved SVG files via <img> only — never inline path edits.
 */
export function FrozenRadrLogo({
  variant = "wordmark",
  theme = "light",
  size = "md",
  width: widthProp,
  className = "",
  decorative = false,
  priority = false,
}: Props) {
  const src = SRC[variant][theme];
  const aspect = ASPECT[variant];
  const width = widthProp ?? WIDTH[variant][size];
  const heightAttr = Math.round(width / aspect);

  const style: CSSProperties = {
    width,
    height: "auto",
    maxWidth: "100%",
    display: "block",
    objectFit: "contain",
    objectPosition: variant === "mark" ? "center center" : "left center",
    flexShrink: 0,
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element -- frozen SVG verbatim; no Next Image transforms
    <img
      src={src}
      alt={decorative ? "" : "RADR"}
      aria-hidden={decorative ? true : undefined}
      width={width}
      height={heightAttr}
      className={`radr-logo radr-logo--frozen radr-logo--${variant} ${className}`.trim()}
      style={style}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      draggable={false}
    />
  );
}
