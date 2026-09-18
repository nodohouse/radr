"use client";

/**
 * Premium iPhone product story — the right economic action reaches the right person.
 * Rotating role-specific push states. Not a mini dashboard. Not scheduling.
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
    id: "recover",
    badge: "Recover",
    title: "€273 supplier variance",
    body: "Evidence package ready for Finance.",
    meta: "Always ask before sending",
    primary: "Review",
    secondary: "Approve draft",
    tone: "recover",
  },
  {
    id: "noshow",
    badge: "No-show",
    title: "€184 value at risk",
    body: "Cancellation created recoverable capacity before peak.",
    meta: "Waitlist recovery prepared",
    primary: "Approve",
    secondary: "View why",
    tone: "urgent",
  },
  {
    id: "foh",
    badge: "FOH",
    title: "Table 12 released",
    body: "Offer to waitlist guest prepared.",
    meta: "Seat by 18:50",
    primary: "Confirm",
    tone: "brief",
  },
  {
    id: "chef",
    badge: "Kitchen",
    title: "Yield variance",
    body: "Check prep batch 3 — driver of tonight’s food-cost move.",
    meta: "Cost variance · not inflation alone",
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
      aria-label="RADR mobile — recover, approve, brief"
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
