"use client";

import {
  CountUpEuro,
  ExposureBars,
  SinceCheckDrawer,
} from "@/components/product/LiveVisuals";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import {
  computeSinceLastCheck,
  readAttentionSnapshot,
  recordControlCenterVisit,
  type SinceLastCheck,
} from "@/lib/radr/attentionState";
import { demoGreeting } from "@/lib/radr/demoClock";
import {
  attentionNowFindings,
  moneyKindOfFinding,
  operatorAttentionState,
  attentionStateLabel,
  valueStateOfFinding,
  verifiedFromFindings,
} from "@/lib/radr/valueSemantics";
import { getVerifiedValueFromScenarios } from "@/lib/radr/scenarios/store";
import type { Finding, Territory } from "@/lib/radr/domain";
import type { TerritoryId } from "@/lib/radr/brandTokens";
import {
  LENS_EMPHASIS,
  LENS_LABEL,
  moneyVocabLabel,
  type OperatingLens,
} from "@/lib/radr/operatingCanvas";
import { useProduct } from "@/lib/product/store";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TextSep } from "@/components/TextSep";

type Props = {
  findings: Finding[];
  locationName: string;
  narrative: string;
  lens: OperatingLens;
};

function territoryExposure(
  findings: Finding[],
): { territory: TerritoryId; euro: number }[] {
  const map: Record<Territory, number> = {
    BUY: 0,
    LABOR: 0,
    SELL: 0,
    RECOVER: 0,
  };
  for (const f of findings) {
    if (f.status === "RESOLVED" || f.status === "DISMISSED") continue;
    map[f.territory] += f.financialImpact.primaryValue;
  }
  return (Object.keys(map) as Territory[])
    .map((territory) => ({ territory, euro: map[territory] }))
    .filter((r) => r.euro > 0)
    .sort((a, b) => b.euro - a.euro);
}

function changeCount(since: SinceLastCheck): number {
  return (
    since.newFindings +
    since.changedFindings +
    since.resolvedFindings +
    (since.handledCount > 0 ? 1 : 0) +
    (since.decisionsReady > 0 ? 1 : 0)
  );
}

/**
 * Control Center brief - change-first, not KPI-first.
 * Since your last check → money kinds → priorities → quiet close.
 */
