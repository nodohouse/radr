"use client";

import Link from "next/link";
import { useState } from "react";
import {
  confidenceFactors,
  formatEuro,
  stateLabel,
  stateTone,
  type IntelFinding,
  type IntelFindingState,
  type IntelSaysContext,
} from "@/lib/radr/product/intelligenceEngine";

type Props = {
  finding: IntelFinding;
  state: IntelFindingState;
  says: IntelSaysContext;
  open?: boolean;
  onCompareDrivers: () => void;
};

export function IntelSaysRail({
  finding,
  state,
  says,
  open,
  onCompareDrivers,
}: Props) {
  const [confOpen, setConfOpen] = useState(false);
  const [recOpen, setRecOpen] = useState<string | null>(null);
  const factors = confidenceFactors(finding);

  return (
    <aside
      className="ie-says"
      data-open={open ? "true" : undefined}
      aria-label="RADR Says"
    >
      <div className="ie-says-head">
        <h3>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path
              d="M8 2l1.2 3.2L12.5 6.5 9.2 8.8 8 12 6.8 8.8 3.5 6.5l3.3-1.3L8 2z"
              fill="currentColor"
              opacity=".85"
            />
          </svg>
          RADR Says
        </h3>
        <button
          type="button"
          className="ie-conf-badge"
          data-level={finding.confidenceLabel}
          onClick={() => setConfOpen((v) => !v)}
          aria-expanded={confOpen}
        >
          {finding.confidenceLabel} CONFIDENCE
        </button>
      </div>

      <div className="ie-says-block">
        <p className="ie-says-k">What RADR sees</p>
        <p>{says.whatRadrSees}</p>
      </div>

      <div className="ie-says-block">
        <p className="ie-says-k">Why it matters</p>
        <p>{says.whyItMatters}</p>
      </div>

      <div className="ie-says-block">
        <p className="ie-says-k">Confidence</p>
        <p>
          {finding.confidenceLabel} · {finding.confidencePct}%
        </p>
        {confOpen ? (
          <div className="ie-ev-panel" style={{ marginTop: 8 }}>
            <h4>Why confidence = {finding.confidencePct}%</h4>
            <ul>
              <li>Data completeness: {factors.dataCompleteness}%</li>
              <li>Contract match: {factors.contractMatch}%</li>
              <li>Invoice normalization: {factors.invoiceNormalization}%</li>
              <li>Comparable records: {factors.comparableRecords}</li>
              <li>Data freshness: {factors.dataFreshness}</li>
              <li>Conflicting signals: {factors.conflictingSignals}</li>
            </ul>
            <p style={{ marginTop: 8 }}>{factors.explanation}</p>
          </div>
        ) : null}
      </div>

      <div className="ie-says-block">
        <div className="ie-says-row">
          <p className="ie-says-k">Decision</p>
          <span className="ie-state" data-tone={stateTone(state)}>
            {stateLabel(state)}
          </span>
        </div>
      </div>

      <div className="ie-says-block">
        <p className="ie-says-k">Evidence</p>
        <ul className="ie-sources">
          {finding.evidenceSources.map((s) => (
            <li key={s.system}>
              <span className="ie-src-ico" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="2"
                    y="2"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                  <path
                    d="M4.5 7h5M4.5 9.5h3"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>
                <strong>{s.system}</strong>
                <span>{s.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {says.recommendations.length ? (
        <div className="ie-says-block">
          <p className="ie-says-k">Recommended action</p>
          <ol className="ie-recs">
            {says.recommendations.map((r, i) => (
              <li key={r.id}>
                <i>{i + 1}</i>
                <button
                  type="button"
                  className="ie-rec-btn"
                  onClick={() => setRecOpen(recOpen === r.id ? null : r.id)}
                >
                  <strong>{r.title}</strong>
                  <span>
                    {formatEuro(r.valueLow)}–{formatEuro(r.valueHigh)} protected ·{" "}
                    {r.timeHorizon}
                  </span>
                </button>
                {recOpen === r.id ? (
                  <div className="ie-rec-detail">
                    <p>
                      <em>Why</em> {r.why}
                    </p>
                    <p>
                      <em>Trade-off</em> {r.tradeoff}
                    </p>
                    <p>
                      <em>Confidence</em> {r.confidence}%
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      <div className="ie-says-block">
        <p className="ie-says-k">Expected outcome</p>
        <div className="ie-outcome">
          <div className="ie-outcome-row">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M2 12V4M6 12V7M10 12V5M14 12V8"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <div>
              <strong>
                {formatEuro(says.expectedOutcome.valueLow)} –{" "}
                {formatEuro(says.expectedOutcome.valueHigh)}
              </strong>
              <span>{says.expectedOutcome.valueLabel}</span>
            </div>
          </div>
          {says.expectedOutcome.riskHigh > 0 ? (
            <div className="ie-outcome-row">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path
                  d="M8 2l5 2v4c0 3.2-2.1 5.4-5 6-2.9-.6-5-2.8-5-6V4l5-2z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
              </svg>
              <div>
                <strong>
                  {says.expectedOutcome.riskLow}–{says.expectedOutcome.riskHigh}%
                </strong>
                <span>RISK REDUCTION</span>
              </div>
            </div>
          ) : null}
          {says.expectedOutcome.contributionPp != null ? (
            <p className="ie-outcome-extra">
              Contribution +{says.expectedOutcome.contributionPp}pp
              {says.expectedOutcome.locations
                ? ` · ${says.expectedOutcome.locations} locations`
                : ""}
              {says.expectedOutcome.payback
                ? ` · payback ${says.expectedOutcome.payback}`
                : ""}
            </p>
          ) : null}
        </div>
      </div>

      {says.decisionId ? (
        <Link href={`/app/decisions/${says.decisionId}`} className="ie-cta">
          Review decision →
        </Link>
      ) : says.liveLink ? (
        <Link href="/app/live" className="ie-cta">
          View in Live →
        </Link>
      ) : (
        <Link href={says.controlCenterHref ?? "/app"} className="ie-cta">
          View in Control Center →
        </Link>
      )}

      <div className="ie-says-links">
        <button type="button" className="ie-cta-sec" onClick={onCompareDrivers}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M2 10V4M5.5 10V6M9 10V3M12.5 10V7"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          Compare drivers
        </button>
        {says.dataHealthLink ? (
          <Link href="/app/data-health" className="ie-cta-sec">
            View Data Health
          </Link>
        ) : null}
        {says.memoryLink ? (
          <Link href="/app/memory" className="ie-cta-sec">
            Open Memory
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
