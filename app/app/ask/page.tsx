"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { AskRadrService } from "@/lib/radr/product/services";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";

const SUGGESTED = [
  "What am I missing?",
  "What will break tonight?",
  "Which demand should we accept?",
  "What does the team know that the data doesn't?",
  "Why did Friday deteriorate?",
  "Which menu items hurt us during peak?",
  "What changed after the social campaign?",
  "Where do our systems disagree?",
  "What keeps coming back?",
  "What will expire if I do nothing?",
];

export default function AskPage() {
  useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const [prompt, setPrompt] = useState("What am I missing?");
  const [answer, setAnswer] = useState(() =>
    AskRadrService.answer(roleView, "What am I missing?"),
  );
  const isMissing = /missing/i.test(answer.prompt);

  return (
    <div className="rp-ask-page rp-ask-elevated rp-ask-reveal">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Ask</p>
        <h1 className="rp-cc-title">What do you want to understand?</h1>
        <p className="rp-cc-since">
          Analyst surface over the operation · {ctx.shortLabel}
        </p>
      </header>

      <form
        className="rp-ask-form"
        onSubmit={(e) => {
          e.preventDefault();
          setAnswer(AskRadrService.answer(roleView, prompt || answer.prompt));
        }}
      >
        <label htmlFor="ask-prompt">Question</label>
        <input
          id="ask-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What am I missing?"
        />
        <button type="submit" className="rp-cc-cta">
          Ask
        </button>
      </form>

      <div className="rp-ask-fixtures">
        {SUGGESTED.map((p) => (
          <button
            key={p}
            type="button"
            className="rp-drec-secondary"
            onClick={() => {
              setPrompt(p);
              setAnswer(AskRadrService.answer(roleView, p));
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <section className="rp-drec-sec rp-ask-memo">
        <h2>{answer.prompt}</h2>
        {isMissing ? (
          <div className="rp-ask-flip">
            <p className="rp-ask-thought">You may be looking at labor.</p>
            <p className="rp-ask-found">RADR is looking at kitchen mix.</p>
          </div>
        ) : null}
        {isMissing ? (
          <ol className="rp-ask-flow" aria-label="Reasoning flow">
            <li>
              <em>Current frame</em>
              <strong>Labor</strong>
            </li>
            <li>
              <em>Evidence against</em>
              <strong>FOH within plan</strong>
            </li>
            <li>
              <em>Strongest relationship</em>
              <strong>Menu mix × delivery pressure</strong>
            </li>
            <li>
              <em>Effect</em>
              <strong>Ticket time ↑</strong>
            </li>
            <li>
              <em>Effect</em>
              <strong>Second turns ↓</strong>
            </li>
            <li>
              <em>Guest</em>
              <strong>Voice ↑</strong>
            </li>
            <li data-econ="true">
              <em>Exposure</em>
              <strong>Economic</strong>
            </li>
          </ol>
        ) : null}
        <p style={{ whiteSpace: "pre-wrap" }}>{answer.answer}</p>
        {answer.evidence?.length ? (
          <ul className="rp-ask-evidence">
            {answer.evidence.map((e) => {
              const href =
                e.toLowerCase().includes("menu")
                  ? "/app/intelligence/menu"
                  : answer.decisionIds[0]
                    ? `/app/decisions/${answer.decisionIds[0]}#evidence`
                    : null;
              return (
                <li key={e}>
                  {href ? <Link href={href}>{e}</Link> : e}
                </li>
              );
            })}
          </ul>
        ) : null}
        {answer.decisionIds.length ? (
          <div className="rp-ask-fixtures">
            {answer.decisionIds.map((id) => (
              <Link
                key={id}
                href={`/app/decisions/${id}`}
                className="rp-cc-cta"
              >
                Open {displayDecisionId(id)}
              </Link>
            ))}
            {answer.decisionIds.includes(DECISION_IDS.menuPeak) ? (
              <Link
                href="/app/intelligence/menu"
                className="rp-drec-secondary"
              >
                Menu intelligence
              </Link>
            ) : null}
            {answer.decisionIds.includes(DECISION_IDS.peak) ||
            answer.decisionIds.includes(DECISION_IDS.guestVoice) ? (
              <Link href="/app/service" className="rp-drec-secondary">
                Service Map
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
