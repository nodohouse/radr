"use client";

/**
 * Mobile RADR — role projection, not shrunk desktop.
 * CFO recover · GM perishable risk. Right Decision · right person · right moment.
 */

import { useEffect, useState } from "react";

type PhoneState = {
  id: string;
  role: string;
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
    id: "cfo",
    role: "CFO",
    badge: "Recover",
    title: "€273 supplier variance",
    body: "Evidence package ready.",
    meta: "Always ask before sending",
    primary: "Review",
    secondary: "Approve draft",
    tone: "recover",
  },
  {
    id: "gm",
    role: "GM",
    badge: "At risk",
    title: "€184 value at risk",
    body: "Cancellation at T14.",
    meta: "Waitlist recovery prepared",
    primary: "Approve",
    secondary: "View why",
    tone: "urgent",
  },
  {
    id: "foh",
    role: "FOH",
    badge: "FOH",
    title: "Table 12 released",
    body: "Offer to waitlist guest prepared.",
    meta: "No economics on floor push",
    primary: "Confirm",
    tone: "brief",
  },
  {
    id: "chef",
    role: "Chef",
    badge: "Kitchen",
    title: "Yield variance",
    body: "Check prep batch 3.",
    meta: "Cost driver — not inflation alone",
    primary: "Open brief",
    tone: "shift",
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
      aria-label="RADR mobile — role-specific action"
      data-tone={state.tone}
    >
      <div className="rx-he-phone-bezel">
        <div className="rx-he-phone-notch" aria-hidden="true" />
        <div className="rx-he-phone-screen">
          <header className="rx-he-phone-top">
            <span className="rx-he-phone-brand">RADR</span>
            <span className="rx-he-phone-role">{state.role}</span>
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

          <p className="rx-he-phone-foot">Right person · right moment</p>
        </div>
      </div>
    </aside>
  );
}
