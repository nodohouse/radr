"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatEuro } from "@/lib/radr/money";
import type { DashPeriod, LocationScope } from "@/lib/product/demo/dashboard";
import type { RoleView } from "@/lib/product/types";
import {
  composeLookbackBrief,
  composeMonthLookbackDetail,
  type FiscalYearId,
  type LookbackSeriesPoint,
  type LookbackTone,
  type MonthLookbackDetail,
  type SeatingMixInsight,
  type YearVerifiedProof,
} from "@/lib/radr/lookback";
import {
  composeMenuWrapped,
  getDishIntel,
} from "@/lib/radr/lookback/demoMenuWrapped";
import { LookbackPeriodStrip } from "@/components/product/lookback/LookbackPeriodStrip";
import { YearTrackChart } from "@/components/product/lookback/YearTrackChart";
import {
  DishIntelligenceSheet,
  MenuWrapped,
} from "@/components/product/lookback/MenuWrapped";

function signedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1).replace(".", ",")}%`;
}

function toneAttr(tone: LookbackTone | undefined) {
  return tone ?? "neutral";
}

function signedEuro(n: number) {
  const body = formatEuro(Math.abs(n));
  return n < 0 ? `−${body}` : `+${body}`;
}

function YearChapter({
  num,
  title,
  children,
  className,
}: {
  num: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rp-year-chapter ${className ?? ""}`.trim()}>
      <header className="rp-year-chapter-head">
        <span className="rp-year-chapter-num">{num}</span>
        <h3 className="rp-year-chapter-title">{title}</h3>
      </header>
      <div className="rp-year-chapter-body">{children}</div>
    </section>
  );
}

type Props = {
  period: DashPeriod;
  locationScope: LocationScope;
  dayLabel?: string;
  roleView?: RoleView;
  onOpenLocation?: (id: string) => void;
};

/**
 * Year / lookback - curated narrative chapters, not a report dump.
 */
