"use client";

/**
 * GM Live — operating day as the nervous system.
 * First question: Where in the operating day are we?
 * SEE → PREDICT → DECIDE on one timeline.
 */

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  composeLiveOperatingSurface,
  getBestsellersForPeriod,
  paceHeadline,
  type BestsellerPeriod,
  type LiveHorizon,
} from "@/lib/radr/product/liveOperating";
import {
  composeOperatingDay,
  remainingServiceLabel,
} from "@/lib/radr/product/operatingDay";
import { berlinExpectedCloseForecast } from "@/lib/radr/forecast";
import { shapingTodayForLocation } from "@/lib/radr/context";
import { berlinPeakStaffingGap } from "@/lib/radr/workforce";
import {
  berlinAttentionBudget,
  plainLine,
} from "@/lib/radr/product/roleTranslation";
import { executiveCompressionLine } from "@/lib/radr/intelligence/finding";
import { selectNeedsJudgmentCount } from "@/lib/radr/product/selectNeedsJudgment";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { useProduct } from "@/lib/product/store";
import { ForecastExplain } from "./ForecastExplain";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { OperatingDayChart } from "./OperatingDayChart";
import { OperatingCalendar } from "./OperatingCalendar";
import { DecisionFocusDrawer } from "./DecisionFocusDrawer";
import { ShapingTodayModule } from "./ShapingTodayModule";
import { WorkforceOutlookModule } from "./WorkforceOutlookModule";
import { TonightMoversPanel } from "./TonightMoversPanel";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  MoneyFlowViz,
  OrdersNowPanel,
  DeliveryStreamCard,
  StockWatchPanel,
  SinceChangedStrip,
  OrderRateMini,
  CancellationFlowViz,
  CoverFlowViz,
  SourceFreshnessStrip,
  ResourceWatchPanel,
} from "./LiveFlowParts";
import type { NeedsYouRow } from "@/lib/radr/product/controlCenterMetrics";
import { useDemoServicePhase } from "@/components/product/useDemoServicePhase";
import { getRadrEnvironment, isSyntheticData } from "@/lib/radr/env";
import { LiveShiftPhaseBar } from "./LiveShiftPhaseBar";
import { PreShiftLiveSurface } from "./PreShiftLiveSurface";
import { PostShiftLiveSurface } from "./PostShiftLiveSurface";

const HORIZONS: { id: LiveHorizon; label: string }[] = [
  { id: "60m", label: "NOW → 60M" },
  { id: "3h", label: "NEXT 3H" },
  { id: "close", label: "TO CLOSE" },
];

type MobileTab = "day" | "context" | "people" | "depth" | "history";
type FocusDepthTab = "service" | "menu" | "money" | "history";

