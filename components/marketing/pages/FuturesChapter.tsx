"use client";

/**
 * Futures — signature trajectory visual.
 * Three paths through time → observation → verification → learning.
 * Product economics unchanged.
 */

import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  buildOrphanFutures,
  ORPHAN_FUTURES_ACTUAL,
} from "@/lib/radr/decision/futures";
import {
  CANON_ORPHAN,
  verifiedEuro,
} from "@/lib/radr/decision/demo/canonical";
import { CTAS } from "@/lib/marketing/brand";
import "@/app/product-chapters.css";
import "@/app/home.css";
import "@/app/econ.css";
import "@/app/kinetic.css";
import "@/app/radr-public.css";

/** Elegant routes — shared origin, diverge toward check-in. */
const PATH_BY_ID: Record<
  string,
  { d: string; endX: number; endY: number; labelY: number }
> = {
  fut_orphan_wait: {
    d: "M48 168 C 160 150, 280 72, 520 52",
    endX: 528,
    endY: 52,
    labelY: 42,
  },
  fut_orphan_discount: {
    d: "M48 168 C 170 172, 300 188, 520 198",
    endX: 528,
    endY: 198,
    labelY: 188,
  },
  fut_orphan_ota: {
    d: "M48 168 C 165 165, 290 158, 520 148",
    endX: 528,
    endY: 148,
    labelY: 138,
  },
};

const END_LABEL: Record<string, string> = {
  fut_orphan_discount: "Discount now",
  fut_orphan_ota: "OTA release",
  fut_orphan_wait: "RADR plan",
};

const TIME_MARKS = [
  {
    id: "now",
    label: "NOW",
    x: 48,
    open: ["fut_orphan_discount", "fut_orphan_ota", "fut_orphan_wait"] as const,
  },
  {
    id: "72h",
    label: "72H",
    x: 160,
    open: ["fut_orphan_discount", "fut_orphan_ota", "fut_orphan_wait"] as const,
  },
  {
    id: "48h",
    label: "48H",
    x: 272,
    open: ["fut_orphan_discount", "fut_orphan_ota", "fut_orphan_wait"] as const,
  },
  {
    id: "24h",
    label: "24H",
    x: 384,
    open: ["fut_orphan_ota", "fut_orphan_wait"] as const,
  },
  {
    id: "checkin",
    label: "CHECK-IN",
    x: 520,
    open: ["fut_orphan_wait"] as const,
  },
] as const;

