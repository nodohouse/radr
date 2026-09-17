"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATALOG } from "@/lib/lab/world";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { StoryCard } from "./StoryCard";
import { useLab } from "./LabProvider";

const FILTERS = ["ALL", "SELL", "LABOR", "BUY", "RECOVER", "VALUE", "MEMORY"] as const;

function washFor(cat: string): "sand" | "mint" {
  return cat === "SELL" || cat === "VALUE" || cat === "MEMORY" ? "mint" : "sand";
}

export function CatalogPage() {
  const { role, pins, togglePin } = useLab();
  const lens = ROLE_LENSES[role];
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");

  const mods = useMemo(() => {
    const list = filter === "ALL" ? CATALOG : CATALOG.filter((m) => m.category === filter);
    return [...list].sort((a, b) => {
      const ae = lens.catalogEmphasis.includes(a.category) ? 0 : 1;
      const be = lens.catalogEmphasis.includes(b.category) ? 0 : 1;
      return ae - be;
    });
  }, [filter, lens.catalogEmphasis]);

  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">Catalog · Buy · Sell · Labor · Recover</p>
          <h1 className="lab-h lab-h1">Readable story cards</h1>
          <p className="lab-lead">
            Action · € · because · CTA. {lens.demoPath}. Lens first: {lens.catalogEmphasis.join(" · ")}.
          </p>
        </div>
        <Link className="lab-btn" href="/app/lab/my-center">
          My Center
        </Link>
      </div>

      <div className="lab-pills" role="tablist" aria-label="Catalog wedge">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className="lab-pill"
            data-on={filter === f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="lab-board" style={{ marginTop: "1rem" }}>
        {mods.map((m) => (
          <div key={m.id} className="lab-story-cell">
            <StoryCard
              href={m.href}
              kicker={`${m.displayId ?? m.category} · ${m.category}${
                lens.catalogEmphasis.includes(m.category) ? " · this lens" : ""
              }`}
              title={m.title}
              euro={m.euro || undefined}
              grade={m.grade === "Playbook" ? "Expected" : m.grade}
              because={m.because}
              clock={m.clock}
              cta={m.blurb}
              wash={washFor(m.category)}
            />
            <button type="button" className="lab-btn" onClick={() => togglePin(m.id)}>
              {pins.includes(m.id) ? "Pinned" : "Pin to My Center"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
