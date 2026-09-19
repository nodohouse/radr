"use client";

/**
 * Editorial evidence — three proof moments, not a SaaS stat grid.
 * Quiet energy between Data Origin and the Leak Map.
 */

import NextLink from "next/link";
import {
  researchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";

type Proof = {
  id: ResearchFactId;
  quote: string;
  note?: string;
};

/** Three strong editorial proofs — not four equal cards */
const PROOFS: Proof[] = [
  {
    id: "nraExpenseRise2019to2026",
    quote:
      "Total expenses for an average restaurant jumped 36% between 2019 and 2026.",
    note: "Typical restaurant pre-tax profit margin ~5%.",
  },
  {
    id: "otelierManualReporting2026",
    quote:
      "91% still rely on some level of manual reporting, even within automated workflows.",
  },
  {
    id: "otelierReconcileHours2026",
    quote:
      "27% spend more than 11 hours per week consolidating or reconciling data.",
    note: "More than a working day can disappear into assembling the picture before anyone can act.",
  },
];

export function ResearchEvidenceStrip({
  kicker = "Evidence",
  title = "The software exists. The gaps still do.",
}: {
  kicker?: string;
  title?: string;
}) {
  return (
    <div className="rx-ev rx-ev-editorial">
      <header className="rx-ev-head">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
      </header>

      <ol className="rx-ev-proofs">
        {PROOFS.map((p) => {
          const f = researchFact(p.id);
          return (
            <li key={p.id} className="rx-ev-proof">
              <p className="rx-ev-metric">{f.metric.replace("~", "")}</p>
              <p className="rx-ev-label">{f.displayLabel}</p>
              <blockquote className="rx-ev-quote">
                <p>“{p.quote}”</p>
              </blockquote>
              {p.note ? <p className="rx-ev-note">{p.note}</p> : null}
              <footer className="rx-ev-source">
                <span>
                  {f.publisher} · {f.publicationDate.slice(0, 4)}
                </span>
                <a
                  href={f.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source <span aria-hidden="true">↗</span>
                </a>
              </footer>
            </li>
          );
        })}
      </ol>

      <NextLink href="/research" className="rx-research-lib">
        Evidence library <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}