export function LiveCommandSurface({
  onSelectDecision,
  decisions,
  density = "full",
}: {
  onSelectDecision?: (id: string) => void;
  decisions: NeedsYouRow[];
  /** focus = Control Center Focus Mode — trajectory + judgment only */
  density?: "full" | "focus";
}) {
  const { roleView } = useProduct();
  const { session, isHotel } = useDemoOrg();
  const synthetic = isSyntheticData(getRadrEnvironment());
  const { phase, setPhase } = useDemoServicePhase(synthetic);
  const surface = useMemo(() => composeLiveOperatingSurface(), []);
  const day = useMemo(() => composeOperatingDay(), []);
  const closeFc = useMemo(() => berlinExpectedCloseForecast(), []);
  const shaping = useMemo(
    () => shapingTodayForLocation(day.locationId),
    [day.locationId],
  );
  const staffing = useMemo(() => berlinPeakStaffingGap(), []);
  const { service: live } = surface;
  const [horizon, setHorizon] = useState<LiveHorizon>("3h");
  const [mobileTab, setMobileTab] = useState<MobileTab>("day");
  const [menuPeriod, setMenuPeriod] = useState<BestsellerPeriod>("tonight");
  const [focusId, setFocusId] = useState<string | null>(null);
  const [focusDepthTab, setFocusDepthTab] = useState<FocusDepthTab>("service");
  const bestsellers = useMemo(
    () => getBestsellersForPeriod(menuPeriod),
    [menuPeriod],
  );
  const proj = surface.horizons[horizon === "2h" ? "3h" : horizon];
  const peakDecision =
    decisions.find((d) => d.id === DECISION_IDS.peak) ??
    decisions[0] ??
    null;
  const needsDecisionId =
    peakDecision?.id ?? live.relatedDecisionId ?? null;
  const needsRecommendation =
    peakDecision?.recommendation ??
    (needsDecisionId === DECISION_IDS.peak ? "Wait 12 minutes" : null);
  const needsEconomic =
    peakDecision?.economicFormatted ??
    (needsDecisionId === DECISION_IDS.peak ? "€620" : null);
  const materialSignal = surface.stock.items[0];
  const st = day.status;
  const needJudgment = selectNeedsJudgmentCount({
    role: roleView,
    vertical: isHotel ? "hotel" : session.vertical,
  });
  const attention = berlinAttentionBudget({
    needJudgment,
  });
  const compression = executiveCompressionLine({
    withinExpectation: 141,
    handling: 1,
    watching: 1,
    needJudgment,
  })
    .replace(/within expectation \/ no action/gi, "cleared")
    .replace(/\bno action\b/gi, "cleared")
    .replace(/\s+/g, " ")
    .trim();
  const voice = roleView === "cfo" || roleView === "owner" ? "cfo" : "gm";

  const openFocus = (id: string) => setFocusId(id);
  const closeFocus = () => setFocusId(null);

  const phaseBar = synthetic ? (
    <LiveShiftPhaseBar phase={phase} onChange={setPhase} />
  ) : null;

  if (phase === "PRE_SHIFT") {
    return (
      <>
        {phaseBar}
        <PreShiftLiveSurface />
      </>
    );
  }

  if (phase === "POST_SHIFT") {
    return (
      <>
        {phaseBar}
        <PostShiftLiveSurface />
      </>
    );
  }

  if (!live.active) {
    return (
      <section className="rp-live-cmd" aria-label="Live">
        {phaseBar}
        <header className="rp-oday-status" data-status="closed">
          <p className="rp-live-k">Service status</p>
          <h2>Closed</h2>
          <p>
            Next service · {live.nextServiceLabel ?? "Dinner 17:00"} · Forecast{" "}
            {formatDecisionMoney(live.expectedClose)}
          </p>
        </header>
        <OperatingCalendar
          locationId={live.locationId}
          defaultRange="month"
          onReplayDecision={onSelectDecision}
        />
      </section>
    );
  }

  return (
    <section
      className="rp-live-cmd"
      data-fold="true"
      data-density={density}
      aria-label="Live operating day"
    >
      {phaseBar}
      <header className="rp-oday-hero" data-pace={st.pace} data-v2="true">
        <div className="rp-oday-timeblock">
          <p className="rp-live-loc">
            <span className="rp-live-dot" aria-hidden="true" />
            <span className="rp-live-status">LIVE</span>
          </p>
          <h2 className="rp-oday-time-h">
            <em>{st.serviceLabel.toUpperCase()}</em>
            <span>
              {st.openLabel}–{st.closeLabel}
            </span>
          </h2>
          <p className="rp-oday-time-now">
            <strong>{st.clockLabel}</strong>
            <span>NOW</span>
            <em>{remainingServiceLabel(st).toUpperCase()}</em>
          </p>
          <p className="rp-oday-pace" data-pace={st.pace}>
            {st.pace === "ahead"
              ? "Ahead of pace"
              : st.pace === "behind"
                ? "Behind pace"
                : st.pace === "at_risk"
                  ? "At risk"
                  : "Within range"}
            <span>
              Revenue {st.revenueDeltaPct >= 0 ? "↑ +" : "↓ "}
              {Math.abs(st.revenueDeltaPct)}%
            </span>
            {st.nextPressureAt ? (
              <span data-semantic="warning">
                Next pressure {st.nextPressureAt}
              </span>
            ) : null}
          </p>
          {density !== "focus" ? (
            <p className="rp-oday-gm-line">
              {plainLine(roleView, "kitchen_pressure")}
            </p>
          ) : null}
        </div>

        <div className="rp-oday-hero-nums" data-secondary="true">
          <div>
            <strong>{formatDecisionMoney(st.revenueNow)}</strong>
            <span>Revenue now</span>
          </div>
          <div data-em="true">
            <strong
              data-semantic={st.revenueDeltaPct >= 0 ? "positive" : "negative"}
            >
              {st.revenueDeltaPct >= 0 ? "↑" : "↓"}{" "}
              {paceHeadline(live).split(" ")[0]}
            </strong>
            <span>vs expected now</span>
          </div>
          <div>
            <ForecastExplain
              forecast={closeFc}
              compactLabel="Expected close"
            />
          </div>
          <div>
            <strong>
              {formatDecisionMoney(Math.round(st.revenueNow * 0.38))}
            </strong>
            <span>Contribution pace</span>
          </div>
        </div>

        <div className="rp-oday-main">
          <div className="rp-oday-traj-col">
            <OperatingDayChart
              series={day.series}
              periods={day.periods}
              markers={day.markers}
              heatStrip={day.heatStrip}
              clockLabel={st.clockLabel}
              onSelectDecision={openFocus}
              selectedDecisionId={focusId}
            />
            <SourceFreshnessStrip sources={surface.sourceFreshness} />
          </div>

          {density !== "focus" ? (
            <aside className="rp-oday-outlook" aria-label="Shift outlook">
              <header>
                <p className="rp-live-k">Now + next</p>
                <div className="rp-live-horizon-tabs" role="tablist">
                  {HORIZONS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      data-active={horizon === h.id}
                      onClick={() => setHorizon(h.id)}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </header>

              <ul className="rp-oday-windows">
                {day.pressureWindows.map((w) => (
                  <li key={w.id} data-level={w.level}>
                    <time>
                      {w.start}–{w.end}
                    </time>
                    <strong>{w.label}</strong>
                    <span>{w.detail}</span>
                    {w.kitchenPct != null ? (
                      <em data-level={w.level}>Kitchen {w.kitchenPct}%</em>
                    ) : null}
                    {w.risk ? <p data-risk="true">{w.risk}</p> : null}
                    {w.clearsIf ? <p data-clear="true">{w.clearsIf}</p> : null}
                  </li>
                ))}
              </ul>

              <div className="rp-oday-outlook-proj">
                <div>
                  <strong>{formatDecisionMoney(proj.revenueForecast)}</strong>
                  <span>Revenue</span>
                </div>
                <div>
                  <strong>{proj.kitchenPressure}%</strong>
                  <span>Kitchen</span>
                </div>
                <div>
                  <strong>+{proj.coversIncoming}</strong>
                  <span>Covers</span>
                </div>
              </div>

              <p className="rp-oday-attention">
                <strong>{attention.gmSees}</strong>
                <span aria-hidden="true"> · </span>
                {compression}
              </p>

              {needsDecisionId && needsRecommendation ? (
                <button
                  type="button"
                  className="rp-oday-needs"
                  onClick={() => openFocus(needsDecisionId)}
                >
                  <em>Needs you</em>
                  <strong>{needsRecommendation}</strong>
                  <span>
                    {needsEconomic ? `${needsEconomic} expected · ` : ""}
                    Compare futures →
                  </span>
                </button>
              ) : null}

              {materialSignal ? (
                <p className="rp-live-fold-sig">
                  <strong>{materialSignal.label}</strong> · stockout{" "}
                  {materialSignal.projectedStockoutAt} ·{" "}
                  {formatDecisionMoney(materialSignal.revenueAtRisk)} exposed
                </p>
              ) : null}
            </aside>
          ) : null}
        </div>
      </header>

      {density === "focus" ? (
        <>
          <div className="rp-live-focus-fold">
            <p className="rp-oday-attention" data-density="focus">
              <strong>{attention.gmSees}</strong>
              <span aria-hidden="true"> · </span>
              {compression
                .replace(/\s*·\s*\d+\s+need judgment\s*$/i, "")
                .trim()}
            </p>
            {needsDecisionId && needsRecommendation ? (
              <section aria-label="Needs you">
                <p className="rp-live-k">Needs you</p>
                <button
                  type="button"
                  className="rp-oday-needs"
                  onClick={() => openFocus(needsDecisionId)}
                >
                  <em>Needs you</em>
                  <strong>{needsRecommendation}</strong>
                  <span>
                    {needsEconomic ? `${needsEconomic} expected · ` : ""}
                    Compare futures →
                  </span>
                </button>
              </section>
            ) : null}

            <section
              className="rp-live-focus-exceptions"
              aria-label="Staffing and inventory exceptions"
            >
              <p className="rp-live-k">Exceptions</p>
              <WorkforceOutlookModule gap={staffing} voice={voice} />
              {materialSignal ? (
                <p className="rp-live-fold-sig">
                  <strong>{materialSignal.label}</strong> · stockout{" "}
                  {materialSignal.projectedStockoutAt} ·{" "}
                  {formatDecisionMoney(materialSignal.revenueAtRisk)} exposed
                </p>
              ) : null}
              <StockWatchPanel data={surface.stock} />
            </section>

            <ShapingTodayModule data={shaping} />
          </div>

          <nav className="rp-live-depth-tabs" aria-label="Live depth">
            {(
              [
                ["service", "Service"],
                ["menu", "Menu"],
                ["money", "Money"],
                ["history", "History"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                data-active={focusDepthTab === id ? "true" : undefined}
                onClick={() => setFocusDepthTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="rp-live-depth-panel">
            {focusDepthTab === "service" ? (
              <>
                <header className="rp-oday-outlook-h">
                  <p className="rp-live-k">Now + next</p>
                  <div className="rp-live-horizon-tabs" role="tablist">
                    {HORIZONS.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        data-active={horizon === h.id}
                        onClick={() => setHorizon(h.id)}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </header>
                <ul className="rp-oday-windows">
                  {day.pressureWindows.map((w) => (
                    <li key={w.id} data-level={w.level}>
                      <time>
                        {w.start}–{w.end}
                      </time>
                      <strong>{w.label}</strong>
                      <span>{w.detail}</span>
                      {w.kitchenPct != null ? (
                        <em data-level={w.level}>Kitchen {w.kitchenPct}%</em>
                      ) : null}
                      {w.risk ? <p data-risk="true">{w.risk}</p> : null}
                    </li>
                  ))}
                </ul>
                <div className="rp-live-row2">
                  <CoverFlowViz stages={surface.coverFlow} />
                  <OrdersNowPanel data={surface.orderFlow} />
                </div>
                <DeliveryStreamCard data={surface.delivery} />
              </>
            ) : null}
            {focusDepthTab === "menu" ? (
              <>
                <TonightMoversPanel />
                <section className="rp-live-top" aria-label="Bestsellers">
                  <div className="rp-live-top-head">
                    <p className="rp-live-k">Bestsellers</p>
                    <div className="rp-live-horizon-tabs" role="tablist">
                      {(
                        [
                          ["tonight", "TONIGHT"],
                          ["week", "7 DAYS"],
                          ["month", "30 DAYS"],
                        ] as const
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          type="button"
                          data-active={menuPeriod === id ? "true" : undefined}
                          onClick={() => setMenuPeriod(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ul className="rp-live-dishes">
                    {bestsellers.map((d) => (
                      <li key={`${menuPeriod}-${d.itemId}-${d.rankRevenue}`}>
                        <em className="rp-live-rank">
                          {String(d.rankRevenue).padStart(2, "0")}
                        </em>
                        {d.imageSrc ? (
                          <span className="rp-live-dish-img">
                            <Image
                              src={d.imageSrc}
                              alt=""
                              width={56}
                              height={56}
                            />
                          </span>
                        ) : (
                          <span
                            className="rp-live-dish-img"
                            data-empty="true"
                          />
                        )}
                        <div className="rp-live-dish-body">
                          <strong>{d.name}</strong>
                          <span>
                            {d.units} sold · {formatDecisionMoney(d.revenue)} ·{" "}
                            {formatDecisionMoney(d.contribution)} contrib
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}
            {focusDepthTab === "money" ? (
              <>
                <MoneyFlowViz data={surface.moneyFlow} />
                <SinceChangedStrip data={surface.sinceChanged} />
                <OrderRateMini data={surface.orderRate} />
              </>
            ) : null}
            {focusDepthTab === "history" ? (
              <OperatingCalendar
                locationId={live.locationId}
                defaultRange="month"
                onReplayDecision={openFocus}
              />
            ) : null}
          </div>
        </>
      ) : (
        <>
      <nav className="rp-live-mtabs" aria-label="Live sections">
        {(
          [
            ["day", "Day"],
            ["context", "Context"],
            ["people", "People"],
            ["depth", "Depth"],
            ["history", "History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-active={mobileTab === id}
            onClick={() => setMobileTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div
        className="rp-oday-nerve"
        data-mobile={
          mobileTab === "day" ||
          mobileTab === "context" ||
          mobileTab === "people"
            ? "show"
            : "hide"
        }
      >
        <ShapingTodayModule data={shaping} />
        <WorkforceOutlookModule gap={staffing} voice={voice} />
      </div>

      <div data-mobile={mobileTab === "day" ? "show" : "hide"}>
        <MoneyFlowViz data={surface.moneyFlow} />
        <SinceChangedStrip data={surface.sinceChanged} />
        <TonightMoversPanel />
      </div>

      <div
        data-mobile={
          mobileTab === "day" || mobileTab === "history" ? "show" : "hide"
        }
        className="rp-oday-history"
      >
        <OperatingCalendar
          locationId={live.locationId}
          defaultRange="month"
          onReplayDecision={openFocus}
        />
      </div>

      <div
        className="rp-live-depth"
        data-mobile={mobileTab === "depth" ? "show" : "hide"}
      >
        <details className="rp-oday-depth">
          <summary>Service depth · covers · menu · kitchen</summary>
          <div className="rp-live-row2">
            <CoverFlowViz stages={surface.coverFlow} />
            <div className="rp-live-stack">
              <OrdersNowPanel data={surface.orderFlow} />
              <OrderRateMini data={surface.orderRate} />
            </div>
            <DeliveryStreamCard data={surface.delivery} />
          </div>

          <div className="rp-live-row3">
            <section className="rp-live-top" aria-label="Bestsellers">
              <div className="rp-live-top-head">
                <p className="rp-live-k">Bestsellers</p>
                <div className="rp-live-horizon-tabs" role="tablist">
                  {(
                    [
                      ["tonight", "TONIGHT"],
                      ["week", "7 DAYS"],
                      ["month", "30 DAYS"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      data-active={menuPeriod === id}
                      onClick={() => setMenuPeriod(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <ul className="rp-live-dishes">
                {bestsellers.map((d) => (
                  <li key={`${menuPeriod}-${d.itemId}-${d.rankRevenue}`}>
                    <em className="rp-live-rank">
                      {String(d.rankRevenue).padStart(2, "0")}
                    </em>
                    {d.imageSrc ? (
                      <span className="rp-live-dish-img">
                        <Image src={d.imageSrc} alt="" width={56} height={56} />
                      </span>
                    ) : (
                      <span className="rp-live-dish-img" data-empty="true" />
                    )}
                    <div className="rp-live-dish-body">
                      <strong>{d.name}</strong>
                      <span>
                        {d.units} sold · {formatDecisionMoney(d.revenue)} ·{" "}
                        {formatDecisionMoney(d.contribution)} contrib
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            <StockWatchPanel data={surface.stock} />
          </div>

          <div className="rp-live-row2">
            <CancellationFlowViz data={surface.cancellationFlow} />
            <section className="rp-live-mod">
              <p className="rp-live-k">Kitchen</p>
              <div className="rp-live-kitchen">
                <div>
                  <strong>{live.kitchenPressure}%</strong>
                  <span>now</span>
                </div>
                <div>
                  <strong>{live.interventionThreshold}%</strong>
                  <span>band</span>
                </div>
                <div data-risk="true">
                  <strong>{live.kitchenProjected}%</strong>
                  <span>at {live.kitchenProjectedAt}</span>
                </div>
              </div>
            </section>
            <section className="rp-live-mod">
              <p className="rp-live-k">Labor</p>
              <p className="rp-live-mod-read">{surface.labor.read}</p>
              <ResourceWatchPanel resources={surface.resources} />
            </section>
          </div>
        </details>
      </div>
        </>
      )}

      <DecisionFocusDrawer
        decisionId={focusId}
        row={
          decisions.find((d) => d.id === focusId) ??
          (focusId === DECISION_IDS.peak ? peakDecision : null)
        }
        onClose={closeFocus}
      />
    </section>
  );
}
