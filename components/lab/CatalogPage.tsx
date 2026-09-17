"use client";

import { CATALOG } from "@/lib/lab/world";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { StoryCard } from "./StoryCard";
import { useLab } from "./LabProvider";

const ORDER = ["SELL", "LABOR", "BUY", "RECOVER", "VALUE", "MEMORY"] as const;

export function CatalogPage() {
  const { role, pins, togglePin } = useLab();
  const lens = ROLE_LENSES[role];

  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">Catalog · Buy · Sell · Labor · Recover</p>
          <h1 className="lab-h lab-h1">Readable story cards</h1>
          <p className="lab-lead">
            Action · € · because · CTA. {lens.demoPath}. Lens emphasis: {lens.catalogEmphasis.join(" · ")}.
          </p>
        </div>
      </div>

      {ORDER.map((cat) => {
        const mods = CATALOG.filter((m) => m.category === cat);
        if (!mods.length) return null;
        const emphasize = lens.catalogEmphasis.includes(cat);
        return (
          <section key={cat} className="lab-story-section">
            <h2 className="lab-story-section-h" data-on={emphasize}>
              {cat}
              {emphasize ? " · this lens" : ""}
            </h2>
            <div className="lab-story-grid">
              {mods.map((m) => (
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
                    {pins.includes(m.id) ? "Pinned" : "Pin to My Center"}
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
