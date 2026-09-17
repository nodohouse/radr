"use client";

import { CATALOG_ORDER, MODULES, pinsFor } from "@/lib/lab/modules";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";
import { StoryCard } from "./StoryCard";

export function CatalogPage() {
  const { nav, setRole, togglePin, setMyView } = useLab();
  const lens = ROLE_LENSES[nav.role];
  const pinned = pinsFor(nav.pinnedIds);
  const emphasis = new Set(lens.catalogEmphasis);
  const cats = [
    ...CATALOG_ORDER.filter((c) => emphasis.has(c)),
    ...CATALOG_ORDER.filter((c) => !emphasis.has(c)),
  ];

  return (
    <div className="lab-viewport lab-catalog">
      <header className="lab-surf-head">
        <div>
          <p className="lab-k">My Center · Catalog</p>
          <h1 className="lab-surf-title">Money-moving decisions first</h1>
          <p className="lab-surf-sub">
            Pin what you watch. Every € has a because. · {lens.demoPath}
          </p>
        </div>
        <div className="lab-my-roles" role="tablist" aria-label="Role preset">
          {(Object.keys(ROLE_LENSES) as Array<keyof typeof ROLE_LENSES>).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={nav.role === id}
              data-on={nav.role === id || undefined}
              onClick={() => setRole(id)}
            >
              {ROLE_LENSES[id].label}
            </button>
          ))}
        </div>
      </header>
      <p className="lab-my-preset">{lens.note}</p>
      <div className="lab-my-tabs">
        <button type="button" data-on={nav.myView === "board" || undefined} onClick={() => setMyView("board")}>
          Board · {pinned.length}
        </button>
        <button type="button" data-on={nav.myView === "catalog" || undefined} onClick={() => setMyView("catalog")}>
          Catalog
        </button>
      </div>

      {nav.myView === "board" ? (
        <div className="lab-story-grid lab-story-grid-dense">
          {pinned.length === 0 ? (
            <p className="lab-empty">
              Nothing pinned. Open Catalog or pick a role preset — CFO loads Recover + Buy + Verified.
            </p>
          ) : (
            pinned.map((m) => (
              <StoryCard
                key={m.id}
                displayId={m.displayId}
                title={m.title}
                euro={m.euro}
                euroLabel={m.euroLabel}
                grade={m.grade}
                because={m.because}
                clock={m.clock}
                wedge={m.category}
                href={m.href}
                blurb={m.blurb}
                pinned
                onPin={() => togglePin(m.id)}
                emphasize={emphasis.has(m.category)}
              />
            ))
          )}
        </div>
      ) : (
        cats.map((cat) => (
          <section key={cat} className="lab-cat">
            <h2>
              {cat}
              {emphasis.has(cat) ? <span className="lab-cat-badge">For you</span> : null}
            </h2>
            <div className="lab-story-grid lab-story-grid-dense">
              {MODULES.filter((m) => m.category === cat).map((m) => (
                <StoryCard
                  key={m.id}
                  displayId={m.displayId}
                  title={m.title}
                  euro={m.euro}
                  euroLabel={m.euroLabel}
                  grade={m.grade}
                  because={m.because}
                  clock={m.clock}
                  wedge={m.category}
                  href={m.href}
                  blurb={m.blurb}
                  pinned={nav.pinnedIds.includes(m.id)}
                  onPin={() => togglePin(m.id)}
                  emphasize={emphasis.has(cat)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
