"use client";

import { MEMORY_STORIES } from "@/lib/lab/world";
import { labEuro } from "@/lib/lab/format";
import Link from "next/link";

export function MemoryPage() {
  return (
    <div className="lab-page lab-page-fill">
      <div className="lab-page-head">
        <div>
          <p className="lab-kicker">Learning stories</p>
          <h1 className="lab-h lab-h1">Tried → observed → verified → next time</h1>
          <p className="lab-lead">
            Memory feeds Autopilot confidence. It does not mint Verified euros.
          </p>
        </div>
      </div>

      <div className="lab-story-grid lab-story-grid-lg">
        {MEMORY_STORIES.map((s) => (
          <article key={s.id} className="lab-card" data-wash="mint">
            <p className="lab-kicker">Playbook</p>
            <h2 className="lab-h" style={{ fontSize: "1.7rem" }}>
              {s.title}
            </h2>
            <p className="lab-euro" data-grade={s.grade}>
              {labEuro(s.euro)}
              <span className="lab-grade" data-grade={s.grade}>
                {s.grade}
              </span>
            </p>
            <div className="lab-protocol">
              <div className="lab-protocol-cell">
                <p className="lab-kicker">Tried</p>
                <p>{s.tried}</p>
              </div>
              <div className="lab-protocol-cell">
                <p className="lab-kicker">Observed</p>
                <p>{s.observed}</p>
              </div>
              <div className="lab-protocol-cell">
                <p className="lab-kicker">Verified</p>
                <p>{s.verified}</p>
              </div>
              <div className="lab-protocol-cell">
                <p className="lab-kicker">Next time</p>
                <p>{s.nextTime}</p>
              </div>
            </div>
            <ul className="lab-memory-links">
              {s.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="lab-card" data-wash="sand">
                    <span style={{ fontWeight: 700 }}>{l.label}</span>
                    <span className="lab-because">{l.because}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
