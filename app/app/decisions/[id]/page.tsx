"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DecisionRecordView } from "@/components/product/decision/DecisionRecordView";
import {
  getDecisionRecord,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import { buildPeakDecisionRecord } from "@/lib/radr/decision/demos/peak";
import { buildTunaStructuralDecision } from "@/lib/radr/decision/demos/tuna";
import type { DecisionRecord } from "@/lib/radr/decision/record";

function resolveRecord(id: string): DecisionRecord | undefined {
  const fromStore = getDecisionRecord(id);
  if (fromStore) return fromStore;
  if (id === DECISION_IDS.peak) return buildPeakDecisionRecord();
  if (id === DECISION_IDS.tunaStructural) return buildTunaStructuralDecision();
  return undefined;
}

export default function DecisionDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => subscribeDecisionStore(refresh), [refresh]);

  const record = id ? resolveRecord(id) : undefined;

  if (!record) {
    return (
      <div className="rp-drec rp-drec-missing">
        <p>Decision not found.</p>
        <Link href="/app">← Control Center</Link>
      </div>
    );
  }

  return <DecisionRecordView record={record} onChange={refresh} />;
}
