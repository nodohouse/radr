"use client";

import type { CSSProperties } from "react";
import { useInView } from "../motion/useInView";

const steps = [
  {
    title: "Detect",
    body: "Find money you're losing, missing or leaving behind.",
  },
  {
    title: "Explain",
    body: "Show what changed, why, and what it's worth.",
  },
  {
    title: "Act",
    body: "Give the right person the next step.",
  },
  {
    title: "Learn",
    body: "Remember the fix so it doesn't come back.",
  },
  {
    title: "Verify",
    body: "Prove what was recovered or improved.",
  },
] as const;

export function SectionLoop() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="radr-section radr-section-light" id="how">
      <div className="radr-shell">
        <p className="radr-cat radr-cat-ink">How RADR works</p>
        <h2 className="radr-h2">
          Detect. Explain.
          <br />
          Act. Learn. Verify.
        </h2>
        <p className="radr-lead">
          Every resolved signal makes RADR sharper the next time.
        </p>
        <div
          ref={ref}
          className="radr-loop"
          data-on={inView ? "true" : "false"}
        >
          {steps.map((s, i) => (
            <div
              className="radr-loop-step"
              key={s.title}
              style={{ "--i": i } as CSSProperties}
            >
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