export function FuturesChapter() {
  const bundle = useMemo(() => buildOrphanFutures(), []);
  const [selected, setSelected] = useState(bundle.recommendedScenarioId);
  const [timeIdx, setTimeIdx] = useState(2);
  const time = TIME_MARKS[timeIdx]!;
  const openSet = useMemo(() => new Set<string>(time.open), [time.open]);

  useEffect(() => {
    if (!openSet.has(selected)) {
      const fallback = openSet.has(bundle.recommendedScenarioId)
        ? bundle.recommendedScenarioId
        : time.open[time.open.length - 1]!;
      setSelected(fallback);
    }
  }, [openSet, selected, bundle.recommendedScenarioId, time.open]);

  const pick =
    bundle.scenarios.find((s) => s.id === selected) ?? bundle.scenarios[0]!;
  const recommended = bundle.scenarios.find((s) => s.recommended)!;

  const paths = bundle.scenarios
    .filter((s) => !s.isNoAction)
    .map((s) => {
      const geom = PATH_BY_ID[s.id]!;
      return { ...s, ...geom };
    });

  const observed =
    CANON_ORPHAN.observedContributionEuro ?? ORPHAN_FUTURES_ACTUAL.actualEuro;
  const verified = verifiedEuro(CANON_ORPHAN);

  return (
    <div className="radr rx-ch rx-ch-light">
      <SiteNav />
      <main className="rx-ch-main">
        <section
          className="rx-fut-field-scene rx-fut-field-scene-solid"
          data-nav-theme="dark"
        >
          <div className="rx-shell rx-fut-field-inner">
            <header className="rx-cinema-head rx-cinema-head-on-dark">
              <p className="rx-cinema-kicker">
                Platform · Futures · {CANON_ORPHAN.displayId} · DEMO ·
                ILLUSTRATIVE
              </p>
              <h2 className="rx-cinema-title">
                Don&apos;t guess the next move.
                <br />
                Play it forward.
              </h2>
              <p className="rx-fut-field-sit">
                {bundle.situation.slice(0, 2).join(" · ")}
              </p>
            </header>

            <div
              className="rx-fut-time-scrub"
              role="group"
              aria-label="Time to check-in"
            >
              {TIME_MARKS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  data-on={timeIdx === i ? "true" : undefined}
                  onClick={() => setTimeIdx(i)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="rx-fut-traj" aria-label="Futures trajectories">
              <svg
                className="rx-fut-traj-svg"
                viewBox="0 0 600 240"
                role="img"
                aria-label="Three futures diverging toward check-in"
              >
                {/* Timeline baseline */}
                <line
                  x1="48"
                  y1="220"
                  x2="520"
                  y2="220"
                  stroke="rgba(247,250,248,0.12)"
                  strokeWidth="1"
                />
                {TIME_MARKS.map((m) => (
                  <g key={m.id}>
                    <line
                      x1={m.x}
                      y1="40"
                      x2={m.x}
                      y2="220"
                      stroke="rgba(247,250,248,0.06)"
                      strokeWidth="1"
                    />
                    <text
                      x={m.x}
                      y="236"
                      textAnchor="middle"
                      fill="rgba(247,250,248,0.45)"
                      fontSize="9"
                      fontFamily="IBM Plex Mono, ui-monospace, monospace"
                      letterSpacing="0.12em"
                    >
                      {m.label}
                    </text>
                  </g>
                ))}

                {/* Origin node */}
                <circle
                  cx="48"
                  cy="168"
                  r="4.5"
                  fill="rgba(247,250,248,0.85)"
                />

                {paths.map((p) => {
                  const on = p.id === selected;
                  const rec = p.id === recommended.id;
                  const gone = !openSet.has(p.id);
                  return (
                    <g
                      key={p.id}
                      className="rx-fut-traj-path"
                      data-on={on ? "true" : undefined}
                      data-rec={rec ? "true" : undefined}
                      data-gone={gone ? "true" : undefined}
                      opacity={gone ? 0.12 : on ? 1 : 0.35}
                      style={{ cursor: gone ? "default" : "pointer" }}
                      onClick={() => {
                        if (!gone) setSelected(p.id);
                      }}
                      onMouseEnter={() => {
                        if (!gone) setSelected(p.id);
                      }}
                    >
                      <path
                        d={p.d}
                        fill="none"
                        stroke={
                          on
                            ? "#00d978"
                            : rec
                              ? "rgba(0,217,120,0.45)"
                              : "rgba(247,250,248,0.28)"
                        }
                        strokeWidth={on ? 2.75 : 1.5}
                        strokeLinecap="round"
                      />
                      <circle
                        cx={p.endX}
                        cy={p.endY}
                        r={on ? 4 : 3}
                        fill={
                          on
                            ? "#00d978"
                            : "rgba(247,250,248,0.55)"
                        }
                      />
                      <text
                        x={p.endX + 10}
                        y={p.labelY}
                        fill={
                          on
                            ? "rgba(247,250,248,0.95)"
                            : "rgba(247,250,248,0.5)"
                        }
                        fontSize="10"
                        fontFamily="Instrument Sans, system-ui, sans-serif"
                      >
                        {END_LABEL[p.id] ?? p.label}
                      </text>
                      <text
                        x={p.endX + 10}
                        y={p.labelY + 14}
                        fill={
                          on
                            ? "#00d978"
                            : "rgba(247,250,248,0.55)"
                        }
                        fontSize="13"
                        fontWeight="600"
                        fontFamily="Instrument Sans, system-ui, sans-serif"
                      >
                        {formatDecisionMoney(p.expectedContribution)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <p className="rx-fut-traj-pick" role="status">
              Selected · {END_LABEL[pick.id] ?? pick.label} ·{" "}
              {formatDecisionMoney(pick.expectedContribution)} expected
              {pick.recommended ? " · RADR plan" : ""}
            </p>
          </div>
        </section>

        <section className="rx-ch-body" data-nav-theme="light">
          <div className="rx-shell rx-fut-reality">
            <p className="rx-ch-kicker">
              After the window · {CANON_ORPHAN.displayId} · DEMO · ILLUSTRATIVE
            </p>

            <dl className="rx-fut-reality-grid">
              <div>
                <dt>Expected</dt>
                <dd>
                  {formatDecisionMoney(ORPHAN_FUTURES_ACTUAL.simulatedEuro)}
                </dd>
              </div>
              <div data-tone="observed">
                <dt>Observed</dt>
                <dd>{formatDecisionMoney(observed)}</dd>
              </div>
              <div data-tone="verified">
                <dt>Verified recovered</dt>
                <dd>{formatDecisionMoney(verified)}</dd>
              </div>
            </dl>

            <p className="rx-fut-model-updated">Model updated</p>

            <div className="rx-ch-ctas">
              <NextLink href="/product/memory" className="rx-btn rx-btn-primary">
                Operating Memory <span aria-hidden="true">→</span>
              </NextLink>
              <NextLink href="/demo" className="rx-btn rx-btn-ghost">
                {CTAS.compareFutures}
              </NextLink>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
