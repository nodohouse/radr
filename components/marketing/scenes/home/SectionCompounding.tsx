"use client";

import Image from "next/image";
import {
  CANON_OTA,
  formatCanonVariance,
} from "@/lib/radr/decision/demo/canonical";
import { formatDecisionMoney } from "@/lib/radr/decision/core";

const COMPARABLES = [
  { id: "n1", label: "Fri · event", outcome: "OTA early", tone: "mute" as const },
  { id: "n2", label: "Sat · sold out", outcome: "Hold direct", tone: "good" as const },
  { id: "n3", label: "Fri · concert", outcome: "Hold direct", tone: "good" as const },
  { id: "n4", label: "Sat · city", outcome: "OTA early", tone: "mute" as const },
  { id: "n5", label: "Fri · festival", outcome: "Hold direct", tone: "good" as const },
  { id: "n6", label: "Sat · peak", outcome: "Hold direct", tone: "good" as const },
];

/**
 * Scene 05 — Operating Memory as layered ghosts of high-demand weekends.
 * Forecast error supports the story — it is not the story.
 */
export function SectionCompounding() {
  const {
    learning,
    displayId,
    expectedProtectedEuro,
    actualProtectedEuro,
    property,
  } = CANON_OTA;

  return (
    <section
      className="rx-mem-ghosts"
      data-nav-theme="light"
      id="compounding"
    >
      <div className="rx-shell">
        <header className="rx-cinema-head">
          <p className="rx-cinema-kicker">Operating Memory</p>
          <h2 className="rx-cinema-title">
            Every verified outcome
            <br />
            makes the next decision better.
          </h2>
        </header>

        <div className="rx-mem-ghosts-stage">
          <div className="rx-mem-ghosts-world">
            <Image
              src=""
              alt=""
              fill
              sizes="(max-width: 900px) 100vw, 70vw"
              className="rx-mem-ghosts-img"
              style={{ objectPosition: "50% 45%" }}
            />
            <div className="rx-mem-ghosts-veil" />

            <div className="rx-mem-ghost" data-n="1" aria-hidden="true">
              <em>Past 01</em>
              <span>Released OTA early</span>
            </div>
            <div className="rx-mem-ghost" data-n="2" aria-hidden="true">
              <em>Past 02</em>
              <span>Held direct · filled</span>
            </div>
            <div className="rx-mem-ghost" data-n="3" aria-hidden="true">
              <em>Past 03</em>
              <span>Held direct · filled</span>
            </div>

            <div className="rx-mem-ghosts-now">
              <em>This high-demand weekend</em>
              <strong>Without memory → release OTA early</strong>
              <span>With memory → hold premium direct</span>
              <p className="rx-mem-ghosts-playbook">PLAYBOOK UPDATED</p>
            </div>

            <svg
              className="rx-mem-ghosts-traj"
              viewBox="0 0 400 220"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M40 180 C 120 160, 180 90, 360 50" />
            </svg>
          </div>

          <aside className="rx-mem-ghosts-support" aria-label="Memory readout">
            <p className="rx-mem-support-kicker">{property}</p>
            <p className="rx-mem-support-title">18 similar event nights</p>

            <ul className="rx-mem-comps" aria-label="Comparable nights">
              {COMPARABLES.map((n) => (
                <li key={n.id} data-tone={n.tone}>
                  <em>{n.label}</em>
                  <span>{n.outcome}</span>
                </li>
              ))}
            </ul>

            <div className="rx-mem-split">
              <div>
                <em>6</em>
                <span>early OTA releases</span>
              </div>
              <div data-tone="good">
                <em>12</em>
                <span>direct holds</span>
              </div>
            </div>

            <div className="rx-mem-lift">
              <div className="rx-mem-lift-head">
                <span>Direct-fill probability</span>
                <strong>
                  58% <i aria-hidden="true">→</i> 73%
                </strong>
              </div>
              <div className="rx-mem-lift-track" aria-hidden="true">
                <i style={{ width: "58%" }} />
                <b style={{ width: "73%" }} />
              </div>
            </div>

            <div className="rx-mem-variance">
              <div>
                <em>Expected</em>
                <strong>{formatDecisionMoney(expectedProtectedEuro)}</strong>
              </div>
              <div>
                <em>Observed</em>
                <strong>{formatDecisionMoney(actualProtectedEuro)}</strong>
              </div>
              <div data-tone="soft">
                <em>Variance</em>
                <strong>{formatCanonVariance(CANON_OTA)}</strong>
              </div>
            </div>

            <div className="rx-mem-learn">
              <em>What RADR learned</em>
              <p>{learning.lesson}</p>
              <span>
                {learning.playbookFrom} → {learning.playbookTo}
              </span>
              <span className="rx-mem-learn-context">
                Operator context remembered · GM hold preference on event
                weekends persisted
              </span>
            </div>
          </aside>
        </div>

        <div className="rx-mem-ghosts-line">
          <div className="rx-mem-fork" data-tone="mute">
            <em>Without memory</em>
            <strong>{learning.playbookFrom}</strong>
          </div>
          <div className="rx-mem-fork" data-tone="good">
            <em>With memory · {displayId}</em>
            <strong>{learning.playbookTo}</strong>
            <span>
              {formatDecisionMoney(actualProtectedEuro)} verified protected ·{" "}
              {formatCanonVariance(CANON_OTA)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
