"use client";

/**
 * Operating Memory — uncertainty converges as nights accumulate.
 * Futures is divergence. Memory is convergence.
 */

import { useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CTAS } from "@/lib/marketing/brand";
import { CANON_PEAK } from "@/lib/radr/decision/demo/canonical";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const NIGHTS = [
  {
    id: "n01",
    night: "Night 01",
    short: "01",
    error: "14.2%",
    errorNum: 14.2,
    label: "Wide uncertainty · first comparable nights",
    x: 72,
    half: 72,
    cases: 1,
  },
  {
    id: "n05",
    night: "Night 05",
    short: "05",
    error: "11.4%",
    errorNum: 11.4,
    label: "Uncertainty narrowing",
    x: 220,
    half: 48,
    cases: 5,
  },
  {
    id: "n12",
    night: "Night 12",
    short: "12",
    error: "8.9%",
    errorNum: 8.9,
    label: "Pattern consolidating",
    x: 380,
    half: 28,
    cases: 12,
  },
  {
    id: "n18",
    night: "Night 18",
    short: "18",
    error: "6.8%",
    errorNum: 6.8,
    label: "Tight calibration · ready for policy",
    x: 540,
    half: 11,
    cases: 18,
  },
] as const;

const MID = 132;

/** Continuous converging envelope — learning made visible. */
function envelopePath(): string {
  const tops = NIGHTS.map((n) => `${n.x},${MID - n.half}`);
  const bots = [...NIGHTS]
    .reverse()
    .map((n) => `${n.x},${MID + n.half}`);
  return `M ${tops[0]}
    C ${NIGHTS[0]!.x + 40},${MID - NIGHTS[0]!.half}, ${NIGHTS[1]!.x - 40},${MID - NIGHTS[1]!.half}, ${tops[1]}
    C ${NIGHTS[1]!.x + 40},${MID - NIGHTS[1]!.half}, ${NIGHTS[2]!.x - 40},${MID - NIGHTS[2]!.half}, ${tops[2]}
    C ${NIGHTS[2]!.x + 40},${MID - NIGHTS[2]!.half}, ${NIGHTS[3]!.x - 40},${MID - NIGHTS[3]!.half}, ${tops[3]}
    L ${bots[0]}
    C ${NIGHTS[3]!.x - 40},${MID + NIGHTS[3]!.half}, ${NIGHTS[2]!.x + 40},${MID + NIGHTS[2]!.half}, ${bots[1]}
    C ${NIGHTS[2]!.x - 40},${MID + NIGHTS[2]!.half}, ${NIGHTS[1]!.x + 40},${MID + NIGHTS[1]!.half}, ${bots[2]}
    C ${NIGHTS[1]!.x - 40},${MID + NIGHTS[1]!.half}, ${NIGHTS[0]!.x + 40},${MID + NIGHTS[0]!.half}, ${bots[3]}
    Z`;
}

function centerline(): string {
  return `M ${NIGHTS[0]!.x} ${MID}
    C ${NIGHTS[0]!.x + 50} ${MID - 2}, ${NIGHTS[1]!.x - 40} ${MID + 2}, ${NIGHTS[1]!.x} ${MID}
    C ${NIGHTS[1]!.x + 50} ${MID - 1}, ${NIGHTS[2]!.x - 40} ${MID + 1}, ${NIGHTS[2]!.x} ${MID}
    C ${NIGHTS[2]!.x + 50} ${MID}, ${NIGHTS[3]!.x - 40} ${MID - 1}, ${NIGHTS[3]!.x} ${MID}`;
}

