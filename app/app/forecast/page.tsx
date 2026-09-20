"use client";

import Link from "next/link";
import { FORWARD_WEEK } from "@/lib/radr/operatingPulse";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { PageHeader } from "@/components/product/PageHeader";
import { StatusCalm } from "@/components/product/StatusCalm";
import { WeatherOperatingStrip } from "@/components/product/WeatherOperatingStrip";

/**
 * Forecast - what is likely to happen?
 * Material windows only: covers, staffing, money, recommendation.
 */
export default function ForecastPage() {
  const material = FORWARD_WEEK.filter(
    (d) => (d.covers ?? 0) >= 165 || Boolean(d.context?.confidenceWhy),
  );
  const rows = (material.length ? material : FORWARD_WEEK.slice(0, 3)).slice(
    0,
    4,
  );

  return (
    <div className="rp-attention">
      <PageHeader
        title="Forecast"
        sub="What is likely to happen - and what needs a decision."
      />

      <WeatherOperatingStrip />

      <ul className="rp-attention-list" aria-label="Forecast windows">
        {rows.map((d) => {
          const short = d.covers != null && d.covers > 200;
          return (
            <li key={d.key} className="rp-attention-row">
              <div className="rp-attention-main">
                <p className="rp-attention-terr">Coming up</p>
                <h2 className="rp-attention-issue">{d.fullLabel}</h2>
                <p className="rp-attention-meta">
                  Expected covers {d.covers ?? " - "}
                  {d.margin != null ? ` · Margin ${d.margin.toFixed(1)}%` : ""}
                </p>
                {short ? (
                  <p className="rp-attention-rec">
                    <em>RADR recommends</em>
                    <span>Review staffing for peak service</span>
                  </p>
                ) : d.context?.confidenceWhy ? (
                  <p className="rp-attention-meta">{d.context.confidenceWhy}</p>
                ) : null}
              </div>
              <div className="rp-attention-money">
                <strong>{formatCompactEuro(d.revenue)}</strong>
                <span>expected revenue</span>
              </div>
              <div className="rp-attention-cta">
                <Link href="/app/findings" className="rp-btn-secondary">
                  Review
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <StatusCalm detail="Open a day only when the forecast creates a decision." />
    </div>
  );
}
