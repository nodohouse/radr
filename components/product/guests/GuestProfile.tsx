"use client";

import { useState } from "react";
import Link from "next/link";
import type { GuestProfileModel } from "@/lib/radr/product/guestAttention";
import { DECISION_IDS } from "@/lib/radr/decision/ids";

type Props = {
  profile: GuestProfileModel;
};

export function GuestProfile({ profile }: Props) {
  const [briefOpen, setBriefOpen] = useState(false);

  return (
    <div className="gi-profile">
      <div className="gi-profile-nav">
        <Link href="/app/guests?view=overview" className="gi-link">
          ← Guests
        </Link>
      </div>

      <header className="gi-profile-hero">
        <div className="gi-profile-identity">
          <span className="gi-avatar gi-avatar-lg" aria-hidden>
            {profile.initials}
          </span>
          <div>
            <div className="gi-profile-name-row">
              <h1>{profile.displayName}</h1>
              <span className="gi-badge is-handled">{profile.statusLabel}</span>
            </div>
            <p className="gi-muted">{profile.meta}</p>
            <div className="gi-tags">
              {profile.tags.map((t) => (
                <span key={t} className={t.toLowerCase().includes("allergy") ? "is-alert" : undefined}>
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="gi-profile-actions">
          <button type="button" className="gi-btn-primary">
            Prepare table
          </button>
          <button
            type="button"
            className="gi-btn-secondary"
            onClick={() => setBriefOpen((v) => !v)}
            aria-expanded={briefOpen}
          >
            Brief team
          </button>
          <Link
            href={`/app/decisions/${DECISION_IDS.guestVoice}`}
            className="gi-btn-secondary"
          >
            Open judgment
          </Link>
        </div>
      </header>

      {briefOpen ? (
        <section className="gi-brief" aria-label="Service brief">
          <h3>Table 12 · {profile.displayName}</h3>
          <ul>
            <li>Returning guest</li>
            <li>Terrace preferred</li>
            <li>Shellfish allergy · severe</li>
            <li>Wine enthusiast</li>
            <li>Tonight · business dinner</li>
          </ul>
          <p>
            Recommended: quiet terrace · confirm allergy protocol · offer Riesling
            pairing. No financial detail for FOH.
          </p>
        </section>
      ) : null}

      <section className="gi-kpis" aria-label="Guest metrics">
        {profile.metrics.map((m) => (
          <div key={m.label} className="gi-kpi" data-tone={m.tone}>
            <span>{m.label}</span>
            <strong>{m.value}</strong>
            <em data-tone={m.tone}>{m.delta}</em>
          </div>
        ))}
      </section>

      <div className="gi-allergy-banner gi-allergy-banner-lg">
        <div>
          <strong>{profile.allergy.label}</strong>
          <span>
            {profile.allergy.severity} · Source: {profile.allergy.source} · Last
            confirmed: {profile.allergy.confirmed}
          </span>
        </div>
        <em>
          Kitchen informed · {profile.allergy.kitchenInformed ? "YES" : "NO"}
        </em>
      </div>

      <div className="gi-profile-mid">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Guest profile</h3>
          </div>
          <dl className="gi-dl">
            <div>
              <dt>Name</dt>
              <dd>{profile.displayName}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{profile.contact.phone}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile.contact.email}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{profile.contact.location}</dd>
            </div>
            <div>
              <dt>Guest type</dt>
              <dd>{profile.contact.guestType}</dd>
            </div>
            <div>
              <dt>VIP status</dt>
              <dd>{profile.contact.vip}</dd>
            </div>
          </dl>
          <p className="gi-notes">{profile.contact.notes}</p>
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Preferences & details</h3>
          </div>
          <ul className="gi-pref-list">
            {profile.preferences.map((p) => (
              <li key={p.label} data-alert={p.alert ? "true" : undefined}>
                <span>{p.label}</span>
                <strong>{p.value}</strong>
                <em>{p.kind}</em>
              </li>
            ))}
          </ul>
        </section>

        <aside className="gi-side">
          <section className="gi-panel gi-memory">
            <div className="gi-panel-head">
              <h3>RADR remembers</h3>
            </div>
            <ul>
              {profile.memories.map((m) => (
                <li key={m.text}>
                  <p>{m.text}</p>
                  <em>
                    {m.source} · {m.confidence}
                  </em>
                </li>
              ))}
            </ul>
          </section>
          <section className="gi-panel gi-tonight">
            <div className="gi-panel-head">
              <h3>Tonight’s recommendations</h3>
            </div>
            <ul>
              {profile.tonight.map((t) => (
                <li key={t.text}>
                  <strong>{t.text}</strong>
                  <p>
                    {t.why} · {t.value} · {t.confidence}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <div className="gi-profile-bot">
        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Visit history</h3>
            <Link href="/app/memory" className="gi-link">
              View all →
            </Link>
          </div>
          <div className="gi-table-wrap">
            <table className="gi-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Occasion</th>
                  <th>Spend</th>
                  <th>Experience</th>
                </tr>
              </thead>
              <tbody>
                {profile.visits.map((v) => (
                  <tr key={v.date} style={{ cursor: "default" }}>
                    <td>{v.date}</td>
                    <td>{v.guests}</td>
                    <td>{v.occasion}</td>
                    <td>{v.spend}</td>
                    <td className="gi-tone-pos">{v.experience}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Recent feedback</h3>
          </div>
          <ul className="gi-fb-list">
            {profile.feedback.map((f) => (
              <li key={f.date + f.score}>
                <strong>
                  {f.date} · {f.score}
                </strong>
                <p>“{f.quote}”</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="gi-panel">
          <div className="gi-panel-head">
            <h3>Service notes</h3>
            <span className="gi-muted">Human-entered</span>
          </div>
          <ul className="gi-notes-list">
            {profile.serviceNotes.map((n) => (
              <li key={n.by + n.date}>
                <strong>
                  {n.by} · {n.date}
                </strong>
                <p>{n.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
