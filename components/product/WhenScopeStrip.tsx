"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashPeriod } from "@/lib/product/demo/dashboard";
import { useProduct } from "@/lib/product/store";
import type { ServicePhase } from "@/lib/radr/servicePhase";
import {
  buildWhenPresets,
  type HolidayPreset,
} from "@/lib/radr/whenHolidayPresets";

type WhenHorizon = "tonight" | "day" | "mtd" | "ytd" | "custom";

export type { WhenHorizon };

export type CustomRange = {
  from: string;
  to: string;
  label: string | null;
};

const HORIZONS: { id: WhenHorizon; label: string; hint: string }[] = [
  { id: "tonight", label: "Tonight", hint: "Operating beat" },
  { id: "day", label: "Day", hint: "Pick a date" },
  { id: "mtd", label: "Month", hint: "Month to date" },
  { id: "ytd", label: "Year", hint: "Year to date" },
  {
    id: "custom",
    label: "Custom",
    hint: "Holidays for this location, or any date range",
  },
];

const BEATS: {
  id: "PRE_SHIFT" | "LIVE" | "POST_SHIFT";
  label: string;
  phase: ServicePhase;
}[] = [
  { id: "PRE_SHIFT", label: "Pre", phase: "PRE_SHIFT" },
  { id: "LIVE", label: "Live", phase: "LIVE" },
  { id: "POST_SHIFT", label: "After", phase: "POST_SHIFT" },
];

const DAY_KEY = "radr.demo.whenDay";
const CUSTOM_KEY = "radr.demo.whenCustom";
export const WHEN_HORIZON_KEY = "radr.demo.whenHorizon";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function daysBetween(from: string, to: string): number {
  const a = new Date(`${from}T12:00:00`).getTime();
  const b = new Date(`${to}T12:00:00`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

function periodForRange(from: string, to: string): DashPeriod {
  const span = daysBetween(from, to);
  if (span <= 1) return from === todayIso() ? "today" : "yesterday";
  if (span <= 7) return "wtd";
  if (span <= 40) return "mtd";
  return "ytd";
}

function formatDayLabel(iso: string): string {
  try {
    const d = new Date(`${iso}T12:00:00`);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(d);
  } catch {
    return iso;
  }
}

function formatRangeShort(from: string, to: string): string {
  try {
    const a = new Date(`${from}T12:00:00`);
    const b = new Date(`${to}T12:00:00`);
    const sameYear = a.getFullYear() === b.getFullYear();
    const left = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      ...(sameYear ? {} : { year: "2-digit" }),
    }).format(a);
    const right = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    }).format(b);
    return `${left} – ${right}`;
  } catch {
    return `${from} – ${to}`;
  }
}

export function readWhenHorizon(): WhenHorizon {
  try {
    const raw = sessionStorage.getItem(WHEN_HORIZON_KEY);
    if (
      raw === "tonight" ||
      raw === "day" ||
      raw === "mtd" ||
      raw === "ytd" ||
      raw === "custom"
    ) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return "tonight";
}

function writeWhenHorizon(h: WhenHorizon) {
  try {
    sessionStorage.setItem(WHEN_HORIZON_KEY, h);
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("radr-when-horizon"));
  }
}

function last7Fallback(): CustomRange {
  const to = todayIso();
  return {
    from: addDaysIso(to, -6),
    to,
    label: "Last 7 days",
  };
}

function defaultCustomRange(presets?: HolidayPreset[]): CustomRange {
  const last7 = presets?.find((p) => p.id === "last7");
  if (last7) {
    return { from: last7.from, to: last7.to, label: last7.label };
  }
  return last7Fallback();
}

export function readCustomRange(): CustomRange {
  try {
    const raw = sessionStorage.getItem(CUSTOM_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CustomRange>;
      if (
        typeof parsed.from === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(parsed.from) &&
        typeof parsed.to === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(parsed.to)
      ) {
        return {
          from: parsed.from,
          to: parsed.to,
          label: typeof parsed.label === "string" ? parsed.label : null,
        };
      }
    }
  } catch {
    /* ignore */
  }
  return last7Fallback();
}

function writeCustomRange(range: CustomRange) {
  try {
    sessionStorage.setItem(CUSTOM_KEY, JSON.stringify(range));
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("radr-when-horizon"));
  }
}

