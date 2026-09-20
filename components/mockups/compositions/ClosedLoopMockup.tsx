"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";

const NODES = [
  { pos: "signal", kicker: "01", label: "Signal", active: false },
  { pos: "finding", kicker: "02", label: "Finding", active: false },
  { pos: "action", kicker: "03", label: "Action", active: false },
  { pos: "outcome", kicker: "04", label: "Outcome", active: false },
  { pos: "verified", kicker: "05", label: "Verified value", active: true },
] as const;

const FLOW = [
  { value: "€256", label: "Exposed" },
  { value: "€192", label: "Recoverable" },
  { value: "€184", label: "Captured" },
  { value: "€184", label: "Verified", final: true },
] as const;

export function ClosedLoopMockup() {
  return (
    <MockupCanvas id="closed-loop">
      <MockupBrand label="Closed loop" />
      <p className="mk-loop-tagline">Every outcome makes RADR smarter.</p>

      <div className="mk-loop">
        <svg
          className="mk-loop-svg"
          viewBox="0 0 1000 1000"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mkLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,185,107,0.55)" />
              <stop offset="50%" stopColor="rgba(0,185,107,0.18)" />
              <stop offset="100%" stopColor="rgba(0,185,107,0.55)" />
            </linearGradient>
            <marker
              id="mkArrow"
              markerWidth="8"
              markerHeight="8"
              refX="6"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(0,185,107,0.7)" />
            </marker>
          </defs>
          <circle
            cx="500"
            cy="500"
            r="320"
            fill="none"
            stroke="rgba(245,242,235,0.06)"
            strokeWidth="1"
          />
          <circle
            cx="500"
            cy="500"
            r="320"
            fill="none"
            stroke="url(#mkLoopGrad)"
            strokeWidth="2.5"
            strokeDasharray="48 28"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 500 500"
              to="360 500 500"
              dur="28s"
              repeatCount="indefinite"
            />
          </circle>
          {/* soft pulse dots along path */}
          {[0, 72, 144, 216, 288].map((deg) => {
            const r = 320;
            const a = ((deg - 90) * Math.PI) / 180;
            const x = 500 + r * Math.cos(a);
            const y = 500 + r * Math.sin(a);
            return (
              <circle
                key={deg}
                cx={x}
                cy={y}
                r="5"
                fill="#00B96B"
                opacity="0.85"
              />
            );
          })}
        </svg>

        <div className="mk-loop-center">
          <span className="mk-brand-delta">
            <RadrDeltaGlyph />
          </span>
          <strong>RADR</strong>
        </div>

        {NODES.map((n) => (
          <div
            key={n.pos}
            className="mk-loop-node"
            data-pos={n.pos}
            data-active={n.active ? "true" : undefined}
          >
            <em>{n.kicker}</em>
            <strong>{n.label}</strong>
          </div>
        ))}

        <div className="mk-loop-flow">
          {FLOW.map((step, i) => (
            <div key={step.label} style={{ display: "contents" }}>
              {i > 0 ? <span className="mk-loop-arrow">→</span> : null}
              <div
                className="mk-loop-step"
                data-final={"final" in step && step.final ? "true" : undefined}
              >
                <b>{step.value}</b>
                <span>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupCanvas>
  );
}
