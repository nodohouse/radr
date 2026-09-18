"use client";

/**
 * Value — CFO-grade: Pulse + Expected→Verified bridge + Trace + win/loss.
 */

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import type { RoleView } from "@/lib/product/types";
import { useLab, type ValueBand } from "./LabContext";
import { ShiftPulse } from "./ShiftPulse";
import {
  TRACE_PEAK_EXPECTED,
  TRACE_SUPPLIER_EXPECTED,
  TRACE_TWO_SITE_EXPECTED,
  TRACE_TUNA_VERIFIED,
  traceForDecision,
  type TraceLineage,
} from "./labLineage";
import { isFinanceSeed, type LabSeed } from "./labState";
import { ROLE_LENSES } from "./labRoleLens";

const FLOW: {
  id: ValueBand | "identified" | "expected" | "observed" | "attributed";
  label: string;
  because: string;
}[] = [
  {
    id: "identified",
    label: "Identified",
    because: "Material money themes spotted across systems",
  },
  {
    id: "expected",
    label: "Expected",
    because: "Modeled if Decision path holds — not cash",
  },
  {
    id: "observed",
    label: "Observed",
    because: "Service/period closed · numbers landed",
  },
  {
    id: "attributed",
    label: "Attributed",
    because: "Linked to Decision + prepared action",
  },
  {
    id: "verified",
    label: "Verified",
    because: "Ledger-matched Trace · book fields sealed",
  },
];

function roleView(role: string): RoleView {
  if (role === "cfo") return "cfo";
  if (role === "clevel") return "coo";
  return "gm";
}

