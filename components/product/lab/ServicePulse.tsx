"use client";

/**
 * Service Pulse — custom SVG operating forecast.
 * Observed | NOW | modeled. Seat-now vs Wait-12 divergence.
 */

import { useCallback, useId, useMemo, useState } from "react";
import {
  M_MAX,
  NOW_INDEX,
  NOW_M,
  PULSE,
  type PulseFocus,
  type PulseFuture,
  type PulsePoint,
} from "./servicePulseData";

type Props = {
  focus: PulseFocus;
  future: PulseFuture;
  mode: "live" | "why" | "futures" | "context" | "approved";
  hoverIndex: number | null;
  onHoverIndex: (i: number | null) => void;
  explain?: boolean;
  /** When false: Actual + recommended Wait path only. */
  compare?: boolean;
  onCompareChange?: (v: boolean) => void;
};

const W = 720;
const H = 320;
const PAD = { t: 28, r: 18, b: 36, l: 40 };
const INNER_W = W - PAD.l - PAD.r;
const INNER_H = H - PAD.t - PAD.b;

function xOf(m: number) {
  return PAD.l + (m / M_MAX) * INNER_W;
}
function yCover(v: number) {
  return PAD.t + INNER_H - (v / 90) * INNER_H;
}
function yPct(v: number) {
  return PAD.t + INNER_H - (v / 100) * INNER_H;
}

