"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Link } from "@/i18n/navigation";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { ValueMapResult } from "./ValueMapResult";
import { LiveModelPreview } from "./LiveModelPreview";
import { categoryExplanation } from "./valueMapSemantics";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { analyticsAllowed } from "@/lib/privacy/consent";
import {
  LOCATION_OPTIONS,
  REVENUE_OPTIONS_USD,
  PCT_OPTIONS,
  PURCHASING_OPTIONS,
  DELIVERY_OPTIONS,
  OTA_OPTIONS,
  ROOM_REVENUE_OPTIONS,
  SYSTEMS_OPTIONS,
  RECONCILE_OPTIONS,
  MANUAL_OPTIONS,
  STD_OPTIONS,
  VERTICAL_OPTIONS,
  OTHER_KIND_OPTIONS,
  PAIN_BY_VERTICAL,
  calculateValueMap,
  emptyJourney,
  resolveEngineInput,
  sampleJourney,
  formatRevenueLabel,
  type CurrencyCode,
  type JourneyState,
  type JourneyStep,
} from "@/lib/marketing/value-calculator";
import "@/app/marketing-2030.css";
import "@/app/brand-takeover.css";
import "@/app/marketing-premium-pages.css";
import "@/app/value-calculator-premium.css";

const STEPS = [
  { id: "operation", label: "Your operation" },
  { id: "scale", label: "Your scale" },
  { id: "economics", label: "Your economics" },
  { id: "signals", label: "Your priorities" },
] as const;
const CURRENCIES: CurrencyCode[] = [
  "USD",
  "EUR",
  "GBP",
  "AED",
  "SGD",
  "JPY",
  "HKD",
  "AUD",
  "MXN",
  "BRL",
  "ZAR",
  "OTHER",
];

export function CalculatorField({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: ReactNode;
}) {
  const id = useId();
  const child = isValidElement<{
    id?: string;
    "aria-label"?: string;
    "aria-describedby"?: string;
  }>(children)
    ? cloneElement(children, {
        id,
        "aria-label": label,
        "aria-describedby": help ? `${id}-help` : undefined,
      })
    : children;
  return (
    <label className="vc3-field" htmlFor={id}>
      <span>{label}</span>
      {help ? <small id={`${id}-help`}>{help}</small> : null}
      {child}
    </label>
  );
}
function SelectField({
  label,
  help,
  value,
  onChange,
  options,
}: {
  label: string;
  help?: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
}) {
  return (
    <CalculatorField label={label} help={help}>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">Choose an answer</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </CalculatorField>
  );
}

