"use client";

/**
 * Editorial research evidence — photography + giant numbers + source drawer.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import {
  HOME_RESEARCH_FACTS,
  researchFact,
  type ResearchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";

const FACT_VISUAL: Partial<
  Record<ResearchFactId, { src: string; alt: string; credit: string }>
> = {
  nraExpenseRise2019to2026: {
    src: "/demo/facilities/berlin-dining.jpg",
    alt: "Active restaurant dining room during service",
    credit: "Restaurant operation",
  },
  otelierManualReporting2026: {
    src: "/demo/facilities/canal-deluxe-king.jpg",
    alt: "Hotel guest-room floor — night-audit and occupancy context",
    credit: "Hotel operations",
  },
  otelierReconcileHours2026: {
    src: "/demo/facilities/canal-suite.jpg",
    alt: "Hotel suite interior — back-of-house inventory and audit context",
    credit: "Hotel back office",
  },
  hotrecWorkforceGap2026: {
    src: "/demo/facilities/berlin-bar.jpg",
    alt: "Hospitality service team at the bar during service",
    credit: "European hospitality service",
  },
};

export function ResearchEvidenceStrip({
  factIds = HOME_RESEARCH_FACTS,
  kicker = "Evidence",
  title = "The software exists. The gaps still do.",
}: {
  factIds?: ResearchFactId[];
  kicker?: string;
  title?: string;
}) {
  const [openId, setOpenId] = useState<ResearchFactId | null>(null);
  const open = openId ? researchFact(openId) : null;

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  return (
    <div className="rx-ev">
      <header className="rx-ev-head">
        <p className="rx-rec-k">{kicker}</p>
        <h2 className="rx-rec-h">{title}</h2>
      </header>

      <ul className="rx-ev-stack">
        {factIds.map((id, i) => {
          const f = researchFact(id);
          const vis = FACT_VISUAL[id];
          return (
            <li key={id} data-flip={i % 2 === 1 ? "true" : undefined}>
              <button
                type="button"
                className="rx-ev-piece"
                onClick={() => setOpenId(openId === id ? null : id)}
                aria-expanded={openId === id}
              >
                {vis ? (
                  <figure>
                    <Image
                      src={vis.src}
                      alt={vis.alt}
                      width={1600}
                      height={1060}
                      sizes="(max-width: 900px) 100vw, 58vw"
                      loading={i === 0 ? "eager" : "lazy"}
                      priority={i === 0}
                    />
                    <figcaption>{vis.credit}</figcaption>
                  </figure>
                ) : null}
                <span className="rx-ev-copy">
                  <strong>{f.metric}</strong>
                  <b>{f.displayLabel}</b>
                  <em>
                    {f.population} · {f.publisher} · {f.publicationDate}
                  </em>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {open ? (
        <ResearchDrawer fact={open} onClose={() => setOpenId(null)} />
      ) : null}

      <NextLink href="/research" className="rx-research-lib">
        Evidence library <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}

function ResearchDrawer({
  fact,
  onClose,
}: {
  fact: ResearchFact;
  onClose: () => void;
}) {
  return (
    <aside
      className="rx-research-drawer"
      role="dialog"
      aria-label="Source"
      aria-modal="false"
    >
      <header>
        <p className="rx-rec-k">Source</p>
        <button type="button" onClick={onClose} aria-label="Close source">
          Close
        </button>
      </header>
      <dl>
        <div>
          <dt>Publisher</dt>
          <dd>{fact.publisher}</dd>
        </div>
        <div>
          <dt>Report</dt>
          <dd>{fact.report}</dd>
        </div>
        <div>
          <dt>Publication date</dt>
          <dd>{fact.publicationDate}</dd>
        </div>
        <div>
          <dt>Geography</dt>
          <dd>{fact.geography}</dd>
        </div>
        <div>
          <dt>Survey / population</dt>
          <dd>{fact.population}</dd>
        </div>
        <div>
          <dt>What the source supports</dt>
          <dd>
            <strong>{fact.metric}</strong> {fact.statement}
          </dd>
        </div>
      </dl>
      <a
        href={fact.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rx-btn rx-btn-ghost"
      >
        View original source <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
