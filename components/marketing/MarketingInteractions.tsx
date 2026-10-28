"use client";

import { useState } from "react";
import Link from "next/link";
import { signalByChannel, type ChannelId } from "./data/demo";

const areas: {
  id: ChannelId;
  name: string;
  title: string;
  copy: string;
  examples: string[];
}[] = [
  {
    id: "buy",
    name: "Buy",
    title: "What you spend.",
    copy: "Bring agreements, invoices and deliveries into the same picture. Understand where the difference starts.",
    examples: [
      "Supplier price variances",
      "Duplicate invoices",
      "Contract mismatches",
    ],
  },
  {
    id: "labor",
    name: "Labor",
    title: "How you staff.",
    copy: "Connect staffing decisions to the operation they support. Make the next schedule with more context.",
    examples: [
      "Schedule above demand",
      "Overtime emerging",
      "Labor productivity",
    ],
  },
  {
    id: "sell",
    name: "Sell",
    title: "How you monetize.",
    copy: "Look beyond the headline revenue number. Understand the rates, channels and fees behind it.",
    examples: [
      "Room rate opportunities",
      "Menu mix",
      "Channel and delivery fees",
    ],
  },
  {
    id: "recover",
    name: "Recover",
    title: "What you’re owed.",
    copy: "Keep the thread from the original promise to the final outcome. Make outstanding value visible.",
    examples: ["Supplier credits", "Missing rebates", "Settlement differences"],
  },
];
export function SolutionExplorer() {
  const [active, setActive] = useState<ChannelId>("buy");
  const area = areas.find((a) => a.id === active)!;
  const signal = signalByChannel(active);
  return (
    <section className="rp-section rp-dark" id="areas">
      <div className="rp-container">
        <div className="rp-section-heading">
          <p className="rp-kicker">FOUR AREAS. ONE OPERATING PICTURE.</p>
          <h2>Everywhere margin moves.</h2>
        </div>
        <div
          className="rp-switches"
          role="group"
          aria-label="Explore operating areas"
        >
          {areas.map((a) => (
            <button
              key={a.id}
              aria-pressed={active === a.id}
              onClick={() => setActive(a.id)}
            >
              {a.name}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 18 18 6M6 6h12v12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
        </div>
        <div className="rp-explorer-grid">
          <div aria-live="polite">
            <p className="rp-kicker">{area.name.toUpperCase()}</p>
            <h3>{area.title}</h3>
            <p>{area.copy}</p>
            <ul className="rp-check-list">
              {area.examples.map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
            <Link href="/how" className="rp-text-link">
              Follow a decision <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="rp-example-card" aria-live="polite">
            <div className="rp-card-top">
              <span>{signal.source.label}</span>
              <span className="rp-status">Illustrative example</span>
            </div>
            <h3>{signal.title}</h3>
            <p>{signal.source.detail}</p>
            <div className="rp-example-pair">
              <div>
                <span>{signal.source.should.label}</span>
                <strong>{signal.source.should.value}</strong>
              </div>
              <div>
                <span>{signal.source.actual.label}</span>
                <strong>{signal.source.actual.value}</strong>
              </div>
            </div>
            <div className="rp-example-outcome">
              <span>Potential impact · requires review</span>
              <strong>
                {signal.amount}
                <small>{signal.period}</small>
              </strong>
            </div>
            <p className="rp-small">
              Example operating data. Availability varies by capability and
              integration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
export function OpportunityCalculator() {
  const [baseline, setBaseline] = useState(75000);
  const [locations, setLocations] = useState(1);
  const [rate, setRate] = useState(2);
  const [area, setArea] = useState("Procurement");
  const [annual, setAnnual] = useState(false);
  const amount = ((baseline * locations * rate) / 100) * (annual ? 12 : 1);
  const money = (n: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);
  return (
    <section className="rp-section rp-calculator-section" id="calculator">
      <div className="rp-container rp-calculator-layout">
        <div className="rp-calculator-controls">
          <p className="rp-kicker">YOUR ASSUMPTIONS</p>
          <h2>Start with your operation.</h2>
          <p>
            Choose one area and model a scenario. Adjust the assumptions to see
            how the numbers change.
          </p>
          <div
            className="rp-switches"
            role="group"
            aria-label="Opportunity area"
          >
            {["Procurement", "Labor", "Revenue"].map((name) => (
              <button
                key={name}
                aria-pressed={area === name}
                onClick={() => setArea(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="rp-input-label">
            {area === "Revenue"
              ? "Monthly revenue per location (€)"
              : `Monthly ${area.toLowerCase()} spend per location (€)`}
            <input
              type="number"
              min="0"
              max="1000000000"
              step="1000"
              value={baseline}
              onChange={(e) =>
                setBaseline(Math.min(1e9, Math.max(0, Number(e.target.value))))
              }
            />
          </label>
          <label className="rp-input-label">
            Locations
            <input
              type="number"
              min="1"
              max="10000"
              value={locations}
              onChange={(e) =>
                setLocations(
                  Math.min(
                    10000,
                    Math.max(1, Math.round(Number(e.target.value))),
                  ),
                )
              }
            />
          </label>
          <label className="rp-input-label rp-range-label">
            <span>
              Assumed improvement <strong>{rate}%</strong>
            </span>
            <input
              type="range"
              min="0"
              max="10"
              step=".5"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
            <span className="rp-range-ends">
              <small>0%</small>
              <small>10%</small>
            </span>
          </label>
        </div>
        <div className="rp-calculator-output">
          <div className="rp-output-heading">
            <span className="rp-kicker">ILLUSTRATIVE SCENARIO</span>
            <div
              className="rp-period-switch"
              role="group"
              aria-label="Result period"
            >
              <button aria-pressed={!annual} onClick={() => setAnnual(false)}>
                Monthly
              </button>
              <button aria-pressed={annual} onClick={() => setAnnual(true)}>
                Annual
              </button>
            </div>
          </div>
          <div className="rp-output-orbit">
            <div>
              <span>{area} opportunity</span>
              <strong aria-live="polite">{money(amount)}</strong>
              <span>
                {annual ? "per year" : "per month"} · {locations}{" "}
                {locations === 1 ? "location" : "locations"}
              </span>
            </div>
          </div>
          <dl className="rp-calculator-breakdown">
            <div>
              <dt>Monthly baseline / location</dt>
              <dd>{money(baseline)}</dd>
            </div>
            <div>
              <dt>Your improvement assumption</dt>
              <dd>{rate}%</dd>
            </div>
            <div>
              <dt>Calculation</dt>
              <dd>
                Baseline × {rate}% × {locations}
                {annual ? " × 12" : ""}
              </dd>
            </div>
          </dl>
          <p className="rp-small">
            A planning scenario, not a forecast or verified result. Revenue
            opportunity is not profit. No benchmark is assumed and no data is
            sent or saved.
          </p>
          <Link href="/contact" className="rh-button">
            Explore this with RADR <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
