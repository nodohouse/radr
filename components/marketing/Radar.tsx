"use client";

import { useEffect, useRef, useState } from "react";
import { DeltaOutline } from "./DeltaOutline";
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion";

export type RadarFinding = {
  id: string;
  amount: string;
  euros: number;
  title: string;
  tag?: string;
  x: number;
  y: number;
};

export const HERO_DEMO_FINDINGS: RadarFinding[] = [
  {
    id: "1",
    amount: "€18,620",
    euros: 18_620,
    title: "Supplier credit never received",
    tag: "Recoverable",
    x: 68,
    y: 32,
  },
  {
    id: "2",
    amount: "€4,280",
    euros: 4_280,
    title: "Duplicate invoice",
    tag: "Overpaid",
    x: 28,
    y: 58,
  },
  {
    id: "3",
    amount: "€142k / yr",
    euros: 142_000,
    title: "Pricing opportunity",
    tag: "Missed revenue",
    x: 74,
    y: 66,
  },
  {
    id: "4",
    amount: "€11,840 / mo",
    euros: 11_840,
    title: "Labor above demand",
    tag: "Avoidable",
    x: 30,
    y: 26,
  },
];

export const HERO_TOTAL_STEPS = [18_620, 22_900, 164_900, 176_740] as const;

type Phase = "ping" | "delta" | "value" | "detail" | "hold" | "fade";

type Active = {
  finding: RadarFinding;
  phase: Phase;
  key: number;
};

type Ghost = { id: string; x: number; y: number; stamp: number };

type Props = {
  findings?: RadarFinding[];
  status?: string;
  className?: string;
  locked?: RadarFinding | null;
  armSignals?: boolean;
  onDetect?: (finding: RadarFinding, index: number) => void;
};

export function Radar({
  findings = HERO_DEMO_FINDINGS,
  status = "Scanning 24/7",
  className = "",
  locked = null,
  armSignals = true,
  onDetect,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<Active[]>([]);
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const stampRef = useRef(0);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;

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
      findings.forEach((f, i) => onDetectRef.current?.(f, i));
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
      const detectIndex = i % findings.length;
      stampRef.current += 1;
      const key = stampRef.current;

      setActive((prev) => {
        const aging = prev.map((a) => ({ ...a, phase: "fade" as Phase }));
        return [...aging.slice(-1), { finding, phase: "ping" as Phase, key }];
      });
      setGhosts((g) => {
        const stamped = {
          id: finding.id,
          x: finding.x,
          y: finding.y,
          stamp: key,
        };
        return [...g.filter((x) => x.id !== finding.id), stamped].slice(-5);
      });

      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "delta" } : a,
              ),
            );
        }, 180),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setActive((prev) =>
            prev.map((a) =>
              a.key === key ? { ...a, phase: "value" } : a,
            ),
          );
          onDetectRef.current?.(finding, detectIndex);
        }, 380),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "detail" } : a,
              ),
            );
        }, 560),
      );
      timers.push(
        window.setTimeout(() => {
          if (!cancelled)
            setActive((prev) =>
              prev.map((a) =>
                a.key === key ? { ...a, phase: "hold" } : a,
              ),
            );
        }, 780),
      );
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          i += 1;
          run();
        }, 3200),
      );
    };

    timers.push(window.setTimeout(run, 400));
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [findings, locked, reduced, armSignals]);

  return (
    <div className={`rx-radar ${className}`.trim()} aria-hidden="true">
      <div className="rx-radar-stage">
        <svg className="rx-radar-geo" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="32" />
          <circle cx="100" cy="100" r="58" />
          <circle cx="100" cy="100" r="84" />
          <circle cx="100" cy="100" r="98" />
          <line x1="100" y1="4" x2="100" y2="196" />
          <line x1="4" y1="100" x2="196" y2="100" />
          {/* sparse tick marks */}
          <line x1="100" y1="14" x2="100" y2="20" />
          <line x1="100" y1="180" x2="100" y2="186" />
          <line x1="14" y1="100" x2="20" y2="100" />
          <line x1="180" y1="100" x2="186" y2="100" />
          <circle cx="100" cy="100" r="1.6" className="rx-radar-origin" />
        </svg>
        <div className="rx-radar-sweep" />
        <p className="rx-radar-status">{status}</p>

        {ghosts.map((g) => (
          <i
            key={g.stamp}
            className="rx-radar-ghost"
            style={{ left: `${g.x}%`, top: `${g.y}%` }}
          />
        ))}

        {active.map(({ finding, phase, key }) => (
          <div
            key={key}
            className="rx-radar-signal"
            data-phase={phase}
            style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
          >
            <i className="rx-radar-ping" />
            <div className="rx-radar-callout">
              <span className="rx-radar-tri">
                <DeltaOutline />
              </span>
              <span className="rx-radar-amt">{finding.amount}</span>
              <span className="rx-radar-title">{finding.title}</span>
              {finding.tag ? (
                <span className="rx-radar-tag">{finding.tag}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
