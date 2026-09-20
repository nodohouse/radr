"use client";

import { DecisionCard } from "@/components/marketing/decision/DecisionCard";
import { useHomepageStory } from "@/components/marketing/decision/HomepageStory";

export function SectionHiddenSignals() {
  const { hidden, hiddenState, setHiddenState } = useHomepageStory();

  return (
    <section
      className="rx-spine-section rx-scene"
      data-nav-theme="light"
      id="hidden-signals"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Hidden signal</p>
          <h2 className="rx-spine-title">What you weren’t looking for.</h2>
          <p className="rx-spine-lead">
            Recast as a Decision — tonight’s move first. Annual money stays
            supporting.
          </p>
        </header>
        <div className="rx-spine-card-wrap">
          <DecisionCard
            decision={hidden}
            state={hiddenState}
            onStateChange={setHiddenState}
            showImage
          />
        </div>
      </div>
    </section>
  );
}
