"use client";

import { StoryCard } from "./StoryCard";
import { useLab } from "./LabProvider";

export function DecisionsPage() {
  const { world, lens } = useLab();
  const needs = world.decisions.filter((d) => d.status === "needs_you");
  const rest = world.decisions.filter((d) => d.status !== "needs_you");

  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">{lens.label} lens · {world.serviceLabel}</p>
          <h1 className="lab-h lab-h1">{needs.length} need you</h1>
          <p className="lab-lead">
            Action · € · because · CTA. Approve / choose / exception only — Autopilot handles the rest.
          </p>
        </div>
      </div>
      <div className="lab-story-grid">
        {needs.map((d) => (
          <StoryCard
            key={d.id}
            href={`/app/lab/decisions/${d.id}`}
            kicker={`${d.displayId} · ${d.wedge} · ${d.autopilot}`}
            title={d.title}
            euro={d.euro}
            grade={d.grade}
            because={d.because}
            lineage={d.lineage}
            demo={d.demo}
            clock={d.clock}
            cta="Why + Futures"
          />
        ))}
      </div>
      {rest.length ? (
        <>
          <h2 className="lab-story-section-h" style={{ marginTop: "1.6rem" }}>
            Handling / sealed
          </h2>
          <div className="lab-story-grid">
            {rest.map((d) => (
              <StoryCard
                key={d.id}
                href={`/app/lab/decisions/${d.id}`}
                kicker={`${d.displayId} · ${d.status}`}
                title={d.title}
                euro={d.euro}
                grade={d.grade}
                because={d.because}
                lineage={d.lineage}
                clock={d.clock}
                cta="Open"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
