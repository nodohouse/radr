"use client";

import { useEffect, useMemo, useState } from "react";
import { getDecision } from "@/lib/lab/world";
import { DecisionBand } from "./DecisionBand";
import { RoleBand } from "./RoleBand";
import { RightRail } from "./RightRail";
import { ServiceBrief } from "./ServiceBrief";
import { ShiftPulseGraph } from "./ShiftPulseGraph";
import { useLab } from "./LabProvider";

export function ControlCenter() {
  const {
    world,
    lens,
    window,
    focusId,
    briefRole,
    receipt,
    setWindow,
    setFocus,
    setBriefRole,
    stageDecision,
    approveDecision,
  } = useLab();
  const [showBrief, setShowBrief] = useState(false);
  const [future, setFuture] = useState<string>("");

  const decision = useMemo(() => {
    return (
      getDecision(focusId) ??
      world.decisions.find((d) => d.id === world.heroDecisionId) ??
      world.decisions[0]
    );
  }, [focusId, world]);

  useEffect(() => {
    setFuture(decision?.recommendedFuture ?? "");
    setShowBrief(false);
  }, [decision?.id, decision?.recommendedFuture, world.seed, lens.role]);

  if (!decision) return null;

  const needs = world.decisions.filter((d) => d.status === "needs_you");

  return (
    <div className="lab-os-stack">
      <p className="sr-only">
        {lens.demoPath}. {needs.length} need you. {lens.subtitle}
      </p>
      <ShiftPulseGraph
        pulse={world.pulse}
        window={window}
        onWindow={setWindow}
        mode={lens.pulseMode}
        onTurbulence={(m) => {
          setFocus(m.decisionId);
          document.getElementById("decision-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      <div className="lab-workspace">
        <div className="lab-bands">
          <DecisionBand
            decision={decision}
            selectedFuture={future || decision.recommendedFuture}
            onFuture={setFuture}
            receipt={receipt}
            onStage={() => stageDecision(decision.id, future || decision.recommendedFuture)}
            onApprove={() => approveDecision(decision.id, future || decision.recommendedFuture)}
          />

          <RoleBand
            world={world}
            lens={lens}
            onOpenBrief={(packet) => {
              setBriefRole(packet);
              setShowBrief(true);
            }}
          />

          {showBrief ? (
            <ServiceBrief
              brief={world.brief}
              packet={briefRole}
              onPacket={setBriefRole}
              showDelta={world.brief.phase === "mid" || Boolean(world.pulse.turbulence.length)}
            />
          ) : null}
        </div>
        <RightRail
          world={world}
          decision={decision}
          recent={world.decisions.filter((d) => d.status !== "verified").slice(0, 3)}
        />
      </div>
    </div>
  );
}
