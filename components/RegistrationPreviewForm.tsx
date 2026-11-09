"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { registrationFormSchema } from "@/lib/marketing/registration";
import {
  planName,
  planSetupPreviewHref,
  type PublicPlanId,
} from "@/lib/marketing/conversionJourney";

export function RegistrationPreviewForm({
  vertical,
  purpose = "demo",
  plan,
}: {
  vertical: "hotel" | "restaurant" | null;
  purpose?: "demo" | "workspace";
  plan: PublicPlanId | null;
}) {
  const labels = useTranslations("auth.demoForm");
  const t = useTranslations("auth.registration");
  const auth = useTranslations("auth");
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    company: "",
    role: "",
    locations: "",
    vertical: vertical || "",
    website: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => setReady(true), []);
  const result = registrationFormSchema.safeParse(values);
  const issue = (name: string) =>
    result.success
      ? undefined
      : result.error.issues.find((item) => item.path[0] === name);
  function message(name: string) {
    const found = issue(name);
    if (!found) return "";
    return t(
      [
        "nameQuality",
        "emailQuality",
        "companyQuality",
        "passwordQuality",
        "passwordMismatch",
      ].includes(found.message)
        ? found.message
        : "required",
    );
  }
  function change(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const target = event.currentTarget;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setValues((previous) => ({ ...previous, [target.name]: value }));
  }
  const fieldProps = (name: keyof typeof values) => ({
    id: `reg-${name}`,
    name,
    disabled: !ready || pending,
    onChange: change,
    onBlur: () => setTouched((previous) => ({ ...previous, [name]: true })),
    "aria-invalid": Boolean(touched[name] && issue(name)),
    "aria-describedby":
      touched[name] && issue(name) ? `reg-${name}-error` : undefined,
  });
  const errorFor = (name: string) =>
    touched[name] && issue(name) ? (
      <p id={`reg-${name}-error`} className="ob-registration-error">
        {message(name)}
      </p>
    ) : null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      pending ||
      !ready ||
      !result.success ||
      !event.currentTarget.reportValidity()
    )
      return;
    setPending(true);
    setError(null);
    try {
      const data = result.data;
      // Preview validation only. Passwords never leave the browser; no account is created.
      const response = await fetch("/api/demo/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          company: data.company,
          role: data.role,
          locations: data.locations,
          vertical: data.vertical,
          termsAccepted: data.termsAccepted,
          website: data.website,
        }),
      });
      if (!response.ok) throw new Error("Registration preview unavailable");
      const body = await response.json();
      const next = `/app/enter?vertical=${data.vertical}&go=1`;
      if (body.next !== next) throw new Error("Invalid destination");
      window.location.assign(
        purpose === "workspace"
          ? plan
            ? planSetupPreviewHref(plan, data.vertical)
            : `/pricing?from=demo&vertical=${data.vertical}#plans`
          : next,
      );
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }
  return (
    <form
      className="ob-auth-form ob-demo-form ob-registration-form"
      data-ready={ready ? "true" : "false"}
      onSubmit={submit}
    >
      <ol className="ob-registration-steps" aria-label={t("journey")}>
        {(purpose === "demo"
          ? [
              { label: t("stepRegister"), complete: false, current: true },
              { label: t("stepExplore"), complete: false, current: false },
            ]
          : plan
            ? [
                { label: t("stepChoose"), complete: true, current: false },
                { label: t("stepRegister"), complete: false, current: true },
                { label: t("stepSetup"), complete: false, current: false },
              ]
            : [
                { label: t("stepRegister"), complete: false, current: true },
                { label: t("stepChoose"), complete: false, current: false },
                { label: t("stepSetup"), complete: false, current: false },
              ]
        ).map((step, index) => (
          <li
            key={step.label}
            aria-current={step.current ? "step" : undefined}
            data-completed={step.complete || undefined}
          >
            <span>{step.complete ? "✓" : index + 1}</span>
            {step.label}
          </li>
        ))}
      </ol>
      {plan ? (
        <p className="ob-registration-plan">
          {t("selectedPlan")} <strong>{planName(plan)}</strong>
        </p>
      ) : null}
      <div className="ob-registration-preview" role="note">
        <strong>{t("previewTitle")}</strong>
        <p>{t("previewNote")}</p>
      </div>
      <div className="ob-demo-fields">
        <div className="ob-field">
          <label htmlFor="reg-fullName">{labels("fullName")}</label>
          <input
            {...fieldProps("fullName")}
            value={values.fullName}
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder={labels("namePlaceholder")}
          />
          {errorFor("fullName")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-email">{labels("email")}</label>
          <input
            {...fieldProps("email")}
            value={values.email}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@your-company.com"
          />
          {errorFor("email")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-company">{labels("company")}</label>
          <input
            {...fieldProps("company")}
            value={values.company}
            autoComplete="organization"
            required
            minLength={2}
            maxLength={200}
            placeholder={labels("companyPlaceholder")}
          />
          {errorFor("company")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-role">{labels("role")}</label>
          <select {...fieldProps("role")} value={values.role} required>
            <option value="" disabled>
              {labels("selectRole")}
            </option>
            {["owner", "finance", "operations", "general-manager", "other"].map(
              (role) => (
                <option key={role} value={role}>
                  {labels(`roles.${role}`)}
                </option>
              ),
            )}
          </select>
          {errorFor("role")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-locations">{labels("locations")}</label>
          <select
            {...fieldProps("locations")}
            value={values.locations}
            required
          >
            <option value="" disabled>
              {labels("selectLocations")}
            </option>
            {["1", "2-5", "6-20", "21-50", "50+"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          {errorFor("locations")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-vertical">{labels("world")}</label>
          <select {...fieldProps("vertical")} value={values.vertical} required>
            <option value="" disabled>
              {labels("selectWorld")}
            </option>
            <option value="restaurant">{labels("restaurant")}</option>
            <option value="hotel">{labels("hotel")}</option>
          </select>
          {errorFor("vertical")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-password">{auth("password")}</label>
          <div className="ob-auth-pw">
            <input
              {...fieldProps("password")}
              value={values.password}
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              required
              minLength={10}
              maxLength={128}
              placeholder={auth("passwordPlaceholder")}
            />
            <button
              type="button"
              className="ob-auth-pw-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-pressed={showPassword}
            >
              {showPassword ? auth("hidePassword") : auth("showPassword")}
            </button>
          </div>
          {errorFor("password")}
        </div>
        <div className="ob-field">
          <label htmlFor="reg-confirmPassword">{auth("confirmPassword")}</label>
          <input
            {...fieldProps("confirmPassword")}
            value={values.confirmPassword}
            type={showPassword ? "text" : "password"}
            autoComplete="off"
            required
            minLength={10}
            maxLength={128}
          />
          {errorFor("confirmPassword")}
        </div>
      </div>
      <p className="ob-registration-help">{t("qualityHelp")}</p>
      <label className="ob-registration-terms">
        <input
          {...fieldProps("termsAccepted")}
          checked={values.termsAccepted}
          type="checkbox"
          required
        />
        <span>
          {t("termsLead")}{" "}
          <Link href="/terms" target="_blank" rel="noopener noreferrer">
            {t("terms")}
          </Link>{" "}
          {t("privacyLead")}{" "}
          <Link href="/privacy" target="_blank" rel="noopener noreferrer">
            {t("privacy")}
          </Link>
          .
        </span>
      </label>
      {errorFor("termsAccepted")}
      <div className="ob-demo-honeypot" aria-hidden="true">
        <label htmlFor="reg-website">Website</label>
        <input
          id="reg-website"
          name="website"
          value={values.website}
          onChange={change}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className="ob-registration-required" role="status">
        {result.success ? t("ready") : t("allRequired")}
      </p>
      {error ? (
        <p className="ob-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        className="ob-btn ob-btn-primary"
        disabled={!ready || !result.success || pending}
      >
        {pending
          ? t("opening")
          : purpose === "workspace"
            ? plan
              ? t("continueSetup")
              : t("continuePlans")
            : t("continueDemo")}
        <span aria-hidden="true">→</span>
      </button>
      <p className="ob-auth-foot">
        {auth("hasAccount")} <Link href="/login">{auth("signInLink")}</Link>
      </p>
    </form>
  );
}
