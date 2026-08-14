"use client";

import { useActionState, useEffect } from "react";
import {
  submitContactInquiry,
  type ContactResult,
} from "@/app/contact/actions";

const initial: ContactResult | null = null;

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContactInquiry, initial);

  useEffect(() => {
    if (state?.ok && state.mode === "mailto") {
      window.location.href = state.mailto;
    }
  }, [state]);

  return (
    <form className="rx-contact-form" action={action} noValidate>
      <div className="rx-contact-field">
        <label htmlFor="contact-email">Work email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          required
          placeholder="Your group or brand"
        />
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-locations">Locations / operating units</label>
        <input
          id="contact-locations"
          name="locations"
          type="text"
          inputMode="numeric"
          placeholder="e.g. 18"
        />
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-industry">
          Industry <span className="rx-contact-optional">optional</span>
        </label>
        <select id="contact-industry" name="industry" defaultValue="">
          <option value="" disabled>
            Select…
          </option>
          <option value="hospitality">Hospitality</option>
          <option value="retail">Retail</option>
          <option value="consumer-services">Consumer services</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-message">
          Message <span className="rx-contact-optional">optional</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder="What should RADR look at first?"
        />
      </div>

      {state && !state.ok ? (
        <p className="rx-contact-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.ok && state.mode === "webhook" ? (
        <p className="rx-contact-ok" role="status">
          Received. We&apos;ll follow up at your work email.
        </p>
      ) : null}

      {state?.ok && state.mode === "mailto" ? (
        <p className="rx-contact-ok" role="status">
          Opening your email client to send the inquiry…
        </p>
      ) : null}

      <button
        type="submit"
        className="rx-btn rx-btn-primary"
        disabled={pending}
      >
        {pending ? "Sending…" : "See what RADR finds →"}
      </button>
    </form>
  );
}
