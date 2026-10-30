"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ReferenceNav } from "./ReferenceNav";
import { Glyph } from "./MockupVisuals";
import { modelScenario, scenarioRates } from "@/lib/value-scenario";

const stepNames = [
  "Operation type",
  "Locations",
  "Revenue",
  "Labor",
  "Procurement",
  "Channel mix",
];
const operations = [
  {
    title: "Restaurant",
    icon: "restaurant",
    copy: "Single or multi-location restaurants",
  },
  {
    title: "Hotel",
    icon: "hotel",
    copy: "Full-service, lifestyle or select service",
  },
  { title: "Hotel Group", icon: "group", copy: "Multi-property portfolio" },
  { title: "Other", icon: "spark", copy: "Resort, venue or mixed use" },
];
const money = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000000 ? 2 : 0,
    notation: value >= 100000 ? "compact" : "standard",
  }).format(value);
export function MockupCalculator() {
  const [step, setStep] = useState(0);
  const [operation, setOperation] = useState("Restaurant");
  const [inputs, setInputs] = useState({
    locations: 1,
    revenue: 3000000,
    labor: 750000,
    procurement: 600000,
    operations: 300000,
  });
  const [mix, setMix] = useState({ direct: 70, online: 10, delivery: 20 });
  const [modeled, setModeled] = useState(false);
  const result = modelScenario(inputs);
  const mixValid = Object.values(mix).reduce((a, b) => a + b, 0) === 100;
  const update = (key: keyof typeof inputs, value: number) => {
    setInputs((old) => ({
      ...old,
      [key]: Math.max(
        key === "locations" ? 1 : 0,
        Math.min(
          key === "locations" ? 10000 : 1e12,
          Number.isFinite(value) ? value : 0,
        ),
      ),
    }));
    setModeled(false);
  };
  const next = () => {
    if (step < 5) setStep(step + 1);
    else if (mixValid) {
      setModeled(true);
      document.getElementById("results")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    }
  };
  return (
    <div className="mx-page mx-calculator-page">
      <div className="mx-calc-hero">
        <ReferenceNav />
        <div className="mx-wrap mx-calc-hero-grid">
          <div>
            <p className="mx-kicker">VALUE CALCULATOR</p>
            <h1>
              See what your
              <br />
              operation could
              <br />
              unlock with{" "}
              <span className="mx-brand-inline">
                <Image
                  className="mx-wordmark"
                  src="/brand/radr-wordmark-clean-monochrome-black.svg"
                  width={220}
                  height={50}
                  alt="RADR"
                />
                <span>.</span>
              </span>
            </h1>
            <p>
              Turn your data into a clearer picture of opportunity. Get a
              personalized view of potential impact across revenue, labor,
              procurement, and more, based on your operation.
            </p>
            <div className="mx-calculator-benefits">
              {[
                ["chart", "Tailored to your operation"],
                ["box", "Transparent modeled assumptions"],
                ["spark", "Actionable next steps"],
              ].map(([icon, text]) => (
                <div key={text}>
                  <Glyph name={icon} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-wizard" id="calculator">
            <p className="mx-kicker">YOUR VALUE CALCULATOR</p>
            <div
              className="mx-wizard-progress"
              aria-label={`Step ${step + 1} of 6`}
            >
              {stepNames.map((name, i) => (
                <span key={name} data-active={i <= step} />
              ))}
            </div>
            <div className="mx-wizard-content" aria-live="polite">
              <h2>
                {
                  [
                    "What type of operation best describes you?",
                    "How many locations do you operate?",
                    "What does your annual operation look like?",
                    "What are your annual labor costs?",
                    "What is your annual procurement spend?",
                    "How do your revenue channels break down?",
                  ][step]
                }
              </h2>
              <p>
                {step === 0
                  ? "This helps us tailor the model to your business."
                  : step === 5
                    ? "Use percentages that add up to 100%."
                    : "Use annual amounts per location. You can revise these at any time."}
              </p>
              {step === 0 ? (
                <div
                  className="mx-operation-choices"
                  role="group"
                  aria-label="Operation type"
                >
                  {operations.map((op) => (
                    <button
                      key={op.title}
                      aria-pressed={operation === op.title}
                      onClick={() => {
                        setOperation(op.title);
                        setModeled(false);
                      }}
                    >
                      <Glyph name={op.icon} />
                      <b>{op.title}</b>
                      <small>{op.copy}</small>
                      <i />
                    </button>
                  ))}
                </div>
              ) : step === 5 ? (
                <div className="mx-wizard-fields">
                  {Object.entries(mix).map(([key, value]) => (
                    <label key={key}>
                      {key === "direct"
                        ? "Direct / on-site (%)"
                        : key === "online"
                          ? "Online / third-party (%)"
                          : "Delivery / other (%)"}
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={value}
                        onChange={(e) => {
                          setMix((old) => ({
                            ...old,
                            [key]: Math.min(
                              100,
                              Math.max(0, Number(e.target.value)),
                            ),
                          }));
                          setModeled(false);
                        }}
                      />
                    </label>
                  ))}
                  {!mixValid && (
                    <p role="alert">Channel percentages must total 100%.</p>
                  )}
                </div>
              ) : (
                <div className="mx-wizard-fields">
                  {(step === 1
                    ? [
                        {
                          key: "locations" as const,
                          label: "Number of locations",
                        },
                      ]
                    : step === 2
                      ? [
                          {
                            key: "revenue" as const,
                            label: "Annual revenue per location ($)",
                          },
                          {
                            key: "operations" as const,
                            label:
                              "Other annual operating costs ($), excluding labor and procurement",
                          },
                        ]
                      : step === 3
                        ? [
                            {
                              key: "labor" as const,
                              label: "Annual labor costs per location ($)",
                            },
                          ]
                        : [
                            {
                              key: "procurement" as const,
                              label:
                                "Annual procurement spend per location ($)",
                            },
                          ]
                  ).map((field) => (
                    <label key={field.key}>
                      {field.label}
                      <input
                        type="number"
                        min={field.key === "locations" ? 1 : 0}
                        max={field.key === "locations" ? 10000 : 1e12}
                        step={field.key === "locations" ? 1 : 1000}
                        value={inputs[field.key]}
                        onChange={(e) =>
                          update(
                            field.key,
                            field.key === "locations"
                              ? Math.round(Number(e.target.value))
                              : Number(e.target.value),
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="mx-wizard-actions">
              {step > 0 && (
                <button className="mx-back" onClick={() => setStep(step - 1)}>
                  ← Back
                </button>
              )}
              <button
                className="mx-button mx-button-dark"
                onClick={next}
                disabled={step === 5 && !mixValid}
              >
                {step === 5 ? "See my Value Map" : "Next step"}{" "}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-stepper">
        <div className="mx-wrap">
          {stepNames.map((name, i) => (
            <button
              key={name}
              aria-current={i === step ? "step" : undefined}
              onClick={() => setStep(i)}
            >
              <b>{i + 1}</b>
              <span>
                {name}
                <small>
                  {
                    [
                      "Your business model",
                      "Scale of operations",
                      "Annual revenue range",
                      "Team and costs",
                      "Spend and suppliers",
                      "Guest demand mix",
                    ][i]
                  }
                </small>
              </span>
            </button>
          ))}
        </div>
      </div>
      <section
        className="mx-section mx-calc-results"
        id="results"
        aria-labelledby="results-title"
      >
        <div className="mx-wrap mx-results-grid">
          <div>
            <p className="mx-kicker">YOUR MODELED RESULTS</p>
            <h2 id="results-title">
              {modeled
                ? "Here’s your potential value."
                : "Explore your potential value."}
            </h2>
            <p>
              {modeled
                ? "Based on your inputs"
                : "Illustrative example using the prefilled inputs"}
              , this model shows a theoretical annual opportunity range across
              four areas of your operation.
            </p>
            {result.categories.map((c, i) => (
              <div className="mx-result-card" key={c.key}>
                <Glyph name={["chart", "labor", "box", "gear"][i]} />
                <div>
                  <span>
                    {
                      [
                        "Revenue opportunity",
                        "Labor efficiency",
                        "Procurement savings",
                        "Operational efficiency",
                      ][i]
                    }
                  </span>
                  <strong>
                    {money(c.low)} – {money(c.high)}
                  </strong>
                  <small>
                    {scenarioRates[c.key][0] * 100}–
                    {scenarioRates[c.key][1] * 100}% assumed{" "}
                    {i === 0 ? "revenue uplift" : "cost reduction"}
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div className="mx-value-map">
            <p className="mx-kicker">YOUR VALUE MAP</p>
            <h3>A clearer view of what’s possible.</h3>
            <p>
              Transparent assumptions. A starting point for investigation, not a
              forecast.
            </p>
            <div className="mx-result-orbit">
              <div className="mx-result-center">
                <strong>
                  {money(result.low)} – {money(result.high)}
                </strong>
                <span>
                  Modeled annual
                  <br />
                  gross opportunity
                </span>
              </div>
              {result.categories.map((c, i) => (
                <div key={c.key} className={`mx-orbit-node mx-node-${i}`}>
                  <span>
                    <Glyph name={["chart", "labor", "box", "gear"][i]} />
                  </span>
                  <b>{["Revenue", "Labor", "Procurement", "Operations"][i]}</b>
                  <strong>
                    {money(c.low)} – {money(c.high)}
                  </strong>
                </div>
              ))}
            </div>
            <span className="mx-model-badge">
              <i />
              {modeled ? "Based on your inputs" : "Illustrative example"}{" "}
              <small>Assumed ranges</small>
            </span>
            <details className="mx-assumptions">
              <summary>View model assumptions and limitations</summary>
              <p>
                Each category = your annual per-location baseline × locations ×
                the displayed assumption. Rates are illustrative assumptions
                from the design brief, not independently validated industry
                benchmarks. Revenue uplift is not profit. Combined opportunities
                may overlap and require validation; they are not guaranteed or
                verified savings. Channel mix informs the conversation, not an
                undisclosed multiplier. No data is saved or sent.
              </p>
            </details>
          </div>
          <aside className="mx-recommendations">
            <p className="mx-kicker">YOUR START-HERE PLAN</p>
            <h3>
              Top recommendations
              <br />
              for your operation.
            </h3>
            <p>
              A practical starting point for your {operation.toLowerCase()} , 
              based on the areas in your model.
            </p>
            {[...result.categories]
              .sort((a, b) => b.high - a.high)
              .slice(0, 3)
              .map((c, i) => (
                <Link
                  key={c.key}
                  href={`/solutions#${c.key === "revenue" ? "pricing-yield" : c.key}`}
                >
                  <b>{i + 1}</b>
                  <span>
                    <strong>
                      {
                        {
                          revenue: "Capture more revenue opportunity",
                          labor: "Review labor inefficiencies",
                          procurement: "Optimize procurement spend",
                          operations: "Connect the operating picture",
                        }[c.key]
                      }
                    </strong>
                    <small>
                      {
                        {
                          revenue:
                            "Investigate pricing, menu mix and channel performance.",
                          labor:
                            "Review staffing against demand and productivity.",
                          procurement:
                            "Compare supplier terms, pricing and discrepancies.",
                          operations:
                            "Understand operating costs with the right context.",
                        }[c.key]
                      }
                    </small>
                  </span>
                  <i aria-hidden="true">›</i>
                </Link>
              ))}
            <div className="mx-recommendation-cta">
              <Glyph />
              <div>
                <strong>Want a detailed breakdown?</strong>
                <p>
                  Book a personalized walkthrough to explore your inputs and
                  where to investigate next.
                </p>
                <Link className="mx-button mx-button-dark" href="/contact">
                  Book a demo →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
