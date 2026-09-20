"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import {
  lifecycleLabel,
  type AttentionBand,
} from "@/lib/radr/decision/lifecycle";
import { useProduct } from "@/lib/product/store";
import { scopedDecisions, recordAttention } from "@/lib/radr/product/roleScope";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { roleContextFor } from "@/lib/radr/product/personas";

const BANDS: { id: AttentionBand | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "needs_you", label: "Needs you" },
  { id: "handling", label: "Handling" },
  { id: "watching", label: "Watching" },
  { id: "verified", label: "Verified" },
  { id: "learned", label: "Learned" },
];

function parseBand(raw: string | null): AttentionBand | "all" {
  if (!raw) return "all";
  if (BANDS.some((b) => b.id === raw)) return raw as AttentionBand | "all";
  return "all";
}

export function DecisionLedger() {
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const search = useSearchParams();
  const [band, setBand] = useState<AttentionBand | "all">(() =>
    parseBand(search.get("band")),
  );

  const rows = useMemo(() => {
    const scoped = scopedDecisions(Object.values(snap.records), roleView);
    if (band === "all") return scoped;
    return scoped.filter((r) => recordAttention(r) === band);
  }, [band, roleView, snap]);

  return (
    <div className="rp-ledger">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Decisions</p>
        <h1 className="rp-cc-title">Decision Ledger</h1>
        <p className="rp-cc-since">
          Material Decisions from detection through learning · {ctx.shortLabel}
        </p>
      </header>

      <div className="rp-ledger-filters" role="tablist" aria-label="Attention">
        {BANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="tab"
            aria-selected={band === b.id}
            className="rp-ledger-filter"
            data-active={band === b.id ? "true" : undefined}
            onClick={() => setBand(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rp-cc-empty-copy">
          Everything is operating within expectations.
        </p>
      ) : (
        <ul className="rp-ledger-list">
          {rows.map((r) => {
            const attn = recordAttention(r);
            const metric = formatPrimaryMetric(r);
            return (
              <li key={r.id}>
                <Link
                  href={`/app/decisions/${r.id}`}
                  className="rp-ledger-row"
                >
                  <span className="rp-cc-id">{displayDecisionId(r.id)}</span>
                  <span className="rp-ledger-title">{r.title}</span>
                  <span className="rp-ledger-loc">{r.property}</span>
                  <span className="rp-ledger-terr">
                    {(r.territories ?? []).join(" · ") || "—"}
                  </span>
                  <span className="rp-ledger-state" data-band={attn}>
                    {lifecycleLabel(r.status)}
                  </span>
                  <span className="rp-ledger-metric">
                    {metric ? `${metric.money} · ${metric.caption}` : "—"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
