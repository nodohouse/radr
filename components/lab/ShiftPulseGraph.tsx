"use client";

import { useMemo, useState } from "react";
import { labEuro } from "@/lib/lab/format";
import type { PulseMetric, PulsePoint, PulseWindow, ShiftPulse, TurbulenceMarker } from "@/lib/lab/types";
import { BecauseMoney } from "./BecauseMoney";

type Props = {
  pulse: ShiftPulse;
  window: PulseWindow;
  onWindow: (w: PulseWindow) => void;
  onTurbulence: (marker: TurbulenceMarker) => void;
  mode: "ops" | "pnl" | "summary";
};

function visiblePoints(points: PulsePoint[]) {
  return points.filter((p, i) => p.in || p.out || p.net || i === points.length - 1 || p.forecast);
}

function scale(points: PulsePoint[]) {
  const vals = points.flatMap((p) => [p.in, p.out, p.net, p.forecast]).filter((n) => n !== 0);
  const max = Math.max(400, ...vals.map((n) => Math.abs(n)));
  const min = Math.min(0, ...vals);
  return { min, max: max * 1.08 };
}

function yOf(v: number, min: number, max: number, top: number, height: number) {
  const t = (v - min) / (max - min || 1);
  return top + height - t * height;
}

function xOf(i: number, count: number, padX: number, width: number) {
  return padX + (i / Math.max(1, count - 1)) * width;
}

