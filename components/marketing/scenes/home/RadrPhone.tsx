"use client";

/**
 * Shared premium RADR phone — role-specific action layer.
 * Not a shrunk desktop. Not decorative stock mockup.
 */

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

export const PHONE_CFO_RECOVER: RadrPhoneState = {
  id: "cfo",
  role: "CFO",
  badge: "Recover",
  title: "€273 supplier variance",
  body: "Evidence package ready.",
  meta: "Always ask before sending",
  primary: "Review",
  secondary: "Approve draft",
  tone: "recover",
};

export const PHONE_GM_PERISHABLE: RadrPhoneState = {
  id: "gm",
  role: "GM",
  badge: "At risk",
  title: "€184 value at risk",
  body: "Cancellation at T14.",
  meta: "Waitlist recovery prepared",
  primary: "Approve",
  secondary: "View why",
  tone: "urgent",
};

export const PHONE_VERIFIED: RadrPhoneState = {
  id: "verified",
  role: "Finance",
  badge: "Verified",
  title: "€273 recovered",
  body: "Matched to invoice INV-88421.",
  meta: "View Trace",
  primary: "Open Trace",
  tone: "verified",
};

export const PHONE_FOH: RadrPhoneState = {
  id: "foh",
  role: "FOH",
  badge: "FOH",
  title: "Table 12 released",
  body: "Offer to waitlist guest prepared.",
  meta: "Seat by 18:50",
  primary: "Confirm",
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
