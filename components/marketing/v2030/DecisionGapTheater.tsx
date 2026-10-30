"use client";

/**
 * Decision Gap — sequential tiles → gap → RADR layer → Decision object.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const TILES = [
  "POS",
  "PMS",
  "Labor",
  "Accounting",
  "Channels",
] as const;

const STEPS = [
  {
    title: "Fragmented systems",
    body: "Each system holds a slice. Nobody owns the Decision between them.",
  },
  {
    title: "The gap becomes visible",
    body: "Invisible value leaks and unverified calls sit in the space between tools.",
  },
  {
    title: "RADR appears over the gap",
    body: "A Decision layer above the stack. evidence, futures, policy.",
  },
  {
    title: "A Decision object forms",
    body: "Ask · economics · confidence · prepare. Not another dashboard card.",
  },
] as const;

export function DecisionGapTheater() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) {
      setStep(3);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let timer: number | null = null;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return;
        let i = 0;
        setStep(0);
        timer = window.setInterval(() => {
          i += 1;
          setStep(Math.min(3, i));
          if (i >= 3 && timer) window.clearInterval(timer);
        }, 900);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearInterval(timer);
    };
  }, [reduced]);

  const copy = STEPS[step] ?? STEPS[0]!;

  return (
    <section
      ref={ref}
      className="rx30-gap-theater"
      aria-labelledby="rx30-pain-title"
      data-step={step}
    >
      <div className="rx30-shell">
        <p className="rx30-kicker">The Decision Gap</p>
        <h2 id="rx30-pain-title" className="rx30-h2">
          Exceptional hospitality. Held back by fragmented foundations.
        </h2>

        <div className="rx30-gap-stage" aria-hidden="true">
          <div className="rx30-gap-tiles">
            {TILES.map((t, i) => (
              <span key={t} style={{ ["--i" as string]: i }}>
                {t}
              </span>
            ))}
          </div>
          <div className="rx30-gap-void">
            <em>Decision Gap</em>
          </div>
          <div className="rx30-gap-layer">
            <strong>RADR</strong>
            <span>Decision layer</span>
          </div>
          <div className="rx30-gap-decision">
            <span>D-1911</span>
            <strong>Pace seating · 12 min</strong>
          </div>
        </div>

        <div className="rx30-gap-copy" aria-live="polite">
          <strong>{copy.title}</strong>
          <span>{copy.body}</span>
        </div>

        {!reduced ? (
          <div className="rx30-gap-dots" aria-hidden="true">
            {STEPS.map((_, i) => (
              <i key={i} data-on={i === step ? "true" : undefined} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