function pathOf(
  points: PulsePoint[],
  pick: (p: PulsePoint) => number,
  min: number,
  max: number,
  padX: number,
  width: number,
  top: number,
  height: number,
  until = points.length - 1,
) {
  const last = Math.min(until, points.length - 1);
  return points
    .slice(0, last + 1)
    .map((p, i) => {
      const x = xOf(i, points.length, padX, width);
      const y = yOf(pick(p), min, max, top, height);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export function ShiftPulseGraph({ pulse, window, onWindow, onTurbulence, mode }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const points = window === "24h" ? pulse.series24h : pulse.series;
  const drawn = useMemo(() => visiblePoints(points), [points]);
  const { min, max } = useMemo(() => scale(drawn), [drawn]);

  const padX = 28;
  const padTop = 16;
  const height = 300;
  const width = 980;
  const markedNow = drawn.findIndex(
    (p) => p.label === "now" || p.t === "now" || p.t === "today",
  );
  const lastLive = drawn.reduce((acc, p, i) => (p.in || p.net ? i : acc), 0);
  const endLive = markedNow >= 0 ? markedNow : lastLive;
  const nowX = xOf(endLive, drawn.length, padX, width);

  const inPath = pathOf(drawn, (p) => p.in, min, max, padX, width, padTop, height, endLive);
  const outPath = pathOf(drawn, (p) => p.out, min, max, padX, width, padTop, height, endLive);
  const netPath = pathOf(drawn, (p) => p.net, min, max, padX, width, padTop, height, endLive);
  const fcPath = pathOf(drawn, (p) => p.forecast, min, max, padX, width, padTop, height);

  const metrics: PulseMetric[] = (() => {
    const inn = pulse.metrics.filter((m) => m.tone === "in");
    const out = pulse.metrics.filter((m) => m.tone === "out");
    const net = pulse.metrics.filter((m) => m.tone === "net");
    const outRoll: PulseMetric | undefined = out.length
      ? {
          id: "out-roll",
          label: "Money out",
          euro: out.reduce((s, m) => s + m.euro, 0),
          because: out.map((m) => m.because).join(" · "),
          tone: "out",
        }
      : undefined;
    if (mode === "summary") return [...inn.slice(0, 1), ...net.slice(0, 1)];
    return [inn[0], outRoll, net[0]].filter((m): m is PulseMetric => Boolean(m));
  })();

  return (
    <section className="lab-band lab-band-mint" aria-labelledby="pulse-title">
      <div className="lab-band-head">
        <div>
          <p className="lab-kicker">
            {pulse.title} · {window === "24h" ? "24h" : pulse.windowLabel}
          </p>
          <h2 id="pulse-title" className="lab-h lab-h2">
            {pulse.headline}
          </h2>
          <p className="lab-lead">{pulse.trackingNote}</p>
        </div>
        <div className="lab-pills" role="group" aria-label="Pulse window">
          <button type="button" className="lab-pill" data-on={window === "shift"} onClick={() => onWindow("shift")}>
            Shift
          </button>
          <button type="button" className="lab-pill" data-on={window === "24h"} onClick={() => onWindow("24h")}>
            24h
          </button>
        </div>
      </div>

      <div className="lab-pulse-chart">
        <svg
          className="lab-pulse-svg"
          viewBox={`0 0 ${width + padX * 2} ${height + 56}`}
          role="img"
          aria-label="Shift Pulse time series: money in, money out, net, forecast"
        >
          <defs>
            <linearGradient id="pulseIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00c85a" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#00c85a" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={padX}
              x2={padX + width}
              y1={padTop + height * g}
              y2={padTop + height * g}
              stroke="rgba(26,24,20,0.08)"
            />
          ))}
          <path
            d={`${inPath} L${nowX.toFixed(1)} ${padTop + height} L${padX} ${padTop + height} Z`}
            fill="url(#pulseIn)"
          />
          <path d={fcPath} fill="none" stroke="#6a8f7a" strokeWidth="2" strokeDasharray="7 6" />
          <path d={inPath} fill="none" stroke="#0a8f4a" strokeWidth="2.4" />
          <path d={outPath} fill="none" stroke="#c45a4a" strokeWidth="2.2" />
          <path d={netPath} fill="none" stroke="#1a1814" strokeWidth="3.1" />
          <line
            x1={nowX}
            x2={nowX}
            y1={padTop}
            y2={padTop + height}
            stroke="rgba(26,24,20,0.22)"
            strokeDasharray="3 5"
          />

          {drawn.map((p, i) => {
            const x = xOf(i, drawn.length, padX, width);
            return (
              <text
                key={p.t}
                x={x}
                y={height + 40}
                textAnchor="middle"
                fontSize="11"
                fill="#5c574e"
              >
                {p.label}
              </text>
            );
          })}

          {pulse.turbulence.map((m) => {
            const idx = drawn.findIndex((p) => p.t === m.t || p.label === m.t);
            const i = idx >= 0 ? idx : endLive;
            const x = xOf(i, drawn.length, padX, width);
            const y = yOf(drawn[Math.min(i, endLive)]?.net ?? 0, min, max, padTop, height);
            const on = hover === m.id;
            return (
              <g key={m.id}>
                <polygon
                  points={`${x},${y - 11} ${x + 9},${y + 6} ${x - 9},${y + 6}`}
                  fill={on ? "#00f56a" : "#1a1814"}
                  role="button"
                  tabIndex={0}
                  aria-label={`${m.label} ${m.displayId} ${labEuro(m.euro)} ${m.grade}. ${m.because}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onTurbulence(m)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onTurbulence(m);
                    }
                  }}
                  onMouseEnter={() => setHover(m.id)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(m.id)}
                  onBlur={() => setHover(null)}
                />
                {on ? (
                  <text x={x} y={y - 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#067a42">
                    {m.displayId}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="lab-pulse-legend">
        <span><i className="lab-swatch in" /> Money in</span>
        <span><i className="lab-swatch out" /> Money out</span>
        <span><i className="lab-swatch net" /> Net contribution</span>
        <span><i className="lab-swatch forecast" /> Forecast vs actual</span>
        <span>△ Turbulence → Decision</span>
      </div>

      <div className="lab-pulse-strip" aria-label="Pulse in / out / net">
        {metrics.map((m) => (
          <article key={m.id} className="lab-metric" data-tone={m.tone}>
            <p className="lab-metric-k">{m.label}</p>
            <p className="lab-metric-v lab-euro" data-grade={m.grade ?? "Expected"}>
              {labEuro(m.euro, m.euro >= 10000)}
              {m.grade ? (
                <span className="lab-grade" data-grade={m.grade}>
                  {m.grade}
                </span>
              ) : null}
            </p>
            <p className="lab-because">{m.because}</p>
          </article>
        ))}
      </div>

      {hover ? (
        <p className="sr-only">
          {pulse.turbulence.find((t) => t.id === hover)?.because}
        </p>
      ) : null}

      <div className="sr-only">
        <BecauseMoney {...pulse.net} />
      </div>
    </section>
  );
}
