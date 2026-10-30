"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import {
  lifecycleLabel,
  attentionBandOf,
} from "@/lib/radr/decision/lifecycle";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatOperatorDeadline } from "@/lib/radr/format/operatorTime";
import { settingsPolicyHref, policyRefForDecision } from "@/lib/radr/product/demoSettings";
import {
  approveDecision,
  advanceDecision,
  verifyDecision,
  learnDecision,
  addOperatorContext,
} from "@/lib/radr/decision/store";
import { futuresFromCanon } from "@/lib/radr/decision/futures/fromCanon";
import { CANON_BY_ID } from "@/lib/radr/decision/demo/canonical";
import { incrementalVsNoActionEuro } from "@/lib/radr/decision/economics/moneyImpact";
import {
  optionEconomicEuro,
  type CounterfactualOption,
} from "@/lib/radr/decision/counterfactual";
import { FuturesTimeline } from "@/components/product/decision/FuturesTimeline";
import { FuturesTrajectory } from "@/components/product/canvas/FuturesTrajectory";
import { DecisionReplay } from "@/components/product/decision/DecisionReplay";
import "./decision-room.css";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import { VISUAL_ASSETS } from "@/data/demo/visualAssets";
import {
  WhyNowCausal,
  PEAK_WHY_NOW,
  SUPPLIER_WHY_NOW,
} from "@/components/product/decision/WhyNowCausal";
import {
  DecisionStageRail,
  type DecisionRoomNavId,
} from "@/components/product/decision/DecisionStageRail";

type Props = {
  record: DecisionRecord;
  onChange?: () => void;
};

function forecastBand(n: number): "HIGH" | "MEDIUM" | "LOW" {
  if (n >= 80) return "HIGH";
  if (n >= 60) return "MEDIUM";
  return "LOW";
}

function bandLabel(b: "HIGH" | "MEDIUM" | "LOW" | string | undefined): string {
  if (!b) return "Unknown";
  const u = b.toUpperCase();
  if (u === "HIGH") return "High";
  if (u === "MEDIUM") return "Medium";
  if (u === "LOW") return "Low";
  if (u === "NONE") return "None";
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
}

function freshnessLabel(
  f: DecisionRecord["confidence"]["dataFreshness"],
): string {
  if (f === "HIGH") return "Good";
  if (f === "MEDIUM") return "Degraded";
  if (f === "LOW") return "Stale";
  return "Unknown";
}

