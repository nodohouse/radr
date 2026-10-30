"use client";

/**
 * Operating calendar — compact, dense, premium.
 * MON–SUN · ISO weeks · hover popover · day replay.
 */

import { useMemo, useRef, useState } from "react";
import {
  calendarCellsForLocation,
  defaultCalendarMetricForRole,
  getDayReplay,
  type CalendarMetricId,
  type DayPerformanceCell,
  type DayReplay,
} from "@/lib/radr/product/operatingDay";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { useProduct } from "@/lib/product/store";
import { DayReplayScrubber } from "./DayReplayScrubber";

const METRICS: { id: CalendarMetricId; label: string }[] = [
  { id: "contribution_vs_plan", label: "Contribution" },
  { id: "revenue_vs_forecast", label: "Revenue" },
  { id: "verified_value", label: "Verified" },
  { id: "decision_count", label: "Decisions" },
  { id: "forecast_accuracy", label: "Accuracy" },
  { id: "operational_pressure", label: "Pressure" },
];

const DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

type Range = "day" | "week" | "month";

type Props = {
  locationId?: string;
  defaultRange?: Range;
  onReplayDecision?: (id: string) => void;
};

type WeekRow = {
  week: number;
  cells: (DayPerformanceCell | null)[];
};

function buildMonthGrid(cells: DayPerformanceCell[]): WeekRow[] {
  const byDate = new Map(cells.map((c) => [Number(c.dayLabel), c]));
  // Sept 2026 starts Tuesday = index 1
  const startDow = 1;
  const daysInMonth = 30;
  const rows: WeekRow[] = [];
  let cursor = 1 - startDow;
  while (cursor <= daysInMonth) {
    const weekCells: (DayPerformanceCell | null)[] = [];
    let weekNum = 36;
    for (let i = 0; i < 7; i++) {
      const d = cursor + i;
      if (d < 1 || d > daysInMonth) {
        weekCells.push(null);
      } else {
        const cell = byDate.get(d) ?? null;
        weekCells.push(cell);
        if (cell) weekNum = cell.isoWeek;
        else {
          const date = new Date(`2026-09-${String(d).padStart(2, "0")}T12:00:00Z`);
          const t = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
          const dayNum = t.getUTCDay() || 7;
          t.setUTCDate(t.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
          weekNum = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
        }
      }
    }
    rows.push({ week: weekNum, cells: weekCells });
    cursor += 7;
  }
  return rows;
}

export function OperatingCalendar({
  locationId = "loc_berlin_mitte",
  defaultRange = "month",
  onReplayDecision,
}: Props) {
  const { roleView: role } = useProduct();
  const [range, setRange] = useState<Range>(defaultRange);
  const [metric, setMetric] = useState<CalendarMetricId>(() =>
    defaultCalendarMetricForRole(role),
  );
  const [hover, setHover] = useState<DayPerformanceCell | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [replay, setReplay] = useState<DayReplay | null>(null);
  const [sheet, setSheet] = useState<DayPerformanceCell | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const cells = useMemo(
    () => calendarCellsForLocation(locationId, metric),
    [locationId, metric],
  );
  const weeks = useMemo(() => buildMonthGrid(cells), [cells]);

  const openDay = (c: DayPerformanceCell) => {
    setHover(null);
    setPopoverPos(null);
    setSheet(null);
    const r = getDayReplay(c.dateIso, locationId);
    if (r) setReplay(r);
    else setSheet(c);
  };

  return (
    <section className="rp-ocal" aria-label="Operating calendar">
      <header className="rp-ocal-head">
        <div>
          <p className="rp-live-k">Operating calendar</p>
          <div className="rp-ocal-ranges" role="tablist">
            {(
              [
                ["day", "Day"],
                ["week", "Week"],
                ["month", "Month"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                data-active={range === id}
                onClick={() => setRange(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="rp-ocal-metrics">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              data-active={metric === m.id}
              onClick={() => setMetric(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {range === "day" ? (
        <p className="rp-ocal-day-note">
          Today runs in the Live trajectory above. Open Month to inspect history.
        </p>
      ) : null}

      {range === "month" || range === "week" ? (
        <div className="rp-ocal-layout">
          <div className="rp-ocal-board" ref={gridRef}>
            <div className="rp-ocal-dow" aria-hidden="true">
              <span className="rp-ocal-week-h" />
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="rp-ocal-weeks">
              {(range === "week" ? weeks.slice(2, 3) : weeks).map((w) => (
                <div key={`w-${w.week}-${w.cells.find(Boolean)?.dateIso ?? w.week}`} className="rp-ocal-week">
                  <span className="rp-ocal-week-num">W{w.week}</span>
                  {w.cells.map((c, i) =>
                    !c ? (
                      <span
                        key={`e-${w.week}-${i}`}
                        className="rp-ocal-cell"
                        data-tone="empty"
                      />
                    ) : (
                      <button
                        key={c.dateIso}
                        type="button"
                        className="rp-ocal-cell"
                        data-tone={c.tone}
                        data-hot={hover?.dateIso === c.dateIso ? "true" : undefined}
                        onMouseEnter={(e) => {
                          if (window.matchMedia("(hover: hover)").matches) {
                            setHover(c);
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            const board = gridRef.current?.getBoundingClientRect();
                            if (board) {
                              setPopoverPos({
                                x: Math.min(
                                  Math.max(8, rect.left - board.left + rect.width / 2 - 140),
                                  board.width - 288,
                                ),
                                y: rect.bottom - board.top + 6,
                              });
                            }
                          }
                        }}
                        onMouseLeave={() => {
                          setHover(null);
                          setPopoverPos(null);
                        }}
                        onClick={() => {
                          openDay(c);
                        }}
                      >
                        <em>{c.dayLabel}</em>
                        <strong>{c.formatted}</strong>
                        {c.services ? (
                          <span className="rp-ocal-split" aria-hidden="true">
                            {c.services.map((s) => (
                              <i key={s.label} data-tone={s.tone} title={s.label} />
                            ))}
                          </span>
                        ) : null}
                      </button>
                    ),
                  )}
                </div>
              ))}
            </div>

            {hover && popoverPos ? (
              <aside
                className="rp-ocal-pop"
                style={{ left: popoverPos.x, top: popoverPos.y }}
                aria-live="polite"
              >
                <DayPopoverBody cell={hover} />
                <button
                  type="button"
                  className="rp-ocal-pop-cta"
                  onClick={() => openDay(hover)}
                >
                  Replay day →
                </button>
              </aside>
            ) : null}
          </div>

          <aside className="rp-ocal-side">
            <p className="rp-live-k">Pattern</p>
            <p className="rp-ocal-pattern">
              Friday dinner 19:40–20:25 · 4 of last 6 comparable services entered
              fragile capacity band. Avg contribution impact −3.8%.
            </p>
            <p className="rp-ocal-pattern-play">
              Playbook · Friday Peak Capacity V3
            </p>
          </aside>
        </div>
      ) : null}

      {sheet ? (
        <div className="rp-ocal-sheet" role="dialog" aria-label="Day detail">
          <DayPopoverBody cell={sheet} />
          <div className="rp-ocal-sheet-actions">
            <button type="button" onClick={() => openDay(sheet)}>
              Replay day →
            </button>
            <button type="button" onClick={() => setSheet(null)}>
              Close
            </button>
          </div>
        </div>
      ) : null}

      {replay ? (
        <DayReplayScrubber
          replay={replay}
          onClose={() => setReplay(null)}
          onOpenDecision={onReplayDecision}
        />
      ) : null}
    </section>
  );
}

function DayPopoverBody({ cell }: { cell: DayPerformanceCell }) {
  const t = cell.tooltip;
  return (
    <div className="rp-ocal-pop-body">
      <p className="rp-ocal-pop-title">
        <strong>
          {cell.dow.toUpperCase()} · {cell.dayLabel} SEP
        </strong>
        <em>W{cell.isoWeek}</em>
      </p>
      <div className="rp-ocal-pop-primary">
        <div>
          <span>Revenue</span>
          <strong>
            {formatDecisionMoney(t.revenueActual)}
            <i data-semantic={t.revenueDeltaPct >= 0 ? "positive" : "negative"}>
              {t.revenueDeltaPct >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(t.revenueDeltaPct).toFixed(1)}%
            </i>
          </strong>
        </div>
        <div>
          <span>Contribution</span>
          <strong>
            {formatDecisionMoney(t.contributionActual)}
            <i
              data-semantic={
                t.contributionDeltaPct >= 0 ? "positive" : "negative"
              }
            >
              {t.contributionDeltaPct >= 0 ? "↑" : "↓"}{" "}
              {Math.abs(t.contributionDeltaPct).toFixed(1)}%
            </i>
          </strong>
        </div>
      </div>
      <ul className="rp-ocal-pop-meta">
        <li>
          Money in <em>{formatDecisionMoney(t.moneyIn)}</em>
        </li>
        <li>
          Money out <em>{formatDecisionMoney(t.moneyOut)}</em>
        </li>
        <li>
          Covers <em>{t.covers}</em>
        </li>
        <li>
          Avg spend <em>€{t.avgSpend.toFixed(2)}</em>
        </li>
        <li>
          Decisions <em>{t.decisions}</em>
        </li>
        <li>
          Verified <em>{formatDecisionMoney(t.verifiedEuro)}</em>
        </li>
      </ul>
      {t.highlights.length > 0 ? (
        <ul className="rp-ocal-pop-hi">
          {t.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
