"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  CONSENT_KEY,
  cookiePromptDismissed,
  dismissCookiePrompt,
  parsePreferences,
  savePreferences,
  type CookiePreferences as Preferences,
} from "@/lib/privacy/consent";
import {
  PRIVACY_REVIEW_DATE,
  STORAGE_INVENTORY,
} from "@/lib/privacy/disclosures";
import "./cookies.css";

export function CookiePreferences() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const show = () => {
      returnFocus.current = document.activeElement as HTMLElement;
      try {
        const saved = parsePreferences(localStorage.getItem(CONSENT_KEY));
        setAnalytics(saved?.analytics === true);
        setMarketing(saved?.marketing === true);
      } catch {
        setAnalytics(false);
        setMarketing(false);
      }
      setError("");
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("radr:cookie-settings", show);
    try {
      const saved = parsePreferences(localStorage.getItem(CONSENT_KEY));
      if (saved) {
        setAnalytics(saved.analytics);
        setMarketing(saved.marketing);
      } else if (!cookiePromptDismissed()) setOpen(true);
    } catch {
      if (!cookiePromptDismissed()) setOpen(true);
    }
    return () => window.removeEventListener("radr:cookie-settings", show);
  }, []);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) {
      dialog.current.close();
      returnFocus.current?.focus();
    }
  }, [open]);
  function dismiss() {
    dismissCookiePrompt();
    setOpen(false);
  }
  function save(allowAnalytics: boolean, allowMarketing: boolean) {
    const value: Preferences = {
      version: 1,
      necessary: true,
      analytics: allowAnalytics,
      marketing: allowMarketing,
      savedAt: new Date().toISOString(),
    };
    try {
      savePreferences(value);
    } catch {
      setError(
        "Your browser could not save this preference. Optional tracking stays off. You can continue with essential cookies only.",
      );
      setAnalytics(false);
      setMarketing(false);
      window.dispatchEvent(
        new CustomEvent("radr:consent-change", {
          detail: { ...value, analytics: false, marketing: false },
        }),
      );
      return;
    }
    setAnalytics(allowAnalytics);
    setMarketing(allowMarketing);
    window.dispatchEvent(
      new CustomEvent("radr:consent-change", { detail: value }),
    );
    setError("");
    setOpen(false);
  }
  return (
    <dialog
      ref={dialog}
      className="radr-cookies"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-description"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
    >
      <div className="radr-cookies-head">
        <span>YOUR PRIVACY</span>
        <button
          type="button"
          aria-label="Close cookie preferences; keep existing choice or essential cookies only"
          onClick={dismiss}
        >
          ×
        </button>
      </div>
      <h2 id="cookie-title">Your cookies. Your choice.</h2>
      <p id="cookie-description">
        Essential cookies keep sign-in secure and remember language and privacy
        choices. They stay on. Optional analytics and marketing stay off unless
        you choose them.
      </p>
      <p className="radr-cookie-current">
        <strong>No third-party trackers installed.</strong> RADR currently loads
        no third-party analytics or advertising trackers. Accepting optional
        cookies does not add a tracker.
      </p>
      {details ? (
        <div className="radr-cookie-details">
          <div className="radr-cookie-options">
            <div>
              <strong>Essential</strong>
              <span>
                Sign-in, security, language, your privacy choice and requested
                report access. These records support the feature you use.
              </span>
              <b>Always on</b>
            </div>
            <label>
              <span>
                <strong>Analytics</strong>
                <small>
                  No third-party provider installed. Allows local measurement
                  events, such as calculator progress. Any new tracker requires
                  updated disclosures and the appropriate choice.
                </small>
              </span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>
            <label>
              <span>
                <strong>Marketing</strong>
                <small>
                  No advertising provider or marketing cookie installed. This
                  choice does not subscribe you to emails or request sales
                  contact.
                </small>
              </span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
            </label>
          </div>
          <div className="radr-cookie-explainer">
            <strong>Saved on this browser</strong>
            <p>
              Your choice is valid for 180 days. You can change or withdraw it
              in Cookie settings at any time. A stored record may remain until
              overwritten or cleared. Other devices have separate choices.
            </p>
          </div>
          <details className="radr-cookie-inventory">
            <summary>See cookies &amp; storage details</summary>
            <p>
              Not every item is set on a marketing visit. Product sessions and
              report access depend on using those features.
            </p>
            <ul>
              {STORAGE_INVENTORY.map((item) => (
                <li key={item.name}>
                  <code>{item.name}</code>
                  <span>
                    {item.type} · {item.provider}
                  </span>
                  <p>{item.purpose}</p>
                  <small>
                    {item.duration} · {item.when}
                  </small>
                </li>
              ))}
            </ul>
          </details>
          <details className="radr-cookie-inventory">
            <summary>How to withdraw or clear your choice</summary>
            <p>
              Turn an optional category off and choose Save preferences, or
              choose Reject optional. This applies to future optional events on
              this browser. Closing without saving keeps your previous choice,
              or essential-only operation if none was saved.
            </p>
            <p>
              To remove local records, use your browser’s site-data settings for
              this domain. Clearing site data may sign you out and remove saved
              demo layouts. It does not delete server-held accounts or inquiry
              records. Cookie choices do not unsubscribe you from email.
            </p>
            <p>
              Any materially different future tracking setup needs updated
              disclosures and an appropriate new choice. These settings do not
              authorize undisclosed tracking.
            </p>
          </details>
          <p className="radr-cookie-reviewed">
            Inventory reviewed · {PRIVACY_REVIEW_DATE}
          </p>
        </div>
      ) : null}
      {error ? (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={dismiss}>
            Continue without optional cookies
          </button>
        </p>
      ) : null}
      <div className="radr-cookie-controls">
        <div className="radr-cookie-actions">
          <button type="button" onClick={() => save(false, false)}>
            Reject optional
          </button>
          <button type="button" onClick={() => save(true, true)}>
            Accept optional
          </button>
          <button
            type="button"
            onClick={() =>
              details ? save(analytics, marketing) : setDetails(true)
            }
          >
            {details ? "Save preferences" : "Manage preferences"}
          </button>
        </div>
        <div className="radr-cookie-links">
          <Link href="/privacy" onClick={dismiss}>
            Read the privacy notice →
          </Link>
          <Link href="/cookies" onClick={dismiss}>
            Full storage inventory →
          </Link>
        </div>
      </div>
    </dialog>
  );
}
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="radr-cookie-settings"
      onClick={() => window.dispatchEvent(new Event("radr:cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
