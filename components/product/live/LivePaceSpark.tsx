"use client";

import { formatMoney } from "@/lib/radr/money";
import type { LiveStreamSeries, ShiftEconomicState } from "@/lib/radr/live";

type Props = {
  state: ShiftEconomicState;
  /** Compact for strip; roomier for panel. */
  size?: "strip" | "panel";
};

function eur(n: number, compact = true) {
  return formatMoney({
    amount: Math.round(n),
    currency: "EUR",
    locale: "de-DE",
    compact,
  });
}

function minutesLabel(t: number) {
  const h = Math.floor(t / 60);
  const m = t % 60;
  const base = 17; // dinner open demo
  const hour = (base + h) % 24;
  return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function lastNet(series: LiveStreamSeries | undefined): number {
  if (!series?.points.length) return 0;
  return series.points[series.points.length - 1]!.net;
}

/**
 * Actual vs expected net sales - plus income-stream lines
 * (dine-in, delivery, Uber Eats / Deliveroo / Wolt) to compare who performs.
 */
export function LivePaceSpark({ state, size = "strip" }: Props) {
  const strip = size === "strip";
  const padL = 36;
  const padR = 10;
  const padT = 18;
  const padB = 22;
  const w = strip ? 400 : 420;
  const h = strip ? 148 : 120;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const actual = state.actualSeries;
  const expected = state.expectedSeries;
  if (actual.length < 2 || expected.length < 2) return null;

  const streams = state.streamSeries ?? [];
  const overlayStreams = streams.filter((s) => s.id !== "total");

  const maxT = Math.max(
    actual[actual.length - 1]!.t,
    expected[expected.length - 1]!.t,
    ...streams.flatMap((s) => s.points.map((p) => p.t)),
    1,
  );
  const maxY = Math.max(
    ...actual.map((p) => p.net),
    ...expected.map((p) => p.net),
    ...streams.flatMap((s) => s.points.map((p) => p.net)),
    state.forecastClose * 0.35,
    1,
  );

  const xOf = (t: number) => padL + (t / maxT) * plotW;
  const yOf = (net: number) => padT + plotH - (net / maxY) * plotH;

  const linePath = (pts: { t: number; net: number }[]) =>
    pts
      .map((p, i) => {
        const x = xOf(p.t);
        const y = yOf(p.net);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");

  const last = actual[actual.length - 1]!;
  const nowX = xOf(last.t);
  const nowY = yOf(last.net);
  const expectedNow =
    expected.reduce((best, p) =>
      Math.abs(p.t - last.t) < Math.abs(best.t - last.t) ? p : best,
    expected[0]!,
  );
  const expectedNowY = yOf(expectedNow.net);
  const ahead = state.vsExpectedPct >= 0;
  const delta = Math.abs(state.vsExpectedAbs);

  const expectedToNow = expected.filter((p) => p.t <= last.t + 0.01);
  if (
    expectedToNow.length === 0 ||
    expectedToNow[expectedToNow.length - 1]!.t < last.t
  ) {
    expectedToNow.push({ t: last.t, net: expectedNow.net });
  }
  const gapPath = [
    ...actual.map(
      (p, i) =>
        `${i === 0 ? "M" : "L"}${xOf(p.t).toFixed(1)} ${yOf(p.net).toFixed(1)}`,
    ),
    ...[...expectedToNow]
      .reverse()
      .map((p) => `L${xOf(p.t).toFixed(1)} ${yOf(p.net).toFixed(1)}`),
    "Z",
  ].join(" ");

  const closeX = xOf(maxT);
  const endExpected = expected[expected.length - 1]!;

  const ticks = [
    { t: 0, label: minutesLabel(0) },
    { t: last.t, label: "Now" },
    { t: maxT, label: "Close" },
  ];

  const delivery = streams.find((s) => s.id === "delivery");
  const topProvider = streams
    .filter((s) => s.kind === "provider")
    .slice()
    .sort((a, b) => lastNet(b) - lastNet(a))[0];

  return (
    <div
      className="rp-live-pace-viz"
      data-size={size}
      data-tone={ahead ? "good" : "watch"}
    >
      <div className="rp-live-pace-viz-head">
        <p className="rp-live-pace-viz-kicker">Pace · streams</p>
        <p className="rp-live-pace-viz-delta" data-tone={ahead ? "good" : "watch"}>
          {ahead ? "+" : "−"}
          {eur(delta)} vs plan
        </p>
      </div>

      <svg
        className="rp-live-spark"
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        role="img"
        aria-label={`Net sales pace with income streams. Total ${eur(state.netSales)}. Delivery ${eur(lastNet(delivery))}${topProvider ? `. Leading provider ${topProvider.label} ${eur(lastNet(topProvider))}` : ""}.`}
      >
        <line
          x1={padL}
          x2={w - padR}
          y1={yOf(maxY * 0.5)}
          y2={yOf(maxY * 0.5)}
          className="rp-live-spark-guide"
        />

        <path d={gapPath} className="rp-live-spark-gap" />

        <path d={linePath(expected)} className="rp-live-spark-expected" />

        {overlayStreams.map((s) =>
          s.points.length >= 2 ? (
            <path
              key={s.id}
              d={linePath(s.points)}
              className="rp-live-spark-stream"
              data-stream={s.tone}
              data-kind={s.kind}
            />
          ) : null,
        )}

        <path d={linePath(actual)} className="rp-live-spark-actual" />

        <line
          x1={nowX}
          x2={nowX}
          y1={padT}
          y2={padT + plotH}
          className="rp-live-spark-nowline"
        />
        <circle
          cx={nowX}
          cy={expectedNowY}
          r={2.5}
          className="rp-live-spark-expected-dot"
        />
        <circle cx={nowX} cy={nowY} r={4} className="rp-live-spark-now" />

        <text
          x={Math.min(nowX + 8, w - padR - 4)}
          y={Math.max(nowY - 8, padT + 10)}
          className="rp-live-spark-label"
        >
          {eur(last.net)}
        </text>

        <circle
          cx={closeX}
          cy={yOf(endExpected.net)}
          r={2.5}
          className="rp-live-spark-close"
        />
        <text
          x={closeX - 2}
          y={yOf(endExpected.net) - 8}
          textAnchor="end"
          className="rp-live-spark-label-muted"
        >
          {eur(state.forecastClose)}
        </text>

        <text x={4} y={padT + 4} className="rp-live-spark-axis">
          {eur(maxY)}
        </text>
        <text x={4} y={padT + plotH} className="rp-live-spark-axis">
          0
        </text>

        {ticks.map((tick) => (
          <text
            key={tick.label}
            x={xOf(tick.t)}
            y={h - 6}
            textAnchor={
              tick.t === 0 ? "start" : tick.t === maxT ? "end" : "middle"
            }
            className="rp-live-spark-axis"
          >
            {tick.label}
          </text>
        ))}
      </svg>

      <div className="rp-live-pace-viz-stats">
        <div>
          <span>Now</span>
          <strong>{eur(state.netSales)}</strong>
        </div>
        <div>
          <span>Expected</span>
          <strong>{eur(state.expectedByNow)}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <strong>{eur(lastNet(delivery))}</strong>
        </div>
        <div>
          <span>{topProvider?.label ?? "Velocity"}</span>
          <strong>
            {topProvider
              ? eur(lastNet(topProvider))
              : eur(state.velocityPerMinute)}
            {!topProvider ? <em>/min</em> : null}
          </strong>
        </div>
      </div>

      <div className="rp-live-pace-viz-legend">
        <span data-series="actual">Total</span>
        <span data-series="expected">Expected</span>
        {overlayStreams.map((s) => (
          <span key={s.id} data-stream={s.tone}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
