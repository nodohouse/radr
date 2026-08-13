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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError("Missing reset token");
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
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="prep-label" htmlFor="password">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          className="prep-input"
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="prep-btn prep-btn-primary w-full" disabled={pending || !token}>
        {pending ? "Saving…" : "Update password"}
      </button>
      <p className="text-center text-sm text-[var(--ink-muted)]">
        <Link href="/login" className="underline underline-offset-2">
          Back to login
        </Link>
      </p>
    </form>
  );
}
