"use client";

/**
 * Operating day trajectory — open → NOW → close.
 * Labels never sit on the plot. Markers are dots / Decision triangle only;
 * a chip strip above the SVG carries the readable copy.
 */

import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type {
  HourlyMetricPoint,
  ServicePeriod,
  TimelineMarker,
} from "@/lib/radr/product/operatingDay";

type Props = {
  series: HourlyMetricPoint[];
  periods: ServicePeriod[];
  markers: TimelineMarker[];
  heatStrip: { clock: string; level: "low" | "medium" | "high" | "critical" }[];
  clockLabel: string;
  onSelectDecision?: (id: string) => void;
  selectedDecisionId?: string | null;
};

function parseMin(clock: string): number {
  const [h, m] = clock.replace("24:00", "23:59").split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

const CTX_KINDS = new Set(["weather", "event", "demand", "pressure"]);

/** Max 3 context chips + Decision — near NOW, by kind priority. */
function pickAnnotChips(
  markers: TimelineMarker[],
  nowClock: string,
): TimelineMarker[] {
  const nowM = parseMin(nowClock);
  const ctx = markers
    .filter((m) => CTX_KINDS.has(m.kind))
    .map((m) => {
      const dist = Math.abs(parseMin(m.at) - nowM);
      const kindScore =
        m.kind === "weather"
          ? 0
          : m.kind === "event"
            ? 1
            : m.kind === "demand"
              ? 2
              : 3;
      return { m, score: kindScore * 1000 + dist };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.m)
    .sort((a, b) => a.at.localeCompare(b.at));

  const decisions = markers.filter((m) => m.kind === "decision");
  return [...ctx, ...decisions];
}

function chipLabel(m: TimelineMarker): string {
  if (m.kind === "decision") {
    return m.decisionLabel?.split("·")[0]?.trim() ?? m.label;
  }
  return m.label.replace(/\s+begins$/i, "").trim();
}

export function OperatingDayChart({
  series,
  periods,
  markers,
  heatStrip,
  clockLabel,
  onSelectDecision,
  selectedDecisionId,
}: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const [markHover, setMarkHover] = useState<string | null>(null);
  const w = 760;
  const h = 268;
  const padL = 36;
  const padR = 28;
  const padT = 28;
  const padB = 56;
  const heatH = 10;
  const plotBottom = h - padB - heatH;
  const markY = padT + 6;

  const nowIdx = Math.max(
    0,
    series.findIndex((s) => s.isNow || s.label === "NOW"),
  );

  const maxR = Math.max(
    ...series.flatMap((s) => [
      s.revenueActual ?? 0,
      s.revenueExpected,
      s.revenueForecast,
      s.revenueHigh ?? 0,
    ]),
    1,
  );

  const xAt = (i: number) =>
    padL + (i / Math.max(series.length - 1, 1)) * (w - padL - padR);
  const yAt = (v: number) =>
    h - padB - (v / maxR) * (h - padT - padB - heatH - 8);

  const t0 = parseMin(series[0]?.clock ?? "00:00");
  const t1 = parseMin(series[series.length - 1]?.clock ?? "23:59");
  const xForClock = (clock: string) => {
    const t = parseMin(clock);
    const ratio = (t - t0) / Math.max(t1 - t0, 1);
    return padL + ratio * (w - padL - padR);
  };

  const actualPts = series
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.observed && s.revenueActual != null)
    .map(({ s, i }) => `${xAt(i)},${yAt(s.revenueActual!)}`);

  const forecastPts = series
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => i >= nowIdx)
    .map(({ s, i }) => {
      const v =
        i === nowIdx && s.revenueActual != null
          ? s.revenueActual
          : s.revenueForecast;
      return `${xAt(i)},${yAt(v)}`;
    });

  const expectedPts = series
    .map((s, i) => `${xAt(i)},${yAt(s.revenueExpected)}`)
    .join(" ");

  const bandHigh = series
    .map((s, i) => ({ s, i }))
    .filter(({ i, s }) => i >= nowIdx && s.revenueHigh != null)
    .map(({ s, i }) => `${xAt(i)},${yAt(s.revenueHigh!)}`);
  const bandLow = series
    .map((s, i) => ({ s, i }))
    .filter(({ i, s }) => i >= nowIdx && s.revenueLow != null)
    .map(({ s, i }) => ({ i, y: yAt(s.revenueLow!) }))
    .reverse()
    .map(({ i, y }) => `${xAt(i)},${y}`);
  const bandPath =
    bandHigh.length > 0 && bandLow.length > 0
      ? `M ${bandHigh[0]} L ${bandHigh.slice(1).join(" L ")} L ${bandLow.join(" L ")} Z`
      : "";

  const nowX = xAt(nowIdx);
  const nowY = yAt(
    series[nowIdx]?.revenueActual ?? series[nowIdx]?.revenueForecast ?? 0,
  );
  const tip = hover != null ? series[hover] : null;

  const decisionMarkers = markers.filter((m) => m.kind === "decision");
  const chips = pickAnnotChips(markers, clockLabel);
  /** Only chip-backed markers get stems on the plot — no unlabeled stalk forest. */
  const contextMarkers = chips.filter((m) => CTX_KINDS.has(m.kind));

  const pressureLegend: Record<string, string> = {
    low: "NORMAL",
    medium: "ELEVATED",
    high: "FRAGILE",
    critical: "FRAGILE",
  };

  const markTip =
    markHover != null
      ? markers.find((m) => m.id === markHover) ?? null
      : null;

  return (
    <div className="rp-oday-chart" data-hero="true" data-clean="true">
      <div className="rp-oday-chart-top">
        <div className="rp-oday-chart-legend" aria-hidden="true">
          <span data-k="actual">Observed</span>
          <span data-k="forecast">Forecast</span>
          <span data-k="band">Range</span>
          <span data-k="now">NOW</span>
        </div>
        {chips.length > 0 ? (
          <ul className="rp-oday-annots" aria-label="Timeline markers">
            {chips.map((m) => {
              const isDec = m.kind === "decision";
              const active =
                isDec &&
                m.decisionId &&
                m.decisionId === selectedDecisionId;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    className="rp-oday-annot"
                    data-kind={m.kind}
                    data-active={active ? "true" : undefined}
                    title={`${m.at} · ${m.label}${m.detail ? ` · ${m.detail}` : ""}`}
                    onClick={() => {
                      if (isDec && m.decisionId) {
                        onSelectDecision?.(m.decisionId);
                      } else {
                        setMarkHover((cur) => (cur === m.id ? null : m.id));
                      }
                    }}
                    onMouseEnter={() => setMarkHover(m.id)}
                    onMouseLeave={() => setMarkHover(null)}
                  >
                    <i aria-hidden="true" />
                    <time>{m.at}</time>
                    <strong>{chipLabel(m)}</strong>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <svg
        className="rp-oday-svg"
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label="Operating day revenue trajectory from open through close"
        onMouseLeave={() => {
          setHover(null);
        }}
      >
        <rect x={0} y={0} width={w} height={h} className="rp-oday-bg" rx={12} />

        {/* Period bands only — no period text on the plot */}
        {periods.map((p) => {
          const x1 = xForClock(p.start);
          const x2 = xForClock(p.end);
          if (x2 <= x1) return null;
          return (
            <rect
              key={p.id}
              x={x1}
              y={padT}
              width={x2 - x1}
              height={plotBottom - padT}
              className="rp-oday-period"
              data-kind={p.kind}
            />
          );
        })}

        {bandPath ? <path d={bandPath} className="rp-oday-band" /> : null}

        <polyline points={expectedPts} fill="none" className="rp-oday-expected" />
        <polyline
          points={forecastPts.join(" ")}
          fill="none"
          className="rp-oday-forecast"
        />
        <polyline
          points={actualPts.join(" ")}
          fill="none"
          className="rp-oday-actual"
        />

        <line
          x1={nowX}
          y1={padT - 2}
          x2={nowX}
          y2={plotBottom + 2}
          className="rp-oday-now-line"
        />
        <circle cx={nowX} cy={nowY} r={6} className="rp-oday-now-dot" />
        <text
          x={nowX + (nowX > w * 0.7 ? -8 : 8)}
          y={padT - 8}
          textAnchor={nowX > w * 0.7 ? "end" : "start"}
          className="rp-oday-now-label"
        >
          NOW {clockLabel}
        </text>

        {/* Context: stem + dot only */}
        {contextMarkers.map((m) => {
          const x = xForClock(m.at);
          const lit = markHover === m.id;
          return (
            <g
              key={m.id}
              className="rp-oday-ctx-mark"
              data-kind={m.kind}
              data-lit={lit ? "true" : undefined}
              onMouseEnter={() => setMarkHover(m.id)}
              onMouseLeave={() => setMarkHover(null)}
            >
              <title>{`${m.at} · ${m.label}${m.detail ? ` · ${m.detail}` : ""}`}</title>
              <line
                x1={x}
                y1={markY}
                x2={x}
                y2={plotBottom}
                className="rp-oday-ctx-line"
              />
              <circle cx={x} cy={markY} r={lit ? 4.5 : 3.5} className="rp-oday-ctx-dot" />
            </g>
          );
        })}

        {/* Decision: triangle only — label lives in chip strip */}
        {decisionMarkers.map((m) => {
          const x = xForClock(m.at);
          const triY = markY + 14;
          const lit =
            markHover === m.id ||
            (m.decisionId != null && m.decisionId === selectedDecisionId);
          return (
            <g
              key={m.id}
              className="rp-oday-dec-mark"
              data-selected={lit ? "true" : undefined}
              style={{ cursor: m.decisionId ? "pointer" : "default" }}
              onClick={() =>
                m.decisionId ? onSelectDecision?.(m.decisionId) : undefined
              }
              onMouseEnter={() => setMarkHover(m.id)}
              onMouseLeave={() => setMarkHover(null)}
            >
              <title>
                {m.decisionLabel ?? m.label}
                {m.detail ? ` · ${m.detail}` : ""}
              </title>
              <line
                x1={x}
                y1={triY}
                x2={x}
                y2={plotBottom}
                className="rp-oday-dec-line"
              />
              <polygon
                points={`${x},${triY} ${x - 5.5},${triY + 11} ${x + 5.5},${triY + 11}`}
                className="rp-oday-dec-tri"
              />
            </g>
          );
        })}

        {series.map((s, i) => {
          const x = xAt(i);
          // NOW is labeled at the top of the plot — skip its axis tick
          // and any hour tick that would collide with it (e.g. 20:00).
          const hideAxis =
            Boolean(s.isNow) || Math.abs(x - nowX) < 52;
          return (
            <g key={s.id}>
              <circle
                cx={x}
                cy={yAt(
                  s.observed && s.revenueActual != null
                    ? s.revenueActual
                    : s.revenueForecast,
                )}
                r={12}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(i)}
              />
              {!hideAxis ? (
                <text
                  x={x}
                  y={h - 18}
                  textAnchor="middle"
                  className="rp-oday-axis"
                >
                  {s.label}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Explicit NOW axis tick only when room — otherwise top NOW label is enough */}
        {(() => {
          const neighbors = series
            .map((s, i) => ({ x: xAt(i), isNow: Boolean(s.isNow) }))
            .filter((p) => !p.isNow);
          const room = neighbors.every((p) => Math.abs(p.x - nowX) >= 52);
          if (!room) return null;
          return (
            <text
              x={nowX}
              y={h - 18}
              textAnchor="middle"
              className="rp-oday-axis"
              data-now="true"
            >
              {clockLabel}
            </text>
          );
        })()}

        {heatStrip.map((cell, i) => {
          const x1 = i === 0 ? padL : xForClock(cell.clock);
          const x2 =
            i < heatStrip.length - 1
              ? xForClock(heatStrip[i + 1]!.clock)
              : w - padR;
          const width = Math.max(2, x2 - x1);
          const prev = i > 0 ? heatStrip[i - 1]!.level : null;
          const showLabel = cell.level !== prev && width >= 64;
          return (
            <g key={`${cell.clock}-${i}`}>
              <rect
                x={x1}
                y={h - padB + 6}
                width={width}
                height={heatH}
                className="rp-oday-heat"
                data-level={cell.level}
              />
              {showLabel ? (
                <text
                  x={x1 + 4}
                  y={h - 6}
                  textAnchor="start"
                  className="rp-oday-heat-label"
                >
                  {pressureLegend[cell.level] ?? "NORMAL"}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {markTip && !tip ? (
        <aside className="rp-oday-tip" data-mark="true" aria-live="polite">
          <p className="rp-oday-tip-t">
            {markTip.at}
            <em>{markTip.kind}</em>
          </p>
          <p className="rp-oday-tip-body">
            <strong>{markTip.label}</strong>
            {markTip.detail ? ` · ${markTip.detail}` : ""}
          </p>
        </aside>
      ) : null}

      {tip ? (
        <aside className="rp-oday-tip" aria-live="polite">
          <p className="rp-oday-tip-t">
            {tip.isNow ? `NOW · ${tip.clock}` : tip.clock}
            <em>{tip.observed ? "Observed" : "Modeled"}</em>
          </p>
          <dl>
            <div>
              <dt>{tip.observed ? "Actual" : "Forecast"}</dt>
              <dd>
                {formatDecisionMoney(
                  tip.observed
                    ? (tip.revenueActual ?? 0)
                    : tip.revenueForecast,
                )}
              </dd>
            </div>
            <div>
              <dt>Expected</dt>
              <dd>{formatDecisionMoney(tip.revenueExpected)}</dd>
            </div>
            {tip.intervalActual != null || tip.intervalExpected != null ? (
              <div>
                <dt>This hour</dt>
                <dd>
                  {tip.intervalActual != null
                    ? formatDecisionMoney(tip.intervalActual)
                    : formatDecisionMoney(tip.intervalExpected ?? 0)}
                  {tip.intervalActual != null &&
                  tip.intervalExpected != null &&
                  tip.intervalExpected > 0
                    ? ` · ${tip.intervalActual >= tip.intervalExpected ? "↑" : "↓"} ${Math.abs(Math.round(((tip.intervalActual - tip.intervalExpected) / tip.intervalExpected) * 100))}%`
                    : ""}
                </dd>
              </div>
            ) : null}
            {tip.revenueLow != null && tip.revenueHigh != null ? (
              <div>
                <dt>Range</dt>
                <dd>
                  {formatDecisionMoney(tip.revenueLow)}–
                  {formatDecisionMoney(tip.revenueHigh)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Pressure</dt>
              <dd data-level={tip.pressureLevel}>{tip.pressure}%</dd>
            </div>
          </dl>
        </aside>
      ) : null}
    </div>
  );
}
