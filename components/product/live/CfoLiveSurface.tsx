"use client";

import { useMemo, useState } from "react";
import { composeCfoLiveSurface } from "@/lib/radr/product/liveOperating";
import { getGroupDaySeries } from "@/lib/radr/product/liveFlows";
import { groupExpectedCloseForecast } from "@/lib/radr/forecast";
import { composeOperatingDay } from "@/lib/radr/product/operatingDay";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import { MoneyFlowViz } from "./LiveFlowParts";
import { PaceTrajectoryChart } from "./LiveTrajectoryChart";
import { ForecastExplain } from "./ForecastExplain";
import { OperatingCalendar } from "./OperatingCalendar";
import { DecisionFocusDrawer } from "./DecisionFocusDrawer";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { useDemoOrg } from "@/components/product/useDemoOrg";

const RESTAURANT_LOCS = [
  {
    id: DEMO_LOCATIONS.berlin.id,
    label: "Soho · New York",
    mode: "OPEN · DINNER",
    detail: "17:00–23:00 · closes 23:00",
    wave: "Peak pressure 20:10–20:35",
  },
  {
    id: "loc_hamburg_hafen",
    label: "Roma Norte · Mexico City",
    mode: "OPEN · DINNER",
    detail: "Terrace + dining",
    wave: "Cover pace ahead",
  },
] as const;

const HOTEL_LOCS = [
  {
    id: DEMO_LOCATIONS.canal.id,
    label: "Mercer House · New York",
    mode: "24/7",
    detail: "Check-in wave active",
    wave: "Arrivals · readiness",
  },
  {
    id: "loc_ams_harbour",
    label: "Sunset House · Los Angeles",
    mode: "24/7",
    detail: "Pickup strong",
    wave: "Overbook watch",
  },
] as const;

export function CfoLiveSurface({
  decisions,
}: {
  onSelectDecision?: (id: string) => void;
  decisions: NeedsYouRow[];
}) {
  const { org, isHotel } = useDemoOrg();
  const GROUP_LOCS = isHotel ? HOTEL_LOCS : RESTAURANT_LOCS;
  const cfo = useMemo(
    () => composeCfoLiveSurface(isHotel ? "hotel" : "restaurant"),
    [isHotel],
  );
  const series = useMemo(() => getGroupDaySeries(), []);
  const closeFc = useMemo(
    () => groupExpectedCloseForecast(isHotel ? "hotel" : "restaurant"),
    [isHotel],
  );
  const berlin = useMemo(
    () => composeOperatingDay(DEMO_LOCATIONS.berlin.id),
    [],
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const g = cfo.groupDay;
  const m = cfo.mtd;

  const openFocus = (id: string) => {
    setFocusId(id);
  };

  return (
    <section className="rp-cfo-live" aria-label="Group financial pulse">
      <header className="rp-oday-hero" data-pace="ahead" data-v2="true">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" aria-hidden="true" />
            <span className="rp-live-status">LIVE</span>
            {org.name}
          </p>
          <h2 className="rp-oday-time-h">
            <em>GROUP DAY</em>
            <span>
              {isHotel
                ? "Properties · one money trajectory"
                : "Locations · one money trajectory"}
            </span>
          </h2>
          <p className="rp-oday-time-now">
            <strong>Updated</strong>
            <span>1m 42s ago</span>
          </p>
        </div>

        <div className="rp-oday-hero-nums" data-secondary="true">
          <div>
            <strong>{formatDecisionMoney(g.revenueActual)}</strong>
            <span>Revenue now</span>
          </div>
          <div data-em="true">
            <strong data-semantic={g.deltaPct >= 0 ? "positive" : "negative"}>
              {g.deltaPct >= 0 ? "↑" : "↓"} {g.deltaPct >= 0 ? "+" : ""}
              {g.deltaPct}%
            </strong>
            <span>{g.deltaPct >= 0 ? "ahead of pace" : "behind pace"}</span>
          </div>
          <div>
            <ForecastExplain
              forecast={closeFc}
              compactLabel="Expected close"
            />
          </div>
          <div>
            <strong>{formatDecisionMoney(cfo.moneyFlow.contributionPace)}</strong>
            <span>Contribution pace</span>
          </div>
          <div data-em="true">
            <strong data-semantic="warning">
              {formatDecisionMoney(cfo.settlementExceptionEuro)}
            </strong>
            <span>Settlement exception</span>
          </div>
        </div>

        <ul className="rp-group-modes" aria-label="Current operating locations">
          {GROUP_LOCS.map((loc) => (
            <li key={loc.id}>
              <strong>{loc.label}</strong>
              <em>{loc.mode}</em>
              <span>{loc.detail}</span>
              <span data-wave="true">{loc.wave}</span>
            </li>
          ))}
        </ul>

        <div className="rp-oday-main">
          <div className="rp-oday-traj-col">
            <PaceTrajectoryChart
              series={series}
              ariaLabel="Group revenue trajectory"
              hero
            />
          </div>
          <aside className="rp-oday-outlook" aria-label="Group next">
            <p className="rp-live-k">Now + next</p>
            <p className="rp-live-mod-read">
              Contribution pressure remains Berlin-led. Settlement exception{" "}
              {formatDecisionMoney(cfo.settlementExceptionEuro)}.
            </p>
            <ul className="rp-oday-windows">
              {berlin.pressureWindows.slice(0, 2).map((w) => (
                <li key={w.id} data-level={w.level}>
                  <time>
                    Berlin · {w.start}–{w.end}
                  </time>
                  <strong>{w.label}</strong>
                  <span>{w.detail}</span>
                </li>
              ))}
            </ul>
            {decisions[0] ? (
              <button
                type="button"
                className="rp-oday-needs"
                onClick={() => openFocus(decisions[0]!.id)}
              >
                <em>Needs you</em>
                <strong>
                  {decisions[0].displayId} · {decisions[0].title}
                </strong>
                <span>{decisions[0].economicFormatted} · Focus →</span>
              </button>
            ) : null}
          </aside>
        </div>
      </header>

      <div className="rp-cfo-secondary">
        <MoneyFlowViz data={cfo.moneyFlow} title="Group money flow" />
        <section className="rp-live-mod">
          <p className="rp-live-k">MTD → month-end</p>
          <div className="rp-live-hero-nums" data-cols="3">
            <div>
              <strong>{formatDecisionMoney(m.revenueMTD)}</strong>
              <span>Revenue MTD</span>
            </div>
            <div>
              <strong>{formatDecisionMoney(m.revenueForecastMonthEnd)}</strong>
              <span>Month-end forecast</span>
            </div>
            <div>
              <strong>{formatDecisionMoney(m.contributionMTD)}</strong>
              <span>Contribution MTD</span>
            </div>
          </div>
        </section>
      </div>

      <OperatingCalendar
        locationId="all"
        defaultRange="month"
        onReplayDecision={openFocus}
      />

      <DecisionFocusDrawer
        decisionId={focusId}
        row={
          decisions.find((d) => d.id === focusId) ??
          (focusId === DECISION_IDS.peak ? decisions[0] : null)
        }
        onClose={() => setFocusId(null)}
      />
    </section>
  );
}
