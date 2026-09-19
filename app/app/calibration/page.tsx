"use client";

import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import {
  calibrationSnapshot,
  judgmentMemoryStats,
} from "@/lib/radr/product/shiftIntelligence";
import { displayDecisionId } from "@/lib/radr/decision/ids";

/**
 * Calibration — evidence of Decision quality over time.
 * Not an AI accuracy score.
 */
export default function CalibrationPage() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const cal = calibrationSnapshot();
  const judgment = judgmentMemoryStats();
  const show =
    ctx.scopeType === "PORTFOLIO" ||
    ctx.scopeType === "GROUP" ||
    roleView === "gm" ||
    roleView === "cfo" ||
    roleView === "coo";

  if (!show) {
    return (
      <div className="rp-shift">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Calibration</p>
          <h1 className="rp-cc-title">Decision calibration</h1>
          <p className="rp-cc-since">Outside current role scope.</p>
        </header>
      </div>
    );
  }

  return (
    <div className="rp-shift rp-calibration">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Calibration</p>
        <h1 className="rp-cc-title">Was RADR right?</h1>
        <p className="rp-cc-since">
          Last {cal.sampleSize} verified Decisions · evidence-based · DEMO
          ILLUSTRATIVE · {ctx.shortLabel}
        </p>
      </header>

      <dl className="rp-value-exec-grid">
        <div>
          <strong>{cal.expectedRangeMet}</strong>
          <span>Expected range met</span>
        </div>
        <div>
          <strong>{cal.outsideExpectedRange}</strong>
          <span>Outside expected range</span>
        </div>
        <div>
          <strong>{cal.operatorContextChangedRec}</strong>
          <span>Context changed recommendation</span>
        </div>
        <div>
          <strong>{cal.contextImprovedOutcome}</strong>
          <span>Context improved outcome</span>
        </div>
        <div>
          <strong>{cal.recommendationsApproved}</strong>
          <span>Recommendations approved</span>
        </div>
        <div>
          <strong>{cal.alternativeSelected}</strong>
          <span>Alternative selected</span>
        </div>
      </dl>

      <section className="rp-drec-sec">
        <h2>Where RADR was wrong</h2>
        <p className="rp-drec-quiet">
          Trust requires showing miss — not pretending perfection
        </p>
        <ul className="rp-calib-wrong">
          {cal.wrongExamples.map((w) => (
            <li key={w.decisionId}>
              <Link href={`/app/decisions/${w.decisionId}`}>
                {displayDecisionId(w.decisionId)}
              </Link>
              <span>
                Expected {w.expected} · Actual {w.actual}
              </span>
              <em>{w.reason}</em>
            </li>
          ))}
        </ul>
        {cal.typesNeedingRecalibration.length ? (
          <p className="rp-drec-quiet">
            Types needing recalibration ·{" "}
            {cal.typesNeedingRecalibration.join(", ")}
          </p>
        ) : null}
      </section>

      <section className="rp-drec-sec">
        <h2>Judgment memory</h2>
        <p>
          {judgment.promptsAsked} prompts · {judgment.contextAdded} context
          added · {judgment.recommendationChanged} recommendations changed ·{" "}
          {judgment.outcomeImproved} outcomes improved
        </p>
        <p className="rp-shift-ask">{judgment.nextPrompt.question}</p>
        <p className="rp-drec-quiet">{judgment.nextPrompt.reason}</p>
        <Link href="/app/shift/pre#judgment" className="rp-drec-secondary">
          Open pre-shift judgment prompt
        </Link>
      </section>

      <p className="rp-drec-quiet">{cal.demoNote}</p>
    </div>
  );
}
