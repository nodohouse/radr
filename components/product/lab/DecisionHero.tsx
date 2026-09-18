"use client";

/**
 * Decision objects — host-stand ticket / AP dossier / futures route cards.
 * Not form cards. Expected € never reads as cash-in-hand.
 */

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LabFuture, LabSeed } from "./labState";
import { isFinanceSeed } from "./labState";
import {
  TRACE_PEAK_EXPECTED,
  TRACE_SUPPLIER_EXPECTED,
  TRACE_TWO_SITE_EXPECTED,
  type TraceLineage,
} from "./labLineage";

type Props = {
  mode: "live" | "why" | "futures" | "context" | "approved";
  seed: LabSeed;
  displayId: string;
  label: string;
  sub: string;
  contribution: number;
  moneyMeta: string;
  deadlineLabel: string;
  clockLabel: string;
  recommended: LabFuture;
  selectedFuture: LabFuture;
  operatorVip: boolean;
  onWhy: () => void;
  onFutures: () => void;
  onContext: () => void;
  onApprove: () => void;
  onSelectFuture: (f: LabFuture) => void;
  onLive: () => void;
  onOpenTrace: () => void;
  contextSlot?: ReactNode;
  whySlot?: ReactNode;
};

const SERVICE_FUTURES: {
  id: LabFuture;
  title: string;
  euro: string;
  note: string;
}[] = [
  { id: "seat_now", title: "Seat now", euro: "€0", note: "Kitchen →97%" },
  { id: "wait_12", title: "Wait 12 min", euro: "€620", note: "Protect peak" },
  { id: "hard_stop", title: "Kill delivery", euro: "€180", note: "Over-corrects" },
];

const RECOVER_FUTURES: {
  id: LabFuture;
  title: string;
  euro: string;
  note: string;
}[] = [
  { id: "seat_now", title: "Leave unapplied", euro: "€0", note: "Cash never lands" },
  { id: "wait_12", title: "Apply credit", euro: "€273", note: "Verified recovered" },
  { id: "hard_stop", title: "Reprice menu", euro: "—", note: "Wrong lever" },
];

const TWO_SITE_FUTURES: {
  id: LabFuture;
  title: string;
  euro: string;
  note: string;
}[] = [
  { id: "seat_now", title: "Absorb", euro: "€0", note: "Cash never lands" },
  { id: "wait_12", title: "Dispute gap", euro: "€410", note: "REC · Expected" },
  { id: "hard_stop", title: "Switch supplier", euro: "—", note: "Wrong first lever" },
];

