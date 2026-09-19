"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError(t("errors.invalidResetLink"));
      return;
    }
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (newPassword !== confirm) {
      setPending(false);
      setError(t("errors.passwordMismatch"));
      return;
    }

    const result = await authClient.resetPassword({
      newPassword,
      token,
    });
    setPending(false);

    if (result.error) {
      setError(t("errors.invalidResetLink"));
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="ob-auth-form" noValidate>
      {!token ? (
        <p className="ob-error" role="alert">
          {t("errors.invalidResetLink")}
        </p>
      ) : null}
      <div className="ob-field">
        <label htmlFor="password">{t("newPassword")}</label>
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
      </div>
      <div className="ob-field">
        <label htmlFor="confirm">{t("confirmPassword")}</label>
        <input
          id="confirm"
          name="confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          minLength={10}
        />
      </div>
      {error ? (
        <div className="ob-error" role="alert">
          <p>{error}</p>
          <p className="ob-error-help">
            <Link href="/forgot-password">{t("forgotPasswordHelp")}</Link>
          </p>
        </div>
      ) : null}
      <button
        type="submit"
        className="ob-btn ob-btn-primary"
        disabled={pending || !token}
      >
        {pending ? (
          t("updating")
        ) : (
          <>
            {t("submitReset")} <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p className="ob-auth-foot">
        <Link href="/login">{t("backToSignIn")}</Link>
        <span className="ob-auth-foot-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/forgot-password">{t("forgotPassword")}</Link>
      </p>
    </form>
  );
}
