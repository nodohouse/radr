"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
} from "@/lib/radr/decision/store";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import {
  scopedDecisions,
  recordAttention,
} from "@/lib/radr/product/roleScope";
import {
  ALL_DEMO_LOCATION_IDS,
  DEMO_LOCATIONS,
  DEMO_ORG,
  locationDisplayName,
} from "@/lib/radr/product/demoOrg";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import { sceneForLocation } from "@/data/demo/visualAssets";

const LOCATION_META = [
  {
    id: DEMO_LOCATIONS.berlin.id,
    vertical: "Restaurant",
  },
  {
    id: DEMO_LOCATIONS.canal.id,
    vertical: "Boutique hotel",
  },
  {
    id: DEMO_LOCATIONS.chiado.id,
    vertical: "Serviced apartments",
  },
] as const;

export default function LocationsPage() {
  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);

  const rows = useMemo(() => {
    const scoped = scopedDecisions(Object.values(snap.records), roleView);
    const ids =
      ctx.scopeType === "LOCATION"
        ? ctx.allowedLocationIds
        : ALL_DEMO_LOCATION_IDS;
    return LOCATION_META.filter((loc) => ids.includes(loc.id)).map((loc) => {
      const here = scoped.filter((r) => r.locationId === loc.id);
      const needs = here.filter((r) => recordAttention(r) === "needs_you")
        .length;
      const handling = here.filter(
        (r) => recordAttention(r) === "handling",
      ).length;
      const verified = here
        .filter((r) => r.verifiedValue)
        .reduce((s, r) => s + (r.verifiedValue?.amount ?? 0), 0);
      return {
        ...loc,
        needs,
        handling,
        verified,
        count: here.length,
        scene: sceneForLocation(loc.id),
      };
    });
  }, [snap, roleView, ctx]);

  return (
    <div className="rp-locations rp-locations-elevated">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Locations</p>
        <h1 className="rp-cc-title">
          {ctx.scopeType === "LOCATION" ? "Operating context" : "Locations"}
        </h1>
        <p className="rp-cc-since">
          Attention, outcomes and operating state · {DEMO_ORG.shortName} ·{" "}
          {ctx.shortLabel}
        </p>
      </header>

      <ul className="rp-loc-grid">
        {rows.map((loc) => (
          <li key={loc.id} className="rp-loc-card">
            {loc.scene ? (
              <OperatingScene asset={loc.scene} aspect="3/2" />
            ) : null}
            <div className="rp-loc-body">
              <h2>{locationDisplayName(loc.id)}</h2>
              <p className="rp-loc-vert">{loc.vertical}</p>
              <p className="rp-loc-attn">
                {loc.needs > 0
                  ? `${loc.needs} need you`
                  : loc.handling > 0
                    ? `${loc.handling} handling`
                    : "Quiet"}
              </p>
              <p className="rp-loc-value">
                {loc.verified > 0
                  ? `${formatDecisionMoney(loc.verified)} verified · DEMO`
                  : `${loc.count} Decisions`}
              </p>
              <Link href="/app/decisions" className="rp-drec-secondary">
                Open Decisions
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
