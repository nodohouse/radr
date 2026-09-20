"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  LISBON_RESIDENCES,
  lisbonAttention,
  lisbonHandling,
  lisbonOrphanNight,
  lisbonPredictions,
  lisbonStayArrivals,
  lisbonTonight,
} from "@/lib/radr/demo/lisbonResidences";
import { formatEuro } from "@/lib/radr/money";
import { useProduct } from "@/lib/product/store";
import { composeControlCenter, moduleEnabled } from "@/lib/radr/controlCenter";
import { resolveProfile } from "@/lib/radr/operating/resolveProfile";
import { mapDemoWhenToCockpitHorizon } from "@/lib/radr/hiddenSignals/rank";
import { readWhenHorizon } from "@/components/product/WhenScopeStrip";
import { PredictionChip } from "@/components/product/PredictionChip";
import { HiddenSignalStrip } from "@/components/product/HiddenSignalStrip";
import { StayArrivalsBrief } from "@/components/product/StayArrivalsBrief";

/**
 * Lisbon Residences Control Center — DEMO serviced apartments.
 */
export function ResidencesGlanceBoard() {
  const { roleView } = useProduct();
  const pulse = lisbonTonight();
  const attention = lisbonAttention();
  const handling = lisbonHandling();
  const orphan = lisbonOrphanNight();
  const predictions = lisbonPredictions();
  const arrivals = useMemo(() => lisbonStayArrivals(), []);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [whenTick, setWhenTick] = useState(0);

  useEffect(() => {
    const on = () => setWhenTick((n) => n + 1);
    window.addEventListener("radr-when-horizon", on);
    return () => window.removeEventListener("radr-when-horizon", on);
  }, []);

  const composed = useMemo(
    () =>
      composeControlCenter({
        profile: resolveProfile({ demoVertical: "serviced_apartments" }),
        role: roleView,
        vertical: "serviced_apartments",
        predictions,
        whenHorizon: mapDemoWhenToCockpitHorizon(readWhenHorizon()),
      }),
    [roleView, whenTick],
  );

  const openAttention = attention
    .filter((a) => !dismissed[a.id])
    .slice(0, composed.maxAttention);
  const needs = openAttention.length;
  const showFinance =
    roleView === "cfo" || roleView === "finance" || roleView === "owner";
  const showRevenue = roleView === "revenue_manager" || showFinance;
  const showOps =
    roleView === "gm" ||
    roleView === "housekeeping_manager" ||
    (!showFinance && !showRevenue);

  return (
    <div
      className="rp-hotel-glance rp-res-glance"
      aria-label="Serviced apartments Control Center"
      data-role={roleView}
    >
      <header className="rp-hotel-hero">
        <div className="rp-hotel-hero-atm" aria-hidden="true" />
        <div className="rp-hotel-hero-grid">
          <div className="rp-hotel-hero-copy">
            <p className="rp-hotel-glance-kicker">
              <i className="rp-hotel-live-dot" aria-hidden="true" />
              {showFinance
                ? "Portfolio · Contribution · Demo"
                : showRevenue
                  ? "Commercial · Pace · Demo"
                  : "Operations · Turnovers · Demo"}
            </p>
            <h1 className="rp-hotel-glance-title">{LISBON_RESIDENCES.name}</h1>
            <p className="rp-hotel-glance-lead">
              {composed.primaryResponsibility}. {pulse.checkIns} check-ins ·{" "}
              {pulse.checkOuts} check-outs · {pulse.turnovers} turnovers
            </p>
            <p className="rp-hotel-hero-place">
              {LISBON_RESIDENCES.street} · {LISBON_RESIDENCES.city} ·{" "}
              {LISBON_RESIDENCES.units} units
            </p>
          </div>
          <div className="rp-hotel-hero-stat">
            <strong>{pulse.occupancyPct}%</strong>
            <span>Occupancy</span>
            <em>
              ADR €{pulse.adr} · RevPAR €{pulse.revpar}
            </em>
          </div>
        </div>
        <ul className="rp-hotel-pulse" aria-label="Residences pulse">
          <li>
            <strong>{pulse.checkIns}</strong>
            <span>Check-ins</span>
          </li>
          <li>
            <strong>{pulse.checkOuts}</strong>
            <span>Check-outs</span>
          </li>
          <li data-tone={pulse.unitsDelayed > 0 ? "watch" : "ok"}>
            <strong>{pulse.turnovers}</strong>
            <span>Turnovers</span>
          </li>
          <li data-tone={pulse.unitsDelayed > 0 ? "watch" : "ok"}>
            <strong>
              {pulse.unitsReady}
              <i>/{LISBON_RESIDENCES.units}</i>
            </strong>
            <span>Ready</span>
          </li>
          <li>
            <strong>{pulse.orphanNights}</strong>
            <span>Orphan</span>
          </li>
          <li>
            <strong>{pulse.directSharePct}%</strong>
            <span>Direct</span>
          </li>
        </ul>
      </header>

      {showFinance ? (
        <section className="rp-hotel-overnight" aria-label="Contribution">
          <p className="rp-hotel-sec-label">Contribution snapshot · DEMO</p>
          <div className="rp-hotel-yesterday">
            <p className="rp-hotel-yesterday-main">
              Revenue quality · Direct {pulse.directSharePct}% ·{" "}
              <strong>{formatEuro(pulse.verifiedToday)}</strong> verified today
            </p>
            <p className="rp-hotel-yesterday-meta">
              Avg LOS {pulse.avgLos} · Maintenance blocks {pulse.unitsMaintenance}{" "}
              · Orphan night €{orphan.euro} at stake
            </p>
          </div>
        </section>
      ) : null}

      {moduleEnabled(composed, "attention") || showOps || showRevenue ? (
        <section className="rp-hotel-attn" aria-label="What needs you">
          <p className="rp-hotel-sec-label">
            {needs === 0
              ? "Nothing needs you"
              : `${needs} thing${needs === 1 ? "" : "s"} need you`}
          </p>
          <ul className="rp-hotel-attn-list">
            {openAttention.map((item, i) => (
              <li key={item.id} className="rp-hotel-attn-row">
                <p className="rp-hotel-attn-idx">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="rp-hotel-attn-main">
                  <p className="rp-hotel-attn-kicker">{item.kicker}</p>
                  <h2>{item.title}</h2>
                  <p>{item.body}</p>
                  {item.radrDid ? (
                    <p className="rp-hotel-attn-did">
                      WHAT RADR ALREADY DID · {item.radrDid}
                    </p>
                  ) : null}
                </div>
                <div className="rp-hotel-attn-money">
                  <strong>{formatEuro(item.stakeEuro)}</strong>
                  <span>{item.stakeLabel}</span>
                </div>
                <div className="rp-hotel-attn-cta">
                  <Link href={item.href} className="rp-hotel-attn-go">
                    {item.cta}
                  </Link>
                  <button
                    type="button"
                    className="rp-hotel-attn-dismiss"
                    onClick={() =>
                      setDismissed((d) => ({ ...d, [item.id]: true }))
                    }
                  >
                    Later
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {showOps ? (
        <StayArrivalsBrief
          arrivals={arrivals.filter((a) => a.unit !== "12")}
          vertical="serviced_apartments"
        />
      ) : null}

      {(moduleEnabled(composed, "orphan_nights") || showRevenue) && (
        <section className="rp-hotel-guest" aria-label="Orphan night">
          <p className="rp-hotel-sec-label">Orphan night</p>
          <ul className="rp-hotel-guest-rail">
            <li>
              <p className="rp-hotel-guest-room">Unit {orphan.unit}</p>
              <h3>
                {orphan.night} · 1 night · {formatEuro(orphan.euro)}
              </h3>
              <p>
                Historical one-night fill {(orphan.fillProbability * 100).toFixed(0)}%
              </p>
              <p className="rp-hotel-guest-opp">
                Recommendation: open 1-night stay at adjusted price
              </p>
            </li>
          </ul>
        </section>
      )}

      {moduleEnabled(composed, "predictions") ? (
        <section aria-label="Predictions">
          <p className="rp-hotel-sec-label">Predicted · DEMO</p>
          <div className="rp-pred-list">
            {predictions
              .filter(
                (p) =>
                  composed.predictionTypes.includes(p.type) ||
                  p.visibleToRoles.includes(roleView),
              )
              .map((p) => (
                <PredictionChip key={p.id} prediction={p} />
              ))}
          </div>
        </section>
      ) : null}

      {moduleEnabled(composed, "handling") || showOps ? (
        <section className="rp-hotel-handling" aria-label="Handling">
          <p className="rp-hotel-sec-label">
            RADR is handling · {pulse.radrHandling}
          </p>
          <ul className="rp-hotel-handling-list">
            {handling.map((h) => (
              <li key={h.id}>
                <strong>{h.status}</strong>
                <span>{h.label}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <HiddenSignalStrip
        title="Needs meaning · live"
        signals={composed.cockpitHiddenSignals}
        tone="cockpit"
      />
      <HiddenSignalStrip
        title="Hidden signals · insights"
        signals={composed.insightHiddenSignals}
        tone="insights"
      />

      <footer className="rp-hotel-foot">
        <p className="rp-hotel-recovery-sample">
          Unit night opened · Studio · €{orphan.euro} at risk ·{" "}
          <Link href="/app/service">Units board</Link>
        </p>
      </footer>
    </div>
  );
}
