"use client";

import { formatEuro } from "@/lib/lab/format";
import { getPulseModel, pulseNowPoint } from "@/lib/lab/pulse";
import { useLab } from "@/lib/lab/store";
import type { PulseModel, TurbulenceMark } from "@/lib/lab/types";

type Props = {
  compact?: boolean;
  model?: PulseModel;
};

export function ShiftPulseGraph({ compact = false, model: forced }: Props) {
  const { state, setPulseWindow, setSeed, goCenter } = useLab();
  const model = forced ?? getPulseModel(state.seed, state.pulseWindow);
  const now = pulseNowPoint(model);
  const openMark = (mark: TurbulenceMark) => {
    const seed = mark.displayId.startsWith("D-33")
      ? "hotel"
      : mark.displayId === "D-4102"
        ? "recover"
        : "service";
    setSeed(seed);
    goCenter(seed);
  };

  const W = 920;
  const H = compact ? 176 : 268;
  const pad = { l: 44, r: 16, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const xs = model.points.map((p) => p.minutes);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const maxY = Math.max(
    ...model.points.flatMap((p) => [p.inEuro, p.outEuro, p.netEuro, p.forecastEuro]),
    1,
  );
  const xOf = (m: number) => pad.l + ((m - minX) / (maxX - minX || 1)) * innerW;
  const yOf = (v: number) => pad.t + innerH - (v / maxY) * innerH;

  const line = (key: "inEuro" | "outEuro" | "netEuro" | "forecastEuro") =>
    model.points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(p.minutes).toFixed(1)} ${yOf(p[key]).toFixed(1)}`)
      .join(" ");

  const actualPts = model.points.filter((p) => p.minutes <= model.actualThroughMinutes);
  const nowX = xOf(model.actualThroughMinutes);

  return (
    <section className="lab-pulse" data-compact={compact ? "true" : undefined} data-emphasis="hero">
      <header className="lab-pulse-head">
        <div>
          <p className="lab-k">Shift Pulse · {model.windowLabel}</p>
          <h2 className="lab-pulse-title">
            {model.industry === "hotel" ? "How arrivals are tracking" : "How the shift is tracking"}
          </h2>
          <p className="lab-pulse-sub">{model.netBecause}</p>
        </div>
        <div className="lab-pulse-head-right">
          {model.seed !== "recover" ? (
            <div className="lab-pulse-toggle" role="group" aria-label="Pulse window">
              <button
                type="button"
                data-on={state.pulseWindow === "shift" || undefined}
                onClick={() => setPulseWindow("shift")}
              >
                Shift
              </button>
              <button
                type="button"
                data-on={state.pulseWindow === "24h" || undefined}
                onClick={() => setPulseWindow("24h")}
              >
                24h
              </button>
            </div>
          ) : null}
          <div className="lab-pulse-net">
            <em>Net</em>
            <strong>{formatEuro(model.netEuro)}</strong>
            <span data-grade={model.netGrade}>{model.netGrade}</span>
            <p>because {model.forecastBecause}</p>
          </div>
        </div>
      </header>

      <div className="lab-pulse-chart">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Shift Pulse time series">
          <title>Shift Pulse</title>
          {[0.25, 0.5, 0.75, 1].map((g) => (
            <line
              key={g}
              x1={pad.l}
              x2={W - pad.r}
              y1={pad.t + innerH * (1 - g)}
              y2={pad.t + innerH * (1 - g)}
              className="lab-pulse-grid"
            />
          ))}
          <path d={line("forecastEuro")} className="lab-pulse-forecast" />
          <path d={line("inEuro")} className="lab-pulse-in" />
          <path d={line("outEuro")} className="lab-pulse-out" />
          <path d={line("netEuro")} className="lab-pulse-netline" />
          <line x1={nowX} x2={nowX} y1={pad.t} y2={H - pad.b} className="lab-pulse-now" />
          {actualPts.slice(-1).map((p) => (
            <circle key={p.t} cx={xOf(p.minutes)} cy={yOf(p.netEuro)} r="4.5" className="lab-pulse-now-dot" />
          ))}
          {model.turbulence.map((mark) => {
            const nearest =
              model.points.reduce((best, p) =>
                Math.abs(p.minutes - mark.minutes) < Math.abs(best.minutes - mark.minutes) ? p : best,
              );
            const x = xOf(mark.minutes);
            const y = yOf(nearest.netEuro);
            return (
              <g key={mark.id} className="lab-pulse-mark" data-severity={mark.severity}>
                <polygon points={`${x},${y - 14} ${x + 8},${y} ${x - 8},${y}`} />
              </g>
            );
          })}
          {model.points
            .filter((_, i) => i % Math.ceil(model.points.length / 6) === 0 || i === model.points.length - 1)
            .map((p) => (
              <text key={p.t} x={xOf(p.minutes)} y={H - 8} className="lab-pulse-x">
                {p.t}
              </text>
            ))}
        </svg>
        {model.turbulence.map((mark) => {
          const xPct = ((xOf(mark.minutes) - pad.l) / innerW) * 100;
          return (
            <button
              key={mark.id}
              type="button"
              className="lab-pulse-hit"
              style={{ left: `${xPct}%` }}
              onClick={() => openMark(mark)}
            >
              <span className="lab-pulse-hit-card">
                <em>
                  {mark.displayId} · {mark.label}
                </em>
                <strong>
                  {formatEuro(mark.euro)} <i data-grade={mark.grade}>{mark.grade}</i>
                </strong>
                <span>because {mark.because}</span>
              </span>
            </button>
          );
        })}
      </div>

      <ul className="lab-pulse-legend">
        {model.series.map((s) => (
          <li key={s.id} data-dir={s.direction}>
            <i style={{ background: s.color }} />
            {s.label}
          </li>
        ))}
        <li className="lab-pulse-legend-note">{model.legendNote}</li>
      </ul>
    </section>
  );
}
