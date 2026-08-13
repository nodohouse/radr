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
      <div className="space-y-3 text-sm leading-relaxed text-[var(--ink-muted)]">
        <p>
          If an account exists for that email, a reset link has been issued.
        </p>
        <p>
          In local development without an email provider, check the server
          console for the reset URL.
        </p>
        <Link href="/login" className="underline underline-offset-2">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="prep-label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="prep-input"
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="prep-btn prep-btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <p className="text-center text-sm text-[var(--ink-muted)]">
        <Link href="/login" className="underline underline-offset-2">
          Back to login
        </Link>
      </p>
    </form>
  );
}
