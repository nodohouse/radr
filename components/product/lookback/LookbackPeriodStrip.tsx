"use client";

import type { CSSProperties } from "react";
import { formatEuro } from "@/lib/radr/money";
import type { LookbackSeriesPoint, LookbackTone } from "@/lib/radr/lookback";

function signedPct(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n).toFixed(1).replace(".", ",")}%`;
}

function toneAttr(
  tone: LookbackTone | undefined,
  partial?: boolean,
  forecastOnly?: boolean,
) {
  if (forecastOnly) return "forecast";
  if (partial) return "partial";
  return tone ?? "neutral";
}

type Props = {
  series: LookbackSeriesPoint[];
  selectedId?: string | null;
  bestId?: string | null;
  onSelect?: (point: LookbackSeriesPoint) => void;
  /** Accessible name for the strip */
  label?: string;
  /** Force a single row (year = 12 months) */
  oneLine?: boolean;
};

/**
 * Signature RADR period objects - one card language for Year / Month / Day.
 * Marker · label · plan+actual bar · value · variance. No absolute overlaps.
 */
export function LookbackPeriodStrip({
  series,
  selectedId = null,
  bestId = null,
  onSelect,
  label = "Period performance",
  oneLine = false,
}: Props) {
  const barMax = Math.max(
    ...series.flatMap((s) => [
      s.contribution,
      s.planContribution,
      s.compare?.contribution ?? 0,
    ]),
    1,
  );

  const style: CSSProperties | undefined = oneLine
    ? ({ ["--rp-sig-cols"]: String(Math.max(series.length, 1)) } as CSSProperties)
    : undefined;

  return (
    <ol
      className="rp-lookback-sig"
      role="list"
      aria-label={label}
      data-yearline={oneLine ? "true" : undefined}
      style={style}
    >
      {series.map((p) => {
        const tone = toneAttr(p.tone, p.partial, p.forecastOnly);
        const fillPct = Math.max(8, (p.contribution / barMax) * 100);
        const planPct = Math.max(8, (p.planContribution / barMax) * 100);
        const selected = selectedId === p.id;
        const isBest = bestId === p.id;
        const interactive = Boolean(onSelect);

        const varianceLabel = p.forecastOnly
          ? "Forecast"
          : p.partial
            ? "In progress"
            : signedPct(p.vsPlanPct);

        const body = (
          <>
            <span
              className="rp-lookback-sig-marker-slot"
              aria-hidden={!p.notable && !isBest}
            >
              {isBest ? (
                <span className="rp-lookback-sig-best">Best</span>
              ) : p.notable ? (
                <span
                  className="rp-lookback-sig-marker"
                  data-tone={p.notable.tone}
                  title={p.notable.detail}
                >
                  {p.notable.label}
                </span>
              ) : (
                <span className="rp-lookback-sig-marker rp-lookback-sig-marker--empty">
                  &nbsp;
                </span>
              )}
            </span>
            <span className="rp-lookback-sig-month">{p.label}</span>
            <span className="rp-lookback-sig-track" aria-hidden="true">
              <span
                className="rp-lookback-sig-plan"
                style={{ height: `${planPct}%` }}
              />
              <span
                className="rp-lookback-sig-fill"
                data-tone={tone}
                style={{ height: `${fillPct}%` }}
              />
              {p.compare ? (
                <span
                  className="rp-lookback-sig-compare"
                  style={{
                    height: `${Math.max(
                      4,
                      (p.compare.contribution / barMax) * 100,
                    )}%`,
                  }}
                />
              ) : null}
            </span>
            <strong className="rp-lookback-sig-value">
              {formatEuro(p.contribution)}
            </strong>
            <em data-tone={tone}>{varianceLabel}</em>
          </>
        );

        return (
          <li
            key={p.id}
            data-tone={tone}
            data-selected={selected ? "true" : undefined}
            data-best={isBest ? "true" : undefined}
            data-forecast={p.forecastOnly ? "true" : undefined}
            data-marker={p.notable || isBest ? "true" : undefined}
          >
            {interactive ? (
              <button
                type="button"
                className="rp-lookback-sig-card"
                aria-pressed={selected}
                aria-label={`${p.label}: ${formatEuro(p.contribution)}, ${varianceLabel}${
                  isBest ? ", best month" : ""
                }`}
                onClick={() => onSelect?.(p)}
              >
                {body}
              </button>
            ) : (
              <div className="rp-lookback-sig-card" data-static="true">
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
