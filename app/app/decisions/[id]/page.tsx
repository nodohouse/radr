"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DecisionRecordView } from "@/components/product/decision/DecisionRecordView";
import { DecisionContextSync } from "@/components/product/decision/DecisionContextSync";
import {
  getDecisionRecord,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { buildPeakDecisionRecord } from "@/lib/radr/decision/demos/peak";
import { buildTunaStructuralDecision } from "@/lib/radr/decision/demos/tuna";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { applyDecisionContextFromId } from "@/lib/product/radrContext/resolveEntityContext";
import { resolveCanonicalDecisionId } from "@/lib/radr/decision/aliases";

function resolveRecord(id: string): DecisionRecord | undefined {
  const canonical = resolveCanonicalDecisionId(id);
  const fromStore = getDecisionRecord(canonical);
  if (fromStore) return fromStore;
  if (canonical === DECISION_IDS.peak) return buildPeakDecisionRecord();
  if (canonical === DECISION_IDS.tunaStructural) {
    return buildTunaStructuralDecision();
  }
  return undefined;
}

export default function DecisionDetailPage() {
  const params = useParams<{ id: string }>();
  const rawId = params.id;
  const id = rawId ? resolveCanonicalDecisionId(rawId) : rawId;
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => subscribeDecisionStore(refresh), [refresh]);

  useEffect(() => {
    if (!id) return;
    applyDecisionContextFromId(id);
  }, [id]);

  const record = id ? resolveRecord(id) : undefined;

  if (!record) {
    return (
      <div className="rp-drec rp-drec-missing">
        <p>Decision not found.</p>
        <Link href="/app">← Control Center</Link>
      </div>
    );
  }

  return (
    <>
      <DecisionContextSync decisionId={record.id} record={record} />
      <DecisionRecordView record={record} onChange={refresh} />
    </>
  );
}
