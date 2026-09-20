"use client";

import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";

type Props = {
  className?: string;
  /** Living = soft brightness pulse: major moments only */
  living?: boolean;
  /** Pause when false (offscreen / hidden tab) */
  active?: boolean;
  /** Low-opacity atmospheric */
  dim?: boolean;
  /** Kept for API compat */
  verified?: boolean;
  size?: number;
};

/**
 * Soft rounded brand △: clean lockup glyph (not the old 3D PNG).
 */
export function DeltaGlyph({
  className = "",
  living = false,
  active = true,
  dim = false,
  size = 100,
}: Props) {
  const reduced = useReducedMotionSafe();
  const animate = living && active && !reduced;

  return (
    <span
      className={`rx-delta-glyph ${dim ? "rx-delta-glyph--dim" : ""} ${animate ? "rx-delta-glyph--living" : ""} ${className}`.trim()}
      style={{ width: size, height: size, color: "#00ff82" }}
      aria-hidden="true"
    >
      <RadrDeltaGlyph />
    </span>
  );
}
