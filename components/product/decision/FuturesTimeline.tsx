"use client";

import { useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { FuturesBundle } from "@/lib/radr/decision/futures/types";
import type { ScenarioEconomicMetric } from "@/lib/radr/decision/counterfactual";

function forecastBand(n: number): "HIGH" | "MEDIUM" | "LOW" {
  if (n >= 80) return "HIGH";
  if (n >= 60) return "MEDIUM";
  return "LOW";
}

function metricLine(m: ScenarioEconomicMetric): string {
  if (m.value == null) return m.label;
  if (m.value === 0 && /baseline|no incremental/i.test(m.label)) {
    return m.label;
  }
  const money = formatDecisionMoney(m.value);
  const baseline =
    m.baseline &&
    !m.label.toLowerCase().includes(m.baseline.toLowerCase().replace(/^vs\s+/i, ""))
      ? ` · ${m.baseline}`
      : "";
  // Avoid "€X · Expected… · vs keep-mix" when label already embeds baseline wording
  if (m.label.toLowerCase().includes("vs ")) {
    return `${money} · ${m.label}`;
  }
  return `${money} · ${m.label}${baseline}`;
}

type Props = {
  futures: FuturesBundle;
  selectedId?: string;
  onSelect?: (id: string) => void;
};

/**
 * Signature Futures — one time axis, branching trajectories.
 */
export function FuturesTimeline({ futures, selectedId, onSelect }: Props) {
  const [local, setLocal] = useState(
    selectedId ?? futures.recommendedScenarioId,
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const activeId = hovered ?? selectedId ?? local;
  const active =
    futures.scenarios.find((s) => s.id === activeId) ??
    futures.scenarios.find((s) => s.recommended) ??
    futures.scenarios[0];

  const pick = (id: string) => {
    setLocal(id);
    onSelect?.(id);
  };

  const times = futures.temporal?.length
    ? futures.temporal
    : [
        { at: "NOW", label: "Now", detail: "" },
        { at: "NEAR", label: "Near", detail: "" },
        { at: "AFTER", label: "After", detail: "" },
      ];

  return (
    <div className="rp-futures">
      <div className="rp-futures-axis" aria-hidden="true">
        {times.map((t) => (
          <div key={t.at} className="rp-futures-tick">
            <span className="rp-futures-tick-at">{t.at}</span>
            <span className="rp-futures-tick-label">{t.label}</span>
          </div>
        ))}
      </div>

      <ul className="rp-futures-tracks" role="listbox" aria-label="Futures">
        {futures.scenarios.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              role="option"
              aria-selected={activeId === s.id}
              className="rp-futures-track radr-m-focus"
              data-recommended={s.recommended ? "true" : undefined}
              data-selected={activeId === s.id ? "true" : undefined}
              data-risk={s.operationalRisk}
              data-dim={
                activeId && activeId !== s.id ? "true" : undefined
              }
              style={{ ["--track-offset" as string]: `${i * 6}px` }}
              onClick={() => pick(s.id)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(s.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="rp-futures-track-line" aria-hidden="true" />
              <strong>{s.label}</strong>
              <span className="rp-futures-track-meta">
                {s.economicMetrics?.[0]
                  ? metricLine(s.economicMetrics[0])
                  : s.economicEffectNote
                    ? s.economicEffectNote
                    : s.expectedContributionDefined
                      ? `${formatDecisionMoney(s.expectedContribution)} expected economic effect`
                      : "Economic effect not yet modeled"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {active ? (
        <div className="rp-futures-detail">
          <p className="rp-futures-detail-kicker">Selected trajectory</p>
          <h3>{active.label}</h3>
          {active.economicMetrics?.length ? (
            <ul className="rp-futures-metrics">
              {active.economicMetrics.map((m) => (
                <li key={`${m.type}-${m.label}`}>
                  {m.value != null ? (
                    <strong>{formatDecisionMoney(m.value)}</strong>
                  ) : null}
                  <span>{m.label}</span>
                  {m.baseline &&
                  !m.label.toLowerCase().includes("vs ") &&
                  !m.label.toLowerCase().includes(
                    m.baseline.toLowerCase().replace(/^vs\s+/i, ""),
                  ) ? (
                    <em>{m.baseline}</em>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : active.economicEffectNote ? (
            <p className="rp-drec-quiet">{active.economicEffectNote}</p>
          ) : active.expectedContributionDefined ? (
            <p className="rp-drec-econ">
              <strong>
                {formatDecisionMoney(active.expectedContribution)}
              </strong>
              <span>expected economic effect</span>
            </p>
          ) : (
            <p className="rp-drec-quiet">Economic effect not yet modeled</p>
          )}
          <dl className="rp-futures-dims">
            <div>
              <dt>Service trade-off</dt>
              <dd>Guest impact · {active.expectedGuestImpact}</dd>
            </div>
            <div>
              <dt>Main risk</dt>
              <dd>
                {active.mainRiskDescription ??
                  active.note?.split("·")[0]?.trim() ??
                  "See trajectory note"}
              </dd>
            </div>
            <div>
              <dt>Risk level</dt>
              <dd>{active.riskLevel ?? active.operationalRisk}</dd>
            </div>
            <div>
              <dt>Forecast confidence</dt>
              <dd>{forecastBand(active.confidence)}</dd>
            </div>
          </dl>
          {active.note ? <p className="rp-drec-quiet">{active.note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
