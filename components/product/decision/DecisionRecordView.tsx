"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import {
  lifecycleLabel,
  attentionBandOf,
  toPublicLifecycle,
  PUBLIC_DECISION_LIFECYCLE,
} from "@/lib/radr/decision/lifecycle";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  approveDecision,
  advanceDecision,
  verifyDecision,
  learnDecision,
  addOperatorContext,
} from "@/lib/radr/decision/store";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import { CANON_BY_ID } from "@/lib/radr/decision/demo/canonical";
import {
  optionEconomicEuro,
  type CounterfactualOption,
} from "@/lib/radr/decision/counterfactual";
import { FuturesTimeline } from "@/components/product/decision/FuturesTimeline";
import { FuturesTrajectory } from "@/components/product/canvas/FuturesTrajectory";
import { DecisionReplay } from "@/components/product/decision/DecisionReplay";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import {
  sceneForDecision,
  VISUAL_ASSETS,
} from "@/data/demo/visualAssets";

type Props = {
  record: DecisionRecord;
  onChange?: () => void;
};

function forecastBand(n: number): "HIGH" | "MEDIUM" | "LOW" {
  if (n >= 80) return "HIGH";
  if (n >= 60) return "MEDIUM";
  return "LOW";
}

function freshnessLabel(
  f: DecisionRecord["confidence"]["dataFreshness"],
): string {
  if (f === "HIGH") return "Good";
  if (f === "MEDIUM") return "Degraded";
  if (f === "LOW") return "Stale";
  return "Unknown";
}

function optionEconomics(o: CounterfactualOption): ReactNode {
  if (o.economicMetrics?.length) {
    return o.economicMetrics.map((m) => (
      <span key={`${m.type}-${m.label}`}>
        {m.value != null ? `${formatDecisionMoney(m.value)} · ` : null}
        {m.label}
        {m.status === "POTENTIAL" ? " · pending" : null}
      </span>
    ));
  }
  if (o.economicEffectNote) return <span>{o.economicEffectNote}</span>;
  const euro = optionEconomicEuro(o);
  if (euro == null) return <span>Economic effect not yet modeled</span>;
  if (o.isNoAction && euro === 0) {
    return <span>Baseline path · no incremental contribution</span>;
  }
  return (
    <span>
      {formatDecisionMoney(euro)} expected economic effect
    </span>
  );
}

