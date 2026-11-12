"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import {
  ValueLensChart,
  ValueDecisionBridge,
  ValueDecisionExample,
  ValueNextSteps,
} from "./ValueResultStory";
import { resultStory } from "@/lib/marketing/value-calculator/resultStory";
import { categoryDisplayLabel, categoryExplanation } from "./valueMapSemantics";
import {
  LOCATION_OPTIONS,
  OPPORTUNITY_ASSUMPTIONS,
  PORTFOLIO,
  optionById,
  resolveEngineInput,
  formatMoneyIntl,
  formatRangeIntl,
  verticalLabel,
  type CategoryId,
  type JourneyState,
  type ValueCalculatorResult,
} from "@/lib/marketing/value-calculator";
import {
  financialInputs,
  revenueDescription,
  valueMapCsv,
} from "@/lib/marketing/value-calculator/presentation";

type Props = {
  journey: JourneyState;
  result: ValueCalculatorResult;
  onEdit: () => void;
  onPatch: (p: Partial<JourneyState>) => void;
};

export function ValueMapResult({ journey, result, onEdit, onPatch }: Props) {
  const heading = useRef<HTMLHeadingElement>(null);
  const detail = useRef<HTMLElement>(null);
  const detailHeading = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotionSafe();
  const [activeId, setActiveId] = useState(
    result.startingOpportunity ?? result.categories[0]?.id ?? "",
  );
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");
  const [budgetText, setBudgetText] = useState(
    journey.investmentExact ? String(journey.investmentExact) : "",
  );
  const [notice, setNotice] = useState("");
  const hasRevenue = (resolveEngineInput(journey)?.annualRevenue ?? 0) > 0;
  const inputs = financialInputs(journey);
  const supplied = inputs.filter((i) => i.supplied).length;
  const active =
    result.categories.find((c) => c.id === activeId) ?? result.categories[0];
  const explanation = active
    ? categoryExplanation(active.id, journey.vertical)
    : null;
  const divisor = period === "monthly" ? 12 : 1;
  const horizon = period === "monthly" ? "per month" : "per year";
  const money = (n: number) => formatMoneyIntl(n / divisor, result.currency);
  const range = (low: number, high: number) =>
    formatRangeIntl(low / divisor, high / divisor, result.currency);
  const max = Math.max(...result.categories.map((c) => c.modeled), 1);
  const assumptions = OPPORTUNITY_ASSUMPTIONS.flatMap((assumption) => {
    const category = result.categories.find(
      (c) => c.id === assumption.categoryId,
    );
    return category ? [{ assumption, category }] : [];
  });
  const story = resultStory(journey);
  const loc = optionById(LOCATION_OPTIONS, journey.locationsId);
  const budgetInvalid =
    budgetText !== "" &&
    (!Number.isFinite(Number(budgetText)) ||
      Number(budgetText) <= 0 ||
      Number(budgetText) > 1e12);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  function selectCategory(id: CategoryId) {
    setActiveId(id);
    if (window.matchMedia("(max-width: 900px)").matches) {
      requestAnimationFrame(() => {
        detailHeading.current?.focus({ preventScroll: true });
        detail.current?.scrollIntoView({
          block: "start",
          behavior: reduced ? "instant" : "smooth",
        });
      });
    }
  }
  function backToAreas() {
    const title = document.getElementById("vc3-breakdown-title");
    title?.focus({ preventScroll: true });
    title?.scrollIntoView({
      block: "start",
      behavior: reduced ? "instant" : "smooth",
    });
  }
  function download() {
    const url = URL.createObjectURL(
      new Blob([valueMapCsv(journey, result)], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "RADR-value-map.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(
      "Your annual Value Map was downloaded with its inputs and assumptions.",
    );
  }

  return (
    <div className="vc3-result vc-res">
      <header className="vc3-result-head vc-res-head">
        <div>
          <span className="vc3-eyebrow">
            {journey.example
              ? `Illustrative ${journey.example} example`
              : "Your RADR Value Map"}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {story.title}
            <br />
            <em>{story.subtitle}</em>
          </h1>
          <p>
            {journey.example
              ? "Example inputs remain illustrative, including any edits you make."
              : "A financial scenario from your inputs and adjustable assumptions."}
          </p>
        </div>
        <div className="vc3-result-actions">
          <button className="vc3-btn vc3-btn--light" onClick={onEdit}>
            Edit inputs
          </button>
          <button className="vc3-btn vc3-btn--light" onClick={download}>
            Download CSV ↓
          </button>
          <button
            className="vc3-btn vc3-btn--light"
            onClick={() => window.print()}
          >
            Print / save Value Map
          </button>
        </div>
      </header>
      <div className="vc3-result-context">
        <span>
          {verticalLabel(journey.vertical)} · {loc?.label}{" "}
          {journey.vertical === "hotel" ? "properties" : "locations"}
        </span>
        <span>{revenueDescription(journey)}</span>
        <span>
          {journey.currency === "OTHER" ? "Currency units" : journey.currency} ·
          all locations combined
        </span>
      </div>
      <div className="vc3-period">
        <p>Read the same scenario over your preferred horizon.</p>
        <div role="group" aria-label="Result horizon">
          {(["annual", "monthly"] as const).map((p) => (
            <button
              key={p}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
            >
              {p === "annual" ? "Annual" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      <section className="vc3-summary" aria-label="Modeled exposure summary">
        <div className="vc3-summary-main">
          <span className="vc3-eyebrow">Modeled exposure to investigate</span>
          <strong data-testid="exposure-range">
            {hasRevenue
              ? range(result.total.low, result.total.modeled)
              : "Add revenue to see a range"}
          </strong>
          <p>
            {hasRevenue
              ? `${horizon} · adjusted for overlapping categories`
              : "Explore the categories below. No revenue amount has been invented for your operation."}
          </p>
          <div className="vc3-scenarios">
            {[
              ["Lower", result.total.low],
              ["Central", result.total.modeled],
              ["Higher", result.total.high],
            ].map(([label, amount]) => (
              <div key={label}>
                <span>{label} scenario</span>
                <b
                  data-testid={
                    label === "Central" ? "central-exposure" : undefined
                  }
                >
                  {hasRevenue ? money(Number(amount)) : "Revenue needed"}
                </b>
              </div>
            ))}
          </div>
          <small>
            These are assumption scenarios, not statistical confidence intervals
            or confirmed losses.
          </small>
        </div>
        <div className="vc3-summary-capture">
          <span className="vc3-eyebrow">Your capture scenario</span>
          <h2>
            What if you capture
            <br />
            {Math.round(result.captureScenario.rate * 100)}%?
          </h2>
          <strong data-testid="capture-range">
            {hasRevenue
              ? range(
                  result.captureScenario.capturedLow,
                  result.captureScenario.capturedModeled,
                )
              : "Revenue needed"}
          </strong>
          <p>{horizon} · illustrative captured value</p>
          <label className="vc3-capture-slider">
            <span>Adjust modeled capture</span>
            <input
              aria-label="Modeled capture percentage"
              type="range"
              min="5"
              max="50"
              step="1"
              value={Math.round(result.captureScenario.rate * 100)}
              onChange={(e) =>
                onPatch({ captureRate: Number(e.target.value) / 100 })
              }
            />
            <span>
              <b>5%</b>
              <b>50%</b>
            </span>
          </label>
          <p>
            Capture is the share of modeled exposure you choose to realize in
            this scenario. It is not a RADR performance claim.
          </p>
        </div>
      </section>

      <ValueDecisionBridge
        journey={journey}
        active={active}
        hasRevenue={hasRevenue}
        divisor={divisor}
      />

      <div className="vc3-analysis-grid">
        <section
          className="vc3-panel vc3-breakdown"
          aria-labelledby="vc3-breakdown-title"
        >
          <div className="vc3-panel-top">
            <div>
              <span className="vc3-eyebrow">Follow the contribution</span>
              <h2 id="vc3-breakdown-title" tabIndex={-1}>
                Where the model points.
              </h2>
            </div>
            <span className="vc3-count">{result.categories.length} areas</span>
          </div>
          <p>
            Select an area to see what it means, the calculation and the records
            to check.
          </p>
          <ValueLensChart
            categories={result.categories}
            active={active}
            journey={journey}
            divisor={divisor}
            onSelect={selectCategory}
          />
          <div className="vc3-category-bars">
            {result.categories.map((c) => (
              <button
                key={c.id}
                aria-pressed={active?.id === c.id}
                onClick={() => selectCategory(c.id)}
              >
                <span>
                  <strong>{categoryDisplayLabel(c, journey.vertical)}</strong>
                  <b>
                    {hasRevenue ? range(c.low, c.modeled) : "Revenue needed"}
                  </b>
                </span>
                <span className="vc3-bar-track">
                  <i
                    aria-hidden
                    style={{
                      width: hasRevenue ? `${(c.modeled / max) * 100}%` : "0%",
                    }}
                  />
                </span>
                <small>
                  {c.id === result.startingOpportunity
                    ? "Suggested first check · "
                    : ""}
                  {hasRevenue && result.total.modeled > 0
                    ? `${Math.round((c.modeled / result.total.modeled) * 100)}% of the central model`
                    : "Select to understand this area"}
                </small>
              </button>
            ))}
          </div>
          <p className="vc3-small">
            Bars show central scenario amounts. The adjusted category amounts
            add to the displayed total. All monetary values here are {horizon}.
          </p>
        </section>
        <section
          className="vc3-panel vc3-category-detail"
          aria-label="Selected category details"
          ref={detail}
          data-category={active?.id}
        >
          {active && explanation ? (
            <>
              <button
                className="vc3-text-button vc3-mobile-back"
                onClick={backToAreas}
              >
                ↑ Back to operating areas
              </button>
              <span className="vc3-eyebrow">Understand this area</span>
              <h2 ref={detailHeading} tabIndex={-1}>
                {categoryDisplayLabel(active, journey.vertical)}
              </h2>
              <p className="vc3-detail-meaning">{explanation.meaning}</p>
              <div className="vc3-example">
                <span>For example</span>
                <p>{explanation.example}</p>
              </div>
              <div className="vc3-detail-value">
                <span>Adjusted exposure · {horizon}</span>
                <strong>
                  {hasRevenue
                    ? range(active.low, active.modeled)
                    : "Add revenue to quantify"}
                </strong>
              </div>
              <ValueDecisionExample journey={journey} category={active} />
              <h3>Your first evidence check</h3>
              <ol className="vc3-evidence-steps">
                <li>
                  <b>Gather the records.</b>
                  <span>{active.evidenceNeeded.join(", ")}.</span>
                </li>
                <li>
                  <b>Compare like with like.</b>
                  <span>
                    Use the same locations, service period and accounting basis.
                  </span>
                </li>
                <li>
                  <b>Review the difference.</b>
                  <span>
                    Identify an owner and confirm the cause before treating it
                    as recoverable value.
                  </span>
                </li>
              </ol>
              <details className="vc3-detail-formula">
                <summary>Show this category’s calculation</summary>
                {hasRevenue && active.calculation ? (
                  <>
                    <p>
                      <b>
                        {formatMoneyIntl(
                          active.calculation.base,
                          result.currency,
                        )}
                      </b>{" "}
                      annual base ×{" "}
                      <b>
                        {(active.calculation.rates.base * 100).toLocaleString(
                          "en",
                          { maximumFractionDigits: 2 },
                        )}
                        %
                      </b>{" "}
                      central rate ={" "}
                      <b>
                        {formatMoneyIntl(
                          active.calculation.rawModeled,
                          result.currency,
                        )}
                      </b>{" "}
                      before adjustments.
                    </p>
                    <p>
                      Overlap multiplier:{" "}
                      {active.calculation.overlapFactor.toFixed(2)}. Portfolio
                      multiplier:{" "}
                      {active.calculation.portfolioFactor.toFixed(2)}. Amounts
                      are rounded after adjustment.
                    </p>
                    <p>
                      {active.assumedBase
                        ? "This base uses a model default for an unanswered financial input."
                        : "This base is derived from the revenue and financial choices supplied."}
                    </p>
                  </>
                ) : (
                  <p>
                    A revenue input is needed to calculate the financial base.
                  </p>
                )}
                <p>
                  Rates are internal modeling assumptions. You can change the
                  central rates in the assumptions panel below.
                </p>
              </details>
            </>
          ) : (
            <p>Select an applicable operating area.</p>
          )}
        </section>
      </div>

      <div className="vc3-secondary-grid">
        <section className="vc3-panel">
          <span className="vc3-eyebrow">Make the assumptions visible</span>
          <h2>Your inputs. The model’s defaults.</h2>
          <div className="vc3-coverage">
            <div>
              <span>Financial inputs supplied</span>
              <strong>
                {supplied} / {inputs.length}
              </strong>
            </div>
            <span className="vc3-coverage-track">
              <i style={{ width: `${(supplied / inputs.length) * 100}%` }} />
            </span>
          </div>
          <p>
            Input coverage is not a measure of outcome certainty. The calculator
            has not inspected source records.
          </p>
          <dl className="vc3-input-ledger">
            {inputs.map((r) => (
              <div key={r.label}>
                <dt>
                  {r.label}
                  <small>
                    {r.supplied ? "Supplied input" : "Model default / missing"}
                  </small>
                </dt>
                <dd>{r.value}</dd>
              </div>
            ))}
          </dl>
          <button className="vc3-text-button" onClick={onEdit}>
            Refine your inputs →
          </button>
        </section>
        <section className="vc3-panel">
          <span className="vc3-eyebrow">A scenario you control</span>
          <h2>Compare capture levels.</h2>
          <p>
            Exposure stays the same. This changes the share you choose to model
            as captured value.
          </p>
          <div className="vc3-capture-comparison">
            {[0.1, 0.2, 0.3].map((rate) => (
              <button
                key={rate}
                aria-pressed={Math.abs(journey.captureRate - rate) < 0.001}
                onClick={() => onPatch({ captureRate: rate })}
              >
                <span>{Math.round(rate * 100)}% capture</span>
                <i aria-hidden style={{ width: `${(rate / 0.5) * 100}%` }} />
                <strong>
                  {hasRevenue
                    ? money(result.total.modeled * rate)
                    : "Revenue needed"}
                </strong>
              </button>
            ))}
          </div>
          <div className="vc3-budget">
            <label>
              <strong>Your annual budget (optional)</strong>
              <small>
                Enter your own annual evaluation budget in{" "}
                {journey.currency === "OTHER"
                  ? "currency units"
                  : journey.currency}
                . This is not a RADR quote; plan prices remain pending.
              </small>
              <input
                aria-label="Your annual budget"
                type="number"
                min="0"
                max="1000000000000"
                step="any"
                inputMode="decimal"
                value={budgetText}
                aria-invalid={budgetInvalid}
                onChange={(e) => {
                  setBudgetText(e.target.value);
                  const n = Number(e.target.value);
                  onPatch({
                    investmentId: null,
                    investmentExact:
                      e.target.value !== "" &&
                      Number.isFinite(n) &&
                      n > 0 &&
                      n <= 1e12
                        ? n
                        : null,
                  });
                }}
              />
            </label>
            {budgetInvalid ? (
              <p className="vc3-error" role="alert">
                Enter a positive budget up to 1 trillion, or leave this blank.
              </p>
            ) : null}
            {!budgetInvalid && result.roi ? (
              <div
                className="vc3-roi-results"
                data-negative={result.roi.netLow < 0 ? "true" : undefined}
              >
                <div>
                  <span>Illustrative annual net return</span>
                  <strong data-testid="net-return">
                    {formatRangeIntl(
                      result.roi.netLow,
                      result.roi.netModeled,
                      result.currency,
                    )}
                  </strong>
                </div>
                <div>
                  <span>Illustrative annual ROI</span>
                  <strong>
                    {Math.round(result.roi.roiLow * 100)}% to{" "}
                    {Math.round(result.roi.roiModeled * 100)}%
                  </strong>
                </div>
                <div>
                  <span>Central scenario payback</span>
                  <strong>
                    {result.roi.paybackMonthsModeled == null
                      ? "Not available"
                      : result.roi.paybackMonthsModeled < 0.1
                        ? "Less than 0.1 month"
                        : `${result.roi.paybackMonthsModeled} months`}
                  </strong>
                </div>
                <p>
                  ROI = (annual modeled capture − annual budget) / annual
                  budget. Payback assumes a steady monthly capture rate and has
                  no implementation ramp-up. Revenue-based category estimates
                  are proxies, not confirmed profit.
                </p>
              </div>
            ) : (
              <p className="vc3-small">
                Add a budget and revenue to model net return and payback. The
                budget and ROI always use an annual horizon.
              </p>
            )}
          </div>
        </section>
      </div>

      <section
        className="vc3-panel vc3-methodology"
        aria-labelledby="vc3-methodology-title"
      >
        <div>
          <span className="vc3-eyebrow">Open the model</span>
          <h2 id="vc3-methodology-title">See how the numbers connect.</h2>
          <p>
            No industry loss rate is presented as a proven fact. The default
            rates are adjustable modeling assumptions.
          </p>
        </div>
        <details>
          <summary>How was this calculated?</summary>
          <ol className="vc3-math-ledger">
            <li>
              <span>Raw central exposure from selected categories</span>
              <b>
                {hasRevenue
                  ? formatMoneyIntl(
                      result.methodology.rawModeledTotal ??
                        result.total.modeled,
                      result.currency,
                    )
                  : "Revenue needed"}
              </b>
            </li>
            <li>
              <span>Reduction for overlapping categories</span>
              <b>
                {hasRevenue
                  ? formatMoneyIntl(
                      -(result.methodology.overlapReduction ?? 0),
                      result.currency,
                    )
                  : "Revenue needed"}
              </b>
            </li>
            <li>
              <span>Reduction from central-case portfolio limit</span>
              <b>
                {hasRevenue
                  ? formatMoneyIntl(
                      -(result.methodology.portfolioReduction ?? 0),
                      result.currency,
                    )
                  : "Revenue needed"}
              </b>
            </li>
            <li>
              <span>Adjusted central exposure per year</span>
              <b>
                {hasRevenue
                  ? formatMoneyIntl(result.total.modeled, result.currency)
                  : "Revenue needed"}
              </b>
            </li>
          </ol>
          <p>
            Related categories share an overlap group: the largest central
            amount is retained and secondary amounts use a{" "}
            {Math.round(PORTFOLIO.overlapCorrelationFactor * 100)}% multiplier.
            If the adjusted central sum exceeds{" "}
            {PORTFOLIO.portfolioCapRate * 100}% of revenue, the model scales
            category scenarios down together. This is a modeling guardrail, not
            a proven industry ceiling.
          </p>
          <p>
            Financial-process answers guide the review context and ranking,
            rather than reducing the exposure total. Monthly figures are annual
            figures divided by twelve, not a seasonal forecast.
          </p>
        </details>
        <details>
          <summary>Adjust central rate assumptions</summary>
          <p>
            Change rates only when you have a reason. Each slider stays within
            its category’s existing lower and higher assumptions.
          </p>
          <div className="vc3-rate-grid">
            {assumptions.map(({ assumption: a, category: c }) => {
              const value =
                (journey.rateOverrides?.[a.id]?.base ?? a.rates.base) * 100;
              return (
                <label key={a.id} data-assumption-id={a.id}>
                  <span>
                    {categoryDisplayLabel(c, journey.vertical)}
                    <b>
                      {value.toLocaleString("en", { maximumFractionDigits: 2 })}
                      %
                    </b>
                  </span>
                  <input
                    aria-label={`${categoryDisplayLabel(c, journey.vertical)} central rate`}
                    type="range"
                    min={a.rates.low * 100}
                    max={a.rates.high * 100}
                    step="0.01"
                    value={value}
                    onChange={(e) =>
                      onPatch({
                        rateOverrides: {
                          ...journey.rateOverrides,
                          [a.id]: {
                            ...a.rates,
                            base: Number(e.target.value) / 100,
                          },
                        },
                      })
                    }
                  />
                  <small>
                    {a.rates.low * 100}% lower · {a.rates.high * 100}% higher ·
                    internal model
                  </small>
                </label>
              );
            })}
          </div>
          <button
            className="vc3-text-button"
            onClick={() => onPatch({ rateOverrides: undefined })}
          >
            Reset category rates to defaults
          </button>
        </details>
        <details>
          <summary>Your record-review context</summary>
          <p>
            Review cadence: {journey.reconcileId ?? "Not provided"}. Manual
            matching: {journey.manualId ?? "Not provided"}. Cross-site
            consistency: {journey.stdId ?? "Not provided"}.
          </p>
          <p>
            {journey.manualId === "high"
              ? "Start with one complete settlement or supplier sample and document how it is matched before widening the review."
              : "Use a consistent source export and review window so differences can be checked across systems."}{" "}
            These are self-reported process answers, not a source-quality
            assessment.
          </p>
        </details>
        <Link href="/value-calculator/methodology">
          Read the full methodology →
        </Link>
      </section>

      <ValueNextSteps journey={journey} />
      <p className="vc3-result-foot">
        Illustrative model. No financial inputs are uploaded or saved by this
        calculator. CSV amounts are annual; print follows the displayed horizon.
        Verified value from this calculation:{" "}
        {formatMoneyIntl(0, result.currency)}.
      </p>
      <p className="vc3-sr-only" role="status">
        {notice}
      </p>
    </div>
  );
}
