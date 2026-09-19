"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  searchTerms,
  TERM_CATEGORY_LABELS,
  type TermCategory,
  type TermDefinition,
  type TermId,
} from "@/lib/radr/terminology";
import { MetricExplain } from "@/components/product/MetricExplain";
import { PageHeader } from "@/components/product/PageHeader";

const CATEGORIES = Object.keys(TERM_CATEGORY_LABELS) as TermCategory[];

/**
 * Searchable glossary: same definitions as tooltips.
 * Not in primary Operate nav; linked from System.
 */
export function Glossary() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<TermCategory | "all">("all");

  const results = useMemo(() => {
    let list: TermDefinition[] = searchTerms(q);
    if (category !== "all") {
      list = list.filter((t) => t.category === category);
    }
    return list.sort((a, b) => a.term.localeCompare(b.term));
  }, [q, category]);

  return (
    <div className="rp-attention rp-glossary">
      <PageHeader
        title="Glossary"
        sub="Hospitality and finance terms used in RADR - same definitions as in-product tips."
      >
        <Link href="/app" className="rp-btn-secondary">
          Today
        </Link>
      </PageHeader>

      <div className="rp-glossary-controls">
        <label className="rp-glossary-search">
          <span className="sr-only">Search terms</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search terms…"
            autoComplete="off"
          />
        </label>
        <div className="rp-glossary-cats" role="tablist" aria-label="Category">
          <button
            type="button"
            role="tab"
            aria-selected={category === "all"}
            data-active={category === "all" ? "true" : undefined}
            onClick={() => setCategory("all")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={category === c}
              data-active={category === c ? "true" : undefined}
              onClick={() => setCategory(c)}
            >
              {TERM_CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <p className="rp-glossary-count">
        {results.length} term{results.length === 1 ? "" : "s"}
      </p>

      <ul className="rp-glossary-list">
        {results.map((term) => (
          <li key={term.id}>
            <header>
              <h2>
                <MetricExplain metric={term.id as TermId}>
                  {term.expandsTo ? `${term.expandsTo} (${term.term})` : term.term}
                </MetricExplain>
              </h2>
              <em>{TERM_CATEGORY_LABELS[term.category]}</em>
            </header>
            <p>{term.shortDefinition}</p>
            {term.example ? (
              <p className="rp-glossary-example">
                <span>Example</span>
                {term.example}
              </p>
            ) : null}
            {term.calculationDescription ? (
              <p className="rp-glossary-calc">
                <span>Calculation</span>
                {term.calculationDescription}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
