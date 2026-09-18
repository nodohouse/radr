"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CHECK_COUNTS,
  checksByArea,
  type CheckStatus,
} from "@/lib/product/demo/checks";
import { formatCompactEuro } from "@/lib/product/demo/command";
import { useProduct } from "@/lib/product/store";
import type { Area } from "@/lib/product/types";
import { PageHeader } from "@/components/product/PageHeader";
import { StatusCalm } from "@/components/product/StatusCalm";

type Filter = "all" | Area;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "buy", label: "Buy" },
  { id: "labor", label: "Labor" },
  { id: "sell", label: "Sell" },
  { id: "recover", label: "Recover" },
];

function statusLabel(s: CheckStatus) {
  if (s === "NEEDS_REVIEW") return "Needs review";
  if (s === "LEARNING") return "Learning";
  if (s === "PAUSED") return "Paused";
  return "Active";
}

function parseArea(raw: string | null): Filter {
  if (raw === "buy" || raw === "labor" || raw === "sell" || raw === "recover") {
    return raw;
  }
  return "all";
}

export default function ChecksClient() {
  const { locationScope } = useProduct();
  const params = useSearchParams();
  const [filter, setFilter] = useState<Filter>(() =>
    parseArea(params.get("area")),
  );
  const rows = useMemo(() => checksByArea(filter), [filter]);
  const needReview = CHECK_COUNTS.needReview;

  return (
    <div className="rp-attention">
      <PageHeader
        title="Checks"
        sub={
          needReview > 0
            ? `${needReview} need review · continuous reconciliations across systems.`
            : "Continuous reconciliations across your systems."
        }
      />

      <div className="rp-settings-roles" role="tablist" aria-label="Territory">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className="rp-btn-secondary"
            data-active={filter === f.id ? "true" : undefined}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <ul
        className="rp-attention-list"
        aria-label="Checks"
        style={{ marginTop: "1.5rem" }}
      >
        {rows.map((c) => (
          <li key={c.id} className="rp-attention-row">
            <div className="rp-attention-main">
              <p className="rp-attention-terr">{c.area.toUpperCase()}</p>
              <h2 className="rp-attention-issue">{c.name}</h2>
              <p className="rp-attention-meta">
                {c.rule}
                {c.lastChecked ? ` · Checked ${c.lastChecked}` : ""}
              </p>
            </div>
            <div className="rp-attention-money">
              <strong>
                {c.identified30d > 0
                  ? formatCompactEuro(c.identified30d)
                  : " - "}
              </strong>
              <span>{statusLabel(c.status)}</span>
            </div>
            <div className="rp-attention-cta">
              <Link href={`/app/checks/${c.id}`} className="rp-btn-secondary">
                Open
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <StatusCalm
        detail={`Scoped to current location context (${locationScope}).`}
      />
    </div>
  );
}
