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
  const [success, setSuccess] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await authClient.signIn.email({ email, password });

    if (result.error) {
      setPending(false);
      setError("Incorrect email or password.");
      return;
    }

    setSuccess(true);
    window.setTimeout(() => {
      router.push(next);
      router.refresh();
    }, 520);
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

      <div className="rx-auth-field">
        <div className="rx-auth-field-row">
          <label htmlFor="password">Password</label>
          <Link href="/forgot-password" className="rx-auth-inline">
            Forgot password →
          </Link>
        </div>
        <div className="rx-auth-pw">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={10}
          />
          <button
            type="button"
            className="rx-auth-pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="rx-auth-error" role="alert">
          <strong>Signal not confirmed</strong>
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="rx-auth-submit"
        disabled={pending || success}
        data-success={success ? "true" : "false"}
      >
        {success ? (
          <>
            Signal confirmed <span className="rx-tri">△</span>
          </>
        ) : pending ? (
          "Confirming…"
        ) : (
          <>
            Sign in <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className="rx-auth-foot">
        Don&apos;t have access?{" "}
        <Link href="/contact">Request access →</Link>
      </p>
    </form>
  );
}