export function LookbackBoard({
  period,
  locationScope,
  dayLabel,
  roleView,
  onOpenLocation,
}: Props) {
  const [fiscalYearId, setFiscalYearId] = useState<FiscalYearId>("fy2026");
  const [compareFiscalYearId, setCompareFiscalYearId] =
    useState<FiscalYearId | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);
  const [verifiedOpen, setVerifiedOpen] = useState(false);

  const brief = useMemo(
    () =>
      composeLookbackBrief({
        period,
        locationScope,
        dayLabel,
        fiscalYearId,
        compareFiscalYearId,
        roleView,
      }),
    [
      period,
      locationScope,
      dayLabel,
      fiscalYearId,
      compareFiscalYearId,
      roleView,
    ],
  );

  useEffect(() => {
    setSelectedId(null);
    setSelectedDishId(null);
    setVerifiedOpen(false);
  }, [period, locationScope, fiscalYearId, compareFiscalYearId, roleView]);

  const selectedPoint = useMemo(() => {
    if (!brief || !selectedId) return null;
    return brief.series.find((s) => s.id === selectedId) ?? null;
  }, [brief, selectedId]);

  const monthInsight = useMemo(() => {
    if (!selectedPoint || !brief || brief.horizon !== "ytd") return null;
    return composeMonthLookbackDetail({
      locationScope,
      fiscalYearId,
      monthIndex: selectedPoint.index,
    });
  }, [selectedPoint, brief, locationScope, fiscalYearId]);

  const menuWrapped = useMemo(() => {
    if (!brief || brief.horizon !== "ytd") return null;
    return composeMenuWrapped({
      fiscalYearId,
      roleView,
      scopeLabel: brief.scopeLabel,
    });
  }, [brief, fiscalYearId, roleView]);

  const dishIntel = useMemo(() => {
    if (!menuWrapped || !selectedDishId) return null;
    return getDishIntel(menuWrapped, selectedDishId);
  }, [menuWrapped, selectedDishId]);

  if (!brief) return null;

  const isYear = brief.horizon === "ytd";
  const comparing = Boolean(compareFiscalYearId && brief.compareFiscalYearId);
  const sheetOpen = Boolean(monthInsight || dishIntel);

  function toggleMonth(point: LookbackSeriesPoint) {
    setSelectedDishId(null);
    setSelectedId((cur) => (cur === point.id ? null : point.id));
  }

  function selectDish(id: string | null) {
    setSelectedId(null);
    setSelectedDishId(id);
  }

  function toggleCompare(id: FiscalYearId) {
    if (id === fiscalYearId) return;
    setCompareFiscalYearId((cur) => (cur === id ? null : id));
  }

  const seriesLead =
    brief.horizon === "ytd"
      ? brief.bestMonthLabel
        ? `${
            brief.fiscalYears?.find((y) => y.id === brief.fiscalYearId)?.partial
              ? "Best so far"
              : "Best month"
          }: ${brief.bestMonthLabel}. Select a month for RADR’s explanation.`
        : "Select a month for RADR’s explanation."
      : brief.horizon === "mtd"
        ? "Select a week for RADR’s explanation."
        : "Select a service for RADR’s explanation.";

  return (
    <section
      className="rp-lookback"
      aria-label={brief.title}
      data-horizon={brief.horizon}
      data-compare={comparing ? "true" : undefined}
      data-year={isYear ? "true" : undefined}
      data-sheet={sheetOpen ? "true" : undefined}
    >
      <header className="rp-lookback-head">
        <div className="rp-lookback-intro">
          <p className="rp-lookback-kicker">{brief.periodLabel}</p>
          <h2 className="rp-lookback-title">{brief.title}</h2>
          <p className="rp-lookback-scope">{brief.scopeLabel}</p>
          <p className="rp-lookback-narrative">{brief.narrative}</p>
        </div>

        {isYear && brief.fiscalYears ? (
          <div className="rp-lookback-fy" aria-label="Fiscal years">
            <div className="rp-lookback-fy-row">
              <span className="rp-lookback-fy-label">View</span>
              <div className="rp-lookback-fy-pills" role="tablist">
                {brief.fiscalYears.map((y) => {
                  const on = y.id === fiscalYearId;
                  return (
                    <button
                      key={y.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      className="rp-lookback-fy-pill"
                      data-active={on ? "true" : undefined}
                      onClick={() => {
                        setFiscalYearId(y.id);
                        if (compareFiscalYearId === y.id) {
                          setCompareFiscalYearId(null);
                        }
                      }}
                    >
                      {y.label}
                      {y.partial ? <em>YTD</em> : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rp-lookback-fy-row">
              <span className="rp-lookback-fy-label">Compare</span>
              <div className="rp-lookback-fy-pills" role="group">
                {brief.fiscalYears
                  .filter((y) => y.id !== fiscalYearId)
                  .map((y) => {
                    const on = y.id === compareFiscalYearId;
                    return (
                      <button
                        key={y.id}
                        type="button"
                        className="rp-lookback-fy-pill"
                        data-compare="true"
                        data-active={on ? "true" : undefined}
                        aria-pressed={on}
                        onClick={() => toggleCompare(y.id)}
                      >
                        {y.short}
                      </button>
                    );
                  })}
                {compareFiscalYearId ? (
                  <button
                    type="button"
                    className="rp-lookback-fy-clear"
                    onClick={() => setCompareFiscalYearId(null)}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <div className="rp-lookback-stage">
        <div className="rp-lookback-stage-main">
          {isYear ? (
            <>
              <YearChapter num="01" title="How we did">
                <ul
                  className="rp-lookback-kpis"
                  data-premium="true"
                  aria-label="Year pulse"
                >
                  {brief.kpis.map((k) => (
                    <li key={k.id} data-tone={toneAttr(k.tone)}>
                      <strong className="rp-lookback-kpi-value">{k.value}</strong>
                      <span className="rp-lookback-kpi-label">{k.label}</span>
                      {k.delta ? (
                        <em
                          className="rp-lookback-kpi-delta"
                          data-tone={toneAttr(k.tone)}
                        >
                          {k.delta}
                        </em>
                      ) : null}
                    </li>
                  ))}
                </ul>

                {brief.yearDrivers.length > 0 ? (
                  <div className="rp-lookback-drove" data-chapter="inline">
                    <div className="rp-lookback-drove-head">
                      <p className="rp-lookback-sec-label">What drove it</p>
                      <p className="rp-lookback-drove-lead">
                        Top moves by impact - not an endless list.
                      </p>
                    </div>
                    <ul>
                      {brief.yearDrivers.map((d) => (
                        <li key={d.id} data-tone={d.tone}>
                          <strong className="rp-lookback-drove-amt">
                            {signedEuro(d.amount)}
                          </strong>
                          <div className="rp-lookback-drove-copy">
                            <span className="rp-lookback-drove-terr">
                              {d.territory}
                              {d.tag ? <i>{d.tag}</i> : null}
                            </span>
                            <span>{d.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </YearChapter>

              <YearChapter num="02" title="How the year moved">
                {brief.yearTrack ? (
                  <YearTrackChart
                    track={brief.yearTrack}
                    selectedId={selectedId}
                    bestMonthId={brief.bestMonthId}
                    comparing={comparing}
                    onSelect={(id) => {
                      setSelectedDishId(null);
                      setSelectedId((cur) => (cur === id ? null : id));
                    }}
                  />
                ) : null}
              </YearChapter>

              {brief.guidance ? (
                <YearChapter num="03" title="What to repeat / what to fix">
                  <div className="rp-lookback-guide" data-priority="true">
                    <div className="rp-lookback-guide-grid">
                      <div className="rp-lookback-guide-col" data-kind="repeat">
                        <h3>What to repeat</h3>
                        <ul>
                          {brief.guidance.repeat.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rp-lookback-guide-col" data-kind="fix">
                        <h3>What to fix</h3>
                        <ul>
                          {brief.guidance.fix.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </YearChapter>
              ) : null}

              {menuWrapped ? (
                <YearChapter num="04" title="Your year on the menu">
                  <MenuWrapped
                    brief={menuWrapped}
                    selectedDishId={selectedDishId}
                    onSelectDish={selectDish}
                    embedded
                  />
                </YearChapter>
              ) : null}

              {brief.yearTrack?.seating ? (
                <YearChapter num="05" title="What the floor taught us">
                  <FloorMixBlock seating={brief.yearTrack.seating} />
                </YearChapter>
              ) : null}

              {brief.verifiedProof ? (
                <YearChapter num="06" title="What RADR verified">
                  <VerifiedProofBlock
                    proof={brief.verifiedProof}
                    open={verifiedOpen}
                    onToggle={() => setVerifiedOpen((v) => !v)}
                  />
                </YearChapter>
              ) : null}

              {brief.guidance?.nextYear?.length ? (
                <YearChapter num="07" title="Next year">
                  <ol className="rp-year-next">
                    {brief.guidance.nextYear.map((line, i) => (
                      <li key={line}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <p>{line}</p>
                      </li>
                    ))}
                  </ol>
                  {brief.locations.length > 1 ? (
                    <div className="rp-lookback-locs" data-compact="true">
                      <p className="rp-lookback-sec-label">Locations</p>
                      <ol>
                        {brief.locations.map((row, i) => (
                          <li key={row.id}>
                            <button
                              type="button"
                              className="rp-lookback-loc"
                              onClick={() => onOpenLocation?.(row.id)}
                              disabled={!onOpenLocation}
                            >
                              <span className="rp-lookback-rank">{i + 1}</span>
                              <span className="rp-lookback-loc-copy">
                                <strong>{row.name}</strong>
                                <span>
                                  {row.city} · {row.highlight}
                                </span>
                              </span>
                              <span className="rp-lookback-loc-metrics">
                                <strong>{formatEuro(row.contribution)}</strong>
                                <em
                                  data-tone={
                                    row.vsPlanPct >= 0 ? "good" : "bad"
                                  }
                                >
                                  {signedPct(row.vsPlanPct)}
                                </em>
                              </span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}
                </YearChapter>
              ) : null}
            </>
          ) : (
            <>
              <ul
                className="rp-lookback-kpis"
                data-premium="true"
                aria-label="Period pulse"
              >
                {brief.kpis.map((k) => (
                  <li key={k.id} data-tone={toneAttr(k.tone)}>
                    <strong className="rp-lookback-kpi-value">{k.value}</strong>
                    <span className="rp-lookback-kpi-label">{k.label}</span>
                    {k.delta ? (
                      <em
                        className="rp-lookback-kpi-delta"
                        data-tone={toneAttr(k.tone)}
                      >
                        {k.delta}
                      </em>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="rp-lookback-chart" data-signature="true">
                <div className="rp-lookback-chart-head">
                  <div>
                    <p className="rp-lookback-sec-label">{brief.seriesLabel}</p>
                    <p className="rp-lookback-chart-lead">{seriesLead}</p>
                  </div>
                  <p className="rp-lookback-chart-legend" aria-hidden="true">
                    <span data-swatch="plan">Plan</span>
                    <span data-swatch="good">Above</span>
                    <span data-swatch="watch">Soft</span>
                    <span data-swatch="bad">Below</span>
                  </p>
                </div>

                <LookbackPeriodStrip
                  series={brief.series}
                  selectedId={selectedId}
                  bestId={brief.bestMonthId}
                  onSelect={toggleMonth}
                  label={brief.seriesLabel}
                />
              </div>

              <div className="rp-lookback-highlights">
                <p className="rp-lookback-sec-label">What mattered</p>
                <ul>
                  {brief.highlights.map((h) => (
                    <li key={h.id}>
                      <div>
                        <strong>{h.title}</strong>
                        <span>{h.detail}</span>
                      </div>
                      {h.value ? <em>{h.value}</em> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {dishIntel ? (
          <DishIntelligenceSheet
            dish={dishIntel}
            onClose={() => setSelectedDishId(null)}
          />
        ) : monthInsight ? (
          <MonthInsightSheet
            detail={monthInsight}
            onClose={() => setSelectedId(null)}
            onOpenLocation={onOpenLocation}
          />
        ) : null}
      </div>
    </section>
  );
}

function FloorMixBlock({ seating }: { seating: SeatingMixInsight }) {
  return (
    <div className="rp-lookback-seating" data-compact="true">
      <p className="rp-lookback-seating-kicker">{seating.kicker}</p>
      <p className="rp-lookback-seating-headline">{seating.headline}</p>
      <p className="rp-menuwrap-moment-radr">
        <span>RADR</span>
        {seating.radrSays}
      </p>
      <p className="rp-lookback-seating-impact">
        <strong>{formatEuro(seating.impactEuro)}</strong>
        <span>{seating.impactLabel}</span>
      </p>
      <details className="rp-year-disclose">
        <summary>Turns · covers · evidence</summary>
        <ul className="rp-lookback-seating-parties">
          {seating.parties.map((p) => (
            <li key={p.id} data-tone={p.tone}>
              <strong>{p.label}</strong>
              <span>
                {p.tableCount} tables · {p.coverSharePct}% of covers
              </span>
              <em>{formatEuro(p.contribPerCover)} / cover</em>
              <span data-metric="turns">
                {p.turnsPerNight.toFixed(1)} turns / night
              </span>
              <span data-tone={p.tone}>{signedPct(p.vsPlanPct)} vs plan</span>
            </li>
          ))}
        </ul>
        <ul className="rp-lookback-seating-actions">
          {seating.actions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <p className="rp-lookback-seating-evidence">{seating.evidenceNote}</p>
      </details>
    </div>
  );
}

function VerifiedProofBlock({
  proof,
  open,
  onToggle,
}: {
  proof: YearVerifiedProof;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rp-year-verified">
      <div className="rp-year-verified-hero">
        <div>
          <p className="rp-year-verified-kicker">RADR verified</p>
          <p className="rp-year-verified-total">{formatEuro(proof.total)}</p>
          <p className="rp-year-verified-sub">verified recovery</p>
        </div>
        <div className="rp-year-verified-rate">
          <strong>{proof.recoveryRatePct}%</strong>
          <span>recovery rate</span>
        </div>
      </div>
      <p className="rp-year-verified-line">{proof.line}</p>
      <button
        type="button"
        className="rp-year-verified-toggle"
        aria-expanded={open}
        onClick={onToggle}
      >
        {open ? "Hide proof categories" : "Show proof categories"}
      </button>
      {open ? (
        <ul className="rp-year-verified-cats">
          {proof.categories.map((c) => (
            <li key={c.id}>
              <strong>{formatEuro(c.amount)}</strong>
              <span>{c.label}</span>
              <em>{c.detail}</em>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MonthInsightSheet({
  detail,
  onClose,
  onOpenLocation,
}: {
  detail: MonthLookbackDetail;
  onClose: () => void;
  onOpenLocation?: (id: string) => void;
}) {
  return (
    <aside
      className="rp-lookback-sheet"
      data-tone={toneAttr(detail.tone)}
      role="region"
      aria-label={`${detail.fullLabel} detail`}
    >
      <header className="rp-lookback-insight-head">
        <div>
          <p className="rp-lookback-kicker">
            {detail.fiscalYearLabel} · {detail.fullLabel}
          </p>
          <h3>{detail.headline}</h3>
          <p>{detail.verdict}</p>
        </div>
        <button
          type="button"
          className="rp-lookback-insight-close"
          onClick={onClose}
        >
          Close
        </button>
      </header>

      <ul className="rp-lookback-insight-kpis">
        {detail.kpis.map((k) => (
          <li key={k.id} data-tone={toneAttr(k.tone)}>
            <strong>{k.value}</strong>
            <span>{k.label}</span>
            {k.delta ? <em>{k.delta}</em> : null}
          </li>
        ))}
      </ul>

      <div className="rp-lookback-insight-stack">
        <div>
          <p className="rp-lookback-sec-label">Operating mix</p>
          <ul className="rp-lookback-mix">
            <li>
              <span>Labor %</span>
              <strong>{detail.laborPct}</strong>
            </li>
            <li>
              <span>Labor €</span>
              <strong>{detail.labor}</strong>
            </li>
            <li>
              <span>COGS</span>
              <strong>{detail.cogs}</strong>
            </li>
            <li>
              <span>Channel</span>
              <strong>{detail.channelMix}</strong>
            </li>
            <li>
              <span>Returning guests</span>
              <strong>{detail.returningGuestRevenue}</strong>
            </li>
            <li>
              <span>Terrace / weather</span>
              <strong>{detail.terraceEffect}</strong>
            </li>
          </ul>
        </div>
        <div>
          <p className="rp-lookback-sec-label">Drivers this month</p>
          <ul className="rp-lookback-insight-drivers">
            <li data-tone="good">
              <span>Top positive</span>
              <strong>{detail.topPositive}</strong>
            </li>
            <li data-tone="bad">
              <span>Top negative</span>
              <strong>{detail.topNegative}</strong>
            </li>
            <li data-tone="good">
              <span>Verified by RADR</span>
              <strong>{detail.verified}</strong>
            </li>
            <li>
              <span>Notable</span>
              <strong>{detail.notable}</strong>
            </li>
          </ul>
        </div>
      </div>

      {detail.locations.length ? (
        <div className="rp-lookback-insight-locs">
          <p className="rp-lookback-sec-label">Where it showed</p>
          <div className="rp-lookback-insight-loc-row">
            {detail.locations.slice(0, 4).map((row) => (
              <button
                key={row.id}
                type="button"
                className="rp-lookback-insight-loc"
                onClick={() => onOpenLocation?.(row.id)}
                disabled={!onOpenLocation}
              >
                <strong>{row.name}</strong>
                <span>{formatEuro(row.contribution)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
