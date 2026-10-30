"use client";

import { useState } from "react";
import {
  CHANNEL_MIX_ROWS,
  LOCATION_EXPOSURE_BARS,
  MENU_DESTROYERS,
  REVENUE_BRIDGE,
  SETTLEMENT_LAYERS,
  VERIFIED_VALUE_ROWS,
  formatEuro,
  type IntelFinding,
  type IntelPeriod,
} from "@/lib/radr/product/intelligenceEngine";

type Props = {
  finding: IntelFinding;
  period: IntelPeriod;
  locationFocus: string | null;
  onLocationFocus: (id: string | null) => void;
};

export function IntelDomainCanvas({
  finding,
  period,
  locationFocus,
  onLocationFocus,
}: Props) {
  if (finding.id === "settlement-bridge") {
    return <SettlementCanvas />;
  }
  if (finding.id === "location-exposure") {
    return (
      <LocationCanvas
        locationFocus={locationFocus}
        onLocationFocus={onLocationFocus}
      />
    );
  }
  if (finding.id === "revenue-vs-forecast") {
    return <RevenueCanvas />;
  }
  if (finding.id === "verified-value-trend") {
    return <VerifiedCanvas />;
  }
  if (finding.id === "channel-mix") {
    return <ChannelCanvas />;
  }
  if (finding.id === "kitchen-pressure") {
    return <KitchenCanvas />;
  }
  if (finding.id === "menu-destroyers") {
    return <MenuCanvas />;
  }
  if (finding.id === "terrace-conversion") {
    return <TerraceCanvas />;
  }
  if (finding.id === "labor-template") {
    return <LaborCanvas period={period} />;
  }
  return (
    <div className="ie-placeholder">
      <p>
        <strong>{finding.whatRadrSees}</strong>
      </p>
      <p style={{ marginTop: 8 }}>{finding.whyItMatters}</p>
    </div>
  );
}

