"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IntelligenceCanvas } from "@/components/product/canvas/IntelligenceCanvas";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  COKE_MARGIN_FUTURES,
  COKE_MARGIN_SHOCK,
  COKE_PROPAGATION,
  COKE_SUPPLIER_LEVERAGE,
  simulateCokePriceRaise,
  type MarginResponseId,
} from "@/lib/radr/product/marginResponse";
import {
  getConnectedScenario,
  setCokePriceDelta,
  setMarginFutureId,
  subscribeConnected,
} from "@/lib/radr/product/connectedState";

/**
 * Margin Response showpiece — cost shock propagates · Futures reorganize.
 */
export function MarginResponseCanvas() {
  const [step, setStep] = useState<"shock" | "propagate" | "futures">("shock");
  const [litDepth, setLitDepth] = useState(0);
  const [selected, setSelected] = useState<MarginResponseId>("category_rebalance");
  const [nlDelta, setNlDelta] = useState<number | null>(null);
  const [, tick] = useState(0);

  useEffect(() => subscribeConnected(() => tick((n) => n + 1)), []);

  useEffect(() => {
    if (step !== "propagate") return;
    setLitDepth(0);
    const timers = COKE_PROPAGATION.map((n) =>
      window.setTimeout(() => setLitDepth(n.depth), 280 + n.depth * 320),
    );
    const toFutures = window.setTimeout(() => setStep("futures"), 3200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(toFutures);
    };
  }, [step]);

  const future = useMemo(
    () => COKE_MARGIN_FUTURES.find((f) => f.id === selected) ?? COKE_MARGIN_FUTURES[0]!,
    [selected],
  );

  const sim = nlDelta != null ? simulateCokePriceRaise(nlDelta) : null;

  function pickFuture(id: MarginResponseId) {
    setSelected(id);
    setMarginFutureId(id);
  }

  function runNlRaise() {
    const d = 0.2;
    setNlDelta(d);
    setCokePriceDelta(d);
    setStep("futures");
    pickFuture("raise_item");
  }

  return (
    <IntelligenceCanvas
      kicker="Margin Response · DEMO · ILLUSTRATIVE"
      title="What is the strongest response to this margin shock?"
      inspector={
        <div className="rp-margin-why">
          <p className="rp-icanvas-kicker">Why RADR believes this</p>
          <dl>
            <div>
              <dt>Shock class</dt>
              <dd>{COKE_MARGIN_SHOCK.shockClass.replace(/_/g, " ")}</dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>{COKE_MARGIN_SHOCK.shockClassNote}</dd>
            </div>
            <div>
              <dt>Price needed</dt>
              <dd>{COKE_MARGIN_SHOCK.priceNeededNote}</dd>
            </div>
            <div>
              <dt>Elasticity</dt>
              <dd>{COKE_MARGIN_SHOCK.elasticityNote}</dd>
            </div>
            <div>
              <dt>Counterevidence</dt>
              <dd>
                Blunt raise recovers item margin fastest on paper — concentrates
                guest-price exposure on the volume anchor.
              </dd>
            </div>
          </dl>
          <Link
            href={`/app/decisions/${DECISION_IDS.marginCoke}`}
            className="rp-drec-secondary"
          >
            Open {displayDecisionId(DECISION_IDS.marginCoke)}
          </Link>
        </div>
      }
    >
      <div className="rp-margin-steps" role="tablist">
        {(
          [
            ["shock", "Cost shock"],
            ["propagate", "Propagation"],
            ["futures", "Response Futures"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            data-on={step === id ? "true" : undefined}
            onClick={() => setStep(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {step === "shock" ? (
        <div className="rp-margin-shock">
          <p className="rp-margin-sku">{COKE_MARGIN_SHOCK.sku}</p>
          <p className="rp-margin-delta">
            <span>€{COKE_MARGIN_SHOCK.priorUnitCostEuro.toFixed(2)}</span>
            <span aria-hidden="true">→</span>
            <strong>€{COKE_MARGIN_SHOCK.newUnitCostEuro.toFixed(2)}</strong>
            <em>+{COKE_MARGIN_SHOCK.deltaPct}%</em>
          </p>
          <p className="rp-drec-quiet">
            Do not conclude RAISE PRICE. First: contract variance · market ·
            pack · surcharge · or data conflict?
          </p>
          <p className="rp-margin-class">
            Classified · {COKE_MARGIN_SHOCK.shockClass.replace(/_/g, " ")}
          </p>
          <button
            type="button"
            className="rp-cc-cta"
            onClick={() => setStep("propagate")}
          >
            Watch impact propagate
          </button>
        </div>
      ) : null}

      {step === "propagate" ? (
        <ul className="rp-margin-graph" aria-label="Cost shock propagation">
          {COKE_PROPAGATION.map((n) => (
            <li
              key={n.id}
              data-kind={n.kind}
              data-on={litDepth >= n.depth ? "true" : undefined}
              style={{ ["--d" as string]: n.depth }}
            >
              <em>{n.kind}</em>
              <strong>{n.label}</strong>
              {n.detail ? <span>{n.detail}</span> : null}
              {n.euro != null ? (
                <b>{formatDecisionMoney(n.euro)}</b>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {step === "futures" ? (
        <div className="rp-margin-futures">
          <p className="rp-drec-quiet">
            Price needed to restore margin is one input — not the Decision.
          </p>
          <ul className="rp-margin-fut-list">
            {COKE_MARGIN_FUTURES.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  data-selected={selected === f.id ? "true" : undefined}
                  data-rec={f.recommended ? "true" : undefined}
                  data-blocked={!f.feasible ? "true" : undefined}
                  onClick={() => f.feasible && pickFuture(f.id)}
                  disabled={!f.feasible}
                >
                  <strong>{f.label}</strong>
                  <span>
                    {f.expectedContributionEuro != null
                      ? `${formatDecisionMoney(f.expectedContributionEuro)} expected`
                      : f.economicEffectNote ?? "Not modeled"}
                  </span>
                  <em>{f.mainUncertainty}</em>
                </button>
              </li>
            ))}
          </ul>
          <div className="rp-margin-fut-detail">
            <h3>{future.label}</h3>
            <p>{future.basketEffect}</p>
            <p className="rp-drec-quiet">
              Guest price · {future.guestPriceExposure} · Supplier ·{" "}
              {future.supplierDependency}
            </p>
            {future.priceNeededNote ? (
              <p className="rp-drec-quiet">{future.priceNeededNote}</p>
            ) : null}
          </div>

          <div className="rp-margin-leverage">
            <p className="rp-icanvas-kicker">Supplier leverage · group</p>
            <ul>
              {COKE_SUPPLIER_LEVERAGE.map((r) => (
                <li key={r.location}>
                  <strong>{r.location}</strong>
                  <span>€{r.unitCostEuro.toFixed(2)}</span>
                  <em>{r.volumeWeek}/wk</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="rp-margin-nl">
            <p className="rp-icanvas-kicker">Natural-language simulation · DEMO</p>
            <button type="button" className="rp-drec-disclose" onClick={runNlRaise}>
              What if we raise Coke by €0.20?
            </button>
            {sim ? (
              <p className="rp-margin-nl-out">
                MODELED SCENARIO · +{formatDecisionMoney(sim.expectedIncrementalEuro)}{" "}
                expected incremental · {sim.note}
              </p>
            ) : null}
            {getConnectedScenario().marginFutureId ? (
              <p className="rp-drec-quiet">
                Connected · Margin Future synced across product surfaces
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </IntelligenceCanvas>
  );
}
