"use client";

import Link from "next/link";
import { HotelReadinessFlow } from "@/components/product/live/HotelReadinessFlow";
import type {
  TimelineBeat,
  VerticalDaySurface,
  VerticalMetric,
} from "@/lib/radr/product/verticalDay";

function MetricRail({ metrics }: { metrics: VerticalMetric[] }) {
  return (
    <div className="rp-cin-rail-track rp-vday-rail">
      {metrics.map((m) => (
        <div key={m.label} className="rp-metric rp-cin-rail-item" data-tone={m.tone}>
          <p className="rp-metric-value">{m.value}</p>
          <p className="rp-metric-label">{m.label}</p>
          {m.compare ? <p className="rp-metric-delta">{m.compare}</p> : null}
        </div>
      ))}
    </div>
  );
}

function HotelReadiness() {
  return <HotelReadinessFlow />;
}

function TurnoverFlow() {
  const stages = [
    { label: "Depart", n: 11, tone: "done" as const },
    { label: "Clean", n: 6, tone: "active" as const, warn: 2 },
    { label: "Inspect", n: 4, tone: "watch" as const },
    { label: "Ready", n: 4, tone: "ok" as const },
    { label: "Arrive", n: 9, tone: "next" as const },
  ];
  return (
    <div className="rp-cin-flow" aria-label="Turnover flow">
      <p className="rp-cin-kicker">Same-day turnovers</p>
      <ol className="rp-cin-flow-track">
        {stages.map((s, i) => (
          <li key={s.label} data-tone={s.tone}>
            <strong>{s.n}</strong>
            <em>{s.label}</em>
            {s.warn ? <span data-risk="true">{s.warn} behind SLA</span> : null}
            {i < stages.length - 1 ? <i aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ServicePhaseTrajectory({ beats }: { beats: TimelineBeat[] }) {
  /** OPEN → NOW → PRESSURE → RECOVERY → CLOSE — temporal visual, not a caption list. */
  const phases = [
    { id: "open", label: "OPEN", kind: "ops" as const },
    { id: "now", label: "NOW", kind: "now" as const },
    { id: "pressure", label: "PRESSURE", kind: "pressure" as const },
    { id: "recovery", label: "RECOVERY", kind: "release" as const },
    { id: "close", label: "CLOSE", kind: "ops" as const },
  ];

  const nowIdx = Math.max(
    0,
    beats.findIndex((b) => b.kind === "now"),
  );
  const pressureBeat = beats.find(
    (b) => b.kind === "pressure" || b.kind === "decision",
  );
  const decisionBeat = beats.find((b) => b.kind === "decision");

  // Map beats onto 5 phases for the chart
  const phaseBeats = phases.map((p, i) => {
    const hit =
      beats.find((b) => b.kind === p.kind) ??
      beats[Math.min(i, beats.length - 1)];
    return { ...p, beat: hit, index: i };
  });

  const W = 640;
  const H = 120;
  const pad = { l: 28, r: 28, t: 28, b: 36 };
  const plotW = W - pad.l - pad.r;
  const midY = pad.t + 36;

  return (
    <div className="rp-traj" aria-label="Operating trajectory">
      <svg className="rp-traj-svg" viewBox={`0 0 ${W} ${H}`} role="img">
        {/* Past (solid) */}
        <line
          x1={pad.l}
          y1={midY}
          x2={pad.l + (nowIdx / Math.max(phases.length - 1, 1)) * plotW}
          y2={midY}
          className="rp-traj-past"
        />
        {/* Forecast (soft) */}
        <line
          x1={pad.l + (nowIdx / Math.max(phases.length - 1, 1)) * plotW}
          y1={midY}
          x2={pad.l + plotW}
          y2={midY}
          className="rp-traj-forecast"
        />
        {/* Pressure band */}
        {pressureBeat ? (
          <rect
            x={pad.l + (2 / 4) * plotW - 36}
            y={midY - 18}
            width={72}
            height={36}
            className="rp-traj-pressure"
            rx={4}
          />
        ) : null}
        {phaseBeats.map((p) => {
          const x = pad.l + (p.index / Math.max(phases.length - 1, 1)) * plotW;
          const isNow = p.kind === "now";
          const isPast = p.index < nowIdx;
          const isDecision =
            decisionBeat &&
            (p.kind === "pressure" || p.beat?.kind === "decision");
          return (
            <g key={p.id}>
              <circle
                cx={x}
                cy={midY}
                r={isNow ? 7 : isDecision ? 6 : 4.5}
                className={
                  isNow
                    ? "rp-traj-now"
                    : isDecision
                      ? "rp-traj-decision"
                      : isPast
                        ? "rp-traj-dot-past"
                        : "rp-traj-dot-future"
                }
              />
              <text
                x={x}
                y={H - 12}
                textAnchor="middle"
                className="rp-traj-label"
                data-now={isNow ? "true" : undefined}
              >
                {p.label}
              </text>
              {p.beat && isNow ? (
                <text
                  x={x}
                  y={pad.t - 4}
                  textAnchor="middle"
                  className="rp-traj-caption"
                >
                  {p.beat.detail}
                </text>
              ) : null}
            </g>
          );
        })}
        {decisionBeat ? (
          <a
            href={
              decisionBeat.decisionId
                ? `/app/decisions/${decisionBeat.decisionId}`
                : "/app/decisions"
            }
          >
            <text
              x={pad.l + (2.2 / 4) * plotW}
              y={midY - 26}
              textAnchor="middle"
              className="rp-traj-dec-label"
            >
              △ {decisionBeat.decisionLabel ?? "Decision"}
            </text>
          </a>
        ) : null}
      </svg>
      <ul className="rp-traj-keys">
        <li data-k="past">Past</li>
        <li data-k="now">Now</li>
        <li data-k="forecast">Forecast</li>
        <li data-k="pressure">Pressure</li>
      </ul>
    </div>
  );
}

function CinemaTimeline({ beats }: { beats: TimelineBeat[] }) {
  return <ServicePhaseTrajectory beats={beats} />;
}

export function VerticalDayScene({ day }: { day: VerticalDaySurface }) {
  return (
    <section
      className="rp-vday rp-cin-vday"
      data-vertical={day.vertical}
      aria-label={day.title}
    >
      <header className="rp-vday-head rp-vday-hero">
        <div>
          <p className="rp-cin-kicker">{day.vertical}</p>
          <h2 className="rp-cin-headline">{day.title}</h2>
          <p className="rp-cin-quiet">{day.subtitle}</p>
        </div>
        <div className="rp-vday-state" data-state={day.radrState}>
          <em>{day.radrState}</em>
          <span>{day.radrLine}</span>
        </div>
      </header>

      <MetricRail metrics={day.heroMetrics.slice(0, 4)} />

      {day.vertical === "hotel" ? <HotelReadiness /> : null}
      {day.vertical === "apartment" ? <TurnoverFlow /> : null}

      <div className="rp-cin-scene" data-dark="true">
        <p className="rp-cin-scene-k">
          {day.vertical === "restaurant"
            ? "Operating trajectory"
            : day.vertical === "hotel"
              ? "Arrival / readiness flow"
              : "Turnover trajectory"}
        </p>
        <CinemaTimeline beats={day.timeline} />
      </div>

      {day.attention.length ? (
        <ul className="rp-vday-attn">
          {day.attention.map((a) => (
            <li key={a.title}>
              <Link href={a.href}>
                <strong>{a.title}</strong>
                <span>{a.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
