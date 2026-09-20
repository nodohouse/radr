"use client";

/**
 * RADR Trajectory canvas — Futures as paths through time, not option lists.
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import type { FuturesBundle } from "@/lib/radr/decision/futures/types";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  getConnectedScenario,
  setPeakPath,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";

type Layer = "kitchen" | "ticket" | "turns" | "contribution";

const TIMES = ["18:42", "18:50", "19:00", "19:15", "19:30"] as const;

/** Illustrative path shapes — DEMO, keyed by scenario fragment. */
const PATH_Y: Record<string, number[]> = {
  seat: [28, 42, 58, 72, 78],
  refuse: [28, 34, 38, 40, 42],
  wait: [28, 30, 34, 38, 36],
  hard: [28, 34, 38, 40, 42],
};

function pathKey(id: string): string {
  if (id.includes("wait")) return "wait";
  if (id.includes("seat")) return "seat";
  if (id.includes("hard") || id.includes("refuse")) return "refuse";
  return "wait";
}

function poly(ys: number[]): string {
  return TIMES.map((t, i) => {
    const x = 8 + (i / (TIMES.length - 1)) * 84;
    return `${x},${ys[i] ?? 40}`;
  }).join(" ");
}

type Props = {
  futures: FuturesBundle;
  selectedId?: string;
  onSelect?: (id: string) => void;
  connectPeak?: boolean;
};

export function FuturesTrajectory({
  futures,
  selectedId,
  onSelect,
  connectPeak = false,
}: Props) {
  const connected = useSyncExternalStore(
    subscribeConnected,
    getConnectedScenario,
    getConnectedScenario,
  );
  void connected;

  const [local, setLocal] = useState(
    selectedId ?? futures.recommendedScenarioId,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [layer, setLayer] = useState<Layer>("contribution");
  const activeId = hovered ?? selectedId ?? local;
  const active =
    futures.scenarios.find((s) => s.id === activeId) ??
    futures.scenarios.find((s) => s.recommended) ??
    futures.scenarios[0];

  const tracks = useMemo(
    () =>
      futures.scenarios.map((s) => {
        const key = pathKey(s.id);
        const base = PATH_Y[key] ?? PATH_Y.wait!;
        // Layer nudges — DEMO visual only
        const nudge =
          layer === "kitchen"
            ? key === "seat"
              ? 8
              : key === "wait"
                ? -4
                : 0
            : layer === "ticket"
              ? key === "seat"
                ? 10
                : -2
              : layer === "turns"
                ? key === "seat"
                  ? 12
                  : key === "wait"
                    ? -6
                    : 2
                : 0;
        return {
          id: s.id,
          label: s.label,
          recommended: !!s.recommended,
          points: poly(base.map((y) => Math.min(82, Math.max(12, y + nudge)))),
          scenario: s,
        };
      }),
    [futures.scenarios, layer],
  );

  const pick = (id: string) => {
    setLocal(id);
    onSelect?.(id);
    if (connectPeak) {
      if (id.includes("wait")) setPeakPath("wait");
      else if (id.includes("seat")) setPeakPath("seat");
      else if (id.includes("hard") || id.includes("refuse"))
        setPeakPath("refuse");
    }
  };

  return (
    <div className="rp-traj">
      <div className="rp-traj-layers" role="tablist" aria-label="Trajectory layer">
        {(
          [
            ["contribution", "Contribution"],
            ["kitchen", "Kitchen load"],
            ["ticket", "Ticket time"],
            ["turns", "Second-turn risk"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-active={layer === id ? "true" : undefined}
            onClick={() => setLayer(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <svg className="rp-traj-svg" viewBox="0 0 100 90" role="img" aria-label="Futures trajectories">
        {TIMES.map((t, i) => {
          const x = 8 + (i / (TIMES.length - 1)) * 84;
          return (
            <g key={t}>
              <line
                x1={x}
                y1="8"
                x2={x}
                y2="84"
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
            key={tr.id}
            className="rp-traj-path"
            points={tr.points}
            data-rec={tr.recommended ? "true" : undefined}
            data-selected={activeId === tr.id ? "true" : undefined}
            data-dim={activeId && activeId !== tr.id ? "true" : undefined}
            fill="none"
            onMouseEnter={() => setHovered(tr.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => pick(tr.id)}
          />
        ))}
      </svg>

      <ul className="rp-traj-legend">
        {tracks.map((tr) => (
          <li key={tr.id}>
            <button
              type="button"
              data-selected={activeId === tr.id ? "true" : undefined}
              data-rec={tr.recommended ? "true" : undefined}
              onClick={() => pick(tr.id)}
              onMouseEnter={() => setHovered(tr.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <strong>{tr.label}</strong>
              <span>
                {tr.scenario.economicMetrics?.[0]?.value != null
                  ? formatDecisionMoney(tr.scenario.economicMetrics[0].value)
                  : tr.scenario.expectedContributionDefined
                    ? formatDecisionMoney(tr.scenario.expectedContribution)
                    : "—"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <aside className="rp-traj-inspect">
          <p className="rp-icanvas-kicker">Selected trajectory</p>
          <h3>{active.label}</h3>
          <p className="rp-drec-quiet">
            {active.mainRiskDescription ?? active.note}
          </p>
          {active.economicMetrics?.[0] ? (
            <p className="rp-traj-econ">
              <strong>
                {active.economicMetrics[0].value != null
                  ? formatDecisionMoney(active.economicMetrics[0].value)
                  : "—"}
              </strong>
              <span>{active.economicMetrics[0].label}</span>
            </p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
