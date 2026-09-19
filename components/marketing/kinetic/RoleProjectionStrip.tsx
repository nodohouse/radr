"use client";

/**
 * Same RADR · different person.
 * Role selector drives desktop Decision + field phone.
 */

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  DEFAULT_ROLE_CARDS,
  type RoleId,
} from "@/components/marketing/kinetic/RoleProjection";
import {
  RadrPhone,
  type RadrPhoneState,
} from "@/components/marketing/scenes/home/RadrPhone";

const ROLE_ORDER: RoleId[] = ["cfo", "gm", "foh"];

const ROLE_TAB: Record<RoleId, string> = {
  cfo: "CFO",
  gm: "GM",
  foh: "Floor",
};

const PHONE: Record<RoleId, RadrPhoneState> = {
  cfo: {
    id: "role-cfo",
    role: "Finance",
    badge: "Recover · approval",
    title: "€273 credit path",
    body: "Dispute staged. Evidence package ready for AP.",
    meta: "D-4102 · Berlin Mitte",
    primary: "Approve recover",
    tone: "verified",
  },
  gm: {
    id: "role-gm",
    role: "GM",
    badge: "Urgent Decision",
    title: "Wait 12 minutes",
    body: "Peak capacity · kitchen 92% · €620 vs seat-now.",
    meta: "D-1911 · Dinner",
    primary: "Hold the line",
    tone: "urgent",
  },
  foh: {
    id: "role-foh",
    role: "Floor",
    badge: "FOH brief",
    title: "VIP · Table 12",
    body: "Nut allergy on file. Hold cold station. Mention Ribeye.",
    meta: "18:42 · Dinner service",
    primary: "Got it",
    tone: "brief",
  },
};

export function RoleProjectionStrip() {
  const [role, setRole] = useState<RoleId>("cfo");
  const card = DEFAULT_ROLE_CARDS.find((c) => c.id === role)!;
  const phone = PHONE[role];

  return (
    <div className="rx-role-strip rx-role-strip-scene">
      <header>
        <p className="rx-rec-k">Across the operation</p>
        <h2 className="rx-rec-h">Same RADR. Different person.</h2>
      </header>

      <div className="rx-role-tabs" role="tablist" aria-label="Role">
        {ROLE_ORDER.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={role === id}
            data-on={role === id ? "true" : undefined}
            onClick={() => setRole(id)}
          >
            {ROLE_TAB[id]}
          </button>
        ))}
      </div>

      <div className="rx-role-stage" data-role={role}>
        <article className="rx-role-desk" data-tone={card.tone}>
          <p className="rx-role-desk-k">
            {card.role} · {card.kicker}
          </p>
          <h3>{card.headline}</h3>
          <ul>
            {card.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="rx-role-desk-foot">Same Decision system · different truth</p>
        </article>

        <RadrPhone state={phone} highlight className="rx-role-phone" />
      </div>

      <Link href="/product/floor" className="rx-btn rx-btn-ghost">
        Explore RADR Floor <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
