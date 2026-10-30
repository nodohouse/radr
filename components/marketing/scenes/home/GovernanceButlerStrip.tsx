"use client";

/**
 * Governance + Butler — power with control.
 */

import Link from "next/link";

const LEVELS = [
  { id: "observe", label: "Observe", note: "RADR is watching" },
  { id: "explain", label: "Explain", note: "Why it matters · with evidence" },
  { id: "prepare", label: "Prepare", note: "Prepared for approval" },
  {
    id: "recommend",
    label: "Recommend / request approval",
    note: "Ready when you are",
  },
  {
    id: "execute",
    label: "Execute within policy",
    note: "Handled automatically when policy allows",
  },
  {
    id: "verify",
    label: "Execute + verify within policy",
    note: "Action sealed with evidence",
  },
] as const;

const ASK = [
  "What is most likely to hurt contribution tonight?",
  "Why is Floor 8 behind?",
  "Which supplier price changes materially affect margin?",
  "What happens if we do nothing?",
] as const;

export function GovernanceButlerStrip() {
  return (
    <section
      className="rx-gov"
      data-nav-theme="light"
      aria-labelledby="rx-gov-title"
    >
      <div className="rx-shell">
        <p className="rx-rec-k">Trust · governance</p>
        <h2 id="rx-gov-title" className="rx-rec-h">
          Powerful. Controlled.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "36rem" }}>
          Autonomy is governed by policy, confidence, and action risk — not a
          single global switch. Approval is a strength, not a limitation.
        </p>

        <ol className="rx-gov-ladder" aria-label="Autonomy ladder">
          {LEVELS.map((l, i) => (
            <li key={l.id}>
              <em>{String(i).padStart(2, "0")}</em>
              <strong>{l.label}</strong>
              <span>{l.note}</span>
            </li>
          ))}
        </ol>

        <div className="rx-gov-butler">
          <p className="rx-rh-kicker">Ask RADR</p>
          <h3>Natural language into structured operating truth.</h3>
          <p>
            Ask RADR is an interface into RADR’s operating intelligence — not a
            generic chatbot. It uses connected evidence, calculates, explains,
            and prepares action only when policy allows.
          </p>
          <ul className="rx-gov-asks">
            {ASK.map((q) => (
              <li key={q}>“{q}”</li>
            ))}
          </ul>
          <Link href="/signup?intent=demo&next=/app/enter" className="rx-btn rx-btn-ghost">
            See RADR in action <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className="rx-gov-doctrine">
          Economic values come from source data, deterministic calculations, and
          approved models — not generative invention.{" "}
          <Link href="/security">Trust →</Link>
        </p>
      </div>
    </section>
  );
}
