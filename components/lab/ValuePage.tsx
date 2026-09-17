"use client";

import { VALUE_ROWS } from "@/lib/lab/world";
import { BecauseMoney } from "./BecauseMoney";
import { ShiftPulseGraph } from "./ShiftPulseGraph";
import { StoryCard } from "./StoryCard";
import { useLab } from "./LabProvider";

export function ValuePage() {
  const { world, window, setWindow, setFocus, lens } = useLab();

  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">{world.serviceLabel} · money truth</p>
          <h1 className="lab-h lab-h1">Expected stays Expected until Trace seals</h1>
          <p className="lab-lead">
            {lens.role === "cfo"
              ? "Pulse in / out / forecast. Recover is the leak. Verified is lineage."
              : "Shift Pulse + win/loss. Demo math is never Verified."}
          </p>
        </div>
      </div>

      <ShiftPulseGraph
        pulse={world.pulse}
        window={window}
        onWindow={setWindow}
        mode={lens.pulseMode}
        onTurbulence={(m) => setFocus(m.decisionId)}
      />

      <div className="lab-story-grid lab-story-grid-lg" style={{ marginTop: "1rem" }}>
        {world.winLoss.map((row) => (
          <StoryCard
            key={row.id}
            href={row.href}
            kicker={row.title}
            title={row.money.grade === "Verified" ? "Where we protected" : "Where we leak"}
            euro={row.money.euro}
            grade={row.money.grade}
            because={row.money.because}
            lineage={row.money.lineage}
            cta={row.money.grade === "Verified" ? "Open ledger" : "Open Recover · Trace"}
            wash={row.money.grade === "Verified" ? "mint" : "sand"}
          />
        ))}
      </div>

      <section className="lab-band" style={{ marginTop: "1rem" }}>
        <div className="lab-band-head">
          <div>
            <p className="lab-kicker">Ladder</p>
            <h2 className="lab-h lab-h2">Identified → Expected → Observed → Attributed → Verified</h2>
          </div>
        </div>
        <div className="lab-board" style={{ padding: "0 1.1rem 1.15rem" }}>
          {VALUE_ROWS.map((row) => (
            <article
              key={row.id}
              className="lab-card"
              data-wash={row.money.grade === "Verified" ? "mint" : "sand"}
            >
              <p className="lab-kicker">
                {row.displayId} · {row.stage}
              </p>
              <h3 className="lab-h" style={{ fontSize: "1.15rem" }}>
                {row.title}
              </h3>
              <BecauseMoney {...row.money} />
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
