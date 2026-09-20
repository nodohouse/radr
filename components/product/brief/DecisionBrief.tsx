"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DecisionCard } from "@/components/marketing/decision/DecisionCard";
import type { DecisionCardState } from "@/lib/radr/decision/core";
import {
  formatDecisionMoney,
  type DecisionVertical,
} from "@/lib/radr/decision/core";
import {
  cardStateFromLifecycle,
  attentionBandOf,
  type AttentionBand,
} from "@/lib/radr/decision/lifecycle";
import {
  DECISION_HORIZONS,
  type DecisionRecordHorizon,
  horizonLabel,
} from "@/lib/radr/decision/horizon";
import { projectDecisionForBrief } from "@/lib/radr/decision/project";
import {
  approveDecision,
  advanceDecision,
  verifyDecision,
  sinceLastCheck,
  structuralDebtForVertical,
  heroRecordId,
} from "@/lib/radr/decision/store";
import { economicPriorityScore } from "@/lib/radr/decision/economics";
import { useSyncedDecisionStore } from "@/lib/radr/decision/useDecisionStore";
import { useOperatingProfile } from "@/components/product/useOperatingProfile";
import { TABLE_RECOVERED } from "@/lib/radr/decision/catalog";
import type { DecisionRecord } from "@/lib/radr/decision/record";

function mapDemoVertical(v: string | undefined): DecisionVertical {
  if (v === "boutique_hotel" || v === "hotel") return "hotel";
  if (v === "serviced_apartments" || v === "apartment") return "apartment";
  return "restaurant";
}

function priorityOf(r: DecisionRecord): number {
  const hours =
    r.decisionHorizon === "NOW"
      ? 1
      : r.decisionHorizon === "TODAY"
        ? 0.85
        : r.decisionHorizon === "THIS_WEEK"
          ? 0.55
          : r.decisionHorizon === "STRUCTURAL"
            ? 0.4
            : 0.35;
  return economicPriorityScore({
    valueEuro: r.exposedContribution ?? r.expectedContributionImpact,
    urgency01: hours,
    probability01: r.confidence.point / 100,
    reversibility: r.autonomy.reversibility,
    confidence01: r.confidence.point / 100,
  });
}

/**
 * Control Center = Decision cockpit.
 * Store-backed Decision Records — not ephemeral card state alone.
 */
