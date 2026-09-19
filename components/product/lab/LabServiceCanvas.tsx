"use client";

import { useLab } from "./LabContext";
import { LAB_CANON } from "./labState";

/**
 * LAB Service workspace — time / pressure control surface (minimal).
 */
export function LabServiceCanvas() {
  const { derived, goCenter, setNode } = useLab();

  return (
    <div className="lab-viewport lab-viewport-service">
      <div className="lab-service">
        <p className="lab-service-kicker">{LAB_CANON.property}</p>
        <h1 className="lab-service-title">{LAB_CANON.now}</h1>
        <div className="lab-service-metrics">
          <button type="button" onClick={() => setNode("floor")}>
            <strong>{derived.floorPct}%</strong>
            <span>Occupancy</span>
          </button>
          <button type="button" onClick={() => setNode("kitchen")}>
            <strong>{derived.kitchenPct}%</strong>
            <span>Kitchen</span>
          </button>
          <button type="button" onClick={() => setNode("inbound")}>
            <strong>{derived.inbound}</strong>
            <span>Inbound</span>
          </button>
          <button type="button" onClick={() => setNode("turns")}>
            <strong>{derived.turnRisk}</strong>
            <span>Turns exposed</span>
          </button>
        </div>
        <button type="button" className="lab-service-back" onClick={goCenter}>
          ← Center
        </button>
      </div>
    </div>
  );
}
