"use client";

/**
 * Operating Memory — restaurant / hotel toggle.
 * Forecast narrowing + playbook evolution. DEMO sealed.
 */

import { useState } from "react";
import Link from "next/link";

type World = "restaurant" | "hotel";

const WORLDS: Record<
  World,
  {
    label: string;
    title: string;
    steps: { n: string | number; label: string; note: string }[];
    learned: string;
    error: string;
  }
> = {
  restaurant: {
    label: "Restaurants",
    title: "Friday peak capacity",
    steps: [
      { n: 12, label: "services", note: "Comparable Friday dinners" },
      { n: 5, label: "matches", note: "Same kitchen · inbound pattern" },
      { n: 4, label: "interventions", note: "Hold / throttle / feature" },
      { n: 3, label: "verified", note: "Outcome sealed" },
      { n: "V3", label: "playbook", note: "Now live" },
    ],
    learned:
      "Hold window when kitchen ≥90% and inbound ≥30 covers in <25m · VIP seat exception encoded.",
    error: "14.2% → 6.8%",
  },
  hotel: {
    label: "Hotels",
    title: "Check-in readiness wave",
    steps: [
      { n: 14, label: "waves", note: "Comparable check-in peaks" },
      { n: 6, label: "matches", note: "Same HK lag · arrival pattern" },
      { n: 4, label: "interventions", note: "Reassign / hold / recover" },
      { n: 3, label: "verified", note: "Outcome sealed" },
      { n: "V3", label: "playbook", note: "Now live" },
    ],
    learned:
      "Reassign 2 attendants when ready/arrivals <75% and Floor 3 lags · VIP early exception encoded.",
    error: "12.4% → 8.1%",
  },
};

const SERIES = [
  { id: "N01", error: 14.2 },
  { id: "N05", error: 11.8 },
  { id: "N12", error: 8.9 },
  { id: "N18", error: 6.8 },
] as const;

function ForecastSpark({ endLabel }: { endLabel: string }) {
  const w = 280;
  const h = 72;
  const pad = 8;
  const max = 16;
  const pts = SERIES.map((_, i) => {
    const x = pad + (i / (SERIES.length - 1)) * (w - pad * 2);
    const y = h - pad - (SERIES[i]!.error / max) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  return (
    <div className="rx-memw-spark" aria-label={`Forecast error ${endLabel}`}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={72} aria-hidden="true">
        <polyline
          points={pts}
          fill="none"
          stroke="#0a0d0b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {SERIES.map((p, i) => {
          const x = pad + (i / (SERIES.length - 1)) * (w - pad * 2);
          const y = h - pad - (p.error / max) * (h - pad * 2);
          const last = i === SERIES.length - 1;
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={last ? 4 : 3}
              fill={last ? "#00d978" : "#0a0d0b"}
            />
          );
        })}
      </svg>
      <p>
        Forecast error <strong>{endLabel}</strong>
      </p>
    </div>
  );
}

export function OperatingMemoryWorlds() {
  const [world, setWorld] = useState<World>("restaurant");
  const c = WORLDS[world];

  return (
    <section
      className="rx-memw"
      data-nav-theme="light"
      aria-labelledby="rx-memw-title"
    >
      <div className="rx-shell">
        <p className="rx-rec-k">Operating Memory</p>
        <h2 id="rx-memw-title" className="rx-rec-h">
          RADR remembers what worked for your operation.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "36rem" }}>
          Not a history dump. Comparable nights, interventions, verified
          outcomes — then a playbook.
        </p>

        <div className="rx-rh-toggle" role="tablist" aria-label="Example operating models">
          <button
            type="button"
            role="tab"
            className="rx-rh-tab"
            aria-selected={world === "restaurant"}
            data-active={world === "restaurant"}
            onClick={() => setWorld("restaurant")}
          >
            Restaurants
          </button>
          <button
            type="button"
            role="tab"
            className="rx-rh-tab"
            aria-selected={world === "hotel"}
            data-active={world === "hotel"}
            onClick={() => setWorld("hotel")}
          >
            Hotels
          </button>
        </div>

        <div className="rx-memw-panel" role="tabpanel">
          <p className="rx-rh-kicker">{c.label}</p>
          <h3 className="rx-rh-situation">{c.title}</h3>
          <ol className="rx-memw-steps">
            {c.steps.map((s) => (
              <li key={s.label}>
                <strong>{s.n}</strong>
                <span>{s.label}</span>
                <em>{s.note}</em>
              </li>
            ))}
          </ol>
          <p className="rx-memw-learned">{c.learned}</p>
          <ForecastSpark endLabel={c.error} />
          <Link href="/product/memory" className="rx-btn rx-btn-ghost">
            Open Operating Memory <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
