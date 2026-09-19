"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
  getWatchingSignals,
  approveDecision,
} from "@/lib/radr/decision/store";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { lifecycleLabel } from "@/lib/radr/decision/lifecycle";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import {
  scopedDecisions,
  splitNeedsYou,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { LiveOperatingCanvas } from "@/components/product/canvas/LiveOperatingCanvas";
import { RoleViewSwitcher } from "@/components/product/RoleViewSwitcher";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  DecisionDiscoveryService,
} from "@/lib/radr/product/intelligenceServices";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { EVIDENCE_CONFLICTS } from "@/lib/radr/product/shiftIntelligence";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

function useStoreTick() {
  return useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
}

function useEntryReveal(needsCount: number, handlingCount: number) {
  const reduced = useReducedMotionSafe();
  const [phase, setPhase] = useState<"idle" | "changed" | "handled" | "needs" | "done">(
    "idle",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "radr_cc_reveal_v1";
    if (sessionStorage.getItem(key) || reduced) {
      setPhase("done");
      return;
    }
    sessionStorage.setItem(key, "1");
    setPhase("changed");
    const t1 = window.setTimeout(() => setPhase("handled"), 700);
    const t2 = window.setTimeout(() => setPhase("needs"), 1400);
    const t3 = window.setTimeout(() => setPhase("done"), 2100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [reduced]);

  if (phase === "idle" || phase === "done") return null;
  const changed = needsCount + handlingCount;
  if (phase === "changed") {
    return (
      <p className="rp-cc-entry-reveal" aria-live="polite">
        {changed} things changed
      </p>
    );
  }
  if (phase === "handled") {
    return (
      <p className="rp-cc-entry-reveal" aria-live="polite">
        {handlingCount} handled
      </p>
    );
  }
  return (
    <p className="rp-cc-entry-reveal" data-needs="true" aria-live="polite">
      {needsCount} needs you
    </p>
  );
}

export function ControlCenter() {
  const snap = useStoreTick();
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const scoped = scopedDecisions(Object.values(snap.records), roleView);
  const { urgent, review } = splitNeedsYou(scoped);
  const needsAll = [...urgent, ...review];
  const handling = scoped.filter((r) => recordAttention(r) === "handling");
  const verified = scoped.filter((r) => recordAttention(r) === "verified");
  const watching =
    ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id)
      ? getWatchingSignals().filter((w) =>
          ctx.allowedLocationIds.includes(
            w.locationId as (typeof ctx.allowedLocationIds)[number],
          ),
        )
      : [];

  const needsCount = needsAll.length;
  const handlingCount = handling.length;
  const primary = urgent[0];
  const economics = deriveValueAggregate(roleView);
  const relationships = DecisionDiscoveryService.relationships(roleView).slice(
    0,
    1,
  );
  const entry = useEntryReveal(needsCount, handlingCount);
  const peakPrimary = primary?.id === DECISION_IDS.peak;

  return (
    <div className="rp-cc rp-cc-attention rp-cc-elevated rp-cc-cinema rp-cc-model">
      {primary ? (
        <LiveOperatingCanvas
          primary={primary}
          onApprove={() => {
            approveDecision(primary.id, primary.recommendedOptionId);
          }}
        />
      ) : null}

      {entry}

      <header className="rp-cc-head">
        <div className="rp-cc-head-row">
          <div>
            <p className="rp-cc-kicker">Control Center</p>
            <h1 className="rp-cc-title">Good evening, {ctx.firstName}</h1>
            <p className="rp-cc-since">
              Since your last check · {ctx.label}
              {" · "}
              {needsCount === 0
                ? "nothing needs you"
                : `${urgent.length} urgent${review.length ? ` · ${review.length} needs review` : ""}`}
              {handlingCount > 0 ? ` · ${handlingCount} handling` : null}
            </p>
            {economics.activeExposure > 0 || economics.activeOpportunity > 0 ? (
              <p className="rp-cc-active-econ">
                <strong>
                  {formatDecisionMoney(
                    economics.activeExposureOrOpportunity,
                  )}
                </strong>
                <span>
                  active exposure
                  {economics.activeOpportunity > 0
                    ? " / opportunity"
                    : ""}{" "}
                  in Decisions that need you · not pending · not Verified · DEMO
                </span>
              </p>
            ) : null}
          </div>
          <RoleViewSwitcher />
        </div>
      </header>

      <div className="rp-cc-stage">
        <div className="rp-cc-stage-main">
          {(() => {
            const restUrgent = urgent.filter(
              (u) => !(peakPrimary && u.id === primary?.id),
            );
            if (restUrgent.length === 0 && peakPrimary) return null;
            if (urgent.length === 0 && !primary) {
              return (
                <section className="rp-cc-empty" aria-label="Healthy">
                  <p className="rp-cc-section-label">Needs you</p>
                  <p className="rp-cc-empty-copy">
                    Everything is operating within expectations.
                  </p>
                </section>
              );
            }
            if (restUrgent.length === 0) return null;
            return (
            <section
              className="rp-cc-primary"
              aria-label="Urgent"
              data-collapsed={peakPrimary ? "true" : undefined}
            >
              <p className="rp-cc-section-label">
                {peakPrimary ? "Also urgent" : "Urgent"}
              </p>
              {restUrgent.map((u) => {
                const metric = formatPrimaryMetric(u);
                return (
                  <article
                    key={u.id}
                    className="rp-cc-card rp-cc-card-primary"
                  >
                    <div className="rp-cc-card-meta">
                      <span className="rp-cc-id">
                        {displayDecisionId(u.id)}
                      </span>
                      <span className="rp-cc-terr">
                        {(u.territories ?? []).join(" · ")}
                      </span>
                      <span className="rp-cc-loc">{u.property}</span>
                      <span className="rp-cc-demo">DEMO</span>
                    </div>
                    <h2 className="rp-cc-card-title">{u.title}</h2>
                    <p className="rp-cc-card-rec">
                      {u.recommendationHeadline}
                    </p>
                    <p className="rp-cc-card-deadline">
                      {u.decisionDeadline || u.contextLine}
                    </p>
                    {metric ? (
                      <div className="rp-cc-card-econ">
                        <strong>{metric.money}</strong>
                        <span>{metric.caption}</span>
                      </div>
                    ) : null}
                    <div className="rp-cc-card-actions">
                      <Link
                        href={`/app/decisions/${u.id}`}
                        className="rp-cc-cta"
                      >
                        Open Decision Record
                      </Link>
                      <span className="rp-cc-life">
                        {lifecycleLabel(u.status)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
            );
          })()}

          {review.length > 0 ? (
            <section className="rp-cc-band" aria-label="Needs review">
              <p className="rp-cc-section-label">Needs review</p>
              {review.map((r) => {
                const metric = formatPrimaryMetric(r);
                return (
                  <Link
                    key={r.id}
                    href={`/app/decisions/${r.id}`}
                    className="rp-cc-row"
                  >
                    <span className="rp-cc-id">
                      {displayDecisionId(r.id)}
                    </span>
                    <span className="rp-cc-row-title">{r.title}</span>
                    <span className="rp-cc-row-meta">
                      {r.decisionDeadline || r.decisionHorizon}
                      {metric ? ` · ${metric.money}` : ""}
                    </span>
                  </Link>
                );
              })}
            </section>
          ) : null}
        </div>

        <aside className="rp-cc-stage-aside">
          <p className="rp-cc-section-label">Operating lens</p>
          {primary?.id === DECISION_IDS.peak ? (
            <p className="rp-cc-aside-copy">
              Empty tables are not free capacity when kitchen load and inbound
              covers collide. Arrival compression 19:10–19:35.
            </p>
          ) : (
            <p className="rp-cc-aside-copy">
              Attention first. Systems stay systems of record.
            </p>
          )}
          <Link href="/app/shift/pre" className="rp-drec-secondary">
            Pre-shift · what will break?
          </Link>
          <Link href="/app/service" className="rp-drec-secondary">
            Open Service Map
          </Link>
          <Link href="/app/ask" className="rp-drec-secondary">
            What am I missing?
          </Link>
          <Link href="/app/shift/post" className="rp-drec-secondary">
            Post-shift
          </Link>
        </aside>
      </div>

      {handling[0] ? (
        <section className="rp-cc-band" aria-label="Handling">
          <p className="rp-cc-section-label">RADR is handling</p>
          {handling.map((h) => {
            const metric = formatPrimaryMetric(h);
            return (
              <Link
                key={h.id}
                href={`/app/decisions/${h.id}`}
                className="rp-cc-row"
              >
                <span className="rp-cc-id">{displayDecisionId(h.id)}</span>
                <span className="rp-cc-row-title">{h.title}</span>
                <span className="rp-cc-row-meta">
                  Prepared
                  {metric ? ` · ${metric.money} · DEMO` : " · DEMO"}
                </span>
              </Link>
            );
          })}
        </section>
      ) : null}

      {watching[0] ? (
        <section className="rp-cc-band rp-cc-watch" aria-label="Watching">
          <p className="rp-cc-section-label">Watching</p>
          <div className="rp-cc-row rp-cc-row-quiet">
            <span className="rp-cc-row-title">{watching[0].title}</span>
            <span className="rp-cc-row-meta">
              {watching[0].metricValue} · {watching[0].reason}
            </span>
          </div>
        </section>
      ) : null}

      {relationships[0] ? (
        <section
          className="rp-cc-found rp-cc-secondary-context"
          aria-label="Important context"
        >
          <p className="rp-cc-section-label">Important context</p>
          <div className="rp-reveal">
            <p className="rp-ask-thought">You may be looking at labor.</p>
            <p className="rp-cc-found-line">{relationships[0].line}</p>
          </div>
          <Link
            href={`/app/decisions/${relationships[0].decisionId}`}
            className="rp-drec-secondary"
          >
            Review {displayDecisionId(relationships[0].decisionId)}
          </Link>
        </section>
      ) : null}

      {ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id) &&
      EVIDENCE_CONFLICTS[0] ? (
        <section
          className="rp-cc-band rp-cc-secondary-context"
          aria-label="Evidence conflict"
        >
          <p className="rp-cc-section-label">Source conflict · Finding</p>
          <p className="rp-cc-found-line">{EVIDENCE_CONFLICTS[0].title}</p>
          <p className="rp-drec-quiet">{EVIDENCE_CONFLICTS[0].inference}</p>
          <Link
            href={`/app/decisions/${EVIDENCE_CONFLICTS[0].affectsDecisionIds[0]}`}
            className="rp-drec-secondary"
          >
            Open {displayDecisionId(EVIDENCE_CONFLICTS[0].affectsDecisionIds[0]!)}
          </Link>
        </section>
      ) : null}

      {verified[0]?.verifiedValue ? (
        <section className="rp-cc-band" aria-label="Verified">
          <p className="rp-cc-section-label">Verified</p>
          <Link
            href={`/app/decisions/${verified[0].id}`}
            className="rp-cc-row"
          >
            <span className="rp-cc-id">
              {displayDecisionId(verified[0].id)}
            </span>
            <span className="rp-cc-row-title">{verified[0].title}</span>
            <span className="rp-cc-row-meta">
              {formatPrimaryMetric(verified[0])?.money}{" "}
              {formatPrimaryMetric(verified[0])?.caption}
            </span>
          </Link>
        </section>
      ) : null}
    </div>
  );
}
