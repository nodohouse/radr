"use client";

/**
 * Hotel Live — 24h operating day.
 * density=focus: trajectory + Needs You + readiness + exceptions above the fold;
 * ROOMS / CHANNEL / MONEY / HISTORY in depth tabs.
 */

import { useMemo, useState } from "react";
import { getHotelDayPace } from "@/lib/radr/product/revenuePacing";
import {
  getHotelMoneyFlow,
  getHotelRoomInventory,
  getHotelTopSellers,
  getResourceSignals,
} from "@/lib/radr/product/liveFlows";
import { composeOperatingDay } from "@/lib/radr/product/operatingDay";
import { shapingTodayForLocation } from "@/lib/radr/context";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { HOTEL_LIVE_SCENARIO } from "@/lib/radr/demoClock";
import { executiveCompressionLine } from "@/lib/radr/intelligence/finding";
import {
  hotelNeedsYouDecisions,
  hotelHandlingDecisions,
} from "@/lib/radr/demo/hotelDecisions";
import { canalHouseLive } from "@/lib/radr/demo/hotelDataset";
import { MoneyFlowViz, ResourceWatchPanel } from "./LiveFlowParts";
import { OperatingDayChart } from "./OperatingDayChart";
import { OperatingCalendar } from "./OperatingCalendar";
import { DecisionFocusDrawer } from "./DecisionFocusDrawer";
import { ShapingTodayModule } from "./ShapingTodayModule";
import { HotelReadinessFlow } from "./HotelReadinessFlow";
import { HotelBookingPace } from "@/components/product/hotel/HotelBookingPace";
import { HotelDistributionViz } from "@/components/product/hotel/HotelDistributionViz";
import "@/components/product/control-center/hotel-cockpit.css";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";

type DepthTab = "rooms" | "channel" | "money" | "history";

