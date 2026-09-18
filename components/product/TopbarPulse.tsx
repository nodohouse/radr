"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { useProduct } from "@/lib/product/store";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import {
  IntegrationHealthService,
} from "@/lib/radr/product/integrations";
import { roleContextFor } from "@/lib/radr/product/personas";
import { scopedDecisions, splitNeedsYou } from "@/lib/radr/product/roleScope";

/**
 * Attention chrome — scoped to demo persona. No global verified chip.
 */
export function TopbarPulse() {
  const { roleView } = useProduct();
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const ctx = roleContextFor(roleView);

  const pulse = useMemo(() => {
    const scoped = scopedDecisions(Object.values(snap.records), roleView);
    const { urgent, review } = splitNeedsYou(scoped);
    const needs = urgent.length + review.length;
    const issueLine = IntegrationHealthService.issueSummary(roleView);
    return {
      needs,
      issueLine,
      headline:
        needs > 0
          ? `${ctx.shortLabel} · ${needs} need${needs === 1 ? "s" : ""} you`
          : `${ctx.shortLabel} · clear`,
      attentionHref: needs > 0 ? "/app/decisions?band=needs_you" : "/app",
    };
  }, [snap, roleView, ctx.shortLabel]);

  const needs = pulse.needs;
  const restLabel =
    needs > 0
      ? needs === 1
        ? "needs you"
        : "need you"
      : "nothing needs you";
  const metaBits = [ctx.shortLabel, pulse.issueLine]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="rp-top-pulse"
      data-needs={needs > 0 ? "true" : "false"}
    >
      <Link
        href={pulse.attentionHref}
        className="rp-top-pulse-main"
        aria-label={pulse.headline}
      >
        <span className="rp-top-pulse-glow" aria-hidden="true" />
        <span className="rp-top-pulse-kicker">
          <i className="rp-top-pulse-beacon" aria-hidden="true" />
          {needs > 0 ? "Needs you" : "Clear"}
        </span>
        <span className="rp-top-pulse-head">
          {needs > 0 ? (
            <>
              <strong className="rp-top-pulse-count">{needs}</strong>
              <span className="rp-top-pulse-rest">{restLabel}</span>
            </>
          ) : (
            <span className="rp-top-pulse-rest">{restLabel}</span>
          )}
        </span>
        <span className="rp-top-pulse-meta">{metaBits}</span>
      </Link>
    </div>
  );
}
