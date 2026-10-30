"use client";

/**
 * Demo markets rail — shared Home + Company.
 * Slow RTL · DEMO status · subtle network · no lifestyle photography.
 */

import { useEffect, useRef, useState } from "react";
import { PUBLIC_DEMO_MARKETS } from "@/lib/marketing/publicCanon";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

type Props = {
  title?: string;
  note?: string;
  className?: string;
};

function NetworkBackdrop({ active }: { active: number }) {
  const n = PUBLIC_DEMO_MARKETS.length;
  const nodes = PUBLIC_DEMO_MARKETS.map((_, i) => {
    const t = i / Math.max(1, n - 1);
    return { x: 8 + t * 84, y: 28 + Math.sin(t * Math.PI * 1.6) * 18 };
  });

  return (
    <svg
      className="rx30-marquee-net"
      viewBox="0 0 100 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {nodes.map((a, i) =>
        nodes.slice(i + 1).map((b, j) => (
          <line
            key={`${i}-${j}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            className="rx30-marquee-net-line"
          />
        )),
      )}
      {nodes.map((p, i) => (
        <circle
          key={PUBLIC_DEMO_MARKETS[i]!.city}
          cx={p.x}
          cy={p.y}
          r={i === active % n ? 1.6 : 0.9}
          className="rx30-marquee-net-node"
          data-on={i === active % n ? "true" : undefined}
        />
      ))}
    </svg>
  );
}

export function LocationsMarquee({
  title = "From iconic hotels to emerging destinations.",
  note = "Demo operating contexts across markets. Not a customer footprint.",
  className = "",
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [focal, setFocal] = useState(0);
  const [paused, setPaused] = useState(false);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const items = [...PUBLIC_DEMO_MARKETS, ...PUBLIC_DEMO_MARKETS];

  useEffect(() => {
    if (reduced) return;
    const nodes = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.left + a.boundingClientRect.width / 2 - window.innerWidth / 2) -
              Math.abs(b.boundingClientRect.left + b.boundingClientRect.width / 2 - window.innerWidth / 2),
          )[0];
        if (!hit) return;
        const idx = nodes.indexOf(hit.target as HTMLElement);
        if (idx >= 0) setFocal(idx % PUBLIC_DEMO_MARKETS.length);
      },
      { root: null, threshold: [0.4, 0.7], rootMargin: "0px -30% 0px -30%" },
    );

    nodes.slice(0, PUBLIC_DEMO_MARKETS.length).forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [reduced]);

  const list = reduced ? PUBLIC_DEMO_MARKETS : items;

  return (
    <section
      className={`rx30-marquee-sec ${className}`.trim()}
      aria-labelledby="rx30-marquee-title"
    >
      <div className="rx30-shell">
        <p className="rx30-kicker">Global by design</p>
        <h2 id="rx30-marquee-title" className="rx30-h2">
          {title}
        </h2>
        <p className="rx30-global-note">{note}</p>
        <p className="rx30-demo-label rx30-marquee-demo-label">
          DEMO OPERATING CONTEXT
        </p>
      </div>

      <div
        className="rx30-marquee rx30-marquee--chips"
        data-reduced={reduced ? "true" : undefined}
        data-paused={paused ? "true" : undefined}
        role="list"
        aria-label="Demo markets"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {!reduced ? <NetworkBackdrop active={focal} /> : null}
        <div className="rx30-marquee-track">
          {list.map((m, i) => {
            const active = i % PUBLIC_DEMO_MARKETS.length === focal;
            return (
              <article
                key={`${m.city}-${i}`}
                ref={(el) => {
                  if (i < PUBLIC_DEMO_MARKETS.length) cardRefs.current[i] = el;
                }}
                className="rx30-marquee-chip"
                role="listitem"
                data-on={active ? "true" : undefined}
                aria-hidden={i >= PUBLIC_DEMO_MARKETS.length ? true : undefined}
              >
                <strong>
                  <i className="rx30-market-dot" aria-hidden="true" />
                  {m.city}
                </strong>
                <span>
                  {m.currency} · {m.region}
                </span>
                <em className="rx30-marquee-status">
                  {m.clock} · {m.daypart}
                </em>
                {"grammar" in m && m.grammar ? (
                  <em className="rx30-marquee-grammar">{m.grammar}</em>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
