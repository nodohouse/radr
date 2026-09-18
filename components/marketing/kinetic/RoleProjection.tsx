"use client";

/**
 * RoleProjection — same Decision, different role surface.
 * GM / CFO / FOH see different information by design.
 */

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
    kicker: "Economics",
    headline: "€590 protected · D-1911",
    lines: [
      "Expected €620 · observed €590",
      "Variance −€30 · −4.8%",
      "Verified after service",
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
    role: "FOH",
    kicker: "RADR Floor",
    headline: "Hold T12 · VIP 18:50",
    lines: [
      "Nut allergy on file",
      "Mention Ribeye · cold station 92%",
      "No group economics on Floor",
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
