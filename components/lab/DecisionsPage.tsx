"use client";

import { useState } from "react";
import { formatEuro } from "@/lib/lab/format";
import { queueForRole } from "@/lib/lab/decisions";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";

export function DecisionsPage() {
  const { nav, setSeed, goCenter } = useLab();
  const [sort, setSort] = useState<"decide-by" | "euro">("decide-by");
  const lens = ROLE_LENSES[nav.role];
  const rows = queueForRole(nav.role).sort((a, b) =>
    sort === "euro" ? b.sortEuro - a.sortEuro : a.sortMin - b.sortMin,
  );

  return (
    <div className="lab-viewport lab-viewport-queue">
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
      <ul className="lab-queue">
        {rows.map((row) => (
          <li key={row.id}>
            <article className="lab-queue-row" data-wedge={row.wedge}>
              <div className="lab-queue-id">
                <em>{row.displayId}</em>
                <span>{row.wedge}</span>
              </div>
              <div className="lab-queue-body">
                <h3>{row.title}</h3>
                <p className="lab-queue-because">because {row.because}</p>
                <p className="lab-queue-clock">{row.clock}</p>
              </div>
              <p className="lab-queue-euro" data-grade={row.grade}>
                <strong>{formatEuro(row.euro)}</strong>
                <span>{row.grade}</span>
              </p>
              <button
                type="button"
                className="lab-story-cta"
                onClick={() => {
                  if (row.seed) {
                    setSeed(row.seed);
                    goCenter(row.seed);
                  }
                }}
              >
                Why + Futures
              </button>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
