"use client";

/**
 * GitHub-style operating heatmap — tiny cells, portal tooltip.
 * Period nav: month/year selects + prev/next arrows.
 * Hover tip: pointer-events none — never blocks sibling cells.
 * Click: pin tip only (does not navigate). Replay is an explicit control.
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useProduct } from "@/lib/product/store";
import { migrateRoleView } from "@/lib/product/types";
import type { RoleView } from "@/lib/product/types";
import {
  buildOperatingCalendarCells,
  calendarAsOf,
  calendarCellAriaLabel,
  calendarMetricDefinition,
  calendarMetricsForVertical,
  calendarWeekIds,
  CALENDAR_MIN_YEAR,
  canAdvanceCalendarPeriod,
  clampCalendarPeriod,
  defaultCalendarMetric,
  DEFAULT_CALENDAR_PERIOD,
  maxCalendarPeriod,
  restaurantCalendarTooltipRows,
  shiftCalendarPeriod,
  type CalendarDayCell,
  type CalendarMetricDefinition,
  type CalendarMetricId,
  type CalendarPeriod,
  type CalendarVertical,
} from "@/lib/radr/product/operatingCalendar/metrics";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const MONTH_OPTIONS = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
] as const;

type TipState = {
  cell: CalendarDayCell;
  x: number;
  y: number;
  placeAbove: boolean;
  pinned: boolean;
};

function tipStyle(tip: TipState): CSSProperties {
  const pad = 10;
  const w = 220;
  const tipH = 168;
  const left = Math.min(
    Math.max(pad, tip.x - w / 2),
    typeof window !== "undefined" ? window.innerWidth - w - pad : tip.x,
  );
  const top = tip.placeAbove
    ? Math.max(pad, tip.y - tipH - 8)
    : tip.y + 10;
  return { left, top, width: w, pointerEvents: tip.pinned ? "auto" : "none" };
}

function CalIcon() {
  return (
    <svg
      className="rp-heat-period-cal"
      width="11"
      height="11"
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="3"
        width="12"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5 1.5v3M11 1.5v3M2 6.5h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chevron({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
      <path
        d={dir === "prev" ? "M6.5 2L3.5 5l3 3" : "M3.5 2L6.5 5l-3 3"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type MiniOperatingCalendarProps = {
  vertical?: CalendarVertical;
  metric?: CalendarMetricId;
  roleView?: RoleView;
  onDayClick?: (weekId: string, dayIndex: number) => void;
  showMetricPicker?: boolean;
  className?: string;
  /** Initial month/year. Defaults to demo Live month (Sep 2026). */
  initialPeriod?: CalendarPeriod;
};

