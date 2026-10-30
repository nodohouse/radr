"use client";

import Link from "next/link";
import { VendorLogo } from "@/components/product/connections/VendorLogo";
import {
  confidenceBarTone,
  type EvidenceSource,
  type InspectorTab,
} from "@/lib/radr/product/dataHealthProofEngine";

type Props = {
  source: EvidenceSource;
  tab: InspectorTab;
  onTab: (t: InspectorTab) => void;
  onClose: () => void;
};

const TABS: { id: InspectorTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "impact", label: "Impact" },
  { id: "evidence", label: "Evidence" },
  { id: "history", label: "History" },
];

function domainSubtitle(domain: string): string {
  if (domain === "Accounting") return "Accounting · Financial data";
  if (domain === "Delivery") return "Delivery · Channel data";
  if (domain === "POS") return "POS · Transaction data";
  if (domain === "Reservations") return "Reservations · Guest data";
  if (domain === "Kitchen") return "Kitchen · Ticket data";
  return domain;
}

export function DataHealthInspector({ source, tab, onTab, onClose }: Props) {
  const tone = confidenceBarTone(source.evidenceConfidence);

  return (
    <aside
      className="dh-inspector"
      data-data-health-inspector="true"
      aria-label={`${source.name} evidence inspector`}
    >
      <div className="dh-insp-head">
        <div className="dh-insp-sys">
          <VendorLogo id={source.id} name={source.name} size={40} />
          <div>
            <h3>{source.name}</h3>
            <span>{domainSubtitle(source.domain)}</span>
            <div style={{ marginTop: 6 }}>
              <span
                className="dh-pill"
                data-status={source.status.toLowerCase()}
              >
                <i />
                {source.status}
              </span>
            </div>
          </div>
        </div>
        <button type="button" className="dh-link" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="dh-insp-tabs" role="tablist" aria-label="Inspector">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            data-active={tab === t.id ? "true" : undefined}
            aria-selected={tab === t.id}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          {source.status === "STALE" ? (
            <div className="dh-alert" data-tone="stale">
              Data is stale and affecting key Decisions. Last successful sync
              was {source.lastSync.replace(" ago", "")} ago. This is outside
              your {source.freshnessSla} freshness SLA.
            </div>
          ) : source.status === "DEGRADED" ? (
            <div className="dh-alert" data-tone="degraded">
              Data quality is reduced.{" "}
              {source.evidenceInUse ??
                "Evidence may be provisional for active Decisions."}
            </div>
          ) : null}

          <dl className="dh-insp-kpis">
            <div>
              <dt>Last sync</dt>
              <dd>
                {source.lastSync}
                {source.slaBreach ? <em>{source.slaBreach}</em> : null}
              </dd>
            </div>
            <div>
              <dt>Evidence confidence</dt>
              <dd>
                {source.evidenceConfidence}%
                <div className="dh-bar" data-tone={tone}>
                  <i style={{ width: `${source.evidenceConfidence}%` }} />
                </div>
              </dd>
            </div>
          </dl>

          {source.affectedDecisions.length > 0 ? (
            <section className="dh-insp-block">
              <h4>
                Decisions affected ({source.affectedDecisions.length})
              </h4>
              <ul className="dh-dec-list">
                {source.affectedDecisions.map((d) => (
                  <li key={d.id}>
                    <Link href={`/app/decisions/${d.id}`}>{d.label}</Link>
                    <span>{d.title}</span>
                    <em data-impact={d.impact.toLowerCase()}>
                      {d.impact} impact
                    </em>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {source.status !== "HEALTHY" ? (
            <div className="dh-reco">
              <strong>Recommended next step</strong>
              {source.recommendedAction}
            </div>
          ) : null}

          <div className="dh-insp-actions">
            <Link
              href={`/app/connections?system=${source.id}`}
              className="dh-btn-primary"
              data-dh-open-connection="true"
            >
              Open Connection
            </Link>
            {source.affectedDecisions[0] ? (
              <Link
                href={`/app/decisions/${source.affectedDecisions[0].id}`}
                className="dh-btn-secondary"
                data-dh-review-impact="true"
              >
                Review impact
              </Link>
            ) : null}
          </div>
        </>
      ) : null}

      {tab === "impact" ? (
        <section className="dh-insp-block" data-dh-tab="impact">
          <h4>Confidence &amp; verification impact</h4>
          <ul className="dh-dec-list">
            {source.affectedDecisions.length === 0 ? (
              <li>
                <span>No active Decision impact in current scope.</span>
              </li>
            ) : (
              source.affectedDecisions.map((d) => (
                <li key={d.id}>
                  <Link href={`/app/decisions/${d.id}`}>{d.label}</Link>
                  <span>
                    {d.confidenceBefore != null && d.confidenceAfter != null
                      ? `Confidence ${d.confidenceBefore}% → ${d.confidenceAfter}%`
                      : d.title}
                  </span>
                  <em data-impact={d.impact.toLowerCase()}>{d.impact}</em>
                </li>
              ))
            )}
          </ul>
          {source.id === "xero" ? (
            <p className="dh-cell-meta" style={{ marginTop: 10 }}>
              Value D-4102: observed €273 · verification pending refreshed
              accounting evidence.
            </p>
          ) : null}
        </section>
      ) : null}

      {tab === "evidence" ? (
        <section className="dh-insp-block" data-dh-tab="evidence">
          <h4>Datasets</h4>
          <ul className="dh-dec-list">
            {source.datasets.map((ds) => (
              <li key={ds}>
                <strong style={{ fontWeight: 700 }}>{ds}</strong>
                <span>
                  Completeness {source.completenessLabel.toLowerCase()} · last
                  sync {source.lastSync}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "history" ? (
        <section className="dh-insp-block" data-dh-tab="history">
          <h4>Recent events</h4>
          <ul className="dh-dec-list">
            <li>
              <strong style={{ fontWeight: 700 }}>20:10</strong>
              <span>Manual sync requested</span>
            </li>
            <li>
              <strong style={{ fontWeight: 700 }}>
                {source.status === "STALE" ? "14:10" : "19:55"}
              </strong>
              <span>
                {source.status === "STALE"
                  ? "Source became stale"
                  : source.status === "DEGRADED"
                    ? "Feed quality degraded"
                    : "Healthy sync"}
              </span>
            </li>
            <li>
              <strong style={{ fontWeight: 700 }}>12:10</strong>
              <span>Healthy sync · records processed</span>
            </li>
            {source.id === "xero" ? (
              <li>
                <strong style={{ fontWeight: 700 }}>3 Oct</strong>
                <span>
                  Previous incident — recovered after token refresh
                </span>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
