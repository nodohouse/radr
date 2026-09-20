"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AuthSsoBlock } from "@/components/AuthSsoBlock";
import { authClient } from "@/lib/auth-client";
import { trackOnboarding } from "@/lib/onboarding/analytics";

/**
 * Minimal signup. Social OAuth not wired yet - email + password preserved.
 * Errors never reveal whether an email is already registered.
 */
export function SignupForm() {
  const t = useTranslations("auth");
  // /onboarding is outside the locale tree.
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    trackOnboarding("signup_started");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = email.split("@")[0] || "Operator";

    const result = await authClient.signUp.email({ name, email, password });
    setPending(false);

    if (result.error) {
      // Anti-enumeration: never echo USER_ALREADY_EXISTS or similar.
      setError(t("errors.signupFailed"));
      return;
    }

    trackOnboarding("signup_completed");
    router.push("/onboarding");
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
        <p className="ob-meta">{t("passwordHint")}</p>
      </div>
      {error ? (
        <div className="ob-error" role="alert">
          <p>{error}</p>
          <p className="ob-error-help">
            <Link href="/login">{t("signInLink")}</Link>
            <span className="ob-auth-foot-sep" aria-hidden="true">
              ·
            </span>
            <Link href="/forgot-password">{t("forgotPassword")}</Link>
          </p>
        </div>
      ) : null}
      <button type="submit" className="ob-btn ob-btn-primary" disabled={pending}>
        {pending ? (
          t("creating")
        ) : (
          <>
            {t("continue")} <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <AuthSsoBlock />

      <p className="ob-auth-foot">
        {t("alreadyHaveAccess")} <Link href="/login">{t("signInLink")}</Link>
        <span className="ob-auth-foot-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/forgot-password">{t("forgotPassword")}</Link>
      </p>
    </form>
  );
}