function LineageBlock({ t, onOpenTrace }: { t: TraceLineage; onOpenTrace: () => void }) {
  const sealed = t.sealed && t.grade === "Verified";
  return (
    <div className="lab-obj-lineage" data-sealed={sealed ? "true" : undefined}>
      <p className="lab-obj-lineage-k">
        {sealed ? "Sealed Trace · book-matchable" : "Lineage · Expected until sealed"}
      </p>
      <p className="lab-obj-lineage-because">because {t.because}</p>
      {t.chain ? (
        <ol className="lab-obj-chain">
          {t.chain.map((c) => (
            <li key={c.id}>
              <em>{c.label}</em>
              <strong>{c.value}</strong>
              <span>because {c.because}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul>
          <li>
            <em>Source</em>
            <span>{t.sourceSystem}</span>
          </li>
          {t.documentRefs.slice(0, 3).map((d) => (
            <li key={d.label}>
              <em>{d.label}</em>
              <span>{d.value}</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="lab-obj-ghost" onClick={onOpenTrace}>
        Open full Trace →
      </button>
    </div>
  );
}

export function DecisionHero(props: Props) {
  const {
    mode,
    seed,
    displayId,
    label,
    sub,
    contribution,
    moneyMeta,
    deadlineLabel,
    clockLabel,
    recommended,
    selectedFuture,
    operatorVip,
    onWhy,
    onFutures,
    onContext,
    onApprove,
    onSelectFuture,
    onLive,
    onOpenTrace,
    contextSlot,
    whySlot,
  } = props;

  const [confirm, setConfirm] = useState(false);
  const [lineageOpen, setLineageOpen] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const futures =
    seed === "margin-response"
      ? TWO_SITE_FUTURES
      : seed === "recover"
        ? RECOVER_FUTURES
        : SERVICE_FUTURES;
  const trace =
    seed === "margin-response"
      ? TRACE_TWO_SITE_EXPECTED
      : seed === "recover"
        ? TRACE_SUPPLIER_EXPECTED
        : TRACE_PEAK_EXPECTED;

  useEffect(() => {
    if (!confirm) return;
    confirmBtnRef.current?.focus();
  }, [confirm]);

  useEffect(() => {
    setConfirm(false);
    setLineageOpen(false);
  }, [seed, mode]);

  if (mode === "approved") {
    return (
      <aside className="lab-obj" data-kind={seed} data-mode="approved">
        <p className="lab-obj-stamp" data-ok>
          Prepared
        </p>
        <h1 className="lab-obj-title">{label}</h1>
        <p className="lab-obj-euro" data-grade="expected">
          <strong>€{contribution}</strong>
          <span>Expected</span>
        </p>
        <p className="lab-obj-note">
          Staged only — not written to systems of record. Verifies when{" "}
          {isFinanceSeed(seed)
            ? "the credit is applied and Finance can match it"
            : "contribution matches after service"}
          .
        </p>
        <button type="button" className="lab-obj-ghost" onClick={onLive}>
          ← Live
        </button>
      </aside>
    );
  }

  if (mode === "futures") {
    return (
      <aside className="lab-obj lab-obj-futures" data-kind={seed} data-mode="futures">
        <p className="lab-obj-kicker">Futures · pick a path</p>
        <div className="lab-obj-polaroids">
          {futures.map((f, i) => (
            <button
              key={f.id}
              type="button"
              className="lab-obj-polaroid"
              style={{ ["--tilt" as string]: `${(i - 1) * 3.5}deg` }}
              data-on={selectedFuture === f.id ? "true" : undefined}
              data-rec={recommended === f.id ? "true" : undefined}
              onMouseEnter={() => onSelectFuture(f.id)}
              onFocus={() => onSelectFuture(f.id)}
              onClick={() => onSelectFuture(f.id)}
            >
              <span className="lab-obj-polaroid-title">{f.title}</span>
              <span className="lab-obj-polaroid-euro">{f.euro}</span>
              <span className="lab-obj-polaroid-note">{f.note}</span>
              {recommended === f.id ? (
                <em className="lab-obj-polaroid-rec">REC</em>
              ) : null}
            </button>
          ))}
        </div>
        <div className="lab-obj-approve-zone">
          {!confirm ? (
            <button
              type="button"
              className="lab-obj-approve"
              onClick={() => setConfirm(true)}
            >
              Approve {futures.find((f) => f.id === selectedFuture)?.title}
            </button>
          ) : (
            <div className="lab-obj-confirm" role="alertdialog" aria-label="Confirm">
              <p>
                Stages work — does not write systems of record.{" "}
                <strong>€{contribution} stays Expected</strong>.
              </p>
              <div className="lab-obj-confirm-row">
                <button
                  type="button"
                  className="lab-obj-approve"
                  ref={confirmBtnRef}
                  onClick={onApprove}
                >
                  Confirm prepare
                </button>
                <button type="button" className="lab-obj-ghost" onClick={() => setConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <button type="button" className="lab-obj-ghost" onClick={onLive}>
          ← Live
        </button>
      </aside>
    );
  }

  if (mode === "why") {
    return (
      <aside className="lab-obj" data-kind={seed} data-mode="why">
        <p className="lab-obj-kicker">Why</p>
        {whySlot}
        <button type="button" className="lab-obj-ghost" onClick={onLive}>
          ← Live
        </button>
      </aside>
    );
  }

  /* —— Live objects —— */
  if (isFinanceSeed(seed)) {
    const grade = trace.sealed && trace.grade === "Verified" ? "verified" : "expected";
    const isTwoSite = seed === "margin-response";
    return (
      <aside className="lab-obj lab-obj-dossier" data-kind="recover" data-mode={mode}>
        <div className="lab-obj-dossier-stack" aria-hidden="true">
          <div className="lab-obj-paper lab-obj-paper-back" />
          <div className="lab-obj-paper lab-obj-paper-invoice">
            <span>{isTwoSite ? "INV-88421 · INV-88502" : "INV-88421"}</span>
            <span>Bluefin Berlin</span>
            <span>{isTwoSite ? "€7.45 vs €6.80/L" : "€7.45/L · 420 L"}</span>
          </div>
        </div>
        <div className="lab-obj-ticket" aria-hidden="true">
          <strong>{trace.sealed ? "SEALED" : "EXPECTED"}</strong>
          <em>{trace.sealed ? "Trace → stop" : `Decide by ${deadlineLabel}`}</em>
        </div>

        <div className="lab-obj-dossier-face">
          <div className="lab-obj-top">
            <p className="lab-obj-attn">{trace.sealed ? "Verified" : "Margin Response"}</p>
            <p className="lab-obj-id">{displayId}</p>
          </div>
          <h1 className="lab-obj-title">{label}</h1>
          <p className="lab-obj-sub">{sub}</p>

          <button
            type="button"
            className="lab-obj-euro"
            data-grade={grade}
            onClick={() => setLineageOpen((v) => !v)}
            aria-expanded={lineageOpen}
          >
            <strong>€{contribution}</strong>
            <span>{trace.sealed ? "Verified" : "Expected"}</span>
            <em>{moneyMeta}</em>
          </button>
          <p className="lab-obj-because">because {trace.because}</p>

          {lineageOpen || trace.sealed || isTwoSite ? (
            <LineageBlock t={trace} onOpenTrace={onOpenTrace} />
          ) : null}

          <div className="lab-obj-deadline" data-pulse="cool">
            <span>{trace.sealed ? "Sales path" : "Finance clock"}</span>
            <strong>{deadlineLabel}</strong>
            <em>{clockLabel}</em>
          </div>

          <div className="lab-obj-actions">
            <button type="button" onClick={onWhy}>Why</button>
            <button type="button" onClick={onFutures}>Futures</button>
            <button type="button" onClick={onOpenTrace}>Trace</button>
          </div>

          <div className="lab-obj-approve-zone">
            {trace.sealed ? (
              <button type="button" className="lab-obj-approve" onClick={onOpenTrace}>
                Open Value Trace
              </button>
            ) : !confirm ? (
              <button type="button" className="lab-obj-approve" onClick={() => setConfirm(true)}>
                {isTwoSite ? "Prepare dispute" : "Approve dispute"}
              </button>
            ) : (
              <div className="lab-obj-confirm" role="alertdialog" aria-label="Confirm">
                <p>
                  Prepare AP dispute · hold PO.{" "}
                  <strong>€{contribution} remains Expected</strong> until the
                  credit is applied.
                </p>
                <div className="lab-obj-confirm-row">
                  <button
                    type="button"
                    className="lab-obj-approve"
                    ref={confirmBtnRef}
                    onClick={onApprove}
                  >
                    Confirm prepare
                  </button>
                  <button type="button" className="lab-obj-ghost" onClick={() => setConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {mode === "context" ? contextSlot : null}
        </div>
      </aside>
    );
  }

  /* Service host-stand ticket */
  return (
    <aside className="lab-obj lab-obj-ticket-board" data-kind="service" data-mode={mode}>
      <div className="lab-obj-clip" aria-hidden="true" />
      <div className="lab-obj-top">
        <p className="lab-obj-attn">Needs you</p>
        <p className="lab-obj-id">{displayId}</p>
      </div>
      <h1 className="lab-obj-title">{label}</h1>
      <p className="lab-obj-sub">{sub}</p>

      <button
        type="button"
        className="lab-obj-euro"
        data-grade="expected"
        onClick={() => setLineageOpen((v) => !v)}
        aria-expanded={lineageOpen}
      >
        <strong>€{contribution}</strong>
        <span>Expected</span>
        <em>{moneyMeta}</em>
      </button>

      {lineageOpen ? <LineageBlock t={trace} onOpenTrace={onOpenTrace} /> : null}

      <div className="lab-obj-deadline" data-pulse="warm">
        <span>Decide by</span>
        <strong>{deadlineLabel}</strong>
        <em>{clockLabel}</em>
      </div>

      <ul className="lab-obj-tears">
        <li>
          <button type="button" onClick={onWhy}>Why</button>
        </li>
        <li>
          <button type="button" onClick={onFutures}>Futures</button>
        </li>
        <li>
          <button type="button" onClick={onContext}>Add context</button>
        </li>
      </ul>

      <div className="lab-obj-approve-zone">
        {!confirm ? (
          <button type="button" className="lab-obj-approve" onClick={() => setConfirm(true)}>
            Approve wait
          </button>
        ) : (
          <div className="lab-obj-confirm" role="alertdialog" aria-label="Confirm">
            <p>
              Prepare hold · throttle · feature.{" "}
              <strong>€{contribution} remains Expected</strong> until verified after service.
            </p>
            <div className="lab-obj-confirm-row">
              <button
                type="button"
                className="lab-obj-approve"
                ref={confirmBtnRef}
                onClick={onApprove}
              >
                Confirm prepare
              </button>
              <button type="button" className="lab-obj-ghost" onClick={() => setConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {mode === "context" ? contextSlot : null}
      {operatorVip ? <p className="lab-obj-vip">Context · VIP by 18:50</p> : null}
    </aside>
  );
}
