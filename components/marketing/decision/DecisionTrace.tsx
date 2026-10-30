"use client";

/**
 * Decision Trace — structured audit of how RADR reached a Decision.
 * No chain-of-thought. Epistemic grades explicit. Green reserved for Verified.
 */

import { useEffect, useId, useState } from "react";
import NextLink from "next/link";
import type {
  DecisionTraceRecord,
  EpistemicGrade,
} from "@/lib/marketing/decisionTrace/types";
import { euro } from "@/lib/marketing/publicDecisionEconomics";
import { EconomicValueTrace } from "./EconomicValueTrace";
import { ProvenanceSequence } from "./ProvenanceSequence";
import { SourceDisagreement } from "./SourceDisagreement";
import "@/app/radr-public.css";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "evidence", label: "Evidence" },
  { id: "calculation", label: "Calculation" },
  { id: "baseline", label: "Baseline" },
  { id: "futures", label: "Futures" },
  { id: "constraints", label: "Constraints" },
  { id: "rationale", label: "Rationale" },
  { id: "action", label: "Action" },
  { id: "outcome", label: "Outcome" },
  { id: "verification", label: "Verification" },
  { id: "memory", label: "Memory" },
  { id: "audit", label: "Audit" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

type Props = {
  trace: DecisionTraceRecord;
  compact?: boolean;
  className?: string;
  /** When true, render all sections as a scroll document with left rail. */
  documentMode?: boolean;
};

function Grade({ g }: { g?: EpistemicGrade }) {
  if (!g) return null;
  return (
    <span className="rx-dt-grade" data-g={g}>
      {g.replace("_", " ")}
    </span>
  );
}

function TrustSummary({ trace }: { trace: DecisionTraceRecord }) {
  return (
    <dl className="rx-dt-trust">
      {trace.confidence.dimensions.map((d) => (
        <div key={d.label}>
          <dt>{d.label}</dt>
          <dd>{d.level}</dd>
        </div>
      ))}
      <div>
        <dt>Verification strength</dt>
        <dd data-tone={trace.verification.strength === "STRONG" ? "verified" : undefined}>
          {trace.verification.strength}
        </dd>
      </div>
    </dl>
  );
}

function TraceSections({
  trace,
  sectionFilter,
}: {
  trace: DecisionTraceRecord;
  sectionFilter?: SectionId;
}) {
  const show = (id: SectionId) => !sectionFilter || sectionFilter === id;
  const isVerified = trace.state === "VERIFIED";

  return (
    <>
      {show("overview") ? (
        <section
          className="rx-dt-block rx-anchor-target"
          id="trace-overview"
          data-sec="overview"
          tabIndex={-1}
        >
          <p className="rx-dt-k">Why RADR surfaced this</p>
          <p className="rx-dt-lead">{trace.whySurfaced}</p>
          <p className="rx-dt-k">Trust summary</p>
          <TrustSummary trace={trace} />
          <p className="rx-dt-k">Evidence → verification</p>
          <ProvenanceSequence steps={trace.provenanceSequence} />
          <p className="rx-dt-k">Method</p>
          <p>
            {trace.method.classLabel}
            {trace.method.predictiveModelUsed
              ? ` · ${trace.method.modelVersion ?? "model"}`
              : " · deterministic"}
            {trace.method.generativeEconomicsUsed
              ? ""
              : " · generative model not used for economics"}
          </p>
          <ul className="rx-dt-list">
            {trace.method.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {trace.materiality ? (
            <>
              <p className="rx-dt-k">Materiality</p>
              <p>
                {trace.materiality.ruleLabel}: {euro(trace.materiality.observedEuro)}{" "}
                {trace.materiality.triggered ? ">" : "≤"}{" "}
                {euro(trace.materiality.thresholdEuro)} threshold
                {trace.materiality.triggered ? " · triggered" : ""}
              </p>
            </>
          ) : null}
        </section>
      ) : null}

      {show("evidence") ? (
        <section
          className="rx-dt-evidence rx-anchor-target"
          id="trace-evidence"
          data-sec="evidence"
          tabIndex={-1}
        >
          <p className="rx-dt-k">Evidence</p>
          {trace.evidence.map((e) => (
            <div key={e.id} className="rx-dt-card">
              <p className="rx-dt-k">
                {e.kind} · {e.title}
              </p>
              <ul className="rx-dt-fields">
                {e.fields.map((f) => (
                  <li key={f.label}>
                    <span>{f.label}</span>
                    <strong>{f.value}</strong>
                    <Grade g={f.grade} />
                  </li>
                ))}
              </ul>
              <details className="rx-dt-details">
                <summary>Provenance</summary>
                <p className="rx-dt-prov">
                  Source: {e.provenance.sourceSystem} · {e.provenance.method}
                  <br />
                  Freshness: {e.provenance.freshness}
                  {e.provenance.importedAt
                    ? ` · Imported ${e.provenance.importedAt}`
                    : ""}
                  <br />
                  {e.provenance.location} · {e.provenance.entityId}
                  <Grade g={e.provenance.grade} />
                </p>
              </details>
            </div>
          ))}
          {trace.sourceDisagreement ? (
            <SourceDisagreement data={trace.sourceDisagreement} />
          ) : null}
        </section>
      ) : null}

      {show("calculation") ? (
        <section
          className="rx-dt-block rx-anchor-target"
          id="trace-calculation"
          data-sec="calculation"
          tabIndex={-1}
        >
          <p className="rx-dt-k">{trace.calculation.title}</p>
          <EconomicValueTrace
            amountLabel={trace.calculation.result.value}
            formula={trace.calculation.formulaHuman}
            sources={trace.evidence.slice(0, 2).map((e) => e.id)}
            grade={trace.calculation.result.grade}
            verified={isVerified && trace.outcome.kind === "FULL_SUCCESS"}
          />
          <ul className="rx-dt-fields">
            {trace.calculation.steps.map((s) => (
              <li key={s.label}>
                <span>{s.label}</span>
                <strong>{s.value}</strong>
                <Grade g={s.grade} />
              </li>
            ))}
            <li data-result="true">
              <span>{trace.calculation.result.label}</span>
              <strong>{trace.calculation.result.value}</strong>
              <Grade g={trace.calculation.result.grade} />
            </li>
          </ul>
          <p className="rx-dt-k">Checked explanations</p>
          <ul className="rx-dt-list">
            {trace.calculation.excluded.map((x) => (
              <li key={x.label}>
                {x.label}: {x.value}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("baseline") ? (
        <section className="rx-dt-block" id="trace-baseline" data-sec="baseline">
          <p className="rx-dt-k">{trace.baseline.title}</p>
          <p className="rx-dt-lead">{trace.baseline.outcome}</p>
          <p>
            Economic result versus contracted terms:{" "}
            <strong>{trace.baseline.economicLabel}</strong>
          </p>
          <p className="rx-dt-prov">
            Baseline type: {trace.baseline.type.toUpperCase()} · Source:{" "}
            {trace.baseline.source} · Confidence: {trace.baseline.confidence}
          </p>
        </section>
      ) : null}

      {show("futures") ? (
        <section
          className="rx-dt-futures rx-anchor-target"
          id="trace-futures"
          data-sec="futures"
          tabIndex={-1}
        >
          <p className="rx-dt-k">Futures compared</p>
          {trace.futures.map((f) => (
            <div
              key={f.id}
              className="rx-dt-card"
              data-selected={f.selected ? "true" : undefined}
            >
              <p className="rx-dt-k">
                {f.title}
                {f.selected ? " · Selected" : ""}
              </p>
              <p>
                <strong>{f.expectedLabel}</strong>
              </p>
              <p className="rx-dt-prov">
                Effort: {f.effort} · Confidence: {f.confidence}
              </p>
              {f.note ? <p>{f.note}</p> : null}
            </div>
          ))}
          <p className="rx-dt-k">Why this Future was recommended</p>
          <ul className="rx-dt-list rx-dt-checks">
            {trace.selectedBecause.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("constraints") ? (
        <section className="rx-dt-block" id="trace-constraints" data-sec="constraints">
          <p className="rx-dt-k">Constraints</p>
          <ul className="rx-dt-fields">
            {trace.constraints.map((c) => (
              <li key={c.label}>
                <span>{c.label}</span>
                <strong>{c.value}</strong>
              </li>
            ))}
          </ul>
          <p className="rx-dt-k">Policy</p>
          <p>
            Allowed: {trace.policy.allowed.join(" · ")}
            <br />
            Requires approval: {trace.policy.requiresApproval.join(" · ")}
            <br />
            Not allowed: {trace.policy.notAllowed.join(" · ")}
            <br />
            Approval owner: <strong>{trace.policy.approvalOwner}</strong>
          </p>
          {trace.operatorContext ? (
            <>
              <p className="rx-dt-k">Operator context</p>
              <blockquote className="rx-dt-quote">
                “{trace.operatorContext.text}”
              </blockquote>
              <p className="rx-dt-prov">
                {trace.operatorContext.addedBy} · {trace.operatorContext.at}
                <br />
                Effect: {trace.operatorContext.effect}
                {trace.operatorContext.confidenceBefore &&
                trace.operatorContext.confidenceAfter
                  ? ` · Confidence ${trace.operatorContext.confidenceBefore} → ${trace.operatorContext.confidenceAfter}`
                  : ""}
              </p>
            </>
          ) : null}
          <p className="rx-dt-k">Data quality</p>
          <p>
            {trace.dataQuality.requiredPresent} · Overall:{" "}
            <strong>{trace.dataQuality.overall}</strong>
          </p>
          <ul className="rx-dt-list">
            {trace.dataQuality.items.map((i) => (
              <li key={i.label}>
                {i.label}: {i.state}
              </li>
            ))}
          </ul>
          {trace.dataQuality.missing.length > 0 ||
          trace.dataQuality.unknowns.length > 0 ? (
            <>
              <p className="rx-dt-k">What we do not know</p>
              <ul className="rx-dt-list">
                {[...trace.dataQuality.missing, ...trace.dataQuality.unknowns].map(
                  (m) => (
                    <li key={m}>{m}</li>
                  ),
                )}
              </ul>
            </>
          ) : (
            <p className="rx-dt-prov">No material unknowns for this Decision.</p>
          )}
        </section>
      ) : null}

      {show("rationale") ? (
        <section className="rx-dt-block" id="trace-rationale" data-sec="rationale">
          <p className="rx-dt-k">Why RADR recommends this</p>
          <ol className="rx-dt-olist">
            {trace.rationale.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <p className="rx-dt-k">What could change this recommendation?</p>
          <ul className="rx-dt-list">
            {trace.whatCouldChange.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="rx-dt-k">
            Recommendation confidence · {trace.confidence.overall}
          </p>
          <ul className="rx-dt-fields">
            {trace.confidence.dimensions.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                <strong>{d.level}</strong>
              </li>
            ))}
          </ul>
          <ul className="rx-dt-list">
            {trace.confidence.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("action") ? (
        <section className="rx-dt-block" id="trace-action" data-sec="action">
          <p className="rx-dt-k">What RADR did</p>
          <ul className="rx-dt-list">
            {trace.action.preview.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="rx-dt-k">{trace.action.name}</p>
          <ul className="rx-dt-fields">
            <li>
              <span>Prepared</span>
              <strong>{trace.action.preparedAt}</strong>
            </li>
            <li>
              <span>Approved</span>
              <strong>
                {trace.action.approvedBy} · {trace.action.approvedAt}
              </strong>
            </li>
            <li>
              <span>Sent</span>
              <strong>{trace.action.sentAt}</strong>
            </li>
            <li>
              <span>Recipient</span>
              <strong>{trace.action.recipient}</strong>
            </li>
            <li>
              <span>Evidence attached</span>
              <strong>{trace.action.evidenceAttached.join(" · ")}</strong>
            </li>
            <li>
              <span>Status</span>
              <strong>{trace.action.status}</strong>
            </li>
          </ul>
        </section>
      ) : null}

      {show("outcome") ? (
        <section className="rx-dt-block" id="trace-outcome" data-sec="outcome">
          <p className="rx-dt-k">Outcome · {trace.outcome.kind.replace(/_/g, " ")}</p>
          <ul className="rx-dt-fields">
            <li>
              <span>Expected</span>
              <strong>{trace.outcome.expectedLabel}</strong>
            </li>
            <li>
              <span>Observed</span>
              <strong>{trace.outcome.observedLabel}</strong>
            </li>
            <li>
              <span>Difference</span>
              <strong>{trace.outcome.differenceLabel}</strong>
            </li>
          </ul>
          {trace.outcome.missReason ? (
            <p className="rx-dt-lead">{trace.outcome.missReason}</p>
          ) : null}
          <p className="rx-dt-k">Attribution</p>
          <ul className="rx-dt-list">
            <li>Without RADR: {trace.attribution.withoutRadr}</li>
            <li>RADR action: {trace.attribution.radrAction}</li>
            <li>Observed: {trace.attribution.observed}</li>
            <li>
              Competing explanation: {trace.attribution.competingExplanation}
            </li>
            <li>
              Attributed: {euro(trace.attribution.attributedEuro)} · Verified:{" "}
              {euro(trace.attribution.verifiedEuro)}
            </li>
          </ul>
        </section>
      ) : null}

      {show("verification") ? (
        <section
          className="rx-dt-block"
          id="trace-verification"
          data-sec="verification"
        >
          <p
            className="rx-dt-verified"
            data-tone={
              trace.verification.verifiedEuro > 0 ? "verified" : "none"
            }
          >
            {trace.verification.verifiedLabel}
          </p>
          <p className="rx-dt-k">
            Verification strength · {trace.verification.strength}
          </p>
          <ul className="rx-dt-fields">
            {trace.verification.proof.map((p) => (
              <li key={p.label}>
                <span>{p.label}</span>
                <strong>{p.value}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {show("memory") ? (
        <section className="rx-dt-block" id="trace-memory" data-sec="memory">
          <p className="rx-dt-k">What RADR learned</p>
          <ul className="rx-dt-list">
            {trace.memory.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <p className="rx-dt-prov">
            Based on: {trace.memory.basedOnDecisionIds.join(" · ")}
            {trace.memory.playbookUpdated ? " · Playbook updated" : ""}
          </p>
        </section>
      ) : null}

      {show("audit") ? (
        <section className="rx-dt-block" id="trace-audit" data-sec="audit">
          <p className="rx-dt-k">Versions</p>
          <ul className="rx-dt-list">
            {trace.versions.map((v) => (
              <li key={v.version}>
                v{v.version} · {v.at} — {v.summary}
              </li>
            ))}
          </ul>
          <p className="rx-dt-k">Change log</p>
          <ul className="rx-dt-audit">
            {trace.audit.map((a, i) => (
              <li key={`${a.at}-${i}`}>
                <em>{a.at}</em>
                <span>{a.actor}</span>
                <strong>{a.text}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export function DecisionTrace({
  trace,
  compact = false,
  className = "",
  documentMode = false,
}: Props) {
  const [section, setSection] = useState<SectionId>("overview");
  const baseId = useId();
  const isVerified = trace.state === "VERIFIED";
  const useDocument = documentMode || !compact;

  useEffect(() => {
    function go() {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw.startsWith("trace-")) return;
      const el = document.getElementById(raw);
      if (!el) return;
      const sec = raw.replace(/^trace-/, "") as SectionId;
      if (SECTIONS.some((s) => s.id === sec)) setSection(sec);
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (el instanceof HTMLElement) {
        el.focus({ preventScroll: true });
        el.classList.add("rx-anchor-flash");
        window.setTimeout(() => el.classList.remove("rx-anchor-flash"), 1600);
      }
    }
    const t = window.setTimeout(go, 40);
    window.addEventListener("hashchange", go);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("hashchange", go);
    };
  }, []);

  return (
    <article
      className={`rx-dt ${compact ? "rx-dt--compact" : "rx-dt--full"} ${className}`.trim()}
      aria-label={`Decision Trace ${trace.displayId}`}
    >
      <header className="rx-dt-head">
        <div>
          <p
            className="rx-dt-hero-euro"
            data-tone={
              isVerified && trace.headlineEuro > 0 ? "verified" : undefined
            }
          >
            {euro(trace.headlineEuro)}
          </p>
          <p className="rx-dt-hero-label">{trace.headlineLabel}</p>
          <p className="rx-dt-id">
            {trace.displayId} · {trace.location.toUpperCase()} ·{" "}
            {trace.classLabel.toUpperCase()}
          </p>
          <p className="rx-dt-state" data-tone={isVerified ? "verified" : undefined}>
            {trace.stateLabel}
          </p>
          <h3 className="rx-dt-title">Why this Decision</h3>
          <p className="rx-dt-why">{trace.whySurfaced}</p>
        </div>
        <dl className="rx-dt-meta">
          <div>
            <dt>State</dt>
            <dd data-tone={isVerified ? "verified" : undefined}>{trace.state}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{trace.owner}</dd>
          </div>
          <div>
            <dt>Deadline</dt>
            <dd>{trace.deadline}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{trace.confidenceLabel}</dd>
          </div>
          <div>
            <dt>Evidence</dt>
            <dd>{trace.evidenceQuality}</dd>
          </div>
          <div>
            <dt>Currency</dt>
            <dd>{trace.reportingCurrency}</dd>
          </div>
        </dl>
      </header>

      {useDocument ? (
        <div className="rx-dt-layout">
          <nav className="rx-dt-rail" aria-label="Trace sections">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#trace-${s.id}`}
                className="rx-dt-rail-link"
                onClick={(e) => {
                  if (compact) {
                    e.preventDefault();
                    setSection(s.id);
                  }
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <div className="rx-dt-doc">
            {compact ? (
              <TraceSections trace={trace} sectionFilter={section} />
            ) : (
              <TraceSections trace={trace} />
            )}
          </div>
        </div>
      ) : (
        <>
          <nav className="rx-dt-nav" aria-label="Trace sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                id={`${baseId}-tab-${s.id}`}
                aria-selected={section === s.id}
                data-on={section === s.id ? "true" : undefined}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div
            className="rx-dt-body"
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${section}`}
          >
            <TraceSections trace={trace} sectionFilter={section} />
          </div>
        </>
      )}

      <p className="rx-dt-note">{trace.disclosure}</p>
    </article>
  );
}

type ToggleProps = {
  trace: DecisionTraceRecord;
  label?: string;
};

export function DecisionTraceToggle({
  trace,
  label = "View Trace",
}: ToggleProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const fullHref = `/product/decisions/${trace.displayId}/trace`;

  useEffect(() => {
    function syncHash() {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#decision-trace-d4102") {
        setOpen(true);
      }
    }
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="rx-dt-toggle" id="decision-trace-d4102">
      <div className="rx-dt-toggle-row">
        <button
          type="button"
          className="rx-dt-open"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide Trace" : label}{" "}
          <span aria-hidden="true">{open ? "↑" : "→"}</span>
        </button>
        <NextLink href={fullHref} className="rx-dt-full-link">
          Full Trace <span aria-hidden="true">→</span>
        </NextLink>
      </div>
      {open ? (
        <div id={panelId}>
          <DecisionTrace trace={trace} compact />
        </div>
      ) : null}
    </div>
  );
}
