"use client";

/**
 * Value Calculator V2 — guided operating-value diagnosis.
 * Intro → Operation → Scale → Economics → Signals → Analyzing → Result
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PublicFooter, PublicNavbar } from "@/components/marketing/PublicShell";
import { SilkAtmosphere } from "@/components/marketing/v2030/SilkAtmosphere";
import { LiveModelPreview } from "@/components/marketing/value-calculator/LiveModelPreview";
import { ValueMapResult } from "@/components/marketing/value-calculator/ValueMapResult";
import {
  COVERS_OPTIONS,
  DELIVERY_OPTIONS,
  LOCATION_OPTIONS,
  MANUAL_OPTIONS,
  MIXED_BALANCE_OPTIONS,
  OCCUPANCY_OPTIONS,
  OTHER_KIND_OPTIONS,
  OTA_OPTIONS,
  PAIN_BY_VERTICAL,
  PCT_OPTIONS,
  PURCHASING_OPTIONS,
  RECONCILE_OPTIONS,
  REVENUE_OPTIONS_USD,
  ROOMS_OPTIONS,
  STD_OPTIONS,
  SYSTEMS_OPTIONS,
  VERTICAL_OPTIONS,
  ADR_OPTIONS_USD,
  calculateValueMap,
  emptyJourney,
  formatRevenueLabel,
  sampleJourney,
  type CategoryId,
  type CurrencyCode,
  type JourneyState,
  type JourneyStep,
  type OtherKind,
  type VerticalId,
} from "@/lib/marketing/value-calculator";
import "@/app/marketing-2030.css";
import "@/app/value-calculator.css";
import "@/app/value-calculator-v2.css";
import "@/app/brand-takeover.css";

const STEPS: { id: JourneyStep; n: string; label: string }[] = [
  { id: "operation", n: "01", label: "Operation" },
  { id: "scale", n: "02", label: "Scale" },
  { id: "economics", n: "03", label: "Economics" },
  { id: "signals", n: "04", label: "Signals" },
  { id: "result", n: "05", label: "Value Map" },
];

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

const ANALYZE_LINES = [
  "Connecting inputs",
  "Modeling opportunity classes",
  "Checking overlap",
  "Ranking evidence readiness",
  "Building Value Map",
] as const;

function track(event: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  try {
    const w = window as Window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    w.dataLayer?.push({ event, ...props });
    w.gtag?.("event", event, props);
  } catch {
    /* analytics optional */
  }
}

