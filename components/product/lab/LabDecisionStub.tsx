"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { useLab } from "./LabContext";

function resolveId(slug: string): string {
  const key = slug.toLowerCase();
  if (key === "d-7501" || key === "margin") return DECISION_IDS.marginCoke;
  if (key === "d-4102" || key === "supplier") return DECISION_IDS.supplier;
  if (key === "d-7110" || key === "menu") return DECISION_IDS.menuPeak;
  return slug;
}

/** Compact Decision object for non-peak immersions in LAB. */
export function LabDecisionStub({ slug }: { slug: string }) {
  const { goCenter, setMode, goDecision } = useLab();
  const id = resolveId(slug);
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const record = snap.records[id];
  const metric = useMemo(
    () => (record ? formatPrimaryMetric(record) : null),
    [record],
  );

  if (!record) {
    return (
      <div className="lab-viewport lab-viewport-decisions">
        <div className="lab-decisions">
          <p className="lab-memory-kicker">Decision</p>
          <h1 className="lab-memory-title">Not in scope</h1>
          <button type="button" className="lab-service-back" onClick={goCenter}>
            ← Center
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-viewport lab-viewport-decisions">
      <div className="lab-decisions">
        <p className="lab-memory-kicker">{displayDecisionId(id)}</p>
        <h1 className="lab-memory-title">
          {(record.recommendationHeadline ?? record.title)
            .split("—")[0]
            ?.trim() ?? record.title}
        </h1>
        {metric ? (
          <p className="lab-memory-body">
            {metric.money} · {record.decisionDeadline ?? record.decisionHorizon}
          </p>
        ) : null}
        <div className="lab-memory-traj" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            className="lab-memory-learn"
            onClick={() => setMode("why")}
          >
            <em>Why</em>
            <strong>Evidence chain</strong>
          </button>
          <button
            type="button"
            className="lab-memory-learn"
            onClick={() => goDecision(DECISION_IDS.peak, "futures")}
          >
            <em>Peak</em>
            <strong>Compare via D-1911 Futures</strong>
          </button>
          <button type="button" className="lab-service-back" onClick={goCenter}>
            ← Center
          </button>
        </div>
      </div>
    </div>
  );
}
