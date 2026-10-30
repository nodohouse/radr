"use client";

import Link from "next/link";
import type { MemoryYearModel } from "@/lib/radr/product/memoryProofEngine";

type Props = {
  year: MemoryYearModel;
};

export function MemoryYear({ year }: Props) {
  const improvement = Math.round(
    ((year.forecastStart - year.forecastEnd) / year.forecastStart) * 100,
  );

  return (
    <div className="me-year" data-memory-view="year">
      <header className="me-year-hero">
        <p className="me-k">Year on RADR</p>
        <h2>Compounding intelligence — proven</h2>
        <p>
          Forecast error {year.forecastStart}% → {year.forecastEnd}% ({improvement}%
          improvement) across the estate.
        </p>
      </header>

      <div className="me-year-kpis">
        <div>
          <span>Services learned from</span>
          <strong>{year.services.toLocaleString("en-US")}</strong>
        </div>
        <div>
          <span>Decisions reviewed</span>
          <strong>{year.decisionsReviewed.toLocaleString("en-US")}</strong>
        </div>
        <div>
          <span>Decisions verified</span>
          <strong>{year.decisionsVerified.toLocaleString("en-US")}</strong>
        </div>
        <div>
          <span>Value verified</span>
          <strong>{year.valueFormatted}</strong>
        </div>
        <div>
          <span>Playbooks improved</span>
          <strong>{year.playbooksImproved}</strong>
        </div>
        <div>
          <span>Operating patterns</span>
          <strong>{year.patternsLearned}</strong>
        </div>
      </div>

      <section className="me-year-timeline" aria-label="Year timeline">
        <h3>Timeline</h3>
        <ol>
          {year.milestones.map((m) => (
            <li key={m.month}>
              <span className="me-year-month">{m.month}</span>
              <div>
                <strong>{m.title}</strong>
                <p>{m.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="me-pb-links">
        <Link href="/app/value">Open Verified Value →</Link>
        <Link href="/app/memory?view=playbooks">Playbooks evolved →</Link>
        <Link href="/app/memory?view=dna">Operating DNA →</Link>
        <Link href="/app">Control Center →</Link>
      </div>
    </div>
  );
}
