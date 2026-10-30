"use client";

import Link from "next/link";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import type { MemoryPlaybook } from "@/lib/radr/product/memoryProofEngine";

type Props = {
  playbooks: MemoryPlaybook[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function MemoryPlaybooks({ playbooks, selectedId, onSelect }: Props) {
  const selected =
    playbooks.find((p) => p.id === selectedId) ?? playbooks[0] ?? null;

  return (
    <div className="me-playbooks" data-memory-view="playbooks">
      <div className="me-pb-list" role="list" aria-label="Playbooks">
        {playbooks.map((p) => (
          <button
            key={p.id}
            type="button"
            role="listitem"
            className="me-pb-card"
            data-active={selected?.id === p.id ? "true" : undefined}
            onClick={() => onSelect(p.id)}
          >
            <span className="me-pb-top">
              <strong>{p.name}</strong>
              <span className="me-pb-status" data-status={p.status}>
                {p.status}
              </span>
            </span>
            <span className="me-pb-meta">
              {p.version} · {p.scope}
            </span>
            <span className="me-pb-stats">
              <em>{p.confidence} confidence</em>
              <span>
                {p.sampleSize} services · {p.decisionsInfluenced} Decisions
              </span>
            </span>
            <span className="me-pb-outcomes">
              {p.verifiedPositive} verified · {p.partial} partial · {p.miss} miss
            </span>
          </button>
        ))}
      </div>

      {selected ? (
        <article className="me-pb-detail" aria-label={`${selected.name} detail`}>
          <header>
            <p className="me-k">
              {selected.domain} · {selected.version}
            </p>
            <h2>{selected.name}</h2>
            <p className="me-pb-scope">{selected.scope}</p>
            <span className="me-pb-status" data-status={selected.status}>
              {selected.status}
            </span>
          </header>

          <section>
            <h3>Current logic</h3>
            <p>{selected.currentLogic}</p>
          </section>

          <div className="me-pb-grid">
            <section>
              <h3>When it applies</h3>
              <p>{selected.whenApplies}</p>
            </section>
            <section>
              <h3>When not to apply</h3>
              <p>{selected.whenNot}</p>
            </section>
          </div>

          <section>
            <h3>Guardrails</h3>
            <ul>
              {selected.guardrails.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3>Input signals</h3>
            <div className="me-pb-signals">
              {selected.inputSignals.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </section>

          <section>
            <h3>Version history</h3>
            <ol className="me-pb-versions">
              {selected.versions.map((v) => (
                <li key={v.version} data-live={v.status === "LIVE" ? "true" : undefined}>
                  <div>
                    <strong>
                      {v.version}
                      {v.status === "LIVE" ? " LIVE" : ""}
                    </strong>
                    <span>{v.date}</span>
                  </div>
                  <p>{v.reason}</p>
                  <em>
                    {v.evidenceCount} evidence · {v.confidence}% confidence
                    {v.errorBefore != null && v.errorAfter != null
                      ? ` · error ${v.errorBefore}% → ${v.errorAfter}%`
                      : ""}
                  </em>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h3>Linked Decisions</h3>
            <div className="me-pb-links">
              {selected.decisionIds.map((id) => (
                <Link key={id} href={`/app/decisions/${id}`}>
                  {displayDecisionId(id)}
                </Link>
              ))}
              <Link href={selected.valueHref}>Verified Value →</Link>
              <Link href={selected.intelligenceHref}>Intelligence →</Link>
              <Link href="/app/data-health">Data Health →</Link>
            </div>
          </section>
        </article>
      ) : null}
    </div>
  );
}
