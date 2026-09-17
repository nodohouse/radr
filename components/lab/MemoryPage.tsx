"use client";

import { MEMORY_STORIES } from "@/lib/lab/world";
import { labEuro } from "@/lib/lab/format";
import Link from "next/link";

export function MemoryPage() {
  return (
    <div className="lab-page">
      <p className="lab-kicker">Learning stories</p>
      <h1 className="lab-h lab-h1">Tried → observed → verified → next time</h1>
      <p className="lab-lead">
        Memory feeds Autopilot confidence. It does not mint Verified euros.
      </p>
      <div className="lab-cards" style={{ marginTop: "1.2rem" }}>
        {MEMORY_STORIES.map((s) => (
          <article key={s.id} className="lab-card">
            <p className="lab-kicker">Playbook</p>
            <h2 className="lab-h" style={{ fontSize: "1.45rem" }}>
              {s.title}
            </h2>
            <p className="lab-euro" data-grade={s.grade}>
              {labEuro(s.euro)}
              <span className="lab-grade" data-grade={s.grade}>
                {s.grade}
              </span>
            </p>
            <ol style={{ margin: "0.8rem 0 0", paddingLeft: "1.1rem" }}>
              <li>
                <strong>Tried</strong> — {s.tried}
              </li>
              <li>
                <strong>Observed</strong> — {s.observed}
              </li>
              <li>
                <strong>Verified</strong> — {s.verified}
              </li>
              <li>
                <strong>Next time</strong> — {s.nextTime}
              </li>
            </ol>
            <ul style={{ margin: "0.9rem 0 0", padding: 0, listStyle: "none" }}>
              {s.links.map((l) => (
                <li key={l.href} className="lab-brief-item">
                  <Link href={l.href}>
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
