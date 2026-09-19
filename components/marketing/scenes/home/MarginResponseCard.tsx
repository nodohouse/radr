"use client";

/**
 * Recovery Decision card — hero visual.
 * Expected until credit applied; Verified only when Finance can match it.
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
  grade: "Expected" | "Verified";
  futures: MarginFuture[];
  traceHref: string;
  traceLabel: string;
  note: string;
  tabLabel: string;
};

export const STORY_CREDIT_NOT_APPLIED: MarginStory = {
  id: "credit-not-applied",
  kicker: "Supplier / AP · Finance",
  displayId: "D-4102 · Berlin Mitte · Demo",
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
    { id: "wait", label: "Wait" },
  ],
  traceHref: "/app/lab/control-center?seed=recover",
  traceLabel: "See verified recovery →",
  note: "Illustrative demo. Expected until the credit is applied.",
  tabLabel: "Supplier variance",
};

export const STORY_TWO_SITE_GAP: MarginStory = {
  id: "two-site-price-gap",
  kicker: "Procurement · Finance",
  displayId: "D-4108 · Mitte × Prenzlauer Berg",
  variance: "Cross-location price dispersion",
  because:
    "Same olive oil · Mitte €7.45/L vs Prenzlauer Berg €6.80/L — negotiate group rate",
  euro: "€410",
  grade: "Expected",
  futures: [
    { id: "absorb", label: "Absorb" },
    { id: "dispute", label: "Dispute", rec: true },
    { id: "renegotiate", label: "Group rate" },
    { id: "switch", label: "Switch supplier" },
    { id: "wait", label: "Wait" },
  ],
  traceHref: "/app/lab/control-center?seed=margin-response",
  traceLabel: "Open Decision →",
  note: "Illustrative demo. Expected until negotiated rate or credit applies.",
  tabLabel: "Price dispersion",
};

const STORIES = [STORY_CREDIT_NOT_APPLIED, STORY_TWO_SITE_GAP] as const;

type Phase = "options" | "recommend" | "trace";

type Props = {
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
      aria-label={`${story.variance} · Recovery Decision`}
    >
      {stories.length > 1 ? (
        <div className="rx-mrc-tabs" role="tablist" aria-label="Recovery stories">
          {stories.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === storyIdx}
              data-on={i === storyIdx ? "true" : undefined}
              onClick={() => setStoryIdx(i)}
            >
              {s.tabLabel}
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
        data-grade={story.grade}
        data-pulse={phase !== "options" ? "true" : undefined}
      >
        <strong>{story.euro}</strong>
        <span>{story.grade}</span>
      </button>

      <p className="rx-mrc-because">{story.because}</p>

      <NextLink
        href={story.traceHref}
        className="rx-mrc-trace"
        data-on={phase === "trace" ? "true" : undefined}
      >
        {story.traceLabel}
      </NextLink>

      <p className="rx-mrc-note">{story.note}</p>
    </aside>
  );
}
