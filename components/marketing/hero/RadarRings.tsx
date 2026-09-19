"use client";

import { memo } from "react";

/**
 * Floor radar rings - mostly static. One soft pulse ring only.
 * Fewer ellipses = less SVG paint on every composite.
 */
const RINGS = [
  { w: 90, h: 26, o: 0.24 },
  { w: 165, h: 44, o: 0.2 },
  { w: 260, h: 67, o: 0.155 },
  { w: 390, h: 94, o: 0.115 },
  { w: 560, h: 127, o: 0.078 },
  { w: 770, h: 166, o: 0.05 },
  { w: 1020, h: 211, o: 0.03 },
  { w: 1310, h: 262, o: 0.016 },
  { w: 1640, h: 320, o: 0.007 },
] as const;

const VB_W = 1840;
const VB_H = 360;
const CX = VB_W / 2;
const CY = VB_H / 2;

function RadarRingsImpl() {
  return (
    <div
      className="rx-radar"
      aria-hidden="true"
      style={{
        left: "var(--radar-origin-x)",
        top: "var(--radar-origin-y)",
      }}
    >
      <svg
        className="rx-radar-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {RINGS.map((r, i) => (
          <ellipse
            key={i}
            cx={CX}
            cy={CY}
            rx={r.w / 2}
            ry={r.h / 2}
            fill="none"
            stroke="rgb(0, 240, 122)"
            strokeWidth={i === 0 ? 0.9 : i < 3 ? 0.8 : 0.7}
            opacity={r.o}
          />
        ))}
        {/* Single pulse - opacity + scale only */}
        <ellipse
          className="rx-radar-pulse"
          cx={CX}
          cy={CY}
          rx={210}
          ry={55}
          fill="none"
          stroke="rgb(0, 240, 122)"
          strokeWidth={0.85}
        />
      </svg>
      <span className="rx-radar-core" />
    </div>
  );
}

export const RadarRings = memo(RadarRingsImpl);
