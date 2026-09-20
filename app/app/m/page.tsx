"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import {
  scopedDecisions,
  splitNeedsYou,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { berlinPreShiftBrief } from "@/lib/radr/product/shiftIntelligence";
import { PEAK_SERVICE_CLOCK } from "@/lib/radr/decision/demos/peakClock";

/**
 * Mobile RADR — Decisions needing you.
 * Not a workforce / scheduling app.
 */
export default function MobileRadrPage() {
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const scoped = scopedDecisions(Object.values(snap.records), roleView);
  const { urgent, review } = splitNeedsYou(scoped);
  const needs = [...urgent, ...review];
  const primary = urgent[0] ?? needs[0];
  const metric = primary ? formatPrimaryMetric(primary) : null;
  const brief = berlinPreShiftBrief();
  const verified = scoped.filter((r) => recordAttention(r) === "verified");

  return (
    <div className="rp-mdec">
      <header className="rp-mdec-head">
        <p className="rp-mdec-kicker">RADR · Mobile Decision</p>
        <h1 className="rp-mdec-title">Decisions needing you</h1>
        <p className="rp-mdec-meta">
          {ctx.shortLabel} · {PEAK_SERVICE_CLOCK.nowLabel} · DEMO
        </p>
      </header>

      {primary ? (
        <article className="rp-mdec-peak" data-peak={primary.id === DECISION_IDS.peak ? "true" : undefined}>
          <p className="rp-mdec-id">{displayDecisionId(primary.id)}</p>
          <h2 className="rp-mdec-rec">{primary.recommendationHeadline}</h2>
          {metric ? (
            <p className="rp-mdec-econ">
              <strong>{metric.money}</strong>
              <span>{metric.caption}</span>
            </p>
          ) : null}
          <p className="rp-mdec-deadline">
            {primary.decisionDeadline || primary.contextLine}
          </p>
          <div className="rp-mdec-actions">
            <Link href={`/app/decisions/${primary.id}`} className="rp-cc-cta">
              Why
            </Link>
            <Link
              href={`/app/decisions/${primary.id}#futures`}
              className="rp-drec-secondary"
            >
              Compare Futures
            </Link>
            <Link
              href={`/app/decisions/${primary.id}#context`}
              className="rp-drec-secondary"
            >
              Add context
            </Link>
            <Link href={`/app/decisions/${primary.id}`} className="rp-drec-secondary">
              Approve
            </Link>
          </div>
        </article>
      ) : (
        <p className="rp-cc-empty-copy">Nothing needs you right now.</p>
      )}

      <section className="rp-mdec-shift" aria-label="Pre-shift">
        <p className="rp-mdec-kicker">3 conditions matter tonight</p>
        <ul>
          {brief.conditions.slice(0, 3).map((c) => (
            <li key={c.id}>
              <strong>{c.title}</strong>
              <span>{c.detail}</span>
            </li>
          ))}
        </ul>
        <Link href="/app/shift/pre" className="rp-drec-secondary">
          Open pre-shift brief
        </Link>
      </section>

      <section className="rp-mdec-post" aria-label="Post-shift">
        <p className="rp-mdec-kicker">Post-shift</p>
        <p className="rp-mdec-prompt">Anything RADR could not see?</p>
        <Link href="/app/shift/post" className="rp-drec-secondary">
          Add context · see what RADR learned
        </Link>
        {verified[0] ? (
          <p className="rp-drec-quiet">
            Latest verified · {displayDecisionId(verified[0].id)} ·{" "}
            {formatDecisionMoney(verified[0].verifiedValue?.amount ?? 0)}
          </p>
        ) : null}
      </section>

      {needs.length > 1 ? (
        <section className="rp-mdec-list" aria-label="More">
          <p className="rp-mdec-kicker">Also waiting</p>
          <ul>
            {needs.slice(1, 4).map((r) => {
              const m = formatPrimaryMetric(r);
              return (
                <li key={r.id}>
                  <Link href={`/app/decisions/${r.id}`}>
                    <em>{displayDecisionId(r.id)}</em>
                    <strong>{r.recommendationHeadline}</strong>
                    {m ? <span>{m.money}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <p className="rp-mdec-note">
        Not a workforce app — schedule stays in your labor provider. RADR
        consumes coverage for Decisions.
      </p>
    </div>
  );
}
