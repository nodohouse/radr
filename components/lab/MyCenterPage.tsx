"use client";

import Link from "next/link";
import { CATALOG } from "@/lib/lab/world";
import { StoryCard } from "./StoryCard";
import { useLab } from "./LabProvider";

export function MyCenterPage() {
  const { role, pins, lens, togglePin } = useLab();
  const pinned = CATALOG.filter((m) => pins.includes(m.id));
  const rest = CATALOG.filter((m) => !pins.includes(m.id)).slice(0, 2);

  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">My Center · {lens.label} lens</p>
          <h1 className="lab-h lab-h1">Money-moving decisions first</h1>
          <p className="lab-lead">
            Pin what you watch. Every € has a because. {lens.demoPath}
          </p>
        </div>
        <Link className="lab-btn lab-btn-acid" href="/app/lab/catalog">
          Open Catalog
        </Link>
      </div>

      <div className="lab-story-grid">
        {pinned.map((m) => (
          <div key={m.id} className="lab-story-cell">
            <StoryCard
              href={m.href}
              kicker={`${m.displayId ?? m.category} · ${m.category}`}
              title={m.title}
              euro={m.euro || undefined}
              grade={m.grade === "Playbook" ? "Expected" : m.grade}
              because={m.because}
              clock={m.clock}
              cta={m.blurb}
            />
            <button type="button" className="lab-btn" onClick={() => togglePin(m.id)}>
              Unpin
            </button>
          </div>
        ))}
      </div>

      {rest.length ? (
        <>
          <p className="lab-kicker" style={{ marginTop: "1.6rem" }}>
            Also in Catalog · {role}
          </p>
          <div className="lab-story-grid">
            {rest.map((m) => (
              <StoryCard
                key={m.id}
                href={m.href}
                kicker={`${m.displayId ?? m.category} · ${m.category}`}
                title={m.title}
                euro={m.euro || undefined}
                grade={m.grade === "Playbook" ? "Expected" : m.grade}
                because={m.because}
                clock={m.clock}
                cta="Open"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
