"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CANAL_HOUSE,
  canalHouseAttention,
  canalHouseHandling,
  canalHouseInHouse,
  canalHouseOvernight,
  canalHousePredictions,
  canalHouseStayArrivals,
  canalHouseTonight,
  canalHouseYesterday,
  formatHotelRecoveryOpened,
} from "@/lib/radr/demo/canalHouseAmsterdam";
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
 * Boutique hotel Control Center — role-aware DEMO house brief.
 */
export function HotelGlanceBoard() {
  const { roleView } = useProduct();
  const pulse = canalHouseTonight();
  const yesterday = canalHouseYesterday();
  const overnight = canalHouseOvernight();
  const inHouse = canalHouseInHouse();
  const attention = canalHouseAttention();
  const arrivals = useMemo(() => canalHouseStayArrivals(), []);
  const handling = canalHouseHandling();
  const predictions = canalHousePredictions();
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
        profile: resolveProfile({ demoVertical: "boutique_hotel" }),
        role: roleView,
        vertical: "boutique_hotel",
        predictions,
        whenHorizon: mapDemoWhenToCockpitHorizon(readWhenHorizon()),
      }),
    [roleView, whenTick],
  );

  const openAttention = attention
    .filter((a) => !dismissed[a.id])
    .slice(0, composed.maxAttention);
  const needs = openAttention.length;
  const isRevenue = roleView === "revenue_manager";
  const isHk = roleView === "housekeeping_manager";
  const isFinance =
    roleView === "cfo" || roleView === "finance" || roleView === "owner";
  const isGm = roleView === "hotel_gm" || (!isRevenue && !isHk && !isFinance);

  const visiblePredictions = predictions.filter(
    (p) =>
      composed.predictionTypes.includes(p.type) ||
      p.visibleToRoles.includes(roleView),
  );

  const kicker = isFinance
    ? "Finance · Contribution · Demo"
    : isRevenue
      ? "Revenue · Pace · Demo"
      : isHk
        ? "Housekeeping · Readiness · Demo"
        : "Start of day · House brief · Demo";

  return (
    <div
      className="rp-hotel-glance"
      aria-label="Boutique hotel Control Center"
      data-role={roleView}
    >
      <header className="rp-hotel-hero">
        <div className="rp-hotel-hero-atm" aria-hidden="true" />
        <div className="rp-hotel-hero-grid">
          <div className="rp-hotel-hero-copy">
            <p className="rp-hotel-glance-kicker">
              <i className="rp-hotel-live-dot" aria-hidden="true" />
              {kicker}
            </p>
            <h1 className="rp-hotel-glance-title">{CANAL_HOUSE.name}</h1>
            <p className="rp-hotel-glance-lead">
              {composed.primaryResponsibility}.{" "}
              {isHk
                ? `${pulse.departures} departures · ${pulse.roomsDelayed} at risk · next arrival 14:30`
                : isRevenue
                  ? `Pickup tomorrow ${pulse.pickupTomorrow} · Direct ${pulse.directSharePct}% · ${pulse.roomsOpenTonight} open tonight`
                  : isFinance
                    ? `Occupancy strong · watch distribution cost · ${formatEuro(pulse.verifiedToday)} verified`
                    : `${pulse.inHouseGuests} guests in-house · ${pulse.arrivals} arriving · ${pulse.departures} departing`}
            </p>
            <p className="rp-hotel-hero-place">
              {CANAL_HOUSE.street} · {CANAL_HOUSE.city} · {CANAL_HOUSE.rooms}{" "}
              rooms
            </p>
          </div>
          <div className="rp-hotel-hero-stat" aria-label="Primary metric">
            <strong>
              {isHk
                ? `${pulse.roomsReady}`
                : isRevenue
                  ? `€${pulse.revpar}`
                  : `${pulse.occupancyPct}%`}
            </strong>
            <span>
              {isHk ? "Ready" : isRevenue ? "RevPAR" : "Occupancy"}
            </span>
            <em>
              {isHk
                ? `${pulse.roomsDelayed} delayed · ${pulse.roomsCleaning} cleaning`
                : `ADR €${pulse.adr} · Direct ${pulse.directSharePct}%`}
            </em>
          </div>
        </div>

        <ul className="rp-hotel-pulse" aria-label="House pulse">
          {isHk ? (
            <>
              <li>
                <strong>{pulse.departures}</strong>
                <span>Departures</span>
              </li>
              <li>
                <strong>{pulse.arrivals}</strong>
                <span>Arrivals</span>
              </li>
              <li data-tone="watch">
                <strong>{pulse.roomsDelayed}</strong>
                <span>Delayed</span>
              </li>
              <li>
                <strong>{pulse.roomsCleaning}</strong>
                <span>Cleaning</span>
              </li>
              <li>
                <strong>{pulse.roomsReady}</strong>
                <span>Ready</span>
              </li>
              <li>
                <strong>{CANAL_HOUSE.rooms}</strong>
                <span>Total</span>
              </li>
            </>
          ) : isRevenue ? (
            <>
              <li>
                <strong>{pulse.occupancyPct}%</strong>
                <span>Occupancy</span>
              </li>
              <li>
                <strong>€{pulse.adr}</strong>
                <span>ADR</span>
              </li>
              <li>
                <strong>€{pulse.revpar}</strong>
                <span>RevPAR</span>
              </li>
              <li>
                <strong>{pulse.pickupTomorrow}</strong>
                <span>Pickup</span>
              </li>
              <li>
                <strong>{pulse.directSharePct}%</strong>
                <span>Direct</span>
              </li>
              <li>
                <strong>{pulse.roomsOpenTonight}</strong>
                <span>Open tonight</span>
              </li>
            </>
          ) : isFinance ? (
            <>
              <li>
                <strong>{pulse.occupancyPct}%</strong>
                <span>Occupancy</span>
              </li>
              <li>
                <strong>€{pulse.adr}</strong>
                <span>ADR</span>
              </li>
              <li>
                <strong>€{pulse.revpar}</strong>
                <span>RevPAR</span>
              </li>
              <li>
                <strong>{pulse.directSharePct}%</strong>
                <span>Direct</span>
              </li>
              <li>
                <strong>{formatEuro(pulse.verifiedToday)}</strong>
                <span>Verified</span>
              </li>
              <li>
                <strong>{pulse.roomsOpenTonight}</strong>
                <span>At risk</span>
              </li>
            </>
          ) : (
            <>
              <li>
                <strong>{pulse.arrivals}</strong>
                <span>Arrivals</span>
              </li>
              <li>
                <strong>{pulse.departures}</strong>
                <span>Departures</span>
              </li>
              <li data-tone={pulse.roomsDelayed > 0 ? "watch" : "ok"}>
                <strong>
                  {pulse.roomsReady}
                  <i>/{CANAL_HOUSE.rooms}</i>
                </strong>
                <span>Ready</span>
              </li>
              <li>
                <strong>{pulse.pickupTomorrow}</strong>
                <span>Tomorrow</span>
              </li>
              <li>
                <strong>€{pulse.adr}</strong>
                <span>ADR</span>
              </li>
              <li>
                <strong>{pulse.directSharePct}%</strong>
                <span>Direct</span>
              </li>
            </>
          )}
        </ul>
      </header>

      {isGm && moduleEnabled(composed, "overnight") ? (
        <div className="rp-hotel-split">
          <section className="rp-hotel-overnight" aria-label="Since last check">
            <p className="rp-hotel-sec-label">Since last check</p>
            <div className="rp-hotel-yesterday">
              <p className="rp-hotel-yesterday-main">
                Yesterday · {yesterday.occupancyPct}% · ADR €{yesterday.adr} ·{" "}
                <strong>{formatEuro(yesterday.verifiedEuro)}</strong> verified
              </p>
              <p className="rp-hotel-yesterday-meta">
                {yesterday.guestMessagesHandled} messages ·{" "}
                {yesterday.incidentsHandled} incident absorbed · Reviews{" "}
                {yesterday.reviews.score}/10
              </p>
              <blockquote className="rp-hotel-review">
                {yesterday.reviews.highlight}
              </blockquote>
            </div>
            <ol className="rp-hotel-overnight-list">
              {overnight.map((o) => (
                <li key={o.id} data-tone={o.tone}>
                  <time>{o.time}</time>
                  <div>
                    <strong>{o.title}</strong>
                    <p>{o.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="rp-hotel-inhouse" aria-label="In the house now">
            <p className="rp-hotel-sec-label">In the house now</p>
            <ul className="rp-hotel-inhouse-list">
              {inHouse.map((g) => (
                <li
                  key={g.id}
                  data-kind={g.room === "—" ? "inventory" : "guest"}
                >
                  <div className="rp-hotel-inhouse-top">
                    <p className="rp-hotel-guest-room">
                      {g.room === "—" ? "Inventory" : `Room ${g.room}`}
                    </p>
                    {g.nightsLeft > 0 ? (
                      <span className="rp-hotel-inhouse-nights">
                        {g.nightsLeft}n left
                      </span>
                    ) : (
                      <span className="rp-hotel-inhouse-nights">Departing</span>
                    )}
                  </div>
                  <h3>{g.name}</h3>
                  <p className="rp-hotel-inhouse-flags">{g.flags.join(" · ")}</p>
                  <p>{g.note}</p>
                  <p className="rp-hotel-inhouse-why">{g.whyItMatters}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}

      {moduleEnabled(composed, "attention") || needs > 0 ? (
        <section className="rp-hotel-attn" aria-label="What needs you">
          <div className="rp-hotel-attn-head">
            <p className="rp-hotel-sec-label">
              {needs === 0
                ? "Nothing needs you"
                : `${needs} thing${needs === 1 ? "" : "s"} need you`}
            </p>
            {needs > 0 ? (
              <p className="rp-hotel-attn-sub">
                Judgment only · rest is handled
              </p>
            ) : null}
          </div>
          <ul className="rp-hotel-attn-list">
            {openAttention
              .filter((item) => {
                if (isHk) return item.territory === "LABOR";
                if (isRevenue) return item.territory === "RECOVER";
                if (isFinance) return true;
                return true;
              })
              .map((item, i) => (
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

      {moduleEnabled(composed, "predictions") && visiblePredictions.length > 0 ? (
        <section aria-label="Predictions">
          <p className="rp-hotel-sec-label">Predicted · DEMO</p>
          <div className="rp-pred-list">
            {visiblePredictions.map((p) => (
              <PredictionChip key={p.id} prediction={p} />
            ))}
          </div>
        </section>
      ) : null}

      {(isGm || isHk) && moduleEnabled(composed, "handling") ? (
        <section className="rp-hotel-handling" aria-label="What RADR is handling">
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

      {isGm && moduleEnabled(composed, "arrival_moments") ? (
        <StayArrivalsBrief
          arrivals={arrivals.filter((a) => a.unit !== "TBD")}
          vertical="boutique_hotel"
        />
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
        {(isGm || isHk) && moduleEnabled(composed, "property_units") ? (
          <ul className="rp-hotel-unit-strip" aria-label="Property units">
            <li data-tone="watch">
              <em>Rooms</em>
              <strong>{pulse.roomsDelayed} not ready</strong>
            </li>
            <li data-tone="ok">
              <em>Restaurant</em>
              <strong>Healthy</strong>
            </li>
            <li data-tone="ok">
              <em>Bar</em>
              <strong>Healthy</strong>
            </li>
            <li data-tone="watch">
              <em>Housekeeping</em>
              <strong>{pulse.departures} checkouts</strong>
            </li>
          </ul>
        ) : null}
        <p className="rp-hotel-recovery-sample">
          {formatHotelRecoveryOpened({
            roomType: "Deluxe King",
            nights: 1,
            euro: 420,
          })}
          {" · "}
          <Link href="/app/service?recover=deluxe">Recover</Link>
          {" · "}
          <Link href="/app/service">Rooms board</Link>
        </p>
      </footer>
    </div>
  );
}
