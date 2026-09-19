"use client";

/**
 * Category lock — System of Decision Record.
 * Systems record transactions. RADR records Decisions.
 */

const SYSTEMS = [
  { sys: "POS", does: "records orders" },
  { sys: "PMS", does: "records stays" },
  { sys: "Accounting", does: "records money" },
  { sys: "Workforce", does: "records shifts" },
] as const;

const RADR_RECORDS = [
  "what happened",
  "what Decision was made",
  "why",
  "what action followed",
  "what happened next",
  "what value was actually created",
  "what the operation learned",
] as const;

export function SystemOfDecisionRecord() {
  return (
    <div className="rx-sodr">
      <p className="rx-rec-k">Category</p>
      <h2 className="rx-sodr-h">
        Your systems record transactions.
        <span>RADR records Decisions.</span>
      </h2>

      <div className="rx-sodr-grid">
        <ul className="rx-sodr-systems">
          {SYSTEMS.map((s) => (
            <li key={s.sys}>
              <strong>{s.sys}</strong>
              <span>{s.does}</span>
            </li>
          ))}
        </ul>

        <div className="rx-sodr-radr">
          <p className="rx-sodr-delta" aria-hidden="true">
            △
          </p>
          <p className="rx-sodr-radr-k">RADR records</p>
          <ul>
            {RADR_RECORDS.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="rx-sodr-lock">
        System of Decision Record for hospitality
      </p>
    </div>
  );
}
