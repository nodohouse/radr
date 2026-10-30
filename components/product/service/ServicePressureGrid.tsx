"use client";

/**
 * Station pressure as a semantic grid — one fact per cell, never a
 * concatenated string.
 *
 *   CURRENT | SEAT-NOW | (OPTIMIZED when the floor plan improves)
 *   Dining / Bar / Cold / Hot / Delivery
 */

export type PressureGridRow = {
  id: string;
  label: string;
  /** Observed pressure now (%). */
  current: number;
  /** Modeled pressure if the seat-now path continues (%). */
  seatNow?: number | null;
  /** Modeled pressure under the optimizer plan (%). Only when plan.improved. */
  optimized?: number | null;
};

type Props = {
  rows: PressureGridRow[];
  /** Accessible name for the grid. */
  label?: string;
  /** Row id to emphasise (e.g. the station that drives the Decision). */
  focusId?: string;
  /** Compact variant for drawers. */
  dense?: boolean;
};

const RISK_AT = 90;
const WATCH_AT = 75;

function toneOf(pct: number): "risk" | "watch" | "ok" {
  if (pct >= RISK_AT) return "risk";
  if (pct >= WATCH_AT) return "watch";
  return "ok";
}

function deltaOf(from: number, to: number): string | null {
  const d = to - from;
  if (d === 0) return null;
  return `${d > 0 ? "+" : "−"}${Math.abs(d)}`;
}

export function ServicePressureGrid({
  rows,
  label = "Station pressure",
  focusId,
  dense = false,
}: Props) {
  const hasSeatNow = rows.some((r) => r.seatNow != null);
  const hasOptimized = rows.some((r) => r.optimized != null);

  return (
    <table
      className="rp-spg"
      data-dense={dense ? "true" : undefined}
      data-cols={1 + (hasSeatNow ? 1 : 0) + (hasOptimized ? 1 : 0)}
      aria-label={label}
    >
      <thead>
        <tr>
          <td className="rp-spg-corner" />
          <th scope="col">Current</th>
          {hasSeatNow ? <th scope="col">Seat-now</th> : null}
          {hasOptimized ? (
            <th scope="col" data-kind="optimized">
              Optimized
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.id}
            data-focus={focusId === r.id ? "true" : undefined}
          >
            <th scope="row">{r.label}</th>
            <td data-tone={toneOf(r.current)}>
              <span className="rp-spg-val">{r.current}%</span>
            </td>
            {hasSeatNow ? (
              <td
                data-kind="seat-now"
                data-tone={r.seatNow != null ? toneOf(r.seatNow) : undefined}
              >
                {r.seatNow != null ? (
                  <>
                    <span className="rp-spg-val">{r.seatNow}%</span>
                    {deltaOf(r.current, r.seatNow) ? (
                      <span className="rp-spg-delta">
                        {deltaOf(r.current, r.seatNow)}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="rp-spg-na">—</span>
                )}
              </td>
            ) : null}
            {hasOptimized ? (
              <td
                data-kind="optimized"
                data-tone={r.optimized != null ? toneOf(r.optimized) : undefined}
              >
                {r.optimized != null ? (
                  <>
                    <span className="rp-spg-val">{r.optimized}%</span>
                    {deltaOf(r.current, r.optimized) ? (
                      <span className="rp-spg-delta">
                        {deltaOf(r.current, r.optimized)}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="rp-spg-na">—</span>
                )}
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
