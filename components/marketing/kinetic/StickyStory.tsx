"use client";

/**
 * StickyStory — left visual stays pinned; right chapters drive scroll stages.
 * No scroll-jacking. Reduced-motion collapses to stacked.
 */

import type { ReactNode, RefObject } from "react";
import { useScrollStage } from "@/components/marketing/motion/useScrollStage";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

export type StickyChapter = {
  id: string;
  kicker?: string;
  title: string;
  body?: string;
  meta?: string;
};

type Props = {
  chapters: StickyChapter[];
  renderVisual: (index: number, chapter: StickyChapter) => ReactNode;
  kicker?: string;
  title?: string;
  lead?: string;
  /** Viewport heights of scroll runway per chapter */
  vhPerChapter?: number;
  className?: string;
  id?: string;
};

export function StickyStory({
  chapters,
  renderVisual,
  kicker,
  title,
  lead,
  vhPerChapter = 85,
  className = "",
  id,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const { rootRef, index, setIndex } = useScrollStage(
    chapters.length,
    !reduced && chapters.length > 1,
  );
  const active = chapters[Math.min(index, chapters.length - 1)]!;

  if (reduced) {
    return (
      <div className={`rx-sticky ${className}`.trim()} id={id} data-reduced="true">
        {(kicker || title) && (
          <header className="rx-sticky-head">
            {kicker ? <p className="rx-rec-k">{kicker}</p> : null}
            {title ? <h2 className="rx-rec-h">{title}</h2> : null}
            {lead ? <p className="rx-rec-p">{lead}</p> : null}
          </header>
        )}
        <div className="rx-sticky-stack">
          {chapters.map((ch, i) => (
            <article key={ch.id} className="rx-sticky-card" id={ch.id}>
              <div className="rx-sticky-visual">{renderVisual(i, ch)}</div>
              <div className="rx-sticky-copy">
                {ch.kicker ? <p className="rx-rec-k">{ch.kicker}</p> : null}
                <h3>{ch.title}</h3>
                {ch.body ? <p>{ch.body}</p> : null}
                {ch.meta ? <p className="rx-sticky-meta">{ch.meta}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef as RefObject<HTMLDivElement>}
      className={`rx-sticky ${className}`.trim()}
      id={id}
      style={{ minHeight: `${chapters.length * vhPerChapter}vh` }}
    >
      <div className="rx-sticky-pin">
        {(kicker || title) && (
          <header className="rx-sticky-head">
            {kicker ? <p className="rx-rec-k">{kicker}</p> : null}
            {title ? <h2 className="rx-rec-h">{title}</h2> : null}
            {lead ? <p className="rx-rec-p">{lead}</p> : null}
          </header>
        )}

        <div className="rx-sticky-grid">
          <div className="rx-sticky-visual" aria-hidden="true">
            {renderVisual(index, active)}
          </div>

          <div className="rx-sticky-chapters">
            <nav className="rx-sticky-nav" aria-label="Story stages">
              {chapters.map((ch, i) => (
                <button
                  key={ch.id}
                  type="button"
                  data-on={i === index ? "true" : undefined}
                  data-past={i < index ? "true" : undefined}
                  onClick={() => {
                    setIndex(i);
                    const el = rootRef.current;
                    if (!el) return;
                    const total = el.offsetHeight - window.innerHeight;
                    const y =
                      el.getBoundingClientRect().top +
                      window.scrollY +
                      (i / chapters.length) * total +
                      8;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }}
                >
                  {ch.kicker ?? ch.title}
                </button>
              ))}
            </nav>

            <article className="rx-sticky-panel" key={active.id}>
              {active.kicker ? (
                <p className="rx-rec-k">{active.kicker}</p>
              ) : null}
              <h3>{active.title}</h3>
              {active.body ? <p>{active.body}</p> : null}
              {active.meta ? (
                <p className="rx-sticky-meta">{active.meta}</p>
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
