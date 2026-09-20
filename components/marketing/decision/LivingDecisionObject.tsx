"use client";

import { useEffect, useState } from "react";
import {
  CANON_PEAK,
  formatCanonVariance,
  canonRecommended,
  canonScenario,
  expectedMetricLabel,
  verifiedEuro,
  verifiedMetricLabel,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import {
  useReducedMotionSafe,
  useDocumentVisible,
} from "@/components/marketing/motion/useReducedMotionSafe";

export type LivingPhase =
  | "recommended"
  | "verified"
  | "learned"
  | "structural";

const PHASE_ORDER: LivingPhase[] = [
  "recommended",
  "verified",
  "learned",
  "structural",
];

const PHASE_MS = 9000;

type Props = {
  autoPlay?: boolean;
  className?: string;
};

/**
 * ONE Decision object (D-1911) from canonical demo data.
 * Same ID. Same economics. Morphing lifecycle.
 */
export function LivingDecisionObject({
  autoPlay = true,
  className = "",
}: Props) {
  const d = CANON_PEAK;
  const rec = canonRecommended(d);
  const seat = canonScenario(d, "seat_now");
  const reduced = useReducedMotionSafe();
  const visible = useDocumentVisible();
  const [phase, setPhase] = useState<LivingPhase>("recommended");
  const [traceOpen, setTraceOpen] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || reduced || !visible || paused || traceOpen) return;
    const id = window.setInterval(() => {
      setPhase((p) => {
        const i = PHASE_ORDER.indexOf(p);
        return PHASE_ORDER[(i + 1) % PHASE_ORDER.length]!;
      });
    }, PHASE_MS);
    return () => window.clearInterval(id);
  }, [autoPlay, reduced, visible, paused, traceOpen]);

  return (
    <article
      className={`rx-live-dec ${className}`.trim()}
      data-phase={phase}
      data-id={d.id}
      data-display={d.displayId}
    >
      <header className="rx-live-dec-head">
        <p className="rx-live-dec-id">
          Decision {d.displayId}
          <span aria-hidden="true"> · </span>
          {phase === "recommended"
            ? "Pre-shift"
            : phase === "verified"
              ? "After service"
              : phase === "learned"
                ? "Learned"
                : "Structural"}
        </p>
        <div className="rx-live-dec-phases" role="tablist" aria-label="Lifecycle">
          {PHASE_ORDER.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              className="rx-live-dec-phase"
              aria-selected={phase === p}
              data-on={phase === p ? "true" : "false"}
              onClick={() => {
                setPaused(true);
                setPhase(p);
              }}
            >
              {p === "recommended"
                ? "Decide"
                : p === "verified"
                  ? "Verify"
                  : p === "learned"
                    ? "Learn"
                    : "Pattern"}
            </button>
          ))}
        </div>
      </header>

      <div className="rx-live-dec-body" key={phase}>
        {phase === "recommended" ? (
          <>
            <p className="rx-live-dec-status">Recommended</p>
            <h3 className="rx-live-dec-title">
              {d.problemLine.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h3>
            <div className="rx-live-dec-econ">
              <div>
                <strong>{formatDecisionMoney(d.exposureEuro)}</strong>
                <span>at risk</span>
              </div>
              <div>
                <strong>{d.deadline}</strong>
                <span>decide by</span>
              </div>
              {d.selloutAt ? (
                <div>
                  <strong>{d.selloutAt}</strong>
                  <span>expected sellout</span>
                </div>
              ) : null}
            </div>
            <p className="rx-live-dec-rec-label">
              RADR modeled {d.scenarios.length} responses · recommends
            </p>
            <p className="rx-live-dec-rec">
              {rec.title}.
              <br />
              <span>Delivery throttle · feature fast dish prepared.</span>
            </p>
            <ul className="rx-live-dec-scenarios">
              {d.scenarios
                .filter((s) => !s.isNoAction)
                .map((s) => (
                  <li key={s.id} data-rec={s.recommended ? "true" : "false"}>
                    <span>{s.title}</span>
                    <strong>
                      {formatDecisionMoney(s.expectedContributionEuro ?? 0)}
                    </strong>
                  </li>
                ))}
            </ul>
            <div className="rx-live-dec-econ">
              <div data-tone="protected">
                <strong>
                  {formatDecisionMoney(d.expectedProtectedEuro)}
                </strong>
                <span>
                  {expectedMetricLabel(d).toLowerCase()} · chosen scenario
                </span>
              </div>
            </div>
            <button
              type="button"
              className="rx-live-dec-cta"
              onClick={() => {
                setPaused(true);
                setPhase("verified");
              }}
            >
              Approve plan
            </button>
          </>
        ) : null}

        {phase === "verified" ? (
          <>
            <p className="rx-live-dec-status">Verified</p>
            <h3 className="rx-live-dec-title">Same decision. Outcome proven.</h3>
            <div className="rx-live-dec-econ">
              <div data-tone="protected">
                <strong>
                  {formatDecisionMoney(verifiedEuro(d))}
                </strong>
                <span>{verifiedMetricLabel(d).toLowerCase()}</span>
              </div>
            </div>
            <dl className="rx-live-dec-dl">
              <div>
                <dt>Chosen scenario</dt>
                <dd>{rec.title}</dd>
              </div>
              <div>
                <dt>Expected</dt>
                <dd>{formatDecisionMoney(d.expectedProtectedEuro)}</dd>
              </div>
              <div>
                <dt>Actual</dt>
                <dd>{formatDecisionMoney(d.actualProtectedEuro)}</dd>
              </div>
              <div>
                <dt>Forecast variance</dt>
                <dd>{formatCanonVariance(d)}</dd>
              </div>
              <div>
                <dt>Alt scenario (not chosen)</dt>
                <dd>
                  {seat
                    ? `${formatDecisionMoney(seat.expectedContributionEuro ?? 0)} seat-now`
                    : "—"}
                </dd>
              </div>
            </dl>
            <p className="rx-live-dec-verify-mark">
              VERIFIED · {d.verificationSources.join(" · ")}
            </p>
          </>
        ) : null}

        {phase === "learned" ? (
          <>
            <p className="rx-live-dec-status">Learned</p>
            <h3 className="rx-live-dec-title">{d.learning.lesson}</h3>
            <dl className="rx-live-dec-dl">
              <div>
                <dt>Expected</dt>
                <dd>{formatDecisionMoney(d.expectedProtectedEuro)}</dd>
              </div>
              <div>
                <dt>Actual</dt>
                <dd>{formatDecisionMoney(d.actualProtectedEuro)}</dd>
              </div>
              {d.learning.predictedConversionPct != null ? (
                <div>
                  <dt>Substitution conversion</dt>
                  <dd>
                    predicted {d.learning.predictedConversionPct}% · actual{" "}
                    {d.learning.actualConversionPct}%
                  </dd>
                </div>
              ) : null}
            </dl>
            <div className="rx-live-dec-playbook">
              <p className="rx-live-dec-rec-label">Playbook updated</p>
              <p>
                <span className="rx-live-dec-strike">
                  {d.learning.playbookFrom}
                </span>
              </p>
              <p>
                <strong>{d.learning.playbookTo}</strong>
              </p>
              <p className="rx-live-dec-quiet">{d.learning.nextTimeImpact}</p>
            </div>
            <p className="rx-live-dec-moment">
              Every verified outcome makes the next decision better.
            </p>
          </>
        ) : null}

        {phase === "structural" && d.structural ? (
          <>
            <p className="rx-live-dec-status">This is no longer an exception</p>
            <h3 className="rx-live-dec-title">Peak capacity · Decision debt</h3>
            <div className="rx-live-dec-econ">
              <div>
                <strong>{d.structural.incidents}</strong>
                <span>of last {d.structural.window} peak services</span>
              </div>
              <div>
                <strong>
                  {formatDecisionMoney(d.structural.cumulativeExposureEuro)}
                </strong>
                <span>cumulative exposure</span>
              </div>
              <div>
                <strong>{d.structural.temporaryFixes}</strong>
                <span>temporary interventions</span>
              </div>
            </div>
            <p className="rx-live-dec-rec-label">Structural decision</p>
            <p className="rx-live-dec-rec">{d.structural.recommendation}</p>
            <p className="rx-live-dec-quiet">
              Incident → pattern → decision debt · {d.structural.displayId}
            </p>
          </>
        ) : null}
      </div>

      <footer className="rx-live-dec-foot">
        <button
          type="button"
          className="rx-live-dec-trace-btn"
          aria-expanded={traceOpen}
          onClick={() => {
            setPaused(true);
            setTraceOpen((o) => !o);
          }}
        >
          Decision Trace
        </button>
        {traceOpen ? (
          <ol className="rx-live-dec-trace">
            <li>
              <time>18:42</time>
              <span>Peak collision detected · floor open · kitchen tight</span>
            </li>
            <li>
              <time>18:43</time>
              <span>
                €{d.exposureEuro.toLocaleString("en-GB")} vs seat-now modeled
              </span>
              <em>{formatDecisionMoney(d.exposureEuro)}</em>
            </li>
            <li>
              <time>18:44</time>
              <span>
                {d.scenarios.length} paths simulated ·{" "}
                {rec.title} recommended (
                {formatDecisionMoney(d.expectedProtectedEuro)})
              </span>
            </li>
            <li>
              <time>18:46</time>
              <span>GM approved · chosen {d.chosenScenarioId}</span>
            </li>
            <li>
              <time>22:40</time>
              <span>Outcome verified</span>
              <em>{formatDecisionMoney(d.actualProtectedEuro)}</em>
            </li>
            <li>
              <time>23:05</time>
              <span>Playbook updated · {d.learning.playbookTo}</span>
            </li>
          </ol>
        ) : null}
      </footer>
    </article>
  );
}
