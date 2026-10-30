"use client";

/**
 * Futures trajectory — Decision-owned scenarios as visual tracks.
 * Peak D-1911 keeps its service MATRIX. All other Decisions render
 * from FuturesBundle scenarios (never Peak placeholders).
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import type { FuturesBundle, Scenario } from "@/lib/radr/decision/futures/types";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  getConnectedScenario,
  setPeakPath,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";
import { D1911_TRAJECTORY_INCREMENTAL } from "@/lib/radr/decision/economics/validator";

type Metric = "contribution" | "kitchen" | "ticket" | "turns";
type Horizon = "NOW" | "+15" | "+30" | "+60";
type PeakKey = "seat" | "wait" | "kill";

const HORIZONS: Horizon[] = ["NOW", "+15", "+30", "+60"];

/** Contribution track = incrementalVsBaseline (PRIMARY). Kitchen/ticket/turns operational. */
const PEAK_MATRIX: Record<
  PeakKey,
  Record<Metric, Record<Horizon, number>>
> = {
  seat: {
    contribution: D1911_TRAJECTORY_INCREMENTAL.seat,
    kitchen: { NOW: 92, "+15": 97, "+30": 98, "+60": 96 },
    ticket: { NOW: 14, "+15": 17, "+30": 19, "+60": 18 },
    turns: { NOW: 9, "+15": 11, "+30": 12, "+60": 10 },
  },
  wait: {
    contribution: D1911_TRAJECTORY_INCREMENTAL.wait,
    kitchen: { NOW: 92, "+15": 91, "+30": 88, "+60": 84 },
    ticket: { NOW: 14, "+15": 14, "+30": 13, "+60": 12 },
    turns: { NOW: 9, "+15": 7, "+30": 4, "+60": 2 },
  },
  kill: {
    contribution: D1911_TRAJECTORY_INCREMENTAL.kill,
    kitchen: { NOW: 92, "+15": 88, "+30": 82, "+60": 78 },
    ticket: { NOW: 14, "+15": 13, "+30": 12, "+60": 11 },
    turns: { NOW: 9, "+15": 5, "+30": 3, "+60": 2 },
  },
};

const PEAK_META: Record<
  PeakKey,
  { label: string; short: string; recommended?: boolean }
> = {
  seat: { label: "Seat now", short: "Seat" },
  wait: { label: "Wait 12", short: "Wait", recommended: true },
  kill: { label: "Throttle delivery", short: "Throttle" },
};

const PEAK_METRIC_META: Record<
  Metric,
  { label: string; unit: "€" | "%" | "min" | "n"; higherIsWorse: boolean }
> = {
  contribution: {
    label: "Incremental vs seat-now",
    unit: "€",
    higherIsWorse: false,
  },
  kitchen: { label: "Kitchen", unit: "%", higherIsWorse: true },
  ticket: { label: "Ticket time", unit: "min", higherIsWorse: true },
  turns: { label: "Turn risk", unit: "n", higherIsWorse: true },
};

function peakKey(id: string): PeakKey | null {
  const lower = id.toLowerCase();
  if (lower.includes("wait_12") || lower.includes("wait12") || /(?:^|_)wait(?:_|$)/.test(lower))
    return "wait";
  if (lower.includes("seat")) return "seat";
  if (
    lower.includes("hard") ||
    lower.includes("refuse") ||
    lower.includes("kill") ||
    lower.includes("throttle")
  )
    return "kill";
  return null;
}

function formatPeakCell(metric: Metric, v: number): string {
  const unit = PEAK_METRIC_META[metric].unit;
  if (unit === "€") {
    if (v === 0) return "€0";
    const sign = v > 0 ? "+" : "−";
    return `${sign}€${Math.abs(v).toLocaleString("en-IE")}`;
  }
  if (unit === "%") return `${v}%`;
  if (unit === "min") return `${v}m`;
  return String(v);
}

function seriesYsFromVals(
  vals: number[],
  higherIsWorse: boolean,
): number[] {
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  return vals.map((v) => {
    const t = (v - min) / span;
    const score = higherIsWorse ? 1 - t : t;
    return 78 - score * 58;
  });
}

