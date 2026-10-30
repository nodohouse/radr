"use client";

import { useState } from "react";
import type { ButlerResponse, ButlerVisualization } from "@/lib/radr/butler/types";
import { TextSep } from "@/components/TextSep";

function toneClass(tone?: string): string {
  if (tone === "positive" || tone === "signal") return "rp-ask-tone-pos";
  if (tone === "watch") return "rp-ask-tone-watch";
  if (tone === "risk") return "rp-ask-tone-risk";
  return "";
}

function AnswerHeadline({ children }: { children: React.ReactNode }) {
  return <p className="rp-ask-headline">{children}</p>;
}

function AnswerMetric({
  value,
  label,
  tone,
}: {
  value: string;
  label?: string;
  tone?: string;
}) {
  return (
    <div className={`rp-ask-metric-hero ${toneClass(tone)}`}>
      <strong>{value}</strong>
      {label ? <span>{label}</span> : null}
    </div>
  );
}

function EvidenceRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <li className={`rp-ask-evi-row ${toneClass(tone)}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </li>
  );
}

function Collapse({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rp-ask-collapse" data-open={open ? "true" : undefined}>
      <button
        type="button"
        className="rp-ask-collapse-trig"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide" : "Show"} {label}
        <em aria-hidden="true">{open ? "−" : "+"}</em>
      </button>
      {open ? <div className="rp-ask-collapse-body">{children}</div> : null}
    </div>
  );
}

function Viz({ viz }: { viz: ButlerVisualization }) {
  if (viz.type === "breakdown") {
    const max = Math.max(...viz.rows.map((r) => Math.abs(r.amount ?? 0)), 1);
    return (
      <ul className="rp-ask-evi-list" aria-label="Breakdown">
        {viz.rows.map((row) => (
          <li key={row.label} className={toneClass(row.tone)}>
            <div className="rp-ask-evi-row">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </div>
            <div className="rp-ask-viz-bar-track">
              <div
                className={`rp-ask-viz-bar ${toneClass(row.tone)}`}
                style={{ width: `${(Math.abs(row.amount ?? 0) / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {viz.totalValue ? (
          <li className="rp-ask-evi-total">
            <span>{viz.totalLabel ?? "Total"}</span>
            <strong>{viz.totalValue}</strong>
          </li>
        ) : null}
      </ul>
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
      <div className="rp-ask-viz-spark" aria-hidden="true">
        <svg viewBox="0 0 100 36" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            points={pts}
          />
        </svg>
      </div>
    );
  }

  if (viz.type === "metric") {
    return <AnswerMetric value={viz.value} label={viz.label} />;
  }

  return null;
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
  const hasDrivers = Boolean(response.drivers?.length);
  const hasMetrics = Boolean(response.metrics?.length);
  const hasViz = Boolean(response.visualization);
  const hasExplanation = Boolean(response.explanation);
  const longSecondary =
    hasExplanation ||
    (response.sources && response.sources.length > 2) ||
    (response.decisionPath && response.decisionPath.length > 0) ||
    (hasMetrics && (response.metrics?.length ?? 0) > 4);

  return (
    <article
      className={`rp-ask-answer${response.responseKind ? ` rp-ask-kind-${response.responseKind}` : ""}`}
    >
      <section className="rp-ask-sec" aria-label="Direct answer">
        <p className="rp-ask-sec-k">Direct answer</p>
        {response.verdict ? (
          <AnswerHeadline>{response.verdict}</AnswerHeadline>
        ) : response.title ? (
          <AnswerHeadline>{response.title}</AnswerHeadline>
        ) : null}
        {response.primaryMetric ? (
          <AnswerMetric
            value={response.primaryMetric.value}
            label={response.primaryMetric.label}
            tone={response.primaryMetric.tone}
          />
        ) : null}
        {response.summary ? (
          <p className="rp-ask-lead">{response.summary}</p>
        ) : null}
      </section>

      {(hasDrivers || hasMetrics || hasViz) && (
        <section className="rp-ask-sec" aria-label="Key evidence">
          <p className="rp-ask-sec-k">Key evidence</p>
          {hasDrivers ? (
            <ul className="rp-ask-evi-list">
              {response.drivers!.map((d) => (
                <EvidenceRow key={d.label} label={d.label} value={d.value} />
              ))}
            </ul>
          ) : null}
          {!hasDrivers && hasMetrics ? (
            <ul className="rp-ask-evi-list">
              {response.metrics!.slice(0, 5).map((m) => (
                <EvidenceRow
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  tone={m.tone}
                />
              ))}
            </ul>
          ) : null}
          {hasViz ? <Viz viz={response.visualization!} /> : null}
        </section>
      )}

      {(response.answer || hasExplanation) && (
        <section className="rp-ask-sec" aria-label="What it means">
          <p className="rp-ask-sec-k">What it means</p>
          <p className="rp-ask-means">
            {response.answer ?? response.explanation}
          </p>
        </section>
      )}

      {response.recommendation ? (
        <section className="rp-ask-sec" aria-label="Related decision">
          <p className="rp-ask-sec-k">Related decision</p>
          <button
            type="button"
            className="rp-ask-dec-ref"
            onClick={() => {
              if (response.recommendation?.href) {
                onNavigate(response.recommendation.href);
              }
            }}
          >
            <strong>{response.recommendation.title}</strong>
            {response.recommendation.detail ? (
              <span>{response.recommendation.detail}</span>
            ) : null}
            <em aria-hidden="true">→</em>
          </button>
        </section>
      ) : null}

      {response.pendingWrite && !confirmWrite ? (
        <section className="rp-ask-sec rp-ask-ready">
          <p className="rp-ask-sec-k">Prepared for approval</p>
          <p className="rp-ask-means">{response.pendingWrite.summary}</p>
          <ul className="rp-ask-evi-list">
            {response.pendingWrite.details.map((d) => (
              <EvidenceRow key={d.label} label={d.label} value={d.value} />
            ))}
          </ul>
          <div className="rp-ask-ready-actions">
            <button
              type="button"
              className="rp-ask-btn-primary"
              onClick={onConfirmWrite}
            >
              Prepare action
            </button>
            <button
              type="button"
              className="rp-ask-btn-ghost"
              onClick={onCancelWrite}
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {confirmWrite ? (
        <p className="rp-ask-confirmed">
          Action prepared for approval. No live write-back until supported.
        </p>
      ) : null}

      {response.actions.length > 0 ? (
        <section className="rp-ask-sec" aria-label="Next action">
          <p className="rp-ask-sec-k">Next action</p>
          <div className="rp-ask-next">
            {response.actions.slice(0, 3).map((a) => (
              <button
                key={a.href + a.label}
                type="button"
                className="rp-ask-next-btn"
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
        </section>
      ) : null}

      {longSecondary ? (
        <div className="rp-ask-secondary">
          {hasExplanation && response.answer ? (
            <Collapse label="calculation">
              <p className="rp-ask-means">{response.explanation}</p>
            </Collapse>
          ) : null}
          {response.sources && response.sources.length > 0 ? (
            <Collapse label="sources">
              <ul className="rp-ask-sources">
                {response.sources.map((s, i) => (
                  <li key={`${s.system}-${i}`}>
                    <strong>{s.system}</strong>
                    <span>{s.detail}</span>
                    {s.syncedLabel ? <em>{s.syncedLabel}</em> : null}
                  </li>
                ))}
              </ul>
            </Collapse>
          ) : null}
          {response.decisionPath && response.decisionPath.length > 0 ? (
            <Collapse label="decision path">
              <ol className="rp-ask-sources">
                {response.decisionPath.map((s, i) => (
                  <li key={`${s.step}-${i}`}>
                    <strong>{s.step}</strong>
                    <span>{s.detail}</span>
                  </li>
                ))}
              </ol>
            </Collapse>
          ) : null}
          {response.confidence ? (
            <p className="rp-ask-confidence">
              Answer confidence
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
        </div>
      ) : response.sources && response.sources.length > 0 ? (
        <p className="rp-ask-sources-line">
          Sources
          <TextSep />
          {response.sources
            .slice(0, 3)
            .map((s) => s.detail || s.system)
            .join(" · ")}
        </p>
      ) : null}

      {response.followUps && response.followUps.length > 0 ? (
        <div className="rp-ask-followups">
          <p className="rp-ask-sec-k">Ask next</p>
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
