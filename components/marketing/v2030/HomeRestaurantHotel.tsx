"use client";

/**
 * Restaurant / Hotel — premium product shell with live Decision.
 * Same shell, different operating grammar. 400–500ms morph.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  PUBLIC_HOTEL,
  PUBLIC_RESTAURANT,
} from "@/lib/marketing/publicCanon";

type World = "restaurant" | "hotel";

const GRAMMAR: Record<World, string[]> = {
  restaurant: [
    "Covers",
    "Kitchen",
    "Reservations",
    "Walk-ins",
    "Labor",
    "Contribution",
  ],
  hotel: [
    "Occupancy",
    "ADR",
    "RevPAR",
    "Arrivals",
    "Readiness",
    "Housekeeping",
    "Channel mix",
  ],
};

type Tile = {
  label: string;
  value: string;
  delta: string;
  tone: "ok" | "warn" | "up";
};

const TILES: Record<World, Tile[]> = {
  restaurant: [
    { label: "Covers", value: "183", delta: "+12%", tone: "up" },
    { label: "Kitchen load", value: "92%", delta: "Rising", tone: "warn" },
    { label: "Labor", value: "Stretched", delta: "+2 staff", tone: "warn" },
    { label: "Contribution", value: "+8%", delta: "+$620", tone: "ok" },
  ],
  hotel: [
    { label: "Occupancy", value: "89%", delta: "+4 pts", tone: "up" },
    { label: "ADR", value: "$312", delta: "+2%", tone: "up" },
    { label: "Arrivals", value: "42", delta: "Wave", tone: "warn" },
    { label: "Ready rooms", value: "31/42", delta: "At risk", tone: "warn" },
  ],
};

const NAV = ["Home", "Operations", "Decisions", "Reports", "Settings"] as const;

function NavIcon({ i }: { i: number }) {
  const paths = [
    "M4 10 L10 4 L16 10 M6 9 V16 H14 V9",
    "M4 12 H16 M4 8 H16 M4 16 H12",
    "M5 5 H15 V15 H5 Z M8 8 H12 V12 H8 Z",
    "M4 14 L8 8 L12 11 L16 5",
    "M8 4 A4 4 0 1 1 7.99 4 M8 10 V14",
  ];
  return (
    <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden>
      <path
        d={paths[i] ?? paths[0]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HomeRestaurantHotel() {
  const reduced = useReducedMotion();
  const [world, setWorld] = useState<World>("restaurant");
  const tiles = TILES[world];
  const r = PUBLIC_RESTAURANT;
  const h = PUBLIC_HOTEL;
  const isRest = world === "restaurant";

  return (
    <section className="rx30-rh rx30-rh--premium rx-chapter" aria-labelledby="rx30-rh-title">
      <div className="rx30-shell">
        <p className="rx30-kicker">Built across hospitality</p>
        <h2 id="rx30-rh-title" className="rx30-h2">
          One intelligence system. Different operating models.
        </h2>
        <p className="rx30-lead">
          RADR adapts to the structure of the operation. From a restaurant
          service to a hotel arrival wave.
        </p>

        <div className="rx30-rh-tabs" role="tablist" aria-label="Operating model">
          <button
            type="button"
            role="tab"
            aria-selected={world === "restaurant"}
            data-on={world === "restaurant" ? "true" : undefined}
            onClick={() => setWorld("restaurant")}
          >
            Restaurant
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={world === "hotel"}
            data-on={world === "hotel" ? "true" : undefined}
            onClick={() => setWorld("hotel")}
          >
            Hotel
          </button>
        </div>

        <div className="rx-rh-frame" data-world={world}>
          <aside className="rx-rh-rail" aria-hidden>
            <span className="rx-rh-rail-mark">
              <FrozenRadrLogo variant="mark" theme="dark" width={20} decorative />
            </span>
            {NAV.map((label, i) => (
              <span
                key={label}
                className="rx-rh-rail-item"
                data-on={i === 0 ? "true" : undefined}
                title={label}
              >
                <NavIcon i={i} />
              </span>
            ))}
          </aside>

          <div className="rx-rh-main">
            <header className="rx-rh-chrome">
              <strong>
                {isRest ? r.displayName : h.displayName}
              </strong>
              <span className="rx-rh-live">
                <i aria-hidden /> LIVE
              </span>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={world}
                className="rx-rh-body"
                initial={reduced ? false : { opacity: 0.55, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0.4, y: -3 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rx-rh-tiles">
                  {tiles.map((t) => (
                    <article key={t.label} className="rx-rh-tile" data-tone={t.tone}>
                      <span>{t.label}</span>
                      <strong>{t.value}</strong>
                      <em>{t.delta}</em>
                    </article>
                  ))}
                </div>

                <ul className="rx-rh-checks" aria-label="Operating grammar">
                  {GRAMMAR[world].map((g) => (
                    <li key={g}>
                      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden>
                        <path
                          d="M3 8.5 L6.5 12 L13 4"
                          fill="none"
                          stroke="#00D978"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {g}
                    </li>
                  ))}
                </ul>

                <article className="rx-rh-decision">
                  <p className="rx-rh-decision-brand">
                    <FrozenRadrLogo variant="mark" theme="dark" width={16} decorative />
                    Active Decision
                  </p>
                  {isRest ? (
                    <>
                      <div className="rx-rh-decision-top">
                        <span>{r.decisionId}</span>
                        <span className="rx-rh-decision-badge">Recommendation</span>
                      </div>
                      <strong>{r.actionCompact}</strong>
                      <ul>
                        <li>
                          <span>Expected</span>
                          <em>{r.expectedFormatted}</em>
                        </li>
                        <li>
                          <span>Confidence</span>
                          <em>{r.confidencePct}%</em>
                        </li>
                      </ul>
                    </>
                  ) : (
                    <>
                      <div className="rx-rh-decision-top">
                        <span>D-H-9201</span>
                        <span className="rx-rh-decision-badge">Recommendation</span>
                      </div>
                      <strong>Reassign 2 housekeepers</strong>
                      <ul>
                        <li>
                          <span>Exposure</span>
                          <em>{h.exposureFormatted}</em>
                        </li>
                        <li>
                          <span>Confidence</span>
                          <em>79%</em>
                        </li>
                      </ul>
                    </>
                  )}
                </article>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="rx30-global-note" style={{ marginTop: "1rem" }}>
          Architecture designed to extend across mixed and multi-venue
          hospitality operations.
        </p>
      </div>
    </section>
  );
}
