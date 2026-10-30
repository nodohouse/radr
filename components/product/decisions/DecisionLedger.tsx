"use client";

/**
 * Decision Ledger 4.0 — Needs judgment · In motion · Resolved.
 * Watching is not a Decision state here.
 */

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import {
  attentionBandOf,
  customerLifecycleLabel,
  type DecisionLifecycleStatus,
} from "@/lib/radr/decision/lifecycle";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { useProduct } from "@/lib/product/store";
import {
  scopedDecisionsForDemo,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { primaryMetricOf } from "@/lib/radr/product/primaryMetric";
import { roleContextFor } from "@/lib/radr/product/personas";
import { customerDecisionClass } from "@/lib/radr/product/decisionClass";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import "./decision-ledger.css";

type Band = "needs_you" | "in_motion" | "resolved";

function bandOf(status: DecisionLifecycleStatus): Band | null {
  const a = attentionBandOf(status);
  if (a === "needs_you") return "needs_you";
  if (a === "handling") return "in_motion";
  /* Watching is not a Decision ledger state — route early detect into motion */
  if (a === "watching") return "in_motion";
  if (a === "verified" || a === "learned" || status === "CLOSED") return "resolved";
  return null;
}

function parseBand(raw: string | null): Band | "all" {
  if (raw === "needs_you" || raw === "needs-you") return "needs_you";
  if (raw === "in_motion" || raw === "actioning" || raw === "handling")
    return "in_motion";
  if (raw === "resolved" || raw === "verified" || raw === "closed")
    return "resolved";
  return "all";
}

export function DecisionLedger() {
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const { session } = useDemoOrg();
  const ctx = roleContextFor(roleView, session.vertical);
  const search = useSearchParams();
  const initial = parseBand(search.get("band") ?? search.get("state"));
  const [filter, setFilter] = useState<Band | "all">(initial);

  const scoped = useMemo(
    () =>
      scopedDecisionsForDemo(
        Object.values(snap.records),
        roleView,
        session.vertical,
      ),
    [roleView, snap, session.vertical],
  );

  const groups = useMemo(() => {
    const needs: DecisionRecord[] = [];
    const motion: DecisionRecord[] = [];
    const resolved: DecisionRecord[] = [];
    for (const r of scoped) {
      const b = bandOf(r.status);
      if (b === "needs_you") needs.push(r);
      else if (b === "in_motion") motion.push(r);
      else if (b === "resolved") resolved.push(r);
    }
    return { needs, motion, resolved };
  }, [scoped]);

  const showNeeds = filter === "all" || filter === "needs_you";
  const showMotion = filter === "all" || filter === "in_motion";
  const showResolved = filter === "all" || filter === "resolved";

  return (
    <div className="rp-ledger rp-ledger-v4 rp-dl">
      <header className="rp-ledger-head rp-dl-head">
        <p className="rp-cc-kicker">Decisions</p>
        <h1 className="rp-cc-title">Decision Ledger</h1>
        <p className="rp-cc-since">
          Judgment first · then motion · then proof · {ctx.shortLabel}
        </p>
      </header>

      <div className="rp-ledger-bands rp-dl-tabs" role="tablist" aria-label="Decision bands">
        {(
          [
            ["all", "All", scoped.length],
            ["needs_you", "Needs your judgment", groups.needs.length],
            ["in_motion", "In motion", groups.motion.length],
            ["resolved", "Resolved", groups.resolved.length],
          ] as const
        ).map(([id, label, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={filter === id}
            data-active={filter === id ? "true" : undefined}
            data-band={id}
            className="rp-ledger-band-tab rp-dl-tab"
            onClick={() => setFilter(id)}
          >
            {label}
            <em>{n}</em>
          </button>
        ))}
      </div>

      {showNeeds ? (
        <section className="rp-ledger-section rp-dl-sec" data-band="needs_you">
          <h2>
            Needs your judgment <em>{groups.needs.length}</em>
          </h2>
          {groups.needs.length === 0 ? (
            <p className="rp-dl-empty">Nothing needs you right now.</p>
          ) : (
            <ul className="rp-dl-list">
              {groups.needs.map((r) => (
                <CaseRow key={r.id} record={r} band="needs_you" cta="Compare Futures" />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showMotion ? (
        <section className="rp-ledger-section rp-dl-sec" data-band="in_motion">
          <h2>
            In motion <em>{groups.motion.length}</em>
          </h2>
          {groups.motion.length === 0 ? (
            <p className="rp-dl-empty">No Decisions actioning or verifying.</p>
          ) : (
            <ul className="rp-dl-list">
              {groups.motion.map((r) => (
                <CaseRow key={r.id} record={r} band="in_motion" cta="Open case" />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showResolved ? (
        <section className="rp-ledger-section rp-dl-sec" data-band="resolved">
          <h2>
            Resolved <em>{groups.resolved.length}</em>
          </h2>
          <p className="rp-dl-note">
            Closed Decisions that wrote playbooks live in{" "}
            <Link href="/app/memory">Operating Memory</Link>.
          </p>
          {groups.resolved.length === 0 ? (
            <p className="rp-dl-empty">No sealed Decisions in scope.</p>
          ) : (
            <ul className="rp-dl-list">
              {groups.resolved.map((r) => (
                <CaseRow key={r.id} record={r} band="resolved" cta="Review proof" />
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

/** Tiny trajectory marker — real value-decay curve when present, else confidence band. */
function SignalMarker({ record: r }: { record: DecisionRecord }) {
  const curve = r.valueDecayCurve;
  if (curve && curve.length >= 2) {
    const vals = curve.map((p) => p.valueEuro);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    const span = max - min || 1;
    const pts = vals
      .map((v, i) => {
        const x = (i / (vals.length - 1)) * 44;
        const y = 14 - ((v - min) / span) * 12;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return (
      <span
        className="rp-dl-mark"
        title="Value decay as the window closes"
        aria-label="Value decays as the window closes"
      >
        <svg viewBox="0 0 44 16" width="44" height="16" aria-hidden>
          <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }
  const level = r.confidence.decision;
  const n = level === "HIGH" ? 3 : level === "MEDIUM" ? 2 : 1;
  const word = level === "HIGH" ? "High" : level === "MEDIUM" ? "Medium" : "Low";
  return (
    <span
      className="rp-dl-mark rp-dl-conf"
      title={`${word} confidence`}
      aria-label={`${word} confidence`}
      data-level={n}
    >
      {[1, 2, 3].map((i) => (
        <i key={i} data-on={i <= n ? "true" : undefined} />
      ))}
    </span>
  );
}

function CaseRow({
  record: r,
  band,
  cta,
}: {
  record: DecisionRecord;
  band: Band;
  cta: string;
}) {
  const metric = primaryMetricOf(r);
  const domain = customerDecisionClass(r);
  const state =
    band === "needs_you"
      ? r.decisionDeadline || customerLifecycleLabel(r.status)
      : customerLifecycleLabel(r.status);
  const sub =
    band === "needs_you"
      ? (r.recommendationHeadline ?? r.contextLine)
      : null;
  return (
    <li className="rp-dl-li">
      <Link
        href={`/app/decisions/${r.id}`}
        className="rp-dl-row"
        data-band={band}
      >
        <span className="rp-dl-id rp-cc-id">{displayDecisionId(r.id)}</span>
        <span className="rp-dl-main">
          <strong className="rp-dl-title">{r.title}</strong>
          {sub ? <span className="rp-dl-sub">{sub}</span> : null}
        </span>
        <span className="rp-dl-domain">{domain}</span>
        <span className="rp-dl-loc">{r.property}</span>
        <span className="rp-dl-econ">
          <b>{metric ? formatDecisionMoney(metric.value) : "—"}</b>
          {metric ? <small>{metric.label}</small> : null}
        </span>
        <span className="rp-dl-state" data-attn={recordAttention(r)}>
          {state}
        </span>
        <SignalMarker record={r} />
        <span className="rp-dl-cta">
          {cta} <span aria-hidden>→</span>
        </span>
      </Link>
    </li>
  );
}
