"use client";

import Link from "next/link";
import type { MemoryDnaPattern } from "@/lib/radr/product/memoryProofEngine";

type Props = {
  patterns: MemoryDnaPattern[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  locationFilter: string;
  onLocation: (loc: string) => void;
};

const LOCATIONS = [
  { id: "all", label: "Group" },
  { id: "loc_berlin_mitte", label: "Soho · New York" },
  { id: "loc_hamburg_hafen", label: "Roma Norte · Mexico City" },
  { id: "loc_berlin_kreuzberg", label: "Kreuzberg" },
] as const;

function Spark({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const w = 72;
  const h = 28;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * (w - 2) + 1;
      const y = h - 2 - (v / max) * (h - 4);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="me-dna-spark-lg" aria-hidden>
      <path d={d} fill="none" stroke="#00a85a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function MemoryDna({
  patterns,
  selectedId,
  onSelect,
  locationFilter,
  onLocation,
}: Props) {
  const filtered =
    locationFilter === "all"
      ? patterns
      : patterns.filter(
          (p) =>
            p.locationId === locationFilter ||
            p.locationId === "group" ||
            p.scope === "Group" ||
            p.scope === "Location type",
        );
  const selected =
    filtered.find((p) => p.id === selectedId) ??
    patterns.find((p) => p.id === selectedId) ??
    filtered[0] ??
    null;

  return (
    <div className="me-dna-view" data-memory-view="dna">
      <div className="me-dna-toolbar">
        <div>
          <h2>Operating DNA</h2>
          <p>Learned patterns that shape future decisions — scoped, not personality.</p>
        </div>
        <div className="me-learn-filters" role="group" aria-label="DNA location scope">
          {LOCATIONS.map((l) => (
            <button
              key={l.id}
              type="button"
              data-active={locationFilter === l.id ? "true" : undefined}
              onClick={() => onLocation(l.id)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="me-dna-body">
        <ul className="me-dna-catalog">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="me-dna-catalog-row"
                data-active={selected?.id === p.id ? "true" : undefined}
                onClick={() => onSelect(p.id)}
              >
                <span className="me-dna-catalog-top">
                  <strong>{p.name}</strong>
                  <Spark values={p.spark} />
                </span>
                <span>{p.statement}</span>
                <span className="me-dna-catalog-meta">
                  <em>{p.confidence}% confidence</em>
                  <em>↑ {p.accuracyLift}% accuracy</em>
                  <em>{p.scope}</em>
                </span>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <aside className="me-dna-detail" aria-label={`${selected.name} detail`}>
            <p className="me-k">
              {selected.scope} · {selected.applicability}
            </p>
            <h3>{selected.name}</h3>
            <p>{selected.statement}</p>

            <div className="me-dna-conf-block">
              <div>
                <span>{selected.confidence}% confidence</span>
                <div className="me-dna-bar">
                  <i style={{ width: `${selected.confidence}%` }} />
                </div>
              </div>
              <strong>↑ {selected.accuracyLift}% Decision accuracy</strong>
            </div>

            <h4>How confidence is derived</h4>
            <ul>
              {selected.confidenceFactors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <dl className="me-lv-facts">
              <div>
                <dt>Supporting</dt>
                <dd>{selected.supporting}</dd>
              </div>
              <div>
                <dt>Contradicting</dt>
                <dd>{selected.contradicting}</dd>
              </div>
            </dl>

            {selected.contradicting > 0 ? (
              <p className="me-dna-contra">
                Contradictions retained — local nuance kept (e.g. heaters / event
                nights). Group pattern generalizes only where evidence supports it.
              </p>
            ) : null}

            <div className="me-pb-links">
              {selected.relatedPlaybookIds.map((id) => (
                <Link key={id} href={`/app/memory?view=playbooks&playbook=${id}`}>
                  Playbook →
                </Link>
              ))}
              <Link href="/app/decisions">Decisions informed →</Link>
              <Link href="/app/data-health">Data Health →</Link>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
