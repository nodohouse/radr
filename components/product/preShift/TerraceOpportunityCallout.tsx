"use client";

import { formatMoney } from "@/lib/radr/money";
import type { WeatherOperatingImpact } from "@/lib/radr/preShift/weatherImpact";

type Props = {
  impact: WeatherOperatingImpact;
  onReview: () => void;
};

/**
 * Calm but unmistakable: good weather × terrace venue → economic move.
 */
export function TerraceOpportunityCallout({ impact, onReview }: Props) {
  if (!impact.hasTerrace || impact.decision !== "OPEN") return null;

  return (
    <article
      className="rp-terrace-callout"
      data-tour-target="terrace-weather"
      aria-label="Terrace weather opportunity"
    >
      <div className="rp-terrace-callout-main">
        <p className="rp-terrace-kicker">
          Terrace · Weather correlation
        </p>
        <h2>{impact.headline}</h2>
        <p className="rp-terrace-wx">
          {impact.weather.temperatureC}°C · {impact.weather.conditionLabel} ·{" "}
          {impact.weather.precipitationProbabilityPct}% rain
        </p>
        <p className="rp-terrace-hist">
          At this location, warm dry dinners lift terrace covers by about{" "}
          <strong>+{impact.historicalTerraceLiftCovers}</strong>
          {impact.comparableLiftPct != null ? (
            <>
              {" "}
              (+{impact.comparableLiftPct}% · n={impact.comparableSampleSize})
            </>
          ) : null}
          .
        </p>
        <p className="rp-terrace-rec">{impact.recommendation}</p>
      </div>
      <div className="rp-terrace-callout-econ">
        <p>
          <strong>
            {formatMoney({
              amount: impact.incrementalRevenue,
              currency: "EUR",
              locale: "de-DE",
            })}
          </strong>
          <span>incremental revenue</span>
        </p>
        <p>
          <strong>
            {formatMoney({
              amount: impact.netExpectedContribution,
              currency: "EUR",
              locale: "de-DE",
            })}
          </strong>
          <span>
            net after{" "}
            {formatMoney({
              amount: impact.fohCostToCapture,
              currency: "EUR",
              locale: "de-DE",
            })}{" "}
            FOH
          </span>
        </p>
        <button type="button" className="rp-cc3-cta" onClick={onReview}>
          Review terrace plan
        </button>
      </div>
    </article>
  );
}
