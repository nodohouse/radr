"use client";
import { validName, validTimezone } from "@/lib/onboarding/requiredFields";

/**
 * First-value onboarding funnel.
 * North star: TIME TO FIRST DECISION.
 * MVP: account → org → location → Supplier/AP → upload → analyze → reveal.
 */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import Link from "next/link";
import { entryFont } from "./entryFont";
import { SetupJourney, setupIndex } from "./SetupJourney";
import { SignOutButton } from "@/components/SignOutButton";
import { ONBOARDING_COUNTRIES } from "@/lib/constants";
import { writeWorkspaceBrand } from "@/lib/onboarding/brand";
import { inferFromCity, searchPlaces } from "@/lib/onboarding/places";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import {
  DECISION_CLASS_CATALOG,
  STAGE_LABEL,
  type DecisionClassGoal,
  type EvidenceMethod,
  type FirstDecisionOutcome,
  type FirstValueStep,
  type IndustryKind,
  type LocationBand,
  type RoleLens,
} from "@/lib/onboarding/firstValue";
import {
  ensureMilestone,
  isFirstValuePath,
  withStep,
  type OnboardingState,
} from "@/lib/onboarding/types";

type WorkspaceSnapshot = {
  organizationId: string;
  name: string;
  onboarding: OnboardingState;
  primaryLocation: {
    id: string;
    name: string;
    city: string | null;
  } | null;
} | null;

type Props = {
  userName: string;
  userEmail?: string;
  workspace: WorkspaceSnapshot;
  preview?: boolean;
  userId?: string;
  previewVertical?: "hotel" | "restaurant";
};

const ROLE_LENSES: { id: RoleLens; label: string }[] = [
  { id: "owner", label: "Owner / Founder" },
  { id: "ceo", label: "CEO / Managing Director" },
  { id: "cfo", label: "CFO / Finance" },
  { id: "coo", label: "COO / Operations" },
  { id: "regional_ops", label: "Regional Operations" },
  { id: "gm", label: "General Manager" },
  { id: "procurement", label: "Procurement" },
  { id: "finance", label: "Finance / Controller" },
  { id: "it_data", label: "IT / Data" },
  { id: "other", label: "Other" },
];

const INDUSTRIES: { id: IndustryKind; label: string }[] = [
  { id: "restaurant_group", label: "Restaurant group" },
  { id: "hotel_group", label: "Hotel group" },
  { id: "bar_nightlife", label: "Bar / nightlife group" },
  { id: "serviced_apartments", label: "Serviced apartments" },
  { id: "mixed_hospitality", label: "Mixed hospitality group" },
  { id: "other", label: "Other" },
];

const BANDS: { id: LocationBand; label: string }[] = [
  { id: "1", label: "1" },
  { id: "2-5", label: "2–5" },
  { id: "6-20", label: "6–20" },
  { id: "21-50", label: "21–50" },
  { id: "51-100", label: "51–100" },
  { id: "100+", label: "100+" },
];

function resumeStep(workspace: WorkspaceSnapshot): FirstValueStep {
  if (!workspace) return "welcome";
  const s = workspace.onboarding;
  if (!isFirstValuePath(s)) return "welcome";
  if (!s.completedAt && !s.firstDecision) {
    if (!validName(s.fullName || "") || !s.roleLens) return "who";
    if (
      !validName(s.organizationName || workspace.name || "") ||
      !s.industry ||
      !s.locationBand
    )
      return "organization";
    if (!validName(s.locationName || "") || !validName(s.locationCity || ""))
      return "location";
  }
  const step = s.step as FirstValueStep;
  const allowed: FirstValueStep[] = [
    "welcome",
    "who",
    "organization",
    "location",
    "goal",
    "evidence",
    "upload",
    "mapping",
    "data_health",
    "analyzing",
    "reveal",
    "complete",
  ];
  if (allowed.includes(step)) return step;
  if (s.firstDecision) return "reveal";
  if (s.contractDocumentId || s.invoiceDocumentId) return "upload";
  if (s.decisionClass) return "evidence";
  if (s.locationName || workspace.primaryLocation) return "goal";
  if (s.organizationName || workspace.name) return "location";
  return "welcome";
}

function money(minor: number, currency: string) {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat("en-EU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(0)}`;
  }
}