const slide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | null;
  onChange: (id: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="vc-field">
      <span>{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" disabled>
          Choose…
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ValueCalculatorApp() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState<JourneyStep>("intro");
  const [journey, setJourney] = useState<JourneyState>(emptyJourney);
  const [analyzeIdx, setAnalyzeIdx] = useState(0);
  const [hint, setHint] = useState<string | null>(null);

  const patch = useCallback((p: Partial<JourneyState>) => {
    setJourney((prev) => ({ ...prev, ...p }));
  }, []);

  const result = useMemo(() => {
    if (step !== "result" && step !== "analyzing") return null;
    return calculateValueMap(journey);
  }, [journey, step]);

  useEffect(() => {
    if (step === "result" && typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    }
  }, [step, reduced]);

  useEffect(() => {
    if (step !== "analyzing") return;
    setAnalyzeIdx(0);
    if (reduced) {
      setStep("result");
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setAnalyzeIdx(Math.min(ANALYZE_LINES.length - 1, i));
      if (i >= ANALYZE_LINES.length) {
        window.clearInterval(id);
        window.setTimeout(() => setStep("result"), 280);
      }
    }, 380);
    return () => window.clearInterval(id);
  }, [step, reduced]);

  useEffect(() => {
    function onPop(e: PopStateEvent) {
      const next = (e.state as { vc2?: JourneyStep } | null)?.vc2;
      setHint(null);
      setStep(next && next !== "analyzing" ? next : "intro");
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  function go(next: JourneyStep) {
    setHint(null);
    setStep(next);
    if (typeof window !== "undefined") {
      window.history.pushState({ vc2: next }, "", window.location.pathname);
    }
    if (next === "operation") track("calculator_started");
    if (
      next === "operation" ||
      next === "scale" ||
      next === "economics" ||
      next === "signals"
    ) {
      track("step_viewed", { step: next });
    }
    if (next === "result") track("result_viewed");
  }

  function continueFrom(current: JourneyStep) {
    if (current === "operation") {
      if (!journey.vertical) {
        setHint("Choose one to continue.");
        return;
      }
      if (journey.vertical === "other" && !journey.otherKind) {
        setHint("Choose one to continue.");
        return;
      }
      go("scale");
      return;
    }
    if (current === "scale") {
      if (!journey.locationsId || !journey.revenueId) {
        setHint("Choose scale and revenue to continue.");
        return;
      }
      go("economics");
      return;
    }
    if (current === "economics") {
      go("signals");
      return;
    }
    if (current === "signals") {
      if (!journey.systemsId || !journey.reconcileId || !journey.manualId) {
        setHint("Answer the maturity questions to continue.");
        return;
      }
      go("analyzing");
    }
  }

  function startSample(kind: "restaurant" | "hotel" | "mixed") {
    setJourney(sampleJourney(kind));
    go("analyzing");
  }

  const progressIndex =
    step === "intro"
      ? 0
      : step === "analyzing"
        ? 4
        : STEPS.findIndex((s) => s.id === step);

  const showPreview =
    step !== "intro" && step !== "analyzing" && step !== "result";

  return (
    <div className="radr radr-mineral">
      <PublicNavbar />
      <div className="rx30 rx30--mockup vc2-page">
        <main>
          {step === "intro" ? (
            <section
              className="rx30-bleed rx30-bleed--page vc2-intro"
              data-nav-theme="light"
              aria-labelledby="vc2-title"
            >
              <SilkAtmosphere className="rx30-bleed-silk" />
              <div className="rx30-shell rx30-bleed-grid vc2-intro-grid">
                <div className="rx30-bleed-copy">
                  <p className="rx30-kicker">RADR Value Map</p>
                  <h1 id="vc2-title" className="rx30-bleed-h1">
                    What is your operation <em>leaving behind?</em>
                  </h1>
                  <p className="rx30-bleed-lead">
                    Model where value may be hiding across labor, procurement,
                    revenue and operations — then see what may be worth
                    investigating first.
                  </p>
                  <p className="vc-disclaimer-inline">
                    Illustrative / modeled. Not a guaranteed outcome. Verified
                    Value stays at zero until real evidence exists.
                  </p>
                  <div className="rx30-ctas">
                    <button
                      type="button"
                      className="rx30-btn rx30-btn-primary"
                      onClick={() => go("operation")}
                    >
                      Build my Value Map <span aria-hidden="true">→</span>
                    </button>
                  </div>
                  <div className="vc-samples">
                    <p className="vc-samples-label">Try an illustrative example</p>
                    <button
                      type="button"
                      onClick={() => startSample("restaurant")}
                    >
                      Global restaurant group
                    </button>
                    <button type="button" onClick={() => startSample("hotel")}>
                      Global hotel group
                    </button>
                    <button type="button" onClick={() => startSample("mixed")}>
                      Mixed hospitality
                    </button>
                  </div>
                </div>
                <aside
                  className="vc2-intro-preview"
                  aria-label="Illustrative Value Map preview"
                >
                  <p className="rx30-demo-label">Illustrative result preview</p>
                  <div className="vc2-intro-map">
                    <div className="vc2-intro-map-center">
                      <strong>Your Value Map</strong>
                      <span>What you receive after the guided inputs</span>
                    </div>
                    <ul>
                      <li data-tone="buy">
                        <em>BUY</em>
                        <span>Procurement · AP variance</span>
                      </li>
                      <li data-tone="labor">
                        <em>LABOR</em>
                        <span>Hours · coverage drift</span>
                      </li>
                      <li data-tone="sell">
                        <em>SELL</em>
                        <span>Perishable revenue</span>
                      </li>
                      <li data-tone="recover">
                        <em>RECOVER</em>
                        <span>Reconciliation gaps</span>
                      </li>
                    </ul>
                    <dl className="vc2-intro-sep">
                      <div>
                        <dt>Modeled opportunity</dt>
                        <dd>Range</dd>
                      </div>
                      <div>
                        <dt>Modeled capture</dt>
                        <dd>Range</dd>
                      </div>
                      <div>
                        <dt>Verified Value</dt>
                        <dd>$0</dd>
                      </div>
                    </dl>
                  </div>
                </aside>
              </div>

              <div className="rx30-shell vc2-leave">
                <p className="rx30-kicker">You’ll leave with</p>
                <ul className="vc2-leave-list">
                  <li>A modeled opportunity range</li>
                  <li>The areas worth investigating first</li>
                  <li>Confidence / evidence readiness</li>
                  <li>A transparent assumption trail</li>
                </ul>
              </div>
            </section>
          ) : null}

          {step !== "intro" ? (
            <section
              className="vc2-workspace"
              data-phase={step}
              aria-label="Value Calculator"
            >
              <div className="rx30-shell">
                {step !== "result" && step !== "analyzing" ? (
                  <nav className="vc2-progress" aria-label="Progress">
                    {STEPS.map((s, i) => (
                      <button
                        key={s.id}
                        type="button"
                        data-on={s.id === step ? "true" : undefined}
                        data-done={i < progressIndex ? "true" : undefined}
                        disabled={i > progressIndex}
                        onClick={() => {
                          if (i < progressIndex) go(s.id);
                        }}
                      >
                        <em>{i < progressIndex ? "✓" : s.n}</em>
                        <span>{s.label}</span>
                      </button>
                    ))}
                    <p className="vc2-progress-mobile">
                      {Math.min(4, Math.max(1, progressIndex + 1))} / 5
                    </p>
                  </nav>
                ) : null}

                <div
                  className="vc2-grid"
                  data-result={step === "result" ? "true" : undefined}
                >
                  <div className="vc2-main">
                    <AnimatePresence mode="wait" initial={false}>
                      {step === "operation" ? (
                        <motion.div
                          key="operation"
                          className="vc2-card"
                          {...(reduced ? {} : slide)}
                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <h2>What do you operate?</h2>
                          <div className="vc2-choices">
                            {VERTICAL_OPTIONS.map((v) => (
                              <button
                                key={v.id}
                                type="button"
                                className="vc2-choice"
                                data-on={
                                  journey.vertical === v.id ? "true" : undefined
                                }
                                onClick={() => {
                                  patch({
                                    vertical: v.id as VerticalId,
                                    otherKind:
                                      v.id === "other"
                                        ? journey.otherKind
                                        : null,
                                  });
                                  track("vertical_selected", {
                                    vertical: v.id,
                                  });
                                }}
                              >
                                {v.label}
                              </button>
                            ))}
                          </div>
                          {journey.vertical === "other" ? (
                            <div className="vc2-choices vc2-choices--sec">
                              {OTHER_KIND_OPTIONS.map((o) => (
                                <button
                                  key={o.id}
                                  type="button"
                                  className="vc2-choice"
                                  data-on={
                                    journey.otherKind === o.id
                                      ? "true"
                                      : undefined
                                  }
                                  onClick={() =>
                                    patch({ otherKind: o.id as OtherKind })
                                  }
                                >
                                  {o.label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                          {hint ? <p className="vc2-hint">{hint}</p> : null}
                          <button
                            type="button"
                            className="rx30-btn rx30-btn-primary"
                            onClick={() => continueFrom("operation")}
                          >
                            Continue
                          </button>
                        </motion.div>
                      ) : null}

                      {step === "scale" ? (
                        <motion.div
                          key="scale"
                          className="vc2-card"
                          {...(reduced ? {} : slide)}
                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <h2>How large is the operation?</h2>
                          <SelectField
                            label="Number of locations / properties"
                            value={journey.locationsId}
                            onChange={(id) => patch({ locationsId: id })}
                            options={LOCATION_OPTIONS}
                          />
                          <SelectField
                            label="Annual revenue"
                            value={journey.revenueId}
                            onChange={(id) => patch({ revenueId: id })}
                            options={REVENUE_OPTIONS_USD.map((o) => ({
                              id: o.id,
                              label: formatRevenueLabel(o, journey.currency),
                            }))}
                          />
                          <SelectField
                            label="Currency"
                            value={journey.currency}
                            onChange={(id) =>
                              patch({ currency: id as CurrencyCode })
                            }
                            options={CURRENCIES.map((c) => ({
                              id: c,
                              label: c,
                            }))}
                          />
                          {journey.vertical === "restaurant" ? (
                            <SelectField
                              label="Average covers / day (optional)"
                              value={journey.coversId}
                              onChange={(id) => patch({ coversId: id })}
                              options={COVERS_OPTIONS}
                            />
                          ) : null}
                          {journey.vertical === "hotel" ? (
                            <SelectField
                              label="Rooms per property (optional)"
                              value={journey.roomsId}
                              onChange={(id) => patch({ roomsId: id })}
                              options={ROOMS_OPTIONS}
                            />
                          ) : null}
                          {hint ? <p className="vc2-hint">{hint}</p> : null}
                          <div className="vc-nav-row">
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-ghost"
                              onClick={() => go("operation")}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-primary"
                              onClick={() => continueFrom("scale")}
                            >
                              Continue
                            </button>
                          </div>
                        </motion.div>
                      ) : null}

                      {step === "economics" ? (
                        <motion.div
                          key="economics"
                          className="vc2-card"
                          {...(reduced ? {} : slide)}
                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <h2>How does the operation roughly perform?</h2>
                          {journey.vertical === "mixed" ? (
                            <SelectField
                              label="Restaurant vs hotel mix"
                              value={journey.mixedBalanceId}
                              onChange={(id) => patch({ mixedBalanceId: id })}
                              options={MIXED_BALANCE_OPTIONS.map((o) => ({
                                id: o.id,
                                label: o.label,
                              }))}
                            />
                          ) : null}
                          <SelectField
                            label="Labor cost %"
                            value={journey.laborId}
                            onChange={(id) => patch({ laborId: id })}
                            options={PCT_OPTIONS}
                          />
                          {journey.vertical === "restaurant" ||
                          journey.vertical === "mixed" ||
                          journey.vertical === "other" ? (
                            <>
                              <SelectField
                                label="Food / COGS %"
                                value={journey.foodId}
                                onChange={(id) => patch({ foodId: id })}
                                options={PCT_OPTIONS}
                              />
                              <SelectField
                                label="Delivery share"
                                value={journey.deliveryId}
                                onChange={(id) => patch({ deliveryId: id })}
                                options={DELIVERY_OPTIONS}
                              />
                            </>
                          ) : null}
                          {journey.vertical === "hotel" ||
                          journey.vertical === "mixed" ? (
                            <>
                              <SelectField
                                label="Occupancy"
                                value={journey.occupancyId}
                                onChange={(id) => patch({ occupancyId: id })}
                                options={OCCUPANCY_OPTIONS}
                              />
                              <SelectField
                                label="ADR"
                                value={journey.adrId}
                                onChange={(id) => patch({ adrId: id })}
                                options={ADR_OPTIONS_USD}
                              />
                              <SelectField
                                label="OTA / third-party mix"
                                value={journey.otaId}
                                onChange={(id) => patch({ otaId: id })}
                                options={OTA_OPTIONS}
                              />
                            </>
                          ) : null}
                          <SelectField
                            label="Purchasing / supplier spend"
                            value={journey.purchasingId}
                            onChange={(id) => patch({ purchasingId: id })}
                            options={PURCHASING_OPTIONS}
                          />
                          <div className="vc-nav-row">
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-ghost"
                              onClick={() => go("scale")}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-primary"
                              onClick={() => continueFrom("economics")}
                            >
                              Continue
                            </button>
                          </div>
                        </motion.div>
                      ) : null}

                      {step === "signals" ? (
                        <motion.div
                          key="signals"
                          className="vc2-card"
                          {...(reduced ? {} : slide)}
                          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <h2>Where do you think value may be slipping?</h2>
                          <label className="vc-choice">
                            <input
                              type="checkbox"
                              checked={journey.painUnsure}
                              onChange={(e) => {
                                patch({
                                  painUnsure: e.target.checked,
                                  painAreas: e.target.checked
                                    ? []
                                    : journey.painAreas,
                                });
                              }}
                            />
                            <span>I’m not sure — scan everything</span>
                          </label>
                          <div className="vc2-pain">
                            {(journey.vertical
                              ? PAIN_BY_VERTICAL[journey.vertical]
                              : []
                            ).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="vc2-choice"
                                disabled={journey.painUnsure}
                                data-on={
                                  journey.painAreas.includes(p.id)
                                    ? "true"
                                    : undefined
                                }
                                onClick={() => {
                                  const on = journey.painAreas.includes(p.id);
                                  const next = on
                                    ? journey.painAreas.filter((x) => x !== p.id)
                                    : [...journey.painAreas, p.id as CategoryId];
                                  patch({
                                    painUnsure: false,
                                    painAreas: next,
                                  });
                                }}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <p className="vc-subhead">Operating maturity</p>
                          <SelectField
                            label="System fragmentation"
                            value={journey.systemsId}
                            onChange={(id) => patch({ systemsId: id })}
                            options={SYSTEMS_OPTIONS.map((o) => ({
                              id: o.id,
                              label: o.label,
                            }))}
                          />
                          <SelectField
                            label="Performance review"
                            value={journey.reconcileId}
                            onChange={(id) => patch({ reconcileId: id })}
                            options={RECONCILE_OPTIONS.map((o) => ({
                              id: o.id,
                              label: o.label,
                            }))}
                          />
                          <SelectField
                            label="Manual reconciliation"
                            value={journey.manualId}
                            onChange={(id) => patch({ manualId: id })}
                            options={MANUAL_OPTIONS.map((o) => ({
                              id: o.id,
                              label: o.label,
                            }))}
                          />
                          <SelectField
                            label="Standardization across sites (optional)"
                            value={journey.stdId}
                            onChange={(id) => patch({ stdId: id })}
                            options={STD_OPTIONS.map((o) => ({
                              id: o.id,
                              label: o.label,
                            }))}
                          />
                          {hint ? <p className="vc2-hint">{hint}</p> : null}
                          <div className="vc-nav-row">
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-ghost"
                              onClick={() => go("economics")}
                            >
                              Back
                            </button>
                            <button
                              type="button"
                              className="rx30-btn rx30-btn-primary"
                              onClick={() => continueFrom("signals")}
                            >
                              Build Value Map
                            </button>
                          </div>
                        </motion.div>
                      ) : null}

                      {step === "analyzing" ? (
                        <motion.div
                          key="analyzing"
                          className="vc2-card vc2-analyze"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <p className="rx30-kicker">RADR</p>
                          <h2>Building your Value Map</h2>
                          <ul>
                            {ANALYZE_LINES.map((line, i) => (
                              <li
                                key={line}
                                data-on={i <= analyzeIdx ? "true" : undefined}
                              >
                                {line}
                              </li>
                            ))}
                          </ul>
                          <p className="vc-disclaimer-inline">
                            Deterministic model from your inputs — not generative
                            invention.
                          </p>
                        </motion.div>
                      ) : null}

                      {step === "result" && result ? (
                        <motion.div
                          key="result"
                          initial={
                            reduced ? false : { opacity: 0, y: 12 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <ValueMapResult
                            journey={journey}
                            result={result}
                            onEdit={() => go("signals")}
                            onPatch={patch}
                          />
                        </motion.div>
                      ) : null}

                      {step === "result" && !result ? (
                        <div className="vc2-card">
                          <p>Missing inputs — edit to continue.</p>
                          <button
                            type="button"
                            className="rx30-btn rx30-btn-primary"
                            onClick={() => go("operation")}
                          >
                            Edit inputs
                          </button>
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>

                  {showPreview ? <LiveModelPreview journey={journey} /> : null}
                </div>
              </div>
            </section>
          ) : null}
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
