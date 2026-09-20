"use client";

import type { Prediction } from "@/lib/radr/domain/intelligence";

/**
 * Explainable prediction chip — WHAT / WHY / HOW SURE / WHAT TO DO.
 */
export function PredictionChip({ prediction }: { prediction: Prediction }) {
  return (
    <article className="rp-pred-chip" data-confidence={prediction.confidence}>
      <p className="rp-pred-kicker">
        Predicted · {prediction.confidence} confidence
      </p>
      <h3 className="rp-pred-what">{prediction.what}</h3>
      {prediction.drivers.length > 0 ? (
        <ul className="rp-pred-why">
          {prediction.drivers.map((d) => (
            <li key={d.id}>{d.label}</li>
          ))}
        </ul>
      ) : null}
      {prediction.historicalBaseline ? (
        <p className="rp-pred-base">{prediction.historicalBaseline}</p>
      ) : null}
      {prediction.recommendedAction ? (
        <p className="rp-pred-do">
          WHAT RADR NEEDS · {prediction.recommendedAction}
        </p>
      ) : null}
    </article>
  );
}
