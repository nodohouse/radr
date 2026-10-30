"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AuthSsoBlock } from "@/components/AuthSsoBlock";
import { authClient } from "@/lib/auth-client";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { safeDemoNext } from "@/lib/marketing/demoAccess";

type Props = {
  inviteToken?: string;
  inviteEmail?: string;
  nextPath?: string;
  intent?: "demo";
};

/**
 * Minimal signup. Social OAuth not wired yet - email + password preserved.
 * Errors never reveal whether an email is already registered.
 */
export function SignupForm({
  inviteToken,
  inviteEmail,
  nextPath,
  intent,
}: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dest = safeDemoNext(nextPath, intent === "demo" ? "/app/enter" : "/onboarding");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    trackOnboarding("signup_started");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = email.split("@")[0] || "Operator";

    if (inviteEmail && email.trim().toLowerCase() !== inviteEmail.toLowerCase()) {
      setPending(false);
      setError(t("errors.inviteEmailMismatch"));
      return;
    }

    const result = await authClient.signUp.email({ name, email, password });

    if (result.error) {
      setPending(false);
      setError(t("errors.signupFailed"));
      return;
    }

    trackOnboarding("signup_completed");

    if (inviteToken) {
      const accept = await fetch("/api/invitations", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: inviteToken }),
      });
      if (accept.ok) {
        router.push(dest);
        router.refresh();
        return;
      }
    }

    setPending(false);
    router.push(dest);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="ob-auth-form" noValidate>
      <div className="ob-field">
        <label htmlFor="email">{t("workEmail")}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={inviteEmail ?? ""}
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="ob-field">
        <label htmlFor="password">{t("password")}</label>
        <div className="ob-auth-pw">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            placeholder={t("passwordPlaceholder")}
          />
          <button
            type="button"
            className="ob-auth-pw-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
          >
            {showPassword ? t("hidePassword") : t("showPassword")}
          </button>
        </div>
        <p className="ob-field-hint">{t("passwordHint")}</p>
      </div>

      {error ? (
        <div className="ob-error" role="alert">
          <p>{error}</p>
        </div>
      ) : null}

      <button type="submit" className="ob-btn ob-btn-primary" disabled={pending}>
        {pending ? (
          t("creating")
        ) : (
          <>
            {t("submitSignUp")} <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <AuthSsoBlock />

      {intent === "demo" ? (
        <p className="ob-auth-demo-note">{t("demoSignupNote")}</p>
      ) : null}

      {!inviteToken ? (
        <p className="ob-auth-foot">
          {t("hasAccount")}{" "}
          <Link href={`/login?next=${encodeURIComponent(dest)}`}>
            {t("signInLink")}
          </Link>
        </p>
      ) : null}
    </form>
  );
}