function linePath(
  pts: { m: number; v: number }[],
  yFn: (v: number) => number,
) {
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.m).toFixed(1)},${yFn(p.v).toFixed(1)}`)
    .join(" ");
}

function areaPath(
  pts: { m: number; v: number }[],
  yFn: (v: number) => number,
) {
  if (!pts.length) return "";
  const top = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.m).toFixed(1)},${yFn(p.v).toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1]!;
  const first = pts[0]!;
  return `${top} L${xOf(last.m).toFixed(1)},${(PAD.t + INNER_H).toFixed(1)} L${xOf(first.m).toFixed(1)},${(PAD.t + INNER_H).toFixed(1)} Z`;
}

export function ServicePulse({
  focus,
  future,
  mode,
  hoverIndex,
  onHoverIndex,
  explain,
  compare = false,
  onCompareChange,
}: Props) {
  const gid = useId().replace(/:/g, "");
  const [localHover, setLocalHover] = useState<number | null>(null);
  const hi = hoverIndex ?? localHover;

  const setHi = useCallback(
    (i: number | null) => {
      setLocalHover(i);
      onHoverIndex(i);
    },
    [onHoverIndex],
  );

  const actualPts = useMemo(
    () =>
      PULSE.filter((p) => p.actualCovers != null).map((p) => ({
        m: p.m,
        v: p.actualCovers as number,
      })),
    [],
  );
  const forecastPts = useMemo(
    () => PULSE.map((p) => ({ m: p.m, v: p.forecastCovers })),
    [],
  );
  const kitSeat = useMemo(
    () => PULSE.map((p) => ({ m: p.m, v: p.kitchenSeat })),
    [],
  );
  const kitWait = useMemo(
    () => PULSE.map((p) => ({ m: p.m, v: p.kitchenWait })),
    [],
  );
  const kitHard = useMemo(
    () =>
      PULSE.map((p) => ({
        m: p.m,
        v: p.m <= NOW_M ? p.kitchenWait : Math.max(78, p.kitchenWait - 6),
      })),
    [],
  );

  const densityBars = PULSE.map((p) => ({
    m: p.m,
    h: (p.arrivalDensity / 20) * INNER_H * 0.35,
    dens: p.arrivalDensity,
  }));

  const tip: PulsePoint | null = hi != null ? PULSE[hi]! : null;
  const dimCovers = focus != null && focus !== "covers";
  const dimKit = focus != null && focus !== "kitchen";
  const dimIn = focus != null && focus !== "inbound";
  const dimDel = focus != null && focus !== "delivery";

  const showFutures = mode === "futures" || mode === "approved";
  const showCompare = compare || showFutures;

  return (
    <div className="lab-pulse">
      <div className="lab-pulse-head">
        <h2 className="lab-pulse-title">Service Pulse</h2>
        <div className="lab-pulse-head-right">
          <ul className="lab-pulse-legend" aria-hidden="true">
            <li data-k="actual">Actual</li>
            <li data-k="wait">Wait 12m</li>
            {showCompare ? (
              <>
                <li data-k="forecast">Forecast</li>
                <li data-k="seat">Seat-now</li>
                <li data-k="delivery">Delivery</li>
              </>
            ) : null}
          </ul>
          {onCompareChange && !showFutures ? (
            <button
              type="button"
              className="lab-pulse-compare"
              data-on={compare ? "true" : undefined}
              onClick={() => onCompareChange(!compare)}
            >
              {compare ? "Hide scenarios" : "Compare scenarios"}
            </button>
          ) : null}
        </div>
      </div>

      <div className="lab-pulse-chart-wrap">
        <svg
          className="lab-pulse-svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Service Pulse — covers, kitchen load, arrivals"
          onMouseLeave={() => setHi(null)}
        >
          <defs>
            <linearGradient id={`${gid}-act`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(26, 32, 28, 0.14)" />
              <stop offset="100%" stopColor="rgba(26, 32, 28, 0)" />
            </linearGradient>
            <linearGradient id={`${gid}-fc`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(90, 120, 200, 0.16)" />
              <stop offset="100%" stopColor="rgba(90, 120, 200, 0)" />
            </linearGradient>
            <linearGradient id={`${gid}-dens`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(90, 120, 200, 0)" />
              <stop offset="100%" stopColor="rgba(90, 120, 200, 0.22)" />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <g key={pct}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={yPct(pct)}
                y2={yPct(pct)}
                className="lab-pulse-grid"
              />
              <text
                x={PAD.l - 6}
                y={yPct(pct) + 3}
                textAnchor="end"
                className="lab-pulse-axis"
              >
                {pct}
              </text>
            </g>
          ))}

          {/* Arrival density bands */}
          <g
            className="lab-pulse-density"
            data-dim={dimIn ? "true" : undefined}
            data-focus={focus === "inbound" ? "true" : undefined}
          >
            {densityBars.map((b, i) => (
              <rect
                key={i}
                x={xOf(b.m) - 8}
                y={PAD.t + INNER_H - b.h}
                width={16}
                height={b.h}
                fill={`url(#${gid}-dens)`}
                rx={2}
                opacity={hi === i ? 1 : 0.55}
              />
            ))}
          </g>

          {/* Forecast — compare mode only */}
          {showCompare ? (
            <path
              d={areaPath(forecastPts, yCover)}
              fill={`url(#${gid}-fc)`}
              className="lab-pulse-fc-area"
              data-dim={dimCovers ? "true" : undefined}
            />
          ) : null}

          {/* Actual area (observed only) */}
          <path
            d={areaPath(actualPts, yCover)}
            fill={`url(#${gid}-act)`}
            className="lab-pulse-act-area"
            data-dim={dimCovers ? "true" : undefined}
          />

          {showCompare ? (
            <path
              d={linePath(forecastPts, yCover)}
              className="lab-pulse-line lab-pulse-line-forecast"
              data-dim={dimCovers ? "true" : undefined}
            />
          ) : null}

          {/* Actual covers line */}
          <path
            d={linePath(actualPts, yCover)}
            className="lab-pulse-line lab-pulse-line-actual"
            data-dim={dimCovers ? "true" : undefined}
          />

          {showCompare ? (
            <path
              d={linePath(
                PULSE.map((p) => ({ m: p.m, v: 40 + p.deliveryPressure })),
                yPct,
              )}
              className="lab-pulse-line lab-pulse-line-delivery"
              data-dim={dimDel ? "true" : undefined}
              data-focus={focus === "delivery" ? "true" : undefined}
            />
          ) : null}

          {/* Kitchen: recommended Wait always; Seat/Hard only when comparing */}
          <g data-dim={dimKit ? "true" : undefined}>
            {showCompare ? (
              <path
                d={linePath(kitSeat, yPct)}
                className="lab-pulse-line lab-pulse-line-seat"
                data-active={
                  showFutures && future === "seat_now" ? "true" : undefined
                }
                data-muted={
                  showFutures && future !== "seat_now" ? "true" : undefined
                }
              />
            ) : null}
            <path
              d={linePath(kitWait, yPct)}
              className="lab-pulse-line lab-pulse-line-wait"
              data-active={
                !showFutures || future === "wait_12" ? "true" : undefined
              }
              data-rec="true"
              data-muted={
                showFutures && future !== "wait_12" ? "true" : undefined
              }
            />
            {showCompare && showFutures ? (
              <path
                d={linePath(kitHard, yPct)}
                className="lab-pulse-line lab-pulse-line-hard"
                data-active={future === "hard_stop" ? "true" : undefined}
                data-muted={future !== "hard_stop" ? "true" : undefined}
              />
            ) : null}
          </g>

          {/* NOW line */}
          <line
            x1={xOf(NOW_M)}
            x2={xOf(NOW_M)}
            y1={PAD.t}
            y2={PAD.t + INNER_H}
            className="lab-pulse-now"
          />
          <text
            x={xOf(NOW_M) + 4}
            y={PAD.t + 12}
            className="lab-pulse-now-label"
          >
            NOW
          </text>

          {/* Observed / modeled labels */}
          <text
            x={xOf(NOW_M) - 8}
            y={PAD.t + INNER_H + 28}
            textAnchor="end"
            className="lab-pulse-side"
          >
            Observed
          </text>
          <text
            x={xOf(NOW_M) + 8}
            y={PAD.t + INNER_H + 28}
            className="lab-pulse-side"
          >
            Modeled
          </text>

          {/* X ticks */}
          {PULSE.map((p) => (
            <text
              key={p.t}
              x={xOf(p.m)}
              y={H - 8}
              textAnchor="middle"
              className="lab-pulse-tick"
              data-now={p.isNow ? "true" : undefined}
            >
              {p.t}
            </text>
          ))}

          {/* Hover columns */}
          {PULSE.map((p, i) => (
            <rect
              key={`h${p.t}`}
              x={xOf(p.m) - INNER_W / PULSE.length / 2}
              y={PAD.t}
              width={INNER_W / PULSE.length}
              height={INNER_H}
              className="lab-pulse-hit"
              onMouseEnter={() => setHi(i)}
            />
          ))}

          {/* Crosshair */}
          {hi != null ? (
            <line
              x1={xOf(PULSE[hi]!.m)}
              x2={xOf(PULSE[hi]!.m)}
              y1={PAD.t}
              y2={PAD.t + INNER_H}
              className="lab-pulse-cross"
            />
          ) : null}

          {/* Why explain ribbon markers */}
          {explain ? (
            <g className="lab-pulse-explain">
              <circle cx={xOf(42)} cy={yPct(92)} r={4} className="lab-pulse-exp-pt" />
              <circle cx={xOf(60)} cy={yPct(97)} r={4} className="lab-pulse-exp-pt" data-bad="true" />
              <circle cx={xOf(60)} cy={yPct(89)} r={4} className="lab-pulse-exp-pt" data-good="true" />
            </g>
          ) : null}
        </svg>

        {tip ? (
          <div
            className="lab-pulse-tip"
            style={{
              left: `${((tip.m / M_MAX) * 100).toFixed(1)}%`,
            }}
            data-side={hi != null && hi >= NOW_INDEX ? "right" : "left"}
          >
            <p className="lab-pulse-tip-t">{tip.t}</p>
            <dl>
              <div>
                <dt>Forecast covers</dt>
                <dd>{tip.forecastCovers}</dd>
              </div>
              {tip.actualCovers != null ? (
                <div>
                  <dt>Actual covers</dt>
                  <dd>{tip.actualCovers}</dd>
                </div>
              ) : null}
              <div>
                <dt>Incoming · prior 15m</dt>
                <dd>{tip.arrivalDensity}</dd>
              </div>
              {showCompare ? (
                <>
                  <div>
                    <dt>Kitchen · seat-now</dt>
                    <dd>{tip.kitchenSeat}%</dd>
                  </div>
                  <div>
                    <dt>Kitchen · Wait 12m</dt>
                    <dd data-good>{tip.kitchenWait}%</dd>
                  </div>
                  <div>
                    <dt>Ticket</dt>
                    <dd>
                      {tip.ticketSeat}m vs {tip.ticketWait}m
                    </dd>
                  </div>
                </>
              ) : (
                <div>
                  <dt>Kitchen · Wait 12m</dt>
                  <dd data-good>{tip.kitchenWait}%</dd>
                </div>
              )}
              <div>
                <dt>Turns exposed</dt>
                <dd data-amber>{tip.turnsExposed}</dd>
              </div>
              {tip.contributionDelta > 0 ? (
                <div className="lab-pulse-tip-delta">
                  <dt>Expected Δ</dt>
                  <dd data-good>+€{tip.contributionDelta}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>
    </div>
  );
}
