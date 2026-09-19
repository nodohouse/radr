"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AuthSsoBlock } from "@/components/AuthSsoBlock";
import { authClient } from "@/lib/auth-client";
import { safeInternalPath } from "@/lib/security/safe-redirect";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  // Post-auth destinations (/onboarding, /app) are outside the locale tree.
  const next = safeInternalPath(searchParams.get("next"), "/onboarding");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      // Anti-enumeration: identical message for unknown email and bad password.
      setError(t("errors.incorrectCredentials"));
      return;
    }

    router.push(next);
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
        <div className="ob-field-row">
          <label htmlFor="password">{t("password")}</label>
          <Link href="/forgot-password" className="ob-inline">
            {t("forgotPassword")}
          </Link>
        </div>
        <div className="ob-auth-pw">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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
      </div>

      {error ? (
        <div className="ob-error" role="alert">
          <p>{error}</p>
          <p className="ob-error-help">
            <Link href="/forgot-password">{t("forgotPasswordHelp")}</Link>
          </p>
        </div>
      ) : null}

      <button type="submit" className="ob-btn ob-btn-primary" disabled={pending}>
        {pending ? (
          t("signingIn")
        ) : (
          <>
            {t("continue")} <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <AuthSsoBlock />

      <p className="ob-auth-foot">
        {t("dontHaveAccess")}{" "}
        <Link href="/contact">{t("requestAccess")}</Link>
        <span className="ob-auth-foot-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/forgot-password">{t("forgotPassword")}</Link>
      </p>
    </form>
  );
}
