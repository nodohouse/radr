"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { CTAS } from "@/lib/marketing/brand";
import { ValueOpportunityMap } from "@/components/marketing/value-calculator/ValueOpportunityMap";
import {
  categoryDisplayLabel,
  categoryTone,
  evidenceLabel,
  effortLabel,
  proveLabel,
  reasonKind,
} from "@/components/marketing/value-calculator/valueMapSemantics";
import {
  CATEGORY_LABEL,
  DELIVERY_OPTIONS,
  DISCLAIMER,
  INVESTMENT_OPTIONS,
  LOCATION_OPTIONS,
  OPPORTUNITY_ASSUMPTIONS,
  PCT_OPTIONS,
  PORTFOLIO,
  PURCHASING_OPTIONS,
  REVENUE_OPTIONS_USD,
  assumptionByCategory,
  formatMoneyIntl,
  formatRangeIntl,
  optionById,
  verticalLabel,
  type CategoryId,
  type JourneyState,
  type ValueCalculatorResult,
} from "@/lib/marketing/value-calculator";

type Props = {
  journey: JourneyState;
  result: ValueCalculatorResult;
  onEdit: () => void;
  onPatch: (p: Partial<JourneyState>) => void;
};

function confidenceRing(level: ValueCalculatorResult["confidence"]) {
  if (level === "high") return 82;
  if (level === "medium") return 58;
  return 34;
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M11.5 2.5l2 2L5 13H3v-2l8.5-8.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <rect
        x="2"
        y="3.5"
        width="12"
        height="9"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2.5 4.5L8 9l5.5-4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 2.5v8M5 8l3 3 3-3M3 13.5h10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ValueMapResult({ journey, result, onEdit, onPatch }: Props) {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(
    result.startingOpportunity ?? result.categories[0]?.id ?? "",
  );
  const [how, setHow] = useState(false);
  const [sens, setSens] = useState(false);
  const [tighten, setTighten] = useState(false);
  const [email, setEmail] = useState(false);

  const loc = optionById(LOCATION_OPTIONS, journey.locationsId);
  const rev = optionById(REVENUE_OPTIONS_USD, journey.revenueId);
  const labor = optionById(PCT_OPTIONS, journey.laborId);
  const food = optionById(PCT_OPTIONS, journey.foodId);
  const delivery = optionById(DELIVERY_OPTIONS, journey.deliveryId);

  const active =
    result.categories.find((c) => c.id === activeId) ??
    result.categories.find((c) => c.id === result.startingOpportunity) ??
    result.categories[0];

  const start = result.categories.find(
    (c) => c.id === result.startingOpportunity,
  );
  const startAssumption = start
    ? assumptionByCategory(start.id)
    : undefined;

  const maxModeled = useMemo(
    () => Math.max(...result.categories.map((c) => c.modeled), 1),
    [result.categories],
  );

  const ring = confidenceRing(result.confidence);

  return (
    <motion.div
      className="vc-res"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="vc-res-atmosphere" aria-hidden />

      <header className="vc-res-head">
        <div className="vc-res-head-copy">
          <p className="rx30-kicker">Your RADR Value Map</p>
          <h1>
            Here is what may be worth
            <br />
            <em>investigating in your operation.</em>
          </h1>
          <p className="vc-res-sub">
            Modeled from the information you provided.
          </p>
          <p className="vc-disclaimer-inline">
            Illustrative estimate · Not a guaranteed outcome.
          </p>
        </div>
        <div className="vc-res-head-actions">
          <button type="button" className="vc-res-act" onClick={onEdit}>
            <IconEdit /> Edit inputs
          </button>
          <button
            type="button"
            className="vc-res-act"
            onClick={() => setEmail(true)}
          >
            <IconMail /> Email my Value Map
          </button>
          <button
            type="button"
            className="vc-res-act"
            onClick={() => window.print()}
          >
            <IconDownload /> Download Value Map
          </button>
        </div>
      </header>

      <div className="vc-res-hero-band">
        <div className="vc-res-value">
          <span>Modeled value worth investigating</span>
          <p>
            {formatRangeIntl(
              result.headline.low,
              result.headline.modeled,
              result.currency,
            )}
            <em> per year</em>
          </p>
          <div className="vc-res-tri">
            <div>
              <span>Conservative</span>
              <strong>
                {formatMoneyIntl(result.total.low, result.currency)}
              </strong>
            </div>
            <div data-on>
              <span>Modeled</span>
              <strong>
                {formatMoneyIntl(result.total.modeled, result.currency)}
              </strong>
            </div>
            <div>
              <span>Upside</span>
              <strong>
                {formatMoneyIntl(result.total.high, result.currency)}
              </strong>
            </div>
          </div>
        </div>

        <div className="vc-res-ops" aria-label="Operation summary">
          <div>
            <span>Operation</span>
            <strong>{verticalLabel(journey.vertical)}</strong>
          </div>
          <div>
            <span>
              {journey.vertical === "hotel" ? "Properties" : "Locations"}
            </span>
            <strong>{loc?.label ?? "—"}</strong>
          </div>
          <div>
            <span>Annual revenue</span>
            <strong>
              {rev?.label ?? "—"} · {journey.currency}
            </strong>
          </div>
          {labor ? (
            <div>
              <span>Labor</span>
              <strong>{labor.label}</strong>
            </div>
          ) : null}
          {food && journey.vertical !== "hotel" ? (
            <div>
              <span>Food / COGS</span>
              <strong>{food.label}</strong>
            </div>
          ) : null}
          {delivery && journey.vertical === "restaurant" ? (
            <div>
              <span>Delivery</span>
              <strong>{delivery.label}</strong>
            </div>
          ) : null}
        </div>
      </div>

      <div className="vc-res-main">
        <section className="vc-res-col vc-res-col--left" aria-label="Breakdown">
          <div className="vc-res-card">
            <h2>Opportunity breakdown</h2>
            <div className="vc-res-bars">
              {result.categories.slice(0, 6).map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className="vc-res-bar"
                  data-tone={categoryTone(c.id)}
                  data-on={activeId === c.id ? "true" : undefined}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className="vc-res-bar-meta">
                    <strong>
                      {categoryDisplayLabel(c, journey.vertical)}
                    </strong>
                    <span>
                      {formatRangeIntl(c.low, c.modeled, result.currency)}
                    </span>
                  </div>
                  <span className="vc-res-bar-track">
                    <i
                      style={{
                        width: `${Math.max(
                          8,
                          (c.modeled / maxModeled) * 100,
                        )}%`,
                        transitionDelay: reduced ? "0ms" : `${i * 40}ms`,
                      }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="vc-res-states">
            <article data-kind="potential">
              <span>Potential value</span>
              <strong>
                {formatRangeIntl(
                  result.total.low,
                  result.total.high,
                  result.currency,
                )}
              </strong>
              <p>
                Theoretical opportunity from supplied inputs and assumptions.
              </p>
            </article>
            <div className="vc-res-states-arrow" aria-hidden>
              ↓
            </div>
            <article data-kind="modeled">
              <span>Modeled RADR opportunity</span>
              <strong>
                {formatRangeIntl(
                  result.headline.low,
                  result.headline.modeled,
                  result.currency,
                )}
              </strong>
              <p>
                Adjusted for applicability, overlap
                {result.methodology.overlapGroupsApplied.length
                  ? ` (${result.methodology.overlapGroupsApplied.length} groups)`
                  : ""}
                , and evidence readiness.
              </p>
            </article>
            <div className="vc-res-states-arrow" aria-hidden>
              ↓
            </div>
            <article data-kind="verified">
              <span>Verified Value</span>
              <strong>{formatMoneyIntl(0, result.currency)}</strong>
              <p>
                RADR only counts value as Verified after the outcome is observed
                and verification criteria are satisfied.
              </p>
            </article>
          </div>
        </section>

        <section className="vc-res-col vc-res-col--map" aria-label="Value Map">
          <div className="vc-res-card vc-res-card--map">
            <p className="vc-res-map-kicker">Where value may sit</p>
            <ValueOpportunityMap
              categories={result.categories}
              currency={result.currency}
              vertical={journey.vertical}
              activeId={active?.id ?? null}
              onSelect={setActiveId}
            />
          </div>
        </section>

        <aside className="vc-res-col vc-res-col--right">
          {start ? (
            <motion.section
              className="vc-res-start"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: reduced ? 0 : 0.35 }}
            >
              <div className="vc-res-start-top">
                <p className="rx30-kicker">Start here</p>
                <span className="vc-res-start-badge">#1 recommendation</span>
              </div>
              <h2>{categoryDisplayLabel(start, journey.vertical)}</h2>
              <p className="vc-res-start-range">
                {formatRangeIntl(start.low, start.modeled, result.currency)}
                <em> / year</em>
              </p>
              <p className="vc-res-start-why-label">Why start here</p>
              <ul className="vc-res-start-why">
                <li>
                  {evidenceLabel(start.evidenceReadiness)} evidence availability
                </li>
                <li>
                  {proveLabel(startAssumption?.timeToProve ?? 0.5)} time to prove
                </li>
                <li>
                  {effortLabel(startAssumption?.effort ?? 0.5)} operational
                  disruption
                </li>
              </ul>
              <p className="vc-res-start-why-label">Typical systems / evidence</p>
              <ul className="vc-chips">
                {start.evidenceNeeded.slice(0, 5).map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <button
                type="button"
                className="rx30-btn rx30-btn-primary vc-res-start-cta"
                onClick={() => setActiveId(start.id)}
              >
                Explore this opportunity <span aria-hidden>→</span>
              </button>
            </motion.section>
          ) : null}

          <section
            className="vc-res-conf"
            data-level={result.confidence}
            aria-label="Model confidence"
          >
            <div
              className="vc-res-conf-meter"
              style={{ ["--p" as string]: String(ring) }}
            >
              <i aria-hidden />
              <strong>{result.confidence}</strong>
            </div>
            <div>
              <span>Model confidence</span>
              <ul>
                {result.confidenceReasons.slice(0, 5).map((r) => (
                  <li key={r} data-kind={reasonKind(r)}>
                    {r}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="vc-res-act"
                onClick={() => setTighten(true)}
              >
                Tighten my estimate →
              </button>
            </div>
          </section>

          <section className="vc-res-capture">
            <label>
              <span>Modeled value capture</span>
              <div className="vc2-capture-presets">
                {[0.1, 0.2, 0.3, 0.4].map((r) => (
                  <button
                    key={r}
                    type="button"
                    data-on={journey.captureRate === r ? "true" : undefined}
                    onClick={() => onPatch({ captureRate: r })}
                  >
                    {Math.round(r * 100)}%
                  </button>
                ))}
              </div>
            </label>
            <p>
              Not every identified opportunity becomes realized value. Capture
              depends on evidence, approval, execution, and follow-through.
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={result.captureScenario.rate}
                className="vc-res-capture-out"
                initial={reduced ? false : { opacity: 0.35, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                Modeled captured{" "}
                <strong>
                  {formatRangeIntl(
                    result.captureScenario.capturedLow,
                    result.captureScenario.capturedModeled,
                    result.currency,
                  )}
                </strong>{" "}
                / year
              </motion.p>
            </AnimatePresence>
          </section>
        </aside>
      </div>

      <section className="vc-res-below">
        <div className="vc2-futures">
          <h2>Compare futures</h2>
          <div className="vc2-futures-grid">
            <article data-kind="current">
              <span>Current course</span>
              <strong>
                Opportunity remains untested or partially realized
              </strong>
            </article>
            <article data-on>
              <span>With RADR</span>
              <strong>Detected → Reviewed → Actioned → Verified</strong>
              <em>
                At {Math.round(result.captureScenario.rate * 100)}% modeled
                capture — illustrative
              </em>
            </article>
          </div>
        </div>

        <div className="vc-roi">
          <p className="rx30-kicker">Want to model payback?</p>
          <label className="vc-field">
            <span>Expected annual RADR investment</span>
            <select
              value={journey.investmentId ?? ""}
              onChange={(e) =>
                onPatch({ investmentId: e.target.value || null })
              }
            >
              <option value="">Talk to sales / leave blank</option>
              {INVESTMENT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {result.roi ? (
            <div className="vc-roi-out">
              <div data-kind="roi">
                <span>Illustrative ROI</span>
                <strong>
                  {Math.round(result.roi.roiLow * 100)}–
                  {Math.round(result.roi.roiModeled * 100)}%
                </strong>
              </div>
              <div data-kind="payback">
                <span>Modeled payback</span>
                <strong>
                  {result.roi.paybackMonthsModeled != null
                    ? `${(result.roi.paybackMonthsModeled / 12).toFixed(1)} years`
                    : "—"}
                </strong>
              </div>
              <p className="vc-roi-hint">
                ROI = (modeled captured − investment) / investment. No guaranteed
                payback.
              </p>
            </div>
          ) : (
            <p className="vc-roi-hint">
              ROI appears only when investment is supplied.
            </p>
          )}
        </div>

        <div className="vc2-result-actions">
          <button type="button" className="vc-res-act" onClick={() => setSens(true)}>
            Adjust assumptions
          </button>
          <button type="button" className="vc-res-act" onClick={() => setHow(true)}>
            How was this calculated?
          </button>
          <Link href="/value-calculator/methodology" className="vc-res-act">
            Methodology →
          </Link>
        </div>
      </section>

      <section className="vc-res-cta">
        <div className="rx30-shell">
          <h2>Want to know which of this is real?</h2>
          <p>
            RADR uses source evidence to determine what is actionable and
            ultimately verifiable.
          </p>
          <div className="rx30-ctas">
            <Link
              href={CTAS.primaryProductHref}
              className="rx30-btn rx30-btn-primary"
            >
              Start a recovery pilot <span aria-hidden>→</span>
            </Link>
            <Link
              href={CTAS.seeInActionHref}
              className="rx30-btn rx30-btn-ghost rx30-btn-ghost--solid"
            >
              {CTAS.seeInAction}
            </Link>
          </div>
        </div>
      </section>

      <p className="vc-disclaimer-inline vc-res-foot">{DISCLAIMER}</p>

      {how ? (
        <div className="vc-drawer" role="dialog" aria-modal="true">
          <div className="vc-drawer-panel">
            <header>
              <h2>How was this calculated?</h2>
              <button type="button" onClick={() => setHow(false)}>
                Close
              </button>
            </header>
            <p>{DISCLAIMER}</p>
            <ul>
              {result.methodology.assumptionIds.map((id) => {
                const a = OPPORTUNITY_ASSUMPTIONS.find((x) => x.id === id);
                if (!a) return null;
                const cat = result.categories.find(
                  (c) => c.id === a.categoryId,
                );
                return (
                  <li key={id}>
                    <strong>
                      {CATEGORY_LABEL[a.categoryId as CategoryId]}
                    </strong>
                    <span>
                      Pool × {(a.rates.low * 100).toFixed(1)}–
                      {(a.rates.high * 100).toFixed(1)}% · {a.sourceType}
                      {cat
                        ? ` → ${formatRangeIntl(cat.low, cat.modeled, result.currency)}`
                        : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p>
              Overlap adjustment:{" "}
              {result.methodology.overlapGroupsApplied.join(", ") || "none"}.
              Portfolio cap:{" "}
              {result.methodology.portfolioCapApplied ? "applied" : "not needed"}
              .
            </p>
          </div>
        </div>
      ) : null}

      {sens ? (
        <div className="vc-drawer" role="dialog" aria-modal="true">
          <div className="vc-drawer-panel">
            <header>
              <h2>Adjust assumptions</h2>
              <button type="button" onClick={() => setSens(false)}>
                Close
              </button>
            </header>
            {OPPORTUNITY_ASSUMPTIONS.filter(
              (a) =>
                journey.vertical && a.verticals.includes(journey.vertical),
            ).map((a) => {
              const ov = journey.rateOverrides?.[a.id]?.base;
              const val = Math.round((ov ?? a.rates.base) * 1000) / 10;
              return (
                <label key={a.id} className="vc-field">
                  <span>
                    {CATEGORY_LABEL[a.categoryId]} · low{" "}
                    {Math.round(a.rates.low * 1000) / 10}% · base {val}% · high{" "}
                    {Math.round(a.rates.high * 1000) / 10}% · {a.sourceType}
                  </span>
                  <input
                    type="range"
                    min={Math.round(a.rates.low * 1000) / 10}
                    max={Math.round(a.rates.high * 1000) / 10}
                    step={0.1}
                    value={val}
                    onChange={(e) => {
                      const base = Number(e.target.value) / 100;
                      onPatch({
                        rateOverrides: {
                          ...journey.rateOverrides,
                          [a.id]: {
                            low: a.rates.low,
                            base,
                            high: a.rates.high,
                          },
                        },
                      });
                    }}
                  />
                </label>
              );
            })}
            <p className="vc-disclaimer-inline">
              Default capture {PORTFOLIO.defaultCaptureRate * 100}% · internal
              modeling assumptions unless marked otherwise
            </p>
          </div>
        </div>
      ) : null}

      {tighten ? (
        <div className="vc-drawer" role="dialog" aria-modal="true">
          <div className="vc-drawer-panel">
            <header>
              <h2>Tighten my estimate</h2>
              <button type="button" onClick={() => setTighten(false)}>
                Close
              </button>
            </header>
            <p>
              Add specifics without restarting. Unknowns stay assumed until you
              choose a range.
            </p>
            {journey.vertical !== "hotel" ? (
              <label className="vc-field">
                <span>Food / COGS %</span>
                <select
                  value={journey.foodId ?? ""}
                  onChange={(e) => onPatch({ foodId: e.target.value || null })}
                >
                  <option value="">Leave as-is</option>
                  {PCT_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="vc-field">
              <span>Labor %</span>
              <select
                value={journey.laborId ?? ""}
                onChange={(e) => onPatch({ laborId: e.target.value || null })}
              >
                <option value="">Leave as-is</option>
                {PCT_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="vc-field">
              <span>Purchasing / supplier spend</span>
              <select
                value={journey.purchasingId ?? ""}
                onChange={(e) =>
                  onPatch({ purchasingId: e.target.value || null })
                }
              >
                <option value="">Leave as-is</option>
                {PURCHASING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="rx30-btn rx30-btn-primary"
              onClick={() => setTighten(false)}
            >
              Update model
            </button>
          </div>
        </div>
      ) : null}

      {email ? (
        <div className="vc-drawer" role="dialog" aria-modal="true">
          <div className="vc-drawer-panel">
            <header>
              <h2>Email my Value Map</h2>
              <button type="button" onClick={() => setEmail(false)}>
                Close
              </button>
            </header>
            <p>Optional. No phone required.</p>
            <label className="vc-field">
              <span>Name</span>
              <input type="text" autoComplete="name" />
            </label>
            <label className="vc-field">
              <span>Work email</span>
              <input type="email" autoComplete="email" />
            </label>
            <label className="vc-field">
              <span>Company</span>
              <input type="text" autoComplete="organization" />
            </label>
            <button
              type="button"
              className="rx30-btn rx30-btn-primary"
              onClick={() => {
                window.print();
                setEmail(false);
              }}
            >
              Print / save Value Map
            </button>
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
