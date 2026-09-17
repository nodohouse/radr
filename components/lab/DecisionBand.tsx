"use client";

import { useEffect, useState } from "react";
import { formatEuro } from "@/lib/lab/format";
import { useLab } from "@/lib/lab/store";
import { AutopilotPanel } from "./AutopilotPanel";

export function DecisionBand() {
  const { hero, state, setMode, setFuture, setVip, goValue } = useLab();
  const [confirm, setConfirm] = useState(false);
  const [lineage, setLineage] = useState(false);
  const approved = state.mode === "approved";

  useEffect(() => {
    setConfirm(false);
    setLineage(false);
  }, [state.seed, state.mode]);

  return (
    <section className="lab-decision" data-seed={state.seed} data-mode={state.mode}>
      <article className="lab-obj" data-kind={state.seed}>
        <div className="lab-obj-top">
          <p className="lab-obj-attn">{approved ? "Staged" : "Needs you"}</p>
          <p className="lab-obj-id">{hero.displayId}</p>
        </div>
        <h2 className="lab-obj-title">{hero.title}</h2>
        <p className="lab-obj-sub">{hero.sub}</p>
        <button
          type="button"
          className="lab-obj-euro"
          data-grade="expected"
          onClick={() => setLineage((v) => !v)}
          aria-expanded={lineage}
        >
          <strong>{formatEuro(hero.euro)}</strong>
          <span>Expected</span>
          <em>{hero.moneyMeta}</em>
        </button>
        {lineage ? (
          <p className="lab-obj-because">
            because {hero.because} · {hero.displayId} · not Verified
          </p>
        ) : (
          <p className="lab-obj-because">because {hero.because}</p>
        )}
        <div className="lab-obj-deadline">
          <span>{state.seed === "recover" ? "Recover clock" : "Decide by"}</span>
          <strong>{hero.deadlineLabel}</strong>
          <em>{hero.clockLabel}</em>
        </div>

        {state.mode === "why" ? (
          <div className="lab-obj-why">
            {hero.whyLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <button type="button" className="lab-ghost" onClick={() => setMode("live")}>
              ← Live
            </button>
          </div>
        ) : null}

        {state.mode === "context" ? (
          <div className="lab-obj-context">
            <button type="button" onClick={() => (state.seed === "service" ? setVip() : undefined)}>
              {state.seed === "recover"
                ? "Supplier offered partial credit"
                : state.seed === "hotel"
                  ? "VIP arrivals must keep booked rooms"
                  : "VIP party must sit at 18:50"}
            </button>
            <button type="button" className="lab-ghost" onClick={() => setMode("live")}>
              ← Live
            </button>
          </div>
        ) : null}

        {state.mode !== "why" && state.mode !== "approved" ? (
          <div className="lab-obj-actions">
            <button type="button" onClick={() => setMode("why")}>
              Why
            </button>
            <button type="button" onClick={() => setMode("futures")}>
              Futures
            </button>
            <button type="button" onClick={() => setMode("context")}>
              Add context
            </button>
          </div>
        ) : null}

        {!approved ? (
          <div className="lab-obj-approve-zone">
            {confirm ? (
              <div className="lab-obj-confirm" role="alertdialog" aria-label="Confirm">
                <p>
                  Stages work — does not write systems of record.{" "}
                  <strong>{formatEuro(hero.euro)} stays Expected</strong>.
                </p>
                <div className="lab-obj-confirm-row">
                  <button type="button" className="lab-obj-approve" onClick={() => setMode("approved")}>
                    Confirm prepare
                  </button>
                  <button type="button" className="lab-ghost" onClick={() => setConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="lab-obj-approve" onClick={() => setConfirm(true)}>
                {state.seed === "recover"
                  ? "Approve dispute"
                  : state.seed === "hotel"
                    ? "Approve release"
                    : "Approve wait"}
              </button>
            )}
          </div>
        ) : (
          <button type="button" className="lab-ghost" onClick={() => setMode("live")}>
            ← Live
          </button>
        )}

        {state.seed === "recover" ? (
          <button type="button" className="lab-board-trace-link" onClick={() => goValue("trace")}>
            Trace · INV-88421 · CM-DRAFT
          </button>
        ) : null}
      </article>

      <div className="lab-decision-side">
        {state.mode === "futures" || state.mode === "live" || state.mode === "context" ? (
          <div className="lab-futures">
            <p className="lab-k">Futures</p>
            <p className="lab-futures-t">Three options. One Decision.</p>
            <div className="lab-futures-row">
              {hero.futures.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="lab-futures-chip"
                  data-on={state.selectedFuture === f.id || undefined}
                  data-rec={hero.recommendedFuture === f.id || undefined}
                  onClick={() => {
                    setFuture(f.id);
                    setMode("futures");
                  }}
                >
                  <span>{f.title}</span>
                  <strong>{f.euro == null ? "—" : formatEuro(f.euro)}</strong>
                  <em>{f.note}</em>
                  {hero.recommendedFuture === f.id ? <i>REC</i> : null}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <AutopilotPanel hero={hero} approved={approved} />
      </div>
    </section>
  );
}
