"use client";

import type { ButlerResponse, ButlerVisualization } from "@/lib/radr/butler/types";
import { TextSep } from "@/components/TextSep";

function toneClass(tone?: string): string {
  if (tone === "positive" || tone === "signal") return "rp-ask-tone-pos";
  if (tone === "watch") return "rp-ask-tone-watch";
  if (tone === "risk") return "rp-ask-tone-risk";
  return "";
}

function Viz({ viz }: { viz: ButlerVisualization }) {
  if (viz.type === "breakdown") {
    const max = Math.max(...viz.rows.map((r) => r.amount ?? 0), 1);
    return (
      <div className="rp-ask-viz-breakdown">
        {viz.rows.map((row) => (
          <div key={row.label} className="rp-ask-viz-row">
            <div className="rp-ask-viz-row-meta">
              <span>{row.label}</span>
              <TextSep>: </TextSep>
              <strong className={toneClass(row.tone)}>{row.value}</strong>
            </div>
            <div className="rp-ask-viz-bar-track">
              <div
                className={`rp-ask-viz-bar ${toneClass(row.tone)}`}
                style={{ width: `${((row.amount ?? 0) / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {viz.totalValue ? (
          <div className="rp-ask-viz-total">
            <span>{viz.totalLabel ?? "Total"}</span>
            <TextSep>: </TextSep>
            <strong>{viz.totalValue}</strong>
          </div>
        ) : null}
      </div>
    );
  }

  if (viz.type === "comparison") {
    return (
      <div className="rp-ask-viz-compare">
        <table>
          <thead>
            <tr>
              <th>Location</th>
              {viz.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viz.rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <span className="rp-ask-loc-name">{row.name}</span>
                  {row.attention && row.attention !== "none" ? (
                    <span className={`rp-ask-dot rp-ask-dot-${row.attention}`} />
                  ) : null}
                </td>
                {row.cells.map((cell) => (
                  <td key={cell.key} className={toneClass(cell.tone)}>
                    {cell.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {viz.footnote ? <p className="rp-ask-viz-note">{viz.footnote}</p> : null}
      </div>
    );
  }

  if (viz.type === "heatmap") {
    return (
      <div className="rp-ask-viz-heat">
        <div
          className="rp-ask-heat-grid"
          style={{
            gridTemplateColumns: `minmax(6.5rem, 1.1fr) repeat(${viz.columns.length}, 1fr)`,
          }}
        >
          <span />
          {viz.columns.map((c) => (
            <span key={c} className="rp-ask-heat-col">
              {c}
            </span>
          ))}
          {viz.rows.map((row) => (
            <div key={row.label} className="rp-ask-heat-row">
              <span className="rp-ask-heat-label">{row.label}</span>
              {row.cells.map((cell, i) => (
                <span
                  key={`${row.label}-${i}`}
                  className={`rp-ask-heat-cell rp-ask-heat-${cell}`}
                />
              ))}
            </div>
          ))}
        </div>
        {viz.footnote ? <p className="rp-ask-viz-note">{viz.footnote}</p> : null}
      </div>
    );
  }

  if (viz.type === "reservationPulse") {
    return (
      <div className="rp-ask-viz-pulse">
        <div className="rp-ask-pulse-bars" aria-hidden="true">
          {viz.slots.map((s) => (
            <div key={s.time} className="rp-ask-pulse-col">
              <div
                className="rp-ask-pulse-bar"
                style={{ height: `${Math.max(10, s.intensity * 100)}%` }}
              />
              <span>{s.time.replace(":00", "")}</span>
            </div>
          ))}
        </div>
        <p className="rp-ask-viz-note">{viz.peakLabel}</p>
      </div>
    );
  }

  if (viz.type === "demandCapacity") {
    return (
      <div className="rp-ask-viz-demand">
        <div className="rp-ask-demand-times">
          {viz.times.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="rp-ask-demand-row">
          <span className="rp-ask-demand-label">Demand</span>
          <div className="rp-ask-demand-track">
            {viz.demand.map((v, i) => (
              <div
                key={`d-${i}`}
                className="rp-ask-demand-seg rp-ask-demand-fill"
                style={{ flex: Math.max(v, 0.08) }}
              />
            ))}
          </div>
        </div>
        <div className="rp-ask-demand-row">
          <span className="rp-ask-demand-label">Capacity</span>
          <div className="rp-ask-demand-track">
            {viz.capacity.map((v, i) => (
              <div
                key={`c-${i}`}
                className="rp-ask-demand-seg rp-ask-capacity-fill"
                style={{ flex: Math.max(v, 0.08) }}
              />
            ))}
          </div>
        </div>
        <p className="rp-ask-viz-note">
          Peak gap
          <TextSep />
          {viz.peakGap} cover-equivalent capacity
          {viz.gapLabel ? (
            <>
              <TextSep />
              {viz.gapLabel}
            </>
          ) : null}
        </p>
      </div>
    );
  }

  if (viz.type === "marginBridge") {
    return (
      <div className="rp-ask-viz-bridge">
        <div className="rp-ask-bridge-row">
          <span>Plan margin</span>
          <TextSep>: </TextSep>
          <strong>{viz.planPct.toFixed(1)}%</strong>
        </div>
        {viz.steps.map((s) => (
          <div key={s.label} className="rp-ask-bridge-row rp-ask-bridge-step">
            <span>{s.label}</span>
            <TextSep>: </TextSep>
            <strong className={s.pts < 0 ? "rp-ask-tone-risk" : "rp-ask-tone-pos"}>
              {s.pts >= 0 ? "+" : ""}
              {s.pts.toFixed(1)} pts
            </strong>
          </div>
        ))}
        <div className="rp-ask-bridge-row rp-ask-bridge-actual">
          <span>Actual</span>
          <TextSep>: </TextSep>
          <strong>{viz.actualPct.toFixed(1)}%</strong>
        </div>
      </div>
    );
  }

  if (viz.type === "sparkline") {
    const max = Math.max(...viz.points, 1);
    const pts = viz.points
      .map((p, i) => {
        const x = (i / Math.max(viz.points.length - 1, 1)) * 100;
        const y = 100 - (p / max) * 100;
        return `${x},${y}`;
      })
      .join(" ");
    return (
      <div className="rp-ask-viz-spark">
        <svg viewBox="0 0 100 36" preserveAspectRatio="none">
          <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts} />
        </svg>
      </div>
    );
  }

  if (viz.type === "table") {
    return (
      <div className="rp-ask-viz-compare">
        <table>
          <thead>
            <tr>
              {viz.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {viz.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rp-ask-hero-metric">
      <strong>{viz.value}</strong>
      <TextSep srOnly>: </TextSep>
      <span>{viz.label}</span>
    </div>
  );
}

type Props = {
  response: ButlerResponse;
  onFollowUp: (q: string) => void;
  onNavigate: (href: string) => void;
  confirmWrite: boolean;
  onConfirmWrite: () => void;
  onCancelWrite: () => void;
};

export function AskAnswer({
  response,
  onFollowUp,
  onNavigate,
  confirmWrite,
  onConfirmWrite,
  onCancelWrite,
}: Props) {
  const ranked =
    response.metrics &&
    response.metrics.length > 0 &&
    response.metrics.every((m) => m.hint);

  return (
    <article
      className={`rp-ask-answer${response.responseKind ? ` rp-ask-kind-${response.responseKind}` : ""}`}
    >
      <header className="rp-ask-answer-head">
        {response.verdict ? (
          <p className="rp-ask-verdict">{response.verdict}</p>
        ) : null}
        <p className="rp-ask-label">{response.title}</p>
        {response.primaryMetric ? (
          <div className={`rp-ask-hero-metric ${toneClass(response.primaryMetric.tone)}`}>
            <strong>{response.primaryMetric.value}</strong>
            <TextSep srOnly>: </TextSep>
            <span>{response.primaryMetric.label}</span>
            {response.primaryMetric.hint ? (
              <>
                <TextSep />
                <em>{response.primaryMetric.hint}</em>
              </>
            ) : null}
          </div>
        ) : null}
        <p className="rp-ask-summary">{response.summary}</p>
      </header>

      {ranked ? (
        <ol className="rp-ask-rank">
          {response.metrics!.map((m, i) => (
            <li key={m.label}>
              <button
                type="button"
                onClick={() => {
                  const href = response.actions[0]?.href;
                  if (href) onNavigate(href);
                }}
              >
                <em>{String(i + 1).padStart(2, "0")}</em>
                <TextSep srOnly />
                <span className="rp-ask-rank-body">
                  <strong>{m.hint}</strong>
                  <TextSep srOnly>: </TextSep>
                  <span>{m.label}</span>
                </span>
                <TextSep srOnly />
                <span className={`rp-ask-rank-money ${toneClass(m.tone)}`}>{m.value}</span>
                <i aria-hidden="true">→</i>
              </button>
            </li>
          ))}
        </ol>
      ) : response.metrics && response.metrics.length > 0 ? (
        <div className="rp-ask-metric-grid">
          {response.metrics.map((m) => (
            <div key={m.label} className={`rp-ask-metric-card ${toneClass(m.tone)}`}>
              <strong>{m.value}</strong>
              <TextSep srOnly>: </TextSep>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      {response.visualization ? <Viz viz={response.visualization} /> : null}

      {response.explanation ? (
        <p className="rp-ask-explain">{response.explanation}</p>
      ) : null}

      {response.drivers && response.drivers.length > 0 ? (
        <ul className="rp-ask-drivers">
          {response.drivers.map((d) => (
            <li key={d.label}>
              <span>{d.label}</span>
              <TextSep>: </TextSep>
              <strong>{d.value}</strong>
            </li>
          ))}
        </ul>
      ) : null}

      {response.confidence ? (
        <p className="rp-ask-confidence">
          Confidence
          <TextSep />
          {response.confidence.band}
          {response.confidence.score != null ? (
            <>
              <TextSep />
              {response.confidence.score}%
            </>
          ) : null}
        </p>
      ) : null}

      {response.recommendation ? (
        <section className="rp-ask-rec">
          <p className="rp-ask-label">Recommended</p>
          <p className="rp-ask-rec-title">{response.recommendation.title}</p>
          {response.recommendation.detail ? (
            <p className="rp-ask-rec-detail">{response.recommendation.detail}</p>
          ) : null}
          <div className="rp-ask-rec-money">
            {response.recommendation.costValue ? (
              <div>
                <span>{response.recommendation.costLabel ?? "Cost"}</span>
                <TextSep srOnly>: </TextSep>
                <strong>{response.recommendation.costValue}</strong>
              </div>
            ) : null}
            {response.recommendation.protectValue ? (
              <div>
                <span>{response.recommendation.protectLabel ?? "Protected"}</span>
                <TextSep srOnly>: </TextSep>
                <strong className="rp-ask-tone-pos">
                  {response.recommendation.protectValue}
                </strong>
              </div>
            ) : null}
          </div>
          {response.recommendation.href ? (
            <button
              type="button"
              className="rp-ask-btn-primary"
              onClick={() => onNavigate(response.recommendation!.href!)}
            >
              Review action
            </button>
          ) : null}
        </section>
      ) : null}

      {response.pendingWrite && !confirmWrite ? (
        <section className="rp-ask-ready">
          <p className="rp-ask-label">Prepared for approval</p>
          <p className="rp-ask-rec-title">{response.pendingWrite.summary}</p>
          <ul>
            {response.pendingWrite.details.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <TextSep>: </TextSep>
                <strong>{d.value}</strong>
              </li>
            ))}
          </ul>
          <div className="rp-ask-ready-actions">
            <button type="button" className="rp-ask-btn-primary" onClick={onConfirmWrite}>
              Prepare action
            </button>
            <button type="button" className="rp-ask-btn-ghost" onClick={onCancelWrite}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {confirmWrite ? (
        <p className="rp-ask-confirmed">
          Action prepared for approval. No live schedule or messaging change
          until execution is supported and approved.
        </p>
      ) : null}

      {response.sources && response.sources.length > 0 ? (
        <p className="rp-ask-sources-line">
          Sources
          <TextSep />
          {response.sources.map((s, i) => (
            <span key={`${s.system}-${i}`}>
              {i > 0 ? <TextSep /> : null}
              {s.detail || s.system}
            </span>
          ))}
        </p>
      ) : null}

      {response.actions.length > 0 ? (
        <div className="rp-ask-links">
          {response.actions.slice(0, 3).map((a) => (
            <button
              key={a.href + a.label}
              type="button"
              className="rp-ask-link"
              onClick={() => {
                if (a.href.startsWith("#ask:")) {
                  onFollowUp(decodeURIComponent(a.href.slice(5)));
                  return;
                }
                onNavigate(a.href);
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      ) : null}

      {response.followUps && response.followUps.length > 0 ? (
        <div className="rp-ask-followups">
          <p className="rp-ask-label">Ask next</p>
          <ul className="rp-ask-suggest-list">
            {response.followUps.map((f) => (
              <li key={f}>
                <button type="button" onClick={() => onFollowUp(f)}>
                  <span>{f}</span>
                  <em>→</em>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