export function HotelLiveSurface({
  decisions,
  onSelectDecision,
  density = "full",
}: {
  day?: unknown;
  decisions: NeedsYouRow[];
  onSelectDecision?: (id: string) => void;
  density?: "full" | "focus";
}) {
  const pace = useMemo(() => getHotelDayPace(), []);
  const money = useMemo(() => getHotelMoneyFlow(), []);
  const rooms = useMemo(() => getHotelRoomInventory(), []);
  const tops = useMemo(() => getHotelTopSellers(), []);
  const resources = useMemo(() => getResourceSignals("hotel"), []);
  const od = useMemo(
    () => composeOperatingDay(DEMO_LOCATIONS.canal.id),
    [],
  );
  const shaping = useMemo(
    () => shapingTodayForLocation(DEMO_LOCATIONS.canal.id),
    [],
  );
  const [focusId, setFocusId] = useState<string | null>(null);
  const [depthTab, setDepthTab] = useState<DepthTab>("rooms");
  const st = od.status;
  const focus = density === "focus";
  const hotelNeeds = hotelNeedsYouDecisions();
  const hotelHandling = hotelHandlingDecisions();
  const hotelLive = canalHouseLive();
  const needJudgment = hotelNeeds.length;
  const hotelAttention =
    needJudgment === 0
      ? "Clear"
      : `${needJudgment} signal${needJudgment === 1 ? "" : "s"} need${needJudgment === 1 ? "s" : ""} your judgment`;
  const hotelCompression = executiveCompressionLine({
    withinExpectation: Math.max(0, hotelLive.arrivals - needJudgment - 1),
    handling: Math.max(hotelHandling.length, 1),
    watching: 1,
    needJudgment,
  })
    .replace(/within expectation \/ no action/gi, "cleared")
    .replace(/\bno action\b/gi, "cleared")
    .replace(/\s*·\s*\d+\s+need judgment\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const openFocus = (id: string) => {
    setFocusId(id);
    onSelectDecision?.(id);
  };

  const pressureRooms = rooms.filter((r) => r.pressure);
  const channelRows = money.sources.map((s) => ({
    label: s.label,
    amount: s.amount,
    evidence: s.evidence,
  }));

  return (
    <section
      className="rp-live-cmd"
      data-density={density}
      aria-label="Hotel live · 24/7"
    >
      <header className="rp-oday-hero" data-pace={st.pace} data-v2="true">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" aria-hidden="true" />
            <span className="rp-live-status">LIVE</span>
          </p>
          <h2 className="rp-oday-time-h">
            <em>24H OPERATION</em>
            <span>00:00–24:00</span>
          </h2>
          <p className="rp-oday-time-now">
            <strong>{pace.clockLabel}</strong>
            <span>NOW</span>
            <em>{HOTEL_LIVE_SCENARIO.waveLabel} CHECK-IN WAVE</em>
          </p>
          <p className="rp-oday-pace" data-pace={st.pace}>
            {pace.status === "BEHIND" ? "Behind" : "Ahead"}
            <span>
              Occupancy {pace.occupancyPct}% · ADR{" "}
              {formatDecisionMoney(pace.adr)} · RevPAR{" "}
              {formatDecisionMoney(pace.revpar)}
            </span>
            {st.nextPressureAt ? (
              <span data-semantic="warning">△ {st.nextPressureLabel}</span>
            ) : null}
          </p>
        </div>
        <div className="rp-oday-hero-nums" data-secondary="true">
          <div>
            <strong>{formatDecisionMoney(pace.revenueActualNow)}</strong>
            <span>Rooms revenue now</span>
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
            <span>vs expected now</span>
          </div>
          <div>
            <strong>
              {pace.roomsReady}/{pace.arrivals}
            </strong>
            <span>Ready · {pace.roomsAtRisk} at risk</span>
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

          {!focus ? (
            <aside className="rp-oday-outlook" aria-label="Hotel outlook">
              <p className="rp-live-k">Operational waves</p>
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
          ) : (
            <aside
              className="rp-oday-outlook"
              data-fold-hide="true"
              aria-hidden="true"
            />
          )}
        </div>
      </header>

      {focus ? (
        <div className="rp-live-focus-fold">
          <p className="rp-oday-attention" data-density="focus">
            <strong>{hotelAttention}</strong>
            <span aria-hidden="true"> · </span>
            {hotelCompression}
          </p>
          <HotelReadinessFlow />

          {decisions.length > 0 ? (
            <section aria-label="Needs you">
              <p className="rp-live-k">Needs you</p>
              <ul className="rp-live-focus-needs">
                {decisions.slice(0, 3).map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="rp-oday-needs"
                      onClick={() => openFocus(d.id)}
                    >
                      <em>Needs you</em>
                      <strong>{d.recommendation}</strong>
                      <span>{d.economicFormatted}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section
            className="rp-live-focus-exceptions"
            aria-label="Capacity and staffing exceptions"
          >
            <p className="rp-live-k">Exceptions</p>
            {pressureRooms.length > 0 ? (
              <ul className="rp-hotel-inv">
                {pressureRooms.map((r) => (
                  <li key={r.roomType} data-pressure="true">
                    <strong>{r.roomType}</strong>
                    <span>
                      {r.notReady} not ready · {r.arrivalsRemaining} arrivals
                      left
                    </span>
                    <em>INVENTORY PRESSURE</em>
                  </li>
                ))}
              </ul>
            ) : null}
            <ResourceWatchPanel resources={resources} />
          </section>

          <ShapingTodayModule data={shaping} vertical="hotel" />
        </div>
      ) : (
        <>
          <div className="rp-oday-nerve">
            <HotelReadinessFlow />
            <ShapingTodayModule data={shaping} vertical="hotel" />
          </div>
        </>
      )}

      <HotelDepthTabs
        focus={focus}
        depthTab={depthTab}
        setDepthTab={setDepthTab}
        money={money}
        rooms={rooms}
        tops={tops}
        resources={resources}
        channelRows={channelRows}
        pace={pace}
        pressureWindows={od.pressureWindows}
        openFocus={openFocus}
      />

      <DecisionFocusDrawer
        decisionId={focusId}
        row={decisions.find((d) => d.id === focusId) ?? null}
        onClose={() => setFocusId(null)}
      />
    </section>
  );
}

function HotelDepthTabs({
  focus,
  depthTab,
  setDepthTab,
  money,
  rooms,
  tops,
  resources,
  channelRows,
  pace,
  pressureWindows,
  openFocus,
}: {
  focus: boolean;
  depthTab: DepthTab;
  setDepthTab: (t: DepthTab) => void;
  money: ReturnType<typeof getHotelMoneyFlow>;
  rooms: ReturnType<typeof getHotelRoomInventory>;
  tops: ReturnType<typeof getHotelTopSellers>;
  resources: ReturnType<typeof getResourceSignals>;
  channelRows: { label: string; amount: number; evidence: string }[];
  pace: ReturnType<typeof getHotelDayPace>;
  pressureWindows: ReturnType<typeof composeOperatingDay>["pressureWindows"];
  openFocus: (id: string) => void;
}) {
  const tabs: { id: DepthTab; label: string }[] = [
    { id: "rooms", label: "Rooms" },
    { id: "channel", label: "Channel" },
    { id: "money", label: "Money" },
    { id: "history", label: "History" },
  ];

  if (!focus) {
    return (
      <HotelLiveDepth
        money={money}
        rooms={rooms}
        tops={tops}
        resources={resources}
        openFocus={openFocus}
      />
    );
  }

  return (
    <>
      <nav className="rp-live-depth-tabs" aria-label="Hotel live depth">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            data-active={depthTab === t.id ? "true" : undefined}
            onClick={() => setDepthTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <div className="rp-live-depth-panel">
        {depthTab === "rooms" ? (
          <>
            <section className="rp-live-mod rp-live-mod-viz">
              <HotelBookingPace onSelectDecision={openFocus} />
            </section>
            <section className="rp-live-mod">
              <p className="rp-live-k">Room inventory</p>
              <ul className="rp-hotel-inv">
                {rooms.map((r) => (
                  <li
                    key={r.roomType}
                    data-pressure={r.pressure ? "true" : undefined}
                  >
                    <strong>{r.roomType}</strong>
                    <span>
                      {r.sellableRemaining} sellable · {r.arrivalsRemaining}{" "}
                      arrivals · {r.notReady} not ready
                    </span>
                    {r.pressure ? <em>INVENTORY PRESSURE</em> : null}
                  </li>
                ))}
              </ul>
            </section>
            <section className="rp-live-mod">
              <p className="rp-live-k">Packages · upsells tonight</p>
              <ul className="rp-hotel-tops">
                {tops.map((t) => (
                  <li key={t.id}>
                    <strong>{t.label}</strong>
                    <em>{formatDecisionMoney(t.revenue)}</em>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}
        {depthTab === "channel" ? (
          <section className="rp-live-mod rp-live-mod-viz">
            <HotelDistributionViz onSelectDecision={openFocus} />
            <p className="rp-live-mod-read">
              OTA commission accrued {formatDecisionMoney(money.otaCommission)} ·
              Direct share {pace.drivers[0]?.value ?? "—"}
            </p>
          </section>
        ) : null}
        {depthTab === "money" ? (
          <MoneyFlowViz data={money} title="Hotel money flow" />
        ) : null}
        {depthTab === "history" ? (
          <>
            <section className="rp-live-mod">
              <p className="rp-live-k">Operational waves</p>
              <ul className="rp-oday-windows">
                {pressureWindows.map((w) => (
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
            </section>
            <OperatingCalendar
              locationId={DEMO_LOCATIONS.canal.id}
              defaultRange="month"
              onReplayDecision={openFocus}
            />
          </>
        ) : null}
      </div>
    </>
  );
}

function HotelLiveDepth({
  money,
  rooms,
  tops,
  resources,
  openFocus,
}: {
  money: ReturnType<typeof getHotelMoneyFlow>;
  rooms: ReturnType<typeof getHotelRoomInventory>;
  tops: ReturnType<typeof getHotelTopSellers>;
  resources: ReturnType<typeof getResourceSignals>;
  openFocus: (id: string) => void;
}) {
  return (
    <>
      <div className="rp-live-row2">
        <section className="rp-live-mod rp-live-mod-viz">
          <HotelBookingPace compact onSelectDecision={openFocus} />
        </section>
        <section className="rp-live-mod rp-live-mod-viz">
          <HotelDistributionViz compact onSelectDecision={openFocus} />
        </section>
      </div>

      <div className="rp-live-row2">
        <MoneyFlowViz data={money} title="Hotel money flow" />
        <section className="rp-live-mod">
          <p className="rp-live-k">Room inventory</p>
          <ul className="rp-hotel-inv">
            {rooms.map((r) => (
              <li
                key={r.roomType}
                data-pressure={r.pressure ? "true" : undefined}
              >
                <strong>{r.roomType}</strong>
                <span>
                  {r.sellableRemaining} sellable · {r.arrivalsRemaining}{" "}
                  arrivals · {r.notReady} not ready
                </span>
                {r.pressure ? <em>INVENTORY PRESSURE</em> : null}
              </li>
            ))}
          </ul>
          <ResourceWatchPanel resources={resources} />
        </section>
      </div>

      <section className="rp-live-mod">
        <p className="rp-live-k">Top tonight · rooms & packages</p>
        <ul className="rp-hotel-tops">
          {tops.map((t) => (
            <li key={t.id}>
              <strong>{t.label}</strong>
              <em>{formatDecisionMoney(t.revenue)}</em>
            </li>
          ))}
        </ul>
      </section>

      <OperatingCalendar
        locationId={DEMO_LOCATIONS.canal.id}
        defaultRange="month"
        onReplayDecision={openFocus}
      />
    </>
  );
}
