"use client";

import {
  CATALOG_MORE_COUNT,
  stateLabel,
  stateTone,
  type IntelFinding,
  type IntelSort,
} from "@/lib/radr/product/intelligenceEngine";

const SORTS: { id: IntelSort; label: string }[] = [
  { id: "impact", label: "Most impactful" },
  { id: "newest", label: "Newest" },
  { id: "exposure", label: "Exposure" },
  { id: "confidence", label: "Confidence" },
  { id: "urgency", label: "Urgency" },
  { id: "verified", label: "Verified impact" },
];

function FindingIcon({ id }: { id: string }) {
  if (id === "cost-movers") {
    return (
      <svg className="ie-finding-ico" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M2 11l3.5-3.5 2.5 2.5L14 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 4h4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (id === "settlement-bridge") {
    return (
      <svg className="ie-finding-ico" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M3 4h10M3 8h10M3 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (id === "verified-value-trend") {
    return (
      <svg className="ie-finding-ico" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M3 9l3 3 7-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="ie-finding-ico" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v4l2 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  findings: IntelFinding[];
  selectedId: string;
  sort: IntelSort;
  favorites: Set<string>;
  open?: boolean;
  onSelect: (id: string) => void;
  onSort: (s: IntelSort) => void;
  onOpenCatalog: () => void;
};

export function IntelFindingsRail({
  findings,
  selectedId,
  sort,
  favorites,
  open,
  onSelect,
  onSort,
  onOpenCatalog,
}: Props) {
  return (
    <aside className="ie-rail" data-open={open ? "true" : undefined} aria-label="Findings">
      <div className="ie-rail-head">
        <h2 className="ie-rail-title">
          Findings
          <span className="ie-count">{findings.length}</span>
        </h2>
        <label>
          <select
            className="ie-sort"
            value={sort}
            onChange={(e) => onSort(e.target.value as IntelSort)}
            aria-label="Sort findings"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="ie-findings">
        {findings.map((f, i) => {
          const active = f.id === selectedId;
          const rank = String(i + 1).padStart(2, "0");
          return (
            <li key={f.id}>
              <button
                type="button"
                className="ie-finding"
                data-active={active ? "true" : undefined}
                onClick={() => onSelect(f.id)}
                title={
                  i === 0
                    ? `Why this is ranked #1\n${f.rankWhy.join("\n")}`
                    : undefined
                }
              >
                <span className="ie-finding-rank">{rank}</span>
                <span className="ie-finding-body">
                  <span className="ie-finding-title-row">
                    <FindingIcon id={f.id} />
                    <strong>
                      {f.title}
                      {favorites.has(f.id) ? " ★" : ""}
                    </strong>
                  </span>
                  <p className="ie-finding-sum">{f.summary}</p>
                </span>
                <span className="ie-finding-meta">
                  <span className="ie-state" data-tone={stateTone(f.state)}>
                    {stateLabel(f.state)}
                  </span>
                  <svg className="ie-finding-chev" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <button type="button" className="ie-catalog-btn" onClick={onOpenCatalog}>
        <span>{CATALOG_MORE_COUNT} more findings in catalog</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </aside>
  );
}
