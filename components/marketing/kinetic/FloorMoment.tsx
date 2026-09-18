"use client";

/**
 * FloorMoment — home / platform depth beat.
 * Recovery stays primary. Floor proves the Decision layer reaches FOH.
 * Does NOT replace POS.
 */

import { useState } from "react";
import {
  DEFAULT_ROLE_CARDS,
  RoleProjection,
  type RoleId,
} from "./RoleProjection";
import { DeviceScene } from "./DeviceScene";

export function FloorMoment({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [active, setActive] = useState<RoleId>("foh");

  return (
    <div className="rx-floor-moment" data-compact={compact ? "true" : undefined}>
      <p className="rx-rec-k">RADR Floor</p>
      <h2 className="rx-rec-h">From finance to the floor.</h2>
      <p className="rx-rec-p">
        The Decision layer reaches the floor — without replacing the POS.
      </p>
      <p className="rx-rec-p rx-rec-muted">
        Toast, Lightspeed, Square, Oracle, Clover keep order entry, kitchen
        routing, payment, tips, and receipts. RADR Floor gives FOH context,
        recommendation, and service intelligence in the moment.
      </p>

      <RoleProjection
        cards={DEFAULT_ROLE_CARDS}
        active={active}
        onSelect={setActive}
      />

      <DeviceScene
        desktop={{
          title: "Wait 12 minutes",
          body: "Peak capacity · kitchen pressure · covers inbound.",
          meta: "D-1911 · needs you",
        }}
        phone={{
          title: "€273 Verified",
          body: "Supplier credit matched to INV-88421.",
          meta: "D-4102 · DEMO · ILLUSTRATIVE",
        }}
        floor={{
          title: "Table 12",
          body: "VIP · nut allergy · last: Ribeye + Malbec",
          meta: "Recommend: feature ribeye · avoid Tuna Tataki",
          note: "Reason: higher contribution · lower constrained-station load.",
        }}
      />

      <div className="rx-floor-foh" aria-label="FOH guidance example">
        <div className="rx-floor-foh-head">
          <em>Table 7 · 4 guests · peak service</em>
          <span>RECOMMEND</span>
        </div>
        <div className="rx-floor-foh-compare">
          <div data-rec="true">
            <strong>Charred cabbage</strong>
            <em>€13.70 contribution · 4m prep</em>
          </div>
          <span>instead of</span>
          <div>
            <strong>Tuna Tataki</strong>
            <em>€14.20 contribution · 11m constrained prep</em>
          </div>
        </div>
        <p className="rx-floor-foh-why">
          Cold station pressure &gt;90%. Contribution-aware · capacity-aware ·
          guest-aware — not generic upselling.
        </p>
      </div>

      <p className="rx-pilot-note">
        Illustrative Floor guidance · POS remains system of execution for orders
        and payments. Deep-link / pre-fill may come later — not claimed as built.
      </p>
    </div>
  );
}