export function MiniOperatingCalendar({
  vertical = "restaurant",
  metric: metricProp,
  roleView: roleProp,
  onDayClick,
  showMetricPicker = false,
  className = "",
  initialPeriod = DEFAULT_CALENDAR_PERIOD,
}: MiniOperatingCalendarProps) {
  const { roleView: ctxRole } = useProduct();
  const role = migrateRoleView(roleProp ?? ctxRole);
  const defaultMetric = defaultCalendarMetric(vertical, role);
  const maxPeriod = useMemo(() => maxCalendarPeriod(vertical), [vertical]);
  const asOf = useMemo(() => calendarAsOf(vertical), [vertical]);
  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let y = CALENDAR_MIN_YEAR; y <= maxPeriod.year; y++) years.push(y);
    return years;
  }, [maxPeriod.year]);
  const [metricId, setMetricId] = useState<CalendarMetricId>(
    metricProp ?? defaultMetric,
  );
  const [period, setPeriod] = useState<CalendarPeriod>(() =>
    clampCalendarPeriod(initialPeriod, maxCalendarPeriod(vertical)),
  );

  useEffect(() => {
    if (metricProp) setMetricId(metricProp);
  }, [metricProp]);

  useEffect(() => {
    if (!metricProp) setMetricId(defaultCalendarMetric(vertical, role));
  }, [vertical, role, metricProp]);

  useEffect(() => {
    setPeriod((p) => clampCalendarPeriod(p, maxPeriod));
  }, [maxPeriod]);

  const metricDef = calendarMetricDefinition(metricId)!;
  const cells = useMemo(
    () => buildOperatingCalendarCells(vertical, metricId, period),
    [vertical, metricId, period],
  );
  const weekIds = useMemo(() => calendarWeekIds(cells), [cells]);
  const metrics = calendarMetricsForVertical(vertical);
  const canGoNext = canAdvanceCalendarPeriod(period, maxPeriod);
  const monthOptions = useMemo(() => {
    if (period.year < maxPeriod.year) return MONTH_OPTIONS;
    return MONTH_OPTIONS.filter((m) => m.value <= maxPeriod.month);
  }, [period.year, maxPeriod.year, maxPeriod.month]);

  const setPeriodSafe = useCallback(
    (next: CalendarPeriod | ((p: CalendarPeriod) => CalendarPeriod)) => {
      setPeriod((p) => {
        const raw = typeof next === "function" ? next(p) : next;
        return clampCalendarPeriod(raw, maxPeriod);
      });
    },
    [maxPeriod],
  );

  const [tip, setTip] = useState<TipState | null>(null);
  const [sheet, setSheet] = useState<CalendarDayCell | null>(null);
  const tipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const isCoarse =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches;

  const clearHover = useCallback(() => {
    setTip((t) => (t?.pinned ? t : null));
  }, []);

  const showAt = useCallback(
    (cell: CalendarDayCell, el: HTMLElement, pinned: boolean) => {
      if (cell.tone === "empty") return;
      const r = el.getBoundingClientRect();
      const spaceBelow =
        typeof window !== "undefined"
          ? window.innerHeight - r.bottom
          : 200;
      setTip({
        cell,
        x: r.left + r.width / 2,
        y: r.bottom,
        placeAbove: spaceBelow < 180,
        pinned,
      });
    },
    [],
  );

  useEffect(() => {
    if (!tip?.pinned) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (tipRef.current?.contains(t)) return;
      setTip(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTip(null);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [tip?.pinned]);

  const replay = useCallback(
    (cell: CalendarDayCell) => {
      setTip(null);
      setSheet(null);
      onDayClick?.(cell.weekId, cell.dayIndex);
    },
    [onDayClick],
  );

  const goPrev = () => {
    setTip(null);
    setPeriodSafe((p) => shiftCalendarPeriod(p, -1, maxPeriod));
  };
  const goNext = () => {
    if (!canGoNext) return;
    setTip(null);
    setPeriodSafe((p) => shiftCalendarPeriod(p, 1, maxPeriod));
  };

  return (
    <div
      ref={rootRef}
      className={`rp-heat ${className}`.trim()}
      data-vertical={vertical}
      data-metric={metricId}
      data-period={`${period.year}-${period.month}`}
      data-as-of={`${asOf.year}-${asOf.month}-${asOf.day}`}
      aria-label={`${vertical === "hotel" ? "Pace" : "Operating"} calendar — ${metricDef.label}`}
      onMouseLeave={clearHover}
    >
      <div className="rp-heat-period" role="group" aria-label="Calendar period">
        <button
          type="button"
          className="rp-heat-period-nav"
          aria-label="Previous month"
          onClick={goPrev}
        >
          <Chevron dir="prev" />
        </button>
        <CalIcon />
        <label className="sr-only" htmlFor={`${tipId}-month`}>
          Month
        </label>
        <select
          id={`${tipId}-month`}
          className="rp-heat-period-select"
          data-kind="month"
          value={period.month}
          aria-label="Month"
          onChange={(e) => {
            setTip(null);
            setPeriodSafe((p) => ({ ...p, month: Number(e.target.value) }));
          }}
        >
          {monthOptions.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${tipId}-year`}>
          Year
        </label>
        <select
          id={`${tipId}-year`}
          className="rp-heat-period-select"
          data-kind="year"
          value={period.year}
          aria-label="Year"
          onChange={(e) => {
            setTip(null);
            setPeriodSafe((p) => ({ ...p, year: Number(e.target.value) }));
          }}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="rp-heat-period-nav"
          aria-label="Next month"
          onClick={goNext}
          disabled={!canGoNext}
          aria-disabled={!canGoNext ? true : undefined}
        >
          <Chevron dir="next" />
        </button>
      </div>

      {showMetricPicker ? (
        <div className="rp-heat-metric-bar" role="tablist" aria-label="Calendar metric">
          {metrics.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === metricId}
              className="rp-heat-metric-btn"
              data-active={m.id === metricId ? "true" : undefined}
              onClick={() => setMetricId(m.id)}
            >
              {m.shortLabel}
            </button>
          ))}
        </div>
      ) : null}

      <div className="rp-heat-head" aria-hidden="true">
        <span />
        {DAYS.map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
      {weekIds.map((weekId) => (
        <div key={weekId} className="rp-heat-row">
          <em>{weekId.replace("W", "")}</em>
          {cells.filter((c) => c.weekId === weekId).map((cell) => {
            const key = `${cell.weekId}-${cell.dayIndex}`;
            const active =
              tip?.cell.weekId === cell.weekId &&
              tip.cell.dayIndex === cell.dayIndex;
            const empty = cell.tone === "empty";
            return (
              <button
                key={key}
                type="button"
                className="rp-heat-cell"
                data-tone={cell.tone}
                data-intensity={cell.intensity}
                data-bookings={cell.cellHint ? "true" : undefined}
                data-active={active ? "true" : undefined}
                data-testid={`heat-${key}`}
                disabled={empty}
                aria-label={
                  empty
                    ? undefined
                    : calendarCellAriaLabel(cell, metricDef)
                }
                aria-hidden={empty ? true : undefined}
                tabIndex={empty ? -1 : undefined}
                aria-describedby={active ? tipId : undefined}
                onMouseEnter={(e) => {
                  if (isCoarse || empty) return;
                  showAt(cell, e.currentTarget, tip?.pinned ?? false);
                }}
                onFocus={(e) => {
                  if (empty) return;
                  showAt(cell, e.currentTarget, tip?.pinned ?? false);
                }}
                onClick={(e) => {
                  if (empty) return;
                  if (isCoarse) {
                    setSheet(cell);
                    return;
                  }
                  e.preventDefault();
                  showAt(cell, e.currentTarget, true);
                }}
              >
                {cell.cellHint ? (
                  <span className="rp-heat-cell-pickup" aria-hidden="true">
                    {cell.cellHint}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}

      {tip && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={tipRef}
              id={tipId}
              className="rp-heat-tip"
              role="tooltip"
              data-pinned={tip.pinned ? "true" : undefined}
              style={tipStyle(tip)}
            >
              <HeatTipBody cell={tip.cell} metric={metricDef} vertical={vertical} />
              {tip.pinned && onDayClick ? (
                <button
                  type="button"
                  className="rp-heat-tip-cta"
                  onClick={() => replay(tip.cell)}
                >
                  Replay day →
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}

      {sheet && typeof document !== "undefined"
        ? createPortal(
            <div className="rp-heat-sheet" role="dialog" aria-label={sheet.label}>
              <button
                type="button"
                className="rp-heat-sheet-scrim"
                aria-label="Close"
                onClick={() => setSheet(null)}
              />
              <div className="rp-heat-sheet-panel">
                <HeatTipBody cell={sheet} metric={metricDef} vertical={vertical} />
                <button
                  type="button"
                  className="rp-heat-sheet-go"
                  onClick={() => replay(sheet)}
                >
                  Replay day →
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/** Hotel pace calendar — role-default metric, picker on. */
export function HotelPaceCalendar(
  props: Omit<MiniOperatingCalendarProps, "vertical" | "showMetricPicker">,
) {
  return (
    <MiniOperatingCalendar
      vertical="hotel"
      showMetricPicker
      {...props}
    />
  );
}

function HeatTipBody({
  cell,
  metric,
  vertical,
}: {
  cell: CalendarDayCell;
  metric: CalendarMetricDefinition;
  vertical: CalendarVertical;
}) {
  const rows =
    vertical === "restaurant"
      ? restaurantCalendarTooltipRows(cell)
      : cell.tooltipRows;

  return (
    <>
      <p className="rp-heat-tip-day">
        {cell.label}
        <span className="rp-heat-tip-metric">{metric.label}</span>
      </p>
      {rows.map((row) => (
        <div key={row.label} className="rp-heat-tip-row">
          <span>{row.label}</span>
          <strong>
            {row.value}
            {row.delta ? <em>{row.delta}</em> : null}
          </strong>
        </div>
      ))}
    </>
  );
}