function poly(ys: number[]): string {
  return HORIZONS.map((_, i) => {
    const x = 10 + (i / (HORIZONS.length - 1)) * 80;
    return `${x},${ys[i] ?? 40}`;
  }).join(" ");
}

function scenarioEndEuro(s: Scenario): number {
  const m = s.economicMetrics?.[0]?.value;
  if (typeof m === "number") return Math.round(m);
  if (s.expectedContributionDefined === false) return 0;
  return Math.round(s.expectedContribution ?? 0);
}

type Props = {
  futures: FuturesBundle;
  selectedId?: string;
  onSelect?: (id: string) => void;
  connectPeak?: boolean;
  /** When set, Peak matrix only for D-1911. */
  decisionId?: string;
};

export function FuturesTrajectory({
  futures,
  selectedId,
  onSelect,
  connectPeak = false,
  decisionId,
}: Props) {
  // Peak matrix ONLY when this Decision is D-1911 — never infer from futures alone.
  const isPeak = decisionId === DECISION_IDS.peak;

  if (isPeak) {
    return (
      <PeakTrajectory
        futures={futures}
        selectedId={selectedId}
        onSelect={onSelect}
        connectPeak={connectPeak}
      />
    );
  }

  return (
    <ScenarioTrajectory
      futures={futures}
      selectedId={selectedId}
      onSelect={onSelect}
      decisionId={decisionId}
    />
  );
}

