"use client";

import { MockupBrand } from "@/components/mockups/MockupBrand";
import { MockupCanvas } from "@/components/mockups/MockupCanvas";
import { DEMO_ORG } from "@/lib/radr/demoModel";
import { ACCUMULATOR_BASE } from "@/lib/radr/deltaFieldData";

const LOCATIONS = [
  {
    city: "Amsterdam",
    area: "Centrum",
    margin: "19.1%",
    delta: "+1.4 vs plan",
    status: "on_course" as const,
  },
  {
    city: "Berlin",
    area: "Mitte",
    margin: "18.4%",
    delta: "+0.6 vs plan",
    status: "action" as const,
  },
  {
    city: "Paris",
    area: "Le Marais",
    margin: "18.7%",
    delta: "+1.1 vs plan",
    status: "on_course" as const,
  },
  {
    city: "London",
    area: "Soho",
    margin: "17.9%",
    delta: "−0.2 vs plan",
    status: "watch" as const,
    neg: true,
  },
];

const TERRITORIES = [
  { id: "BUY", value: "€42.1k", kind: "Exposure", hot: false },
  { id: "LABOR", value: "€18.4k", kind: "At risk", hot: true },
  { id: "SELL", value: "€91.2k", kind: "Upside", hot: false },
  { id: "RECOVER", value: "€19.3k", kind: "Recoverable", hot: true },
];

function formatValue(n: number) {
  return `€${n.toLocaleString("en-GB")}`;
}

export function ControlCenterMockup() {
  return (
    <MockupCanvas id="control-center">
      <div className="mk-cc">
        <MockupBrand label="Control Center" />
        <div className="mk-cc-org">
          <strong>{DEMO_ORG.name}</strong>
          <span>{DEMO_ORG.locations} locations · live</span>
        </div>

        <div className="mk-cc-hero">
          <p className="mk-kicker mk-signal-kicker">Group · Tonight</p>
          <h1 className="mk-display mk-money">{formatValue(ACCUMULATOR_BASE)}</h1>
          <p className="mk-kicker">Value identified</p>
        </div>

        <div className="mk-cc-board">
          <div className="mk-cc-locs" role="list">
            {LOCATIONS.map((loc) => (
              <article
                key={loc.city}
                className="mk-cc-loc"
                data-status={loc.status}
                role="listitem"
              >
                <i className="mk-cc-loc-status" aria-hidden="true" />
                <h2 className="mk-cc-loc-city">{loc.city}</h2>
                <p className="mk-cc-loc-area">{loc.area}</p>
                <div className="mk-cc-loc-margin">
                  <strong>{loc.margin}</strong>
                  <em>margin</em>
                </div>
                <p className="mk-cc-loc-delta" data-neg={loc.neg ? "true" : undefined}>
                  {loc.delta}
                </p>
              </article>
            ))}
          </div>

          <div className="mk-cc-terr">
            {TERRITORIES.map((t) => (
              <div
                key={t.id}
                className="mk-cc-terr-item"
                data-hot={t.hot ? "true" : undefined}
              >
                <strong>{t.id}</strong>
                <b>{t.value}</b>
                <span>{t.kind}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockupCanvas>
  );
}
