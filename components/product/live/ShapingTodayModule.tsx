"use client";

/**
 * What's shaping today — one compact Context module.
 * Not separate weather/event widgets. Community-first market philosophy.
 */

import type { ShapingToday } from "@/lib/radr/context";

export function ShapingTodayModule({
  data,
  vertical = "restaurant",
}: {
  data: ShapingToday;
  /** Hotel Live must not surface F&B reservation framing. */
  vertical?: "restaurant" | "hotel";
}) {
  if (data.signals.length === 0 && !data.interpretation) return null;

  return (
    <section className="rp-shape" aria-label={data.title} data-vertical={vertical}>
      <header className="rp-shape-head">
        <div>
          <p className="rp-live-k">{data.title}</p>
          <p className="rp-shape-read">{data.interpretation}</p>
        </div>
        {data.peakPressure ? (
          <p className="rp-shape-peak" data-semantic="warning">
            Peak · {data.peakPressure}
          </p>
        ) : null}
      </header>

      <ul className="rp-shape-signals">
        {data.signals.map((s) => (
          <li key={s.id} data-family={s.family}>
            <strong>{s.label}</strong>
            <em>{s.impact}</em>
            <span data-class={s.sourceClass}>{s.sourceClass}</span>
          </li>
        ))}
        {vertical !== "hotel" && data.reservationsRemaining != null ? (
          <li data-family="LOCAL_DEMAND">
            <strong>Reservations remaining</strong>
            <em>{data.reservationsRemaining}</em>
            <span data-class="CONFIGURED">CONFIGURED</span>
          </li>
        ) : null}
      </ul>

      {data.marketNote ? (
        <p className="rp-shape-market">{data.marketNote}</p>
      ) : null}
    </section>
  );
}
