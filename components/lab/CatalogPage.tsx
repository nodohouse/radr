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
    <div className="lab-page">
      <p className="lab-kicker">Catalog · My Center</p>
      <h1 className="lab-h lab-h1">Money-moving decisions first</h1>
      <p className="lab-lead">
        Pin what you watch. Every € has a because. {lens.demoPath}
      </p>
      <div className="lab-cat-grid" style={{ marginTop: "1.3rem" }}>
        {ORDER.map((cat) => {
          const mods = CATALOG.filter((m) => m.category === cat);
          if (!mods.length) return null;
          const emphasize = lens.catalogEmphasis.includes(cat);
          return (
            <section key={cat} className="lab-cat-col">
              <h2 style={{ color: emphasize ? "#067a42" : undefined }}>
                {cat}
                {emphasize ? " · this lens" : ""}
              </h2>
              <div className="lab-cards">
                {mods.map((m) => (
                  <div key={m.id}>
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
                    <button
                      type="button"
                      className="lab-btn"
                      data-on={pins.includes(m.id)}
                      onClick={() => togglePin(m.id)}
                      style={{ marginTop: "0.45rem" }}
                    >
                      {pins.includes(m.id) ? "Pinned" : "Pin to Center"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
