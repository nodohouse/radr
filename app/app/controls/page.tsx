"use client";

import { useMemo, useState } from "react";
import { useProduct } from "@/lib/product/store";
import { findingsForScope } from "@/lib/radr/findings";
import { operatorAttentionState } from "@/lib/radr/valueSemantics";
import { rolePrioritize } from "@/lib/radr/role/prioritize";
import { findingToDecision } from "@/lib/radr/decision/types";
import { AttentionReviewSheet } from "@/components/product/AttentionReviewSheet";
import { DecisionRow } from "@/components/product/DecisionRow";
import { PageHeader } from "@/components/product/PageHeader";
import { StatusCalm } from "@/components/product/StatusCalm";
import { formatFindingEuro } from "@/lib/radr/priorityFindings";
import { getRoleProfile } from "@/lib/radr/role/profiles";

/**
 * Actions — decisions ready for the operator (decision cockpit).
 */
export default function ControlsPage() {
  const { locationScope, roleView } = useProduct();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const profile = getRoleProfile(roleView);

  const findings = useMemo(
    () => findingsForScope(locationScope),
    [locationScope],
  );

  const ready = useMemo(() => {
    return rolePrioritize(findings, roleView, locationScope).filter((r) => {
      const s = operatorAttentionState(r.finding);
      return s === "READY_FOR_APPROVAL" || s === "NEEDS_YOU";
    });
  }, [findings, roleView, locationScope]);

  const decisions = useMemo(
    () => ready.map((r) => findingToDecision(r.finding, roleView)),
    [ready, roleView],
  );

  const total = decisions.reduce((s, d) => s + d.impactAmount, 0);
  const selectedDecision =
    decisions.find((d) => d.findingId === selectedId) ?? null;

  return (
    <div className="rp-attention">
      <PageHeader
        title="Actions"
        sub={
          decisions.length === 0
            ? "Nothing waiting for your decision."
            : `${formatFindingEuro(total)} across ${decisions.length} decision${decisions.length === 1 ? "" : "s"} · ${profile.shortLabel} lens`
        }
      />

      {decisions.length === 0 ? (
        <StatusCalm
          message="No decisions waiting."
          detail="RADR will prepare the next step when something needs you."
        />
      ) : (
        <ul className="rp-attention-list" aria-label="Ready decisions">
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

      <StatusCalm detail="Approvals stay with you. RADR prepares the work." />

      <AttentionReviewSheet
        decision={selectedDecision}
        roleView={roleView}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