function TraceTheater({ t }: { t: TraceLineage }) {
  if (!t.hasTrace && t.grade === "Verified") {
    return (
      <article className="lab-trace-card" data-blocked>
        <p>No Trace — Verified withheld</p>
      </article>
    );
  }
  const isRecover = t.displayId === "D-4102";
  const isVerified = t.grade === "Verified" && t.sealed;
  return (
    <article className="lab-trace-theater" data-grade={t.grade} data-sealed={t.sealed ? "true" : undefined}>
      {isVerified ? (
        <div className="lab-trace-seal" aria-hidden="true">
          <span>Verified</span>
        </div>
      ) : null}
      <header>
        <em>{t.displayId}</em>
        <strong>€{t.amountEuro.toLocaleString("en-IE")}</strong>
        <span data-grade={t.grade}>{t.grade}</span>
      </header>
      <p className="lab-trace-because">because {t.because}</p>

      {t.chain ? (
        <ol className="lab-trace-chain">
          {t.chain.map((c) => (
            <li key={c.id}>
              <em>{c.label}</em>
              <strong>{c.value}</strong>
              <span>because {c.because}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="lab-trace-artifacts" aria-label="Source artifacts">
          {isRecover ? (
            <>
              <div className="lab-trace-art lab-trace-art-invoice">
                <p>INV-88421</p>
                <p>Scan · Bluefin</p>
                <p>€7.45/L × 420</p>
              </div>
              <div className="lab-trace-art lab-trace-art-contract">
                <p>CTR-OIL-2026</p>
                <p className="lab-trace-highlight">€6.80/L</p>
                <p>Clause · unit price</p>
              </div>
              <div className="lab-trace-art lab-trace-art-cm">
                <p>CM-44102</p>
                <p>Applied</p>
              </div>
            </>
          ) : isVerified ? (
            <>
              <div className="lab-trace-art lab-trace-art-pos">
                <p>POS close</p>
                <p>SVC-0912-BM</p>
              </div>
              <div className="lab-trace-art lab-trace-art-stock">
                <p>INV-ADJ-441</p>
                <p>Stock closed</p>
              </div>
            </>
          ) : (
            <>
              <div className="lab-trace-art lab-trace-art-pos">
                <p>Modeled Δ</p>
                <p>Wait-12 vs seat-now</p>
              </div>
              <div className="lab-trace-art lab-trace-art-sample">
                <p>12 services</p>
                <p>Friday peak sample</p>
              </div>
            </>
          )}
        </div>
      )}

      <dl>
        <div>
          <dt>Source system</dt>
          <dd>{t.sourceSystem}</dd>
        </div>
        <div>
          <dt>Window</dt>
          <dd>{t.window}</dd>
        </div>
        {t.sealedAt ? (
          <div>
            <dt>sealed_at</dt>
            <dd>{t.sealedAt}</dd>
          </div>
        ) : null}
      </dl>
      <div className="lab-trace-check">
        <p>Match to books</p>
        <ul>
          {t.matchChecklist.map((c) => (
            <li key={c.label} data-done={c.done ? "true" : undefined}>
              {c.done ? "✓" : "○"} {c.label}
            </li>
          ))}
        </ul>
      </div>
      <p className="lab-trace-note">{t.note}</p>
    </article>
  );
}

export function LabValueCanvas() {
  const { nav, state, setValueBand, goDecision, setSeed } = useLab();
  const lens = ROLE_LENSES[nav.role];
  const [openId, setOpenId] = useState<string | null>(null);
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const agg = useMemo(
    () => deriveValueAggregate(roleView(nav.role)),
    [snap, nav.role],
  );

  const band = nav.valueBand;

  const bands = (
    [
      ["verified", "Verified"],
      ["active", "Active"],
      ["pending", "Pending"],
      ["trace", "Trace"],
    ] as [ValueBand, string][]
  );

  return (
    <div className="lab-viewport lab-viewport-value lab-value-light lab-surface-light">
      <div className="lab-value lab-value-v50">
        <header className="lab-surf-head">
          <div>
            <p className="lab-surf-k">Value</p>
            <h1 className="lab-surf-title">Tonight / 24h · money truth</h1>
            <p className="lab-surf-sub">
              {lens.subtitle} · Expected stays Expected until Trace seals
            </p>
          </div>
        </header>

        <ShiftPulse mode={nav.role === "cfo" ? "pnl" : "ops"} />

        <div className="lab-winloss lab-winloss-value">
          {state.seed === "margin-response" ? (
            <article className="lab-winloss-card" data-kind="loss">
              <em>Where we leak</em>
              <strong>€410 Expected</strong>
              <p>
                because two-site unit price gap · Expected until credit applies
              </p>
            </article>
          ) : state.seed === "recover" ? (
            <article className="lab-winloss-card" data-kind="win">
              <em>Where we recovered</em>
              <strong>€273 Verified</strong>
              <p>
                because credit memo applied · matched to original invoice
              </p>
            </article>
          ) : (
            <>
              <article className="lab-winloss-card" data-kind="win">
                <em>Where we protected</em>
                <strong>
                  {formatDecisionMoney(agg.verifiedTotal)} Verified
                </strong>
                <p>because Verified records in current scope</p>
              </article>
              <article className="lab-winloss-card" data-kind="loss">
                <em>Where we leak</em>
                <strong>€410 Expected</strong>
                <p>
                  because cross-location price dispersion — open Recover
                </p>
                <button type="button" onClick={() => setSeed("margin-response")}>
                  Open Margin Recovery
                </button>
              </article>
            </>
          )}
        </div>

        <div className="lab-value-flow" aria-label="Value flow">
          {FLOW.map((step, i) => (
            <button
              key={step.id}
              type="button"
              className="lab-value-flow-step"
              title={step.because}
              data-on={
                step.id === "verified" && band === "verified"
                  ? "true"
                  : step.id === band
                    ? "true"
                    : undefined
              }
              onClick={() => {
                if (step.id === "verified") setValueBand("verified");
                else if (step.id === "expected" || step.id === "identified")
                  setValueBand("active");
                else if (step.id === "observed" || step.id === "attributed")
                  setValueBand("pending");
              }}
            >
              <em>{step.label}</em>
              <span className="lab-value-flow-because">{step.because}</span>
              {i < FLOW.length - 1 ? (
                <span className="lab-value-flow-arrow" aria-hidden="true">
                  →
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="lab-value-bands" role="tablist">
          {bands.map(([b, label]) => (
            <button
              key={b}
              type="button"
              role="tab"
              aria-selected={band === b}
              data-on={band === b ? "true" : undefined}
              onClick={() => setValueBand(b)}
            >
              {label}
            </button>
          ))}
        </div>

        {band === "trace" ? (
          <>
            <div className="lab-trace-grid">
              {state.seed === "margin-response" ? (
                <TraceTheater t={TRACE_TWO_SITE_EXPECTED} />
              ) : state.seed === "recover" ? (
                <TraceTheater t={TRACE_SUPPLIER_EXPECTED} />
              ) : (
                <>
                  <TraceTheater t={TRACE_TUNA_VERIFIED} />
                  <TraceTheater t={TRACE_SUPPLIER_EXPECTED} />
                  <TraceTheater t={TRACE_PEAK_EXPECTED} />
                </>
              )}
            </div>
            <p className="lab-value-law">
              {isFinanceSeed(state.seed)
                ? "Sales demo = one card → Trace → stop."
                : "No Trace = no Verified on that line."}
            </p>
          </>
        ) : (
          <ValueStream
            band={band}
            agg={agg}
            snap={snap}
            openId={openId}
            setOpenId={setOpenId}
            goDecision={goDecision}
            setSeed={setSeed}
          />
        )}
      </div>
    </div>
  );
}

function ValueStream({
  band,
  agg,
  snap,
  openId,
  setOpenId,
  goDecision,
  setSeed,
}: {
  band: ValueBand;
  agg: ReturnType<typeof deriveValueAggregate>;
  snap: ReturnType<typeof getDecisionStoreSnapshot>;
  openId: string | null;
  setOpenId: (id: string | null) => void;
  goDecision: (id?: string, mode?: "live" | "why") => void;
  setSeed: (s: LabSeed) => void;
}) {
  const primary =
    band === "active"
      ? {
          money: formatDecisionMoney(agg.activeExposureOrOpportunity),
          label: "Active exposure",
          grade: "Expected" as const,
          because: "Open Decisions still deciding — not Verified",
          ids: [
            ...agg.decisionIdsActiveExposure,
            ...agg.decisionIdsActiveOpportunity,
          ],
        }
      : band === "pending"
        ? {
            money: formatDecisionMoney(agg.pendingVerification),
            label: "Pending verification",
            grade: "Expected" as const,
            because: "Observed · waiting attribution / ledger match",
            ids: agg.decisionIdsPending,
          }
        : {
            money: formatDecisionMoney(agg.verifiedTotal),
            label: "Verified Value",
            grade: "Verified" as const,
            because: "Trace sealed · book-matchable",
            ids: agg.decisionIdsVerified,
          };

  return (
    <>
      <p className="lab-value-primary">
        <strong>{primary.money}</strong>
        <span>{primary.label}</span>
        <em className="lab-value-grade" data-grade={primary.grade}>
          {primary.grade}
        </em>
      </p>
      <p className="lab-value-primary-because">because {primary.because}</p>

      {primary.ids.length === 0 ? (
        <p className="lab-board-empty">
          No lines in this band yet. Open Active or Trace for Expected paths.
        </p>
      ) : (
        <ul className="lab-value-stream lab-value-stream-v50">
          {primary.ids.slice(0, 8).map((id) => {
            const r = snap.records[id];
            if (!r) return null;
            const m = formatPrimaryMetric(r);
            const verified = r.verifiedValue;
            const isOpen = openId === id;
            const amount =
              band === "verified" && verified
                ? formatDecisionMoney(verified.amount)
                : (m?.money ?? "");
            const lineage = traceForDecision(id);
            const showVerifiedMoney = band === "verified" && verified;
            return (
              <li key={id} data-open={isOpen ? "true" : undefined}>
                <button
                  type="button"
                  className="lab-value-row"
                  onClick={() => setOpenId(isOpen ? null : id)}
                >
                  <em>{displayDecisionId(id)}</em>
                  <strong>
                    {(r.recommendationHeadline ?? r.title)
                      .split("—")[0]
                      ?.trim() ?? r.title}
                  </strong>
                  <span>{showVerifiedMoney ? amount : amount || "—"}</span>
                  <p className="lab-value-row-because">
                    because{" "}
                    {verified?.note ||
                      r.contextLine ||
                      "Open for Trace / Why"}
                  </p>
                </button>
                {isOpen ? (
                  <div className="lab-value-lineage">
                    {lineage ? (
                      <TraceTheater t={lineage} />
                    ) : verified ? (
                      <TraceTheater
                        t={{
                          decisionId: id,
                          displayId: displayDecisionId(id),
                          amountEuro: verified.amount,
                          grade: "Verified",
                          hasTrace: true,
                          sealed: true,
                          sourceSystem: "POS · Ledger",
                          documentRefs: [
                            {
                              label: "Note",
                              value: verified.note || "Ledger-matched",
                            },
                            { label: "Kind", value: verified.kind },
                          ],
                          window: "Verified",
                          matchChecklist: [
                            { label: "Match to books", done: true },
                          ],
                          note: verified.note || "Ledger-matched",
                          because:
                            verified.note ||
                            "Ledger-matched · Trace sealed",
                        }}
                      />
                    ) : (
                      <p>
                        Grade Expected — open Trace for book fields. Not
                        Verified Value.
                      </p>
                    )}
                    <button
                      type="button"
                      className="lab-value-open-dec"
                      onClick={() => {
                        if (id === DECISION_IDS.supplier) {
                          setSeed("recover");
                          return;
                        }
                        if (id === DECISION_IDS.peak) {
                          setSeed("service");
                          return;
                        }
                        goDecision(id, "why");
                      }}
                    >
                      Why + Futures · {displayDecisionId(id)}
                    </button>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
