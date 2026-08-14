"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await authClient.signUp.email({ name, email, password });
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not create account");
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rx-auth-form" noValidate>
      <div className="rx-auth-field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={80}
        />
      </div>
      <div className="rx-auth-field">
        <label htmlFor="email">Work email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="rx-auth-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
        />
        <p className="rx-auth-hint">At least 10 characters.</p>
      </div>
      {error ? (
        <p className="rx-auth-error" role="alert">
          <strong>Signal not confirmed</strong>
          {error}
        </p>
      ) : null}
      <button type="submit" className="rx-auth-submit" disabled={pending}>
        {pending ? "Creating…" : <>Create access <span aria-hidden="true">→</span></>}
      </button>
      <p className="rx-auth-foot">
        Already have access? <Link href="/login">Sign in →</Link>
      </p>
    </form>
  );
}
