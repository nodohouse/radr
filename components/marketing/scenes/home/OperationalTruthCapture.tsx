"use client";

/**
 * Operational truth — connect systems now; capture physical truth later.
 * Roadmap clearly labeled. Never imply voice/video is shipped.
 */

import Link from "next/link";

const NOW = [
  "POS",
  "PMS",
  "Reservations",
  "Labor",
  "Accounting",
  "Payments",
  "Suppliers",
  "Channels",
  "Weather",
  "Events",
] as const;

const FUTURE = [
  { label: "Documents", note: "Invoices · contracts · credit memos" },
  { label: "Operator input", note: "Structured exceptions from the floor" },
  { label: "Voice", note: "Multilingual notes → structured truth" },
  { label: "Image / video", note: "Show RADR the operation" },
] as const;

export function OperationalTruthCapture() {
  return (
    <section
      className="rx-truth"
      data-nav-theme="light"
      aria-labelledby="rx-truth-title"
    >
      <div className="rx-shell">
        <p className="rx-rec-k">Operational truth</p>
        <h2 id="rx-truth-title" className="rx-rec-h">
          Connect what systems know. Observe what they miss.
        </h2>
        <p className="rx-rec-p" style={{ maxWidth: "38rem" }}>
          RADR connects the systems that already know your operation — then
          forms Decisions from that truth.
        </p>

        <ul className="rx-truth-now" aria-label="Connected today">
          {NOW.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="rx-truth-hint">
          Availability varies by integration — see Connections for honest
          status.
        </p>

        <div className="rx-truth-future">
          <p className="rx-truth-badge">ROADMAP</p>
          <h3>If truth never reaches software, RADR is being designed to capture it.</h3>
          <ul>
            {FUTURE.map((f) => (
              <li key={f.label}>
                <strong>{f.label}</strong>
                <span>{f.note}</span>
              </li>
            ))}
          </ul>
          <p className="rx-truth-principle">
            If truth exists in software: <em>connect it</em>. If truth exists
            physically: <em>capture it</em>. Voice and camera are not
            production-ready today.
          </p>
        </div>

        <p style={{ marginTop: "1.25rem" }}>
          <Link href="/product/connections" className="rx-btn rx-btn-ghost">
            See Connections <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
