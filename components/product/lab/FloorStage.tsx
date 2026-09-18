"use client";

/**
 * Floor stage — photographed room as hero medium with table hotspots.
 * Rich table card on focus (not a tooltip).
 */

import { useState } from "react";
import { objectPosition } from "@/data/demo/visualAssets";
import { VISUAL_ASSETS } from "@/data/demo/visualAssets";

type Table = {
  id: string;
  label: string;
  zone: "Main" | "Bar" | "Terrace";
  x: number; // %
  y: number;
  state: "occ" | "open" | "reserved" | "turn";
  why: string;
  party?: string;
};

const TABLES: Table[] = [
  { id: "a3", label: "A3", zone: "Main", x: 28, y: 42, state: "reserved", why: "Reserved · inbound covers claim this seat", party: "2 inbound · 22m" },
  { id: "a5", label: "A5", zone: "Main", x: 48, y: 48, state: "open", why: "Open · available after clear" },
  { id: "a7", label: "A7", zone: "Main", x: 38, y: 62, state: "turn", why: "Turn risk · second seating after inbound wave", party: "4 · dessert clearing" },
  { id: "a8", label: "A8", zone: "Main", x: 58, y: 58, state: "turn", why: "Turn risk · cold-station constrained if seat-now", party: "2 · mains out" },
  { id: "b3", label: "B3", zone: "Bar", x: 78, y: 36, state: "turn", why: "Turn risk · bar party blocking peak tables", party: "3 · lingering" },
  { id: "t1", label: "T1", zone: "Terrace", x: 72, y: 72, state: "reserved", why: "Reserved · inbound covers claim this seat", party: "4 inbound · 19:00" },
  { id: "t3", label: "T3", zone: "Terrace", x: 88, y: 68, state: "turn", why: "Turn risk · terrace under-served if kitchen slips" },
];

const STATE_LABEL = {
  occ: "Seated",
  open: "Open",
  reserved: "Reserved",
  turn: "Turn risk",
} as const;

const ZONE_PHOTO = {
  Main: VISUAL_ASSETS.locations.berlinMitte,
  Bar: VISUAL_ASSETS.locations.berlinKitchen,
  Terrace: {
    src: "/demo/facilities/berlin-terrace.jpg",
    alt: "Terrace",
    focal: VISUAL_ASSETS.locations.berlinMitte.focal,
  },
};

type Props = {
  decisionId: string;
  onOpenDecision: () => void;
  highlightTurns?: boolean;
};

export function FloorStage({
  decisionId,
  onOpenDecision,
  highlightTurns,
}: Props) {
  const [focus, setFocus] = useState<string | null>("a7");
  const focused = TABLES.find((t) => t.id === focus) ?? null;
  const zonePhoto = focused
    ? ZONE_PHOTO[focused.zone]
    : ZONE_PHOTO.Main;

  return (
    <div className="lab-floor-stage">
      <div className="lab-floor-stage-frame">
        <div
          className="lab-floor-stage-bg"
          style={{
            backgroundImage: `url(${VISUAL_ASSETS.locations.berlinMitte.src})`,
            backgroundPosition: objectPosition(
              VISUAL_ASSETS.locations.berlinMitte.focal,
              1200,
            ),
          }}
        />
        <div className="lab-floor-stage-veil" />

        <div className="lab-floor-stage-zones" aria-hidden="true">
          <span style={{ left: "22%", top: "18%" }}>Main</span>
          <span style={{ left: "72%", top: "14%" }}>Bar</span>
          <span style={{ left: "68%", top: "78%" }}>Terrace</span>
        </div>

        {TABLES.map((t) => {
          const on = focus === t.id || (highlightTurns && t.state === "turn");
          return (
            <button
              key={t.id}
              type="button"
              className="lab-floor-hot"
              style={{ left: `${t.x}%`, top: `${t.y}%` }}
              data-state={t.state}
              data-on={on ? "true" : undefined}
              aria-label={`Table ${t.label} · ${STATE_LABEL[t.state]}`}
              aria-pressed={focus === t.id}
              onClick={() => setFocus(focus === t.id ? null : t.id)}
              onFocus={() => setFocus(t.id)}
            >
              <span className="lab-floor-hot-ring" aria-hidden="true" />
              <span className="lab-floor-hot-mark" aria-hidden="true">
                {t.state === "turn" ? "!" : t.state === "reserved" ? "R" : "·"}
              </span>
              <span className="lab-floor-hot-name">{t.label}</span>
            </button>
          );
        })}
      </div>

      {focused ? (
        <article className="lab-table-card" data-state={focused.state}>
          <div
            className="lab-table-card-thumb"
            style={{
              backgroundImage: `url(${zonePhoto.src})`,
              backgroundPosition: objectPosition(
                "focal" in zonePhoto ? zonePhoto.focal : undefined,
                400,
              ),
            }}
            role="img"
            aria-label={`${focused.zone} zone`}
          />
          <div className="lab-table-card-body">
            <p className="lab-table-card-id">
              <strong>{focused.label}</strong>
              <span data-state={focused.state}>
                {STATE_LABEL[focused.state]}
              </span>
            </p>
            <p className="lab-table-card-zone">{focused.zone}</p>
            {focused.party ? (
              <p className="lab-table-card-party">{focused.party}</p>
            ) : null}
            <p className="lab-table-card-why">{focused.why}</p>
            {(focused.state === "turn" || focused.state === "reserved") && (
              <button
                type="button"
                className="lab-table-card-link"
                onClick={onOpenDecision}
              >
                Linked · {decisionId}
              </button>
            )}
          </div>
        </article>
      ) : (
        <p className="lab-table-card-idle">Select a table on the floor</p>
      )}
    </div>
  );
}
