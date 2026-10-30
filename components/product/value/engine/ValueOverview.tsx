"use client";

import Link from "next/link";
import { useState } from "react";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { ValueOverviewModel } from "@/lib/radr/product/valueProofEngine";
import { ValueTrendChart } from "./ValueTrendChart";

type Props = {
  model: ValueOverviewModel;
  selectedDriver: string | null;
  onSelectDriver: (id: string | null) => void;
  onTraceEuro: () => void;
  onOpenMethodology: () => void;
};

function DriverIcon({ id }: { id: string }) {
  if (id === "service-capacity") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M3 11V5M7 11V3M11 11V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "procurement") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2 3h2l1.2 6h6.3l1.2-4H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="11.5" r="0.9" fill="currentColor" />
        <circle cx="10.5" cy="11.5" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  if (id === "supplier-ap") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <rect x="3" y="2" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 5h4M5 7.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "social-mix") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="9.5" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 11c.4-1.6 1.6-2.4 2.5-2.4S7 9.4 7.4 11M8 11c.2-1 1-1.6 1.5-1.6s1.2.5 1.5 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function Spark({ values, tone }: { values: number[]; tone: string }) {
  const max = Math.max(...values, 1);
  const w = 56;
  const h = 22;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 2) + 1;
      const y = h - 2 - (v / max) * (h - 4);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  const stroke =
    tone === "blue"
      ? "#3a6ea5"
      : tone === "violet"
        ? "#6b4f8a"
        : tone === "amber"
          ? "#c4882a"
          : "#00a85a";
  return (
    <svg className="ve-spark" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ValueOverview({
  model,
  selectedDriver,
  onSelectDriver,
  onTraceEuro,
  onOpenMethodology,
}: Props) {
  const [insightOpen, setInsightOpen] = useState(true);
  const proof = model.proof;

  return (
    <div className="ve-overview">
      <div className="ve-hero">
        <section className="ve-hero-metric" aria-label="Verified value summary">
          <p className="ve-k">Verified value · MTD</p>
          <strong>{model.verifiedFormatted}</strong>
          <div className="ve-hero-meta">
            <span>{model.decisionCount} decisions</span>
            <span className="ve-delta">↗ {model.deltaFormatted}</span>
          </div>
          <button type="button" className="ve-trust" onClick={onOpenMethodology}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M4.2 7.1l1.8 1.8 3.8-3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All value is traceable and system-verified
          </button>
        </section>

        <section className="ve-hero-chart" aria-label="Verified value trend">
          <div className="ve-chart-head">
            <h2>Verified value over time</h2>
            <select defaultValue="cumulative" aria-label="Trend mode">
              <option value="cumulative">Cumulative</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <ValueTrendChart points={model.trend} currency={model.currency} />
        </section>
      </div>

      <p className="ve-drivers-k">Verified value by driver</p>
      <div className="ve-drivers">
        {model.drivers.map((d) => (
          <button
            key={d.id}
            type="button"
            className="ve-driver"
            aria-pressed={selectedDriver === d.id}
            data-active={selectedDriver === d.id ? "true" : undefined}
            onClick={() =>
              onSelectDriver(selectedDriver === d.id ? null : d.id)
            }
          >
            <span className="ve-driver-top">
              <span className="ve-driver-ico" data-tone={d.tone}>
                <DriverIcon id={d.id} />
              </span>
              <Spark values={d.spark} tone={d.tone} />
            </span>
            <span>{d.label}</span>
            <strong>{formatDecisionMoney(d.euro, model.currency)}</strong>
            <em>
              {d.decisionCount} decision{d.decisionCount === 1 ? "" : "s"}
            </em>
          </button>
        ))}
      </div>
      {model.hiddenDrivers.length ? (
        <p className="ve-hidden">
          Also verified ·{" "}
          {model.hiddenDrivers.map((d, i) => (
            <span key={d.id}>
              {i > 0 ? " · " : null}
              <strong>{d.label}</strong> {formatDecisionMoney(d.euro, model.currency)}
            </span>
          ))}
          {model.reconciles ? null : " · reconcile check pending"}
        </p>
      ) : null}

      <div className="ve-mid">
        {model.hasMiss ? <section className="ve-miss" aria-label="Honest miss">
          <div className="ve-miss-head">
            <h2 className="ve-miss-title">
              <span aria-hidden>●</span> Honest miss · Demo comparison
            </h2>
            <p className="ve-miss-trust">Expected ≠ Verified builds trust</p>
          </div>
          <h3>
            {model.miss.displayId} {model.miss.title}
          </h3>
          <p>{model.miss.reason}</p>
          <div className="ve-eov">
            <div>
              <span>Expected</span>
              <strong>{formatDecisionMoney(model.miss.expectedEuro, model.currency)}</strong>
            </div>
            <div>
              <span>Observed</span>
              <strong>{formatDecisionMoney(model.miss.observedEuro, model.currency)}</strong>
            </div>
            <div>
              <span>Verified</span>
              <strong data-miss="true">
                {formatDecisionMoney(model.miss.verifiedEuro, model.currency)}
              </strong>
            </div>
          </div>
          <div className="ve-miss-actions">
            <button type="button" className="ve-cta" onClick={onTraceEuro}>
              Trace this euro →
            </button>
            <Link
              href={`/app/decisions/${model.miss.decisionId}`}
              className="ve-link"
            >
              Open decision →
            </Link>
          </div>
        </section> : null}

        <section className="ve-proof" aria-label="Proof path">
          <div className="ve-proof-head">
            <div>
              <h2>
                Proof path · {proof?.displayId ?? "No verified record in this selection"}
              </h2>
              <p>Decision evidence and verified outcome</p>
            </div>
            {proof ? <span className="ve-badge">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2.5 6.2l2.2 2.2 4.8-4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verified
            </span> : null}
          </div>
          <ol className="ve-steps">
            {(proof?.chain ?? []).map((step) => (
              <li key={`${step.step}-${step.detail}`}>
                <span className="ve-step-dot" aria-hidden />
                <span className="ve-step-body">
                  <strong>{step.step}</strong>
                  <span>{step.detail}</span>
                  <em>{step.state}</em>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="ve-closed" aria-label="Closed decisions">
        <div className="ve-closed-head">
          <div>
            <h2>Capacity decisions that closed</h2>
            <p>Expected vs observed, with honest deltas for Memory.</p>
          </div>
          <Link href="/app/decisions" className="ve-link">
            View all decisions →
          </Link>
        </div>
        <ul className="ve-rows">
          {model.closed.map((row) => (
            <li key={row.decisionId} className="ve-row">
              <span className="ve-row-ico" aria-hidden>
                {row.decisionId === DECISION_IDS.labor ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M5 2v2M9 2v2M3 6h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M7 4.5v5M4.5 7h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <div className="ve-row-main">
                <strong>{row.displayId}</strong>
                <span>{row.classLabel}</span>
                <em>{row.title}</em>
              </div>
              <div className="ve-row-metric">
                <span>Expected</span>
                <strong>{formatDecisionMoney(row.expected, model.currency)}</strong>
              </div>
              <div className="ve-row-metric">
                <span>Observed</span>
                <strong>{formatDecisionMoney(row.observed, model.currency)}</strong>
              </div>
              <div className="ve-row-metric">
                <span>Verified</span>
                <strong data-verified="true">
                  {formatDecisionMoney(row.verified, model.currency)}
                </strong>
              </div>
              <p className="ve-row-note">{row.note}</p>
              <Link href={row.openHref} className="ve-link">
                Open {row.displayId} →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {insightOpen ? (
        <aside className="ve-insight" aria-label="RADR insight">
          <div className="ve-insight-copy">
            <h2>
              <span aria-hidden>✦</span> RADR insight
            </h2>
            <p>
              A single source of truth for value created. Every euro is
              traceable, system-verified, and tied to a Decision — what worked,
              what missed, and what to do next.
            </p>
          </div>
          <div className="ve-insight-actions">
            <button type="button" className="ve-cta" onClick={onOpenMethodology}>
              Learn more →
            </button>
            <button
              type="button"
              className="ve-insight-x"
              aria-label="Dismiss insight"
              onClick={() => setInsightOpen(false)}
            >
              ×
            </button>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
