"use client";

import Link from "next/link";
import { useState } from "react";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import {
  berlinPreShiftBrief,
  type ReadinessState,
} from "@/lib/radr/product/shiftIntelligence";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { addOperatorContext } from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

function stateLabel(s: ReadinessState) {
  if (s === "READY") return "Ready";
  if (s === "WATCH") return "Watch";
  if (s === "CONSTRAINT_IDENTIFIED") return "Constraint identified";
  return "Action recommended";
}

export default function PreShiftPage() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const berlinOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id);
  const brief = berlinPreShiftBrief();
  const [ctxAdded, setCtxAdded] = useState(false);
  const [note, setNote] = useState("");

  if (!berlinOk) {
    return (
      <div className="rp-shift">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Pre-shift</p>
          <h1 className="rp-cc-title">Tonight</h1>
          <p className="rp-cc-since">
            Pre-shift readiness is scoped to Berlin Mitte in this demo.
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="rp-shift rp-shift-pre">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Pre-shift · {brief.asOf}</p>
        <h1 className="rp-cc-title">What is most likely to break tonight?</h1>
        <p className="rp-cc-since">
          {brief.locationName} · {brief.serviceLabel} · {brief.demoLabel}
        </p>
      </header>

      <section className="rp-shift-hero">
        <p className="rp-shift-verdict">{brief.headline}</p>
        <p className="rp-drec-quiet">
          Not a readiness score — conditions that can still change the Decision
        </p>
      </section>

      <section className="rp-drec-sec">
        <h2>Tonight · {brief.conditions.length} conditions matter</h2>
        <ul className="rp-shift-conditions">
          {brief.conditions.map((c) => (
            <li key={c.id} data-state={c.state}>
              <span className="rp-shift-state">{stateLabel(c.state)}</span>
              <strong>{c.title}</strong>
              <p>{c.detail}</p>
              <em>{c.evidence.join(" · ")}</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-drec-sec">
        <h2>Arrival density</h2>
        <p className="rp-shift-stat">
          <strong>{brief.arrivalDensity.coversInWindow}</strong>
          <span>
            covers in {brief.arrivalDensity.window} · of{" "}
            {brief.arrivalDensity.totalBooked} booked
          </span>
        </p>
        <p className="rp-drec-quiet">{brief.arrivalDensity.compressionLabel}</p>
      </section>

      <section className="rp-drec-sec">
        <h2>Demand quality · which demand to accept</h2>
        <ul className="rp-demand-q">
          {brief.demandQuality.map((d) => (
            <li key={d.id} data-accept={d.acceptNow ? "true" : "false"}>
              <strong>{d.label}</strong>
              <span>
                {formatDecisionMoney(d.grossEuro)} gross ·{" "}
                {formatDecisionMoney(d.contributionEuro)} contribution ·{" "}
                {formatDecisionMoney(d.contributionPerKitchenMinute)} / kitchen
                minute
              </span>
              <em>
                {d.acceptNow ? "Accept / protect" : "Defer / throttle"} ·{" "}
                {d.reason}
              </em>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-drec-sec">
        <h2>RADR prepared</h2>
        <ul className="rp-action-sheet">
          {brief.prepared.map((p, i) => (
            <li key={p}>
              <span className="rp-action-sys">Prepared</span>
              <strong>{p}</strong>
              <span className="rp-action-st">Not executed</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rp-drec-sec" id="judgment">
        <h2>What RADR needs from you</h2>
        <p className="rp-shift-ask">{brief.judgment.question}</p>
        <p className="rp-drec-quiet">
          {brief.judgment.reason} · {brief.judgment.priorHits} prior hits ·{" "}
          {brief.judgment.contextClass}
        </p>
        <label htmlFor="shift-ctx" className="sr-only">
          Operator context
        </label>
        <textarea
          id="shift-ctx"
          className="rp-shift-textarea"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. New chef on cold station · VIP at 18:50"
        />
        <button
          type="button"
          className="rp-cc-cta"
          onClick={() => {
            addOperatorContext(DECISION_IDS.peak);
            setCtxAdded(true);
          }}
        >
          Add context → re-simulate readiness
        </button>
        {ctxAdded ? (
          <div className="rp-re-sim">
            <p>Operator context added</p>
            <p>Operating model updated</p>
            <p>Pre-shift Futures re-simulated</p>
            <p>Peak Decision context linked</p>
          </div>
        ) : null}
      </section>

      <div className="rp-ask-fixtures">
        {brief.relatedDecisionIds.map((id) => (
          <Link
            key={id}
            href={`/app/decisions/${id}`}
            className="rp-drec-secondary"
          >
            Open {displayDecisionId(id)}
          </Link>
        ))}
        <Link href="/app/service" className="rp-drec-secondary">
          Service Map
        </Link>
        <Link href="/app" className="rp-drec-secondary">
          Control Center
        </Link>
      </div>
    </div>
  );
}
