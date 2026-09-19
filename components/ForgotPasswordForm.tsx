"use client";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");

    // Always complete the same UX path - never reveal whether the email exists.
    // Locale-prefixed path so reset lands on the correct public route.
    await authClient.requestPasswordReset({
      email,
      redirectTo: `/${locale}/reset-password`,
    });
    setPending(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="ob-auth-confirm">
        <p className="ob-copy">{t("forgotDone")}</p>
        <p className="ob-auth-foot">
          <Link href="/login">{t("backToSignInArrow")}</Link>
          <span className="ob-auth-foot-sep" aria-hidden="true">
            ·
          </span>
          <Link href="/contact">{t("requestAccess")}</Link>
        </p>
      </div>
    );
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
      <button type="submit" className="ob-btn ob-btn-primary" disabled={pending}>
        {pending ? (
          t("sending")
        ) : (
          <>
            {t("submitForgot")} <span aria-hidden="true">→</span>
          </>
        )}
      </button>
      <p className="ob-auth-foot">
        <Link href="/login">{t("backToSignIn")}</Link>
        <span className="ob-auth-foot-sep" aria-hidden="true">
          ·
        </span>
        <Link href="/contact">{t("requestAccess")}</Link>
      </p>
    </form>
  );
}
