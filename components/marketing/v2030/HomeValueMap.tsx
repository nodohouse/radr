"use client";

/**
 * Value Calculator map — mockup composition:
 * center RADR · four opportunity nodes · SVG connectors.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RadrMarkNode } from "@/components/brand/RadrMarkNode";

const NODES = [
  {
    id: "revenue",
    sector: "revenue",
    tone: "green" as const,
    title: "Revenue opportunity",
    value: "+$28K",
    detail: "per month",
    priority: true,
  },
  {
    id: "labor",
    sector: "labor",
    tone: "blue" as const,
    title: "Labor efficiency",
    value: "+12%",
    detail: "capacity",
    priority: false,
  },
  {
    id: "food",
    sector: "food",
    tone: "green" as const,
    title: "Food cost savings",
    value: "+3–6%",
    detail: "of COGS",
    priority: false,
  },
  {
    id: "guest",
    sector: "guest",
    tone: "blue" as const,
    title: "Guest experience",
    value: "+0.4",
    detail: "rating",
    priority: false,
  },
] as const;

type Beat = "nodes" | "flow" | "analyze" | "priority" | "hold";

const BEATS: { id: Beat; at: number }[] = [
  { id: "nodes", at: 0 },
  { id: "flow", at: 700 },
  { id: "analyze", at: 1400 },
  { id: "priority", at: 2200 },
  { id: "hold", at: 3000 },
];
const LOOP_MS = 6500;

export function HomeValueMap() {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState<Beat>(reduced ? "hold" : "nodes");

  useEffect(() => {
    if (reduced) {
      setBeat("hold");
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) % LOOP_MS;
      let next: Beat = "nodes";
      for (const b of BEATS) if (t >= b.at) next = b.id;
      setBeat((c) => (c === next ? c : next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const showFlow = beat !== "nodes";
  const showCore = ["analyze", "priority", "hold"].includes(beat);
  const showPriority = beat === "priority" || beat === "hold";

  return (
    <div className="rx-vmap" data-beat={beat} aria-hidden="true">
      <svg className="rx-vmap-wires" viewBox="0 0 520 520" aria-hidden>
        <defs>
          <linearGradient id="rx-vmap-b" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4B9FFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2F7FE8" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="rx-vmap-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00E676" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00D978" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle
          cx="260"
          cy="260"
          r="168"
          fill="none"
          stroke="rgba(0,230,118,0.28)"
          strokeWidth="1.2"
          strokeDasharray="5 8"
          opacity={showFlow ? 1 : 0.25}
        />
        <circle
          cx="260"
          cy="260"
          r="112"
          fill="none"
          stroke="rgba(47,127,232,0.28)"
          strokeWidth="1.1"
          opacity={showFlow ? 1 : 0.2}
        />
        {/* Revenue top */}
        <path
          d="M260 260 L260 92"
          fill="none"
          stroke="url(#rx-vmap-g)"
          strokeWidth="1.6"
          opacity={showFlow ? 1 : 0.15}
        />
        {/* Labor right */}
        <path
          d="M260 260 L428 260"
          fill="none"
          stroke="url(#rx-vmap-b)"
          strokeWidth="1.5"
          opacity={showFlow ? 1 : 0.15}
        />
        {/* Food bottom */}
        <path
          d="M260 260 L260 428"
          fill="none"
          stroke="url(#rx-vmap-g)"
          strokeWidth="1.5"
          opacity={showFlow ? 0.85 : 0.12}
        />
        {/* Guest left */}
        <path
          d="M260 260 L92 260"
          fill="none"
          stroke="url(#rx-vmap-b)"
          strokeWidth="1.5"
          opacity={showFlow ? 0.85 : 0.12}
        />
        <circle cx="260" cy="92" r="4" fill="#00E676" opacity={showFlow ? 1 : 0.2} />
        <circle cx="428" cy="260" r="4" fill="#2F7FE8" opacity={showFlow ? 1 : 0.2} />
        <circle cx="260" cy="428" r="4" fill="#00E676" opacity={showFlow ? 0.9 : 0.15} />
        <circle cx="92" cy="260" r="4" fill="#2F7FE8" opacity={showFlow ? 0.9 : 0.15} />
      </svg>

      <div className="rx-vmap-core" data-on={showCore ? "true" : undefined}>
        <RadrMarkNode theme="light" priority />
      </div>

      {NODES.map((n) => (
        <article
          key={n.id}
          className="rx-vmap-node"
          data-sector={n.sector}
          data-tone={n.tone}
          data-priority={n.priority && showPriority ? "true" : undefined}
          data-on={beat !== "nodes" ? "true" : undefined}
        >
          <strong>{n.title}</strong>
          <em>{n.value}</em>
          <span>{n.detail}</span>
          {n.priority ? <b className="rx-vmap-start">Start here</b> : null}
        </article>
      ))}
    </div>
  );
}
