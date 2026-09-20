"use client";

import { useId, useMemo, useState } from "react";
import { demoDataHealth } from "@/lib/platform/dataHealth";

type Props = {
  /** When healthy, render a quiet affordance instead of interrupting chrome. */
  quietWhenHealthy?: boolean;
};

/**
 * Subtle data-health chip near sync: never pretends stale is live.
 * Backed by Data Health report (demo provider today).
 */
export function DataHealthChip({ quietWhenHealthy = false }: Props) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const report = useMemo(() => demoDataHealth("loc_ber"), []);

  const health =
    report.overall === "HEALTHY" || report.overall === "CONNECTED"
      ? "GOOD"
      : report.overall === "STALE"
        ? "PARTIAL"
        : "STALE";

  const quiet = quietWhenHealthy && health === "GOOD" && !open;

  return (
    <div className="rp-data-health" data-quiet={quiet ? "true" : undefined}>
      <button
        type="button"
        className="rp-data-health-btn"
        data-health={health}
        data-quiet={quiet ? "true" : undefined}
        aria-expanded={open}
        aria-controls={open ? titleId : undefined}
        aria-label={
          health === "GOOD" ? "Data healthy" : `Data ${health.toLowerCase()}`
        }
        onClick={() => setOpen((v) => !v)}
      >
        <span className="rp-data-health-dot" aria-hidden="true" />
        {quiet ? null : (
          <em>
            {health === "GOOD" ? "Data healthy" : `Data ${health.toLowerCase()}`}
          </em>
        )}
      </button>
      {open ? (
        <div
          id={titleId}
          className="rp-data-health-panel"
          role="dialog"
          aria-label="Data source health"
        >
          <p className="rp-data-health-title">Source health</p>
          {report.userMessage ? (
            <p className="rp-attn-note">{report.userMessage}</p>
          ) : null}
          <ul>
            {report.sources.map((s) => (
              <li key={s.sourceKey} data-status={s.status.toLowerCase()}>
                <span>{s.label}</span>
                <em>
                  {s.status === "HEALTHY" ? `${s.ageMinutes}m` : s.status}
                </em>
              </li>
            ))}
          </ul>
          <p className="rp-data-health-foot">
            Confidence ×{report.confidenceMultiplier.toFixed(2)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
