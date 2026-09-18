"use client";

/**
 * Margin Recovery Decision card — hero visual.
 * Expected until credit applied; Verified only when Finance can match it back.
 */

import { useEffect, useState } from "react";
import NextLink from "next/link";

export type MarginFuture = {
  id: string;
  label: string;
  rec?: boolean;
};

export type MarginStory = {
  id: string;
  kicker: string;
  displayId: string;
  variance: string;
  because: string;
  euro: string;
  grade: "Expected";
  futures: MarginFuture[];
  traceHref: string;
  traceLabel: string;
};

export const STORY_CREDIT_NOT_APPLIED: MarginStory = {
  id: "credit-not-applied",
  kicker: "Margin Recovery · Finance",
  displayId: "D-4102 · Berlin Mitte",
  variance: "Contract price variance",
  because:
    "Invoice €7.45/L vs contract €6.80/L · 420 L — €273 exposed",
  euro: "€273",
  grade: "Expected",
  futures: [
    { id: "absorb", label: "Absorb" },
    { id: "dispute", label: "Dispute", rec: true },
    { id: "renegotiate", label: "Renegotiate" },
    { id: "switch", label: "Switch supplier" },
    { id: "reprice", label: "Reprice item" },
    { id: "rebalance", label: "Rebalance category" },
    { id: "promote", label: "Promote substitute" },
    { id: "wait", label: "Wait" },
  ],
  traceHref: "/app/lab/control-center?seed=recover",
  traceLabel: "See a Verified Trace →",
};

export const STORY_TWO_SITE_GAP: MarginStory = {
  id: "two-site-price-gap",
  kicker: "Margin Recovery · Finance",
  displayId: "D-4108 · Mitte × Prenzlauer Berg",
  variance: "Cross-location price dispersion",
  because:
    "Same SKU · Mitte €7.45/L vs Prenzlauer Berg €6.80/L on the same contract week — €410 exposed",
  euro: "€410",
  grade: "Expected",
  futures: [
    { id: "absorb", label: "Absorb" },
    { id: "dispute", label: "Dispute", rec: true },
    { id: "renegotiate", label: "Renegotiate" },
    { id: "switch", label: "Switch supplier" },
    { id: "reprice", label: "Reprice item" },
    { id: "rebalance", label: "Rebalance category" },
    { id: "wait", label: "Wait" },
  ],
  traceHref: "/app/lab/control-center?seed=margin-response",
  traceLabel: "See a Verified Trace →",
};

const STORIES = [STORY_CREDIT_NOT_APPLIED, STORY_TWO_SITE_GAP] as const;

type Phase = "options" | "recommend" | "trace";

type Props = {
  /** Max 2 stories — carousel, not a 24-tile gallery */
  stories?: readonly MarginStory[];
};

export function MarginResponseCard({ stories = STORIES }: Props) {
  const [storyIdx, setStoryIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("options");

  const story = stories[storyIdx] ?? STORY_CREDIT_NOT_APPLIED;
  const rec = story.futures.find((f) => f.rec) ?? story.futures[0];

  useEffect(() => {
    setSelected(null);
    setPhase("options");
    const t1 = window.setTimeout(() => {
      setSelected(rec.id);
      setPhase("recommend");
    }, 900);
    const t2 = window.setTimeout(() => setPhase("trace"), 1800);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [story.id, rec.id]);

  return (
    <aside
      className="rx-mrc"
      data-phase={phase}
      aria-label={`${story.variance} · Margin Response Decision`}
    >
      {stories.length > 1 ? (
        <div className="rx-mrc-tabs" role="tablist" aria-label="Finance seeds">
          {stories.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === storyIdx}
              data-on={i === storyIdx ? "true" : undefined}
              onClick={() => setStoryIdx(i)}
            >
              {s.id === "credit-not-applied" ? "Credit not applied" : "Two-site price"}
            </button>
          ))}
        </div>
      ) : null}

      <header className="rx-mrc-head">
        <p className="rx-mrc-k">{story.kicker}</p>
        <p className="rx-mrc-id">{story.displayId}</p>
      </header>

      <h2 className="rx-mrc-variance">{story.variance}</h2>

      <p className="rx-mrc-futures-k">Futures</p>
      <div className="rx-mrc-futures" role="list">
        {story.futures.map((f) => {
          const on = selected === f.id;
          const isRec = Boolean(f.rec);
          return (
            <button
              key={f.id}
              type="button"
              role="listitem"
              className="rx-mrc-chip"
              data-on={on ? "true" : undefined}
              data-rec={isRec ? "true" : undefined}
              onClick={() => {
                setSelected(f.id);
                setPhase(isRec ? "recommend" : "options");
              }}
            >
              <span>{f.label}</span>
              {isRec ? <em>REC</em> : null}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="rx-mrc-euro"
        data-grade="Expected"
        data-pulse={phase !== "options" ? "true" : undefined}
      >
        <strong>{story.euro}</strong>
        <span>Expected</span>
      </button>

      <p className="rx-mrc-because">{story.because}</p>

      <NextLink
        href={story.traceHref}
        className="rx-mrc-trace"
        data-on={phase === "trace" ? "true" : undefined}
      >
        {story.traceLabel}
      </NextLink>

      <p className="rx-mrc-note">
        Expected until the credit is applied. Verified when Finance can match it
        back.
      </p>
    </aside>
  );
}
