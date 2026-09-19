"use client";

/**
 * Shift Pulse — dominant live time-series.
 * Money in / out / net · forecast vs actual · turbulence markers → Decisions.
 */

import { useMemo, useState } from "react";
import { useLab } from "./LabContext";
import {
  pulseForContext,
  type PulseSeriesPoint,
  type PulseWindow,
  type TurbulenceMarker,
} from "./labShiftPulse";

const W = 720;
const H = 220;
const PAD = { t: 18, r: 16, b: 28, l: 44 };

function pathFrom(
  series: PulseSeriesPoint[],
  key: "moneyIn" | "moneyOut" | "net" | "moneyInForecast" | "moneyOutForecast" | "netForecast",
  maxY: number,
  actualOnly?: boolean,
): string {
  const pts: string[] = [];
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  series.forEach((p, i) => {
    const raw = p[key];
    if (raw == null) return;
    if (actualOnly && key.includes("Forecast")) return;
    if (actualOnly && (key === "moneyIn" || key === "moneyOut" || key === "net") && p.moneyIn == null && !p.isNow) {
      // skip forecast-only points for actual lines
    }
    if (
      actualOnly &&
      (key === "moneyIn" || key === "moneyOut" || key === "net") &&
      p[key] == null
    ) {
      return;
    }
    const x = PAD.l + (i / Math.max(1, series.length - 1)) * innerW;
    const y = PAD.t + innerH - (raw / maxY) * innerH;
    pts.push(`${x},${y}`);
  });
  return pts.length ? `M ${pts.join(" L ")}` : "";
}

function MarkerDot({
  series,
  marker,
  maxY,
  active,
  onSelect,
}: {
  series: PulseSeriesPoint[];
  marker: TurbulenceMarker;
  maxY: number;
  active: boolean;
  onSelect: () => void;
}) {
  const i = marker.at;
  const p = series[i];
  if (!p) return null;
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const yVal = p.net ?? p.netForecast;
  const x = PAD.l + (i / Math.max(1, series.length - 1)) * innerW;
  const y = PAD.t + innerH - (yVal / maxY) * innerH;
  return (
    <g className="lab-spg-marker" data-severity={marker.severity} data-on={active ? "true" : undefined}>
      <circle
        cx={x}
        cy={y}
        r={active ? 8 : 6}
        className="lab-spg-marker-hit"
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect();
        }}
      />
      <circle cx={x} cy={y} r={active ? 5 : 3.5} className="lab-spg-marker-dot" />
    </g>
  );
}

