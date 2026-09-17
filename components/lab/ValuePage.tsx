"use client";

import { formatEuro } from "@/lib/lab/format";
import { getPulseModel } from "@/lib/lab/pulse";
import { WIN_LOSS } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";
import { ACTIVE_EXPOSURE, VALUE_LADDER, VALUE_LINES, VERIFIED_TOTAL } from "@/lib/lab/value";
import { ShiftPulseGraph } from "./ShiftPulseGraph";
import { StoryCard } from "./StoryCard";

const BANDS = [
  ["verified", "Verified"],
  ["active", "Active"],
  ["pending", "Pending"],
  ["trace", "Trace"],
] as const;

export function ValuePage() {
  const { nav, state, setValueBand, setSeed, goCenter } = useLab();
  const band = nav.valueBand;
  const lines = VALUE_LINES.filter((l) =>
    band === "trace" ? false : band === "verified" ? l.band === "verified" : l.band === band,
  );
  const pulse = getPulseModel(state.seed, state.pulseWindow);

  const headline =
    band === "active"
      ? { money: formatEuro(ACTIVE_EXPOSURE), label: "Active exposure", grade: "Expected", because: "Open Decisions still deciding — not Verified" }
      : band === "pending"
        ? { money: formatEuro(640), label: "Pending verification", grade: "Expected", because: "Observed · waiting attribution / ledger match" }
        : { money: formatEuro(VERIFIED_TOTAL), label: "Verified Value", grade: "Verified", because: "Trace sealed · book-matchable" };

  return (
    <div className="lab-viewport lab-value">
      <header className="lab-surf-head">
        <div>
          <p className="lab-k">Value</p>
          <h1 className="lab-surf-title">Tonight / 24h · money truth</h1>
          <p className="lab-surf-sub">Expected stays Expected until Trace seals</p>
        </div>
      </header>

      <ShiftPulseGraph compact model={pulse} />

      <div className="lab-winloss lab-value-winloss">
        {WIN_LOSS.map((w) => (
          <article key={w.kind} className="lab-winloss-card" data-kind={w.kind}>
            <em>{w.kind === "win" ? "Where we protected" : "Where we leak"}</em>
            <strong>
              {formatEuro(w.euro)} {w.grade}
            </strong>
            <p>because {w.because}</p>
          </article>
        ))}
      </div>

      <div className="lab-value-flow" aria-label="Value flow">
        {VALUE_LADDER.map((step, i) => (
          <button
            key={step.id}
            type="button"
            className="lab-value-flow-step"
            data-on={
              (step.id === "verified" && band === "verified") ||
              ((step.id === "expected" || step.id === "identified") && band === "active") ||
              ((step.id === "observed" || step.id === "attributed") && band === "pending") ||
              undefined
            }
            onClick={() => {
              if (step.id === "verified") setValueBand("verified");
              else if (step.id === "expected" || step.id === "identified") setValueBand("active");
              else setValueBand("pending");
            }}
          >
            <em>{step.label}</em>
            <span>{step.because}</span>
            {i < VALUE_LADDER.length - 1 ? <i aria-hidden="true">→</i> : null}
          </button>
        ))}
      </div>

      <div className="lab-value-bands" role="tablist">
        {BANDS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={band === id}
            data-on={band === id || undefined}
            onClick={() => setValueBand(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {band === "trace" ? (
        <div className="lab-trace">
          <article className="lab-story">
            <em>D-1842</em>
            <h3>Tuna shortfall · sealed</h3>
            <p className="lab-story-euro" data-grade="Verified">
              <strong>{formatEuro(1590)}</strong>
              <span>Verified</span>
            </p>
            <p className="lab-story-because">because POS close + stock adjustment matched</p>
          </article>
          <article className="lab-story">
            <em>D-4102</em>
            <h3>INV-88421 · CM-DRAFT</h3>
            <p className="lab-story-euro" data-grade="Expected">
              <strong>{formatEuro(273)}</strong>
              <span>Expected</span>
            </p>
            <p className="lab-story-because">because credit memo not posted — no Trace seal, no Verified</p>
          </article>
          <p className="lab-value-law">No Trace = no Verified on that line.</p>
        </div>
      ) : (
        <>
          <p className="lab-value-primary">
            <strong>{headline.money}</strong>
            <span>{headline.label}</span>
            <em data-grade={headline.grade}>{headline.grade}</em>
          </p>
          <p className="lab-value-primary-because">because {headline.because}</p>
          <div className="lab-story-grid">
            {lines.map((line) => (
              <StoryCard
                key={line.id}
                displayId={line.displayId}
                title={line.title}
                euro={line.euro}
                grade={line.grade}
                because={line.because}
                cta="Why + Futures"
                onCta={() => {
                  if (line.seed) {
                    setSeed(line.seed);
                    goCenter(line.seed);
                  }
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