export function FirstValueFunnel({
  userName,
  userEmail,
  workspace,
  preview = false,
  previewVertical,
  userId,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<FirstValueStep>(() => resumeStep(workspace));
  const [fullName, setFullName] = useState(
    workspace?.onboarding.fullName ?? userName ?? "",
  );
  const [roleLens, setRoleLens] = useState<RoleLens>(
    workspace?.onboarding.roleLens ?? "owner",
  );
  const [orgName, setOrgName] = useState(
    workspace?.onboarding.organizationName ?? workspace?.name ?? "",
  );
  const [industry, setIndustry] = useState<IndustryKind>(
    workspace?.onboarding.industry ??
      (previewVertical === "hotel" ? "hotel_group" : "restaurant_group"),
  );
  const [band, setBand] = useState<LocationBand>(
    (workspace?.onboarding.locationBand as LocationBand) ?? "2-5",
  );
  const [currency, setCurrency] = useState(
    workspace?.onboarding.reportingCurrency ??
      workspace?.onboarding.currency ??
      "EUR",
  );
  const [locationName, setLocationName] = useState(
    workspace?.onboarding.locationName ??
      workspace?.primaryLocation?.name ??
      "",
  );
  const [locationCity, setLocationCity] = useState(
    workspace?.onboarding.locationCity ??
      workspace?.primaryLocation?.city ??
      "",
  );
  const [cityQuery, setCityQuery] = useState(locationCity);
  const [country, setCountry] = useState(
    workspace?.onboarding.locationCountry ??
      workspace?.onboarding.hqCountry ??
      "",
  );
  const [timezoneOverride, setTimezoneOverride] = useState<string | null>(
    workspace?.onboarding.locationTimezone ??
      workspace?.onboarding.timezone ??
      null,
  );
  const [decisionClass, setDecisionClass] = useState<DecisionClassGoal>(
    workspace?.onboarding.decisionClass ?? "supplier_ap",
  );
  const [evidenceMethod, setEvidenceMethod] = useState<EvidenceMethod>(
    workspace?.onboarding.evidenceMethod ?? "upload",
  );
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [outcome, setOutcome] = useState<FirstDecisionOutcome | null>(
    workspace?.onboarding.firstDecision ?? null,
  );
  const [orgId, setOrgId] = useState(workspace?.organizationId ?? "");
  const [locationId, setLocationId] = useState(
    workspace?.primaryLocation?.id ?? "",
  );
  const [analyzeLines, setAnalyzeLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [confirmed, setConfirmed] = useState({
    role: Boolean(workspace?.onboarding.roleLens),
    industry: Boolean(workspace?.onboarding.industry),
    band: Boolean(workspace?.onboarding.locationBand),
    goal: Boolean(workspace?.onboarding.decisionClass),
    evidence: Boolean(workspace?.onboarding.evidenceMethod),
  });
  const personReady = validName(fullName) && confirmed.role;
  const organizationReady =
    validName(orgName) &&
    confirmed.industry &&
    confirmed.band &&
    ["EUR", "GBP", "USD", "CHF", "AED", "SGD"].includes(currency);
  const activeOrgId = workspace?.organizationId ?? orgId;
  const activeLocationId = workspace?.primaryLocation?.id ?? locationId;

  const countryMeta = useMemo(
    () =>
      ONBOARDING_COUNTRIES.find((c) => c.code === country) ??
      ONBOARDING_COUNTRIES[0]!,
    [country],
  );

  const cityPlace = inferFromCity(locationCity);
  const effectiveTimezone =
    timezoneOverride ??
    (cityPlace?.countryCode === country
      ? cityPlace.timezone
      : countryMeta.timezone);
  const locationReady =
    personReady &&
    organizationReady &&
    validName(locationName) &&
    validName(locationCity) &&
    ONBOARDING_COUNTRIES.some((c) => c.code === country) &&
    validTimezone(effectiveTimezone || "");

  const stage =
    step === "welcome" || step === "who" || step === "organization"
      ? "your_organization"
      : step === "location"
        ? "your_locations"
        : step === "goal"
          ? "your_goal"
          : step === "evidence" || step === "upload" || step === "mapping"
            ? "your_data"
            : step === "data_health" || step === "analyzing"
              ? "data_check"
              : "first_decision";

  const stateRef = useRef<OnboardingState>(
    workspace?.onboarding ?? { step: "welcome", path: "first_value" },
  );
  const draftKey = `radr.setupDraft.v2:${preview ? `preview${previewVertical ? `:${previewVertical}` : ""}` : userId || userEmail || "session"}`;
  const [draftReady, setDraftReady] = useState(false);
  useEffect(() => {
    if (!workspace) {
      try {
        const raw = JSON.parse(sessionStorage.getItem(draftKey) || "null");
        if (raw && typeof raw === "object") {
          if (
            typeof raw.timezoneOverride === "string" &&
            validTimezone(raw.timezoneOverride)
          )
            setTimezoneOverride(raw.timezoneOverride);
          if (typeof raw.fullName === "string")
            setFullName(raw.fullName.slice(0, 120));
          if (typeof raw.orgName === "string")
            setOrgName(raw.orgName.slice(0, 120));
          if (typeof raw.locationName === "string")
            setLocationName(raw.locationName.slice(0, 120));
          if (typeof raw.locationCity === "string") {
            setLocationCity(raw.locationCity.slice(0, 120));
            setCityQuery(raw.locationCity.slice(0, 120));
          }
          if (ROLE_LENSES.some((r) => r.id === raw.roleLens))
            setRoleLens(raw.roleLens);
          if (!previewVertical && INDUSTRIES.some((r) => r.id === raw.industry))
            setIndustry(raw.industry);
          if (BANDS.some((r) => r.id === raw.band)) setBand(raw.band);
          if (["EUR", "GBP", "USD", "CHF", "AED", "SGD"].includes(raw.currency))
            setCurrency(raw.currency);
          if (ONBOARDING_COUNTRIES.some((r) => r.code === raw.country))
            setCountry(raw.country);
          if (raw.confirmed && typeof raw.confirmed === "object")
            setConfirmed((current) => ({
              ...current,
              role: raw.confirmed.role === true,
              industry: raw.confirmed.industry === true,
              band: raw.confirmed.band === true,
            }));
          if (["who", "organization", "location"].includes(raw.step)) {
            const personValid =
              validName(String(raw.fullName || "")) &&
              raw.confirmed?.role === true;
            const orgValid =
              validName(String(raw.orgName || "")) &&
              raw.confirmed?.industry === true &&
              raw.confirmed?.band === true;
            setStep(
              !personValid
                ? "who"
                : raw.step === "location" && !orgValid
                  ? "organization"
                  : raw.step,
            );
          }
        }
      } catch {
        /* Storage is optional. */
      }
    }
    setDraftReady(true);
  }, [draftKey, workspace, previewVertical]);
  useEffect(() => {
    if (!draftReady) return;
    try {
      if (activeOrgId && !preview) sessionStorage.removeItem(draftKey);
      else if (["welcome", "who", "organization", "location"].includes(step))
        sessionStorage.setItem(
          draftKey,
          JSON.stringify({
            step,
            fullName,
            roleLens,
            orgName,
            industry,
            band,
            currency,
            locationName,
            locationCity,
            country,
            confirmed,
            timezoneOverride,
          }),
        );
    } catch {
      /* Never block setup on browser storage. */
    }
  }, [
    draftReady,
    draftKey,
    activeOrgId,
    preview,
    step,
    fullName,
    roleLens,
    orgName,
    industry,
    band,
    currency,
    locationName,
    locationCity,
    country,
    confirmed,
    timezoneOverride,
  ]);
  useEffect(() => {
    document
      .querySelector<HTMLElement>(".ob-main h1")
      ?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);

  async function patch(partial: Partial<OnboardingState>) {
    if (preview || (!activeOrgId && !workspace)) {
      stateRef.current = { ...stateRef.current, ...partial };
      return;
    }
    const response = await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok)
      throw new Error(
        body?.error || "Your progress could not be saved. Please try again.",
      );
    stateRef.current = body?.onboarding || { ...stateRef.current, ...partial };
  }

  function go(next: FirstValueStep, extra?: Partial<OnboardingState>) {
    if (pending) return;
    if (
      (step === "who" && next === "organization" && !personReady) ||
      (step === "organization" && next === "location" && !organizationReady) ||
      (step === "goal" && next === "evidence" && !confirmed.goal) ||
      (step === "evidence" && next === "upload" && !confirmed.evidence)
    ) {
      setError(
        "Complete the required fields and make a selection before continuing.",
      );
      return;
    }
    setError(null);
    const update = withStep({ ...stateRef.current, ...extra }, next);
    if ((!activeOrgId && !workspace) || preview) {
      stateRef.current = update;
      setStep(next);
      return;
    }
    startTransition(async () => {
      try {
        await patch(update);
        setStep(next);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Your progress could not be saved.",
        );
      }
    });
  }
  const backStep: Partial<Record<FirstValueStep, FirstValueStep>> = {
    who: "welcome",
    organization: "who",
    location: "organization",
    evidence: "goal",
    upload: "evidence",
    data_health: "upload",
  };

  function createWorkspace() {
    if (pending || !locationReady) {
      setError(
        "Add your name, role, organization, industry, location count, location name, city, and country before continuing.",
      );
      return;
    }
    if (!validTimezone(effectiveTimezone || "")) {
      setError("Choose a valid location timezone.");
      return;
    }
    setError(null);
    if (activeOrgId && !preview) {
      go("goal", {
        fullName: fullName.trim(),
        roleLens,
        industry,
        organizationName: orgName.trim(),
        locationName: locationName.trim(),
        locationCity: locationCity.trim(),
        locationCountry: country,
        locationBand: band,
        reportingCurrency: currency,
        currency,
        locationTimezone: effectiveTimezone,
        timezone: effectiveTimezone,
      });
      return;
    }
    if (preview) {
      setOrgId("preview-workspace");
      setLocationId("preview-location");
      setStep("goal");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: "first_value",
            fullName: fullName.trim(),
            roleLens,
            industry,
            organizationName: orgName.trim(),
            locationName: locationName.trim(),
            country,
            currency,
            locationBand: band === "51-100" || band === "100+" ? "50+" : band,
            hqCity: locationCity.trim() || undefined,
            locationCity: locationCity.trim() || undefined,
            timezone: effectiveTimezone,
            role: roleLens,
            venueType:
              industry === "hotel_group"
                ? "hotel"
                : industry === "serviced_apartments"
                  ? "serviced_apartments"
                  : industry === "bar_nightlife"
                    ? "bar"
                    : "restaurant",
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(body?.error ?? "Could not create workspace");
          return;
        }
        const data = (await res.json()) as {
          organizationId: string;
          locationId: string;
        };
        setOrgId(data.organizationId);
        setLocationId(data.locationId);
        writeWorkspaceBrand({
          orgName: orgName.trim(),
          locationName: locationName.trim(),
          city: locationCity.trim() || undefined,
          country,
          currency,
          timezone: effectiveTimezone,
          demo: false,
        });
        trackOnboarding(
          "organization_created",
          { industry },
          data.organizationId,
        );
        trackOnboarding(
          "first_location_created",
          { country },
          data.organizationId,
        );
        setStep("goal");
        stateRef.current = {
          ...stateRef.current,
          fullName,
          roleLens,
          industry,
          organizationName: orgName.trim(),
          locationName: locationName.trim(),
          locationCity,
          currency,
          reportingCurrency: currency,
          locationCountry: country,
          step: "goal",
        };
        router.refresh();
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not create your workspace. Please try again.",
        );
      }
    });
  }

  function uploadFiles() {
    if (preview) {
      setError(
        "This is a setup preview. Create an account to upload private evidence, or explore the labelled demo.",
      );
      return;
    }
    if (!activeOrgId) {
      setError("Create your organization first.");
      return;
    }
    if (!contractFile || !invoiceFile) {
      setError("Upload both contract and invoice data.");
      return;
    }
    setError(null);
    startTransition(async () => {
      trackOnboarding("data_source_started", { method: "upload" }, activeOrgId);

      async function send(file: File, documentType: "CONTRACT" | "INVOICE") {
        const form = new FormData();
        form.set("file", file);
        form.set("organizationId", activeOrgId);
        if (activeLocationId) {
          form.set("locationId", activeLocationId);
        }
        form.set("documentType", documentType);
        const res = await fetch("/api/onboarding/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(body?.error ?? `Upload failed (${documentType})`);
        }
        const data = (await res.json()) as {
          documents?: { id: string }[];
        };
        trackOnboarding("file_uploaded", { type: documentType }, activeOrgId);
        return data.documents?.[0]?.id;
      }

      try {
        const contractId = await send(contractFile, "CONTRACT");
        const invoiceId = await send(invoiceFile, "INVOICE");
        await patch(
          ensureMilestone(
            withStep(
              {
                ...stateRef.current,
                evidenceMethod: "upload",
                contractDocumentId: contractId,
                invoiceDocumentId: invoiceId,
              },
              "data_health",
            ),
            "source_ready",
          ),
        );
        trackOnboarding("data_health_ready", {}, activeOrgId);
        setStep("data_health");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    });
  }

  function runAnalysis() {
    if (!activeOrgId) return;
    setError(null);
    setStep("analyzing");
    setAnalyzeLines([
      "Normalizing invoice lines",
      "Matching suppliers",
      "Matching contract terms",
      "Checking rate variances",
      "Applying materiality rules",
      "Forming Decisions",
    ]);
    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding/analyze", { method: "POST" });
        const body = (await res.json().catch(() => null)) as {
          error?: string;
          outcome?: FirstDecisionOutcome;
        } | null;
        if (!res.ok || !body?.outcome) {
          setError(body?.error ?? "Analysis failed");
          setStep("data_health");
          return;
        }
        setOutcome(body.outcome);
        if (body.outcome.kind === "decision") {
          trackOnboarding("first_decision_opened", {}, activeOrgId);
        }
        setStep("reveal");
      } catch {
        setError(
          "The analysis could not finish. Your evidence is still available; please try again.",
        );
        setStep("data_health");
      }
    });
  }

  function finish() {
    startTransition(async () => {
      try {
        if (activeOrgId) {
          await patch(
            ensureMilestone(
              {
                ...withStep(stateRef.current, "complete"),
                completedAt: new Date().toISOString(),
                step: "done",
              },
              "onboarding_complete",
            ),
          );
          trackOnboarding("onboarding_completed", {}, activeOrgId);
          trackOnboarding("control_center_viewed", {}, activeOrgId);
        }
        router.push("/app?welcome=1");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Your progress could not be saved.",
        );
      }
    });
  }

  const places = searchPlaces(cityQuery).slice(0, 6);

  return (
    <div
      className={`${entryFont.variable} ob-root ob-setup`}
      data-preview={preview || undefined}
      aria-busy={pending}
    >
      <header className="ob-chrome">
        <Link href="/en" aria-label="RADR home">
          <FrozenRadrLogo variant="mark" width={48} priority />
        </Link>
        {preview ? (
          <Link className="ob-link" href="/en/login">
            Sign in
          </Link>
        ) : (
          <SignOutButton />
        )}
      </header>

      <div className="ob-setup-layout">
        <SetupJourney
          step={step}
          orgName={orgName}
          locationName={locationName}
          currency={currency}
          preview={preview}
        />
        <main className="ob-main">
          <div className="ob-step-controls">
            {backStep[step] ? (
              <button
                type="button"
                className="ob-back"
                disabled={pending}
                onClick={() => go(backStep[step]!)}
              >
                Back
              </button>
            ) : (
              <span />
            )}
            <span>
              {preview
                ? "Preview · nothing is saved to a workspace"
                : activeOrgId
                  ? "Progress saved to your workspace"
                  : "Draft kept in this browser session"}
            </span>
          </div>
          {step !== "welcome" ? (
            <div className="ob-setup-progress">
              <span>Step {setupIndex(step) + 1} of 6</span>
              <progress
                max={6}
                value={setupIndex(step) + 1}
                aria-label="Setup progress"
              />
            </div>
          ) : null}
          {step !== "welcome" && step !== "analyzing" ? (
            <p className="ob-stage" aria-live="polite">
              {STAGE_LABEL[stage]}
            </p>
          ) : null}

          {error ? (
            <p className="ob-error" role="alert">
              {error}
            </p>
          ) : null}

          {step === "welcome" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Your operation.
                <br />
                Your first clear decision.
              </h1>
              <p className="ob-lead">
                Start with one location and one priority. Add evidence when you
                are ready, or explore a clearly labelled demo first.
              </p>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending}
                onClick={() => {
                  trackOnboarding("onboarding_started");
                  if (workspace) go("goal");
                  else go("who");
                }}
              >
                Get started
              </button>
              <p className="ob-meta">
                <Link className="ob-link" href="/app/enter">
                  Explore the demo first
                </Link>{" "}
                · Illustrative Northstar data, separate from your operation.
              </p>
            </section>
          ) : null}

          {step === "who" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Who are you?
              </h1>
              <p className="ob-hint">
                RADR uses this to prioritize what you see. It does not limit
                your organization&apos;s underlying data.
              </p>
              <label className="ob-field">
                <span>Full name</span>
                <input
                  value={fullName}
                  required
                  minLength={2}
                  maxLength={120}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </label>
              <p id="person-required" className="ob-hint">
                Enter at least two characters for your name and choose your role
                to continue.
              </p>
              {userEmail ? (
                <p className="ob-meta">Work email · {userEmail}</p>
              ) : null}
              <fieldset className="ob-choice-grid">
                <legend>Role (required)</legend>
                {ROLE_LENSES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className="ob-choice"
                    aria-pressed={confirmed.role && roleLens === r.id}
                    data-on={
                      confirmed.role && roleLens === r.id ? "true" : undefined
                    }
                    onClick={() => {
                      setRoleLens(r.id);
                      setConfirmed((v) => ({ ...v, role: true }));
                    }}
                  >
                    {r.label}
                  </button>
                ))}
              </fieldset>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                aria-describedby="person-required"
                disabled={pending || !personReady}
                onClick={() => go("organization", { fullName, roleLens })}
              >
                Continue
              </button>
            </section>
          ) : null}

          {step === "organization" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Your organization
              </h1>
              <p className="ob-hint">
                All fields are required. Choose your industry and location count
                to continue.
              </p>
              <label className="ob-field">
                <span>Organization name</span>
                <input
                  value={orgName}
                  required
                  minLength={2}
                  maxLength={120}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Northstar Hospitality Group"
                />
              </label>
              <fieldset className="ob-choice-grid">
                <legend>Industry (required)</legend>
                {INDUSTRIES.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    className="ob-choice"
                    aria-pressed={confirmed.industry && industry === i.id}
                    data-on={
                      confirmed.industry && industry === i.id
                        ? "true"
                        : undefined
                    }
                    onClick={() => {
                      setIndustry(i.id);
                      setConfirmed((v) => ({ ...v, industry: true }));
                    }}
                  >
                    {i.label}
                  </button>
                ))}
              </fieldset>
              <fieldset className="ob-choice-row">
                <legend>How many locations do you operate? (required)</legend>
                {BANDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="ob-chip"
                    aria-pressed={confirmed.band && band === b.id}
                    data-on={
                      confirmed.band && band === b.id ? "true" : undefined
                    }
                    onClick={() => {
                      setBand(b.id);
                      setConfirmed((v) => ({ ...v, band: true }));
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </fieldset>
              <label className="ob-field">
                <span>Group reporting currency</span>
                <select
                  aria-label="Group reporting currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {["EUR", "GBP", "USD", "CHF", "AED", "SGD"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <p className="ob-hint">
                Location economics can remain in local currencies. RADR uses
                this for group reporting.
              </p>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !organizationReady}
                onClick={() =>
                  go("location", {
                    organizationName: orgName.trim(),
                    industry,
                    locationBand: band,
                    reportingCurrency: currency,
                    currency,
                  })
                }
              >
                Continue
              </button>
            </section>
          ) : null}

          {step === "location" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Add your first location
              </h1>
              <p className="ob-hint">
                We use location for currency, timezone, operating context, and
                permissions. You can add the rest after the first Decision.
              </p>
              <label className="ob-field">
                <span>Location name</span>
                <input
                  value={locationName}
                  required
                  minLength={2}
                  maxLength={120}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Berlin Mitte"
                />
              </label>
              <label className="ob-field">
                <span>City</span>
                <input
                  value={cityQuery}
                  required
                  minLength={2}
                  maxLength={120}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setLocationCity(e.target.value);
                    setTimezoneOverride(null);
                  }}
                  placeholder="Berlin"
                  list="ob-city-list"
                />
                <datalist id="ob-city-list">
                  {places.map((p) => (
                    <option key={`${p.city}-${p.countryCode}`} value={p.city} />
                  ))}
                </datalist>
              </label>
              <label className="ob-field">
                <span>Country</span>
                <select
                  aria-label="Country"
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setTimezoneOverride(null);
                  }}
                >
                  <option value="" disabled>
                    Choose a country
                  </option>
                  {ONBOARDING_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="ob-field">
                <span>Location timezone</span>
                <input
                  required
                  value={effectiveTimezone || ""}
                  onChange={(e) => setTimezoneOverride(e.target.value)}
                  list="ob-timezone-list"
                  aria-describedby="timezone-hint"
                />
                <datalist id="ob-timezone-list">
                  {[
                    ...new Set(
                      [
                        countryMeta.timezone,
                        cityPlace?.timezone,
                        "Europe/Amsterdam",
                        "Europe/Berlin",
                        "Europe/London",
                        "America/New_York",
                        "America/Chicago",
                        "America/Denver",
                        "America/Los_Angeles",
                        "Pacific/Honolulu",
                        "UTC",
                      ].filter((zone): zone is string => Boolean(zone)),
                    ),
                  ].map((zone) => (
                    <option key={zone} value={zone} />
                  ))}
                </datalist>
              </label>
              <p className="ob-hint" id="timezone-hint">
                Suggested from your location. Review this for countries with
                multiple timezones. Use an IANA name such as America/Chicago.
              </p>
              <p className="ob-meta">Reporting currency · {currency}</p>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !locationReady}
                onClick={createWorkspace}
              >
                {pending ? "Creating…" : "Continue with this location"}
              </button>
            </section>
          ) : null}

          {step === "goal" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Where should RADR look first?
              </h1>
              <ul className="ob-goal-list">
                {DECISION_CLASS_CATALOG.map((c) => {
                  const selectable =
                    c.availability === "recommended" ||
                    c.availability === "available";
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        className="ob-goal"
                        aria-pressed={confirmed.goal && decisionClass === c.id}
                        data-on={
                          confirmed.goal && decisionClass === c.id
                            ? "true"
                            : undefined
                        }
                        data-avail={c.availability}
                        disabled={!selectable}
                        onClick={() => {
                          if (selectable) {
                            setDecisionClass(c.id);
                            setConfirmed((v) => ({ ...v, goal: true }));
                          }
                        }}
                      >
                        <strong>{c.title}</strong>
                        <span>{c.detail}</span>
                        {c.availability === "recommended" ? (
                          <em>Recommended for first pilot</em>
                        ) : c.availability !== "available" ? (
                          <em>
                            {c.availability === "building"
                              ? "Building"
                              : "Planned"}
                          </em>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !confirmed.goal}
                onClick={() => {
                  if (workspace) {
                    trackOnboarding(
                      "decision_class_selected",
                      { class: decisionClass },
                      workspace.organizationId,
                    );
                  }
                  go("evidence", { decisionClass });
                }}
              >
                Continue
              </button>
            </section>
          ) : null}

          {step === "evidence" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Connect what you already have
              </h1>
              <p className="ob-hint">
                RADR needs evidence before it can form Decisions.
              </p>
              <div className="ob-evidence">
                <button
                  type="button"
                  className="ob-goal"
                  aria-pressed={
                    confirmed.evidence && evidenceMethod === "upload"
                  }
                  data-on={
                    confirmed.evidence && evidenceMethod === "upload"
                      ? "true"
                      : undefined
                  }
                  onClick={() => {
                    setEvidenceMethod("upload");
                    setConfirmed((v) => ({ ...v, evidence: true }));
                  }}
                >
                  <strong>Upload files</strong>
                  <span>
                    CSV exports, up to 1 MB each. Templates are provided.
                  </span>
                </button>
                <button
                  type="button"
                  className="ob-goal"
                  aria-pressed={confirmed.evidence && evidenceMethod === "demo"}
                  data-on={
                    confirmed.evidence && evidenceMethod === "demo"
                      ? "true"
                      : undefined
                  }
                  onClick={() => {
                    setEvidenceMethod("demo");
                    setConfirmed((v) => ({ ...v, evidence: true }));
                  }}
                >
                  <strong>Explore with demo data</strong>
                  <span>Illustrative only. Not mixed with your real data.</span>
                </button>
                <button
                  type="button"
                  className="ob-goal"
                  disabled
                  data-avail="building"
                >
                  <strong>Connect a system</strong>
                  <span>Available connectors unlock as integrations ship.</span>
                  <em>Building</em>
                </button>
              </div>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !confirmed.evidence}
                onClick={() => {
                  if (!confirmed.evidence || pending) return;
                  if (evidenceMethod === "demo") {
                    startTransition(async () => {
                      try {
                        if (!preview && activeOrgId)
                          await patch({
                            ...withStep(stateRef.current, "complete"),
                            evidenceMethod: "demo",
                            demoEnabled: true,
                            step: "done",
                            completedAt: new Date().toISOString(),
                          });
                        const hotel =
                          industry === "hotel_group" ||
                          industry === "serviced_apartments";
                        router.push(
                          `/app/enter?vertical=${hotel ? "hotel" : "restaurant"}&go=1`,
                        );
                      } catch (error) {
                        setError(
                          error instanceof Error
                            ? error.message
                            : "Your progress could not be saved.",
                        );
                      }
                    });
                    return;
                  }
                  go("upload", { evidenceMethod: "upload" });
                }}
              >
                {evidenceMethod === "demo"
                  ? "Explore with demo data"
                  : "Upload data"}
              </button>
            </section>
          ) : null}

          {step === "upload" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Upload Supplier / AP evidence
              </h1>
              <p className="ob-hint">
                Files are scoped to your organization and used to form RADR
                Decisions. You can review imported records before analysis.
              </p>
              <div className="ob-upload-block">
                <h2 className="ob-sub">Contract data</h2>
                <input
                  type="file"
                  aria-label="Contract CSV"
                  accept=".csv,text/csv"
                  onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
                />
                <a
                  className="ob-link"
                  href="/templates/radr-contract-template.csv"
                  download
                >
                  Download contract template
                </a>
              </div>
              <div className="ob-upload-block">
                <h2 className="ob-sub">Invoice data</h2>
                <input
                  type="file"
                  aria-label="Invoice CSV"
                  accept=".csv,text/csv"
                  onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
                />
                <a
                  className="ob-link"
                  href="/templates/radr-invoice-template.csv"
                  download
                >
                  Download invoice template
                </a>
              </div>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !contractFile || !invoiceFile}
                onClick={uploadFiles}
              >
                {pending ? "Uploading…" : "Continue"}
              </button>
            </section>
          ) : null}

          {step === "data_health" ? (
            <section className="ob-panel">
              <h1 className="ob-title" tabIndex={-1}>
                Your files are ready for a quality check
              </h1>
              <ul className="ob-health">
                <li>Contract data · Uploaded</li>
                <li>Invoice data · Uploaded</li>
                <li>
                  Location ·{" "}
                  {workspace?.primaryLocation?.name ?? locationName ?? "Ready"}
                </li>
                <li>Currency · {currency}</li>
              </ul>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending}
                onClick={runAnalysis}
              >
                Find my first Decision
              </button>
            </section>
          ) : null}

          {step === "analyzing" ? (
            <section className="ob-panel" aria-live="polite">
              <h1 className="ob-title" tabIndex={-1}>
                Working through your evidence
              </h1>
              <ol className="ob-analyze">
                {analyzeLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ol>
            </section>
          ) : null}

          {step === "reveal" && outcome ? (
            <section className="ob-panel">
              {outcome.kind === "decision" ? (
                <>
                  <p className="ob-kicker">RADR found something</p>
                  <p className="ob-meta">
                    {outcome.classLabel} · {outcome.locationName}
                  </p>
                  <h1 className="ob-title ob-title-money" tabIndex={-1}>
                    {money(outcome.amountMinor, outcome.currency)}
                  </h1>
                  <p className="ob-lead">{outcome.headline}</p>
                  <p className="ob-hint">{outcome.rationale}</p>
                  {outcome.evidence ? (
                    <details className="ob-result-evidence">
                      <summary>Review the evidence behind this result</summary>
                      <dl>
                        {[
                          ["Supplier", outcome.evidence.supplier],
                          ["Item", outcome.evidence.sku],
                          [
                            "Contract rate",
                            `${outcome.currency} ${outcome.evidence.contractRate.toFixed(2)} / ${outcome.evidence.unit}`,
                          ],
                          [
                            "Invoice rate",
                            `${outcome.currency} ${outcome.evidence.invoiceRate.toFixed(2)} / ${outcome.evidence.unit}`,
                          ],
                          [
                            "Quantity",
                            `${outcome.evidence.quantity} ${outcome.evidence.unit}`,
                          ],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                          </div>
                        ))}
                      </dl>
                      <p>
                        Expected invoice price variance, not verified recovered
                        value. Check the units and contract applicability before
                        taking action.
                      </p>
                    </details>
                  ) : null}
                  <p className="ob-hint">
                    RADR only surfaced this because the variance exceeds your
                    materiality threshold and has sufficient evidence.
                  </p>
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={finish}
                  >
                    Open Control Center
                  </button>
                </>
              ) : null}

              {outcome.kind === "nothing_needs_you" ? (
                <>
                  <h1 className="ob-title" tabIndex={-1}>
                    Nothing needs your attention
                  </h1>
                  <p className="ob-lead">
                    RADR reviewed {outcome.invoiceLines} invoice lines and{" "}
                    {outcome.contracts} active contracts. No material
                    discrepancies above your{" "}
                    {money(outcome.thresholdMinor, outcome.currency)} threshold.
                  </p>
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={finish}
                  >
                    Go to Control Center
                  </button>
                </>
              ) : null}

              {outcome.kind === "insufficient_evidence" ? (
                <>
                  <h1 className="ob-title" tabIndex={-1}>
                    RADR found a potential issue
                  </h1>
                  <p className="ob-lead">
                    There is not enough evidence to recommend action.
                  </p>
                  <p className="ob-hint">{outcome.message}</p>
                  <p className="ob-meta">
                    Missing · {outcome.missing.join(" · ")}
                  </p>
                  <button
                    type="button"
                    className="ob-btn ob-btn-primary"
                    disabled={pending}
                    onClick={() => setStep("upload")}
                  >
                    Upload contract
                  </button>
                </>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
