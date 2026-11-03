"use client";
import { useAuthFormValidity } from "@/components/useAuthFormValidity";

import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { Link } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

export function ForgotPasswordForm({
  available = true,
}: {
  available?: boolean;
}) {
  const t = useTranslations("auth");
  const fields = useAuthFormValidity("forgot");
  const locale = useLocale();
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      pending ||
      !available ||
      !fields.valid ||
      !event.currentTarget.reportValidity()
    )
      return;
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    // Always complete the same UX path - never reveal whether the email exists.
    // Locale-prefixed path so reset lands on the correct public route.
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `/${locale}/reset-password`,
      });
    } catch {
      /* Same confirmation for every account and delivery outcome. */
    }
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
          <Link href="/signup?intent=demo&next=/app/enter">
            {t("requestAccess")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form
      ref={fields.ref}
      onInput={fields.update}
      onChange={fields.update}
      onSubmit={onSubmit}
      className="ob-auth-form"
    >
      <div className="ob-field">
        <label htmlFor="email">{t("workEmail")}</label>
        <input
          id="email"
          name="email"
          maxLength={254}
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </div>
      {!available ? (
        <p className="ob-entry-availability" role="status">
          {t("entryRecoveryUnavailable")}
        </p>
      ) : null}
      <p className="ob-field-hint" role="status">
        {!fields.valid ? t("forgotRequired") : null}
      </p>
      <button
        type="submit"
        className="ob-btn ob-btn-primary"
        disabled={pending || !available || !fields.valid}
      >
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
        <Link href="/signup?intent=demo&next=/app/enter">
          {t("requestAccess")}
        </Link>
      </p>
    </form>
  );
}
