"use client";

import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";

type Variant = "plain" | "luminous";
type Size = "nav" | "md" | "lg" | "hero" | "footer" | "headline";
/**
 * Explicit contrast surfaces - never rely on inherited low-contrast gray.
 * - light → near-black letters (logo-on-light)
 * - dark → warm white letters (logo-on-dark)
 */
export type LogoSurface = "light" | "dark";

type Props = {
  className?: string;
  /** plain = UI · luminous = premium brand moments */
  variant?: Variant;
  size?: Size;
  /**
   * Contrast surface. Prefer explicit over ambient CSS.
   * Defaults: dark (marketing/auth dark canvases).
   */
  surface?: LogoSurface;
  /** Compact mark spacing for tight chrome */
  compact?: boolean;
  as?: "span" | "p" | "div";
  /** Kept for API compat */
  animate?: boolean;
};

/**
 * Canonical R△DR wordmark. Matches brand lockup reference.
 * Structure: R + △ + D + R (triangle IS the A).
 *
 * Text tree must resolve to "RADR":
 * - letters R / D / R remain in the DOM text
 * - △ is aria-hidden; sr-only "A" supplies the missing letter
 * - never duplicate a full "RADR" string (that produced "RADRRDR")
 */
export function RadrWordmark({
  className = "",
  variant = "plain",
  size = "md",
  surface = "dark",
  compact = false,
  as: Tag = "span",
  animate = false,
}: Props) {
  const mode: Variant =
    variant === "luminous" || animate ? "luminous" : "plain";
  const surfaceClass =
    surface === "light" ? "radr-wm--on-light" : "radr-wm--on-dark";
  const compactClass = compact
    ? surface === "light"
      ? "radr-wm--compact-on-light"
      : "radr-wm--compact-on-dark"
    : "";

  return (
    <Tag
      className={`radr-wm radr-wm--${size} radr-wm--${mode} ${surfaceClass} ${compactClass} ${className}`.trim()}
      aria-label="RADR"
      data-variant={mode}
      data-surface={surface}
      data-compact={compact ? "true" : "false"}
    >
      <span className="radr-wm-letter radr-wm-r">R</span>
      <span className="radr-wm-a" aria-hidden="true">
        <RadrDeltaGlyph />
      </span>
      <span className="sr-only">A</span>
      <span className="radr-wm-letter radr-wm-d">D</span>
      <span className="radr-wm-letter radr-wm-r2">R</span>
    </Tag>
  );
}

export function RadrLogo(props: Props) {
  return <RadrWordmark {...props} />;
}

export { RadrWordmark as BrandMark };
