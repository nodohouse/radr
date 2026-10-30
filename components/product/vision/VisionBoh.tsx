"use client";

import Link from "next/link";

const STATIONS = [
  {
    name: "Grill",
    load: 91,
    state: "intervene" as const,
    note: "At capacity · portions queue · floater prepared",
  },
  { name: "Sauté", load: 74, state: "watch" as const, note: "Ramp on track for mains wave" },
  { name: "Cold / Pantry", load: 58, state: "healthy" as const, note: "Prep buffer · floater available" },
  { name: "Pass", load: 82, state: "watch" as const, note: "3 tickets waiting · expo dependency" },
  { name: "Dessert", load: 44, state: "healthy" as const, note: "Quiet · caster sugar watching" },
];

const STOCK = [
  { item: "Ribeye", left: "6 portions", tone: "watch" },
  { item: "Fresh herbs", left: "Low", tone: "watch" },
  { item: "Burrata", left: "OK", tone: "pos" },
];

export function VisionBoh() {
  return (
    <div className="rv-page">
      <header className="rv-page-head">
        <p className="rv-label">Back of house · Line &amp; prep</p>
        <h1>Kitchen command</h1>
        <p>
          Grill capacity · portions remaining · prep shortfalls — station load
          and BOH Decisions.
        </p>
      </header>

      <div className="rv-metric-band" style={{ marginBottom: "0.85rem" }}>
        {[
          { label: "Kitchen load", value: "82%", delta: "+22% vs last hour", tone: "neg" },
          { label: "Prep shortfalls", value: "3", delta: "Portions behind par", tone: "neg" },
          { label: "Stock risk", value: "2", delta: "Items watching", tone: "watch" },
          { label: "Active orders", value: "12", delta: "Queue", tone: "neutral" },
        ].map((m) => (
          <div key={m.label} className="rv-metric">
            <span className="rv-label">{m.label}</span>
            <strong className="rv-num">{m.value}</strong>
            <em data-tone={m.tone}>{m.delta}</em>
          </div>
        ))}
      </div>

      <div className="rv-gm-modules" style={{ marginBottom: "0.85rem" }}>
        {STATIONS.map((s) => (
          <article key={s.name} className="rv-mod">
            <h3>{s.name}</h3>
            <strong className="rv-num">{s.load}%</strong>
            <p className="rv-status" data-sev={s.state}>
              <i />
              {s.note}
            </p>
          </article>
        ))}
      </div>

      <div className="rv-charts">
        <section className="rv-panel">
          <div className="rv-panel-head">
            <h2>Stock alerts</h2>
            <Link className="rv-btn" href="/app/house">
              House standards
            </Link>
          </div>
          <ul className="rv-need-list">
            {STOCK.map((s) => (
              <li key={s.item}>
                <button type="button">
                  <strong>{s.item}</strong>
                  <span>{s.left}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <div className="rv-decision-card">
          <p className="rv-label">Active decision</p>
          <h3>Send 1 floater from Cold Prep to Grill for next 30 minutes.</h3>
          <p>Expected +€1,240 · Confidence 87%</p>
          <div className="rv-decision-actions">
            <Link className="rv-btn" data-primary="true" href="/app/decisions">
              Approve &amp; Deploy
            </Link>
            <Link className="rv-btn" href="/app/live">
              View in Live
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
