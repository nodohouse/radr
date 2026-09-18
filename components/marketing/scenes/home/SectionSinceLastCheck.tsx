"use client";

import { DecisionCard } from "@/components/marketing/decision/DecisionCard";
import { useHomepageStory } from "@/components/marketing/decision/HomepageStory";

export function SectionSinceLastCheck() {
  const { verified } = useHomepageStory();

  return (
    <section
      className="rx-spine-section rx-scene"
      data-nav-theme="light"
      id="since-last-check"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Since your last check</p>
          <h2 className="rx-spine-title">The decision after action.</h2>
          <p className="rx-spine-lead">
            Same property. Same thread. Now verified — and what to improve next.
          </p>
        </header>
        <div className="rx-spine-card-wrap">
          <DecisionCard
            decision={verified}
            state="VERIFIED"
            showImage={false}
            compact
          />
        </div>
      </div>
    </section>
  );
}
