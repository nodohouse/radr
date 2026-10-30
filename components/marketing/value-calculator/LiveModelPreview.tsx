"use client";

import {
  LOCATION_OPTIONS,
  optionById,
  PAIN_BY_VERTICAL,
  PCT_OPTIONS,
  previewConfidence,
  REVENUE_OPTIONS_USD,
  verticalLabel,
  type JourneyState,
} from "@/lib/marketing/value-calculator";

type Props = { journey: JourneyState };

export function LiveModelPreview({ journey }: Props) {
  const conf = previewConfidence(journey);
  const loc = optionById(LOCATION_OPTIONS, journey.locationsId);
  const rev = optionById(REVENUE_OPTIONS_USD, journey.revenueId);
  const labor = optionById(PCT_OPTIONS, journey.laborId);
  const food = optionById(PCT_OPTIONS, journey.foodId);
  const pains =
    journey.vertical && !journey.painUnsure
      ? PAIN_BY_VERTICAL[journey.vertical].filter((p) =>
          journey.painAreas.includes(p.id),
        )
      : [];

  return (
    <aside className="vc2-preview" aria-live="polite">
      <p className="rx30-kicker">Live model preview</p>
      <h2 className="vc2-preview-title">Your Value Map is forming.</h2>
      <p className="vc2-preview-note">
        Full financial results appear after you finish — not before.
      </p>

      <div className="vc2-preview-block">
        <span>Operation</span>
        <strong>
          {journey.vertical ? verticalLabel(journey.vertical) : "—"}
        </strong>
      </div>

      <div className="vc2-preview-block">
        <span>Scale</span>
        <strong>
          {loc ? `${loc.label} locations` : "—"}
          {rev ? ` · ${rev.label}` : ""}
        </strong>
      </div>

      <div className="vc2-preview-block">
        <span>Economics</span>
        <ul className="vc2-chips">
          {labor && labor.id !== "unknown" ? (
            <li>Labor {labor.label}</li>
          ) : labor?.id === "unknown" ? (
            <li data-assumed>Labor assumed</li>
          ) : (
            <li data-empty>Labor</li>
          )}
          {journey.vertical === "restaurant" || journey.vertical === "mixed" ? (
            food && food.id !== "unknown" ? (
              <li>Food {food.label}</li>
            ) : food?.id === "unknown" ? (
              <li data-assumed>Food assumed</li>
            ) : (
              <li data-empty>Food cost</li>
            )
          ) : null}
        </ul>
      </div>

      <div className="vc2-preview-block">
        <span>Opportunity signals</span>
        {journey.painUnsure ? (
          <strong>Scan everything</strong>
        ) : pains.length ? (
          <ul className="vc2-chips">
            {pains.map((p) => (
              <li key={p.id}>{p.label}</li>
            ))}
          </ul>
        ) : (
          <strong>—</strong>
        )}
      </div>

      <div className="vc2-preview-conf" data-level={conf.level}>
        <span>Model confidence</span>
        <strong>{conf.level}</strong>
      </div>
    </aside>
  );
}
