"use client";

import { useEffect, useRef, useState } from "react";
import { Delta } from "./Delta";
import { usePrefersReducedMotion } from "./motion/usePrefersReducedMotion";

const drips = [
  "€38",
  "€420",
  "€1,840",
  "€76",
  "€8,200",
  "€14,400",
  "€112",
  "€4,820",
  "€48,000",
  "€1,240",
] as const;

const positions = [
  { x: 8, y: 18 },
  { x: 78, y: 22 },
  { x: 18, y: 58 },
  { x: 70, y: 48 },
  { x: 42, y: 12 },
  { x: 86, y: 68 },
  { x: 12, y: 78 },
  { x: 58, y: 72 },
  { x: 30, y: 36 },
  { x: 64, y: 30 },
] as const;

const running = [
  38, 458, 2298, 2374, 10574, 24974, 25086, 29906, 77906, 79146,
] as const;

const FINAL = 4_284_620;

function formatEuro(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function ValueAccumulator() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      setProgress(Math.min(1, Math.max(0, -rect.top / total)));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  const count = Math.floor(progress * drips.length);
  const converging = progress > 0.55;
  const quiet = progress > 0.82;
  const total =
    progress >= 0.9
      ? FINAL
      : count === 0
        ? 0
        : (running[Math.min(count - 1, running.length - 1)] ?? 0);

  return (
    <div
      ref={rootRef}
      className="radr-sticky-value"
      id="compound"
      data-nav-theme="dark"
    >
      <div className="radr-sticky-value-pin">
        <div className="radr-shell radr-sticky-value-inner">
          <h2
            className="radr-sticky-value-headline"
            data-fade={converging ? "true" : "false"}
          >
            Your business
            <br />
            is full of
            <br />
            small deltas.
          </h2>

          <div className="radr-sticky-value-field" aria-hidden="true">
            {drips.map((v, i) => {
              const pos = positions[i]!;
              const on = i < count;
              return (
                <span
                  key={v + i}
                  className="radr-sticky-drip"
                  data-on={on ? "true" : "false"}
                  data-converge={converging && on ? "true" : "false"}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                >
                  <Delta value={v} tone="bone" />
                </span>
              );
            })}
          </div>

          <div className="radr-sticky-value-total" data-quiet={quiet ? "true" : "false"}>
            <p className="value">{formatEuro(total)}</p>
            <p className="label" data-on={quiet ? "true" : "false"}>
              Verified value
            </p>
            <p className="sub" data-on={quiet ? "true" : "false"}>
              Small misses.
              <br />
              Serious money.
            </p>
            <p className="note">Illustrative · not a customer claim</p>
          </div>
        </div>
      </div>
    </div>
  );
}
