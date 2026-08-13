"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../motion/usePrefersReducedMotion";

const hits = [
  {
    city: "Barcelona",
    title: "Supplier credit missing",
    amount: 18620,
    label: "€18,620",
  },
  {
    city: "London",
    title: "Labor above demand",
    amount: 142080,
    label: "€11,840/mo",
    note: "annualized in total",
  },
  {
    city: "Paris",
    title: "Delivery commission increased",
    amount: 42800,
    label: "€42,800/yr",
  },
  {
    city: "Amsterdam",
    title: "Pricing opportunity",
    amount: 142000,
    label: "€142,000/yr",
  },
] as const;

const FINAL = 4_284_620;

function euro(n: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function SectionGroupScan() {
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    if (!root) return;
    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      const total = root.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      setP(Math.min(1, Math.max(0, -rect.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  const shown = Math.min(hits.length, Math.floor(p * (hits.length + 1)));
  const converging = p > 0.55;
  const done = p > 0.82;
  const running = hits
    .slice(0, shown)
    .reduce((sum, h) => sum + h.amount, 0);
  const total = done ? FINAL : running;

  return (
    <section
      className="radr-group"
      id="group"
      ref={rootRef}
      data-nav-theme="dark"
    >
      <div className="radr-group-pin">
        <div className="radr-shell">
          <p className="radr-cat">Demo · hotel group</p>
          <p className="radr-group-status" data-on={shown > 0 ? "true" : "false"}>
            <span className="radr-live-dot" />
            Scanning 18 locations
          </p>

          <div className="radr-group-hits">
            {hits.map((h, i) => (
              <article
                key={h.city}
                className="radr-group-hit"
                data-on={i < shown ? "true" : "false"}
                data-converge={converging && i < shown ? "true" : "false"}
              >
                <p className="radr-group-city">{h.city}</p>
                <p className="radr-group-title">{h.title}</p>
                <p className="radr-group-amt">
                  <span className="radr-tri" aria-hidden="true">
                    △
                  </span>{" "}
                  <span className="radr-money">{h.label}</span>
                </p>
              </article>
            ))}
          </div>

          <div className="radr-group-total" data-done={done ? "true" : "false"}>
            <p className="radr-money radr-group-sum">{euro(total)}</p>
            <p className="radr-group-label" data-on={done ? "true" : "false"}>
              Verified value
            </p>
            <p className="radr-group-sub" data-on={done ? "true" : "false"}>
              Small misses.
              <br />
              Serious money.
            </p>
            <p className="radr-group-note">Illustrative demo · not a customer claim</p>
          </div>
        </div>
      </div>
    </section>
  );
}
