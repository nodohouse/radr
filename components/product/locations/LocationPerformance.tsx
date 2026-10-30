"use client";

import { useMemo, useState } from "react";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { LocationIntel } from "@/lib/radr/location/composeLocationIntel";
import {
  slicePeriod,
  type HistoryPeriod,
} from "@/lib/radr/location/historyEngine";

function money(n: number) {
  return formatDecisionMoney(n);
}

const PERIODS: { id: HistoryPeriod; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "mtd", label: "MTD" },
  { id: "qtd", label: "QTD" },
  { id: "ytd", label: "YTD" },
  { id: "12m", label: "12M" },
  { id: "24m", label: "24M" },
];

export function LocationPerformance({ intel }: { intel: LocationIntel }) {
  const [period, setPeriod] = useState<HistoryPeriod>("mtd");
  const [metric, setMetric] = useState<"revenue" | "contribution" | "margin">(
    "contribution",
  );

  const daily = useMemo(
    () => slicePeriod(intel.daily, period),
    [intel.daily, period],
  );
  const months = intel.months.slice(period === "24m" ? 0 : -12);

  const maxY = Math.max(
    ...daily.map((d) =>
      metric === "revenue"
        ? d.revenue
        : metric === "contribution"
          ? d.contribution
          : (d.contribution / Math.max(1, d.revenue)) * 100,
    ),
    1,
  );

  // Calendar: last 35 days
  const cal = daily.slice(-35);

  return (
    <div className="rp-loc-perf">
      <header className="rp-loc-perf-head">
        <div>
          <p className="rp-cc-kicker">Performance</p>
          <h2>Historical operating brain</h2>
        </div>
        <div className="rp-loc-perf-periods" role="group" aria-label="Period">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              data-active={period === p.id ? "true" : undefined}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="rp-loc-perf-metric" role="group" aria-label="Metric">
        {(
          [
            ["revenue", "Revenue"],
            ["contribution", "Contribution"],
            ["margin", "Margin"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            data-active={metric === id ? "true" : undefined}
            onClick={() => setMetric(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rp-loc-perf-chart" aria-label="Trajectory">
        <svg viewBox="0 0 720 160" className="rp-loc-perf-svg" role="img">
          <polyline
            fill="none"
            stroke="rgba(10,13,11,0.55)"
            strokeWidth="1.5"
            points={daily
              .map((d, i) => {
                const x = (i / Math.max(1, daily.length - 1)) * 700 + 10;
                const v =
                  metric === "revenue"
                    ? d.revenue
                    : metric === "contribution"
                      ? d.contribution
                      : (d.contribution / Math.max(1, d.revenue)) * 100;
                const y = 140 - (v / maxY) * 120;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* Plan band reference */}
          <line
            x1="10"
            x2="710"
            y1="70"
            y2="70"
            stroke="rgba(10,13,11,0.12)"
            strokeDasharray="4 4"
          />
        </svg>
        <p className="rp-ccx-quiet">
          Actual · dashed = plan reference · {daily.length} days
        </p>
      </div>

      <section className="rp-loc-perf-cal" aria-label="Performance calendar">
        <p className="rp-cc-kicker">Calendar · contribution vs plan</p>
        <div className="rp-loc-perf-cal-grid">
          {cal.map((d) => {
            const tone = d.vsPlanContrib >= 0 ? "pos" : "neg";
            return (
              <button
                key={d.date}
                type="button"
                className="rp-loc-perf-cell"
                data-tone={tone}
                title={`${d.date} · Rev ${money(d.revenue)} · Contrib ${money(d.contribution)} · Refunds ${money(d.refunds)}${d.contextLabel ? ` · ${d.contextLabel}` : ""}`}
              />
            );
          })}
        </div>
      </section>

      <div className="rp-loc-cmd-grid">
        <section>
          <p className="rp-cc-kicker">Daypart</p>
          <h2>How the day behaves</h2>
          <table className="rp-loc-perf-table">
            <thead>
              <tr>
                <th>Daypart</th>
                <th>Rev %</th>
                <th>Contrib %</th>
                <th>Refund %</th>
                <th>Pressure</th>
              </tr>
            </thead>
            <tbody>
              {intel.dayparts.map((r) => (
                <tr key={r.id}>
                  <td>{r.label}</td>
                  <td>{r.revenueSharePct}</td>
                  <td>{r.contributionSharePct}</td>
                  <td>{r.refundPct}</td>
                  <td>{Math.round(r.kitchenPressure * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <p className="rp-cc-kicker">Weekday</p>
          <h2>Learned Mon → Sun</h2>
          <ul className="rp-loc-weekday" role="table" aria-label="Weekday patterns">
            <li className="rp-loc-weekday-head" role="row">
              <span role="columnheader">Day</span>
              <span role="columnheader">Covers</span>
              <span role="columnheader">Revenue</span>
              <span role="columnheader">Margin</span>
            </li>
            {intel.weekdays
              .filter((w) => w.dow !== 0)
              .concat(intel.weekdays.filter((w) => w.dow === 0))
              .map((w) => (
                <li key={w.dow} role="row">
                  <strong role="cell">{w.label}</strong>
                  <span role="cell">
                    {w.coversVsAvgPct >= 0 ? "+" : ""}
                    {w.coversVsAvgPct}%
                  </span>
                  <span role="cell">
                    {w.revenueVsAvgPct >= 0 ? "+" : ""}
                    {w.revenueVsAvgPct}%
                  </span>
                  <span role="cell">
                    {w.contribMarginDeltaPp >= 0 ? "+" : ""}
                    {w.contribMarginDeltaPp}pp
                  </span>
                  <em>{w.note}</em>
                </li>
              ))}
          </ul>
        </section>

        <section>
          <p className="rp-cc-kicker">Menu</p>
          <h2>Best sellers · contributors</h2>
          <ul className="rp-loc-menu-intel">
            {intel.menu.map((m) => (
              <li key={m.name} data-action={m.action}>
                <strong>{m.name}</strong>
                <span>
                  Units {m.unitsDeltaPct >= 0 ? "+" : ""}
                  {m.unitsDeltaPct}% · Contrib {m.contribDeltaPct >= 0 ? "+" : ""}
                  {m.contribDeltaPct}%
                </span>
                <em>{m.action}</em>
                <p>{m.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="rp-cc-kicker">24M months</p>
          <h2>Long view</h2>
          <ul className="rp-loc-months">
            {months.slice(-6).map((m) => (
              <li key={m.month}>
                <strong>{m.month}</strong>
                <span>{money(m.revenue)}</span>
                <em data-tone={m.contribution >= m.planContribution ? "pos" : "neg"}>
                  {money(m.contribution)}
                </em>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
