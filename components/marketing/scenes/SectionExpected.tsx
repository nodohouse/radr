import { EXPECTED_SOURCES } from "../config/architecture";
import { BRAND } from "../config/brand";
import { signalByChannel } from "../data/demo";

const EXAMPLES = [
  {
    id: "buy",
    channel: "BUY",
    expected: { label: "Contract", value: "€31.20" },
    actual: { label: "Invoice", value: "€34.80" },
    delta: "△ €3.60 / case",
  },
  {
    id: "labor",
    channel: "LABOR",
    expected: { label: "Needed", value: "11" },
    actual: { label: "Scheduled", value: "14" },
    delta: "△ 3 · €840 / night",
  },
  {
    id: "recover",
    channel: "RECOVER",
    expected: { label: "Credit due", value: "€4,280" },
    actual: { label: "Received", value: "€0" },
    delta: "△ €4,280",
  },
  {
    id: "sell",
    channel: "SELL",
    expected: { label: "Rate opportunity", value: "€395" },
    actual: { label: "Rate sold", value: "€360" },
    delta: "△ €35 / room",
  },
] as const;

/**
 * Conceptual engine — expected vs actual → △.
 */
export function SectionExpected() {
  const buy = signalByChannel("buy");

  return (
    <section
      className="rx-section rx-dark rx-expected"
      id="expected"
      data-nav-theme="dark"
    >
      <div className="rx-shell">
        <div className="rx-expected-intro">
          <p className="rx-kicker">The engine</p>
          <h2 className="rx-display">
            Expected
            <br />
            vs actual.
          </h2>
          <p className="rx-lead-inv rx-lead-short">
            {BRAND.coreIdea} RADR determines what should have happened — then
            finds the financial and operational difference.
          </p>
        </div>

        <div className="rx-expected-board">
          {EXAMPLES.map((ex) => (
            <article key={ex.id} className="rx-expected-card">
              <p className="rx-meta-label">{ex.channel}</p>
              <div className="rx-expected-pair">
                <div>
                  <em>{ex.expected.label}</em>
                  <strong className="rx-money">{ex.expected.value}</strong>
                </div>
                <div data-flag="true">
                  <em>{ex.actual.label}</em>
                  <strong className="rx-money">{ex.actual.value}</strong>
                </div>
              </div>
              <p className="rx-expected-delta">
                <span className="rx-tri">△</span> {ex.delta.replace(/^△\s*/, "")}
              </p>
            </article>
          ))}
        </div>

        <div className="rx-expected-sources">
          <p className="rx-kicker">Where “expected” comes from</p>
          <p className="rx-lead-inv rx-lead-short">
            Expected is not always a hardcoded rule. It can come from contracts,
            patterns, forecasts, budgets, policies, commercial terms, prior
            resolutions and user-defined rules.
          </p>
          <ul>
            {EXPECTED_SOURCES.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="rx-expected-signal">
            Signal 001 · {buy.title} ·{" "}
            <strong className="rx-money">
              {buy.amount}
              {buy.period}
            </strong>
          </p>
        </div>
      </div>
    </section>
  );
}
