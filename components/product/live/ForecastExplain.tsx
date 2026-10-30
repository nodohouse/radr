"use client";

/**
 * Explainable forecast — click expected close → drivers.
 */

import { useState } from "react";
import type { ForecastResult } from "@/lib/radr/forecast";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

export function ForecastExplain({
  forecast,
  compactLabel,
}: {
  forecast: ForecastResult;
  compactLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rp-fcexplain">
      <button
        type="button"
        className="rp-fcexplain-trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <strong>{formatDecisionMoney(forecast.pointEstimate)}</strong>
        <span>{compactLabel ?? "Expected close"}</span>
        {forecast.lowerBound != null && forecast.upperBound != null ? (
          <em>
            {formatDecisionMoney(forecast.lowerBound)}–
            {formatDecisionMoney(forecast.upperBound)}
          </em>
        ) : null}
        <i aria-hidden="true">{open ? "−" : "?"}</i>
      </button>

      {open ? (
        <div className="rp-fcexplain-body">
          <p className="rp-fcexplain-k">Why this forecast</p>
          <ul>
            {forecast.drivers.map((d) => (
              <li key={d.id} data-kind={d.kind}>
                <span>{d.label}</span>
                <strong>
                  {d.amountEuro != null
                    ? `${d.amountEuro >= 0 ? "+" : "−"}${formatDecisionMoney(Math.abs(d.amountEuro))}`
                    : d.amountPct != null
                      ? `${d.amountPct >= 0 ? "+" : ""}${d.amountPct}%`
                      : "—"}
                </strong>
                <em>{d.observedOrModeled}</em>
              </li>
            ))}
          </ul>
          <p className="rp-fcexplain-meta">
            {forecast.comparisonLabel}
            {forecast.historicalErrorPct != null
              ? ` · Historical error ${forecast.historicalErrorPct}%`
              : ""}
            {" · "}
            {forecast.modelVersion}
          </p>
          <p className="rp-fcexplain-fresh">{forecast.sourceFreshness}</p>
        </div>
      ) : null}
    </div>
  );
}
