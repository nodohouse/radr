"use client";

/**
 * Systems → RADR → Decision — one-shot enter animation.
 */

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const SYSTEMS = [
  "POS",
  "PMS",
  "Labor",
  "Accounting",
  "Reservations",
  "Delivery",
  "Payments",
  "Channels",
] as const;

export function SystemsConnect() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setOn(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className="rx30-sysconnect"
      data-on={on ? "true" : undefined}
      aria-label="Source systems connecting into RADR"
    >
      <ul className="rx30-sysconnect-sources">
        {SYSTEMS.map((s, i) => (
          <li key={s} style={{ ["--i" as string]: i }}>
            {s}
          </li>
        ))}
      </ul>
      <div className="rx30-sysconnect-paths" aria-hidden="true">
        <svg viewBox="0 0 200 120" preserveAspectRatio="none">
          {SYSTEMS.map((_, i) => {
            const y = 10 + (i / Math.max(1, SYSTEMS.length - 1)) * 100;
            return (
              <path
                key={i}
                d={`M 0 ${y} C 70 ${y}, 110 60, 200 60`}
                style={{ ["--i" as string]: i }}
              />
            );
          })}
        </svg>
      </div>
      <div className="rx30-sysconnect-core">
        <strong>RADR</strong>
        <span>Decision layer</span>
      </div>
    </div>
  );
}
