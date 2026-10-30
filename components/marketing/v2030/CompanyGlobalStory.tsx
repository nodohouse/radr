"use client";

/**
 * GLOBAL BY DESIGN — refined operating contexts.
 * Not a customer footprint.
 */

const CONTEXTS = [
  {
    city: "New York",
    currency: "USD",
    clock: "19:48",
    state: "Dinner service",
  },
  {
    city: "London",
    currency: "GBP",
    clock: "20:05",
    state: "Arrival wave",
  },
  {
    city: "Dubai",
    currency: "AED",
    clock: "23:40",
    state: "Late service",
  },
  {
    city: "Singapore",
    currency: "SGD",
    clock: "13:10",
    state: "Lunch peak",
  },
  {
    city: "Tokyo",
    currency: "JPY",
    clock: "08:15",
    state: "Breakfast",
  },
] as const;

export function CompanyGlobalStory() {
  return (
    <section className="rx30-co-global" aria-labelledby="rx30-co-global-title">
      <div className="rx30-shell">
        <p className="rx30-kicker">Global by design</p>
        <h2 id="rx30-co-global-title" className="rx30-h2">
          Global by design.
        </h2>
        <p className="rx30-lead" style={{ maxWidth: "36rem" }}>
          Different markets. Different currencies. Different operating rhythms.
          One RADR architecture.
        </p>
        <ul className="rx30-co-global-grid rx30-co-global-grid--five" aria-label="Illustrative operating contexts">
          {CONTEXTS.map((m) => (
            <li key={m.city}>
              <strong>{m.city}</strong>
              <span className="rx30-co-global-meta">
                <em>{m.currency}</em>
                <em>{m.clock}</em>
              </span>
              <span className="rx30-co-global-grammar">{m.state}</span>
            </li>
          ))}
        </ul>
        <p className="rx30-global-note">
          Illustrative operating contexts. Not customer footprint.
        </p>
      </div>
    </section>
  );
}
