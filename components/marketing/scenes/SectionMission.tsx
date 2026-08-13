"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "../motion/useInView";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";

const LINES = [
  "RADR watches your operation 24/7",
  "and finds the money you're losing,",
  "missing or leaving behind.",
] as const;

const FULL = LINES.join("\n");

type Pulse = { id: string; label: string; x: number; y: number };

const PULSES: { at: string; pulse: Pulse }[] = [
  { at: "money", pulse: { id: "p1", label: "△ €18,620", x: 78, y: 28 } },
  { at: "losing", pulse: { id: "p2", label: "△ €4,280", x: 18, y: 52 } },
  { at: "missing", pulse: { id: "p3", label: "△ €142k", x: 72, y: 68 } },
];

export function SectionMission() {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 });
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? FULL : "");
  const [phase, setPhase] = useState<"idle" | "type" | "blink" | "done">(
    reduced ? "done" : "idle",
  );
  const [live, setLive] = useState(reduced);
  const [pulses, setPulses] = useState<Pulse[]>(
    reduced ? PULSES.map((p) => p.pulse) : [],
  );
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    if (reduced) {
      started.current = true;
      setShown(FULL);
      setPhase("done");
      setLive(true);
      setPulses(PULSES.map((p) => p.pulse));
      return;
    }
    started.current = true;
    setPhase("type");

    let i = 0;
    let timer: number;

    const pauseAt = new Set([
      FULL.indexOf("24/7") + 4,
      FULL.indexOf("money") + 5,
      FULL.indexOf("losing,") + 7,
      FULL.indexOf("missing") + 7,
    ]);

    const tick = () => {
      i += 1;
      const next = FULL.slice(0, i);
      setShown(next);

      if (next.includes("24/7")) setLive(true);

      for (const p of PULSES) {
        if (next.toLowerCase().includes(p.at)) {
          setPulses((prev) =>
            prev.some((x) => x.id === p.pulse.id) ? prev : [...prev, p.pulse],
          );
        }
      }

      if (i >= FULL.length) {
        setPhase("blink");
        let blinks = 0;
        const blinkId = window.setInterval(() => {
          blinks += 1;
          if (blinks >= 3) {
            window.clearInterval(blinkId);
            setPhase("done");
          }
        }, 420);
        return;
      }

      const pause = pauseAt.has(i) ? 160 : 0;
      timer = window.setTimeout(tick, 28 + pause);
    };

    timer = window.setTimeout(tick, 400);
    return () => window.clearTimeout(timer);
  }, [inView, reduced]);

  const display = shown.split("\n");

  return (
    <section
      className="radr-mission"
      id="mission"
      ref={ref}
      data-nav-theme="dark"
    >
      <div className="radr-mission-field" aria-hidden="true">
        {pulses.map((p) => (
          <span
            key={p.id}
            className="radr-mission-pulse"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            {p.label}
          </span>
        ))}
      </div>

      <div className="radr-shell radr-mission-inner">
        <p className="radr-mission-label">
          <span
            className="radr-mission-dot"
            data-live={live ? "true" : "false"}
          />
          RADR / ONLINE
          {live ? <em>● LIVE</em> : null}
        </p>
        <p className="radr-mission-line" aria-live="polite">
          {display.map((line, idx) => (
            <span key={idx} className="radr-mission-row">
              {line}
              {idx < display.length - 1 ? <br /> : null}
            </span>
          ))}
          {phase !== "done" ? (
            <span
              className="radr-mission-cursor"
              data-blink={phase === "blink" ? "true" : "false"}
              aria-hidden="true"
            >
              █
            </span>
          ) : (
            <span className="radr-mission-cursor radr-mission-cursor--rest" aria-hidden="true">
              █
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
