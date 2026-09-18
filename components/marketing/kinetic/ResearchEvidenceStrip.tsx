"use client";

/**
 * Editorial research evidence — giant numbers, source drawer.
 * No consulting-deck cards. No invented statistics.
 */

import { useState } from "react";
import NextLink from "next/link";
import {
  HOME_RESEARCH_FACTS,
  researchFact,
  type ResearchFact,
  type ResearchFactId,
} from "@/data/research/researchFacts";

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

  return (
    <div className="rx-research">
      <p className="rx-rec-k">{kicker}</p>
      <h2 className="rx-rec-h">{title}</h2>
      <p className="rx-rec-p rx-rec-muted">
        Hospitality has more systems than ever. The work between them is still
        fragmented.
      </p>

      <ul className="rx-research-grid">
        {factIds.map((id) => {
          const f = researchFact(id);
          return (
            <li key={id}>
              <button
                type="button"
                className="rx-research-fact"
                onClick={() => setOpenId(id)}
                aria-expanded={openId === id}
              >
                <strong>{f.metric}</strong>
                <span>{f.displayLabel}</span>
                <em>
                  {f.population} · {f.publisher} · {f.publicationDate}
                </em>
                <i>Source ↗</i>
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
    <aside className="rx-research-drawer" role="dialog" aria-label="Source">
      <header>
        <p className="rx-rec-k">Source</p>
        <button type="button" onClick={onClose} aria-label="Close">
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
          <dt>Date</dt>
          <dd>{fact.publicationDate}</dd>
        </div>
        <div>
          <dt>Population / geography</dt>
          <dd>
            {fact.population} · {fact.geography}
          </dd>
        </div>
        <div>
          <dt>What the source actually says</dt>
          <dd>
            <strong>{fact.metric}</strong> {fact.statement}
          </dd>
        </div>
        <div>
          <dt>Method note</dt>
          <dd>{fact.methodologyNote}</dd>
        </div>
      </dl>
      <a
        href={fact.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rx-btn rx-btn-ghost"
      >
        View source <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
