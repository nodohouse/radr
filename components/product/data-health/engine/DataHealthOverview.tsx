"use client";

import Link from "next/link";
import { VendorLogo } from "@/components/product/connections/VendorLogo";
import {
  confidenceBarTone,
  type CompletenessLabel,
  type DataHealthOverviewModel,
  type DataHealthStatusFilter,
  type EvidenceSource,
  type FreshnessLabel,
  type InspectorTab,
} from "@/lib/radr/product/dataHealthProofEngine";
import { DataHealthInspector } from "./DataHealthInspector";

type Props = {
  model: DataHealthOverviewModel;
  sources: EvidenceSource[];
  selectedId: string | null;
  statusFilter: DataHealthStatusFilter;
  search: string;
  tab: InspectorTab;
  onSelect: (id: string | null) => void;
  onStatusFilter: (f: DataHealthStatusFilter) => void;
  onSearch: (q: string) => void;
  onTab: (t: InspectorTab) => void;
  onOpenTrust: () => void;
};

function Dots({
  level,
}: {
  level: FreshnessLabel | CompletenessLabel;
}) {
  const n =
    level === "HIGH" ? 3 : level === "MEDIUM" || level === "PARTIAL" ? 2 : 1;
  const tone =
    level === "HIGH"
      ? "high"
      : level === "MEDIUM"
        ? "medium"
        : level === "PARTIAL"
          ? "partial"
          : "low";
  return (
    <span className="dh-dots" data-tone={tone} aria-hidden>
      {[0, 1, 2].map((i) => (
        <i key={i} data-on={i < n ? "true" : undefined} />
      ))}
      <em>{level}</em>
    </span>
  );
}

