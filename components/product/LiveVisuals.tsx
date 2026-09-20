"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { TERRITORY_COLORS, type TerritoryId } from "@/lib/radr/brandTokens";
import {
  BUY_INVOICE_COMPARE,
  EXPOSURE_BY_LOCATION,
  LABOR_CAPACITY_SERIES,
  RISK_TREND_24H,
  SINCE_CHECK_TIMELINE,
  VALUE_FLOW,
  VALUE_FLOW_TIPS,
  sellCancelDecomp,
  type TrendPoint,
} from "@/lib/radr/liveVisuals";
import type { SinceLastCheck } from "@/lib/radr/attentionState";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";

function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function linePath(values: number[], w: number, h: number, pad = 4): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - pad * 2);
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

/** Count-up once on mount/change: no continuous RAF after settle. */
export function CountUpEuro({
  value,
  className,
  durationMs = 520,
}: {
  value: number;
  className?: string;
  durationMs?: number;
}) {
  const [display, setDisplay] = useState(value);
  const [pulse, setPulse] = useState(false);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    const from =
      prev.current == null
        ? reducedMotion()
          ? value
          : Math.max(0, value - 95)
        : prev.current;
    prev.current = value;
    if (reducedMotion() || from === value) {
      setDisplay(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setDisplay(value);
        setPulse(true);
        window.setTimeout(() => setPulse(false), 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return (
    <strong className={className} data-pulse={pulse ? "true" : undefined}>
      {formatFindingEuro(display)}
    </strong>
  );
}

export function ExposureBars({
  rows,
  total,
}: {
  rows: { territory: TerritoryId; euro: number }[];
  total: number;
}) {
  const [ready, setReady] = useState(false);
  const [tip, setTip] = useState<TerritoryId | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 40);
    return () => window.clearTimeout(id);
  }, []);

  const max = Math.max(...rows.map((r) => r.euro), 1);

  return (
    <ul className="rp-viz-bars" data-ready={ready ? "true" : undefined}>
      {rows.map((row) => {
        const pct = total > 0 ? (row.euro / total) * 100 : 0;
        const width = Math.max(10, (row.euro / max) * 100);
        return (
          <li
            key={row.territory}
            data-terr={row.territory}
            onMouseEnter={() => setTip(row.territory)}
            onMouseLeave={() => setTip(null)}
          >
            <div className="rp-viz-bars-head">
              <span className="rp-viz-bars-lab">{row.territory}</span>
              <strong>{formatFindingEuro(row.euro)}</strong>
            </div>
            <span className="rp-viz-bars-track">
              <i
                style={
                  {
                    "--bar-w": ready ? `${width}%` : "0%",
                    "--bar-c": TERRITORY_COLORS[row.territory],
                  } as CSSProperties
                }
              />
            </span>
            {tip === row.territory ? (
              <span className="rp-viz-tip" role="tooltip">
                {row.territory}
                <em>
                  {formatFindingEuro(row.euro)} · {pct.toFixed(0)}% of exposure
                </em>
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ExposureByLocation() {
  const total = EXPOSURE_BY_LOCATION.reduce((s, r) => s + r.euro, 0);
  const max = Math.max(...EXPOSURE_BY_LOCATION.map((r) => r.euro), 1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="rp-viz-loc" aria-label="Exposure by location">
      <p className="rp-viz-loc-label">Exposure by location</p>
      <ul data-ready={ready ? "true" : undefined}>
        {EXPOSURE_BY_LOCATION.map((row) => (
          <li key={row.id}>
            <div className="rp-viz-loc-head">
              <span>{row.name}</span>
              <strong>{formatFindingEuro(row.euro)}</strong>
            </div>
            <span className="rp-viz-loc-track">
              <i
                style={
                  {
                    "--bar-w": ready
                      ? `${Math.max(8, (row.euro / max) * 100)}%`
                      : "0%",
                  } as CSSProperties
                }
              />
            </span>
            <em>{total > 0 ? `${((row.euro / total) * 100).toFixed(0)}%` : ""}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Sparkline({
  values,
  color = "rgba(16,20,17,0.45)",
  width = 72,
  height = 22,
  label,
  unit,
}: {
  values: readonly number[];
  color?: string;
  width?: number;
  height?: number;
  label?: string;
  unit?: "euro" | "pct" | "number";
}) {
  const path = useMemo(
    () => linePath([...values], width, height),
    [values, width, height],
  );
  const [drawn, setDrawn] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(id);
  }, []);

  const tip =
    hover != null
      ? (() => {
          const v = values[hover]!;
          const day = `D-${values.length - 1 - hover}`;
          if (unit === "euro") return `${day} · ${formatFindingEuro(Math.round(v))}`;
          if (unit === "pct") return `${day} · ${v.toFixed(1)}%`;
          return `${day} · ${Math.round(v)}`;
        })()
      : null;

  return (
    <span className="rp-viz-spark-wrap">
      <svg
        className="rp-viz-spark"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label={label}
        data-drawn={drawn ? "true" : undefined}
        onMouseLeave={() => setHover(null)}
      >
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((_, i) => (
          <rect
            key={i}
            x={(i / (values.length - 1)) * (width - 8) + 2}
            y={0}
            width={Math.max(8, width / values.length)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {tip ? (
        <span className="rp-viz-tip" role="tooltip">
          {tip}
        </span>
      ) : null}
    </span>
  );
}

function DeltaMark({
  x,
  y,
  fill,
  active,
}: {
  x: number;
  y: number;
  fill: string;
  active?: boolean;
}) {
  const s = active ? 7 : 5.5;
  return (
    <polygon
      points={`${x},${y - s} ${x + s * 0.9},${y + s * 0.7} ${x - s * 0.9},${y + s * 0.7}`}
      fill={fill}
      stroke="#FAF9F5"
      strokeWidth={1.25}
    />
  );
}

export function RiskTrend24h({
  points = RISK_TREND_24H,
  width = 360,
  height = 128,
}: {
  points?: TrendPoint[];
  width?: number;
  height?: number;
}) {
  const uid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [drawn, setDrawn] = useState(false);
  const values = points.map((p) => p.value);
  const path = useMemo(
    () => linePath(values, width, height, 12),
    [values, width, height],
  );
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const coords = points.map((p, i) => ({
    ...p,
    i,
    x: 12 + (i / (points.length - 1)) * (width - 24),
    y: 12 + (1 - (p.value - min) / span) * (height - 24),
  }));

  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(true), 100);
    return () => window.clearTimeout(id);
  }, []);

  const tip = hover != null ? coords[hover] : null;
  const last = coords[coords.length - 1]!;
  const first = coords[0]!;
  const low = coords.reduce((best, c) => (c.value < best.value ? c : best));
  const delta = last.value - (coords[coords.length - 2]?.value ?? last.value);

  return (
    <div className="rp-viz-trend">
      <header>
        <p>Value at risk · last 24h</p>
        <strong>
          Now {formatFindingEuro(last.value)}
          <em>
            {delta >= 0 ? "+" : ""}
            {formatFindingEuro(Math.abs(delta))} since last check
          </em>
        </strong>
      </header>
      <div className="rp-viz-trend-meta">
        <span>Start {formatFindingEuro(first.value)}</span>
        <span>Low {formatFindingEuro(low.value)}</span>
        <span>Now {formatFindingEuro(last.value)}</span>
      </div>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        data-drawn={drawn ? "true" : undefined}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,232,137,0.28)" />
            <stop offset="55%" stopColor="rgba(0,232,137,0.08)" />
            <stop offset="100%" stopColor="rgba(0,232,137,0)" />
          </linearGradient>
          <filter id={`${uid}-glow`} x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1={12}
          x2={width - 12}
          y1={height - 12}
          y2={height - 12}
          stroke="rgba(243,241,235,0.1)"
        />
        <path
          d={`${path} L${width - 12} ${height - 12} L12 ${height - 12} Z`}
          fill={`url(#${uid}-g)`}
          className="rp-viz-trend-fill"
        />
        <path
          className="rp-viz-trend-line"
          d={path}
          fill="none"
          stroke="rgba(0,232,137,0.9)"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${uid}-glow)`}
        />
        {coords.map((c) =>
          c.event ? (
            <DeltaMark
              key={c.t}
              x={c.x}
              y={c.y}
              fill={TERRITORY_COLORS[c.event.territory]}
              active={hover === c.i}
            />
          ) : null,
        )}
        <circle
          cx={last.x}
          cy={last.y}
          r={hover === last.i ? 4.5 : 3.5}
          fill="var(--rp-signal, #00e889)"
          stroke="#121614"
          strokeWidth={1.5}
        />
        {coords.map((c) => (
          <rect
            key={`h-${c.t}`}
            x={c.x - 14}
            y={0}
            width={28}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(c.i)}
          />
        ))}
        {tip ? (
          <line
            x1={tip.x}
            x2={tip.x}
            y1={10}
            y2={height - 12}
            stroke="rgba(243,241,235,0.18)"
            pointerEvents="none"
          />
        ) : null}
      </svg>
      {tip ? (
        <div className="rp-viz-trend-tip" role="tooltip">
          <strong>{tip.t}</strong>
          <span>{formatFindingEuro(tip.value)}</span>
          {tip.event ? (
            <em style={{ color: TERRITORY_COLORS[tip.event.territory] }}>
              {tip.event.label} · +{formatFindingEuro(tip.event.deltaEuro)}
            </em>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function LaborCapacitySpark() {
  const w = 112;
  const h = 36;
  const [tip, setTip] = useState<string | null>(null);
  const demand = LABOR_CAPACITY_SERIES.map((p) => p.demand);
  const capacity = LABOR_CAPACITY_SERIES.map((p) => p.capacity);
  const all = [...demand, ...capacity];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const xy = (vals: readonly number[]) =>
    vals
      .map((v, i) => {
        const x = 2 + (i / (vals.length - 1)) * (w - 4);
        const y = 2 + (1 - (v - min) / span) * (h - 4);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  const gapIdx = LABOR_CAPACITY_SERIES.findIndex((p) => p.demand > p.capacity);
  const peak = LABOR_CAPACITY_SERIES.reduce((best, p) =>
    p.demand - p.capacity > best.demand - best.capacity ? p : best,
  );

  return (
    <span
      className="rp-viz-mini-wrap"
      onMouseEnter={() =>
        setTip(
          `${peak.t} · Demand capacity gap: +${peak.demand - peak.capacity} covers`,
        )
      }
      onMouseLeave={() => setTip(null)}
    >
      <svg
        className="rp-viz-mini"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-label="Demand vs staffing capacity"
      >
        <path
          d={xy(capacity)}
          fill="none"
          stroke="rgba(16,20,17,0.28)"
          strokeWidth={1.1}
          strokeDasharray="2 2"
        />
        <path
          d={xy(demand)}
          fill="none"
          stroke={TERRITORY_COLORS.LABOR}
          strokeWidth={1.4}
          strokeLinecap="round"
        />
        {gapIdx >= 0 ? (
          <circle
            cx={2 + (gapIdx / (LABOR_CAPACITY_SERIES.length - 1)) * (w - 4)}
            cy={
              2 +
              (1 - (LABOR_CAPACITY_SERIES[gapIdx]!.demand - min) / span) *
                (h - 4)
            }
            r={2.4}
            fill={TERRITORY_COLORS.LABOR}
          />
        ) : null}
      </svg>
      {tip ? (
        <span className="rp-viz-tip" role="tooltip">
          {tip}
        </span>
      ) : null}
    </span>
  );
}

export function CancelDecompositionBar() {
  const { bookingValue, expectedRebook, atRisk } = sellCancelDecomp();
  const rebookPct = (expectedRebook / bookingValue) * 100;
  const riskPct = (atRisk / bookingValue) * 100;
  return (
    <div className="rp-viz-decomp" aria-label="Cancellation value split">
      <div className="rp-viz-decomp-track">
        <i style={{ width: `${rebookPct}%` }} data-part="rebook" />
        <i style={{ width: `${riskPct}%` }} data-part="risk" />
      </div>
      <p>
        <span>Booking {formatFindingEuro(bookingValue)}</span>
        <span>Potential {formatFindingEuro(expectedRebook)}</span>
        <strong>Verified {formatFindingEuro(atRisk)}</strong>
      </p>
    </div>
  );
}

/** Compact recovery indicator for RECOVER findings. */
export function RecoveryIndicator() {
  const d = sellCancelDecomp();
  const booking = d.bookingValue;
  const recoverable = d.verified;
  const pct = (recoverable / booking) * 100;
  return (
    <div className="rp-viz-recovery" aria-label="Recovery indicator">
      <div className="rp-viz-recovery-track">
        <i style={{ width: `${pct}%` }} />
      </div>
      <p>
        <span>Released {formatFindingEuro(booking)}</span>
        <strong>{formatFindingEuro(recoverable)} verified</strong>
      </p>
    </div>
  );
}

export function InvoiceDeltaBars() {
  const { contracted, invoice, delta, lineItems } = BUY_INVOICE_COMPARE;
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rp-viz-invoice"
      aria-label="Contract vs invoice"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div>
        <em>Contracted</em>
        <span>
          <i style={{ width: `${(contracted / invoice) * 100}%` }} data-k="c" />
        </span>
        <b>{formatFindingEuro(contracted)}</b>
      </div>
      <div>
        <em>Invoice</em>
        <span>
          <i style={{ width: "100%" }} data-k="i" />
        </span>
        <b>{formatFindingEuro(invoice)}</b>
      </div>
      <p data-delta>Δ {formatFindingEuro(delta)}</p>
      {open ? (
        <ul className="rp-viz-invoice-tip" role="tooltip">
          {lineItems.map((row) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <em>+{formatFindingEuro(row.delta)}</em>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Compact RADR loop: progressive visual weight. */
export function ValueFlow() {
  const f = VALUE_FLOW;
  const nodes = [
    {
      key: "id",
      label: "Identified",
      euro: f.identified,
      tip: VALUE_FLOW_TIPS.identified,
      weight: 1,
    },
    {
      key: "act",
      label: "Actionable",
      euro: f.actionable,
      tip: VALUE_FLOW_TIPS.actionable,
      weight: 2,
    },
    {
      key: "rec",
      label: "Recoverable",
      euro: f.recoverable,
      tip: VALUE_FLOW_TIPS.recoverable,
      weight: 3,
    },
    {
      key: "ver",
      label: "Verified",
      euro: f.verified,
      tip: VALUE_FLOW_TIPS.verified,
      weight: 4,
    },
  ] as const;
  const [tip, setTip] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (reducedMotion()) return;
    const id = window.setTimeout(() => setCelebrate(true), 700);
    const clear = window.setTimeout(() => setCelebrate(false), 1500);
    return () => {
      window.clearTimeout(id);
      window.clearTimeout(clear);
    };
  }, []);

  return (
    <div className="rp-viz-flow" aria-label="Value flow">
      <p className="rp-viz-flow-label">Value flow</p>
      <div className="rp-viz-flow-track">
        {nodes.map((n, i) => (
          <div
            key={n.key}
            className="rp-viz-flow-node"
            data-k={n.key}
            data-weight={n.weight}
            onMouseEnter={() => setTip(n.key)}
            onMouseLeave={() => setTip(null)}
          >
            {i > 0 ? (
              <span className="rp-viz-flow-pipe" aria-hidden="true">
                →
              </span>
            ) : null}
            <strong>
              {formatFindingEuro(n.euro)}
              {n.key === "ver" && celebrate ? (
                <span className="rp-viz-particles" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, pi) => (
                    <i key={pi} style={{ "--i": pi } as CSSProperties} />
                  ))}
                </span>
              ) : null}
            </strong>
            <em>{n.label}</em>
            {tip === n.key ? (
              <span className="rp-viz-tip" role="tooltip">
                {n.tip}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SinceCheckDrawer({
  open,
  onClose,
  since,
}: {
  open: boolean;
  onClose: () => void;
  since?: SinceLastCheck | null;
}) {
  if (!open) return null;
  const liveEvents = since?.events?.length
    ? since.events.map((e, i) => ({
        key: `${e.kind}-${i}`,
        t: e.t,
        label: e.label,
        territory: e.territory,
      }))
    : SINCE_CHECK_TIMELINE.map((row) => ({
        key: row.t + row.label,
        t: row.t,
        label: row.label,
        territory: row.territory,
      }));

  return (
    <div className="rp-viz-since" role="dialog" aria-label="Since your last check">
      <button
        type="button"
        className="rp-viz-since-scrim"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="rp-viz-since-panel">
        <header>
          <p>Since your last check</p>
          <button type="button" className="rp-btn rp-btn-ghost" onClick={onClose}>
            Close
          </button>
        </header>
        {since?.lines?.length ? (
          <ul className="rp-viz-since-summary">
            {since.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <ol>
          {liveEvents.map((row) => (
            <li key={row.key} data-terr={row.territory}>
              <time>{row.t}</time>
              <span>{row.label}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
