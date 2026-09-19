"use client";

/**
 * Same RADR · different person.
 * Desktop Decision + operational field surface — no second phone chassis.
 */

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import type { RoleId } from "@/components/marketing/kinetic/RoleProjection";

const ROLE_ORDER: RoleId[] = ["cfo", "gm", "foh"];

const ROLE_TAB: Record<RoleId, string> = {
  cfo: "CFO",
  gm: "GM",
  foh: "Floor",
};

const SCENES: Record<
  RoleId,
  {
    deskK: string;
    headline: string;
    lines: string[];
    tone?: "exposure" | "urgent" | "verified" | "neutral";
    field: {
      badge: string;
      title: string;
      body: string;
      cta: string;
    };
  }
> = {
  cfo: {
    deskK: "CFO · Finance",
    headline: "€273 supplier recovery",
    lines: ["Contract vs invoice", "Dispute staged", "Credit path open"],
    tone: "exposure",
    field: {
      badge: "Recover",
      title: "€273 supplier recovery",
      body: "Evidence package ready.",
      cta: "Review case",
    },
  },
  gm: {
    deskK: "GM · Operations",
    headline: "WAIT 12 MINUTES",
    lines: ["Peak capacity · Berlin Mitte", "€620 expected", "Kitchen pressure at 19:00"],
    tone: "urgent",
    field: {
      badge: "Needs you",
      title: "WAIT 12 MINUTES",
      body: "€620 expected.",
      cta: "Approve?",
    },
  },
  foh: {
    deskK: "Floor · FOH",
    headline: "VIP · TABLE 12",
    lines: ["Nut allergy on file", "Seat by 18:50", "FOH brief updated"],
    tone: "neutral",
    field: {
      badge: "FOH brief",
      title: "VIP · TABLE 12",
      body: "Nut allergy · Seat by 18:50.",
      cta: "Got it",
    },
  },
};

export function RoleProjectionStrip() {
  const [role, setRole] = useState<RoleId>("cfo");
  const scene = SCENES[role];

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
        <article className="rx-role-desk" data-tone={scene.tone}>
          <p className="rx-role-desk-k">{scene.deskK}</p>
          <h3>{scene.headline}</h3>
          <ul>
            {scene.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
          <p className="rx-role-desk-foot">Same Decision system · different truth</p>
        </article>

        <aside className="rx-role-field" aria-label="Field surface">
          <p className="rx-role-field-badge">{scene.field.badge}</p>
          <h3>{scene.field.title}</h3>
          <p>{scene.field.body}</p>
          <span className="rx-role-field-cta">{scene.field.cta}</span>
        </aside>
      </div>

      <Link href="/product/floor" className="rx-btn rx-btn-ghost">
        Explore RADR Floor <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