function SumIcon({ tone }: { tone: "ok" | "watch" | "alert" | "dec" }) {
  return (
    <span className="dh-sum-ico" data-tone={tone} aria-hidden>
      {tone === "ok" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : tone === "watch" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : tone === "alert" ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5m0 3h.01" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="6" cy="12" r="2.5" />
          <circle cx="18" cy="7" r="2.5" />
          <circle cx="18" cy="17" r="2.5" />
          <path d="M8.2 11.2 15.5 8.2M8.2 12.8l7.3 3" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

export function DataHealthOverview({
  model,
  sources,
  selectedId,
  statusFilter,
  search,
  tab,
  onSelect,
  onStatusFilter,
  onSearch,
  onTab,
  onOpenTrust,
}: Props) {
  const selected =
    model.sources.find((s) => s.id === selectedId) ?? null;

  const cards: {
    key: DataHealthStatusFilter;
    label: string;
    value: number;
    meta: string;
    icon: "ok" | "watch" | "alert" | "dec";
  }[] = [
    {
      key: "healthy",
      label: "Healthy",
      value: model.healthyCount,
      meta: `of ${model.sourceTotal} sources`,
      icon: "ok",
    },
    {
      key: "degraded",
      label: "Degraded",
      value: model.degradedCount,
      meta: `of ${model.sourceTotal} sources`,
      icon: "watch",
    },
    {
      key: "stale",
      label: "Stale",
      value: model.staleCount,
      meta: `of ${model.sourceTotal} sources`,
      icon: "alert",
    },
    {
      key: "decisions",
      label: "Decisions affected",
      value: model.decisionsAffected,
      meta: `across ${model.sourcesAffectingDecisions} sources`,
      icon: "dec",
    },
  ];

  return (
    <>
      <header className="dh-page-head">
        <p className="dh-k">Data Health</p>
        <h1>Can RADR trust the evidence?</h1>
        <p>
          Freshness · completeness · conflicts · evidence in use ·{" "}
          {model.attentionCount} sources need attention
        </p>
      </header>

      <div className="dh-summary" aria-label="Evidence trust summary">
        {cards.map((c) => (
          <button
            key={c.key}
            type="button"
            data-active={statusFilter === c.key ? "true" : undefined}
            data-dh-summary={c.key}
            onClick={() =>
              onStatusFilter(statusFilter === c.key ? "all" : c.key)
            }
          >
            <SumIcon tone={c.icon} />
            <div>
              <strong>{c.value}</strong>
              <span>{c.label}</span>
              <em>{c.meta}</em>
            </div>
          </button>
        ))}
      </div>

      <div className="dh-body">
        <div className="dh-main">
          <section className="dh-table-card" aria-label="Evidence sources">
            <div className="dh-table-toolbar">
              <h2>Evidence Sources ({model.sourceTotal})</h2>
              <div className="dh-table-tools">
                <input
                  className="dh-search"
                  type="search"
                  placeholder="Search sources..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  aria-label="Search sources"
                />
                <select
                  className="dh-filter"
                  value={statusFilter}
                  onChange={(e) =>
                    onStatusFilter(e.target.value as DataHealthStatusFilter)
                  }
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="degraded">Degraded</option>
                  <option value="stale">Stale</option>
                  <option value="decisions">In use by Decisions</option>
                </select>
              </div>
            </div>

            <div className="dh-table-wrap">
              <table className="dh-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Freshness</th>
                    <th>Completeness</th>
                    <th>Conflicts</th>
                    <th>Evidence in use</th>
                    <th>Coverage</th>
                    <th aria-label="Open" />
                  </tr>
                </thead>
                <tbody>
                  {sources.length === 0 ? (
                    <tr>
                      <td colSpan={8}>
                        <p className="dh-empty">No sources match this filter.</p>
                      </td>
                    </tr>
                  ) : (
                    sources.map((s) => (
                      <tr
                        key={s.id}
                        data-status={s.status.toLowerCase()}
                        data-active={selectedId === s.id ? "true" : undefined}
                        data-source-row={s.id}
                        onClick={() => onSelect(s.id)}
                      >
                        <td>
                          <div className="dh-src">
                            <VendorLogo id={s.id} name={s.name} size={40} />
                            <div>
                              <strong>{s.name}</strong>
                              <span>{s.domain}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="dh-pill"
                            data-status={s.status.toLowerCase()}
                          >
                            <i />
                            {s.status}
                          </span>
                        </td>
                        <td>
                          <Dots level={s.freshnessLabel} />
                          <span className="dh-cell-meta">
                            Last sync {s.lastSync}
                            {s.slaBreach ? ` · Expected SLA: ${s.freshnessSla}` : ""}
                          </span>
                        </td>
                        <td>
                          <Dots level={s.completenessLabel} />
                          <span className="dh-cell-meta">
                            {s.datasets.join(" · ")}
                          </span>
                        </td>
                        <td>
                          {s.conflict ? (
                            <span
                              className="dh-conflict"
                              data-tone={
                                s.status === "STALE" ? "bad" : "watch"
                              }
                            >
                              <i />
                              {s.conflict}
                            </span>
                          ) : (
                            <span className="dh-cell-meta">None</span>
                          )}
                        </td>
                        <td>
                          {s.evidenceInUse ? (
                            <div className="dh-evidence">
                              <span>{s.evidenceInUse}</span>
                              <span className="dh-evidence-deps">
                                {s.evidenceTags.map((tag) => {
                                  const dec = s.affectedDecisions.find(
                                    (d) => d.label === tag,
                                  );
                                  return (
                                    <Link
                                      key={tag}
                                      href={
                                        dec
                                          ? `/app/decisions/${dec.id}`
                                          : `/app/data-health?decision=${tag}`
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {tag}
                                    </Link>
                                  );
                                })}
                              </span>
                            </div>
                          ) : (
                            <span className="dh-cell-meta">None in scope</span>
                          )}
                        </td>
                        <td>
                          <span>{s.coverageLabel}</span>
                        </td>
                        <td>
                          <span className="dh-chevron" aria-hidden>
                            ›
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="dh-bottom">
            <section
              className="dh-panel"
              aria-label="Evidence confidence by source"
            >
              <h2>Evidence confidence by source</h2>
              <ul className="dh-conf-list">
                {model.sources.map((s) => (
                  <li key={s.id}>
                    <strong>{s.name}</strong>
                    <div
                      className="dh-bar"
                      data-tone={confidenceBarTone(s.evidenceConfidence)}
                    >
                      <i style={{ width: `${s.evidenceConfidence}%` }} />
                    </div>
                    <em>{s.evidenceConfidence}%</em>
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="dh-panel"
              aria-label="Decision dependency map"
              data-dependency-map="true"
            >
              <h2>Decision dependency map</h2>
              <div className="dh-dep-map">
                <div className="dh-dep-col">
                  {model.sources.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      data-active={selectedId === s.id ? "true" : undefined}
                      data-lit={
                        selectedId &&
                        model.dependencyDomains.some(
                          (d) =>
                            d.sourceIds.includes(selectedId) &&
                            d.sourceIds.includes(s.id),
                        )
                          ? "true"
                          : undefined
                      }
                      onClick={() => onSelect(s.id)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <span className="dh-dep-arrow" aria-hidden>
                  →
                </span>
                <div className="dh-dep-hub">
                  RADR
                  <br />
                  Decisions &amp; Insights
                </div>
                <span className="dh-dep-arrow" aria-hidden>
                  →
                </span>
                <div className="dh-dep-col">
                  {model.dependencyDomains.map((d) => (
                    <div
                      key={d.id}
                      className="dh-dep-out"
                      data-lit={
                        selectedId && d.sourceIds.includes(selectedId)
                          ? "true"
                          : undefined
                      }
                    >
                      {d.label}
                      <em>
                        {d.decisionCount} Decision
                        {d.decisionCount === 1 ? "" : "s"}
                      </em>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <aside className="dh-rail">
          <button
            type="button"
            className="dh-trust"
            data-trust-score="true"
            onClick={onOpenTrust}
            title={model.trustTooltip}
            aria-label="How RADR calculates evidence trust"
          >
            <div className="dh-trust-art" aria-hidden>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3 4.5 6.5v5c0 4.5 3.2 8.4 7.5 9.5 4.3-1.1 7.5-5 7.5-9.5v-5L12 3Z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="dh-k">Trust score</p>
            <div className="dh-trust-score">
              <strong>{model.trustScore}%</strong>
              <span className="dh-trust-delta">+{model.trustDeltaPct}%</span>
            </div>
            <p>Based on freshness, completeness and conflicts.</p>
            <div className="dh-trust-msg">
              <strong>Trusted data. Stronger Decisions.</strong>
              High-quality data powers every insight, forecast, and
              recommendation in RADR.
            </div>
          </button>

          {selected ? (
            <DataHealthInspector
              source={selected}
              tab={tab}
              onTab={onTab}
              onClose={() => onSelect(null)}
            />
          ) : (
            <div className="dh-inspector">
              <p className="dh-empty" style={{ padding: 12 }}>
                Select a source to inspect evidence trust, Decision impact, and
                next steps.
              </p>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
