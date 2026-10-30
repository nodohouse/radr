"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import {
  buildMemoryOverview,
  parseDnaId,
  parseLearningParam,
  parseMemoryPeriod,
  parseMemoryView,
  parsePlaybookId,
  seriesForPeriod,
  type MemoryPeriod,
  type MemoryView,
} from "@/lib/radr/product/memoryProofEngine";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { MemoryOverview } from "./MemoryOverview";
import { MemoryPlaybooks } from "./MemoryPlaybooks";
import { MemoryLearnings } from "./MemoryLearnings";
import { MemoryDna } from "./MemoryDna";
import { MemoryYear } from "./MemoryYear";
import "./memory-engine.css";

const VIEWS: { id: MemoryView; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "playbooks", label: "Playbooks" },
  { id: "learnings", label: "Learnings" },
  { id: "dna", label: "Operating DNA" },
  { id: "year", label: "Year on RADR" },
];

export function MemoryShell() {
  const router = useRouter();
  const pathname = usePathname() || "/app/memory";
  const search = useSearchParams();
  const { roleView } = useProduct();

  useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const view = parseMemoryView(search.get("view"));
  const period = parseMemoryPeriod(search.get("period"));
  const [learningFilter, setLearningFilter] = useState("All");
  const [learningQuery, setLearningQuery] = useState("");
  const [dnaLocation, setDnaLocation] = useState("all");
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [hypothesisOpen, setHypothesisOpen] = useState(false);
  const [modelPerfOpen, setModelPerfOpen] = useState(false);

  const base = useMemo(() => buildMemoryOverview(roleView), [roleView]);
  const model = useMemo(() => {
    const slice = seriesForPeriod(period, base.series);
    const last = slice[slice.length - 1]!;
    const first = slice[0]!;
    const improvementPct = Math.round(
      ((base.startError - last.error) / base.startError) * 100,
    );
    return {
      ...base,
      series: slice,
      currentError: last.error,
      sampleSize: last.n,
      uncertaintyLo: last.lo,
      uncertaintyHi: last.hi,
      improvementPct,
      deltaPp: Math.round((base.startError - last.error) * 10) / 10,
      whatChanged: {
        ...base.whatChanged,
        afterError: last.error,
        beforeError: period === "7d" ? first.error : base.whatChanged.beforeError,
      },
    };
  }, [base, period]);

  const playbookId = parsePlaybookId(search.get("playbook"), model.playbooks);
  const learningId = parseLearningParam(search.get("learning"), model.allLearnings);
  const dnaId = parseDnaId(search.get("dna"), model.dna);

  const pushState = useCallback(
    (patch: {
      view?: MemoryView;
      period?: MemoryPeriod;
      playbook?: string | null;
      learning?: string | null;
      dna?: string | null;
    }) => {
      const sp = new URLSearchParams(search.toString());
      if (patch.view !== undefined) {
        if (patch.view === "overview") sp.delete("view");
        else sp.set("view", patch.view);
      }
      if (patch.period !== undefined) {
        if (patch.period === "30d") sp.delete("period");
        else sp.set("period", patch.period);
      }
      if (patch.playbook !== undefined) {
        if (!patch.playbook) sp.delete("playbook");
        else sp.set("playbook", patch.playbook);
      }
      if (patch.learning !== undefined) {
        if (!patch.learning) sp.delete("learning");
        else {
          const row = model.allLearnings.find((l) => l.id === patch.learning);
          sp.set("learning", row?.displayId ?? patch.learning);
        }
      }
      if (patch.dna !== undefined) {
        if (!patch.dna) sp.delete("dna");
        else sp.set("dna", patch.dna);
      }
      const qs = sp.toString();
      // push (not replace) so browser back/forward works across Memory views
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, search, model.allLearnings],
  );

  const selectedLearning =
    model.allLearnings.find((l) => l.id === learningId) ?? null;

  return (
    <div className="me-root" data-memory-engine="true">
      <header className="me-page-head">
        <div>
          <h1>Operating Memory</h1>
          <p>Calibration · playbooks · learnings that compound</p>
        </div>
        <div className="me-page-actions">
          <button
            type="button"
            className="me-link"
            onClick={() => setModelPerfOpen(true)}
          >
            View model performance →
          </button>
          <button
            type="button"
            className="me-cta"
            onClick={() => setHypothesisOpen(true)}
          >
            + Add hypothesis
          </button>
        </div>
      </header>

      <nav className="me-views" aria-label="Memory perspective">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            data-active={view === v.id ? "true" : undefined}
            onClick={() =>
              pushState({
                view: v.id,
                playbook: v.id === "playbooks" ? playbookId : null,
                learning: v.id === "learnings" ? learningId : null,
                dna: v.id === "dna" ? dnaId : null,
              })
            }
          >
            {v.label}
          </button>
        ))}
      </nav>

      {view === "overview" ? (
        <MemoryOverview
          model={model}
          period={period}
          onPeriod={(p) => pushState({ period: p })}
          onOpenEvidence={() => setEvidenceOpen(true)}
          onViewLearnings={() => pushState({ view: "learnings" })}
          onViewDna={(id) =>
            pushState({ view: "dna", dna: id ?? model.dna[0]?.id ?? null })
          }
          onViewPlaybooks={() =>
            pushState({
              view: "playbooks",
              playbook: model.whatChanged.playbookId,
            })
          }
          onSelectLearning={(id) => {
            const row = model.allLearnings.find((l) => l.id === id);
            pushState({
              view: "learnings",
              learning: id,
            });
            void row;
          }}
          learningFilter={learningFilter}
          onLearningFilter={setLearningFilter}
        />
      ) : null}

      {view === "playbooks" ? (
        <MemoryPlaybooks
          playbooks={model.playbooks}
          selectedId={playbookId}
          onSelect={(id) => pushState({ view: "playbooks", playbook: id })}
        />
      ) : null}

      {view === "learnings" ? (
        <MemoryLearnings
          learnings={model.allLearnings}
          selectedId={learningId}
          onSelect={(id) =>
            pushState({ view: "learnings", learning: id })
          }
          domain={learningFilter}
          onDomain={setLearningFilter}
          query={learningQuery}
          onQuery={setLearningQuery}
        />
      ) : null}

      {view === "dna" ? (
        <MemoryDna
          patterns={model.dna}
          selectedId={dnaId}
          onSelect={(id) => pushState({ view: "dna", dna: id })}
          locationFilter={dnaLocation}
          onLocation={setDnaLocation}
        />
      ) : null}

      {view === "year" ? <MemoryYear year={model.year} /> : null}

      {evidenceOpen ? (
        <div
          className="me-modal"
          role="presentation"
          onClick={() => setEvidenceOpen(false)}
        >
          <div
            className="me-modal-card"
            role="dialog"
            aria-label="Playbook evolution evidence"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {model.whatChanged.title} · {model.whatChanged.fromVersion} →{" "}
              {model.whatChanged.toVersion}
            </h3>
            <p>
              <strong>Why</strong> — Kitchen pressure + inbound cover velocity
              repeatedly beat seat-first discretionary demand on Friday peaks.
            </p>
            <p>
              <strong>Evidence</strong> — {model.sampleSize} comparable services ·
              forecast error {model.whatChanged.beforeError}% →{" "}
              {model.whatChanged.afterError}% · Decision{" "}
              <Link href={model.whatChanged.evidenceHref}>
                {displayDecisionId(model.whatChanged.decisionId)}
              </Link>
              .
            </p>
            <p>
              <strong>How it evolved</strong> — V3 VIP seat exception → V4 LIVE
              adds workforce rebalance gate when kitchen ≥90% and inbound ≥30
              covers in &lt;25m.
            </p>
            <p>
              <strong>Honest miss link</strong> — Terrace soft-open (
              {model.missLearning.displayId}) taught weather-hold without inbound
              signal ranks lower.
            </p>
            <div className="me-modal-actions">
              <Link
                href={`/app/memory?view=playbooks&playbook=${model.whatChanged.playbookId}`}
                className="me-link"
              >
                Open playbook →
              </Link>
              <Link href={model.whatChanged.evidenceHref} className="me-link">
                Open source Decision →
              </Link>
              <button
                type="button"
                className="me-cta"
                onClick={() => setEvidenceOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {hypothesisOpen ? (
        <div
          className="me-modal"
          role="presentation"
          onClick={() => setHypothesisOpen(false)}
        >
          <div
            className="me-modal-card"
            role="dialog"
            aria-label="Add hypothesis"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Add hypothesis</h3>
            <p>
              Creates a <strong>candidate</strong> observation — not confirmed
              Memory. RADR validates, watches, and may promote later.
            </p>
            <label className="me-field">
              Observation
              <textarea
                rows={3}
                placeholder="What did you observe?"
                defaultValue=""
              />
            </label>
            <label className="me-field">
              Scope
              <input type="text" defaultValue="Soho · New York · Friday dinner" />
            </label>
            <div className="me-modal-actions">
              <button
                type="button"
                className="me-link"
                onClick={() => setHypothesisOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="me-cta"
                onClick={() => setHypothesisOpen(false)}
              >
                Save candidate
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modelPerfOpen ? (
        <div
          className="me-modal"
          role="presentation"
          onClick={() => setModelPerfOpen(false)}
        >
          <div
            className="me-modal-card"
            role="dialog"
            aria-label="Model performance"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Model performance · Friday peaks</h3>
            <p>
              Metric: <strong>{model.errorMetricLabel}</strong> —{" "}
              {model.errorMetricTooltip}
            </p>
            <dl className="me-lv-facts">
              <div>
                <dt>Current error</dt>
                <dd>{model.currentError}% · Improving</dd>
              </div>
              <div>
                <dt>Change</dt>
                <dd>−{model.deltaPp}pp vs starting model</dd>
              </div>
              <div>
                <dt>Within expected range</dt>
                <dd>
                  {Math.max(model.sampleSize - 2, 0)} of {model.sampleSize}{" "}
                  services
                </dd>
              </div>
              <div>
                <dt>Services analyzed</dt>
                <dd>{model.sampleSize}</dd>
              </div>
            </dl>
            <p>
              Uncertainty: {model.uncertaintyLo}% – {model.uncertaintyHi}%.{" "}
              {model.uncertaintyTooltip}
            </p>
            <div className="me-modal-actions">
              <Link href="/app/data-health" className="me-link">
                View Data Health →
              </Link>
              <button
                type="button"
                className="me-cta"
                onClick={() => setModelPerfOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Overview learning quick drawer when deep-linked while on overview */}
      {view === "overview" && selectedLearning ? (
        <div
          className="me-modal"
          role="presentation"
          onClick={() => pushState({ learning: null })}
        >
          <div
            className="me-modal-card"
            role="dialog"
            aria-label="Learning detail"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {selectedLearning.displayId} · {selectedLearning.domain}
            </h3>
            <p>{selectedLearning.statement}</p>
            {selectedLearning.fromMiss ? (
              <p>
                From honest miss — Expected{" "}
                {selectedLearning.expectedEuro != null
                  ? formatDecisionMoney(selectedLearning.expectedEuro)
                  : "—"}{" "}
                · Verified{" "}
                {selectedLearning.verifiedEuro != null
                  ? formatDecisionMoney(selectedLearning.verifiedEuro)
                  : "—"}
                .
              </p>
            ) : null}
            <div className="me-modal-actions">
              <Link href={selectedLearning.href} className="me-link">
                Source Decision →
              </Link>
              <button
                type="button"
                className="me-cta"
                onClick={() => pushState({ learning: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
