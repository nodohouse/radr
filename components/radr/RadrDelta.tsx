"use client";

import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";

type Props = {
  className?: string;
  /** nav = standalone mark · glyph = typographic A · visual = field accents */
  variant?: "nav" | "glyph" | "visual";
  height?: number;
  pulse?: boolean;
};

/**
 * RADR △: clean luminous brand character (lockup glyph).
 * Same geometry everywhere. Never the old 3D PNG in brand chrome.
 */
export function RadrDelta({
  className = "",
  variant = "glyph",
  height,
  pulse = false,
}: Props) {
  const h = height ?? (variant === "nav" ? 30 : undefined);

  return (
    <span
      className={`radr-delta radr-delta--${variant} ${className}`.trim()}
      data-pulse={pulse ? "true" : undefined}
      style={
        h
          ? { height: h, width: h * 0.9 }
          : undefined
      }
      aria-hidden="true"
    >
      <RadrDeltaGlyph />
    </span>
  );
}

/** @deprecated Prefer RadrDelta / RadrWordmark */
export { RadrDelta as RadrMark };
export { RadrDelta as BrandA };
