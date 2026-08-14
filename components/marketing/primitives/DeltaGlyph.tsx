"use client";

import { useId } from "react";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";

type Props = {
  className?: string;
  /** Living gradient stroke — major moments only */
  living?: boolean;
  /** Pause SMIL when false (offscreen / hidden tab) */
  active?: boolean;
  /** Low-opacity atmospheric stroke */
  dim?: boolean;
  /** One-shot clockwise outline complete (verified) */
  verified?: boolean;
  size?: number;
};

/**
 * Soft rounded outline △ — transparent center.
 * No SVG blur filters. Living = animated gradient stroke only.
 */
export function DeltaGlyph({
  className = "",
  living = false,
  active = true,
  dim = false,
  verified = false,
  size = 100,
}: Props) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotionSafe();
  const gradId = `rx-dlt-${uid}`;
  const d = "M50 12 L88 86 H12 Z";
  const animate = living && active && !reduced;

  return (
    <svg
      className={`rx-delta-glyph ${dim ? "rx-delta-glyph--dim" : ""} ${animate ? "rx-delta-glyph--living" : ""} ${className}`.trim()}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {animate ? (
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A8F4A" />
            <stop offset="32%" stopColor="#00F56A" />
            <stop offset="55%" stopColor="#B8FFE0" />
            <stop offset="78%" stopColor="#22F87A" />
            <stop offset="100%" stopColor="#0A8F4A" />
            <animateTransform
              attributeName="gradientTransform"
              type="rotate"
              from="0 50 50"
              to="360 50 50"
              dur="5.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
      ) : null}
      <path
        className="rx-delta-glyph-path"
        d={d}
        fill="none"
        stroke={animate ? `url(#${gradId})` : "currentColor"}
        strokeWidth={dim ? 5.5 : 6.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={100}
        style={
          verified && !reduced
            ? {
                strokeDasharray: 100,
                strokeDashoffset: 0,
                animation: "rx-delta-verify-draw 900ms var(--ease) 1",
              }
            : undefined
        }
      />
    </svg>
  );
}
