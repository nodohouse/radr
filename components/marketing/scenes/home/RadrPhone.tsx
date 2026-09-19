"use client";

/**
 * Shared premium RADR phone — role-specific action layer.
 * Not a shrunk desktop. Not decorative stock mockup.
 */

import { euro, ECON_D4102, ECON_D1911 } from "@/lib/marketing/publicDecisionEconomics";

export type RadrPhoneTone = "urgent" | "brief" | "shift" | "recover" | "verified";

export type RadrPhoneState = {
  id: string;
  role: string;
  badge: string;
  title: string;
  body: string;
  meta?: string;
  primary?: string;
  secondary?: string;
  tone: RadrPhoneTone;
};

const EUR_4102 = euro(ECON_D4102.verified);
const EUR_1911 = euro(ECON_D1911.expected);

export const PHONE_CFO_RECOVER: RadrPhoneState = {
  id: "cfo",
  role: "CFO",
  badge: "Recover",
  title: `${EUR_4102} SUPPLIER VARIANCE`,
  body: "Evidence ready.",
  meta: "Always ask before sending",
  primary: "Review case",
  tone: "recover",
};

export const PHONE_GM_PERISHABLE: RadrPhoneState = {
  id: "gm",
  role: "GM",
  badge: "Needs you",
  title: "WAIT 12 MINUTES",
  body: `${EUR_1911} expected.`,
  meta: `${ECON_D1911.displayId} · Dinner`,
  primary: "Approve",
  tone: "urgent",
};

export const PHONE_VERIFIED: RadrPhoneState = {
  id: "verified",
  role: "Finance",
  badge: "Verified",
  title: `${EUR_4102} recovered`,
  body: "Matched to invoice INV-88421.",
  meta: "View Trace",
  primary: "Open Trace",
  tone: "verified",
};

export const PHONE_FOH: RadrPhoneState = {
  id: "foh",
  role: "FOH",
  badge: "FOH brief",
  title: "VIP · TABLE 12",
  body: "Nut allergy · Seat by 18:50.",
  meta: "Hold · do not release",
  primary: "Got it",
  tone: "brief",
};

type Props = {
  state: RadrPhoneState;
  className?: string;
  /** When true, phone participates in hero choreography */
  highlight?: boolean;
};

export function RadrPhone({ state, className = "", highlight }: Props) {
  return (
    <aside
      className={`rx-he-phone ${className}`.trim()}
      aria-label={`RADR mobile · ${state.role}`}
      data-tone={state.tone}
      data-highlight={highlight ? "true" : undefined}
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
