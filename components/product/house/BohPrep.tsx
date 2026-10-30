"use client";

import Link from "next/link";
import type { HouseSummary } from "@/lib/radr/product/houseAttention";
import type { BohView } from "./BohShell";
import { BohLineChart } from "./BohLineChart";
import { IconBars, IconCheck, IconClock } from "./BohIcons";

type Props = {
  house: HouseSummary;
  onOpenView: (v: BohView) => void;
  isHotel: boolean;
};

const WASTE_MEDIA: Record<string, string> = {
  w_tuna_1: "/house/waste-tuna-trim.jpg",
  w_dairy_1: "/house/waste-cream.jpg",
  w_cuke_1: "/house/waste-cucumber.jpg",
};

export function BohPrep({ house, onOpenView, isHotel }: Props) {
  const prep = house.prep;
  const prepPct = prep
    ? Math.round((prep.prepared / prep.required) * 100)
    : house.readiness.readinessPct;
  const deliveries = house.deliveries;
  const waste = house.waste;
  const verified = house.verifications[0];

  return (
    <div className="boh-prep">
      <header className="boh-view-head">
        <div>
          <p className="boh-kicker">Back of house · Prep & line capacity</p>
          <h2>Prep & line capacity</h2>
          <p>
            Keep prep, line, deliveries and waste in control — before peak
            service.
          </p>
        </div>
      </header>

      <div className="boh-prep-top">
        {prep ? (
          <section className="boh-panel boh-prep-hero">
            <div className="boh-panel-head">
              <h3>{prep.title}</h3>
              <span className="boh-muted">{prep.where}</span>
            </div>
            <div className="boh-prep-bar" aria-hidden>
              <i style={{ width: `${prepPct}%` }} />
            </div>
            <div className="boh-metrics boh-metrics-5">
              <div>
                <span>Required</span>
                <strong>{prep.required}</strong>
              </div>
              <div>
                <span>Prepared</span>
                <strong>{prep.prepared}</strong>
              </div>
              <div>
                <span>Remaining</span>
                <strong>{prep.required - prep.prepared}</strong>
              </div>
              <div>
                <span>Throughput</span>
                <strong>{prep.throughput}/h</strong>
              </div>
              <div>
                <span>Forecast</span>
                <strong className="boh-tone-neg">{prep.forecastShort} short</strong>
              </div>
            </div>
            {prep.forecastShort > 0 ? (
              <p className="boh-prep-note">
                <IconClock size={14} />
                <span>
                  {prep.windowLeftMin} min left — short {prep.forecastNote}.
                  RADR prepared reassign / reduce-promotion futures.
                </span>
              </p>
            ) : null}
          </section>
        ) : (
          <section className="boh-panel">
            <h3>{house.readiness.title}</h3>
            <p className="boh-muted">{house.readiness.readinessNote}</p>
            <strong style={{ fontSize: 28 }}>{house.readiness.readinessPct}%</strong>
          </section>
        )}

        <section className="boh-panel" aria-label="Line load forecast">
          <div className="boh-panel-head">
            <h3>Line load forecast</h3>
            <button
              type="button"
              className="boh-link"
              onClick={() => onOpenView("prep")}
            >
              View all →
            </button>
          </div>
          <BohLineChart
            shortLabel={prep ? `${prep.forecastShort} short` : "Peak"}
          />
        </section>
      </div>

      <div className="boh-prep-mid">
        <section className="boh-panel">
          <div className="boh-panel-head">
            <h3>Deliveries</h3>
            <button
              type="button"
              className="boh-link"
              onClick={() => onOpenView("deliveries")}
            >
              View all →
            </button>
          </div>
          <ul className="boh-del-list">
            {deliveries.map((d) => (
              <li key={d.id} data-status={d.status}>
                <div>
                  <strong>{d.supplier}</strong>
                  <p>{d.note}</p>
                </div>
                <div className="boh-del-meta">
                  <span
                    className={`boh-badge is-${d.status === "short" || d.status === "late" ? "critical" : d.status === "expected" ? "watching" : "handling"}`}
                  >
                    {d.status}
                  </span>
                  <em>
                    {d.arrived ? `Arrived ${d.arrived}` : `Due ${d.expected}`}
                  </em>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="boh-panel">
          <div className="boh-panel-head">
            <h3>Waste pattern</h3>
            <button
              type="button"
              className="boh-link"
              onClick={() => onOpenView("waste")}
            >
              View all →
            </button>
          </div>
          <ul className="boh-waste-list boh-waste-rich">
            {waste.map((w) => (
              <li key={w.id}>
                {WASTE_MEDIA[w.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={WASTE_MEDIA[w.id]} alt="" width={44} height={44} />
                ) : null}
                <div>
                  <strong>{w.item}</strong>
                  <span>
                    {w.qty} · {w.pattern} · {w.reason}
                  </span>
                </div>
                <em>€{w.valueEuro}</em>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="boh-prep-bot">
        {verified ? (
          <section className="boh-panel boh-verified boh-verified-rich">
            <div className="boh-verified-mark" aria-hidden>
              <IconCheck size={36} />
            </div>
            <p className="boh-hist-label">
              {verified.historicalLabel ??
                "HISTORICAL VERIFIED OUTCOME · FRIDAY · KREUZBERG · FLOUR"}
            </p>
            <h3>{verified.title}</h3>
            <dl>
              <div>
                <dt>Requested</dt>
                <dd>{verified.requested}</dd>
              </div>
              <div>
                <dt>Arrived</dt>
                <dd>{verified.arrived}</dd>
              </div>
              <div>
                <dt>Restored</dt>
                <dd>{verified.restored}</dd>
              </div>
              <div>
                <dt>Verified value</dt>
                <dd className="boh-tone-pos">€{verified.verifiedEuro}</dd>
              </div>
            </dl>
            <p className="boh-verified-note">
              Expected €{verified.expectedEuro} · observed €{verified.observedEuro}{" "}
              · {verified.disruption}
            </p>
            <Link href="/app/value" className="boh-link">
              Open Ledger →
            </Link>
          </section>
        ) : null}

        {!isHotel ? (
          <section className="boh-panel boh-estate">
            <div className="boh-panel-head">
              <h3>
                <IconBars className="boh-inline-ico" /> Estate pattern
              </h3>
            </div>
            <p>
              Berlin stockouts on caster sugar cluster on high-delivery Fridays.
              Kreuzberg raised dry-store par — stockout frequency −42%.
            </p>
            <Link href="/app/memory" className="boh-btn-dark">
              Compare in Memory →
            </Link>
          </section>
        ) : null}
      </div>

      <button
        type="button"
        className="boh-link"
        style={{ marginTop: 16 }}
        onClick={() => onOpenView("overview")}
      >
        ← Back to Overview
      </button>
    </div>
  );
}
