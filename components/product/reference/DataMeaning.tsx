"use client";
import { useId, useState } from "react";
import { projectedSensitivity } from "@/lib/product/performanceSensitivity";
import type { TrendSeries } from "@/lib/product/performanceTrend";
import "./data-presentation.css";

export function MetricKind({
  kind,
}: {
  kind: "recorded" | "modeled" | "projected" | "verified";
}) {
  const names = {
    recorded: "Recorded sample",
    modeled: "Modeled",
    projected: "Projection",
    verified: "Evidence linked",
  };
  return (
    <span className="dp-kind" data-kind={kind}>
      {names[kind]}
    </span>
  );
}
export function DataMeaning({
  scope,
  currency,
  period,
}: {
  scope: string;
  currency: string;
  period: string;
}) {
  return (
    <details className="dp-meaning">
      <summary>
        <span>Understand these numbers</span>
        <span>
          {scope} · {currency} · {period}
        </span>
      </summary>
      <div className="dp-meaning-grid">
        <article>
          <MetricKind kind="recorded" />
          <h3>What was recorded</h3>
          <p>
            Booked sales in the selected period. Revenue is not a bank balance
            or a cash settlement.
          </p>
        </article>
        <article>
          <MetricKind kind="modeled" />
          <h3>What was calculated</h3>
          <p>
            Contribution subtracts the stated costs and allocations from
            revenue. It is not net profit. Inspect the cost breakdown before
            acting.
          </p>
        </article>
        <article>
          <MetricKind kind="projected" />
          <h3>What may happen</h3>
          <p>
            Projected close is a scenario based on the current pace and
            assumptions. It is not guaranteed revenue.
          </p>
        </article>
        <article>
          <MetricKind kind="verified" />
          <h3>What has evidence</h3>
          <p>
            Decision outcomes have their own evidence and attribution. Keep them
            separate from revenue and expected benefits; never add those figures
            together.
          </p>
        </article>
      </div>
    </details>
  );
}
export function ForecastSensitivity({ series }: { series: TrendSeries }) {
  const [change, setChange] = useState(10);
  const id = useId();
  const money = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: series.currency,
      maximumFractionDigits: 0,
    }).format(n);
  // Only the remaining modeled component is perturbed.
  const { low, high } = projectedSensitivity(
    series.actual,
    series.projected,
    change,
  );
  return (
    <details className="dp-sensitivity">
      <summary>
        Test forecast assumptions{" "}
        <span>What if the remaining revenue changes?</span>
      </summary>
      <div className="dp-sensitivity-body">
        <div>
          <p className="dp-eyebrow">SCENARIO EXPLORER · {series.currency}</p>
          <h3>A range you control.</h3>
          <p>
            Adjust the remaining modeled revenue. Recorded revenue stays fixed.
            This is a sensitivity test, not a statistical confidence interval.
          </p>
          <label htmlFor={id}>Remaining revenue variation: ±{change}%</label>
          <input
            id={id}
            type="range"
            min="0"
            max="30"
            step="1"
            value={change}
            onChange={(e) => setChange(Number(e.target.value))}
            aria-label="Remaining revenue variation"
            aria-valuetext={`Plus or minus ${change} percent of remaining modeled revenue`}
          />
        </div>
        <dl aria-live="polite">
          <div>
            <dt>Lower scenario</dt>
            <dd>{money(low)}</dd>
          </div>
          <div>
            <dt>Current projection</dt>
            <dd>{money(series.projected)}</dd>
          </div>
          <div>
            <dt>Higher scenario</dt>
            <dd>{money(high)}</dd>
          </div>
        </dl>
      </div>
      <p className="dp-caveat">
        {series.label} · same reporting period. Demand, cancellations, pricing
        and operating capacity can change the outcome. A validated prediction
        interval is not available for these demo trajectories.
      </p>
    </details>
  );
}
