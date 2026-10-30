"use client";

import type {
  MemoryLearningRow,
  MemoryOverviewModel,
  MemoryPeriod,
} from "@/lib/radr/product/memoryProofEngine";
import { MemoryCalChart } from "./MemoryCalChart";

type Props = {
  model: MemoryOverviewModel;
  period: MemoryPeriod;
  onPeriod: (p: MemoryPeriod) => void;
  onOpenEvidence: () => void;
  onViewLearnings: () => void;
  onViewDna: (dnaId?: string) => void;
  onViewPlaybooks: () => void;
  onSelectLearning: (id: string) => void;
  learningFilter: string;
  onLearningFilter: (f: string) => void;
};

const FILTERS = ["All", "Service", "Menu", "Guests", "Procurement", "Operations"] as const;

function DnaSpark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 48;
  const h = 18;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 2) + 1;
      const y = h - 2 - (v / max) * (h - 4);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  return (
    <svg className="me-dna-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke="#00a85a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DomainIcon({ tone }: { tone: MemoryLearningRow["domainTone"] }) {
  return <span className="me-learn-ico" data-tone={tone} aria-hidden />;
}

export function MemoryOverview({
  model,
  period,
  onPeriod,
  onOpenEvidence,
  onViewLearnings,
  onViewDna,
  onViewPlaybooks,
  onSelectLearning,
  learningFilter,
  onLearningFilter,
}: Props) {
  const wc = model.whatChanged;
  const impactPp =
    Math.round((wc.beforeError - wc.afterError) * 10) / 10;
  const filtered =
    learningFilter === "All"
      ? model.learnings
      : model.learnings.filter((l) => {
          const d = l.domain.toLowerCase();
          const f = learningFilter.toLowerCase();
          if (f === "service") return d.includes("capacity") || d.includes("labor") || d.includes("service");
          if (f === "operations") return d.includes("capacity") || d.includes("labor") || d.includes("operating");
          return d.includes(f);
        });

  return (
    <div className="me-overview">
      <section className="me-hero" aria-label="Calibration">
        <div className="me-hero-copy">
          <p className="me-k">Calibration · Friday peaks</p>
          <h2>RADR is getting better</h2>
          <p className="me-hero-metric" aria-label={`Forecast error ${model.startError}% to ${model.currentError}%`}>
            <span className="me-hero-from">{model.startError}%</span>
            <span className="me-hero-arrow" aria-hidden>
              →
            </span>
            <span className="me-hero-to">{model.currentError}%</span>
          </p>
          <p className="me-hero-sub" title={model.errorMetricTooltip}>
            Forecast error <span className="me-metric-tag">{model.errorMetricLabel}</span>
          </p>
          <div className="me-hero-meta">
            <span>{model.sampleSize} comparable services</span>
            <span>Playbook {model.playbookVersion}</span>
            <span className="me-conf">
              <i aria-hidden />
              High confidence
            </span>
          </div>
          <div className="me-hero-insight">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M3 11V7M6.5 11V4.5M10 11V6M13 11V3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p>
              <strong>{model.improvementPct}% improvement.</strong> Our predictions
              are converging with reality as more service data is learned.
            </p>
          </div>
        </div>

        <MemoryCalChart
          series={model.series}
          period={period}
          onPeriod={onPeriod}
          startError={model.startError}
          improvementPct={model.improvementPct}
          errorTooltip={model.errorMetricTooltip}
          uncertaintyTooltip={model.uncertaintyTooltip}
        />
      </section>

      <section className="me-changed" aria-labelledby="me-changed-h">
          <div className="me-sec-head">
          <h2 id="me-changed-h">What changed</h2>
          <button type="button" className="me-link" onClick={onViewPlaybooks}>
            Open playbook →
          </button>
        </div>

        <article className="me-changed-card">
          <div className="me-changed-main">
            <span className="me-changed-ico" aria-hidden>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 12V8M5.5 12V4M9 12V6.5M12.5 12V3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <div>
              <h3>{wc.title}</h3>
              <p>{wc.summary}</p>
              <p className="me-changed-applies">
                <span>Applies</span> {wc.applies}
              </p>
              <button type="button" className="me-link" onClick={onOpenEvidence}>
                Why · evidence · how it evolved →
              </button>
            </div>
          </div>

          <div className="me-changed-rail">
            <div className="me-ver" aria-label={`${wc.fromVersion} to ${wc.toVersion}`}>
              <span className="me-ver-chip">{wc.fromVersion}</span>
              <span className="me-ver-arrow" aria-hidden>
                →
              </span>
              <span className="me-ver-chip" data-live="true">
                {wc.toVersion}
              </span>
            </div>
            <div className="me-impact">
              <p className="me-k">Impact on forecast accuracy</p>
              <div className="me-impact-row">
                <span>Before ({wc.fromVersion})</span>
                <div className="me-impact-bar">
                  <i style={{ width: `${(wc.beforeError / 14.2) * 100}%` }} data-tone="muted" />
                </div>
                <strong>{wc.beforeError}%</strong>
              </div>
              <div className="me-impact-row">
                <span>After ({model.playbookVersion})</span>
                <div className="me-impact-bar">
                  <i style={{ width: `${(wc.afterError / 14.2) * 100}%` }} data-tone="green" />
                </div>
                <strong>{wc.afterError}%</strong>
              </div>
              <p className="me-impact-delta">↓ {impactPp}pp improvement</p>
            </div>
          </div>
        </article>
      </section>

      <div className="me-bottom">
        <section className="me-learnings" aria-labelledby="me-learn-h">
          <div className="me-sec-head">
            <h2 id="me-learn-h">Recent learnings</h2>
            <button type="button" className="me-link" onClick={onViewLearnings}>
              View all learnings →
            </button>
          </div>
          <div className="me-learn-filters" role="group" aria-label="Learning domains">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                data-active={learningFilter === f ? "true" : undefined}
                onClick={() => onLearningFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <ul className="me-learn-list">
            {filtered.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  className="me-learn-row"
                  onClick={() => onSelectLearning(row.id)}
                >
                  <DomainIcon tone={row.domainTone} />
                  <span className="me-learn-id">{row.displayId}</span>
                  <span className="me-learn-loc">{row.location}</span>
                  <span className="me-learn-text">{row.statement}</span>
                  <span className="me-learn-tag" data-tone={row.domainTone}>
                    {row.domain}
                  </span>
                  <span className="me-learn-conf" data-level={row.confidence}>
                    {row.confidence}
                  </span>
                  <span className="me-learn-when">{row.added}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <aside className="me-dna" aria-labelledby="me-dna-h">
          <div className="me-sec-head">
            <div>
              <h2 id="me-dna-h">Operating DNA</h2>
              <p className="me-dna-sub">
                Learned patterns that shape future decisions.
              </p>
            </div>
            <button type="button" className="me-link" onClick={() => onViewDna()}>
              View full DNA →
            </button>
          </div>
          <ul className="me-dna-list">
            {model.dna.slice(0, 4).map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="me-dna-row"
                  onClick={() => onViewDna(p.id)}
                >
                  <div className="me-dna-top">
                    <strong>{p.name}</strong>
                    <DnaSpark values={p.spark} />
                  </div>
                  <p>{p.statement}</p>
                  <div className="me-dna-meta">
                    <div className="me-dna-conf">
                      <span>{p.confidence}% confidence</span>
                      <div className="me-dna-bar">
                        <i style={{ width: `${p.confidence}%` }} />
                      </div>
                    </div>
                    <em>↑ {p.accuracyLift}% accuracy</em>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <aside className="me-insight" aria-label="RADR insight">
        <span className="me-insight-k">RADR insight</span>
        <p>
          <strong>Each service makes RADR more accurate.</strong> Forecast error is
          down from {model.startError}% to {model.currentError}% across{" "}
          {model.sampleSize} comparable Friday peaks — and location-specific
          constraints are embedding into Operating DNA.
        </p>
      </aside>
    </div>
  );
}
