"use client";

/**
 * Operating Field — signature Control Center intelligence canvas.
 * One visual: trajectory · NOW · Decision markers · driver annotations.
 */

import { MetricDelta } from "@/components/product/ui/MetricDelta";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { CONNECTED_PILOT_MTD } from "@/lib/radr/product/demoOperatingPulse";
import type { ContributionBridge } from "@/lib/radr/finance/contributionBridge";

type FieldPoint = {
  label: string;
  revenue: number;
  revenuePlan: number;
  contribution: number;
  contributionPlan: number;
  observed: boolean;
  now?: boolean;
};

/** Deterministic MTD operating path — no invention beyond fixture endpoints. */
function buildFieldSeries(): FieldPoint[] {
  const rev = CONNECTED_PILOT_MTD.revenue;
  const contrib = CONNECTED_PILOT_MTD.contribution;
  // Progress through month: weeks 1–3 observed, W4 = NOW, close = forecast
  const weeks = [
    { label: "W1", t: 0.22, observed: true },
    { label: "W2", t: 0.45, observed: true },
    { label: "W3", t: 0.68, observed: true },
    { label: "NOW", t: 0.82, observed: true, now: true },
    { label: "Close", t: 1, observed: false },
  ] as const;

  return weeks.map((w) => {
    const ahead = 1 + (rev.actual / rev.forecast - 1) * (w.t / 0.82);
    const cBehind = 1 + (contrib.actual / contrib.plan - 1) * (w.t / 0.82);
    return {
      label: w.label,
      revenue: Math.round(rev.forecast * w.t * ahead),
      revenuePlan: Math.round(rev.forecast * w.t),
      contribution: Math.round(contrib.plan * w.t * cBehind),
      contributionPlan: Math.round(contrib.plan * w.t),
      observed: w.observed,
      now: "now" in w && w.now,
    };
  });
}

type Props = {
  bridge: ContributionBridge;
  decisionMarker?: { id: string; label: string; at: "NOW" | "W3" };
  /** Hide duplicate readout when parent owns the ticker */
  compact?: boolean;
};

export function OperatingField({ bridge, decisionMarker, compact }: Props) {
  const series = buildFieldSeries();
  const f = CONNECTED_PILOT_MTD;
  const revDeltaPct =
    Math.round(((f.revenue.actual - f.revenue.forecast) / f.revenue.forecast) * 1000) / 10;
  const contribDelta = f.contribution.actual - f.contribution.plan;

  const W = 720;
  const H = 220;
  const padL = 36;
  const padR = 48;
  const padT = 28;
  const padB = 36;

  const maxY = Math.max(
    ...series.flatMap((s) => [s.revenue, s.revenuePlan]),
    1,
  );
  const xAt = (i: number) =>
    padL + (i / Math.max(series.length - 1, 1)) * (W - padL - padR);
  const yAt = (v: number) =>
    H - padB - (v / maxY) * (H - padT - padB);

  const nowIdx = series.findIndex((s) => s.now) || 3;
  const actualPts = series
    .filter((s) => s.observed)
    .map((s, i) => `${xAt(i)},${yAt(s.revenue)}`);
  const planPts = series.map((s, i) => `${xAt(i)},${yAt(s.revenuePlan)}`).join(" ");
  const forecastPts = series
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => i >= nowIdx)
    .map(({ s, i }) => `${xAt(i)},${yAt(i === nowIdx ? s.revenue : s.revenuePlan * 1.03)}`);

  const nowX = xAt(nowIdx);
  const nowY = yAt(series[nowIdx]!.revenue);

  const negDrivers = bridge.segments.filter((s) => s.kind === "negative").slice(0, 2);

  return (
    <div className="rp-op-field" aria-label="Operating field">
      <svg
        className="rp-op-field-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Revenue trajectory through month with Decision marker"
      >
        <polyline
          points={planPts}
          fill="none"
          className="rp-op-field-plan"
        />
        <polyline
          points={forecastPts.join(" ")}
          fill="none"
          className="rp-op-field-forecast"
        />
        <polyline
          points={actualPts.join(" ")}
          fill="none"
          className="rp-op-field-actual"
        />
        <line
          x1={nowX}
          y1={padT - 4}
          x2={nowX}
          y2={H - padB + 6}
          className="rp-op-field-now-line"
        />
        <circle cx={nowX} cy={nowY} r={6} className="rp-op-field-now-dot" />
        <text
          x={nowX}
          y={padT - 10}
          textAnchor="middle"
          className="rp-op-field-now-lbl"
        >
          NOW
        </text>
        {decisionMarker ? (
          <g className="rp-op-field-marker">
            <circle
              cx={nowX}
              cy={nowY - 22}
              r={3.5}
              className="rp-op-field-dec-dot"
            />
            <text
              x={nowX + 8}
              y={nowY - 18}
              className="rp-op-field-dec-lbl"
            >
              {decisionMarker.label}
            </text>
          </g>
        ) : null}
        <text
          x={xAt(series.length - 1)}
          y={yAt(series[series.length - 1]!.revenuePlan * 1.03) - 8}
          textAnchor="end"
          className="rp-op-field-end-lbl"
        >
          CLOSE
        </text>
        {series.map((s, i) => (
          <text
            key={s.label}
            x={xAt(i)}
            y={H - 10}
            textAnchor="middle"
            className="rp-op-field-tick"
          >
            {s.label}
          </text>
        ))}
      </svg>

      {!compact ? (
        <div className="rp-op-field-readout">
          <div className="rp-op-field-metric">
            <span className="rp-op-field-metric-k">Revenue</span>
            <MetricDelta
              value={`${revDeltaPct >= 0 ? "+" : ""}${revDeltaPct}%`}
              deltaSigned={revDeltaPct}
              higherIsBetter
              size="primary"
            />
          </div>
          <div className="rp-op-field-metric">
            <span className="rp-op-field-metric-k">Contribution</span>
            <MetricDelta
              value={`${contribDelta < 0 ? "−" : "+"}${formatDecisionMoney(Math.abs(contribDelta))}`}
              deltaSigned={contribDelta}
              higherIsBetter
              size="primary"
            />
          </div>
          {negDrivers.length > 0 ? (
            <div className="rp-op-field-drivers" aria-label="Material drivers">
              {negDrivers.map((d) => (
                <span key={d.id} data-semantic="negative">
                  {d.label.replace(/ contribution| fees| volume/gi, "").trim()}
                  {" "}
                  {d.amount < 0 ? "−" : "+"}
                  {formatDecisionMoney(Math.abs(d.amount)).replace("€", "")}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : negDrivers.length > 0 ? (
        <div className="rp-op-field-drivers" data-compact="true" aria-label="Material drivers">
          {negDrivers.map((d) => (
            <span key={d.id} data-semantic="negative">
              {d.label.replace(/ contribution| fees| volume/gi, "").trim()}
              {" "}
              {d.amount < 0 ? "−" : "+"}
              {formatDecisionMoney(Math.abs(d.amount)).replace("€", "")}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