export function DecisionBrief() {
  const { vertical: demoVertical } = useOperatingProfile();
  const vertical = mapDemoVertical(demoVertical);
  const store = useSyncedDecisionStore(vertical);
  const [band, setBand] = useState<AttentionBand>("needs_you");
  const [horizon, setHorizon] = useState<DecisionRecordHorizon | "ALL">("ALL");

  const records = useMemo(() => {
    return Object.values(store.records).filter((r) => {
      if (horizon !== "ALL" && r.decisionHorizon !== horizon) return false;
      // Hide structural from needs-you primary stack unless STRUCTURAL filter
      if (
        r.decisionHorizon === "STRUCTURAL" &&
        horizon === "ALL" &&
        band === "needs_you"
      ) {
        return false;
      }
      return attentionBandOf(r.status) === band;
    });
  }, [store.records, band, horizon]);

  const needsCount = Object.values(store.records).filter(
    (r) =>
      attentionBandOf(r.status) === "needs_you" &&
      r.decisionHorizon !== "STRUCTURAL",
  ).length;

  const handlingCount = Object.values(store.records).filter(
    (r) => attentionBandOf(r.status) === "handling",
  ).length;

  const watchingCount = Object.values(store.records).filter(
    (r) => attentionBandOf(r.status) === "watching",
  ).length;

  const verifiedCount = Object.values(store.records).filter(
    (r) => attentionBandOf(r.status) === "verified",
  ).length;

  const heroId = heroRecordId(vertical);
  const hero = store.records[heroId];
  const debt = structuralDebtForVertical(vertical);
  const checkItems = sinceLastCheck();

  const onCardState = (id: string, next: DecisionCardState) => {
    if (next === "APPROVED") {
      approveDecision(id);
      return;
    }
    if (next === "VERIFIED") {
      verifyDecision(id);
      return;
    }
    if (next === "SIMULATE") {
      advanceDecision(id, "SIMULATED");
    }
  };

  const primaryNeeds = records
    .filter((r) => r.decisionHorizon !== "STRUCTURAL")
    .sort((a, b) => priorityOf(b) - priorityOf(a))
    .slice(0, 3);

  const openExposure = Object.values(store.records)
    .filter((r) => attentionBandOf(r.status) === "needs_you")
    .reduce((s, r) => s + (r.exposedContribution ?? 0), 0);

  return (
    <div className="rp-brief" data-vertical={vertical}>
      <header className="rp-brief-head">
        <p className="rp-brief-kicker">Brief · What requires judgment now</p>
        <h1 className="rp-brief-title">
          {needsCount === 0
            ? "Everything is operating within expectations"
            : `${needsCount} thing${needsCount === 1 ? "" : "s"} need you`}
        </h1>
        <p className="rp-brief-quiet">
          {hero?.property ?? "—"} ·{" "}
          {openExposure > 0
            ? `${formatDecisionMoney(openExposure)} currently exposed · `
            : ""}
          systems record · RADR decides
        </p>

        <section className="rp-brief-since" aria-label="Since your last check">
          <p className="rp-brief-kicker">Since your last check</p>
          <ul className="rp-brief-since-list">
            {checkItems.length === 0 ? (
              <li className="rp-brief-quiet">Quiet since last check.</li>
            ) : (
              checkItems.map((item) => (
                <li key={item.id} data-kind={item.kind}>
                  <Link href={`/app/decisions/${item.id}`}>
                    <span className="rp-brief-since-mark">
                      {item.kind === "needs_you"
                        ? "!"
                        : item.kind === "verified"
                          ? "✓"
                          : "·"}
                    </span>
                    <span>
                      {item.title}
                      {item.amountEuro != null
                        ? ` · ${formatDecisionMoney(item.amountEuro)}`
                        : ""}
                    </span>
                    <em>{item.detail}</em>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        {debt && debt.status !== "CLOSED" ? (
          <aside className="rp-brief-debt">
            <p className="rp-brief-kicker">This keeps happening</p>
            <strong>{debt.title}</strong>
            <p>
              {debt.debt?.incidentCount ?? 7} of last{" "}
              {debt.debt?.windowLabel ?? "12 peak services"} ·{" "}
              {formatDecisionMoney(debt.debt?.cumulativeExposureEuro ?? 8420)}{" "}
              cumulative exposure
            </p>
            <p className="rp-brief-quiet">
              {debt.debt?.structuralRecommendation}
            </p>
            <Link href={`/app/decisions/${debt.id}`} className="rp-brief-debt-link">
              Open structural decision
            </Link>
          </aside>
        ) : null}

        <div className="rp-brief-horizons" role="tablist" aria-label="Horizon">
          <button
            type="button"
            role="tab"
            className="rp-brief-phase"
            aria-selected={horizon === "ALL"}
            data-on={horizon === "ALL" ? "true" : "false"}
            onClick={() => setHorizon("ALL")}
          >
            All
          </button>
          {DECISION_HORIZONS.map((h) => (
            <button
              key={h}
              type="button"
              role="tab"
              className="rp-brief-phase"
              aria-selected={horizon === h}
              data-on={horizon === h ? "true" : "false"}
              onClick={() => setHorizon(h)}
            >
              {horizonLabel(h)}
            </button>
          ))}
        </div>

        <div className="rp-brief-bands" role="tablist" aria-label="Attention">
          {(
            [
              ["needs_you", "Needs you", needsCount],
              ["handling", "Handling", handlingCount],
              ["watching", "Watching", watchingCount],
              ["verified", "Verified", verifiedCount],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={band === id}
              data-on={band === id ? "true" : "false"}
              className="rp-brief-band"
              onClick={() => setBand(id)}
            >
              <span>{label}</span>
              <strong>{count}</strong>
            </button>
          ))}
        </div>
      </header>

      <div className="rp-brief-body">
        {band === "needs_you" ? (
          <div className="rp-brief-stack">
            {primaryNeeds.length === 0 ? (
              <p className="rp-brief-silence">
                Nothing needs you. RADR is watching.
              </p>
            ) : (
              primaryNeeds.map((r) => {
                const decision = projectDecisionForBrief(r);
                return (
                  <div key={r.id} className="rp-brief-card-wrap">
                    <Link
                      href={`/app/decisions/${r.id}`}
                      className="rp-brief-open"
                    >
                      Open Decision Record
                    </Link>
                    <DecisionCard
                      decision={decision}
                      state={cardStateFromLifecycle(r.status)}
                      onStateChange={(next) => onCardState(r.id, next)}
                      showImage={false}
                      compact
                    />
                  </div>
                );
              })
            )}
          </div>
        ) : null}

        {band === "handling" ? (
          <div className="rp-brief-stack">
            {records.length === 0 ? (
              <p className="rp-brief-silence">Nothing in flight.</p>
            ) : (
              records.map((r) => (
                <div key={r.id} className="rp-brief-card-wrap">
                  <Link
                    href={`/app/decisions/${r.id}`}
                    className="rp-brief-open"
                  >
                    Open Decision Record
                  </Link>
                  <DecisionCard
                    decision={projectDecisionForBrief(r)}
                    state="APPROVED"
                    showImage={false}
                    compact
                  />
                </div>
              ))
            )}
          </div>
        ) : null}

        {band === "watching" ? (
          <p className="rp-brief-silence">Quiet. RADR is watching.</p>
        ) : null}

        {band === "verified" ? (
          <div className="rp-brief-stack">
            {records.map((r) => (
              <div key={r.id} className="rp-brief-card-wrap">
                <Link href={`/app/decisions/${r.id}`} className="rp-brief-open">
                  Open Decision Record
                </Link>
                <DecisionCard
                  decision={projectDecisionForBrief(r)}
                  state="VERIFIED"
                  showImage={false}
                  compact
                />
              </div>
            ))}
            {vertical === "restaurant" ? (
              <DecisionCard
                decision={TABLE_RECOVERED}
                state="VERIFIED"
                showImage={false}
                compact
              />
            ) : null}
            {records.length === 0 && vertical !== "restaurant" ? (
              <p className="rp-brief-silence">No verified value yet.</p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
