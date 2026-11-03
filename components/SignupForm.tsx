"use client";
import { useAuthFormValidity } from "@/components/useAuthFormValidity";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { AuthSsoBlock } from "@/components/AuthSsoBlock";
import { authClient } from "@/lib/auth-client";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import { safeDemoNext } from "@/lib/marketing/demoAccess";

type Props = {
  inviteToken?: string;
  inviteEmail?: string;
  nextPath?: string;
  intent?: "demo";
  available?: boolean;
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
  available = true,
}: Props) {
  const t = useTranslations("auth");
  const fields = useAuthFormValidity("signup");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dest = safeDemoNext(
    nextPath,
    intent === "demo" ? "/app/enter" : "/onboarding",
  );

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
    setError(null);
    trackOnboarding("signup_started");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = email.split("@")[0] || "Operator";

    if (
      inviteEmail &&
      email.trim().toLowerCase() !== inviteEmail.toLowerCase()
    ) {
      setPending(false);
      setError(t("errors.inviteEmailMismatch"));
      return;
    }

    let result;
    try {
      result = await authClient.signUp.email({ name, email, password });
    } catch {
      setPending(false);
      setError(t("errors.generic"));
      return;
    }

    if (result.error) {
      setPending(false);
      setError(t("errors.signupFailed"));
      return;
    }

    trackOnboarding("signup_completed");

    if (inviteToken) {
      let accept;
      try {
        accept = await fetch("/api/invitations", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token: inviteToken }),
        });
      } catch {
        setPending(false);
        setError(t("errors.inviteFailed"));
        return;
      }
      if (accept.ok) {
        router.push(dest);
        router.refresh();
        return;
      }
      setPending(false);
      setError(t("errors.inviteFailed"));
      return;
    }

    setPending(false);
    router.push(dest);
    router.refresh();
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
            maxLength={128}
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

      {!available ? (
        <p className="ob-entry-availability" role="status">
          {t("entryUnavailable")}{" "}
          <NextLink href="/onboarding/preview">
            {t("entryWalkthrough")}
          </NextLink>
        </p>
      ) : null}
      <p className="ob-field-hint" role="status">
        {!fields.valid ? t("signupRequired") : null}
      </p>
      <button
        type="submit"
        className="ob-btn ob-btn-primary"
        disabled={pending || !available || !fields.valid}
      >
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
