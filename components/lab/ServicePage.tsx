"use client";

import { ServiceBrief } from "./ServiceBrief";
import { useLab } from "./LabProvider";

export function ServicePage() {
  const { world, briefRole, setBriefRole } = useLab();
  return (
    <div className="lab-page">
      <p className="lab-kicker">Airline-style role packets · ~90m</p>
      <h1 className="lab-h lab-h1">Service Brief</h1>
      <p className="lab-lead">
        Chef / FOH / GM / CFO. Mid-service delta when Pulse turbulence or a new Needs-you lands.
      </p>
      <div style={{ marginTop: "1rem" }}>
        <ServiceBrief brief={world.brief} packet={briefRole} onPacket={setBriefRole} />
      </div>
    </div>
  );
}
