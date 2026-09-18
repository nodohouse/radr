"use client";

/**
 * My Center — light Catalog + Board. Rich module cards with because-lines.
 */

import Link from "next/link";
import { useLab } from "./LabContext";
import {
  CATEGORY_ORDER,
  LAB_MODULE_CATALOG,
  ROLE_PRESETS,
  modulesByIds,
  type CenterRole,
  type LabModule,
  type ModuleCategory,
} from "./labModules";
import { ROLE_LENSES } from "./labRoleLens";

function ModuleCard({
  m,
  pinned,
  onToggle,
  emphasize,
}: {
  m: LabModule;
  pinned?: boolean;
  onToggle?: () => void;
  emphasize?: boolean;
}) {
  return (
    <article
      className="lab-mod lab-mod-v50"
      data-grade={m.grade}
      data-cat={m.category}
      data-emphasize={emphasize ? "true" : undefined}
    >
      <div className="lab-mod-top">
        <em>{m.displayId}</em>
        <span className="lab-mod-cat">{m.category}</span>
      </div>
      <h3 className="lab-mod-title">{m.title}</h3>
      <p className="lab-mod-euro" data-grade={m.grade}>
        {m.euro > 0 ? (
          <>
            <strong>€{m.euro.toLocaleString("en-IE")}</strong>
            <span>{m.grade}</span>
          </>
        ) : (
          <span data-soft>{m.euroLabel}</span>
        )}
      </p>
      <p className="lab-mod-because">because {m.because}</p>
      <p className="lab-mod-meta">{m.clock}</p>
      <p className="lab-mod-blurb">{m.blurb}</p>
      <div className="lab-mod-actions">
        <Link href={m.href} className="lab-mod-open">
          Open
        </Link>
        {onToggle ? (
          <button
            type="button"
            className="lab-mod-pin"
            data-on={pinned ? "true" : undefined}
            onClick={onToggle}
            aria-pressed={pinned}
          >
            {pinned ? "Pinned" : "Pin"}
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function LabMyCenterCanvas() {
  const { nav, setRole, togglePin, setMyView } = useLab();
  const role = nav.role;
  const pins = nav.pinnedIds;
  const view = nav.myView;
  const preset = ROLE_PRESETS[role];
  const lens = ROLE_LENSES[role];
  const board = modulesByIds(pins);
  const emphasis = new Set(lens.catalogEmphasis);

  const byCat = CATEGORY_ORDER.reduce(
    (acc, cat) => {
      acc[cat] = LAB_MODULE_CATALOG.filter((m) => m.category === cat);
      return acc;
    },
    {} as Record<ModuleCategory, LabModule[]>,
  );

  // Balanced catalog order: emphasize role wedges first
  const catOrder = [
    ...CATEGORY_ORDER.filter((c) => emphasis.has(c as never)),
    ...CATEGORY_ORDER.filter((c) => !emphasis.has(c as never)),
  ];

  return (
    <div className="lab-viewport lab-my lab-surface-light">
      <header className="lab-my-head">
        <div>
          <p className="lab-my-kicker">My Center</p>
          <h1 className="lab-my-title">Money-moving decisions first</h1>
          <p className="lab-my-sub">
            Pin what you watch. Every € has a because. · {lens.demoPath}
          </p>
        </div>
        <div className="lab-my-roles" role="tablist" aria-label="Role preset">
          {(Object.keys(ROLE_PRESETS) as CenterRole[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={role === r}
              data-on={role === r ? "true" : undefined}
              onClick={() => setRole(r)}
            >
              {ROLE_PRESETS[r].label}
            </button>
          ))}
        </div>
      </header>

      <p className="lab-my-preset">{preset.note}</p>

      <div className="lab-my-tabs">
        <button
          type="button"
          data-on={view === "board" ? "true" : undefined}
          onClick={() => setMyView("board")}
        >
          Board · {board.length}
        </button>
        <button
          type="button"
          data-on={view === "catalog" ? "true" : undefined}
          onClick={() => setMyView("catalog")}
        >
          Catalog
        </button>
      </div>

      {view === "board" ? (
        <div className="lab-my-board">
          {board.length === 0 ? (
            <p className="lab-my-empty">
              Nothing pinned. Open Catalog or pick a role preset — CFO loads
              Recover + Buy · Verified Value.
            </p>
          ) : (
            board.map((m) => (
              <ModuleCard
                key={m.id}
                m={m}
                pinned
                emphasize={emphasis.has(m.category as never)}
                onToggle={() => togglePin(m.id)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="lab-my-catalog">
          {catOrder.map((cat) => (
            <section key={cat} className="lab-my-cat">
              <h2>
                {cat}
                {emphasis.has(cat as never) ? (
                  <span className="lab-my-cat-badge">For you</span>
                ) : null}
              </h2>
              <div className="lab-my-board">
                {byCat[cat].map((m) => (
                  <ModuleCard
                    key={m.id}
                    m={m}
                    pinned={pins.includes(m.id)}
                    emphasize={emphasis.has(cat as never)}
                    onToggle={() => togglePin(m.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
