"use client";

import {
  EVIDENCE_KIND_LABEL,
  type EvidenceRow,
} from "@/lib/radr/evidence";
import { TextSep } from "@/components/TextSep";

type Props = {
  title?: string;
  confidence?: string;
  confidenceReason?: string;
  rows: EvidenceRow[];
  freshness?: { label: string; lastSyncLabel: string }[];
};

/**
 * Why RADR believes this - inspectable claim support.
 * Evidence classes stay behind progressive disclosure.
 */
export function EvidenceBlock({
  title = "What RADR saw",
  confidence,
  confidenceReason,
  rows,
  freshness,
}: Props) {
  return (
    <section className="rp-evidence" aria-label={title}>
      <h3 className="rp-evidence-title">{title}</h3>
      {confidence ? (
        <p className="rp-evidence-confidence">
          Confidence: <strong>{confidence}</strong>
          {confidenceReason ? (
            <>
              <TextSep />
              <span className="rp-muted">{confidenceReason}</span>
            </>
          ) : null}
        </p>
      ) : null}
      <ul className="rp-evidence-list">
        {rows.map((row) => (
          <li key={row.id ?? `${row.label}-${row.value}`}>
            <span className="rp-evidence-label">{row.label}</span>
            <TextSep>: </TextSep>
            <strong className="rp-evidence-value">{row.value}</strong>
          </li>
        ))}
      </ul>
      {freshness && freshness.length > 0 ? (
        <ul className="rp-evidence-fresh">
          {freshness.map((f) => (
            <li key={f.label}>
              {f.label} synced {f.lastSyncLabel}
            </li>
          ))}
        </ul>
      ) : null}
      <details className="rp-evidence-lineage">
        <summary>Evidence classes</summary>
        <p className="rp-muted">
          Actual values come from systems of record. Forecasts and estimates are
          labeled so they are never mixed with observed outcomes.
        </p>
        <ul className="rp-evidence-list">
          {rows.map((row) => (
            <li key={`kind-${row.id ?? row.label}`}>
              <span className="rp-evidence-kind" data-kind={row.kind}>
                {EVIDENCE_KIND_LABEL[row.kind]}
              </span>
              <TextSep />
              <span className="rp-evidence-label">{row.label}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
