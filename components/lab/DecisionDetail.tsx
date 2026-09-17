"use client";

import { useState } from "react";
import { getDecision } from "@/lib/lab/world";
import { DecisionBand } from "./DecisionBand";
import { useLab } from "./LabProvider";

export function DecisionDetail({ id }: { id: string }) {
  const decision = getDecision(id);
  const { receipt, stageDecision, approveDecision, setSeed } = useLab();
  const [future, setFuture] = useState(decision?.recommendedFuture ?? "");

  if (!decision) return null;

  return (
    <div className="lab-page">
      <p className="lab-kicker">
        Decision · {decision.wedge} · seed {decision.seed}
      </p>
      <DecisionBand
        decision={decision}
        selectedFuture={future || decision.recommendedFuture}
        onFuture={setFuture}
        receipt={receipt}
        onStage={() => {
          setSeed(decision.seed);
          stageDecision(decision.id, future || decision.recommendedFuture);
        }}
        onApprove={() => {
          setSeed(decision.seed);
          approveDecision(decision.id, future || decision.recommendedFuture);
        }}
      />
    </div>
  );
}