function SettlementCanvas() {
  const [layer, setLayer] = useState<string | null>("accounting");
  const gap = 342;
  return (
    <div className="ie-domain">
      <p className="ie-domain-lead">
        Unreconciled <strong>{formatEuro(gap)}</strong> — break is between bank
        settle and accounting post.
      </p>
      <ol className="ie-bridge">
        {SETTLEMENT_LAYERS.map((l, i) => {
          const next = SETTLEMENT_LAYERS[i + 1];
          const delta = next ? l.euro - next.euro : 0;
          return (
            <li key={l.id}>
              <button
                type="button"
                className="ie-bridge-row"
                data-active={layer === l.id ? "true" : undefined}
                data-break={delta > 0 && l.id !== "pos" ? "true" : undefined}
                onClick={() => setLayer(layer === l.id ? null : l.id)}
              >
                <span>
                  <strong>{l.label}</strong>
                  <em>{l.note}</em>
                </span>
                <strong>{formatEuro(l.euro)}</strong>
              </button>
              {next ? (
                <div className="ie-bridge-gap" data-hot={delta > 0 ? "true" : undefined}>
                  {delta > 0 ? `↓ ${formatEuro(delta)} variance` : "↓ matched"}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {layer === "accounting" ? (
        <div className="ie-ev-panel">
          <h4>Accounting layer</h4>
          <ul>
            <li>Bank settle €183,982 posted 14h earlier</li>
            <li>AP accrual missing €342 timing cut-off</li>
            <li>No processor dispute — GL timing only</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function LocationCanvas({
  locationFocus,
  onLocationFocus,
}: {
  locationFocus: string | null;
  onLocationFocus: (id: string | null) => void;
}) {
  return (
    <div className="ie-domain">
      <p className="ie-domain-lead">
        Exposure concentrates in three sites — click to scope evidence.
      </p>
      <ul className="ie-bars">
        {LOCATION_EXPOSURE_BARS.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              className="ie-bar-row"
              data-active={locationFocus === b.id ? "true" : undefined}
              onClick={() =>
                onLocationFocus(locationFocus === b.id ? null : b.id)
              }
            >
              <span className="ie-bar-meta">
                <strong>{b.label}</strong>
                <em>
                  {b.pct}% · {formatEuro(b.euro)}
                </em>
              </span>
              <span className="ie-bar-track">
                <i style={{ width: `${b.pct}%` }} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {locationFocus ? (
        <div className="ie-ev-panel">
          <h4>
            {LOCATION_EXPOSURE_BARS.find((b) => b.id === locationFocus)?.label}{" "}
            evidence
          </h4>
          <ul>
            <li>Procurement invoices leading share of site exposure</li>
            <li>Labor % above peer set on late shift</li>
            <li>Channel mix delivery-heavy vs portfolio</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RevenueCanvas() {
  return (
    <div className="ie-domain">
      <p className="ie-domain-lead">
        Revenue beat is real — contribution lags on labor, channel, and COGS.
      </p>
      <ul className="ie-bridge-flat">
        {REVENUE_BRIDGE.map((r) => (
          <li key={r.id} data-neg={r.euro < 0 ? "true" : undefined}>
            <span>
              <strong>{r.label}</strong>
              <em>{r.note}</em>
            </span>
            <strong>
              {r.euro < 0 ? "−" : "+"}
              {formatEuro(Math.abs(r.euro))}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function VerifiedCanvas() {
  return (
    <div className="ie-domain">
      <div className="ie-verified-head">
        <div>
          <strong>€418k</strong>
          <span>Actual · MTD</span>
        </div>
        <div>
          <strong>€395k</strong>
          <span>Expected</span>
        </div>
        <div>
          <strong>106%</strong>
          <span>Accuracy</span>
        </div>
      </div>
      <ul className="ie-verified-rows">
        {VERIFIED_VALUE_ROWS.map((r) => (
          <li key={r.id}>
            <div>
              <strong>{r.title}</strong>
              <em>
                {r.where} · expected {formatEuro(r.expected)} · actual{" "}
                {formatEuro(r.actual)}
              </em>
              <span>{r.learned}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChannelCanvas() {
  return (
    <div className="ie-domain">
      <p className="ie-domain-lead">
        Delivery share and growth are outpacing dine-in contribution.
      </p>
      <ul className="ie-bridge-flat">
        {CHANNEL_MIX_ROWS.map((c) => (
          <li key={c.id} data-neg={c.contributionPp < 0 ? "true" : undefined}>
            <span>
              <strong>{c.label}</strong>
              <em>
                {c.sharePct}% share · +{c.growthPct}% growth
              </em>
            </span>
            <strong>
              {c.contributionPp >= 0 ? "+" : ""}
              {c.contributionPp.toFixed(1)}pp
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KitchenCanvas() {
  return (
    <div className="ie-domain">
      <div className="ie-kpi-row">
        <div>
          <strong>91% → 96%</strong>
          <span>Kitchen load · 18 min</span>
        </div>
        <div>
          <strong>3</strong>
          <span>Turns at risk</span>
        </div>
        <div>
          <strong>€420</strong>
          <span>Exposed tonight</span>
        </div>
      </div>
      <div className="ie-ev-panel">
        <h4>Evidence chain</h4>
        <ul>
          <li>KDS hot-line ticket age +4.2 min vs baseline</li>
          <li>Delivery pace +18% vs same window last week</li>
          <li>Reservations still filling dine-in · do not cut floor</li>
        </ul>
      </div>
    </div>
  );
}

function MenuCanvas() {
  return (
    <div className="ie-domain">
      <ul className="ie-menu-rows">
        {MENU_DESTROYERS.map((d) => (
          <li key={d.id} data-bad={d.contributionPp < 0 ? "true" : undefined}>
            <strong>{d.name}</strong>
            <span>
              Vol +{d.volumePct}% · Food cost +{d.foodCostPct}% · Contrib{" "}
              {d.contributionPp > 0 ? "+" : ""}
              {d.contributionPp}pp
            </span>
            <em>{d.why}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TerraceCanvas() {
  return (
    <div className="ie-domain">
      <div className="ie-kpi-row">
        <div>
          <strong>20:10–20:40</strong>
          <span>Conversion window</span>
        </div>
        <div>
          <strong>€860</strong>
          <span>Exposed covers</span>
        </div>
        <div>
          <strong>VIP</strong>
          <span>Wait risk rising</span>
        </div>
      </div>
      <div className="ie-ev-panel">
        <h4>Demand vs pace</h4>
        <ul>
          <li>Waitlist depth 7 · terrace preference 62%</li>
          <li>Turn time +9 min vs plan in the window</li>
          <li>Repeat likelihood high on held VIP parties</li>
        </ul>
      </div>
    </div>
  );
}

function LaborCanvas({ period }: { period: IntelPeriod }) {
  const next7 = period === "7d" ? 4600 : period === "30d" ? 18400 : 4600;
  return (
    <div className="ie-domain">
      <div className="ie-kpi-row">
        <div>
          <strong>+8.4pp</strong>
          <span>Labor · Frankfurt late</span>
        </div>
        <div>
          <strong>−11%</strong>
          <span>Covers vs plan</span>
        </div>
        <div>
          <strong>{formatEuro(next7)}</strong>
          <span>Expected next window</span>
        </div>
      </div>
      <div className="ie-ev-panel">
        <h4>Template disconnect</h4>
        <ul>
          <li>Scheduled hours locked to last quarter demand curve</li>
          <li>Actual covers −11% on Thu–Sat late</li>
          <li>Peer sites run −1.2pp labor at same cover pace</li>
        </ul>
      </div>
    </div>
  );
}
