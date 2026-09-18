"use client";

/**
 * Premium iPhone product story — RADR in the operator's pocket.
 * Rotating role-specific push states. Not a mini dashboard.
 */

import { useEffect, useState } from "react";

type PhoneState = {
  id: string;
  badge: string;
  title: string;
  body: string;
  meta?: string;
  primary?: string;
  secondary?: string;
  tone: "urgent" | "brief" | "shift" | "recover";
};

const STATES: PhoneState[] = [
  {
    id: "urgent",
    badge: "Urgent",
    title: "Wait 12 minutes",
    body: "Kitchen pressure is projected to spike at 19:00.",
    meta: "Expected impact · +€620",
    primary: "Approve",
    secondary: "View why",
    tone: "urgent",
  },
  {
    id: "foh",
    badge: "FOH brief",
    title: "Brief updated",
    body: "VIP party of 6 · seat by 18:50. Table 12 · nut allergy.",
    meta: "Hold next walk-in until 18:54",
    primary: "Open brief",
    tone: "brief",
  },
  {
    id: "shift",
    badge: "Shift update",
    title: "1 open FOH shift",
    body: "Push sent to eligible staff.",
    meta: "2 responses pending",
    primary: "View coverage",
    tone: "shift",
  },
  {
    id: "recover",
    badge: "Recover",
    title: "€273 supplier variance",
    body: "Evidence package prepared for Finance approval.",
    meta: "Always ask before sending",
    primary: "Review",
    secondary: "Approve draft",
    tone: "recover",
  },
];

export function HeroRadrPhone() {
  const [idx, setIdx] = useState(0);
  const state = STATES[idx] ?? STATES[0];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % STATES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside
      className="rx-he-phone"
      aria-label="RADR mobile — push, approve, brief"
      data-tone={state.tone}
    >
      <div className="rx-he-phone-bezel">
        <div className="rx-he-phone-notch" aria-hidden="true" />
        <div className="rx-he-phone-screen">
          <header className="rx-he-phone-top">
            <span className="rx-he-phone-brand">RADR</span>
            <span className="rx-he-phone-time">18:42</span>
          </header>

          <div key={state.id} className="rx-he-phone-card">
            <p className="rx-he-phone-badge">{state.badge}</p>
            <h3 className="rx-he-phone-title">{state.title}</h3>
            <p className="rx-he-phone-body">{state.body}</p>
            {state.meta ? (
              <p className="rx-he-phone-meta">{state.meta}</p>
            ) : null}
            <div className="rx-he-phone-actions">
              {state.primary ? (
                <span className="rx-he-phone-btn rx-he-phone-btn-primary">
                  {state.primary}
                </span>
              ) : null}
              {state.secondary ? (
                <span className="rx-he-phone-btn">{state.secondary}</span>
              ) : null}
            </div>
          </div>

          <p className="rx-he-phone-foot">Push only when someone can act</p>
        </div>
      </div>
    </aside>
  );
}
