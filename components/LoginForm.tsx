"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/home";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await authClient.signIn.email({ email, password });
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not sign in");
      return;
    }

    router.push(next);
    router.refresh();
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
      <div>
        <label className="prep-label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={10}
          className="prep-input"
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="prep-btn prep-btn-primary w-full" disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-[var(--ink-muted)]">
        <Link href="/forgot-password" className="underline underline-offset-2">
          Reset password
        </Link>
        {" · "}
        <Link href="/signup" className="underline underline-offset-2">
          Create account
        </Link>
      </p>
    </form>
  );
}
