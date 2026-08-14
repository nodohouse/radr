"use client";

import { useEffect, useRef, useState } from "react";
import {
  useDocumentVisible,
  useReducedMotionSafe,
} from "../motion/useReducedMotionSafe";

export type RadarFindingView = {
  id: string;
  amount: string;
  period: string;
  title: string;
  tag: string;
};

type Props = {
  className?: string;
  armed?: boolean;
  findings?: readonly RadarFindingView[];
  activeIndex?: number;
  /** Change to retrigger ping animation */
  pingKey?: string;
};

/** Precision radar — quiet geometry, signal-forward. Pauses offscreen. */
export function RadarScanner({
  className = "",
  armed = true,
  findings = [],
  activeIndex = -1,
  pingKey,
}: Props) {
  const reduced = useReducedMotionSafe();
  const docVisible = useDocumentVisible();
  const rootRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pulse, setPulse] = useState(0);
  const spin = armed && inView && docVisible && !reduced;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => setInView(Boolean(e?.isIntersecting)),
      { threshold: 0.05, rootMargin: "40px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!pingKey || reduced) return;
    setPulse((n) => n + 1);
  }, [pingKey, reduced]);

  const positions = [
    { x: 70, y: 32 },
    { x: 30, y: 62 },
    { x: 72, y: 68 },
  ];

  const visible = findings.slice(0, 3);

  return (
    <div
      ref={rootRef}
      className={`rx-radar ${className}`.trim()}
      aria-hidden="true"
      data-pulse={pulse}
    >
      <div className="rx-radar-stage">
        <svg className="rx-radar-geo" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="42" />
          <circle cx="100" cy="100" r="64" />
          <circle cx="100" cy="100" r="84" />
          <circle cx="100" cy="100" r="98" />
          <line x1="100" y1="8" x2="100" y2="192" />
          <line x1="8" y1="100" x2="192" y2="100" />
          <line
            className="rx-radar-diag"
            x1="30"
            y1="30"
            x2="170"
            y2="170"
          />
          <line
            className="rx-radar-diag"
            x1="170"
            y1="30"
            x2="30"
            y2="170"
          />
          <circle cx="100" cy="100" r="2" className="rx-radar-origin" />
        </svg>

        <div className="rx-radar-sweep" data-spin={spin ? "true" : "false"} />

        <p className="rx-radar-live">
          <span className="rx-live-dot" data-on={spin ? "true" : "false"} />
          RADR / LIVE
        </p>

        {visible.map((f, i) => {
          const pos = positions[i]!;
          const on = activeIndex === i;
          const ghost = activeIndex > i;
          return (
            <div
              key={f.id}
              className="rx-radar-blip"
              data-on={on ? "true" : "false"}
              data-ghost={ghost && !on ? "true" : "false"}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <i className="rx-radar-ping" />
              {on ? (
                <div className="rx-radar-callout">
                  <em className="rx-tri">△</em>
                  <strong className="rx-money">
                    {f.amount}
                    {f.period}
                  </strong>
                  <span>{f.title}</span>
                  <b>{f.tag}</b>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
