"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    const result = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not start reset");
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="rx-auth-confirm">
        <p className="rx-auth-confirm-kicker">Reset signal sent</p>
        <h2>Check your inbox.</h2>
        <p>
          If an account exists for that email, a reset link has been issued.
        </p>
        <Link href="/login" className="rx-auth-inline">
          Back to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rx-auth-form" noValidate>
      <div className="rx-auth-field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
        />
      </div>
      {error ? (
        <p className="rx-auth-error" role="alert">
          <strong>Signal not confirmed</strong>
          {error}
        </p>
      ) : null}
      <button type="submit" className="rx-auth-submit" disabled={pending}>
        {pending ? "Sending…" : <>Send reset link <span aria-hidden="true">→</span></>}
      </button>
      <p className="rx-auth-foot">
        <Link href="/login">Back to sign in →</Link>
      </p>
    </form>
  );
}
