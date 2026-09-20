"use client";

/**
 * Operating Memory — narrowing uncertainty calibration visual.
 * Night 01 (14.2%) → Night 18 (6.8%) → Playbook v3.
 */

import { useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { CTAS } from "@/lib/marketing/brand";
import {
  CANON_PEAK,
  canonScenario,
} from "@/lib/radr/decision/demo/canonical";
import "@/app/product-chapters.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

const NIGHTS = [
  {
    id: "n01",
    night: "Night 01",
    error: "14.2%",
    label: "14.2% forecast error",
    band: 78,
    cases: 1,
  },
  {
    id: "n05",
    night: "Night 05",
    error: "11.4%",
    label: "Uncertainty narrowing",
    band: 54,
    cases: 5,
  },
  {
    id: "n12",
    night: "Night 12",
    error: "8.9%",
    label: "Pattern consolidating",
    band: 34,
    cases: 12,
  },
  {
    id: "n18",
    night: "Night 18",
    error: "6.8%",
    label: "6.8% forecast error",
    band: 16,
    cases: 18,
  },
] as const;

export function MemoryCalibrationChapter() {
  const [idx, setIdx] = useState(0);
  const night = NIGHTS[idx]!;
  const withMemory = canonScenario(CANON_PEAK, "wait_12");
  const mid = 120;
  const half = night.band / 2;

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-ch-kicker">
              Platform · Operating Memory · Historical · D-1911
            </p>
            <h1 className="rx-ch-title">
              14.2% → 6.8%.
              <br />
              Calibration — not chat history.
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
                viewBox="0 0 640 240"
                role="img"
                aria-label={`${night.label}. Uncertainty band width represents forecast error.`}
              >
                {/* Soft field */}
                <rect
                  x="40"
                  y="24"
                  width="560"
                  height="180"
                  fill="rgba(10,13,11,0.02)"
                  rx="2"
                />

                {/* Uncertainty band */}
                <path
                  d={`M 56 ${mid - half}
                      C 180 ${mid - half * 0.85}, 360 ${mid - half * 0.7}, 584 ${mid - half * 0.55}
                      L 584 ${mid + half * 0.55}
                      C 360 ${mid + half * 0.7}, 180 ${mid + half * 0.85}, 56 ${mid + half}
                      Z`}
                  fill="rgba(10, 13, 11, 0.08)"
                  className="rx-mem-cal-band"
                />

                {/* Predicted baseline */}
                <path
                  d={`M 56 ${mid} C 200 ${mid - 6}, 400 ${mid + 4}, 584 ${mid - 2}`}
                  fill="none"
                  stroke="#0a0d0b"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />

                <text
                  x="56"
                  y="28"
                  fill="#626a65"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                  letterSpacing="0.12em"
                >
                  {night.night.toUpperCase()}
                </text>
                <text
                  x="56"
                  y="48"
                  fill="#0a0d0b"
                  fontSize="18"
                  fontWeight="650"
                  fontFamily="Instrument Sans, system-ui, sans-serif"
                >
                  {night.error} forecast error
                </text>
                <text
                  x="584"
                  y="48"
                  textAnchor="end"
                  fill="#626a65"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, ui-monospace, monospace"
                  letterSpacing="0.08em"
                >
                  {night.cases} similar nights
                </text>
              </svg>

              <p className="rx-mem-cal-note">{night.label}</p>
            </div>

            <div className="rx-mem-playbook">
              <p className="rx-ch-kicker">Playbook v3</p>
              <h2 className="rx-mem-playbook-h">
                {withMemory?.title ?? "Wait 12 minutes"}
              </h2>
              <p>
                Auto-stage now allowed within policy. More Decisions → better
                calibration → better operating judgment.
              </p>
            </div>

            <div className="rx-ch-ctas" style={{ marginTop: "2.5rem" }}>
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
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