export function ShiftPulse({
  mode = "ops",
}: {
  mode?: "ops" | "pnl" | "summary";
}) {
  const { state, nav, setSeed, goDecision, goValue } = useLab();
  const industry = nav.industry;
  const pulse = pulseForContext(state.seed, industry);
  const [window, setWindow] = useState<PulseWindow>("shift");
  const [activeId, setActiveId] = useState<string | null>(
    pulse.markers.find((m) => m.severity === "hot")?.id ?? pulse.markers[0]?.id ?? null,
  );

  const maxY = useMemo(() => {
    let m = 1;
    for (const p of pulse.series) {
      m = Math.max(
        m,
        p.moneyIn ?? 0,
        p.moneyInForecast,
        p.moneyOut ?? 0,
        p.moneyOutForecast,
        p.net ?? 0,
        p.netForecast,
      );
    }
    return m * 1.08;
  }, [pulse.series]);

  const active = pulse.markers.find((m) => m.id === activeId) ?? pulse.markers[0];

  const openMarker = (m: TurbulenceMarker) => {
    setActiveId(m.id);
    if (m.seed) {
      setSeed(m.seed);
      return;
    }
    if (m.grade === "Verified") {
      goValue("verified");
      return;
    }
    goDecision(m.decisionId, "why");
  };

  const nowX =
    PAD.l +
    (pulse.nowIndex / Math.max(1, pulse.series.length - 1)) * (W - PAD.l - PAD.r);

  if (mode === "summary") {
    return (
      <section className="lab-spg" data-mode="summary">
        <header className="lab-spg-head">
          <div>
            <p className="lab-spg-k">Shift Pulse</p>
            <h2 className="lab-spg-title">Turbulence summary</h2>
            <p className="lab-spg-sub">{pulse.netBecause}</p>
          </div>
          <div className="lab-spg-net">
            <em>Net</em>
            <strong>€{pulse.netEuro.toLocaleString("en-IE")}</strong>
            <span data-grade="Expected">Expected</span>
          </div>
        </header>
        <div className="lab-spg-chip-row">
          {pulse.markers.map((m) => (
            <button
              key={m.id}
              type="button"
              className="lab-sp-chip"
              data-severity={m.severity}
              onClick={() => openMarker(m)}
            >
              <span className="lab-sp-chip-label">{m.label}</span>
              <strong>
                €{m.euro.toLocaleString("en-IE")}
                <i data-grade={m.grade}>{m.grade}</i>
              </strong>
              <em>{m.because}</em>
              <span className="lab-sp-chip-id">{m.displayId}</span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="lab-spg" data-mode={mode} data-industry={pulse.industry}>
      <header className="lab-spg-head">
        <div>
          <p className="lab-spg-k">
            Shift Pulse · {pulse.windowLabel}
            {pulse.industry === "hotel" ? " · Hotel" : ""}
          </p>
          <h2 className="lab-spg-title">
            {mode === "pnl" ? "Money in / out · tracking" : "How the shift is tracking"}
          </h2>
          <p className="lab-spg-sub">
            {pulse.netBecause} · {pulse.paceBecause}
          </p>
        </div>
        <div className="lab-spg-head-right">
          <div className="lab-spg-window" role="group" aria-label="Window">
            <button
              type="button"
              data-on={window === "shift" ? "true" : undefined}
              onClick={() => setWindow("shift")}
            >
              Shift
            </button>
            <button
              type="button"
              data-on={window === "24h" ? "true" : undefined}
              onClick={() => setWindow("24h")}
            >
              24h
            </button>
          </div>
          <div className="lab-spg-net">
            <em>Net now</em>
            <strong>€{Math.abs(pulse.netEuro).toLocaleString("en-IE")}</strong>
            <span data-grade="Expected">Expected</span>
            <p>{pulse.paceLabel}</p>
          </div>
        </div>
      </header>

      <div className="lab-spg-metrics">
        {pulse.metrics.map((m) => (
          <div key={m.id} className="lab-sp-metric" data-dir={m.direction}>
            <em>{m.label}</em>
            <strong>{m.value}</strong>
            <span>because {m.because}</span>
          </div>
        ))}
        <div className="lab-sp-metric" data-dir="pace">
          <em>Expected close</em>
          <strong>{pulse.expectedClose}</strong>
          <span>because forecast if path holds — not Verified</span>
        </div>
      </div>

      <div className="lab-spg-chart-wrap">
        <svg
          className="lab-spg-chart"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Shift Pulse time series"
        >
          {/* grid */}
          {[0.25, 0.5, 0.75].map((f) => {
            const y = PAD.t + (H - PAD.t - PAD.b) * (1 - f);
            return (
              <line
                key={f}
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y}
                y2={y}
                className="lab-spg-grid"
              />
            );
          })}

          {/* NOW */}
          <line
            x1={nowX}
            x2={nowX}
            y1={PAD.t}
            y2={H - PAD.b}
            className="lab-spg-now"
          />
          <text x={nowX + 4} y={PAD.t + 10} className="lab-spg-now-label">
            NOW
          </text>

          {/* Forecast (dashed) */}
          <path
            d={pathFrom(pulse.series, "moneyInForecast", maxY)}
            className="lab-spg-line lab-spg-in-f"
            fill="none"
          />
          <path
            d={pathFrom(pulse.series, "moneyOutForecast", maxY)}
            className="lab-spg-line lab-spg-out-f"
            fill="none"
          />
          <path
            d={pathFrom(pulse.series, "netForecast", maxY)}
            className="lab-spg-line lab-spg-net-f"
            fill="none"
          />

          {/* Actual */}
          <path
            d={pathFrom(pulse.series, "moneyIn", maxY, true)}
            className="lab-spg-line lab-spg-in"
            fill="none"
          />
          <path
            d={pathFrom(pulse.series, "moneyOut", maxY, true)}
            className="lab-spg-line lab-spg-out"
            fill="none"
          />
          <path
            d={pathFrom(pulse.series, "net", maxY, true)}
            className="lab-spg-line lab-spg-line-net"
            fill="none"
          />

          {/* X labels */}
          {pulse.series.map((p, i) => {
            const x =
              PAD.l +
              (i / Math.max(1, pulse.series.length - 1)) * (W - PAD.l - PAD.r);
            return (
              <text key={p.t} x={x} y={H - 8} className="lab-spg-xlabel" textAnchor="middle">
                {p.t}
              </text>
            );
          })}

          {pulse.markers.map((m) => (
            <MarkerDot
              key={m.id}
              series={pulse.series}
              marker={m}
              maxY={maxY}
              active={active?.id === m.id}
              onSelect={() => {
                setActiveId(m.id);
              }}
            />
          ))}
        </svg>

        <div className="lab-spg-legend" aria-hidden="true">
          <span data-k="in">Money in</span>
          <span data-k="out">Money out</span>
          <span data-k="net">Net</span>
          <span data-k="f">Forecast</span>
        </div>
      </div>

      {active ? (
        <div className="lab-spg-active" data-severity={active.severity}>
          <div>
            <em>{active.label}</em>
            <strong>
              €{active.euro.toLocaleString("en-IE")} · {active.grade}
            </strong>
            <p>because {active.because}</p>
          </div>
          <button type="button" onClick={() => openMarker(active)}>
            {active.displayId} · Why
          </button>
        </div>
      ) : null}

      {window === "24h" ? (
        <p className="lab-spg-24h-note">
          24h view uses the same Decision markers — rolling window demo. Shift
          remains the operating lens.
        </p>
      ) : null}
    </section>
  );
}
