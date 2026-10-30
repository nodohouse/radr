"use client";

import Link from "next/link";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import type { MemoryLearningRow } from "@/lib/radr/product/memoryProofEngine";
import { filterLearnings } from "@/lib/radr/product/memoryProofEngine";

type Props = {
  learnings: MemoryLearningRow[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  domain: string;
  onDomain: (d: string) => void;
  query: string;
  onQuery: (q: string) => void;
};

const DOMAINS = [
  "All",
  "Service",
  "Menu",
  "Guests",
  "Procurement",
  "Operations",
  "Labor",
  "Weather",
] as const;

export function MemoryLearnings({
  learnings,
  selectedId,
  onSelect,
  domain,
  onDomain,
  query,
  onQuery,
}: Props) {
  const rows = filterLearnings(learnings, { domain, q: query });
  const selected = learnings.find((l) => l.id === selectedId) ?? null;

  return (
    <div className="me-learnings-view" data-memory-view="learnings">
      <div className="me-lv-toolbar">
        <input
          type="search"
          placeholder="Search learnings…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          aria-label="Search learnings"
        />
        <div className="me-learn-filters" role="group" aria-label="Learning domains">
          {DOMAINS.map((f) => (
            <button
              key={f}
              type="button"
              data-active={domain === f ? "true" : undefined}
              onClick={() => onDomain(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="me-lv-body">
        <div className="me-lv-table-wrap">
          <table className="me-lv-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Learning</th>
                <th>Domain</th>
                <th>Confidence</th>
                <th>State</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  data-active={selectedId === row.id ? "true" : undefined}
                  data-miss={row.fromMiss ? "true" : undefined}
                >
                  <td>
                    <button type="button" onClick={() => onSelect(row.id)}>
                      {row.displayId}
                    </button>
                  </td>
                  <td>{row.location}</td>
                  <td>
                    <button
                      type="button"
                      className="me-lv-statement"
                      onClick={() => onSelect(row.id)}
                    >
                      {row.fromMiss ? <em>Miss · </em> : null}
                      {row.statement}
                    </button>
                  </td>
                  <td>
                    <span className="me-learn-tag" data-tone={row.domainTone}>
                      {row.domain}
                    </span>
                  </td>
                  <td>
                    <span className="me-learn-conf" data-level={row.confidence}>
                      {row.confidence}
                    </span>
                  </td>
                  <td>
                    <span className="me-lv-state">{row.state.replace("_", " ")}</span>
                  </td>
                  <td>{row.added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected ? (
          <aside className="me-lv-detail" aria-label="Learning provenance">
            <p className="me-k">
              {selected.displayId}
              {selected.fromMiss ? " · Honest miss" : ""}
            </p>
            <h2>{selected.statement}</h2>
            <p className="me-lv-scope">
              {selected.location} · {selected.domain} · {selected.state.replace("_", " ")}
            </p>

            <dl className="me-lv-facts">
              <div>
                <dt>Sample</dt>
                <dd>{selected.sampleSize} comparable</dd>
              </div>
              <div>
                <dt>Supporting</dt>
                <dd>{selected.supporting}</dd>
              </div>
              <div>
                <dt>Contradicting</dt>
                <dd>{selected.contradicting}</dd>
              </div>
              <div>
                <dt>Confidence</dt>
                <dd>{selected.confidence}</dd>
              </div>
            </dl>

            {selected.expectedEuro != null || selected.verifiedEuro != null ? (
              <div className="me-lv-eov">
                <div>
                  <span>Expected</span>
                  <strong>
                    {selected.expectedEuro != null
                      ? formatDecisionMoney(selected.expectedEuro)
                      : "—"}
                  </strong>
                </div>
                <div>
                  <span>Verified</span>
                  <strong data-miss={selected.fromMiss ? "true" : undefined}>
                    {selected.verifiedEuro != null
                      ? formatDecisionMoney(selected.verifiedEuro)
                      : "—"}
                  </strong>
                </div>
              </div>
            ) : null}

            <p>
              <strong>Origin Finding</strong> — {selected.originFinding}
            </p>
            {selected.contradicting > 0 ? (
              <p>
                <strong>Contradictions</strong> — {selected.contradicting} cases
                retained (events / heaters / exceptions). Learning updated with
                applicability conditions rather than retired.
              </p>
            ) : null}

            <div className="me-pb-links">
              <Link href={selected.href}>Source Decision →</Link>
              <Link href="/app/intelligence">Intelligence →</Link>
              <Link href="/app/value">Verified Value →</Link>
              {selected.playbookId ? (
                <Link href={`/app/memory?view=playbooks&playbook=${selected.playbookId}`}>
                  Playbook →
                </Link>
              ) : null}
              <Link href="/app/data-health">Data Health →</Link>
            </div>
            <button
              type="button"
              className="me-link"
              onClick={() => onSelect(null)}
              style={{ marginTop: 12 }}
            >
              Close detail
            </button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