function optionEconomics(
  o: CounterfactualOption,
  resolved: boolean,
): ReactNode {
  if (o.economicMetrics?.length) {
    return o.economicMetrics.map((m) => (
      <span key={`${m.type}-${m.label}`}>
        {m.value != null ? `${formatDecisionMoney(m.value)} · ` : null}
        {m.label}
        {!resolved && m.status === "POTENTIAL" ? " · pending" : null}
        {resolved && m.status === "VERIFIED" && m.baseline
          ? ` · ${m.baseline}`
          : null}
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

function optionEconomicEffectText(
  o: CounterfactualOption,
  resolved: boolean,
): string {
  if (o.economicMetrics?.length) {
    return o.economicMetrics
      .map((m) => {
        const parts = [
          m.value != null ? formatDecisionMoney(m.value) : null,
          m.label,
          !resolved && m.status === "POTENTIAL" ? "pending" : null,
        ].filter(Boolean);
        return parts.join(" · ");
      })
      .join("; ");
  }
  if (o.economicEffectNote) return o.economicEffectNote;
  const euro = optionEconomicEuro(o);
  if (euro == null) return "Not yet modeled";
  if (o.isNoAction && euro === 0) return "€0 · baseline";
  return formatDecisionMoney(euro);
}

function ExactOptionMatrix({
  options,
  selected,
  resolved,
  onSelect,
  mainRiskFallback,
}: {
  options: CounterfactualOption[];
  selected: string;
  resolved: boolean;
  onSelect: (id: string) => void;
  mainRiskFallback?: string;
}) {
  return (
    <div className="rp-drec-matrix" data-open="true">
      <p className="rp-drec-matrix-label">Option matrix</p>
      <div className="rp-drec-exact-scroll">
        <table className="rp-drec-exact-table">
          <thead>
            <tr>
              <th scope="col">Option</th>
              <th scope="col">Economic</th>
              <th scope="col">Guest</th>
              <th scope="col">Confidence</th>
              <th scope="col">Risk</th>
              <th scope="col">Operational effect</th>
            </tr>
          </thead>
          <tbody>
            {options.map((o) => {
              const risk = o.riskLevel ?? o.operationalRisk;
              const riskNote =
                o.mainRiskDescription ??
                mainRiskFallback ??
                o.note?.split("·")[0]?.trim() ??
                "—";
              return (
                <tr
                  key={o.id}
                  data-selected={selected === o.id ? "true" : undefined}
                  data-rec={o.recommended ? "true" : undefined}
                >
                  <th scope="row">
                    <button
                      type="button"
                      className="rp-drec-exact-opt"
                      data-selected={selected === o.id ? "true" : undefined}
                      onClick={() => onSelect(o.id)}
                    >
                      <strong>{o.title}</strong>
                      {o.recommended ? <em>Recommended</em> : null}
                    </button>
                  </th>
                  <td>
                    <span className="rp-drec-exact-euro">
                      {optionEconomicEffectText(o, resolved)}
                    </span>
                  </td>
                  <td>{bandLabel(o.guestImpact)}</td>
                  <td>{forecastBand(o.confidence)}</td>
                  <td>
                    <span className="rp-drec-exact-risk" data-risk={risk}>
                      {bandLabel(risk)}
                    </span>
                    <span className="rp-drec-exact-risk-note">{riskNote}</span>
                  </td>
                  <td>{o.note ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DecisionRecordView({ record, onChange }: Props) {
  const band = attentionBandOf(record.status);
  const primary = formatPrimaryMetric(record);
  const policyRef = policyRefForDecision({
    id: record.id,
    decisionType: record.decisionType,
  });
  const resolved =
    band === "verified" ||
    band === "learned" ||
    record.status === "VERIFIED" ||
    record.status === "LEARNED" ||
    record.status === "CLOSED";
  const [selected, setSelected] = useState(record.recommendedOptionId);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [deepOpen, setDeepOpen] = useState(false);
  const [surface, setSurface] = useState<"current" | "replay">("current");

  const canon = CANON_BY_ID[record.id];
  const futures = useMemo(() => {
    if (canon) return futuresFromCanon(canon, { verified: resolved });
    if (!record.options.length) return null;
    const scenarios = record.options.map((o, i) => {
      const expected = o.expectedContributionEuro ?? 0;
      const risk =
        o.operationalRisk === "high"
          ? ("high" as const)
          : o.operationalRisk === "medium"
            ? ("medium" as const)
            : ("low" as const);
      return {
        id: `fut_${record.id}_${o.id}`,
        decisionId: record.id,
        label: o.title,
        actionSet: [o.note ?? o.title],
        assumptions: [record.contextLine],
        probability: Math.min(0.92, Math.max(0.12, (o.confidence ?? 70) / 100)),
        expectedContribution: expected,
        expectedContributionDefined: o.expectedContributionEuro != null,
        expectedGuestImpact: o.guestImpact,
        expectedCapacityImpact: risk,
        operationalRisk: risk,
        downside: o.isNoAction ? Math.min(0, expected) : Math.round(expected * 0.45),
        upside: Math.max(expected, Math.round(expected * 1.12)),
        confidence: o.confidence ?? 70,
        constraintViolations: [] as { constraintId: string; label: string; severity: "block" | "warn" }[],
        rank: i + 1,
        recommended: Boolean(o.recommended || o.id === record.recommendedOptionId),
        isNoAction: o.isNoAction,
        note: o.note,
      };
    });
    const rec = scenarios.find((s) => s.recommended) ?? scenarios[0]!;
    const baseline =
      scenarios.find((s) => s.isNoAction)?.expectedContribution ?? 0;
    return {
      id: `fb_${record.id}`,
      title: "Play it forward",
      situation: [record.property, record.title, record.contextLine],
      decisionId: record.id,
      objective: { primary: "contribution" as const, riskAversion: "medium" as const },
      scenarios,
      recommendedScenarioId: rec.id,
      incrementalVsNoAction: incrementalVsNoActionEuro(
        rec.expectedContribution,
        baseline,
      ),
      payloadNote:
        "Prepared — not written back. Operator confirms in the system of record.",
    };
  }, [canon, resolved, record]);

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

  const whyNowFacts =
    record.operatingStateSnapshot?.slice(0, 4) ?? [];

  const hasReplay =
    record.id === DECISION_IDS.peak ||
    record.id === DECISION_IDS.menuPeak ||
    record.id === DECISION_IDS.hotelReadiness ||
    record.id === DECISION_IDS.labor;

  /** Any Decision with FuturesBundle gets trajectory UI — Peak matrix only inside FuturesTrajectory when decisionId is peak. */
  const useTrajectory = futures != null && futures.scenarios.length > 0;

  const recommendedOption = record.options.find((o) => o.recommended);
  const noActionOption = record.options.find((o) => o.isNoAction);
  const showGenericBaseline =
    record.id !== DECISION_IDS.peak &&
    Boolean(noActionOption && recommendedOption);

  const navSections = useMemo((): DecisionRoomNavId[] => {
    const sections: DecisionRoomNavId[] = ["recommendation"];
    if (
      whyNowFacts.length ||
      record.id === DECISION_IDS.peak ||
      record.id === DECISION_IDS.supplier ||
      record.id === DECISION_IDS.hotelReadiness ||
      record.id === DECISION_IDS.labor
    ) {
      sections.push("why-now");
    }
    if (record.relationshipChain?.length && record.id !== DECISION_IDS.peak) {
      sections.push("causal");
    }
    if (futures) sections.push("futures");
    if (record.id === DECISION_IDS.peak || showGenericBaseline) {
      sections.push("baseline");
    }
    sections.push("actions");
    if (
      resolved ||
      record.outcomeDetail ||
      record.observedOutcome ||
      record.verifiedValue
    ) {
      sections.push("outcome");
    }
    if (resolved || record.verificationDetail || record.verifiedValue) {
      sections.push("verify");
    }
    if (record.lesson || record.playbookImpact) {
      sections.push("memory");
    }
    return sections;
  }, [futures, record, resolved, showGenericBaseline, whyNowFacts.length]);

  return (
    <article
      className="rp-drec rp-drec-elevated"
      data-resolved={resolved ? "true" : undefined}
      data-room={
        record.id === DECISION_IDS.peak ||
        record.id === DECISION_IDS.hotelReadiness
          ? "true"
          : undefined
      }
    >
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
                <span className="rp-scene-place">Mercer House · New York</span>
                <span className="rp-scene-phase">ADR similar · GOP different</span>
              </>
            }
          />
          <OperatingScene
            asset={VISUAL_ASSETS.locations.berlinMitte}
            aspect="4/3"
            overlay={
              <>
                <span className="rp-scene-place">Soho · New York</span>
                <span className="rp-scene-phase">
                  Comparable commercial · different profit
                </span>
              </>
            }
          />
        </div>
      ) : null}

      <header className="rp-drec-head" data-editorial="true">
        <div className="rp-drec-head-meta">
          <span className="rp-cc-id">{displayDecisionId(record.id)}</span>
          <span>{record.property}</span>
          <span className="rp-drec-status-pill" data-band={band}>
            {lifecycleLabel(record.status)}
          </span>
        </div>
        {record.decisionDeadline && !resolved ? (
          <p className="rp-drec-deadline rp-drec-deadline-hero">
            {formatOperatorDeadline(record.decisionDeadline)}
          </p>
        ) : null}
        <h1 className="rp-drec-title">
          {record.recommendationHeadline?.trim() ||
            record.title?.trim() ||
            "Decision"}
        </h1>
        {primary ? (
          <div className="rp-drec-econ rp-drec-econ-hero">
            <strong className="rp-drec-econ-num">{primary.money}</strong>
            <span className="rp-drec-econ-cap">{primary.caption}</span>
          </div>
        ) : null}
        {resolved && record.decisionDeadline ? (
          <p className="rp-drec-deadline">Resolved</p>
        ) : null}
        <DecisionStageRail status={record.status} sections={navSections} />
      </header>

      {hasReplay ? (
        <div className="rp-drec-surface" role="tablist" aria-label="Decision surface">
          <button
            type="button"
            role="tab"
            aria-selected={surface === "current"}
            data-active={surface === "current" ? "true" : undefined}
            onClick={() => setSurface("current")}
          >
            Current decision
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={surface === "replay"}
            data-active={surface === "replay" ? "true" : undefined}
            onClick={() => setSurface("replay")}
          >
            Historical replay
          </button>
        </div>
      ) : null}

      {surface === "replay" && hasReplay ? (
        <DecisionReplay decisionId={record.id} />
      ) : (
        <>
          {record.id === DECISION_IDS.menuPeak ? (
            <p className="rp-drec-quiet">
              <Link href="/app/intelligence/menu">Open Menu intelligence</Link>
              {" · "}
              contribution per kitchen minute map
            </p>
          ) : null}

          <section className="rp-drec-sec rp-drec-rec-block" id="recommendation">
            <h2>{resolved ? "What was decided" : "Recommendation"}</h2>
            <p className="rp-drec-problem">{record.problemStatement}</p>
            <p className="rp-drec-reason">{record.recommendationReasoning}</p>
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
              <dl className="rp-drec-confidence">
                <div>
                  <dt>Evidence coverage</dt>
                  <dd>
                    {record.confidence.evidenceCoverage
                      ? bandLabel(record.confidence.evidenceCoverage)
                      : resolved
                        ? "Historical metadata unavailable"
                        : "Unknown"}
                  </dd>
                </div>
                <div>
                  <dt>Data freshness</dt>
                  <dd>{freshnessLabel(record.confidence.dataFreshness)}</dd>
                </div>
                <div>
                  <dt>Decision confidence</dt>
                  <dd>{bandLabel(record.confidence.userFacing)}</dd>
                </div>
                {record.confidence.mainUncertainty ? (
                  <div className="rp-drec-confidence-wide">
                    <dt>Main uncertainty</dt>
                    <dd>{record.confidence.mainUncertainty}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </section>

          {whyNowFacts.length ||
          record.id === DECISION_IDS.peak ||
          record.id === DECISION_IDS.supplier ||
          record.id === DECISION_IDS.hotelReadiness ? (
            <section className="rp-drec-sec" id="why-now">
              <h2>{resolved ? "State at decision time" : "Why now"}</h2>
              {record.id === DECISION_IDS.peak ? (
                <WhyNowCausal {...PEAK_WHY_NOW} />
              ) : record.id === DECISION_IDS.supplier ? (
                <WhyNowCausal {...SUPPLIER_WHY_NOW} />
              ) : record.id === DECISION_IDS.hotelReadiness ? (
                <WhyNowCausal
                  nodes={[
                    {
                      id: "nr",
                      label: "Not ready",
                      value: "11 rooms",
                      tone: "risk",
                    },
                    {
                      id: "arr",
                      label: "Arrivals",
                      value: "18 · 75m",
                      tone: "watch",
                    },
                    {
                      id: "f3",
                      label: "Floor 3",
                      value: "Behind",
                      tone: "risk",
                    },
                    {
                      id: "risk",
                      label: "At risk",
                      value: "7 arrivals",
                      tone: "risk",
                    },
                  ]}
                  edges={[
                    { from: "nr", to: "risk" },
                    { from: "arr", to: "risk" },
                    { from: "f3", to: "risk" },
                  ]}
                  exposure={{ label: "Protected", value: "€1,840" }}
                  footer="Reassign 2 attendants · protect check-in without calling extra labor."
                />
              ) : whyNowFacts.length ? (
                <dl className="rp-drec-why-facts">
                  {whyNowFacts.map((row) => (
                    <div key={row.label} data-tone={row.tone}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ) : null}

          {/* Peak: causal visual above owns the relationship — skip duplicate prose. */}
          {record.relationshipChain?.length &&
          record.id !== DECISION_IDS.peak ? (
            <section className="rp-drec-sec" id="causal">
              <h2>Causal</h2>
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
          {record.id === DECISION_IDS.peak && record.mainRiskNarrative ? (
            <p className="rp-drec-quiet" style={{ marginTop: "0.35rem" }}>
              Main risk · {record.mainRiskNarrative}
            </p>
          ) : null}

          {futures ? (
            <section className="rp-drec-sec rp-drec-futures-primary" id="futures">
              <h2>
                {resolved ? "Options considered at decision time" : "Futures"}
              </h2>
              <p className="rp-drec-quiet">
                {resolved
                  ? "Historical trajectories — not open futures"
                  : "Visual trajectories first · exact matrix secondary"}
              </p>
              {useTrajectory ? (
                <FuturesTrajectory
                  futures={futures}
                  decisionId={record.id}
                  selectedId={
                    futures.scenarios.find((s) => s.id.includes(selected))?.id
                  }
                  connectPeak={record.id === DECISION_IDS.peak}
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
              {record.options.length > 0 ? (
                <ExactOptionMatrix
                  options={record.options}
                  selected={selected}
                  resolved={resolved}
                  onSelect={setSelected}
                  mainRiskFallback={record.mainRiskNarrative}
                />
              ) : null}
            </section>
          ) : (
            <section className="rp-drec-sec" id="options">
              <h2>{resolved ? "Options considered" : "Options"}</h2>
              <ul className="rp-drec-options">
                {record.options.map((o) => (
                  <li key={o.id} data-rec={o.recommended ? "true" : undefined}>
                    <button
                      type="button"
                      data-selected={selected === o.id ? "true" : undefined}
                      onClick={() => setSelected(o.id)}
                    >
                      <strong>{o.title}</strong>
                      {optionEconomics(o, resolved)}
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

          {record.id === DECISION_IDS.peak && !resolved ? (
            <section className="rp-drec-sec rp-droom-change" id="what-changes">
              <h2>What would change RADR&apos;s recommendation?</h2>
              <ul>
                <li>Kitchen clears &gt;7 minutes earlier</li>
                <li>Inbound covers decline below 25 in the next 20m</li>
                <li>Delivery orders drop toward plan</li>
                <li>Staffing capacity increases on hot stations</li>
              </ul>
            </section>
          ) : null}

          {record.id === DECISION_IDS.peak ? (
            <section className="rp-drec-sec rp-droom-baseline" id="baseline">
              <h2>{resolved ? "Baseline at decision time" : "If we do nothing"}</h2>
              <p className="rp-drec-quiet">
                Money frame · <strong>incremental</strong> vs seat-now (primary) ·
                absolute cover economics noted separately · not vs period plan
              </p>
              <div className="rp-droom-baseline-grid">
                <div>
                  <em>Seat-now · baseline</em>
                  <strong>€0</strong>
                  <span>incremental €0 · absolute covers ≈ €410</span>
                </div>
                <div data-selected="true">
                  <em>Selected · Wait 12</em>
                  <strong data-semantic="positive">+€620</strong>
                  <span>incremental vs seat-now · not vs plan</span>
                </div>
                <div>
                  <em>Throttle delivery</em>
                  <strong data-semantic="positive">+€180</strong>
                  <span>incremental vs seat-now · not vs plan</span>
                </div>
              </div>
            </section>
          ) : showGenericBaseline ? (
            <section className="rp-drec-sec rp-droom-baseline" id="baseline">
              <h2>{resolved ? "Baseline at decision time" : "If we do nothing"}</h2>
              <div className="rp-droom-baseline-grid">
                <div>
                  <em>{noActionOption!.title}</em>
                  <strong>
                    {noActionOption!.expectedContributionEuro != null
                      ? formatDecisionMoney(noActionOption!.expectedContributionEuro)
                      : "€0"}
                  </strong>
                  <span>{noActionOption!.note ?? "Cost of doing nothing"}</span>
                </div>
                <div data-selected="true">
                  <em>Selected · {recommendedOption!.title}</em>
                  <strong data-semantic="positive">
                    {recommendedOption!.expectedContributionEuro != null
                      ? formatDecisionMoney(recommendedOption!.expectedContributionEuro)
                      : primary?.money ?? "—"}
                  </strong>
                  <span>Recommended path</span>
                </div>
                {recommendedOption!.expectedContributionEuro != null &&
                noActionOption!.expectedContributionEuro != null ? (
                  <div>
                    <em>Incremental</em>
                    <strong data-semantic="positive">
                      {formatDecisionMoney(
                        recommendedOption!.expectedContributionEuro -
                          noActionOption!.expectedContributionEuro,
                      )}
                    </strong>
                    <span>vs no action · modeled</span>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          <section className="rp-drec-sec rp-drec-policy" id="policy">
            <h2>Policy</h2>
            <p className="rp-drec-policy-line">
              <a href={settingsPolicyHref(policyRef.policyId)}>
                {policyRef.label}
              </a>
              <a
                className="rp-drec-policy-open"
                href={settingsPolicyHref()}
              >
                Open in Settings →
              </a>
            </p>
          </section>

          <section className="rp-drec-sec" id="actions">
            <h2>
              {resolved ? "What RADR prepared" : "Prepared for approval"}
            </h2>
            <p className="rp-drec-quiet">{record.actionPlan.payloadNote}</p>
            <ul className="rp-action-sheet">
              {record.actionPlan.steps.map((s) => (
                <li key={s.id} data-status={s.status}>
                  <span className="rp-action-sys">{s.provider}</span>
                  <strong className="rp-action-title">{s.title}</strong>
                  <span className="rp-action-st">
                    {s.preparedOnly ? "Prepared" : s.status}
                  </span>
                  {s.detail ? (
                    <em className="rp-action-detail">{s.detail}</em>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          {resolved ||
          record.outcomeDetail ||
          record.observedOutcome ||
          record.verifiedValue ? (
            <section className="rp-drec-sec" id="outcome">
              <h2>Outcome</h2>
              <p>
                {record.outcomeDetail?.summary ??
                  record.observedOutcome ??
                  (record.verifiedValue
                    ? `${formatDecisionMoney(record.verifiedValue.amount)} ${record.verifiedValue.kind}`
                    : resolved
                      ? "Observed after action"
                      : null)}
              </p>
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

          {resolved ||
          record.verificationDetail ||
          record.verifiedValue ? (
            <section className="rp-drec-sec" id="verify">
              <h2>Verification</h2>
              {primary ? (
                <p className="rp-drec-quiet">
                  <strong>{primary.money}</strong> {primary.caption}
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
                    {record.verificationDetail.attributionStrength ===
                    "MODELED"
                      ? " · outcome observed; economic attribution modeled rather than directly isolated"
                      : null}
                  </span>
                </p>
              ) : record.verifiedValue?.note?.includes("MODELED") ? (
                <p className="rp-attr" data-strength="MODELED">
                  <span className="rp-attr-label">Modeled attribution</span>
                  <span>
                    Outcome observed. Economic attribution is modeled rather
                    than directly isolated.
                  </span>
                </p>
              ) : null}
              {resolved && record.verifiedValue ? (
                <p className="rp-drec-quiet">
                  {formatDecisionMoney(record.verifiedValue.amount)} matched ·{" "}
                  {record.verifiedValue.note ??
                    record.verificationDetail?.comparedTo ??
                    "Evidence chain"}
                </p>
              ) : null}
            </section>
          ) : null}

          {record.lesson || record.playbookImpact ? (
            <section className="rp-drec-sec rp-droom-memory" id="memory">
              <h2>RADR learned</h2>
              {record.id === DECISION_IDS.peak ? (
                <p className="rp-droom-memory-lead">
                  This Decision matched comparable Friday services. Forecast
                  error narrowed 14.2% → 5.4%. Playbook updated · Friday Peak
                  Capacity V4.
                </p>
              ) : null}
              {record.lesson ? <p>{record.lesson}</p> : null}
              {record.playbookImpact ? (
                <p className="rp-drec-quiet">{record.playbookImpact}</p>
              ) : null}
              <Link href="/app/memory" className="rp-drec-secondary">
                Open Operating Memory
              </Link>
            </section>
          ) : null}

          <section className="rp-drec-sec rp-drec-deep" id="deep">
            <button
              type="button"
              className="rp-drec-disclose"
              onClick={() => setDeepOpen((v) => !v)}
              aria-expanded={deepOpen}
            >
              {deepOpen ? "Hide" : "Show"} evidence · constraints · context
            </button>
            {deepOpen ? (
              <div className="rp-drec-deep-body">
                <div id="evidence">
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
                </div>

                {record.constraints?.length ? (
                  <div id="constraints">
                    <h3>Constraints</h3>
                    <ul className="rp-drec-constraints">
                      {record.constraints.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div id="context">
                  <h3>Operator context</h3>
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
                </div>
              </div>
            ) : null}
          </section>

          {!hasReplay ? <DecisionReplay decisionId={record.id} /> : null}

          {record.id === DECISION_IDS.peak ||
          record.id === DECISION_IDS.tableRecover ? (
            <nav className="rp-drec-service-links" aria-label="Service intelligence">
              <p className="rp-drec-quiet">
                Physical capacity under this Decision
              </p>
              <div>
                <Link href="/app/service?view=floor">View floor plan</Link>
                <Link href="/app/service?view=timeline">View timeline</Link>
                <Link href="/app/service?view=recovery">
                  View recoverable demand
                </Link>
              </div>
            </nav>
          ) : null}
        </>
      )}

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
