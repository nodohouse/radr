"use client";

/**
 * Hero visual — mockup fidelity: systems → RADR → Next Decision (dark module).
 * Grid for content. Absolute only for SVG signal paths / atmosphere.
 * Animation: ~4–5s loop.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RadrMarkNode } from "@/components/brand/RadrMarkNode";
import { PUBLIC_RESTAURANT } from "@/lib/marketing/publicCanon";

export type HeroConnectVertical = "restaurant" | "hotel";

const SOURCES = [
  { id: "res", label: "Reservations", detail: "Demand inbound" },
  { id: "pos", label: "POS", detail: "Sales · menu mix" },
  { id: "pms", label: "PMS", detail: "Stay · occupancy" },
  { id: "acc", label: "Accounting", detail: "Labor · margin" },
  { id: "ch", label: "Channels", detail: "Direct · delivery" },
] as const;

const PROCESS = ["Observe", "Understand", "Compare", "Decide"] as const;

const EVIDENCE = [
  { k: "Demand", v: "+21%" },
  { k: "Kitchen", v: "Rising" },
  { k: "Labor", v: "Stretched" },
] as const;

type Phase =
  | "systems"
  | "inflow"
  | "activate"
  | "outflow"
  | "decision"
  | "value"
  | "hold";

const PHASES: { id: Phase; at: number }[] = [
  { id: "systems", at: 0 },
  { id: "inflow", at: 500 },
  { id: "activate", at: 1200 },
  { id: "outflow", at: 2000 },
  { id: "decision", at: 2800 },
  { id: "value", at: 3600 },
  { id: "hold", at: 4200 },
];
const LOOP_MS = 7200;

type Props = { vertical: HeroConnectVertical };

export function HeroConnectMap({ vertical: _vertical }: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(reduced ? "hold" : "systems");
  const r = PUBLIC_RESTAURANT;

  useEffect(() => {
    if (reduced) {
      setPhase("hold");
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = (now - t0) % LOOP_MS;
      let next: Phase = "systems";
      for (const p of PHASES) if (t >= p.at) next = p.id;
      setPhase((c) => (c === next ? c : next));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const showIn = phase !== "systems";
  const hubOn = !["systems", "inflow"].includes(phase);
  const showProcess = hubOn;
  const showOut = ["outflow", "decision", "value", "hold"].includes(phase);
  const showDecision = ["decision", "value", "hold"].includes(phase);
  const showValue = ["value", "hold"].includes(phase);

  return (
    <div
      className="rx-hcm rx-hcm--grid rx-hcm--mock"
      data-phase={phase}
      aria-label="RADR turns systems into decisions"
    >
      <div className="rx-hcm-atmos rx-hcm-atmos--blue" aria-hidden />
      <div className="rx-hcm-atmos rx-hcm-atmos--green" aria-hidden />

      <svg className="rx-hcm-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="hcmIn" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4B9FFF" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2F7FE8" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="hcmOut" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00E676" stopOpacity="1" />
            <stop offset="100%" stopColor="#00D978" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {[20, 35, 50, 65, 80].map((y, i) => (
          <path
            key={`in-${i}`}
            d={`M26 ${y} C34 ${y} 38 50 44 50`}
            fill="none"
            stroke="url(#hcmIn)"
            strokeWidth="0.7"
            opacity={showIn ? 1 : 0.2}
          />
        ))}
        {[38, 50, 62].map((y, i) => (
          <path
            key={`out-${i}`}
            d={`M56 50 C64 50 68 ${y} 74 ${y}`}
            fill="none"
            stroke="url(#hcmOut)"
            strokeWidth="0.75"
            opacity={showOut ? 1 : 0.15}
          />
        ))}
      </svg>

      <div className="rx-hcm-zone rx-hcm-zone--systems">
        <p className="rx-hcm-zone-label" data-tone="blue">
          Your systems
        </p>
        <ul className="rx-hcm-list rx-hcm-list--rows">
          {SOURCES.map((s) => (
            <li key={s.id}>
              <i className="rx-hcm-dot" data-tone="blue" aria-hidden />
              <span>
                <strong>{s.label}</strong>
                <em>{s.detail}</em>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rx-hcm-zone rx-hcm-zone--radr" data-active={hubOn ? "true" : undefined}>
        <div className="rx-hcm-core">
          <RadrMarkNode theme="light" priority />
        </div>
        <ol className="rx-hcm-process" data-on={showProcess ? "true" : undefined}>
          {PROCESS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </div>

      <div className="rx-hcm-zone rx-hcm-zone--out">
        <p className="rx-hcm-zone-label" data-tone="green">
          Next Decision
        </p>
        <aside
          className="rx-hcm-dec rx-hcm-dec--dark"
          data-on={showDecision ? "true" : undefined}
        >
          <div className="rx-hcm-dec-top">
            <span>{r.decisionId}</span>
            <em>Recommended</em>
          </div>
          <strong>{r.actionCompact}</strong>
          <ul className="rx-hcm-dec-evidence" data-on={showValue ? "true" : undefined}>
            {EVIDENCE.map((e) => (
              <li key={e.k}>
                <span>{e.k}</span>
                <b>{e.v}</b>
              </li>
            ))}
          </ul>
          <div className="rx-hcm-dec-metrics" data-on={showValue ? "true" : undefined}>
            <div>
              <span>Expected</span>
              <strong>{r.expectedFormatted}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{r.confidencePct}%</strong>
            </div>
          </div>
          <a className="rx-hcm-dec-cta" href="#decision-gap">
            Review Decision <span aria-hidden>→</span>
          </a>
        </aside>
      </div>
    </div>
  );
}
