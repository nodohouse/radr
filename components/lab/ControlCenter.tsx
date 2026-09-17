"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATALOG, getDecision } from "@/lib/lab/world";
import { BecauseMoney } from "./BecauseMoney";
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
    pins,
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

  const pinMods = CATALOG.filter((m) => pins.includes(m.id));
  const needs = world.decisions.filter((d) => d.status === "needs_you");

  return (
    <div className="lab-workspace">
      <div className="lab-bands">
        <div className="lab-band-head" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div>
            <p className="lab-kicker">{lens.demoPath}</p>
            <h1 className="lab-h lab-h1">{lens.title}</h1>
            <p className="lab-lead">{lens.subtitle}</p>
          </div>
          <p className="lab-kicker">
            {needs.length} need you · Buy · Sell · Labor · Recover
          </p>
        </div>

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

        {showBrief || lens.role !== "clevel" ? (
          showBrief ? (
            <ServiceBrief
              brief={world.brief}
              packet={briefRole}
              onPacket={setBriefRole}
              showDelta={world.brief.phase === "mid" || Boolean(world.pulse.turbulence.length)}
            />
          ) : null
        ) : null}

        <section className="lab-band" aria-labelledby="pins-title">
          <div className="lab-band-head">
            <div>
              <p className="lab-kicker">Below the fold</p>
              <h2 id="pins-title" className="lab-h lab-h2">
                My modules
              </h2>
              <p className="lab-lead">Pins follow the role lens. Catalog lives on its own page.</p>
            </div>
            <Link className="lab-btn" href="/app/lab/my-center">
              Edit in Catalog
            </Link>
          </div>
          <div className="lab-pins">
            {pinMods.map((m) => (
              <Link key={m.id} href={m.href} className="lab-pin">
                <p className="lab-pin-id">
                  {m.displayId ?? m.category} · {m.category}
                </p>
                <p className="lab-h" style={{ fontSize: "1.05rem" }}>
                  {m.title}
                </p>
                {m.euro ? (
                  <BecauseMoney euro={m.euro} grade={m.grade === "Playbook" ? "Expected" : m.grade} because={m.because} />
                ) : (
                  <p className="lab-because">{m.because}</p>
                )}
                {m.clock ? <p className="lab-clock">{m.clock}</p> : null}
              </Link>
            ))}
          </div>
        </section>
      </div>
      <RightRail
        world={world}
        decision={decision}
        recent={world.decisions.filter((d) => d.status !== "verified").slice(0, 4)}
      />
    </div>
  );
}
