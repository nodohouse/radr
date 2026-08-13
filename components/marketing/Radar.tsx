"use client";

import { useEffect, useRef, useState } from "react";
import { DeltaOutline } from "./DeltaOutline";
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion";

export type RadarFinding = {
  id: string;
  amount: string;
  title: string;
  tag?: string;
  x: number;
  y: number;
};

const DEMO: RadarFinding[] = [
  {
    id: "1",
    amount: "€18,620",
    title: "Supplier credit never received",
    tag: "Recoverable",
    x: 66,
    y: 34,
  },
  {
    id: "2",
    amount: "€4,280",
    title: "Duplicate invoice",
    tag: "Overpaid",
    x: 30,
    y: 56,
  },
  {
    id: "3",
    amount: "€142k / yr",
    title: "Pricing opportunity",
    tag: "Missed revenue",
    x: 72,
    y: 64,
  },
  {
    id: "4",
    amount: "€11,840 / mo",
    title: "Labor above demand",
    tag: "Avoidable",
    x: 28,
    y: 28,
  },
];

type Phase = "ping" | "delta" | "value" | "hold" | "fade";

type Active = {
  finding: RadarFinding;
  phase: Phase;
  key: number;
};

type Ghost = {
  id: string;
  x: number;
  y: number;
  stamp: number;
};

type Props = {
  findings?: RadarFinding[];
  status?: string;
  className?: string;
  locked?: RadarFinding | null;
  /** Delay first money ping until typewriter / choreography is ready */
  armSignals?: boolean;
};

export function Radar({
  findings = DEMO,
  status = "Scanning 24/7",
  className = "",
  locked = null,
  armSignals = true,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<Active[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [cycle, setCycle] = useState(0);
  const stampRef = useRef(0);

  useEffect(() => {
    if (locked) {
      setActive([{ finding: locked, phase: "hold", key: 0 }]);
      setGhosts([]);
      return;
    }

    if (reduced) {
      setActive(
        findings.slice(0, 2).map((f, i) => ({
          finding: f,
          phase: "hold" as const,
          key: i,
        })),
      );
      return;
    }

    if (!armSignals) {
      setActive([]);
      return;
    }

    let i = 0;
    let cancelled = false;
    const timers: number[] = [];

    const run = () => {
      if (cancelled) return;
      const finding = findings[i % findings.length]!;
      stampRef.current += 1;
      const key = stampRef.current;
      setCycle((c) => c + 1);

      setActive((prev) => {
        const aging = prev.map((a) => ({ ...a, phase: "fade" as Phase }));
        const kept = aging.slice(-1);
        return [...kept, { finding, phase: "ping" as Phase, key }];
      });
      setGhosts((g) => {
        const stamped: Ghost = {
          id: finding.id,
          x: finding.x,
          y: finding.y,
          stamp: key,
        };
        // One ghost per finding id — avoids duplicate React keys on cycle
        return [...g.filter((x) => x.id !== finding.id), stamped].slice(-6);
      });

      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "delta" } : a,
              ),
            );
        }, 220),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "value" } : a,
              ),
            );
        }, 420),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "hold" } : a,
              ),
            );
        }, 700),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          i += 1;
          run();
        }, 2800),
      );
    };

    // First money ping ~0.6s after arm — visitor must see money immediately
    timers.push(window.setTimeout(run, 600));

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [findings, locked, reduced, armSignals]);

  return (
    <div
      className={`radr-radar ${className}`.trim()}
      aria-hidden="true"
      data-cycle={cycle}
    >
      <div className="radr-radar-stage">
        <svg className="radr-radar-geo" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="28" />
          <circle cx="100" cy="100" r="52" />
          <circle cx="100" cy="100" r="76" />
          <circle cx="100" cy="100" r="96" />
          <line x1="100" y1="2" x2="100" y2="198" />
          <line x1="2" y1="100" x2="198" y2="100" />
          <line x1="28" y1="28" x2="172" y2="172" />
          <line x1="172" y1="28" x2="28" y2="172" />
          <circle cx="100" cy="100" r="2" className="radr-radar-origin" />
        </svg>

        <div className="radr-radar-sweep" />

        <p className="radr-radar-status">{status}</p>

        {ghosts.map((g) => (
          <i
            key={g.stamp}
            className="radr-radar-ghost"
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
          />
        ))}

        {active.map(({ finding, phase, key }) => (
          <div
            key={key}
            className="radr-radar-signal"
            data-phase={phase}
            style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
          >
            <i className="radr-radar-ping" />
            <div className="radr-radar-callout">
              <span className="radr-radar-tri">
                <DeltaOutline />
              </span>
              <span className="radr-radar-amt radr-money">{finding.amount}</span>
              <span className="radr-radar-title">{finding.title}</span>
              {finding.tag ? (
                <span className="radr-radar-tag">{finding.tag}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