export function ExecutiveBrief({
  findings,
  locationName,
  narrative,
  lens,
}: Props) {
  const { setSelectedFindingId } = useProduct();
  const [sinceOpen, setSinceOpen] = useState(false);
  const [since, setSince] = useState<SinceLastCheck>(() =>
    computeSinceLastCheck(findings, readAttentionSnapshot()),
  );

  useEffect(() => {
    const before = computeSinceLastCheck(findings, readAttentionSnapshot());
    setSince(before);
    recordControlCenterVisit(findings);
  }, [findings]);

  const open = useMemo(() => attentionNowFindings(findings), [findings]);
  const resolved = useMemo(
    () =>
      findings.filter(
        (f) => f.status === "RESOLVED" || f.status === "VERIFIED",
      ),
    [findings],
  );

  const atRisk = open
    .filter((f) => {
      const k = moneyKindOfFinding(f);
      return k === "exposure" || k === "recoverable";
    })
    .reduce((s, f) => s + f.financialImpact.primaryValue, 0);

  const actionableEuro = open
    .filter((f) => {
      const vs = valueStateOfFinding(f);
      return (
        vs === "PREPARED" ||
        vs === "ACTIONABLE" ||
        operatorAttentionState(f) === "READY_FOR_APPROVAL"
      );
    })
    .reduce((s, f) => s + f.financialImpact.primaryValue, 0);

  const readyForApproval = open.filter(
    (f) => operatorAttentionState(f) === "READY_FOR_APPROVAL",
  ).length;
  const verifiedEuro =
    verifiedFromFindings(findings) || getVerifiedValueFromScenarios().verified;
  const byTerr = territoryExposure(open);
  const topFindings = useMemo(
    () =>
      [...open]
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 3),
    [open],
  );

  const changes = changeCount(since);
  const lensHint = LENS_EMPHASIS[lens];
  const exposureLabel =
    lens === "money" || lens === "risk"
      ? moneyVocabLabel("exposure", "long")
      : "currently exposed";

  if (open.length === 0) {
    return (
      <section className="rp-exec rp-exec-panel rp-exec-calm" aria-label="Executive summary">
        <p className="rp-exec-kicker">{demoGreeting()}</p>
        <header className="rp-exec-since-hero">
          <p className="rp-exec-since-kicker">Since your last check</p>
          <p className="rp-exec-issues">
            {changes > 0
              ? `${changes} thing${changes === 1 ? "" : "s"} changed`
              : "Nothing material changed"}
          </p>
          {verifiedEuro > 0 ? (
            <p className="rp-exec-urgency">
              <span data-band="TODAY">
                {formatFindingEuro(verifiedEuro)} {moneyVocabLabel("verified")}
                {since.handledCount > 0
                  ? ` · ${since.handledCount} handled`
                  : ""}
              </span>
            </p>
          ) : null}
        </header>
        <p className="rp-exec-quiet">
          Everything else is operating within expectations.
        </p>
        <p className="rp-exec-lens-hint">
          <span className="rp-layer-label">{LENS_LABEL[lens]} lens</span>
          <TextSep />
          <span>{lensHint.empty}</span>
        </p>
        <p className="rp-exec-narrative">{narrative}</p>
      </section>
    );
  }

  return (
    <section
      className="rp-exec rp-exec-live rp-exec-panel rp-exec-change"
      aria-label="Executive summary"
    >
      <div className="rp-exec-primary">
        <p className="rp-exec-kicker">{demoGreeting()}</p>

        <header className="rp-exec-since-hero">
          <button
            type="button"
            className="rp-exec-since-btn rp-exec-since-btn-primary"
            onClick={() => setSinceOpen(true)}
          >
            <span className="rp-exec-since-kicker">Since your last check</span>
            <span className="rp-exec-issues">
              {changes > 0
                ? `${changes} thing${changes === 1 ? "" : "s"} changed`
                : `${open.length} need${open.length === 1 ? "s" : ""} you`}
            </span>
            {since.lines.length ? (
              <span className="rp-exec-since-stats">
                <em>{since.lines.slice(0, 3).join(" · ")}</em>
              </span>
            ) : null}
          </button>
        </header>

        <ul className="rp-exec-money-kinds" aria-label="Value summary">
          <li data-kind="exposure">
            <em>{moneyVocabLabel("exposure", "long")}</em>
            <CountUpEuro value={atRisk} className="rp-exec-money-val" />
          </li>
          <li data-kind="actionable">
            <em>Actionable value</em>
            <strong>{formatFindingEuro(actionableEuro)}</strong>
            {readyForApproval > 0 ? (
              <span>
                {readyForApproval} ready for approval
              </span>
            ) : null}
          </li>
          <li data-kind="verified">
            <em>{moneyVocabLabel("verified", "long")}</em>
            <strong>{formatFindingEuro(verifiedEuro)}</strong>
          </li>
        </ul>

        <p className="rp-exec-lens-hint">
          <span className="rp-layer-label">{LENS_LABEL[lens]} · {exposureLabel}</span>
          <TextSep />
          <span>{lensHint.focus}</span>
        </p>

        <ul className="rp-exec-top" aria-label="Findings requiring attention">
          {topFindings.map((f) => {
            const state = operatorAttentionState(f);
            return (
              <li key={f.id}>
                <Link
                  href={`/app/findings/${f.id}`}
                  onClick={() => setSelectedFindingId(f.id)}
                >
                  <em>{f.territory}</em>
                  <TextSep />
                  <span>{f.locationName ?? locationName}</span>
                  <TextSep />
                  <strong>
                    {formatFindingEuro(f.financialImpact.primaryValue)}
                  </strong>
                  <TextSep />
                  <b>{f.title}</b>
                  <TextSep />
                  <i data-state={state}>{attentionStateLabel(state)}</i>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="rp-exec-narrative">{narrative}</p>

        {byTerr.length > 0 && (lens === "money" || lens === "risk" || lens === "operate") ? (
          <div className="rp-exec-split" aria-label="Exposure by territory">
            <p className="rp-exec-split-label">
              {lens === "risk" ? "Risk by territory" : "Exposure"}
            </p>
            <ExposureBars rows={byTerr} total={atRisk} />
          </div>
        ) : null}

        <p className="rp-exec-quiet">
          Everything else is operating within expectations.
        </p>
      </div>

      <aside className="rp-exec-side rp-exec-elevated" aria-label="Priority">
        <p className="rp-exec-since-kicker">Priorities</p>
        <ul className="rp-exec-priority-copy">
          {topFindings.map((f) => (
            <li key={f.id}>
              <em>{f.territory}</em>
              <TextSep />
              <strong>
                {formatFindingEuro(f.financialImpact.primaryValue)}
              </strong>
              <TextSep />
              <span>{f.summary}</span>
              <TextSep />
              <b>{f.recommendation.title}</b>
              <TextSep />
              <i>
                Confidence{" "}
                {f.confidenceBand === "HIGH"
                  ? "High"
                  : f.confidenceBand === "MEDIUM"
                    ? "Medium"
                    : "Low"}
              </i>
            </li>
          ))}
        </ul>
        {verifiedEuro > 0 ? (
          <div className="rp-exec-recent-win" aria-label="Recently verified">
            <p className="rp-exec-since-kicker">Recently verified</p>
            <p className="rp-exec-recent-win-body">
              <strong>{formatFindingEuro(verifiedEuro)} verified</strong>
              <TextSep />
              <span>
                {resolved[0]?.subtype ?? "Verified outcome"}
                <TextSep />
                <Link
                  href={
                    resolved[0] ? `/app/findings/${resolved[0].id}` : "/app/value"
                  }
                >
                  View proof
                </Link>
              </span>
            </p>
          </div>
        ) : null}
      </aside>

      <SinceCheckDrawer
        open={sinceOpen}
        onClose={() => setSinceOpen(false)}
        since={since}
      />

      <p className="rp-exec-loc sr-only">{locationName}</p>
    </section>
  );
}
