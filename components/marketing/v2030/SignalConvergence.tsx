"use client";

/**
 * Signals → Decision — continuous operating surface.
 * Decision marker at 19:48 · D-1911 shared with product proof.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";

const SIGNAL_STACK = [
  { id: "demand", label: "Demand ahead of plan", detail: "+21%", tone: "blue" as const },
  { id: "kit", label: "Kitchen pressure", detail: "Rising", tone: "amber" as const },
  { id: "inv", label: "Inventory risk", detail: "Key SKUs tight", tone: "red" as const },
  { id: "lab", label: "Labor", detail: "Floor stretched", tone: "amber" as const },
  { id: "del", label: "Delivery", detail: "+31%", tone: "blue" as const },
] as const;

type Beat = "signals" | "context" | "marker" | "decision" | "ease" | "rest";

const BEATS: { id: Beat; at: number }[] = [
  { id: "signals", at: 0 },
  { id: "context", at: 1600 },
  { id: "marker", at: 3400 },
  { id: "decision", at: 4800 },
  { id: "ease", at: 7000 },
  { id: "rest", at: 9500 },
];
const LOOP_MS = 12500;

function OperatingContextChart({
  active,
  marker,
  ease,
}: {
  active: boolean;
  marker: boolean;
  ease: boolean;
}) {
  return (
    <div
      className="rx-sig-chart"
      data-active={active ? "true" : undefined}
      data-marker={marker ? "true" : undefined}
      data-ease={ease ? "true" : undefined}
    >
      <header className="rx-sig-chart-head">
        <em>Operating context</em>
        <span>
          {PUBLIC_RESTAURANT.displayName} · {PUBLIC_RESTAURANT.clockLine}
        </span>
      </header>
      <svg
        className="rx-sig-chart-svg"
        viewBox="0 0 420 220"
        role="img"
        aria-label="Demand, kitchen, labor. Decision at 19:48"
      >
        <defs>
          <linearGradient id="rx-sig-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2F7FE8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#2F7FE8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[40, 80, 120, 160].map((y) => (
          <line
            key={y}
            x1="36"
            y1={y}
            x2="400"
            y2={y}
            stroke="rgba(10,13,11,0.08)"
            strokeWidth="1"
          />
        ))}
        {["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"].map((t, i) => (
          <text
            key={t}
            x={36 + i * 72}
            y="208"
            fill="#5A6660"
            fontSize="10"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
          >
            {t}
          </text>
        ))}
        {/* Decision moment ~19:48 ≈ x 385 */}
        <line
          x1="372"
          y1="28"
          x2="372"
          y2="180"
          stroke="#00A85A"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity={marker ? 0.9 : 0.15}
        />
        <text
          x="372"
          y="22"
          textAnchor="middle"
          fill="#00A85A"
          fontSize="9"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          opacity={marker ? 1 : 0.2}
        >
          19:48
        </text>
        <path
          d="M36 150 C70 148 100 140 130 120 C170 90 200 70 240 75 C280 80 310 95 350 60 C370 45 385 38 400 35"
          fill="url(#rx-sig-fill)"
          opacity={active ? 1 : 0.3}
        />
        <path
          d="M36 150 C70 148 100 140 130 120 C170 90 200 70 240 75 C280 80 310 95 350 60 C370 45 385 38 400 35"
          fill="none"
          stroke="#2F7FE8"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={active ? 1 : 0.35}
        />
        <path
          d="M36 160 C80 158 110 150 150 140 C190 128 230 110 270 95 C310 80 350 70 372 58"
          fill="none"
          stroke="#00A85A"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={active ? 1 : 0.3}
        />
        {/* Predicted ease after Decision */}
        <path
          d="M372 58 C385 52 392 48 400 55"
          fill="none"
          stroke="#00E676"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity={ease ? 0.95 : 0}
        />
        <path
          d="M36 170 C90 168 130 165 180 155 C230 145 280 130 330 125 C360 122 372 118 400 110"
          fill="none"
          stroke="#5B8DEF"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="5 4"
          opacity={active ? 0.85 : 0.25}
        />
        <g fontSize="10" fontFamily="ui-sans-serif, system-ui, sans-serif">
          <circle cx="36" cy="18" r="3.5" fill="#2F7FE8" />
          <text x="46" y="21" fill="#0A0D0B">
            Demand
          </text>
          <circle cx="110" cy="18" r="3.5" fill="#00A85A" />
          <text x="120" y="21" fill="#0A0D0B">
            Kitchen
          </text>
          <circle cx="190" cy="18" r="3.5" fill="#5B8DEF" />
          <text x="200" y="21" fill="#0A0D0B">
            Labor
          </text>
        </g>
      </svg>
    </div>
  );
}

function DecisionCard({ show }: { show: boolean }) {
  const r = PUBLIC_RESTAURANT;
  return (
    <article className="rx-sig-dec" data-on={show ? "true" : undefined} id="rx-sig-d1911">
      <p className="rx-sig-dec-brand">
        <FrozenRadrLogo variant="mark" theme="light" size="sm" decorative />
        <span>RADR Decision</span>
      </p>
      <div className="rx-sig-dec-topline">
        <span className="rx-sig-dec-id">{r.decisionId}</span>
        <span className="rx-sig-dec-badge">Recommendation</span>
      </div>
      <h3>{r.actionCompact}</h3>
      <p className="rx-sig-dec-meta-line">
        {r.displayName} · {r.clockLine}
      </p>
      <ul className="rx-sig-dec-metrics">
        <li>
          <span>Expected</span>
          <strong>{r.expectedFormatted}</strong>
        </li>
        <li>
          <span>Confidence</span>
          <strong>{r.confidencePct}%</strong>
        </li>
      </ul>
      <p className="rx-sig-dec-note">Illustrative RADR demo.</p>
    </article>
  );
}

export function SignalConvergence() {
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState<Beat>(reduced ? "rest" : "signals");

  useEffect(() => {
    if (reduced) {
      setBeat("rest");
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) % LOOP_MS;
      let next: Beat = "signals";
      for (const b of BEATS) if (t >= b.at) next = b.id;
      setBeat((c) => (c === next ? c : next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const contextOn = beat !== "signals";
  const markerOn = ["marker", "decision", "ease", "rest"].includes(beat);
  const decisionOn = ["decision", "ease", "rest"].includes(beat);
  const easeOn = beat === "ease" || beat === "rest";

  return (
    <section
      className="rx30-signal-sec rx30-signal-sec--board rx30-signal-sec--premium rx-chapter"
      aria-labelledby="rx30-signal-title"
    >
      <div className="rx30-shell">
        <header className="rx30-signal-intro">
          <p className="rx30-kicker">Signals → Decision</p>
          <h2 id="rx30-signal-title" className="rx30-h2 rx30-h2--balance">
            One operation. Many signals. One Decision.
          </h2>
        </header>

        <div className="rx-sig-frame" data-beat={beat}>
          <div className="rx-sig-frame-col rx-sig-frame-col--stack">
            <p className="rx-sig-stack-label">Signal stack</p>
            <ul className="rx-sig-stack" aria-label="Operating signals">
              {SIGNAL_STACK.map((s) => (
                <li key={s.id} data-tone={s.tone}>
                  <strong>{s.label}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rx-sig-frame-col rx-sig-frame-col--chart">
            <OperatingContextChart active={contextOn} marker={markerOn} ease={easeOn} />
          </div>

          <div className="rx-sig-frame-col rx-sig-frame-col--dec">
            <DecisionCard show={decisionOn} />
          </div>
        </div>
      </div>
    </section>
  );
}
