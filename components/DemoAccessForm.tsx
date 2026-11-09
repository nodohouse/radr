"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { demoLeadSchema } from "@/lib/marketing/demoLeadSchema";

export function DemoAccessForm({
  vertical,
}: {
  vertical: "hotel" | "restaurant" | null;
}) {
  const t = useTranslations("auth.demoForm");
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState({
    fullName: "",
    email: "",
    company: "",
    role: "",
    locations: "",
    vertical: vertical || "",
    website: "",
  });
  useEffect(() => setReady(true), []);
  const valid = demoLeadSchema.safeParse(values).success;
  function change(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    setValues((previous) => ({ ...previous, [name]: value }));
  }
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  function read(form: HTMLFormElement) {
    const data = new FormData(form);
    return demoLeadSchema.safeParse({
      fullName: data.get("fullName"),
      email: data.get("email"),
      company: data.get("company"),
      role: data.get("role"),
      locations: data.get("locations"),
      vertical: data.get("vertical"),
      website: data.get("website") || "",
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = read(form);
    if (
      pending ||
      !form.reportValidity() ||
      !parsed.success ||
      parsed.data.website
    )
      return;
    setPending(true);
    setError(null);
    try {
      // Visual lead-form preview only. Never transmit names, email or company.
      const response = await fetch("/api/demo/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vertical: parsed.data.vertical }),
      });
      if (!response.ok) throw new Error("Demo unavailable");
      const result = await response.json();
      const expected = `/app/enter?vertical=${parsed.data.vertical}&go=1`;
      if (result.next !== expected) throw new Error("Invalid destination");
      window.location.assign(expected);
    } catch {
      setError(t("error"));
      setPending(false);
    }
  }
  return (
    <form
      className="ob-auth-form ob-demo-form"
      onSubmit={submit}
      data-ready={ready ? "true" : "false"}
    >
      <div className="ob-demo-reassurance">
        <span aria-hidden="true">✦</span>
        {t("noAccount")}
      </div>
      <div className="ob-demo-fields">
        <div className="ob-field">
          <label htmlFor="demo-name">{t("fullName")}</label>
          <input
            id="demo-name"
            name="fullName"
            value={values.fullName}
            onChange={change}
            disabled={!ready}
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder={t("namePlaceholder")}
          />
        </div>
        <div className="ob-field">
          <label htmlFor="demo-email">{t("email")}</label>
          <input
            id="demo-email"
            name="email"
            value={values.email}
            onChange={change}
            disabled={!ready}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@company.com"
          />
        </div>
        <div className="ob-field">
          <label htmlFor="demo-company">{t("company")}</label>
          <input
            id="demo-company"
            name="company"
            value={values.company}
            onChange={change}
            disabled={!ready}
            autoComplete="organization"
            required
            minLength={2}
            maxLength={200}
            placeholder={t("companyPlaceholder")}
          />
        </div>
        <div className="ob-field">
          <label htmlFor="demo-role">{t("role")}</label>
          <select
            id="demo-role"
            name="role"
            value={values.role}
            onChange={change}
            disabled={!ready}
            required
          >
            <option value="" disabled>
              {t("selectRole")}
            </option>
            {["owner", "finance", "operations", "general-manager", "other"].map(
              (role) => (
                <option key={role} value={role}>
                  {t(`roles.${role}`)}
                </option>
              ),
            )}
          </select>
        </div>
        <div className="ob-field">
          <label htmlFor="demo-locations">{t("locations")}</label>
          <select
            id="demo-locations"
            name="locations"
            value={values.locations}
            onChange={change}
            disabled={!ready}
            required
          >
            <option value="" disabled>
              {t("selectLocations")}
            </option>
            {["1", "2-5", "6-20", "21-50", "50+"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </div>
        <div className="ob-field">
          <label htmlFor="demo-world">{t("world")}</label>
          <select
            id="demo-world"
            name="vertical"
            value={values.vertical}
            onChange={change}
            disabled={!ready}
            required
          >
            <option value="" disabled>
              {t("selectWorld")}
            </option>
            <option value="restaurant">{t("restaurant")}</option>
            <option value="hotel">{t("hotel")}</option>
          </select>
        </div>
      </div>
      <div className="ob-demo-honeypot" aria-hidden="true">
        <label htmlFor="demo-website">Website</label>
        <input
          id="demo-website"
          name="website"
          value={values.website}
          onChange={change}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <p className="ob-demo-preview-note">{t("previewNote")}</p>
      {error ? (
        <p className="ob-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="ob-btn ob-btn-primary"
        type="submit"
        disabled={!ready || !valid || pending}
      >
        {pending ? t("opening") : t("enter")}
        <span aria-hidden="true">→</span>
      </button>
      <p className="ob-demo-privacy">
        {t("privacyLead")} <Link href="/privacy">{t("privacy")}</Link>
      </p>
    </form>
  );
}
