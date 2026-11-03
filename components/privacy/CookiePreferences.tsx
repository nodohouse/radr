"use client";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  CONSENT_KEY,
  parsePreferences,
  savePreferences,
  type CookiePreferences as Preferences,
} from "@/lib/privacy/consent";
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
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("radr:cookie-settings", show);
    try {
      const saved = parsePreferences(localStorage.getItem(CONSENT_KEY));
      if (saved) {
        setAnalytics(saved.analytics);
        setMarketing(saved.marketing);
      } else setOpen(true);
    } catch {
      setOpen(true);
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
      onCancel={() => {
        setOpen(false);
        returnFocus.current?.focus();
      }}
    >
      <div className="radr-cookies-head">
        <span>YOUR PRIVACY</span>
        <button
          type="button"
          aria-label="Close cookie preferences; keep existing choice or essential cookies only"
          onClick={() => setOpen(false)}
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
      <p>
        RADR currently loads no third-party analytics or advertising trackers.
        Accepting optional cookies does not add a tracker.
      </p>
      {details ? (
        <div className="radr-cookie-options">
          <div>
            <strong>Essential</strong>
            <span>Sign-in, security, language, and your privacy choice.</span>
            <b>Always on</b>
          </div>
          <label>
            <span>
              <strong>Analytics</strong>
              <small>Optional measurement of website use, if introduced.</small>
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
              <small>Optional advertising measurement, if introduced.</small>
            </span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
          </label>
        </div>
      ) : null}
      {error ? (
        <p role="alert">
          {error}{" "}
          <button type="button" onClick={() => setOpen(false)}>
            Continue without optional cookies
          </button>
        </p>
      ) : null}
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
      <Link href="/privacy">Read the privacy notice →</Link>
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
