"use client";

import { useMemo, useRef, useState } from "react";
import type { YearTrack, YearTrackPoint } from "@/lib/radr/lookback";
import { formatEuro } from "@/lib/radr/money";

function signedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1).replace(".", ",")}%`;
}

type Props = {
  track: YearTrack;
  selectedId?: string | null;
  bestMonthId?: string | null;
  comparing?: boolean;
  onSelect?: (pointId: string) => void;
};

/**
 * Year surface: months + fiscal quarters + terrace season.
 * Floor mix lives in its own chapter.
 */
export function YearTrackChart({
  track,
  selectedId = null,
  bestMonthId = null,
  comparing = false,
  onSelect,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [openQuarter, setOpenQuarter] = useState<string | null>(null);

  const w = 720;
  const h = 268;
  const pad = { t: 36, r: 12, b: 48, l: 12 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = track.points.length;
  const slot = innerW / Math.max(n, 1);
  const barW = Math.min(22, slot * 0.4);
  const planW = Math.min(30, slot * 0.58);

  const maxY = Math.max(
    ...track.points.map((p) =>
      Math.max(
        p.monthlyForecast,
        p.monthlyActual ?? 0,
        p.compareContribution ?? 0,
      ),
    ),
    1,
  );

  const bestIdx = useMemo(() => {
    if (bestMonthId) {
      const i = track.points.findIndex((p) => p.id === bestMonthId);
      if (i >= 0) return i;
    }
    let bi = -1;
    let best = -Infinity;
    track.points.forEach((p, i) => {
      if (p.future || p.partial || p.monthlyActual == null) return;
      if (p.monthlyActual > best) {
        best = p.monthlyActual;
        bi = i;
      }
    });
    return bi;
  }, [track.points, bestMonthId]);

  const xCenter = (i: number) => pad.l + slot * i + slot / 2;
  const xEdge = (i: number) => pad.l + slot * i;
  const yAt = (v: number) => pad.t + innerH - (v / maxY) * innerH;
  const hAt = (v: number) => (v / maxY) * innerH;

  const lastActualIdx = [...track.points]
    .reverse()
    .find((p) => !p.future)?.index;

  const activeIdx =
    hoverIdx ??
    (selectedId
      ? track.points.findIndex((p) => p.id === selectedId)
      : (lastActualIdx ?? null));
  const active: YearTrackPoint | null =
    activeIdx != null && activeIdx >= 0 ? (track.points[activeIdx] ?? null) : null;

  const activeQuarter =
    activeIdx != null
      ? track.quarters.find(
          (q) => activeIdx >= q.monthFrom && activeIdx <= q.monthTo,
        )
      : null;

  const tone =
    track.vsForecastPct >= 1
      ? "good"
      : track.vsForecastPct <= -2
        ? "bad"
        : "neutral";

  function indexFromClientX(clientX: number): number {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * w;
    const i = Math.floor((x - pad.l) / slot);
    return Math.max(0, Math.min(n - 1, i));
  }

  function handleMove(clientX: number) {
    setHoverIdx(indexFromClientX(clientX));
  }

  function handleClick(clientX: number) {
    const point = track.points[indexFromClientX(clientX)];
    if (point) onSelect?.(point.id);
  }

  const monthGapPct =
    active && active.monthlyActual != null && !active.future
      ? ((active.monthlyActual - active.monthlyForecast) /
          Math.max(1, active.monthlyForecast)) *
        100
      : null;

  const activeStatus = active
    ? active.future
      ? `${active.label} · forecast ahead`
      : activeQuarter
        ? `${active.label} · ${activeQuarter.id} ${activeQuarter.season}`
        : active.label
    : track.statusLine;

  return (
    <div
      className="rp-lookback-track"
      data-tone={tone}
      data-compare={comparing ? "true" : undefined}
      data-scrubbing={hoverIdx != null ? "true" : undefined}
    >
      <div className="rp-lookback-track-head">
        <div>
          <p className="rp-lookback-track-status">{activeStatus}</p>
        </div>
        <dl className="rp-lookback-track-stats">
          {active ? (
            <>
              <div data-tone={active.barTone}>
                <dt>{active.label}</dt>
                <dd>
                  {active.future
                    ? formatEuro(active.monthlyForecast)
                    : formatEuro(active.monthlyActual ?? 0)}
                </dd>
              </div>
              <div>
                <dt>Plan</dt>
                <dd>{formatEuro(active.monthlyForecast)}</dd>
              </div>
              <div
                data-tone={
                  monthGapPct == null
                    ? "neutral"
                    : monthGapPct >= 1
                      ? "good"
                      : monthGapPct <= -8
                        ? "bad"
                        : monthGapPct <= -2
                          ? "watch"
                          : "neutral"
                }
              >
                <dt>Vs plan</dt>
                <dd>
                  {monthGapPct == null ? "Forecast" : signedPct(monthGapPct)}
                </dd>
              </div>
              <div data-tone={tone}>
                <dt>Year so far</dt>
                <dd>{signedPct(track.vsForecastPct)}</dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt>YTD actual</dt>
                <dd>{formatEuro(track.ytdActual)}</dd>
              </div>
              <div>
                <dt>YTD plan</dt>
                <dd>{formatEuro(track.ytdForecast)}</dd>
              </div>
              <div>
                <dt>Full-year plan</dt>
                <dd>{formatEuro(track.fullYearForecast)}</dd>
              </div>
              <div data-tone={tone}>
                <dt>Tracking</dt>
                <dd>{signedPct(track.vsForecastPct)}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <div className="rp-lookback-track-plot">
        <svg
          ref={svgRef}
          className="rp-lookback-track-svg"
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label="Monthly contribution by fiscal quarter and terrace season"
          onPointerLeave={() => setHoverIdx(null)}
        >
          {track.quarters.map((q, qi) => {
            const x0 = xEdge(q.monthFrom);
            const x1 = xEdge(q.monthTo) + slot;
            return (
              <g key={q.id}>
                <rect
                  x={x0}
                  y={pad.t}
                  width={Math.max(0, x1 - x0)}
                  height={innerH}
                  className="rp-lookback-track-qband"
                  data-q={q.id}
                  opacity={qi % 2 === 0 ? 0.55 : 0.28}
                />
                <text
                  x={(x0 + x1) / 2}
                  y={pad.t - 10}
                  textAnchor="middle"
                  className="rp-lookback-track-qlabel"
                >
                  {q.id}
                </text>
              </g>
            );
          })}

          {track.seasons
            .filter((s) => s.id === "terrace")
            .map((s) => {
              const x0 = xEdge(s.monthFrom);
              const x1 = xEdge(s.monthTo) + slot;
              return (
                <g key={s.id}>
                  <rect
                    x={x0}
                    y={h - 18}
                    width={Math.max(0, x1 - x0)}
                    height={3}
                    rx={1.5}
                    className="rp-lookback-track-terrace"
                  />
                  <text
                    x={(x0 + x1) / 2}
                    y={h - 5}
                    textAnchor="middle"
                    className="rp-lookback-track-terracelabel"
                  >
                    TERRACE OPEN
                  </text>
                </g>
              );
            })}

          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={pad.l}
              x2={w - pad.r}
              y1={yAt(maxY * t)}
              y2={yAt(maxY * t)}
              className="rp-lookback-track-grid"
            />
          ))}

          {track.points.map((p, i) => {
            const cx = xCenter(i);
            const isActive = active?.id === p.id;
            const isSelected = selectedId === p.id;
            const isBest = i === bestIdx;
            const actual = p.monthlyActual;
            const plan = p.monthlyForecast;
            const planH = hAt(plan);
            const actualH = actual != null ? hAt(actual) : 0;
            const compare = p.compareContribution;
            const labelY =
              yAt(Math.max(actual ?? 0, plan, compare ?? 0)) -
              (isBest || p.notable ? 16 : 6);

            return (
              <g
                key={p.id}
                opacity={p.future && !isActive ? 0.55 : 1}
                data-active={isActive || isSelected ? "true" : undefined}
              >
                <rect
                  x={cx - planW / 2}
                  y={yAt(plan)}
                  width={planW}
                  height={Math.max(2, planH)}
                  rx={planW / 2}
                  className="rp-lookback-track-planbar"
                />

                {compare != null && compare > 0 ? (
                  <rect
                    x={cx + barW / 2 + 2}
                    y={yAt(compare)}
                    width={Math.max(3, barW * 0.28)}
                    height={Math.max(2, hAt(compare))}
                    rx={1.5}
                    className="rp-lookback-track-comparebar"
                  />
                ) : null}

                {p.future ? (
                  <rect
                    x={cx - barW / 2}
                    y={yAt(plan)}
                    width={barW}
                    height={Math.max(2, planH)}
                    rx={3}
                    className="rp-lookback-track-futurebar"
                  />
                ) : (
                  <rect
                    x={cx - barW / 2}
                    y={yAt(actual ?? 0)}
                    width={barW}
                    height={Math.max(2, actualH)}
                    rx={3}
                    className="rp-lookback-track-actualbar"
                    data-tone={p.barTone}
                    data-best={isBest ? "true" : undefined}
                    data-active={isActive || isSelected ? "true" : undefined}
                  />
                )}

                {isBest ? (
                  <text
                    x={cx}
                    y={labelY}
                    textAnchor="middle"
                    className="rp-lookback-track-bestlabel"
                  >
                    Best
                  </text>
                ) : p.notable && !p.future ? (
                  <>
                    <circle
                      cx={cx}
                      cy={labelY + 2}
                      r={3.25}
                      className="rp-lookback-track-notable-pip"
                      data-tone={p.notable.tone}
                    />
                    {(isActive || isSelected) && (
                      <text
                        x={cx}
                        y={labelY - 6}
                        textAnchor="middle"
                        className="rp-lookback-track-markerlabel"
                        data-tone={p.notable.tone}
                      >
                        {p.notable.label}
                      </text>
                    )}
                  </>
                ) : null}

                {(isActive || isSelected) && (
                  <line
                    x1={cx}
                    x2={cx}
                    y1={pad.t - 8}
                    y2={h - pad.b + 2}
                    className="rp-lookback-track-crosshair"
                  />
                )}

                <text
                  x={cx}
                  y={h - pad.b + 14}
                  textAnchor="middle"
                  className="rp-lookback-track-xlabel"
                  data-active={isActive || isSelected ? "true" : undefined}
                  opacity={p.future ? 0.4 : 1}
                >
                  {p.label}
                </text>
              </g>
            );
          })}

          <rect
            x={pad.l}
            y={pad.t - 12}
            width={innerW}
            height={innerH + 20}
            fill="transparent"
            className="rp-lookback-track-hit"
            style={{ cursor: onSelect ? "pointer" : "crosshair" }}
            onPointerMove={(e) => handleMove(e.clientX)}
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              handleMove(e.clientX);
            }}
            onClick={(e) => handleClick(e.clientX)}
          />
        </svg>

        {active ? (
          <div
            className="rp-lookback-track-tip"
            style={{
              left: `${Math.min(
                88,
                Math.max(12, (xCenter(active.index) / w) * 100),
              )}%`,
            }}
            data-future={active.future ? "true" : undefined}
          >
            <strong>{active.label}</strong>
            <span>
              {active.future
                ? `Plan ${formatEuro(active.monthlyForecast)}`
                : `${formatEuro(active.monthlyActual ?? 0)} contributed`}
            </span>
            {monthGapPct != null ? (
              <em data-tone={active.barTone}>{signedPct(monthGapPct)} vs plan</em>
            ) : null}
            {active.revenue != null ? (
              <em>Revenue {formatEuro(active.revenue)}</em>
            ) : null}
            {active.expenses != null ? (
              <em>Costs {formatEuro(active.expenses)}</em>
            ) : null}
            {active.verified != null && active.verified > 0 ? (
              <em data-tone="good">
                Verified {formatEuro(active.verified)}
              </em>
            ) : null}
            {activeQuarter ? (
              <em>
                {activeQuarter.id} · {activeQuarter.season}
              </em>
            ) : null}
            {active.notable ? (
              <em data-tone={active.notable.tone}>{active.notable.label}</em>
            ) : !active.future ? (
              <em>Click for drivers · labor · COGS · channel</em>
            ) : (
              <em>Click to open</em>
            )}
          </div>
        ) : null}
      </div>

      <ul className="rp-lookback-quarters" aria-label="Fiscal quarters">
        {track.quarters.map((q) => {
          const open = openQuarter === q.id;
          return (
            <li
              key={q.id}
              data-tone={q.tone}
              data-partial={q.partial ? "true" : undefined}
              data-open={open ? "true" : undefined}
            >
              <button
                type="button"
                className="rp-lookback-q-btn"
                aria-expanded={open}
                onClick={() =>
                  setOpenQuarter((cur) => (cur === q.id ? null : q.id))
                }
              >
                <span className="rp-lookback-q-id">{q.id}</span>
                <strong>{q.season}</strong>
                <em>
                  {q.partial && q.contribution === 0
                    ? "Ahead"
                    : formatEuro(q.contribution)}
                </em>
                <span data-tone={q.tone}>
                  {q.partial && q.contribution === 0
                    ? "Forecast"
                    : signedPct(q.vsPlanPct)}
                </span>
              </button>
              {open ? (
                <p className="rp-lookback-q-why">{q.why}</p>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="rp-lookback-track-legend" aria-hidden="true">
        <span data-swatch="planbar">Month plan</span>
        <span data-swatch="actual">Above plan</span>
        <span data-swatch="watch">Soft</span>
        <span data-swatch="bad">Below</span>
        <span data-swatch="forecast">Still ahead</span>
        <span data-swatch="terrace">Terrace season</span>
        {comparing ? <span data-swatch="compare">Prior year</span> : null}
        <span className="rp-lookback-track-hint">
          Click a quarter for why · click a month for detail
        </span>
      </p>
    </div>
  );
}
