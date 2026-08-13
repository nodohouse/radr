"use client";

import { FindingReveal } from "../FindingReveal";

const findings = [
  {
    id: "00281",
    headline: "You paid more than you agreed.",
    rows: [
      { label: "Agreed", value: "€31.20" },
      { label: "Paid", value: "€34.80" },
    ],
    impact: "€18,620 / year",
    cta: "Review",
  },
  {
    id: "00314",
    headline: "You're owed money that never arrived.",
    rows: [
      { label: "Expected", value: "€18,620" },
      { label: "Received", value: "€0" },
    ],
    impact: "€18,620 recoverable",
    cta: "Open",
  },
  {
    id: "00390",
    headline: "You scheduled too many people.",
    rows: [
      { label: "Needed", value: "11" },
      { label: "Scheduled", value: "14" },
    ],
    impact: "€11,840 / month",
    cta: "Review",
  },
] as const;

export function SectionSignals() {
  return (
    <section className="radr-section radr-section-light" id="signals">
      <div className="radr-shell">
        <p className="radr-cat radr-cat-ink">Findings</p>
        <h2 className="radr-h2">
          See what
          <br />
          others miss.
        </h2>
        <p className="radr-lead">
          Plain English. Real money. Illustrative examples — not customer data.
        </p>
        <div className="radr-findings">
          {findings.map((f) => (
            <FindingReveal key={f.id} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}
