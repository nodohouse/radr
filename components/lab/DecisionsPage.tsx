"use client";

import { useState } from "react";
import { queueForRole } from "@/lib/lab/decisions";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";
import { StoryCard } from "./StoryCard";

export function DecisionsPage() {
  const { nav, setSeed, goCenter } = useLab();
  const [sort, setSort] = useState<"decide-by" | "euro">("decide-by");
  const lens = ROLE_LENSES[nav.role];
  const rows = queueForRole(nav.role).sort((a, b) =>
    sort === "euro" ? b.sortEuro - a.sortEuro : a.sortMin - b.sortMin,
  );

  return (
    <div className="lab-viewport">
      <header className="lab-surf-head">
        <div>
          <p className="lab-k">Decisions</p>
          <h1 className="lab-surf-title">
            <strong>{rows.length}</strong> need you
          </h1>
          <p className="lab-surf-sub">
            {lens.subtitle} · {nav.role.toUpperCase()} lens
          </p>
        </div>
        <div className="lab-decisions-sort" role="group" aria-label="Sort">
          <button type="button" data-on={sort === "decide-by" || undefined} onClick={() => setSort("decide-by")}>
            Decide-by
          </button>
          <button type="button" data-on={sort === "euro" || undefined} onClick={() => setSort("euro")}>
            € at stake
          </button>
        </div>
      </header>
      <ul className="lab-story-grid">
        {rows.map((row) => (
          <li key={row.id}>
            <StoryCard
              displayId={row.displayId}
              title={row.title}
              euro={row.euro}
              grade={row.grade}
              because={row.because}
              clock={row.clock}
              wedge={row.wedge}
              cta="Why + Futures"
              onCta={() => {
                if (row.seed) {
                  setSeed(row.seed);
                  goCenter(row.seed);
                }
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