function PeakTrajectory({
  futures,
  selectedId,
  onSelect,
  connectPeak,
}: Props) {
  const connected = useSyncExternalStore(
    subscribeConnected,
    getConnectedScenario,
    getConnectedScenario,
  );
  void connected;

  const scenarioByKey = useMemo(() => {
    const map = new Map<PeakKey, Scenario>();
    for (const s of futures.scenarios) {
      const key = peakKey(s.id);
      if (key) map.set(key, s);
    }
    return map;
  }, [futures.scenarios]);

  const [local, setLocal] = useState(
    selectedId ?? futures.recommendedScenarioId,
  );
  const [hovered, setHovered] = useState<PeakKey | null>(null);
  const [metric, setMetric] = useState<Metric>("contribution");
  const activeId = selectedId ?? local;
  const activeKey = peakKey(activeId) ?? "wait";
  const focusKey = hovered ?? activeKey;

  const tracks = useMemo(
    () =>
      (["seat", "wait", "kill"] as const).map((key) => {
        const vals = HORIZONS.map((h) => PEAK_MATRIX[key][metric][h]);
        return {
          key,
          ...PEAK_META[key],
          points: poly(
            seriesYsFromVals(vals, PEAK_METRIC_META[metric].higherIsWorse),
          ),
          scenario: scenarioByKey.get(key),
          cells: HORIZONS.map((h) => ({
            h,
            formatted: formatPeakCell(metric, PEAK_MATRIX[key][metric][h]),
          })),
          ys: seriesYsFromVals(vals, PEAK_METRIC_META[metric].higherIsWorse),
        };
      }),
    [metric, scenarioByKey],
  );

  const pick = (key: PeakKey) => {
    const s = scenarioByKey.get(key);
    const id = s?.id ?? key;
    setLocal(id);
    onSelect?.(id);
    if (connectPeak) {
      if (key === "wait") setPeakPath("wait");
      else if (key === "seat") setPeakPath("seat");
      else setPeakPath("refuse");
    }
  };

  const activeScenario =
    scenarioByKey.get(focusKey) ??
    futures.scenarios.find((s) => s.recommended) ??
    futures.scenarios[0];
  const endValue = PEAK_MATRIX[focusKey][metric]["+60"];

  return (
    <div className="rp-traj" data-surface="light" data-mode="peak">
      <div className="rp-traj-head">
        <p className="rp-traj-kicker">Futures · trajectory</p>
        <p className="rp-traj-sub">
          Economics frame: <strong>incremental vs seat-now</strong> (primary) ·
          absolute covers separately · not vs plan. Paths: Seat now · Wait 12 ·
          Throttle · horizons NOW / +15 / +30 / +60
        </p>
      </div>
      <MetricTabs
        metrics={PEAK_METRIC_META}
        metric={metric}
        onMetric={setMetric}
      />
      <div className="rp-traj-options" role="group" aria-label="Futures options">
        {tracks.map((tr) => (
          <button
            key={tr.key}
            type="button"
            data-selected={activeKey === tr.key ? "true" : undefined}
            data-rec={tr.recommended ? "true" : undefined}
            data-dim={focusKey && focusKey !== tr.key ? "true" : undefined}
            onClick={() => pick(tr.key)}
            onMouseEnter={() => setHovered(tr.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <strong>{tr.label}</strong>
            {tr.recommended ? <em>RADR</em> : null}
          </button>
        ))}
      </div>
      <TrajectorySvg
        tracks={tracks}
        activeKey={activeKey}
        focusKey={focusKey}
        metricLabel={PEAK_METRIC_META[metric].label}
        onHover={setHovered}
        onPick={pick}
      />
      <div className="rp-traj-matrix-scroll">
        <MatrixTable
          tracks={tracks}
          activeKey={activeKey}
          onPick={pick}
          onHover={setHovered}
        />
      </div>
      {activeScenario ? (
        <aside className="rp-traj-inspect">
          <p className="rp-traj-kicker">Selected · {PEAK_META[focusKey].label}</p>
          <h3>
            {PEAK_METRIC_META[metric].label} at +60 ·{" "}
            <span
              data-tone={
                PEAK_METRIC_META[metric].higherIsWorse &&
                endValue > PEAK_MATRIX.wait[metric]["+60"]
                  ? "risk"
                  : "ok"
              }
            >
              {formatPeakCell(metric, endValue)}
            </span>
          </h3>
          <p className="rp-drec-quiet">
            {activeScenario.mainRiskDescription ?? activeScenario.note}
          </p>
        </aside>
      ) : null}
    </div>
  );
}

type ScenarioHorizon = string;

type HorizonProfile = {
  labels: ScenarioHorizon[];
  axisNote: string;
  series: (endEuro: number) => number[];
};

function horizonProfileForDecision(decisionId?: string): HorizonProfile {
  if (
    decisionId === DECISION_IDS.marginCoke ||
    decisionId === DECISION_IDS.tuna ||
    decisionId === DECISION_IDS.tunaStructural ||
    decisionId === DECISION_IDS.supplier ||
    decisionId === DECISION_IDS.supplierOpen
  ) {
    return {
      labels: ["NOW", "W1", "W2", "W4", "W8"],
      axisNote: "expected contribution across weeks",
      series: (e) => [
        0,
        Math.round(e * 0.2),
        Math.round(e * 0.45),
        Math.round(e * 0.75),
        e,
      ],
    };
  }
  if (
    decisionId === DECISION_IDS.hotelReadiness ||
    decisionId === DECISION_IDS.ota
  ) {
    return {
      labels: ["NOW", "+30m", "+2h", "Tonight", "+24h"],
      axisNote:
        decisionId === DECISION_IDS.hotelReadiness
          ? "rooms-ready trajectory"
          : "pickup / inventory trajectory",
      series: (e) => [
        0,
        Math.round(e * 0.25),
        Math.round(e * 0.55),
        Math.round(e * 0.85),
        e,
      ],
    };
  }
  return {
    labels: ["NOW", "+15", "+30", "+60"],
    axisNote: "expected contribution across NOW → +60",
    series: (e) => [
      0,
      Math.round(e * 0.15),
      Math.round(e * 0.55),
      e,
    ],
  };
}

function ScenarioTrajectory({
  futures,
  selectedId,
  onSelect,
  decisionId,
}: Props) {
  const scenarios = futures.scenarios;
  const profile = horizonProfileForDecision(decisionId);
  const [local, setLocal] = useState(
    selectedId ?? futures.recommendedScenarioId,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const activeId = selectedId ?? local;
  const focusId = hovered ?? activeId;

  const tracks = useMemo(() => {
    return scenarios.map((s) => {
      const end = scenarioEndEuro(s);
      const vals = profile.series(end);
      const ys = seriesYsFromVals(vals, false);
      return {
        key: s.id,
        label: s.label,
        short: s.label,
        recommended: Boolean(s.recommended),
        points: polyFromYs(ys, vals.length),
        ys,
        scenario: s,
        cells: profile.labels.map((h, i) => ({
          h,
          formatted:
            vals[i] === 0
              ? "€0"
              : formatDecisionMoney(vals[i] ?? 0),
        })),
        end,
      };
    });
  }, [scenarios, profile]);

  const pick = (id: string) => {
    setLocal(id);
    onSelect?.(id);
  };

  const active =
    scenarios.find((s) => s.id === focusId) ??
    scenarios.find((s) => s.recommended) ??
    scenarios[0];

  const labels = scenarios.map((s) => s.label).join(" · ");

  return (
    <div className="rp-traj" data-surface="light" data-mode="scenario">
      <div className="rp-traj-head">
        <p className="rp-traj-kicker">Futures trajectory</p>
        <p className="rp-traj-sub">
          {labels || "Decision options"} · {profile.axisNote}
        </p>
      </div>

      <div className="rp-traj-options" role="group" aria-label="Futures options">
        {tracks.map((tr) => (
          <button
            key={tr.key}
            type="button"
            data-selected={activeId === tr.key ? "true" : undefined}
            data-rec={tr.recommended ? "true" : undefined}
            data-dim={focusId && focusId !== tr.key ? "true" : undefined}
            onClick={() => pick(tr.key)}
            onMouseEnter={() => setHovered(tr.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <strong>{tr.label}</strong>
            {tr.recommended ? <em>RADR</em> : null}
          </button>
        ))}
      </div>

      <svg
        className="rp-traj-svg"
        viewBox="0 0 100 92"
        role="img"
        aria-label="Contribution trajectories"
      >
        {profile.labels.map((t, i) => {
          const x = 10 + (i / Math.max(1, profile.labels.length - 1)) * 80;
          return (
            <g key={t}>
              <line
                x1={x}
                y1="12"
                x2={x}
                y2="82"
                className="rp-traj-grid"
              />
              <text x={x} y="90" textAnchor="middle" className="rp-traj-tick">
                {t}
              </text>
            </g>
          );
        })}
        {tracks.map((tr) => (
          <polyline
            key={tr.key}
            points={tr.points}
            className="rp-traj-line"
            data-selected={activeId === tr.key ? "true" : undefined}
            data-rec={tr.recommended ? "true" : undefined}
            data-dim={focusId && focusId !== tr.key ? "true" : undefined}
            onMouseEnter={() => setHovered(tr.key)}
            onClick={() => pick(tr.key)}
          />
        ))}
      </svg>

      <div className="rp-traj-matrix-scroll">
        <table className="rp-traj-matrix-table">
          <thead>
            <tr>
              <th scope="col">Option</th>
              {profile.labels.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tracks.map((tr) => (
              <tr
                key={tr.key}
                data-selected={activeId === tr.key ? "true" : undefined}
                onClick={() => pick(tr.key)}
                onMouseEnter={() => setHovered(tr.key)}
                onMouseLeave={() => setHovered(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") pick(tr.key);
                }}
              >
                <td className="rp-traj-opt-cell">
                  <span className="rp-traj-opt-label">{tr.label}</span>
                  {tr.recommended ? (
                    <em className="rp-traj-opt-rec">RADR</em>
                  ) : null}
                </td>
                {tr.cells.map((c) => (
                  <td key={c.h}>{c.formatted}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active ? (
        <aside className="rp-traj-inspect">
          <p className="rp-traj-kicker">Selected · {active.label}</p>
          <h3>
            Endpoint ·{" "}
            <span data-tone="ok">
              {formatDecisionMoney(scenarioEndEuro(active))}
            </span>
          </h3>
          <p className="rp-drec-quiet">
            {active.mainRiskDescription ?? active.note}
          </p>
        </aside>
      ) : null}
    </div>
  );
}

function polyFromYs(ys: number[], count: number): string {
  return ys.map((y, i) => {
    const x = 10 + (i / Math.max(1, count - 1)) * 80;
    return `${x},${y}`;
  }).join(" ");
}

function MetricTabs({
  metrics,
  metric,
  onMetric,
}: {
  metrics: Record<Metric, { label: string }>;
  metric: Metric;
  onMetric: (m: Metric) => void;
}) {
  return (
    <div className="rp-traj-layers" role="tablist" aria-label="Trajectory metric">
      {(Object.keys(metrics) as Metric[]).map((id) => (
        <button
          key={id}
          type="button"
          role="tab"
          data-active={metric === id ? "true" : undefined}
          onClick={() => onMetric(id)}
        >
          {metrics[id].label}
        </button>
      ))}
    </div>
  );
}

function TrajectorySvg({
  tracks,
  activeKey,
  focusKey,
  metricLabel,
  onHover,
  onPick,
}: {
  tracks: {
    key: PeakKey;
    points: string;
    ys: number[];
    recommended?: boolean;
  }[];
  activeKey: PeakKey;
  focusKey: PeakKey;
  metricLabel: string;
  onHover: (k: PeakKey | null) => void;
  onPick: (k: PeakKey) => void;
}) {
  return (
    <svg
      className="rp-traj-svg"
      viewBox="0 0 100 92"
      role="img"
      aria-label={`${metricLabel} trajectories`}
    >
      {HORIZONS.map((t, i) => {
        const x = 10 + (i / (HORIZONS.length - 1)) * 80;
        return (
          <g key={t}>
            <line x1={x} y1="12" x2={x} y2="82" className="rp-traj-grid" />
            <text x={x} y="90" textAnchor="middle" className="rp-traj-tick">
              {t}
            </text>
          </g>
        );
      })}
      {tracks.map((tr) => (
        <polyline
          key={tr.key}
          className="rp-traj-path"
          points={tr.points}
          data-rec={tr.recommended ? "true" : undefined}
          data-selected={activeKey === tr.key ? "true" : undefined}
          data-dim={focusKey && focusKey !== tr.key ? "true" : undefined}
          fill="none"
          onMouseEnter={() => onHover(tr.key)}
          onMouseLeave={() => onHover(null)}
          onClick={() => onPick(tr.key)}
        />
      ))}
      {tracks.map((tr) =>
        HORIZONS.map((h, i) => {
          const x = 10 + (i / (HORIZONS.length - 1)) * 80;
          const y = tr.ys[i] ?? 40;
          return (
            <circle
              key={`${tr.key}-${h}`}
              cx={x}
              cy={y}
              r={activeKey === tr.key ? 1.6 : 1.1}
              className="rp-traj-dot"
              data-selected={activeKey === tr.key ? "true" : undefined}
              data-rec={tr.recommended ? "true" : undefined}
              data-dim={focusKey && focusKey !== tr.key ? "true" : undefined}
            />
          );
        }),
      )}
    </svg>
  );
}

function MatrixTable({
  tracks,
  activeKey,
  onPick,
  onHover,
}: {
  tracks: {
    key: PeakKey;
    short: string;
    label: string;
    recommended?: boolean;
    cells: { h: Horizon; formatted: string }[];
  }[];
  activeKey: PeakKey;
  onPick: (k: PeakKey) => void;
  onHover: (k: PeakKey | null) => void;
}) {
  return (
    <table className="rp-traj-matrix-table" aria-label="Trajectory values">
      <thead>
        <tr>
          <th scope="col">Option</th>
          {HORIZONS.map((h) => (
            <th key={h} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tracks.map((tr) => (
          <tr
            key={tr.key}
            data-selected={activeKey === tr.key ? "true" : undefined}
            data-rec={tr.recommended ? "true" : undefined}
            onMouseEnter={() => onHover(tr.key)}
            onMouseLeave={() => onHover(null)}
          >
            <td className="rp-traj-opt-cell">
              <button
                type="button"
                className="rp-traj-opt-btn"
                data-selected={activeKey === tr.key ? "true" : undefined}
                onClick={() => onPick(tr.key)}
              >
                <span className="rp-traj-opt-label">{tr.label}</span>
                {tr.recommended ? (
                  <em className="rp-traj-opt-rec">RADR</em>
                ) : null}
              </button>
            </td>
            {tr.cells.map((c) => (
              <td key={c.h} data-horizon={c.h}>
                {c.formatted}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