export function DecisionRecordView({ record, onChange }: Props) {
  const band = attentionBandOf(record.status);
  const [selected, setSelected] = useState(record.recommendedOptionId);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const publicStep = toPublicLifecycle(record.status);
  const scene = sceneForDecision(record.id);
  const primary = formatPrimaryMetric(record);

  const canon = CANON_BY_ID[record.id];
  const futures = useMemo(
    () => (canon ? futuresFromCanon(canon) : null),
    [canon],
  );

  const refresh = () => onChange?.();

  const primaryCta = () => {
    if (band === "needs_you") {
      approveDecision(record.id, selected);
      refresh();
      return;
    }
    if (
      record.status === "APPROVED" ||
      record.status === "EXECUTING" ||
      record.status === "OBSERVING"
    ) {
      advanceDecision(record.id, "OBSERVING");
      verifyDecision(record.id);
      refresh();
      return;
    }
    if (record.status === "VERIFIED") {
      learnDecision(record.id);
      refresh();
    }
  };

  const ctaLabel = (() => {
    if (band === "needs_you") return "Approve prepared plan";
    if (
      record.status === "APPROVED" ||
      record.status === "EXECUTING" ||
      record.status === "OBSERVING"
    ) {
      return "Advance time → outcome (demo)";
    }
    if (record.status === "VERIFIED") return "Write to memory";
    return null;
  })();

  const dominantState = record.operatingStateSnapshot?.find((r) =>
    /kitchen|load/i.test(r.label),
  );

  return (
    <article className="rp-drec rp-drec-elevated">
      <nav className="rp-drec-crumb">
        <Link href="/app">Control Center</Link>
        <span aria-hidden="true">/</span>
        <Link href="/app/decisions">Decisions</Link>
        <span aria-hidden="true">/</span>
        <span>{displayDecisionId(record.id)}</span>
      </nav>

      {record.id === DECISION_IDS.playbook ? (
        <div className="rp-playbook-pair" aria-label="Property comparison">
          <OperatingScene
            asset={VISUAL_ASSETS.locations.canalHouse}
            aspect="4/3"
            overlay={
              <>
                <span className="rp-scene-place">Canal House · Amsterdam</span>
                <span className="rp-scene-phase">ADR similar · GOP different</span>
              </>
            }
          />
          <OperatingScene
            asset={VISUAL_ASSETS.locations.berlinMitte}
            aspect="4/3"
            overlay={
              <>
                <span className="rp-scene-place">Berlin Mitte</span>
                <span className="rp-scene-phase">Comparable commercial · different profit</span>
              </>
            }
          />
        </div>
      ) : scene ? (
        <div className="rp-drec-hero">
          <OperatingScene
            asset={scene}
            priority
            aspect="21/9"
            overlay={
              <>
                <span className="rp-scene-place">{record.property}</span>
                <span className="rp-scene-phase">
                  {record.phaseLabel}
                  {record.decisionDeadline
                    ? ` · ${record.decisionDeadline}`
                    : null}
                </span>
              </>
            }
          />
        </div>
      ) : null}

      <header className="rp-drec-head">
        <div className="rp-drec-head-meta">
          <span className="rp-cc-id">{displayDecisionId(record.id)}</span>
          <span>{(record.territories ?? []).join(" · ")}</span>
          <span>{record.property}</span>
          <span className="rp-cc-demo">DEMO</span>
        </div>
        <h1 className="rp-drec-title">{record.title}</h1>
        <p className="rp-drec-problem">{record.problemStatement}</p>
        <div className="rp-drec-life" aria-label="Lifecycle">
          {PUBLIC_DECISION_LIFECYCLE.map((step) => {
            const cur = PUBLIC_DECISION_LIFECYCLE.indexOf(publicStep);
            const i = PUBLIC_DECISION_LIFECYCLE.indexOf(step);
            return (
              <span
                key={step}
                data-active={i === cur ? "true" : undefined}
                data-done={i < cur ? "true" : undefined}
                data-future={i > cur ? "true" : undefined}
              >
                {step}
              </span>
            );
          })}
        </div>
      </header>

      {record.id === DECISION_IDS.menuPeak ? (
        <p className="rp-drec-quiet">
          <Link href="/app/intelligence/menu">Open Menu intelligence</Link>
          {" · "}
          contribution per kitchen minute map
        </p>
      ) : null}

      <section className="rp-drec-sec rp-drec-rec-block" id="recommendation">
        <h2>Recommendation</h2>
        <p className="rp-drec-rec">{record.recommendationHeadline}</p>
        <p className="rp-drec-reason">{record.recommendationReasoning}</p>
        {primary ? (
          <div className="rp-drec-econ">
            <strong>{primary.money}</strong>
            <span>{primary.caption}</span>
          </div>
        ) : null}
        {record.id === DECISION_IDS.orphan ? (
          <div className="rp-econ-clock" aria-label="Economic clock">
            <div>
              <strong>T−72h</strong>
              <span>Wait</span>
            </div>
            <div>
              <strong>T−48h</strong>
              <span>Direct release</span>
            </div>
            <div>
              <strong>T−24h</strong>
              <span>Reassess</span>
            </div>
          </div>
        ) : null}
        {record.confidence ? (
          <div className="rp-drec-confidence">
            <span>
              Evidence coverage{" "}
              {record.confidence.evidenceCoverage ?? "Unknown"}
            </span>
            <span>
              Data freshness {freshnessLabel(record.confidence.dataFreshness)}
            </span>
            <span>
              Decision confidence {record.confidence.userFacing}
            </span>
            {record.confidence.mainUncertainty ? (
              <span>
                Main uncertainty · {record.confidence.mainUncertainty}
              </span>
            ) : null}
          </div>
        ) : null}
      </section>

      {record.operatingStateSnapshot?.length ? (
        <section className="rp-drec-sec" id="state">
          <h2>Operating state</h2>
          <div className="rp-ops-strip">
            {dominantState ? (
              <div className="rp-ops-dominant" data-tone={dominantState.tone}>
                <strong>{dominantState.value}</strong>
                <span>{dominantState.label}</span>
              </div>
            ) : null}
            <dl className="rp-drec-state rp-ops-grid">
              {record.operatingStateSnapshot
                .filter((row) => row.label !== dominantState?.label)
                .map((row) => (
                  <div key={row.label} data-tone={row.tone}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </section>
      ) : null}

      {record.relationshipChain?.length ? (
        <section className="rp-drec-sec" id="why">
          <h2>The relationship RADR found</h2>
          <ol className="rp-causal">
            {record.relationshipChain.map((step, i) => (
              <li key={`${step}-${i}`}>
                <span className="rp-causal-n">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {record.whyBlocks?.length ? (
            <ul className="rp-drec-why">
              {record.whyBlocks.map((b, i) => (
                <li key={`${b.title}-${i}`}>
                  <strong>{b.title}</strong>
                  <span>{b.body}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {record.alternativeExplanations?.length ? (
            <div className="rp-alt-expl">
              <h3>RADR also considered</h3>
              <ul>
                {record.alternativeExplanations.map((a) => (
                  <li key={a.label}>
                    <strong>{a.label}</strong>
                    <span>{a.whyLower}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {record.counterEvidence ? (
            <p className="rp-counter-ev">
              <strong>Counterevidence</strong>
              <span>{record.counterEvidence}</span>
            </p>
          ) : null}
          {record.mainRiskNarrative ? (
            <p className="rp-drec-quiet">
              Main risk · {record.mainRiskNarrative}
            </p>
          ) : null}
          {record.debt ? (
            <div className="rp-debt">
              <h3>Decision debt</h3>
              <p>
                Temporary fix used {record.debt.temporaryFixesUsed}× in{" "}
                {record.debt.windowLabel}. Cumulative exposure{" "}
                {formatDecisionMoney(record.debt.cumulativeExposureEuro)}.
              </p>
              <p className="rp-drec-quiet">
                {record.debt.structuralRecommendation}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rp-drec-sec" id="evidence">
        <button
          type="button"
          className="rp-drec-disclose"
          onClick={() => setEvidenceOpen((v) => !v)}
          aria-expanded={evidenceOpen}
        >
          Evidence ({record.evidenceRefs.length})
        </button>
        {evidenceOpen ? (
          <ul className="rp-drec-evidence">
            {record.evidenceRefs.map((e) => (
              <li key={e.id} id={`evidence-${e.id}`}>
                <span data-grade={e.grade}>{e.grade}</span>
                <strong>{e.label}</strong>
                <span>{e.value}</span>
                <em>
                  {e.source} · {e.freshness}
                </em>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {futures ? (
        <section className="rp-drec-sec" id="futures">
          <h2>Futures</h2>
          <p className="rp-drec-quiet">
            Compare plausible operating responses
          </p>
          {record.id === DECISION_IDS.peak ? (
            <FuturesTrajectory
              futures={futures}
              selectedId={
                futures.scenarios.find((s) => s.id.includes(selected))?.id
              }
              connectPeak
              onSelect={(id) => {
                const match = record.options.find((o) => id.includes(o.id));
                if (match) setSelected(match.id);
              }}
            />
          ) : (
            <FuturesTimeline
              futures={futures}
              selectedId={
                futures.scenarios.find((s) =>
                  s.id.includes(selected),
                )?.id
              }
              onSelect={(id) => {
                const match = record.options.find((o) => id.includes(o.id));
                if (match) setSelected(match.id);
              }}
            />
          )}
        </section>
      ) : (
        <section className="rp-drec-sec" id="options">
          <h2>Options</h2>
          <ul className="rp-drec-options">
            {record.options.map((o) => (
              <li key={o.id} data-rec={o.recommended ? "true" : undefined}>
                <button
                  type="button"
                  data-selected={selected === o.id ? "true" : undefined}
                  onClick={() => setSelected(o.id)}
                >
                  <strong>{o.title}</strong>
                  {optionEconomics(o)}
                  <span>
                    Guest {o.guestImpact} · forecast confidence{" "}
                    {forecastBand(o.confidence)}
                  </span>
                  <span>
                    Main risk ·{" "}
                    {o.mainRiskDescription ??
                      record.mainRiskNarrative ??
                      o.note?.split("·")[0]?.trim() ??
                      "See note"}
                  </span>
                  <span>
                    Risk level · {o.riskLevel ?? o.operationalRisk}
                  </span>
                  {o.note ? <em>{o.note}</em> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {record.constraints?.length ? (
        <section className="rp-drec-sec" id="constraints">
          <h2>Constraints</h2>
          <ul className="rp-drec-constraints">
            {record.constraints.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rp-drec-sec" id="context">
        <h2>Operator context</h2>
        {(record.operatorContext ?? []).map((c) => (
          <blockquote key={c.id} className="rp-drec-ctx">
            <p>{c.text}</p>
            <footer>
              {c.author} · {c.role}
              {c.impactNote ? ` · ${c.impactNote}` : null}
            </footer>
          </blockquote>
        ))}
        <button
          type="button"
          className="rp-drec-secondary"
          onClick={() => {
            addOperatorContext(record.id);
            setCtxOpen(true);
            refresh();
          }}
        >
          Add context → re-simulate
        </button>
        {ctxOpen ? (
          <div className="rp-re-sim">
            <p>Operator context added</p>
            <p>Operating model updated</p>
            <p>Futures re-simulated</p>
            <p>Recommendation updated</p>
          </div>
        ) : null}
      </section>

      <section className="rp-drec-sec" id="actions">
        <h2>Prepared for approval</h2>
        <p className="rp-drec-quiet">{record.actionPlan.payloadNote}</p>
        <ul className="rp-action-sheet">
          {record.actionPlan.steps.map((s) => (
            <li key={s.id} data-status={s.status}>
              <span className="rp-action-sys">{s.provider}</span>
              <strong>{s.title}</strong>
              <span className="rp-action-st">
                {s.preparedOnly ? "Prepared" : s.status}
              </span>
              {s.detail ? <em>{s.detail}</em> : null}
            </li>
          ))}
        </ul>
      </section>

      {record.outcomeDetail || record.observedOutcome ? (
        <section className="rp-drec-sec" id="outcome">
          <h2>Outcome</h2>
          <p>{record.outcomeDetail?.summary ?? record.observedOutcome}</p>
          {record.outcomeDetail?.rows ? (
            <dl className="rp-drec-state">
              {record.outcomeDetail.rows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : null}

      {record.verificationDetail || record.verifiedValue ? (
        <section className="rp-drec-sec" id="verify">
          <h2>Verification</h2>
          {record.verificationDetail || record.verifiedValue ? (
            <p className="rp-drec-quiet">
              {primary ? (
                <>
                  <strong>{primary.money}</strong> {primary.caption}
                </>
              ) : null}
            </p>
          ) : null}
          {record.verificationDetail ? (
            <p
              className="rp-attr"
              data-strength={record.verificationDetail.attributionStrength}
            >
              <span className="rp-attr-label">
                {record.verificationDetail.attributionStrength.replace(
                  /_/g,
                  " ",
                )}
              </span>
              <span>
                compared to {record.verificationDetail.comparedTo}
                {record.verificationDetail.attributionStrength === "MODELED"
                  ? " · outcome observed; economic attribution modeled rather than directly isolated"
                  : null}
              </span>
            </p>
          ) : record.verifiedValue?.note?.includes("MODELED") ? (
            <p className="rp-attr" data-strength="MODELED">
              <span className="rp-attr-label">Modeled attribution</span>
              <span>
                Outcome observed. Economic attribution is modeled rather than
                directly isolated.
              </span>
            </p>
          ) : null}
        </section>
      ) : null}

      {record.lesson || record.playbookImpact ? (
        <section className="rp-drec-sec" id="memory">
          <h2>Memory</h2>
          {record.lesson ? <p>{record.lesson}</p> : null}
          {record.playbookImpact ? (
            <p className="rp-drec-quiet">{record.playbookImpact}</p>
          ) : null}
          <Link href="/app/memory" className="rp-drec-secondary">
            Open Operating Memory
          </Link>
        </section>
      ) : null}

      <DecisionReplay decisionId={record.id} />

      {record.id === DECISION_IDS.peak ||
      record.id === DECISION_IDS.tableRecover ? (
        <p className="rp-drec-quiet">
          <Link href="/app/service">Open Service Map</Link>
          {" · "}
          physical capacity under this Decision
        </p>
      ) : null}

      <footer className="rp-drec-foot">
        {ctaLabel ? (
          <button type="button" className="rp-cc-cta" onClick={primaryCta}>
            {ctaLabel}
          </button>
        ) : (
          <Link href="/app" className="rp-cc-cta">
            Back to Control Center
          </Link>
        )}
        <span className="rp-cc-life">{lifecycleLabel(record.status)}</span>
      </footer>
    </article>
  );
}
