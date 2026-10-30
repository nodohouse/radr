"use client";

/**
 * Group Control Center mock — Group → Location → Decision.
 * List → Decision Focus Mode stays inside the mockup frame (no page jump).
 */

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import NextLink from "next/link";
import {
  GROUP_METRICS,
  GROUP_NEEDS_YOU,
  NORTHSTAR_ORG,
  NORTHSTAR_REGIONS,
  LOCATION_BY_ID,
  REGION_FOOTPRINT_LINE,
  euro,
  handlingForLocation,
  needsYouForLocation,
  type LocationId,
  type GroupLiveDecision,
} from "@/lib/marketing/northstarGroup";
import "@/app/radr-public.css";

type Scope = "all" | LocationId;

function moneyLabel(d: GroupLiveDecision): string {
  if (d.state === "investigate") return "unexplained";
  if (d.classLabel === "Perishable revenue") return "at risk";
  return "at risk";
}

function DecisionFocus({
  decision,
  onBack,
  headingId,
}: {
  decision: GroupLiveDecision;
  onBack: () => void;
  headingId: string;
}) {
  const loc = LOCATION_BY_ID[decision.locationId];
  const p = decision.preview;
  const amount = euro(decision.economics.exposed);
  const label = moneyLabel(decision);

  return (
    <div className="rx-gcc-focus" role="region" aria-labelledby={headingId}>
      <button type="button" className="rx-gcc-back" onClick={onBack}>
        <span aria-hidden="true">←</span> All Decisions
      </button>

      <header className="rx-gcc-focus-head">
        <p className="rx-gcc-focus-loc">{loc.name}</p>
        <p className="rx-gcc-focus-class">{decision.classLabel}</p>
        <h3 id={headingId} className="rx-gcc-focus-amount" tabIndex={-1}>
          {amount}
        </h3>
        <p className="rx-gcc-focus-label">
          {p?.type === "futures" && p.expiresHint ? p.expiresHint : label}
        </p>
      </header>

      {p ? (
        <>
          <section className="rx-gcc-focus-block">
            <h4>Why RADR flagged this</h4>
            <p>{p.whyFlagged}</p>
          </section>

          {p.type === "reconciliation" && p.sources ? (
            <section className="rx-gcc-focus-block" aria-label="Evidence">
              <ul className="rx-gcc-src">
                {p.sources.map((s) => (
                  <li key={s.label}>
                    <span>{s.label}</span>
                    <strong>{euro(s.amount)}</strong>
                  </li>
                ))}
              </ul>
              <div className="rx-gcc-gap">
                <span>{p.unexplainedLabel ?? "Unexplained difference"}</span>
                <strong>{amount}</strong>
              </div>
            </section>
          ) : null}

          {p.type === "reconciliation" && p.ruledOut ? (
            <section className="rx-gcc-focus-block">
              <h4>What RADR has already ruled out</h4>
              <ul className="rx-gcc-ruled">
                {p.ruledOut.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span> {item}
                  </li>
                ))}
                <li data-open="true">
                  <span aria-hidden="true">?</span> {amount} still unexplained
                </li>
              </ul>
            </section>
          ) : null}

          {p.type === "variance" ? (
            <section className="rx-gcc-focus-block" aria-label="Calculation">
              <ul className="rx-gcc-calc">
                <li>
                  <span>Contract</span>
                  <strong>{p.contractRate}</strong>
                </li>
                <li>
                  <span>Invoice</span>
                  <strong>{p.invoiceRate}</strong>
                </li>
                <li>
                  <span>Quantity</span>
                  <strong>{p.quantity}</strong>
                </li>
              </ul>
              <div className="rx-gcc-gap">
                <span>Variance</span>
                <strong>{amount}</strong>
              </div>
              {p.baseline ? (
                <div className="rx-gcc-baseline">
                  <h4>No-action baseline</h4>
                  <p>{p.baseline}</p>
                </div>
              ) : null}
              {p.checks ? (
                <ul className="rx-gcc-checks">
                  {p.checks.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {p.type === "futures" && p.futures ? (
            <section className="rx-gcc-focus-block" aria-label="Futures">
              <h4>Three possible Futures</h4>
              <p className="rx-gcc-fut-axis" aria-hidden="true">
                Now → close
              </p>
              <div className="rx-gcc-fut-viz" aria-hidden="true">
                {p.futures.map((f, i) => (
                  <svg
                    key={f.id}
                    className="rx-gcc-fut-path"
                    data-rec={f.recommended ? "true" : undefined}
                    viewBox="0 0 120 36"
                    width="100%"
                    height="36"
                  >
                    <path
                      d={
                        i === 0
                          ? "M4 28 C 40 26, 70 18, 116 8"
                          : i === 1
                            ? "M4 28 C 40 24, 70 10, 116 4"
                            : "M4 28 C 40 28, 70 22, 116 16"
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={f.recommended ? 2.2 : 1.4}
                    />
                  </svg>
                ))}
              </div>
              <ul className="rx-gcc-fut-list">
                {p.futures.map((f) => (
                  <li
                    key={f.id}
                    data-rec={f.recommended ? "true" : undefined}
                  >
                    <span>{f.label}</span>
                    <strong>{euro(f.expected)}</strong>
                    {f.recommended ? <em>Recommended</em> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rx-gcc-focus-rec">
            <h4>RADR recommends</h4>
            <p className="rx-gcc-rec-title">{p.recommendation}</p>
            <p className="rx-gcc-rec-why">{p.recommendationWhy}</p>
          </section>

          {(p.evidenceSources || p.freshness || p.statusLabel) && (
            <p className="rx-gcc-focus-meta">
              {[
                p.evidenceSources
                  ? `Evidence · ${p.evidenceSources} sources`
                  : null,
                p.freshness ? `Freshness · ${p.freshness}` : null,
                p.statusLabel ? `Status · ${p.statusLabel}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          <div className="rx-gcc-focus-ctas">
            <NextLink href={p.deepLinkHref} className="rx-gcc-deep">
              {p.deepLinkLabel} <span aria-hidden="true">→</span>
            </NextLink>
            {p.secondaryLinkLabel && p.secondaryLinkHref ? (
              <NextLink
                href={p.secondaryLinkHref}
                className="rx-gcc-deep-sec"
              >
                {p.secondaryLinkLabel} <span aria-hidden="true">→</span>
              </NextLink>
            ) : null}
          </div>
        </>
      ) : (
        <p className="rx-gcc-focus-sub">{decision.detail}</p>
      )}
    </div>
  );
}

export function GroupControlCenterMock() {
  const [scope, setScope] = useState<Scope>("all");
  const [focusId, setFocusId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const focusHeadingId = useId();
  const listId = useId();

  const m = GROUP_METRICS;
  const isGroup = scope === "all";
  const location = isGroup ? null : LOCATION_BY_ID[scope];
  const needsYou = needsYouForLocation(scope);
  const handling = handlingForLocation(scope);
  const scopeLabel = isGroup
    ? "All locations"
    : (location?.name ?? "Location");

  const focused =
    focusId != null
      ? (needsYou.find((d) => d.displayId === focusId) ??
        GROUP_NEEDS_YOU.find((d) => d.displayId === focusId) ??
        null)
      : null;

  const openDecision = useCallback((id: string) => {
    setFocusId(id);
  }, []);

  const closeFocus = useCallback(() => {
    const returnId = focusId;
    setFocusId(null);
    queueMicrotask(() => {
      if (returnId) rowRefs.current[returnId]?.focus();
    });
  }, [focusId]);

  useEffect(() => {
    if (!focused) return;
    const el = document.getElementById(focusHeadingId);
    el?.focus({ preventScroll: true });
  }, [focused, focusHeadingId]);

  useEffect(() => {
    if (!focused) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeFocus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focused, closeFocus]);

  function onRowKey(
    e: KeyboardEvent<HTMLButtonElement>,
    id: string,
  ) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openDecision(id);
    }
  }

  return (
    <aside
      className="rx-gcc"
      data-mode={focused ? "focus" : "list"}
      aria-label={`${NORTHSTAR_ORG.name} Control Center`}
    >
      <header className="rx-gcc-head">
        <div className="rx-gcc-org">
          <p className="rx-gcc-org-name">{NORTHSTAR_ORG.name}</p>
          <p className="rx-gcc-footprint">
            Group estate · {m.locationCount} locations reporting ·{" "}
            {REGION_FOOTPRINT_LINE}
          </p>
        </div>

        <div className="rx-gcc-head-tools">
          <label htmlFor="rx-gcc-scope" className="sr-only">
            Location scope
          </label>
          <select
            id="rx-gcc-scope"
            className="rx-gcc-scope-btn"
            value={scope}
            aria-label={`Location scope · ${scopeLabel}`}
            disabled={Boolean(focused)}
            onChange={(e) => {
              setScope(e.target.value as Scope);
              setFocusId(null);
            }}
          >
            <option value="all">All locations</option>
            {NORTHSTAR_REGIONS.map((region) => (
              <optgroup key={region.id} label={region.label}>
                {region.locationIds.map((id) => (
                  <option key={id} value={id}>
                    {LOCATION_BY_ID[id].name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="rx-gcc-fx">{NORTHSTAR_ORG.reportingCurrencyLabel}</span>
        </div>
      </header>

      {focused ? (
        <DecisionFocus
          decision={focused}
          onBack={closeFocus}
          headingId={focusHeadingId}
        />
      ) : (
        <>
          {isGroup ? (
            <div className="rx-gcc-metrics" aria-label="Group summary">
              <div>
                <strong>{euro(m.valueAtRisk)}</strong>
                <em>At risk</em>
              </div>
              <div className="rx-gcc-metric-verified" data-roi="true">
                <strong data-tone="verified">{euro(m.verifiedThisMonth)}</strong>
                <em>Verified · ROI</em>
              </div>
              <div>
                <strong>{m.needsAttention}</strong>
                <em>Need attention</em>
              </div>
              <div>
                <strong>
                  {m.locationsReporting}/{m.locationCount}
                </strong>
                <em>Reporting · estate</em>
              </div>
            </div>
          ) : null}

          <div className="rx-gcc-brief">
            <p className="rx-gcc-greet">Good morning.</p>
            {isGroup ? (
              <>
                <p className="rx-gcc-need">
                  <strong>{m.needsAttention} things need you.</strong>
                </p>
                <p className="rx-gcc-meta">
                  {m.locationCount} locations · {m.withinExpectations} within
                  expectations
                </p>
              </>
            ) : (
              <>
                <p className="rx-gcc-place">{location?.name}</p>
                <p className="rx-gcc-need">
                  <strong>
                    {needsYou.length === 1
                      ? "1 Decision needs attention"
                      : `${needsYou.length} Decisions need attention`}
                  </strong>
                </p>
                <p className="rx-gcc-meta">
                  {handling.length > 0
                    ? `${handling.length} RADR is handling · everything else within expectations`
                    : "Everything else within expectations"}
                </p>
              </>
            )}
          </div>

          <ul className="rx-gcc-rows" id={listId}>
            {needsYou.map((d) => (
              <li key={d.displayId}>
                <button
                  type="button"
                  className="rx-gcc-row-btn"
                  ref={(el) => {
                    rowRefs.current[d.displayId] = el;
                  }}
                  aria-label={`${LOCATION_BY_ID[d.locationId].name}. ${d.classLabel}. ${euro(d.economics.exposed)} ${moneyLabel(d)}. ${d.cta}.`}
                  onClick={() => openDecision(d.displayId)}
                  onKeyDown={(e) => onRowKey(e, d.displayId)}
                >
                  <div className="rx-gcc-row-loc">
                    <em>{LOCATION_BY_ID[d.locationId].name}</em>
                    <span>{d.classLabel}</span>
                  </div>
                  <div className="rx-gcc-row-money">
                    <strong>{euro(d.economics.exposed)}</strong>
                    <span>{moneyLabel(d)}</span>
                  </div>
                  <p className="rx-gcc-line">{d.line}</p>
                  <span className="rx-gcc-cta">
                    {d.cta.toUpperCase()} <span aria-hidden="true">→</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {isGroup ? (
            <p className="rx-gcc-quiet">
              {m.withinExpectations} locations within expectations
            </p>
          ) : handling.length > 0 ? (
            <ul className="rx-gcc-handling">
              {handling.map((d) => (
                <li key={d.displayId}>
                  <em>RADR is handling</em>
                  <strong>
                    {d.displayId} · {d.classLabel}
                  </strong>
                  <span>{d.line}</span>
                </li>
              ))}
            </ul>
          ) : needsYou.length === 0 ? (
            <p className="rx-gcc-quiet">
              No Decisions need you · RADR is watching
            </p>
          ) : null}

          <p className="rx-gcc-note">{m.disclosure}</p>
        </>
      )}
    </aside>
  );
}

/** Used by tests / Control Center chapter — keep export stable */
export const GCC_OPEN_COUNT = GROUP_NEEDS_YOU.length;
