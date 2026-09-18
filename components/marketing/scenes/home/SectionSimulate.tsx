"use client";

import { DecisionCard } from "@/components/marketing/decision/DecisionCard";
import { useHomepageStory } from "@/components/marketing/decision/HomepageStory";

export function SectionSimulate() {
  const { simulate, simulateState, setSimulateState } = useHomepageStory();

  if (!simulate) return null;

  return (
    <section
      className="rx-spine-section rx-scene"
      data-nav-theme="light"
      id="simulate"
    >
      <div className="rx-shell">
        <header className="rx-spine-head">
          <p className="rx-spine-kicker">Simulate</p>
          <h2 className="rx-spine-title">Rain changed the operation.</h2>
          <p className="rx-spine-lead">
            Do nothing is the baseline (€0 net). Other options are net vs do
            nothing — labor already subtracted. Approve the one RADR prepared.
          </p>
        </header>
        <div className="rx-spine-card-wrap">
          <DecisionCard
            decision={simulate}
            state={simulateState}
            onStateChange={setSimulateState}
            showImage={false}
            compact
            defaultSimOpen
          />
        </div>
      </div>
    </section>
  );
}
