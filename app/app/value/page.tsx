"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney, type ValueKind } from "@/lib/radr/decision/core";
import { useProduct } from "@/lib/product/store";
import { scopedDecisions, recordAttention } from "@/lib/radr/product/roleScope";
import { roleContextFor } from "@/lib/radr/product/personas";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { valueCoverage } from "@/lib/radr/product/intelligenceServices";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { IntelligenceCanvas } from "@/components/product/canvas/IntelligenceCanvas";

const KINDS: Exclude<ValueKind, "exposed">[] = [
  "protected",
  "recovered",
  "created",
  "avoided",
];

const TRACE_STEPS = [
  "Baseline",
  "Decision",
  "Response",
  "Observed",
  "Counterfactual",
  "Attribution",
  "Verified",
] as const;

export default function ValuePage() {
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const coverage = valueCoverage(roleView);
  const aggregate = deriveValueAggregate(roleView);
  const [openId, setOpenId] = useState<string | null>(null);

  const verified = useMemo(
    () =>
      scopedDecisions(Object.values(snap.records), roleView).filter(
        (r) =>
          r.verifiedValue &&
          (recordAttention(r) === "verified" ||
            recordAttention(r) === "learned"),
      ),
    [snap, roleView],
  );

  const showExec =
    ctx.scopeType === "PORTFOLIO" ||
    ctx.scopeType === "GROUP" ||
    roleView === "cfo" ||
    roleView === "coo";

  return (
    <div className="rp-value rp-value-elevated rp-value-canvas">
      <header className="rp-value-hero">
        <p className="rp-cc-kicker">Value</p>
        <p className="rp-value-hero-amount">
          {formatDecisionMoney(aggregate.verifiedTotal)}
        </p>
        <h1 className="rp-value-hero-label">Verified Value</h1>
        <p className="rp-cc-since">
          Decision-linked economics · {ctx.shortLabel} · DEMO · ILLUSTRATIVE
        </p>
        <ol className="rp-value-flow" aria-label="Value flow">
          <li>Identified</li>
          <li>Expected</li>
          <li>Observed</li>
          <li>Attributed</li>
          <li>Verified</li>
        </ol>
      </header>

      {showExec ? (
        <section className="rp-value-exec" aria-label="Period coverage">
          <p className="rp-cc-section-label">RADR this period · DEMO</p>
          <dl className="rp-value-exec-grid">
            <div>
              <strong>{coverage.evaluated}</strong>
              <span>Decisions covered</span>
            </div>
            <div>
              <strong>{coverage.needsJudgment}</strong>
              <span>Required operator judgment</span>
            </div>
            <div>
              <strong>{coverage.handling}</strong>
              <span>Handling / monitored</span>
            </div>
            <div>
              <strong>{coverage.verifiedCount}</strong>
              <span>With verified outcome</span>
            </div>
            <div>
              <strong>{coverage.playbooks}</strong>
              <span>Playbooks updated</span>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="rp-value-split" aria-label="Value layers">
        <div>
          <p className="rp-cc-section-label">Verified by kind</p>
          <ul className="rp-value-kinds">
            {KINDS.map((kind) => (
              <li key={kind}>
                <strong>
                  {formatDecisionMoney(aggregate.verifiedByKind[kind] ?? 0)}
                </strong>
                <span>{kind}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="rp-cc-section-label">Separate · not Verified Value</p>
          <ul className="rp-value-kinds rp-value-kinds-muted">
            <li>
              <strong>
                {formatDecisionMoney(aggregate.activeExposure)}
              </strong>
              <span>Active exposure</span>
            </li>
            {aggregate.activeOpportunity > 0 ? (
              <li>
                <strong>
                  {formatDecisionMoney(aggregate.activeOpportunity)}
                </strong>
                <span>Active opportunity</span>
              </li>
            ) : null}
            <li>
              <strong>
                {formatDecisionMoney(aggregate.pendingVerification)}
              </strong>
              <span>Pending verification</span>
            </li>
          </ul>
        </div>
      </section>

      <IntelligenceCanvas
        kicker="Value trace"
        title="Every euro opens its Decision path"
        className="rp-value-trace-canvas"
      >
        {verified.length === 0 ? (
          <p className="rp-cc-empty-copy">No verified value in scope yet.</p>
        ) : (
          <ul className="rp-value-traces">
            {verified.map((r) => {
              const open = openId === r.id;
              const amount = r.verifiedValue?.amount ?? 0;
              return (
                <li key={r.id} data-open={open ? "true" : undefined}>
                  <button
                    type="button"
                    className="rp-value-trace-head"
                    onClick={() => setOpenId(open ? null : r.id)}
                    aria-expanded={open}
                  >
                    <span className="rp-cc-id">{displayDecisionId(r.id)}</span>
                    <strong>{formatDecisionMoney(amount)}</strong>
                    <span>{r.title}</span>
                    <em>{formatPrimaryMetric(r)?.caption ?? "verified"}</em>
                  </button>
                  {open ? (
                    <div className="rp-value-trace-body">
                      <ol className="rp-value-trace-steps" aria-label="Trace">
                        {TRACE_STEPS.map((step, i) => (
                          <li
                            key={step}
                            data-done={i < TRACE_STEPS.length - 1 ? "true" : "verified"}
                          >
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="rp-drec-quiet">
                        {r.verifiedValue?.note ??
                          "Observed vs counterfactual attributed to this Decision · DEMO"}
                      </p>
                      <Link
                        href={`/app/decisions/${r.id}`}
                        className="rp-cc-cta"
                      >
                        Open Decision path
                      </Link>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </IntelligenceCanvas>
    </div>
  );
}
