"use client";

/**
 * RoleProjection — same Decision, different role surface.
 * GM / CFO / FOH see different information by design.
 */

import { euro, ECON_D4102 } from "@/lib/marketing/publicDecisionEconomics";

export type RoleId = "cfo" | "gm" | "foh";

export type RoleCard = {
  id: RoleId;
  role: string;
  kicker: string;
  headline: string;
  lines: string[];
  tone?: "exposure" | "urgent" | "verified" | "neutral";
};

export const DEFAULT_ROLE_CARDS: RoleCard[] = [
  {
    id: "cfo",
    role: "CFO",
    kicker: "Finance",
    headline: `${euro(ECON_D4102.verified)} supplier recovery`,
    lines: [
      `${ECON_D4102.displayId} · contract vs invoice`,
      "Credit matched to original invoice",
      "Verified recovered",
    ],
    tone: "verified",
  },
  {
    id: "gm",
    role: "GM",
    kicker: "Operations",
    headline: "Wait 12 minutes",
    lines: [
      "Peak capacity · Berlin Mitte",
      "Kitchen 92% · 38 covers inbound",
      "€620 at stake vs seat-now",
    ],
    tone: "urgent",
  },
  {
    id: "foh",
    role: "Frontline",
    kicker: "RADR Floor",
    headline: "VIP · Table 12 · Allergy · Brief",
    lines: [
      "Nut allergy on file",
      "Mention Ribeye · cold station 92%",
      "FOH brief updated",
    ],
    tone: "neutral",
  },
];

export function RoleProjection({
  cards = DEFAULT_ROLE_CARDS,
  active,
  onSelect,
}: {
  cards?: RoleCard[];
  active?: RoleId;
  onSelect?: (id: RoleId) => void;
}) {
  return (
    <div className="rx-role-proj" role="list">
      {cards.map((c) => (
        <button
          key={c.id}
          type="button"
          role="listitem"
          className="rx-role-card"
          data-tone={c.tone}
          data-on={active === c.id ? "true" : undefined}
          onClick={() => onSelect?.(c.id)}
        >
          <em>
            {c.role}
            <span>{c.kicker}</span>
          </em>
          <strong>{c.headline}</strong>
          <ul>
            {c.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </button>
      ))}
    </div>
  );
}
