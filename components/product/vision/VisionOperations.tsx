"use client";

import Link from "next/link";

const WINDOWS = [
  {
    t: "NOW",
    label: "Peak hold",
    tone: "watch",
    body: "124 covers · waitlist 6 · cold station kitchen dependency.",
  },
  {
    t: "+30",
    label: "Inbound wave",
    tone: "watch",
    body: "38 covers inbound · delivery share elevated.",
  },
  {
    t: "+60",
    label: "Second turns",
    tone: "watch",
    body: "Party of 8 terrace · turn window narrowing.",
  },
  {
    t: "+120",
    label: "Close ramp",
    tone: "neutral",
    body: "Covers easing · throttle delivery if kitchen still hot.",
  },
];

const ALERTS = [
  { id: "a1", title: "Kitchen ticket time +2 min", href: "/app/live" },
  { id: "a2", title: "Table 12 allergy open", href: "/app/decisions" },
  { id: "a3", title: "Delivery share above target", href: "/app/live" },
];

export function VisionOperations() {
  return (
    <div className="rv-page rv-ops">
      <header className="rv-page-head">
        <p className="rv-label">Service · NOW → +120</p>
        <h1>Service command</h1>
        <p>
          Covers · waitlist · kitchen dependency — Soho · New York floor pressure.
        </p>
      </header>

      <div className="rv-metric-band" style={{ marginBottom: "0.85rem" }}>
        {[
          { label: "Covers in house", value: "124", delta: "+8 vs plan", tone: "pos" },
          { label: "Waitlist", value: "6", delta: "Avg 18 min", tone: "watch" },
          { label: "Recoverable", value: "€640", delta: "Tonight", tone: "pos" },
          { label: "Service pressure", value: "72", delta: "Moderate", tone: "watch" },
        ].map((m) => (
          <div key={m.label} className="rv-metric">
            <span className="rv-label">{m.label}</span>
            <strong className="rv-num">{m.value}</strong>
            <em data-tone={m.tone}>{m.delta}</em>
          </div>
        ))}
      </div>

      <div className="rv-charts" style={{ marginBottom: "0.85rem" }}>
        <section className="rv-panel">
          <div className="rv-panel-head">
            <h2>Pressure map</h2>
            <Link className="rv-btn" href="/app/live">
              Open Live
            </Link>
          </div>
          <svg viewBox="0 0 480 200" className="rv-line" aria-label="Pressure map">
            <rect width="480" height="200" fill="#141714" rx="8" />
            <path
              d="M40 40 H220 V150 H40 Z"
              fill="rgba(200,107,92,0.18)"
              stroke="#c86b5c"
            />
            <text x="60" y="100" fill="#f2f0e8" fontSize="12">
              Main Dining
            </text>
            <path
              d="M240 40 H360 V100 H240 Z"
              fill="rgba(0,217,120,0.12)"
              stroke="#00d978"
            />
            <text x="260" y="75" fill="#f2f0e8" fontSize="12">
              Bar
            </text>
            <path
              d="M240 110 H440 V180 H240 Z"
              fill="rgba(201,160,90,0.14)"
              stroke="#c9a05a"
            />
            <text x="280" y="150" fill="#f2f0e8" fontSize="12">
              Terrace
            </text>
            <path
              d="M40 160 H200 V190 H40 Z"
              fill="rgba(200,107,92,0.22)"
              stroke="#c86b5c"
            />
            <text x="70" y="180" fill="#f2f0e8" fontSize="11">
              Kitchen
            </text>
          </svg>
        </section>

        <section className="rv-panel">
          <div className="rv-panel-head">
            <h2>Service windows</h2>
          </div>
          <ul className="rv-need-list">
            {WINDOWS.map((w) => (
              <li key={w.t}>
                <button type="button">
                  <strong>
                    {w.t} · {w.label}
                  </strong>
                  <span>{w.body}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rv-panel">
        <div className="rv-panel-head">
          <h2>Alerts</h2>
          <Link className="rv-btn" href="/app/decisions">
            Decisions
          </Link>
        </div>
        <ul className="rv-need-list">
          {ALERTS.map((a) => (
            <li key={a.id}>
              <Link href={a.href}>
                <strong>{a.title}</strong>
                <span>Open</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
