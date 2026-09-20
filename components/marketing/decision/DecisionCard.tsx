"use client";

import { useState } from "react";
import Image from "next/image";
import type { Decision, DecisionCardState, DecisionOption } from "@/lib/radr/decision/core";
import {
  formatDecisionMoney,
  moneyCaption,
  verifiedCaption,
} from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";

type Props = {
  decision: Decision;
  state: DecisionCardState;
  onStateChange?: (next: DecisionCardState) => void;
  compact?: boolean;
  showImage?: boolean;
  className?: string;
  defaultSimOpen?: boolean;
};

/**
 * One Decision Object. Why + Simulate + Approve on the card.
 * Approve never pretends to write PMS/POS.
 */
export function DecisionCard({
  decision,
  state,
  onStateChange,
  compact = false,
  showImage = true,
  className = "",
  defaultSimOpen = false,
}: Props) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [simOpen, setSimOpen] = useState(
    defaultSimOpen || state === "SIMULATE",
  );
  const [selected, setSelected] = useState<string>(
    decision.options?.find((o) => o.recommended)?.id ??
      decision.options?.[0]?.id ??
      "",
  );
  const [toast, setToast] = useState<string | null>(null);

  const isApproved = state === "APPROVED" || state === "VERIFIED";
  const isVerified = state === "VERIFIED" || decision.status === "verified";
  const showSim = (simOpen || state === "SIMULATE") && !!decision.options?.length;

  const activeOption: DecisionOption | undefined = decision.options?.find(
    (o) => o.id === selected,
  );

  const approve = () => {
    onStateChange?.("APPROVED");
    setSimOpen(false);
    setToast(decision.payloadNote);
    window.setTimeout(() => setToast(null), 4200);
  };

  return (
    <article
      className={`rx-dc ${className}`.trim()}
      data-state={state}
      data-status={decision.status}
      data-id={decision.id}
      data-compact={compact ? "true" : "false"}
      data-vertical={decision.vertical}
    >
      {showImage && decision.image ? (
        <div className="rx-dc-media" aria-hidden="true">
          <Image
            src={decision.image}
            alt={decision.imageAlt ?? ""}
            width={480}
            height={640}
            className="rx-dc-img"
          />
        </div>
      ) : null}

      <div className="rx-dc-body">
        <header className="rx-dc-head">
          <p className="rx-dc-phase">
            {displayDecisionId(decision.id)} · {decision.phaseLabel}
          </p>
          <p className="rx-dc-property">{decision.property}</p>
          <p className="rx-dc-context">{decision.contextLine}</p>
        </header>

        <h3 className="rx-dc-headline">
          {decision.headline.split("\n").map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h3>
        <p className="rx-dc-sowhat">{decision.soWhat}</p>

        {isVerified && decision.verified ? (
          <div className="rx-dc-verified">
            <strong>{formatDecisionMoney(decision.verified.amount)}</strong>
            <span>{verifiedCaption(decision.verified.kind)}</span>
            <em>{decision.verified.note}</em>
          </div>
        ) : null}

        {!isVerified && decision.exposed ? (
          <div className="rx-dc-econ">
            <div className="rx-dc-money" data-tone="exposed">
              <strong>{formatDecisionMoney(decision.exposed.amount)}</strong>
              <span>
                {moneyCaption(decision.exposed.kind, decision.exposed.horizon)}
              </span>
            </div>
            {decision.expected ? (
              <div className="rx-dc-money" data-tone="protected">
                <strong>
                  {formatDecisionMoney(decision.expected.amount)}
                </strong>
                <span>
                  {moneyCaption(
                    decision.expected.kind,
                    decision.expected.horizon,
                  )}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isVerified && !decision.exposed && decision.expected ? (
          <div className="rx-dc-econ">
            <div className="rx-dc-money" data-tone="protected">
              <strong>{formatDecisionMoney(decision.expected.amount)}</strong>
              <span>
                {moneyCaption(
                  decision.expected.kind,
                  decision.expected.horizon,
                )}
              </span>
            </div>
          </div>
        ) : null}

        {!isVerified ? (
          <div className="rx-dc-rec">
            <p className="rx-dc-rec-label">
              {isApproved ? "Approved" : "RADR recommends"}
            </p>
            <p className="rx-dc-action">
              {activeOption && showSim ? activeOption.title : decision.action}
            </p>
            {decision.fallback && !isApproved ? (
              <p className="rx-dc-fallback">{decision.fallback}</p>
            ) : null}
            {isApproved ? (
              <p className="rx-dc-prepared">{decision.payloadNote}</p>
            ) : null}
          </div>
        ) : null}

        {decision.evidence.length > 0 ? (
          <ul className="rx-dc-evidence">
            {decision.evidence.slice(0, 2).map((item) => (
              <li key={item.label}>
                <strong>{item.value}</strong>
                <em>{item.label}</em>
              </li>
            ))}
          </ul>
        ) : null}

        {isVerified && decision.learn ? (
          <div className="rx-dc-learn">
            <p className="rx-dc-learn-label">Where to improve</p>
            <p>{decision.learn}</p>
            {decision.silenceNote ? (
              <p className="rx-dc-silence">{decision.silenceNote}</p>
            ) : null}
            {decision.proof?.length ? (
              <details className="rx-dc-proof">
                <summary>View proof</summary>
                <ol>
                  {decision.proof.map((row) => (
                    <li key={row.label}>
                      <strong>{row.label}</strong>
                      <span>{row.detail}</span>
                    </li>
                  ))}
                </ol>
              </details>
            ) : null}
          </div>
        ) : null}

        {showSim && decision.options ? (
          <div className="rx-dc-sim" data-on="true">
            <p className="rx-dc-sim-label">Simulate · net vs do nothing</p>
            <ul className="rx-dc-options">
              {decision.options.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className="rx-dc-option"
                    data-on={selected === opt.id ? "true" : "false"}
                    data-rec={opt.recommended ? "true" : "false"}
                    onClick={() => setSelected(opt.id)}
                  >
                    <span className="rx-dc-option-radio" aria-hidden="true" />
                    <span className="rx-dc-option-copy">
                      <strong>{opt.title}</strong>
                      <em>{opt.note}</em>
                    </span>
                    <span
                      className="rx-dc-option-net"
                      data-neg={opt.netVsDoNothing < 0 ? "true" : "false"}
                    >
                      {opt.netVsDoNothing === 0
                        ? "€0"
                        : `${opt.netVsDoNothing > 0 ? "+" : "−"}${formatDecisionMoney(Math.abs(opt.netVsDoNothing))}`}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="rx-dc-meta">
              Confidence {decision.why.confidence.point}% (
              {decision.why.confidence.low}–{decision.why.confidence.high})
              {decision.why.sample.n
                ? ` · n=${decision.why.sample.n}`
                : null}
              {decision.deadline ? ` · ${decision.deadline}` : null}
            </p>
          </div>
        ) : null}

        {whyOpen ? (
          <div className="rx-dc-why" data-on="true">
            <p className="rx-dc-why-title">Why RADR believes this</p>
            <div className="rx-dc-why-grid">
              {decision.why.blocks.map((block) => (
                <div key={`${block.epistemic}-${block.title}`}>
                  <p className="rx-dc-why-k">{block.epistemic}</p>
                  <p className="rx-dc-why-block-title">{block.title}</p>
                  <p>{block.body}</p>
                </div>
              ))}
            </div>
            <p className="rx-dc-why-dna">{decision.why.locationDna}</p>
            <dl className="rx-dc-why-meta">
              <div>
                <dt>Sources</dt>
                <dd>
                  {decision.why.sources
                    .map((s) => `${s.name} (${s.freshness})`)
                    .join(" · ")}
                </dd>
              </div>
              <div>
                <dt>n=</dt>
                <dd>
                  {decision.why.sample.n} · {decision.why.sample.window}
                </dd>
              </div>
              <div>
                <dt>Baseline</dt>
                <dd>{decision.why.baseline}</dd>
              </div>
              <div>
                <dt>Effect</dt>
                <dd>{decision.why.effect}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>
                  {decision.why.confidence.point}% (
                  {decision.why.confidence.low}–
                  {decision.why.confidence.high})
                </dd>
              </div>
            </dl>
            {decision.why.assumptions.length ? (
              <p className="rx-dc-why-assumptions">
                Assumptions: {decision.why.assumptions.join(" · ")}
              </p>
            ) : null}
          </div>
        ) : null}

        {!isVerified ? (
          <div className="rx-dc-cta">
            {!isApproved ? (
              <button
                type="button"
                className="rx-dc-approve"
                onClick={approve}
              >
                Approve
              </button>
            ) : (
              <span className="rx-dc-approved-badge">Approved</span>
            )}
            <div className="rx-dc-sec">
              <button
                type="button"
                className="rx-dc-ghost"
                aria-expanded={whyOpen}
                onClick={() => setWhyOpen((v) => !v)}
              >
                Why
              </button>
              {decision.options?.length ? (
                <button
                  type="button"
                  className="rx-dc-ghost"
                  aria-expanded={showSim}
                  onClick={() => {
                    setSimOpen((v) => !v);
                    if (!simOpen) onStateChange?.("SIMULATE");
                  }}
                >
                  Simulate
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {toast ? (
          <p className="rx-dc-toast" role="status">
            {toast}
          </p>
        ) : null}
      </div>
    </article>
  );
}
