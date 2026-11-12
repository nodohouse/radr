"use client";
import {
  financialInputs,
  revenueDescription,
} from "@/lib/marketing/value-calculator/presentation";
import {
  LOCATION_OPTIONS,
  optionById,
  verticalLabel,
  type JourneyState,
} from "@/lib/marketing/value-calculator";

export function LiveModelPreview({ journey }: { journey: JourneyState }) {
  const inputs = financialInputs(journey);
  const supplied = inputs.filter((i) => i.supplied).length;
  const loc = optionById(LOCATION_OPTIONS, journey.locationsId);
  return (
    <aside className="vc3-preview" aria-label="Your model inputs">
      <span className="vc3-eyebrow">Your model, taking shape</span>
      <h2>
        Every input
        <br />
        has a role.
      </h2>
      <dl>
        <div>
          <dt>Operation</dt>
          <dd>
            {journey.vertical
              ? verticalLabel(journey.vertical)
              : "Choose your operation"}
          </dd>
        </div>
        <div>
          <dt>Location context</dt>
          <dd>{loc ? `${loc.label} locations` : "Add your location count"}</dd>
        </div>
        <div>
          <dt>Combined annual revenue</dt>
          <dd>{revenueDescription(journey)}</dd>
        </div>
      </dl>
      <div className="vc3-coverage">
        <div>
          <span>Financial input coverage</span>
          <strong>
            {supplied} / {inputs.length}
          </strong>
        </div>
        <span className="vc3-coverage-track">
          <i style={{ width: `${(supplied / inputs.length) * 100}%` }} />
        </span>
        <p>
          Coverage describes supplied inputs, not the probability of a financial
          outcome.
        </p>
      </div>
      <ul className="vc3-input-status">
        {inputs.slice(1).map((i) => (
          <li key={i.label} data-supplied={i.supplied}>
            <span>{i.label}</span>
            <b>{i.supplied ? "Supplied" : "Model default"}</b>
          </li>
        ))}
      </ul>
      <p className="vc3-privacy">
        Your financial inputs stay in this browser. Nothing is sent to a sales
        form.
      </p>
    </aside>
  );
}