function beatForPhase(phase: ServicePhase): "PRE_SHIFT" | "LIVE" | "POST_SHIFT" {
  if (phase === "PRE_SHIFT") return "PRE_SHIFT";
  if (phase === "POST_SHIFT") return "POST_SHIFT";
  return "LIVE";
}

function readStoredDay(): string {
  try {
    const raw = sessionStorage.getItem(DAY_KEY);
    if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  } catch {
    /* ignore */
  }
  return todayIso();
}

function writeStoredDay(iso: string) {
  try {
    sessionStorage.setItem(DAY_KEY, iso);
  } catch {
    /* ignore */
  }
}

type Props = {
  phase: ServicePhase;
  onChangePhase: (phase: ServicePhase) => void;
  enabled: boolean;
};

/**
 * One time control - horizon first, then only the secondary that fits.
 * Tonight → Pre / Live / After.
 * Day → calendar (review that service).
 * Month / Year → lookback, no live beat.
 * Custom → location holidays + any from–to range.
 */
export function WhenScopeStrip({ phase, onChangePhase, enabled }: Props) {
  const { period, setPeriod, locationScope } = useProduct();
  const [dayMode, setDayMode] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [dayIso, setDayIso] = useState(todayIso);
  const [custom, setCustom] = useState<CustomRange>(last7Fallback);

  const pack = useMemo(
    () => buildWhenPresets(locationScope),
    [locationScope],
  );
  const presets = pack.presets;

  useEffect(() => {
    setDayIso(readStoredDay());
    setCustom(readCustomRange());
    const stored = readWhenHorizon();
    if (stored === "custom") {
      setDayMode(false);
      setCustomMode(true);
      return;
    }
    if (stored === "day") {
      setDayMode(true);
      setCustomMode(false);
      return;
    }
    if (period === "mtd" || stored === "mtd") {
      setDayMode(false);
      setCustomMode(false);
      return;
    }
    if (period === "ytd" || stored === "ytd") {
      setDayMode(false);
      setCustomMode(false);
      return;
    }
    setDayMode(false);
    setCustomMode(false);
  }, [period]);

  const horizon = useMemo((): WhenHorizon => {
    if (customMode || readWhenHorizon() === "custom") return "custom";
    if (period === "mtd") return "mtd";
    if (period === "ytd") return "ytd";
    if (dayMode || readWhenHorizon() === "day") return "day";
    return "tonight";
  }, [period, dayMode, customMode]);

  const beat = beatForPhase(phase);
  const showBeats = enabled && horizon === "tonight";
  const showCalendar = horizon === "day";
  const showCustom = horizon === "custom";

  function applyCustom(next: CustomRange) {
    let from = next.from;
    let to = next.to;
    if (from > to) {
      const swap = from;
      from = to;
      to = swap;
    }
    const range = { from, to, label: next.label };
    setCustom(range);
    writeCustomRange(range);
    setCustomMode(true);
    setDayMode(false);
    writeWhenHorizon("custom");
    setPeriod(periodForRange(from, to));
    onChangePhase("POST_SHIFT");
  }

  function selectHorizon(next: WhenHorizon) {
    writeWhenHorizon(next);
    if (next === "tonight") {
      setDayMode(false);
      setCustomMode(false);
      setPeriod("today");
      return;
    }
    if (next === "day") {
      setDayMode(true);
      setCustomMode(false);
      const iso = dayIso || todayIso();
      setDayIso(iso);
      writeStoredDay(iso);
      setPeriod(iso === todayIso() ? "today" : "yesterday");
      onChangePhase("POST_SHIFT");
      return;
    }
    if (next === "mtd") {
      setDayMode(false);
      setCustomMode(false);
      setPeriod("mtd");
      onChangePhase("POST_SHIFT");
      return;
    }
    if (next === "ytd") {
      setDayMode(false);
      setCustomMode(false);
      setPeriod("ytd");
      onChangePhase("POST_SHIFT");
      return;
    }
    applyCustom(
      custom.from && custom.to ? custom : defaultCustomRange(presets),
    );
  }

  function onPickDay(iso: string) {
    setDayIso(iso);
    writeStoredDay(iso);
    setDayMode(true);
    setCustomMode(false);
    writeWhenHorizon("day");
    setPeriod(iso === todayIso() ? "today" : "yesterday");
    onChangePhase("POST_SHIFT");
  }

  const caption =
    horizon === "tonight"
      ? "Service beat for tonight"
      : horizon === "day"
        ? `Review · ${formatDayLabel(dayIso)}`
        : horizon === "mtd"
          ? "Month to date · not live service"
          : horizon === "ytd"
            ? "Year to date · not live service"
            : custom.label
              ? `${custom.label} · ${formatRangeShort(custom.from, custom.to)}`
              : formatRangeShort(custom.from, custom.to);

  const activePresetId =
    presets.find(
      (p) =>
        p.from === custom.from &&
        p.to === custom.to &&
        (custom.label === p.label || custom.label == null),
    )?.id ?? null;

  const holidayPresets = presets.filter((p) => p.kind === "holiday");
  const recentPresets = presets.filter((p) => p.kind === "recent");

  return (
    <div
      className="rp-when"
      data-horizon={horizon}
      data-phase={phase}
      aria-label="When"
    >
      <p className="rp-rail-filter-kicker sr-only">Period</p>

      <div className="rp-when-horizons" role="tablist" aria-label="Time horizon">
        {HORIZONS.map((h) => {
          const on = h.id === horizon;
          return (
            <button
              key={h.id}
              type="button"
              role="tab"
              aria-selected={on}
              title={h.hint}
              data-active={on ? "true" : undefined}
              className="rp-when-horizon"
              onClick={() => selectHorizon(h.id)}
            >
              {h.label}
            </button>
          );
        })}
      </div>

      <p className="rp-when-caption">{caption}</p>

      {showBeats ? (
        <div className="rp-when-beats" role="tablist" aria-label="Shift beat">
          {BEATS.map((b) => {
            const on = b.id === beat;
            return (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={
                  b.id === "PRE_SHIFT"
                    ? "Pre-shift"
                    : b.id === "LIVE"
                      ? "Live shift"
                      : "After shift"
                }
                data-active={on ? "true" : undefined}
                data-phase={b.phase}
                className="rp-when-beat"
                onClick={() => onChangePhase(b.phase)}
              >
                <span className="rp-when-beat-dot" aria-hidden="true" />
                {b.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {showCalendar ? (
        <label className="rp-when-cal">
          <span className="sr-only">Service date</span>
          <input
            type="date"
            value={dayIso}
            max={todayIso()}
            onChange={(e) => {
              if (e.target.value) onPickDay(e.target.value);
            }}
          />
        </label>
      ) : null}

      {showCustom ? (
        <div className="rp-when-custom">
          <p className="rp-when-custom-hint">{pack.hint}</p>

          <div
            className="rp-when-presets"
            role="list"
            aria-label="Suggested periods"
          >
            {holidayPresets.map((p) => {
              const on = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="listitem"
                  className="rp-when-preset"
                  data-kind="holiday"
                  data-active={on ? "true" : undefined}
                  title={formatRangeShort(p.from, p.to)}
                  onClick={() =>
                    applyCustom({ from: p.from, to: p.to, label: p.label })
                  }
                >
                  {p.label}
                </button>
              );
            })}
            {recentPresets.map((p) => {
              const on = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="listitem"
                  className="rp-when-preset"
                  data-kind="recent"
                  data-active={on ? "true" : undefined}
                  title={formatRangeShort(p.from, p.to)}
                  onClick={() =>
                    applyCustom({ from: p.from, to: p.to, label: p.label })
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="rp-when-range" aria-label="Custom date range">
            <label className="rp-when-range-field">
              <span>From</span>
              <input
                type="date"
                value={custom.from}
                max={custom.to || todayIso()}
                onChange={(e) => {
                  if (!e.target.value) return;
                  applyCustom({
                    from: e.target.value,
                    to: custom.to,
                    label: null,
                  });
                }}
              />
            </label>
            <span className="rp-when-range-sep" aria-hidden="true">
              →
            </span>
            <label className="rp-when-range-field">
              <span>To</span>
              <input
                type="date"
                value={custom.to}
                min={custom.from}
                max={todayIso()}
                onChange={(e) => {
                  if (!e.target.value) return;
                  applyCustom({
                    from: custom.from,
                    to: e.target.value,
                    label: null,
                  });
                }}
              />
            </label>
          </div>

          <p className="rp-when-range-summary">
            {custom.label ? <em>{custom.label}</em> : <em>Custom range</em>}
            <span>{formatRangeShort(custom.from, custom.to)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