export function MemoryCalibrationChapter() {
  const [idx, setIdx] = useState(3);
  const night = NIGHTS[idx]!;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Platform · Operating Memory · Historical · {CANON_PEAK.displayId}
            </p>
            <h1 className="rx-ch-title">
              14.2% → 6.8% forecast error.
              <br />
              Uncertainty narrows.
            </h1>
          </div>

          <div className="rx-shell">
            <div className="rx-mem-cal" aria-label="Forecast calibration">
              <div
                className="rx-mem-cal-scrub"
                role="tablist"
                aria-label="Night"
              >
                {NIGHTS.map((n, i) => (
                  <button
                    key={n.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === i}
                    data-on={idx === i ? "true" : undefined}
                    onClick={() => setIdx(i)}
                  >
                    {n.night}
                  </button>
                ))}
              </div>

              <svg
                className="rx-mem-cal-svg"
                viewBox="0 0 640 248"
                role="img"
                aria-label={`Uncertainty narrows from 14.2% to 6.8% forecast error across 18 nights. Currently ${night.night}, ${night.error}.`}
              >
                {/* Full learning envelope — always visible */}
                <path
                  d={envelopePath()}
                  fill="rgba(10, 13, 11, 0.07)"
                  className="rx-mem-cal-band"
                />

                {/* Active night emphasis ring */}
                <ellipse
                  cx={night.x}
                  cy={MID}
                  rx={Math.max(night.half * 0.55, 10)}
                  ry={night.half}
                  fill="rgba(10, 13, 11, 0.08)"
                  stroke="rgba(10, 13, 11, 0.16)"
                  strokeWidth="1"
                  className="rx-mem-cal-focus"
                />

                {/* Predicted baseline */}
                <path
                  d={centerline()}
                  fill="none"
                  stroke="#0a0d0b"
                  strokeWidth="1.85"
                  strokeLinecap="round"
                />

                {NIGHTS.map((n, i) => {
                  const on = i === idx;
                  return (
                    <g
                      key={n.id}
                      className="rx-mem-cal-night"
                      data-on={on ? "true" : undefined}
                      style={{ cursor: "pointer" }}
                      onClick={() => setIdx(i)}
                    >
                      <line
                        x1={n.x}
                        y1={MID - n.half}
                        x2={n.x}
                        y2={MID + n.half}
                        stroke={
                          on ? "rgba(10,13,11,0.35)" : "rgba(10,13,11,0.12)"
                        }
                        strokeWidth="1"
                        strokeDasharray={on ? "none" : "2 3"}
                      />
                      <circle
                        cx={n.x}
                        cy={MID}
                        r={on ? 4.5 : 3}
                        fill={on ? "#0a0d0b" : "rgba(10,13,11,0.4)"}
                      />
                      <text
                        x={n.x}
                        y="28"
                        textAnchor="middle"
                        fill={on ? "#0a0d0b" : "#626a65"}
                        fontSize="9"
                        fontFamily="IBM Plex Mono, ui-monospace, monospace"
                        letterSpacing="0.12em"
                      >
                        NIGHT {n.short}
                      </text>
                      <text
                        x={n.x}
                        y={MID - n.half - 10}
                        textAnchor="middle"
                        fill={on ? "#0a0d0b" : "#4a524e"}
                        fontSize={on ? "18" : "13"}
                        fontWeight={on ? "650" : "560"}
                        fontFamily="Instrument Sans, system-ui, sans-serif"
                        letterSpacing="-0.03em"
                      >
                        {n.error}
                      </text>
                    </g>
                  );
                })}

                <text
                  x={NIGHTS[0]!.x}
                  y="236"
                  textAnchor="middle"
                  fill="#4a524e"
                  fontSize="12"
                  fontFamily="Instrument Sans, system-ui, sans-serif"
                >
                  forecast error
                </text>
                <text
                  x={NIGHTS[3]!.x}
                  y="236"
                  textAnchor="middle"
                  fill="#626a65"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                  letterSpacing="0.08em"
                >
                  18 COMPARABLE NIGHTS
                </text>
              </svg>

              <p className="rx-mem-cal-note">{night.label}</p>
            </div>

            <div className="rx-mem-playbook">
              <p className="rx-ch-kicker">Playbook v3</p>
              <h2 className="rx-mem-playbook-h">
                Hold two walk-in tables for 12 minutes.
              </h2>
              <dl className="rx-mem-playbook-rules">
                <div>
                  <dt>When</dt>
                  <dd>Kitchen ≥90% and ≥30 covers inbound within 25 minutes</dd>
                </div>
                <div>
                  <dt>Then</dt>
                  <dd>
                    Hold walk-ins · throttle delivery · feature high $/min dish
                  </dd>
                </div>
                <div>
                  <dt>Based on</dt>
                  <dd>
                    18 comparable nights · {CANON_PEAK.displayId}
                  </dd>
                </div>
              </dl>
              <p className="rx-mem-playbook-basis">
                Outcome-grounded · not chat memory
              </p>
            </div>

            <div className="rx-ch-ctas" style={{ marginTop: "2.5rem" }}>
              <NextLink href="/signup?intent=demo&next=/app/enter" className="rx-btn rx-btn-primary">
                {CTAS.primaryProduct} <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/product/value" className="rx-btn rx-btn-ghost">
                Verified Value
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