export function ValueCalculatorApp() {
  const reduced = useReducedMotionSafe();
  const [step, setStep] = useState<JourneyStep>("intro");
  const [journey, setJourney] = useState<JourneyState>(emptyJourney);
  const [hint, setHint] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const patch = useCallback((p: Partial<JourneyState>) => {
    setHint(null);
    setJourney((j) => ({ ...j, ...p }));
  }, []);
  const input = resolveEngineInput(journey);
  const index = STEPS.findIndex((s) => s.id === step);
  const full = Boolean(
    input &&
      journey.systemsId &&
      journey.reconcileId &&
      journey.manualId &&
      (journey.vertical !== "other" || journey.otherKind) &&
      (journey.painUnsure || journey.painAreas.length > 0),
  );

  const result = step === "result" && full ? calculateValueMap(journey) : null;

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }, [step, reduced]);
  useEffect(() => {
    const pop = (event: PopStateEvent) => {
      const next = event.state?.radrValueStep as JourneyStep | undefined;
      if (
        !next ||
        ![
          "intro",
          "operation",
          "scale",
          "economics",
          "signals",
          "result",
        ].includes(next)
      )
        return;
      setHint(null);
      setStep(next);
    };
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  function go(next: JourneyStep) {
    setHint(null);
    setStep(next);
    window.history.pushState(
      { ...window.history.state, radrValueStep: next },
      "",
      window.location.href,
    );
    if (next === "result") setCompleted(true);
    if (analyticsAllowed()) {
      const layer = (window as Window & { dataLayer?: unknown[] }).dataLayer;
      layer?.push({
        event:
          next === "result"
            ? "calculator_result_viewed"
            : "calculator_step_viewed",
        step: next,
      });
    }
  }
  function next() {
    if (
      step === "operation" &&
      (!journey.vertical ||
        (journey.vertical === "other" && !journey.otherKind))
    ) {
      setHint("Choose your operation to continue.");
      return;
    }
    if (step === "scale" && !input) {
      setHint(
        journey.revenueMode === "exact"
          ? "Choose a location count and enter annual revenue greater than zero, up to 1 trillion."
          : "Choose your location count and a revenue range. You can select ‘I’m not sure’.",
      );
      return;
    }
    if (step === "signals") {
      if (!journey.painUnsure && journey.painAreas.length === 0) {
        setHint("Choose an operating area, or select ‘Scan everything’.");
        return;
      }
      if (!full) {
        setHint("Answer the three record-process questions to build your map.");
        return;
      }
      go("result");
      return;
    }
    go(STEPS[Math.min(index + 1, 3)].id);
  }
  function sample(kind: "restaurant" | "hotel" | "mixed") {
    setJourney(sampleJourney(kind));
    go("result");
  }
  const hotel = journey.vertical === "hotel" || journey.vertical === "mixed";
  const food = journey.vertical !== "hotel";

  return (
    <div className="radr radr-mineral rm-premium vc3">
      <PublicNavbar />
      <div className="rx30 rx30--mockup vc3-page">
        <main>
          {step === "intro" ? (
            <section className="vc3-intro" aria-labelledby="vc3-title">
              <div className="rx30-shell vc3-intro-grid">
                <div>
                  <p className="rx30-kicker">THE RADR VALUE CALCULATOR</p>
                  <h1 id="vc3-title">
                    See what your
                    <br />
                    <em>numbers might reveal.</em>
                  </h1>
                  <p className="vc3-lead">
                    Where is value exposed in your operation? Build a clear
                    financial scenario, explore the drivers and find the
                    evidence to check first.
                  </p>
                  <div className="vc3-actions">
                    <button
                      className="vc3-btn vc3-btn--jade"
                      onClick={() => go("operation")}
                    >
                      Build my Value Map <span aria-hidden>→</span>
                    </button>
                    <Link href="/value-calculator/methodology">
                      See the methodology →
                    </Link>
                  </div>
                  <ul className="vc3-assurance">
                    <li>Four short steps</li>
                    <li>No account required</li>
                    <li>Calculated in your browser</li>
                  </ul>
                </div>
                <aside
                  className="vc3-model-card"
                  aria-label="How the Value Map works"
                >
                  <div className="vc3-model-top">
                    <FrozenRadrLogo variant="mark" theme="dark" width={30} />
                    <span>A clearer operating picture</span>
                  </div>
                  <h2>
                    From a number
                    <br />
                    to a better question.
                  </h2>
                  <div className="vc3-model-lanes">
                    {[
                      ["BUY", "Purchasing & supplier differences", "70%"],
                      ["LABOR", "Staffing cost & service demand", "91%"],
                      ["SELL", "Capacity, pricing & booking mix", "58%"],
                      ["RECOVER", "Settlements, fees & credits", "78%"],
                    ].map(([title, text, width]) => (
                      <div key={title}>
                        <span>{title}</span>
                        <strong>{text}</strong>
                        <i aria-hidden style={{ width }} />
                      </div>
                    ))}
                  </div>
                  <p>
                    Illustrative areas to investigate. Your inputs determine the
                    scenario.
                  </p>
                </aside>
              </div>
              <div className="rx30-shell vc3-examples">
                <div>
                  <span className="vc3-eyebrow">Take a closer look</span>
                  <h2>Try an example first.</h2>
                </div>
                <div>
                  {[
                    [
                      "restaurant",
                      "Global restaurant group",
                      "Service, purchasing & staffing",
                    ],
                    [
                      "hotel",
                      "Global hotel group",
                      "Rooms, channels & readiness",
                    ],
                    [
                      "mixed",
                      "Mixed hospitality",
                      "One view across operating models",
                    ],
                  ].map(([kind, label, text]) => (
                    <button
                      key={kind}
                      aria-label={label}
                      onClick={() =>
                        sample(kind as "restaurant" | "hotel" | "mixed")
                      }
                    >
                      <strong>{label}</strong>
                      <span>{text}</span>
                      <b aria-hidden>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M6 18 18 6M6 6h12v12"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </b>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ) : (
            <section className="vc3-workspace" aria-label="Value Calculator">
              <div className="rx30-shell">
                {step !== "result" ? (
                  <>
                    <nav
                      className="vc3-progress"
                      aria-label="Calculator progress"
                    >
                      {STEPS.map((s, i) => (
                        <button
                          key={s.id}
                          disabled={i > index}
                          onClick={() => i < index && go(s.id)}
                          aria-current={step === s.id ? "step" : undefined}
                        >
                          <b>
                            {i < index ? "✓" : String(i + 1).padStart(2, "0")}
                          </b>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </nav>
                    <div className="vc3-input-grid">
                      <div className="vc3-panel">
                        <span className="vc3-eyebrow">
                          Step {index + 1} of 4
                        </span>
                        <h1
                          ref={heading}
                          tabIndex={-1}
                          className="vc3-panel-heading"
                        >
                          {step === "operation"
                            ? "What do you operate?"
                            : step === "scale"
                              ? "Set the scale of your operation."
                              : step === "economics"
                                ? "What drives your costs and revenue?"
                                : "Where would you look first?"}
                        </h1>
                        {step === "operation" ? (
                          <>
                            <p>
                              Choose the operating model that best fits. The
                              questions and categories will follow your choice.
                            </p>
                            <div className="vc3-operation-choices">
                              {VERTICAL_OPTIONS.map((v, i) => (
                                <button
                                  key={v.id}
                                  aria-label={v.label}
                                  aria-pressed={journey.vertical === v.id}
                                  onClick={() =>
                                    patch({
                                      vertical: v.id,
                                      otherKind: null,
                                      painAreas: [],
                                      painUnsure: true,
                                      foodId: null,
                                      deliveryId: null,
                                      otaId: null,
                                      roomRevenueShareId: null,
                                    })
                                  }
                                >
                                  <span className="vc3-choice-number">
                                    0{i + 1}
                                  </span>
                                  <strong>{v.label}</strong>
                                  <small>
                                    {
                                      [
                                        "Service, menus and purchasing",
                                        "Rooms, bookings and readiness",
                                        "Restaurants and hotels together",
                                        "Resorts, apartments, bars and more",
                                      ][i]
                                    }
                                  </small>
                                </button>
                              ))}
                            </div>
                            {journey.vertical === "other" ? (
                              <SelectField
                                label="Type of hospitality operation"
                                value={journey.otherKind}
                                onChange={(v) =>
                                  patch({
                                    otherKind: v as JourneyState["otherKind"],
                                  })
                                }
                                options={OTHER_KIND_OPTIONS}
                                help="Other formats use general hospitality assumptions. Choose Hotel for room and channel economics, or Restaurant for a restaurant-led operation."
                              />
                            ) : null}
                          </>
                        ) : null}
                        {step === "scale" ? (
                          <>
                            <p>
                              Use annual revenue across all the locations below.
                              The model uses this combined amount once.
                            </p>
                            <div className="vc3-fields">
                              <SelectField
                                label="Number of locations / properties"
                                value={journey.locationsId}
                                onChange={(v) => patch({ locationsId: v })}
                                options={LOCATION_OPTIONS}
                              />
                              <SelectField
                                label="Currency"
                                help="Amounts stay in this currency. No exchange-rate conversion."
                                value={journey.currency}
                                onChange={(v) =>
                                  patch({ currency: v as CurrencyCode })
                                }
                                options={CURRENCIES.map((c) => ({
                                  id: c,
                                  label:
                                    c === "OTHER"
                                      ? "Other currency (units)"
                                      : c,
                                }))}
                              />
                            </div>
                            <fieldset className="vc3-entry-mode">
                              <legend>
                                How would you like to enter revenue?
                              </legend>
                              <div>
                                {[
                                  ["range", "Choose a range"],
                                  ["exact", "Enter an exact amount"],
                                ].map(([id, text]) => (
                                  <button
                                    key={id}
                                    type="button"
                                    aria-pressed={
                                      (journey.revenueMode ?? "range") === id
                                    }
                                    onClick={() =>
                                      patch({
                                        revenueMode: id as "range" | "exact",
                                      })
                                    }
                                  >
                                    {text}
                                  </button>
                                ))}
                              </div>
                            </fieldset>
                            {journey.revenueMode === "exact" ? (
                              <CalculatorField
                                label="Exact annual revenue"
                                help={`Combined revenue in ${journey.currency === "OTHER" ? "your currency units" : journey.currency}. Do not include a currency symbol.`}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="1000000000000"
                                  step="any"
                                  inputMode="decimal"
                                  value={journey.revenueExact ?? ""}
                                  onChange={(e) =>
                                    patch({
                                      revenueExact:
                                        e.target.value === ""
                                          ? null
                                          : e.target.valueAsNumber,
                                    })
                                  }
                                />
                              </CalculatorField>
                            ) : (
                              <SelectField
                                label="Annual revenue"
                                help="A range uses its midpoint. Choose ‘I’m not sure’ to explore categories without a financial estimate."
                                value={journey.revenueId}
                                onChange={(v) => patch({ revenueId: v })}
                                options={REVENUE_OPTIONS_USD.filter(
                                  (o) => o.id !== "u2",
                                ).map((o) => ({
                                  id: o.id,
                                  label: formatRevenueLabel(
                                    o,
                                    journey.currency,
                                  ),
                                }))}
                              />
                            )}
                          </>
                        ) : null}
                        {step === "economics" ? (
                          <>
                            <p>
                              Optional inputs sharpen the financial bases.
                              Unanswered fields use clearly listed model
                              defaults. These are shares of revenue, not profit
                              margins.
                            </p>
                            <div className="vc3-fields">
                              <SelectField
                                label="Labor cost %"
                                help="Payroll and related staffing costs as a share of revenue."
                                value={journey.laborId}
                                onChange={(v) => patch({ laborId: v })}
                                options={PCT_OPTIONS}
                              />
                              <SelectField
                                label="Purchasing / supplier spend"
                                help="Goods and supplies purchased as a share of total revenue."
                                value={journey.purchasingId}
                                onChange={(v) => patch({ purchasingId: v })}
                                options={PURCHASING_OPTIONS}
                              />
                              {food ? (
                                <>
                                  <SelectField
                                    label="Food / COGS %"
                                    help="Food and ingredient cost as a share of revenue. COGS means cost of goods sold."
                                    value={journey.foodId}
                                    onChange={(v) => patch({ foodId: v })}
                                    options={PCT_OPTIONS}
                                  />
                                  <SelectField
                                    label="Delivery share"
                                    help="The share of revenue sold through delivery channels."
                                    value={journey.deliveryId}
                                    onChange={(v) => patch({ deliveryId: v })}
                                    options={DELIVERY_OPTIONS}
                                  />
                                </>
                              ) : null}
                              {hotel ? (
                                <>
                                  <SelectField
                                    label="Room revenue share"
                                    help="Room revenue as a share of all revenue, including food, drinks and other services."
                                    value={journey.roomRevenueShareId}
                                    onChange={(v) =>
                                      patch({ roomRevenueShareId: v })
                                    }
                                    options={ROOM_REVENUE_OPTIONS}
                                  />
                                  <SelectField
                                    label="OTA / third-party mix"
                                    help="The share of room revenue from third-party channels. OTA means online travel agency."
                                    value={journey.otaId}
                                    onChange={(v) => patch({ otaId: v })}
                                    options={OTA_OPTIONS}
                                  />
                                </>
                              ) : null}
                            </div>
                          </>
                        ) : null}
                        {step === "signals" ? (
                          <>
                            <p>
                              Select any areas that concern you, or scan all
                              applicable categories. Open terminology is
                              explained beside each choice.
                            </p>
                            <label className="vc3-check">
                              <input
                                type="checkbox"
                                checked={journey.painUnsure}
                                onChange={(e) =>
                                  patch({
                                    painUnsure: e.target.checked,
                                    painAreas: [],
                                  })
                                }
                              />
                              <span>I’m not sure. Scan everything.</span>
                            </label>
                            <div className="vc3-signal-choices">
                              {(journey.vertical
                                ? PAIN_BY_VERTICAL[journey.vertical]
                                : []
                              ).map((p) => (
                                <button
                                  key={p.id}
                                  aria-pressed={
                                    !journey.painUnsure &&
                                    journey.painAreas.includes(p.id)
                                  }
                                  onClick={() =>
                                    patch({
                                      painUnsure: false,
                                      painAreas: journey.painAreas.includes(
                                        p.id,
                                      )
                                        ? journey.painAreas.filter(
                                            (id) => id !== p.id,
                                          )
                                        : [...journey.painAreas, p.id],
                                    })
                                  }
                                >
                                  <strong>{p.label}</strong>
                                  <small>
                                    {
                                      categoryExplanation(
                                        p.id,
                                        journey.vertical,
                                      ).meaning
                                    }
                                  </small>
                                </button>
                              ))}
                            </div>
                            <h2 className="vc3-section-title">
                              How do you check your records?
                            </h2>
                            <p>
                              These answers help organize the evidence review.
                              They do not confirm your data quality or change
                              the financial exposure rates.
                            </p>
                            <div className="vc3-fields">
                              <SelectField
                                label="How many systems hold your data?"
                                help="For example: sales, reservations, stock, payroll and accounting."
                                value={journey.systemsId}
                                onChange={(v) => patch({ systemsId: v })}
                                options={SYSTEMS_OPTIONS}
                              />
                              <SelectField
                                label="How often do you reconcile?"
                                help="Match recorded sales and fees to the payments actually received."
                                value={journey.reconcileId}
                                onChange={(v) => patch({ reconcileId: v })}
                                options={RECONCILE_OPTIONS}
                              />
                              <SelectField
                                label="How much matching is manual?"
                                value={journey.manualId}
                                onChange={(v) => patch({ manualId: v })}
                                options={MANUAL_OPTIONS}
                              />
                              <SelectField
                                label="Consistency across sites (optional)"
                                help="How consistently do locations follow the same review process?"
                                value={journey.stdId}
                                onChange={(v) => patch({ stdId: v })}
                                options={STD_OPTIONS}
                              />
                            </div>
                          </>
                        ) : null}
                        {hint ? (
                          <p className="vc3-error" role="alert">
                            {hint}
                          </p>
                        ) : null}
                        <div className="vc3-form-actions">
                          <button
                            className="vc3-btn vc3-btn--light"
                            onClick={() =>
                              go(index > 0 ? STEPS[index - 1].id : "intro")
                            }
                          >
                            Back
                          </button>
                          <div>
                            {completed && full && step !== "signals" ? (
                              <button
                                className="vc3-btn vc3-btn--light"
                                onClick={() => go("result")}
                              >
                                Update results
                              </button>
                            ) : null}
                            <button
                              className="vc3-btn vc3-btn--blue"
                              onClick={next}
                            >
                              {step === "signals"
                                ? "Build Value Map"
                                : "Continue"}{" "}
                              <span aria-hidden>→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <LiveModelPreview journey={journey} />
                    </div>
                  </>
                ) : result ? (
                  <ValueMapResult
                    journey={journey}
                    result={result}
                    onEdit={() => go("scale")}
                    onPatch={patch}
                  />
                ) : (
                  <div className="vc3-panel">
                    <h1>Complete your inputs.</h1>
                    <p>
                      Finish the operating context, scale and record-process
                      questions to build the map.
                    </p>
                    <button
                      className="vc3-btn vc3-btn--blue"
                      onClick={() => go("scale")}
                    >
                      Edit inputs
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
