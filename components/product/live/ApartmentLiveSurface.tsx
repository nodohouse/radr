"use client";

import { useMemo, useState } from "react";
import { getApartmentDayPace } from "@/lib/radr/product/revenuePacing";
import {
  getApartmentMoneyFlow,
  getResourceSignals,
} from "@/lib/radr/product/liveFlows";
import { composeOperatingDay } from "@/lib/radr/product/operatingDay";
import { shapingTodayForLocation } from "@/lib/radr/context";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { MoneyFlowViz, ResourceWatchPanel } from "./LiveFlowParts";
import { OperatingDayChart } from "./OperatingDayChart";
import { OperatingCalendar } from "./OperatingCalendar";
import { DecisionFocusDrawer } from "./DecisionFocusDrawer";
import { ShapingTodayModule } from "./ShapingTodayModule";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";

export function ApartmentLiveSurface({
  decisions,
}: {
  day?: unknown;
  decisions: NeedsYouRow[];
  onSelectDecision?: (id: string) => void;
}) {
  const pace = useMemo(() => getApartmentDayPace(), []);
  const money = useMemo(() => getApartmentMoneyFlow(), []);
  const resources = useMemo(() => getResourceSignals("apartment"), []);
  const od = useMemo(
    () => composeOperatingDay(DEMO_LOCATIONS.chiado.id),
    [],
  );
  const shaping = useMemo(
    () => shapingTodayForLocation(DEMO_LOCATIONS.chiado.id),
    [],
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const st = od.status;

  const openFocus = (id: string) => setFocusId(id);

  return (
    <section className="rp-live-cmd" aria-label="Apartment live · turnover day">
      <header className="rp-oday-hero" data-pace={st.pace} data-v2="true">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" aria-hidden="true" />
            <span className="rp-live-status">LIVE</span>
            {pace.locationLabel}
          </p>
          <h2 className="rp-oday-time-h">
            <em>TURNOVER WINDOW</em>
            <span>Departures → Cleaning → Ready → Arrivals</span>
          </h2>
          <p className="rp-oday-time-now">
            <strong>{pace.clockLabel}</strong>
            <span>NOW</span>
            <em>24/7</em>
          </p>
          <p className="rp-oday-pace" data-pace={st.pace}>
            {pace.occupancyPct}% occupied
            <span>
              {pace.turnovers} turnovers · {pace.cleaningBehind} behind SLA
            </span>
            {st.nextPressureLabel ? (
              <span data-semantic="warning">△ {st.nextPressureLabel}</span>
            ) : null}
          </p>
        </div>
        <div className="rp-oday-hero-nums" data-secondary="true">
          <div>
            <strong>{formatDecisionMoney(pace.revenueActualNow)}</strong>
            <span>Revenue now</span>
          </div>
          <div data-em="true">
            <strong
              data-semantic={
                pace.deltaPctVsExpected >= 0 ? "positive" : "negative"
              }
            >
              {pace.deltaPctVsExpected >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(pace.deltaPctVsExpected)}%
            </strong>
            <span>vs expected</span>
          </div>
          <div data-em={pace.gapNights > 0 ? "true" : undefined}>
            <strong>{pace.gapNights}</strong>
            <span>Gap nights</span>
          </div>
        </div>

        <div className="rp-oday-main">
          <div className="rp-oday-traj-col">
            <OperatingDayChart
              series={od.series}
              periods={od.periods}
              markers={od.markers}
              heatStrip={od.heatStrip}
              clockLabel={pace.clockLabel}
              onSelectDecision={openFocus}
              selectedDecisionId={focusId}
            />
          </div>
          <aside className="rp-oday-outlook" aria-label="Turnover outlook">
            <p className="rp-live-k">Turnover windows</p>
            <ul className="rp-oday-windows">
              {od.pressureWindows.map((w) => (
                <li key={w.id} data-level={w.level}>
                  <time>
                    {w.start}–{w.end}
                  </time>
                  <strong>{w.label}</strong>
                  <span>{w.detail}</span>
                  {w.risk ? <p data-risk="true">{w.risk}</p> : null}
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
                <strong>{decisions[0].recommendation}</strong>
                <span>{decisions[0].economicFormatted}</span>
              </button>
            ) : null}
          </aside>
        </div>
      </header>

      <div className="rp-oday-nerve">
        <ShapingTodayModule data={shaping} />
      </div>

      <div className="rp-live-row2">
        <MoneyFlowViz data={money} title="Apartment money flow" />
        <ResourceWatchPanel resources={resources} />
      </div>

      <OperatingCalendar
        locationId={DEMO_LOCATIONS.chiado.id}
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
