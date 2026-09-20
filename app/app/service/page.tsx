"use client";

import Link from "next/link";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { ServiceFloorCanvas } from "@/components/product/canvas/ServiceFloorCanvas";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import {
  canalRoomSnapshot,
  chiadoUnitSnapshot,
} from "@/data/demo/serviceMap";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { IntelligenceCanvas } from "@/components/product/canvas/IntelligenceCanvas";

/**
 * Service Map — SVG architectural floor for Berlin; hotel/apt fallback.
 */
export default function ServiceMapPage() {
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const berlinOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id);
  const canalOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.canal.id);
  const chiadoOk = ctx.allowedLocationIds.includes(DEMO_LOCATIONS.chiado.id);

  if (
    ctx.defaultLocationId === DEMO_LOCATIONS.canal.id ||
    (!berlinOk && canalOk)
  ) {
    const snap = canalRoomSnapshot();
    return (
      <div className="rp-service-map">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Service Map</p>
          <h1 className="rp-cc-title">Rooms</h1>
        </header>
        <IntelligenceCanvas kicker={snap.at} title={snap.phase}>
          <p className="rp-drec-quiet">
            {snap.occupancyPct}% occupied · hotel vertical · DEMO
          </p>
          {snap.decisionId ? (
            <Link href={`/app/decisions/${snap.decisionId}`}>
              {displayDecisionId(snap.decisionId)}
            </Link>
          ) : null}
        </IntelligenceCanvas>
      </div>
    );
  }

  if (
    ctx.defaultLocationId === DEMO_LOCATIONS.chiado.id ||
    (!berlinOk && !canalOk && chiadoOk)
  ) {
    const snap = chiadoUnitSnapshot();
    return (
      <div className="rp-service-map">
        <header className="rp-ledger-head">
          <p className="rp-cc-kicker">Service Map</p>
          <h1 className="rp-cc-title">Units</h1>
        </header>
        <IntelligenceCanvas kicker={snap.at} title={snap.phase}>
          <p className="rp-drec-quiet">
            {snap.occupancyPct}% · {formatDecisionMoney(0)} · DEMO
          </p>
        </IntelligenceCanvas>
      </div>
    );
  }

  return (
    <div className="rp-service-map">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Service Map</p>
        <h1 className="rp-cc-title">Floor</h1>
        <p className="rp-cc-since">
          Physical capacity · connected to Futures · {ctx.shortLabel} · DEMO
        </p>
      </header>
      <ServiceFloorCanvas />
    </div>
  );
}
