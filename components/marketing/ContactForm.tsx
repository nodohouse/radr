"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  submitContactInquiry,
  type ContactResult,
} from "@/app/[locale]/contact/actions";

const initial: ContactResult | null = null;

const LOCATION_OPTIONS = [
  "1",
  "2-5",
  "6-15",
  "16-50",
  "50+",
] as const;

const ROLE_OPTIONS = [
  "owner",
  "ops",
  "finance",
  "gm",
  "other",
] as const;

const INDUSTRY_OPTIONS = [
  "restaurants",
  "hotels",
  "bars-nightlife",
  "multi-brand",
  "retail",
  "other",
] as const;

const INTEREST_OPTIONS = [
  "demo",
  "pricing",
  "package-pilot",
  "package-core",
  "package-control",
  "multi-location",
  "integrations",
  "other",
] as const;

type SelectedPlan = "pilot" | "core" | "control";

function planToInterest(plan?: string | null): string {
  if (plan === "pilot") return "package-pilot";
  if (plan === "core") return "package-core";
  if (plan === "control") return "package-control";
  return "";
}

function parsePlan(raw: string | null | undefined): SelectedPlan | undefined {
  if (raw === "pilot" || raw === "core" || raw === "control") return raw;
  return undefined;
}

export function ContactForm({
  selectedPlan,
}: {
  selectedPlan?: SelectedPlan;
}) {
  const t = useTranslations("company.form");
  const searchParams = useSearchParams();
  const [state, action, pending] = useActionState(submitContactInquiry, initial);

  const planFromUrl = parsePlan(searchParams.get("plan"));
  const activePlan = planFromUrl ?? selectedPlan;
  const interestFromPlan = planToInterest(activePlan);

  const [interest, setInterest] = useState(interestFromPlan);
  const [role, setRole] = useState("");

  useEffect(() => {
    setInterest(interestFromPlan);
  }, [interestFromPlan]);

  const roleHints =
    role === "finance" || role === "owner"
      ? ["Recovery / Reconciliation", "Multi-location economics", "Verified Value"]
      : role === "gm" || role === "ops"
        ? ["Operations", "Perishable revenue", "Decisions / Floor"]
        : [];

  const formKey = useMemo(
    () => activePlan ?? "general",
    [activePlan],
  );

  useEffect(() => {
    if (state?.ok && state.mode === "mailto") {
      window.location.href = state.mailto;
    }
  }, [state]);

  return (
    <form
      className="rx-contact-form"
      action={action}
      noValidate
      key={formKey}
    >
      {activePlan ? (
        <input type="hidden" name="plan" value={activePlan} />
      ) : null}

      <div className="rx-contact-field">
        <label htmlFor="contact-email">{t("workEmail")}</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-company">{t("company")}</label>
        <input
          id="contact-company"
          name="company"
          type="text"
          autoComplete="organization"
          required
          placeholder={t("companyPlaceholder")}
        />
      </div>

      <div className="rx-contact-row">
        <div className="rx-contact-field">
          <label htmlFor="contact-role">{t("role")}</label>
          <select
            id="contact-role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="" disabled>
              {t("select")}
            </option>
            {ROLE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`roles.${value}`)}
              </option>
            ))}
          </select>
          {roleHints.length > 0 ? (
            <ul className="rx-contact-hints" aria-live="polite">
              {roleHints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="rx-contact-field">
          <label htmlFor="contact-locations">
            {t("locations")}{" "}
            <span className="rx-contact-optional">{t("optional")}</span>
          </label>
          <select id="contact-locations" name="locations" defaultValue="">
            <option value="">{t("select")}</option>
            {LOCATION_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`locationRanges.${value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rx-contact-row">
        <div className="rx-contact-field">
          <label htmlFor="contact-industry">
            {t("industry")}{" "}
            <span className="rx-contact-optional">{t("optional")}</span>
          </label>
          <select id="contact-industry" name="industry" defaultValue="">
            <option value="">{t("select")}</option>
            {INDUSTRY_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`industries.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="rx-contact-field">
          <label htmlFor="contact-interest">{t("interest")}</label>
          <select
            id="contact-interest"
            name="interest"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            required
          >
            <option value="" disabled>
              {t("select")}
            </option>
            {INTEREST_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {t(`interests.${value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rx-contact-field">
        <label htmlFor="contact-message">
          {t("message")}{" "}
          <span className="rx-contact-optional">{t("optional")}</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          placeholder={t("messagePlaceholder")}
        />
      </div>

      {state && !state.ok ? (
        <p className="rx-contact-error" role="alert">
          {state.error}
        </p>
      ) : null}

      {state?.ok && state.mode === "webhook" ? (
        <p className="rx-contact-ok" role="status">
          {t("okWebhook")}
        </p>
      ) : null}

      {state?.ok && state.mode === "mailto" ? (
        <p className="rx-contact-ok" role="status">
          {t("okMailto")}
        </p>
      ) : null}

      <button
        type="submit"
        className="rx-btn rx-btn-primary"
        disabled={pending}
      >
        {pending ? t("sending") : t("submit")}
      </button>

      <p className="rx-contact-privacy" style={{ marginTop: "1rem", fontSize: "0.85rem", maxWidth: "36rem" }}>
        By submitting, you agree that RADR may use your business contact details
        to respond to this request. See <Link href="/privacy">Privacy</Link>.
      </p>

      {/* Honeypot — hidden from accessibility tree */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    </form>
  );
}
