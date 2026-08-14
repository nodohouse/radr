"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("This reset link is missing or expired.");
      return;
    }
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password") ?? "");

    const result = await authClient.resetPassword({
      newPassword,
      token,
    });
    setPending(false);

    if (result.error) {
      setError(result.error.message ?? "Could not reset password");
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="rx-auth-form" noValidate>
      {!token ? (
        <p className="rx-auth-error" role="alert">
          <strong>Signal expired</strong>
          This reset link is missing or no longer valid.
        </p>
      ) : null}
      <div className="rx-auth-field">
        <label htmlFor="password">New password</label>
        <div className="rx-auth-pw">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            placeholder="At least 10 characters"
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
        disabled={pending || !token}
      >
        {pending ? "Saving…" : <>Update password <span aria-hidden="true">→</span></>}
      </button>
      <p className="rx-auth-foot">
        <Link href="/login">Back to sign in →</Link>
      </p>
    </form>
  );
}
