"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { locationLabel } from "@/lib/product/demo/dashboard";
import { useProduct } from "@/lib/product/store";
import type { Area } from "@/lib/product/types";
import type { TerritoryCode } from "@/lib/radr/priorityFindings";
import { findingsForScope } from "@/lib/radr/findings";
import { isFindingOpen } from "@/lib/radr/domain";
import { findingToDecision } from "@/lib/radr/decision/types";
import { AttentionReviewSheet } from "@/components/product/AttentionReviewSheet";
import { DecisionRow } from "@/components/product/DecisionRow";
import { PageHeader } from "@/components/product/PageHeader";
import { StatusCalm } from "@/components/product/StatusCalm";

const FRAME: Record<Area, { title: string; line: string; code: TerritoryCode }> =
  {
    buy: { title: "Buy", line: "Spend that needs a decision.", code: "BUY" },
    labor: { title: "Labor", line: "Staffing that needs a decision.", code: "LABOR" },
    sell: {
      title: "Sell",
      line: "Recover perishable revenue · recommend what fits the guest.",
      code: "SELL",
    },
    recover: {
      title: "Recover",
      line: "Money owed that needs a decision.",
      code: "RECOVER",
    },
  };

type Props = { area: Area };

/**
 * Territory depth - PageHeader + DecisionRow filtered by territory.
 * Not a four-widget dashboard.
 */
export function TerritoryWorkspace({ area }: Props) {
  const { locationScope, roleView } = useProduct();
  const frame = FRAME[area];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const decisions = useMemo(() => {
    return findingsForScope(locationScope)
      .filter((f) => isFindingOpen(f.status) && f.territory === frame.code)
      .map((f) => findingToDecision(f, roleView));
  }, [locationScope, frame.code, roleView]);

  const primary = decisions[0] ?? null;
  const selected = decisions.find((d) => d.findingId === selectedId) ?? null;

  useEffect(() => {
    if (!primary) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#problem") return;
    const el = document.getElementById("problem");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [primary]);

  return (
    <div className="rp-attention">
      <PageHeader title={frame.title} sub={frame.line} />

      {decisions.length === 0 ? (
        <StatusCalm
          message={`Nothing open in ${frame.title}.`}
          detail={`No financially material findings in ${locationLabel(locationScope)}.`}
        />
      ) : (
        <ul
          className="rp-attention-list"
          aria-label={`${frame.title} decisions`}
          id="problem"
        >
          {decisions.map((d) => (
            <DecisionRow
              key={d.id}
              decision={d}
              title={d.situation}
              onReview={() => setSelectedId(d.findingId)}
              reviewLabel="Review"
            />
          ))}
        </ul>
      )}

      <p className="rp-attention-meta" style={{ marginTop: "1.75rem" }}>
        <Link href="/app/findings">All findings</Link>
        {" · "}
        <Link href={`/app/checks?area=${area}`}>Checks</Link>
      </p>

      <StatusCalm detail="Territories are lenses - not four giant dashboards." />

      <AttentionReviewSheet
        decision={selected}
        roleView={roleView}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
