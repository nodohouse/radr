"use client";

import { ROLE_LENSES } from "@/lib/lab/roles";
import { useLab } from "@/lib/lab/store";
import { DecisionBand } from "./DecisionBand";
import { RightRail } from "./RightRail";
import { RoleBand } from "./RoleBand";
import { ServiceBrief } from "./ServiceBrief";
import { ShiftPulseGraph } from "./ShiftPulseGraph";

export function ControlCenter() {
  const { nav, setCenterView, goCatalog } = useLab();
  const lens = ROLE_LENSES[nav.role];
  const briefOn = nav.centerView === "brief" && lens.showBrief;

  return (
    <div className="lab-board" data-role={nav.role} data-view={nav.centerView}>
      <div className="lab-board-band">
        <div>
          <h1 className="lab-board-title">{lens.title}</h1>
          <p className="lab-board-sub">
            {lens.subtitle} · {lens.note}
          </p>
          <p className="lab-board-demo">{lens.demoPath}</p>
        </div>
        <div className="lab-board-band-actions">
          {lens.showBrief ? (
            <>
              <button
                type="button"
                className="lab-board-band-btn"
                data-primary={!briefOn || undefined}
                onClick={() => setCenterView("ops")}
              >
                Ops
              </button>
              <button
                type="button"
                className="lab-board-band-btn"
                data-primary={briefOn || undefined}
                onClick={() => setCenterView("brief")}
              >
                Brief
              </button>
            </>
          ) : null}
          <button type="button" className="lab-board-band-btn" onClick={goCatalog}>
            Catalog
          </button>
        </div>
      </div>

      {briefOn ? (
        <div className="lab-board-layout lab-board-layout-brief">
          <ServiceBrief />
        </div>
      ) : (
        <div className="lab-board-layout">
          <div className="lab-board-main">
            <ShiftPulseGraph />
            <DecisionBand />
            <RoleBand />
          </div>
          <RightRail />
        </div>
      )}
    </div>
  );
}
