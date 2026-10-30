"use client";

/**
 * First-value onboarding funnel.
 * North star: TIME TO FIRST DECISION.
 * MVP: account → org → location → Supplier/AP → upload → analyze → reveal.
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RadrLogo } from "@/components/marketing/RadrLogo";
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

export function FirstValueFunnel({ userName, userEmail, workspace }: Props) {
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
    workspace?.onboarding.industry ?? "restaurant_group",
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
      "DE",
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

  const activeOrgId = workspace?.organizationId ?? orgId;
  const activeLocationId = workspace?.primaryLocation?.id ?? locationId;

  const countryMeta = useMemo(
    () =>
      ONBOARDING_COUNTRIES.find((c) => c.code === country) ??
      ONBOARDING_COUNTRIES[0]!,
    [country],
  );

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

  async function patch(partial: Partial<OnboardingState>) {
    if (!activeOrgId && !workspace) return;
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(partial),
    });
  }

  function go(next: FirstValueStep, extra?: Partial<OnboardingState>) {
    setStep(next);
    setError(null);
    if (workspace || activeOrgId) {
      void patch(
        withStep(
          { ...(workspace?.onboarding ?? { step: "welcome" }), ...extra },
          next,
        ),
      );
    }
  }

  function createWorkspace() {
    setError(null);
    startTransition(async () => {
      const inferred = inferFromCity(locationCity) ?? countryMeta;
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: orgName.trim(),
          locationName: locationName.trim(),
          country,
          currency,
          locationBand: band === "51-100" || band === "100+" ? "50+" : band,
          hqCity: locationCity.trim() || undefined,
          locationCity: locationCity.trim() || undefined,
          timezone: inferred.timezone ?? countryMeta.timezone,
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
        timezone: inferred.timezone ?? countryMeta.timezone,
        demo: false,
      });
      trackOnboarding("organization_created", { industry }, data.organizationId);
      trackOnboarding(
        "first_location_created",
        { country },
        data.organizationId,
      );
      setStep("goal");
      router.refresh();
    });
  }

  function uploadFiles() {
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
      trackOnboarding(
        "data_source_started",
        { method: "upload" },
        activeOrgId,
      );

      async function send(file: File, documentType: "CONTRACT" | "INVOICE") {
        const form = new FormData();
        form.set("file", file);
        form.set("organizationId", activeOrgId);
        if (activeLocationId) {
          form.set("locationId", activeLocationId);
        }
        form.set("documentType", documentType);
        const res = await fetch("/api/documents/upload", {
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
                ...(workspace?.onboarding ?? { step: "welcome" }),
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
    });
  }

  function finish() {
    startTransition(async () => {
      if (activeOrgId) {
        await patch(
          ensureMilestone(
            {
              ...withStep(workspace?.onboarding ?? { step: "welcome" }, "complete"),
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
    });
  }

  const places = searchPlaces(cityQuery).slice(0, 6);

  return (
    <div className="ob-root">
      <header className="ob-chrome">
        <RadrLogo size="md" variant="plain" surface="light" as="p" />
        <SignOutButton />
      </header>

      <main className="ob-main">
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
            <h1 className="ob-title">Let&apos;s get RADR working.</h1>
            <p className="ob-lead">
              Connect your operation. RADR will tell you when there is enough
              evidence to form your first Decision.
            </p>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={() => {
                trackOnboarding("onboarding_started");
                if (workspace) go("goal");
                else go("who");
              }}
            >
              Get started
            </button>
          </section>
        ) : null}

        {step === "who" ? (
          <section className="ob-panel">
            <h1 className="ob-title">Who are you?</h1>
            <p className="ob-hint">
              RADR uses this to prioritize what you see. It does not limit your
              organization&apos;s underlying data.
            </p>
            <label className="ob-field">
              <span>Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
              />
            </label>
            {userEmail ? (
              <p className="ob-meta">Work email · {userEmail}</p>
            ) : null}
            <fieldset className="ob-choice-grid">
              <legend>Role</legend>
              {ROLE_LENSES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="ob-choice"
                  data-on={roleLens === r.id ? "true" : undefined}
                  onClick={() => setRoleLens(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </fieldset>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              disabled={!fullName.trim()}
              onClick={() => go("organization", { fullName, roleLens })}
            >
              Continue
            </button>
          </section>
        ) : null}

        {step === "organization" ? (
          <section className="ob-panel">
            <h1 className="ob-title">Your organization</h1>
            <label className="ob-field">
              <span>Organization name</span>
              <input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Northstar Hospitality Group"
              />
            </label>
            <fieldset className="ob-choice-grid">
              <legend>Industry</legend>
              {INDUSTRIES.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className="ob-choice"
                  data-on={industry === i.id ? "true" : undefined}
                  onClick={() => setIndustry(i.id)}
                >
                  {i.label}
                </button>
              ))}
            </fieldset>
            <fieldset className="ob-choice-row">
              <legend>How many locations do you operate?</legend>
              {BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="ob-chip"
                  data-on={band === b.id ? "true" : undefined}
                  onClick={() => setBand(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </fieldset>
            <label className="ob-field">
              <span>Group reporting currency</span>
              <select
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
              Location economics can remain in local currencies. RADR uses this
              for group reporting.
            </p>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              disabled={orgName.trim().length < 2}
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
            <h1 className="ob-title">Add your first location</h1>
            <p className="ob-hint">
              We use location for currency, timezone, operating context, and
              permissions. You can add the rest after the first Decision.
            </p>
            <label className="ob-field">
              <span>Location name</span>
              <input
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Berlin Mitte"
              />
            </label>
            <label className="ob-field">
              <span>City</span>
              <input
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setLocationCity(e.target.value);
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
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                {ONBOARDING_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="ob-meta">
              Timezone · {countryMeta.timezone} · Local currency · {currency}
            </p>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              disabled={
                pending || locationName.trim().length < 2 || !orgName.trim()
              }
              onClick={createWorkspace}
            >
              {pending ? "Creating…" : "Continue with this location"}
            </button>
          </section>
        ) : null}

        {step === "goal" ? (
          <section className="ob-panel">
            <h1 className="ob-title">Where should RADR look first?</h1>
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
                      data-on={decisionClass === c.id ? "true" : undefined}
                      data-avail={c.availability}
                      disabled={!selectable}
                      onClick={() => selectable && setDecisionClass(c.id)}
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
            <h1 className="ob-title">Connect what you already have</h1>
            <p className="ob-hint">
              RADR needs evidence before it can form Decisions.
            </p>
            <div className="ob-evidence">
              <button
                type="button"
                className="ob-goal"
                data-on={evidenceMethod === "upload" ? "true" : undefined}
                onClick={() => setEvidenceMethod("upload")}
              >
                <strong>Upload files</strong>
                <span>CSV or XLSX — best early path for Recovery Pilot.</span>
              </button>
              <button
                type="button"
                className="ob-goal"
                data-on={evidenceMethod === "demo" ? "true" : undefined}
                onClick={() => setEvidenceMethod("demo")}
              >
                <strong>Explore with demo data</strong>
                <span>Illustrative only. Not mixed with your real data.</span>
              </button>
              <button type="button" className="ob-goal" disabled data-avail="building">
                <strong>Connect a system</strong>
                <span>Available connectors unlock as integrations ship.</span>
                <em>Building</em>
              </button>
            </div>
            <button
              type="button"
              className="ob-btn ob-btn-primary"
              onClick={() => {
                if (evidenceMethod === "demo") {
                  writeWorkspaceBrand({
                    orgName: orgName || workspace?.name || "Demo",
                    locationName:
                      locationName ||
                      workspace?.primaryLocation?.name ||
                      "Berlin Mitte",
                    city: locationCity || undefined,
                    country,
                    currency,
                    timezone: countryMeta.timezone,
                    demo: true,
                  });
                  if (workspace) {
                    void patch({
                      ...withStep(workspace.onboarding, "complete"),
                      evidenceMethod: "demo",
                      demoEnabled: true,
                      step: "done",
                      completedAt: new Date().toISOString(),
                    });
                    trackOnboarding("demo_selected", {}, workspace.organizationId);
                  }
                  router.push("/app?welcome=1&demo=1");
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
            <h1 className="ob-title">Upload Supplier / AP evidence</h1>
            <p className="ob-hint">
              Files are scoped to your organization and used to form RADR
              Decisions. You can review imported records before analysis.
            </p>
            <div className="ob-upload-block">
              <h2 className="ob-sub">Contract data</h2>
              <input
                type="file"
                accept=".csv,.xlsx,text/csv"
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
                accept=".csv,.xlsx,text/csv"
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
            <h1 className="ob-title">RADR has enough evidence to start</h1>
            <ul className="ob-health">
              <li>Contract data · Ready</li>
              <li>Invoice data · Ready</li>
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
            <h1 className="ob-title">Working through your evidence</h1>
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
                <h1 className="ob-title ob-title-money">
                  {money(outcome.amountMinor, outcome.currency)}
                </h1>
                <p className="ob-lead">{outcome.headline}</p>
                <p className="ob-hint">{outcome.rationale}</p>
                <p className="ob-hint">
                  RADR only surfaced this because the variance exceeds your
                  materiality threshold and has sufficient evidence.
                </p>
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  onClick={finish}
                >
                  Review Decision
                </button>
              </>
            ) : null}

            {outcome.kind === "nothing_needs_you" ? (
              <>
                <h1 className="ob-title">Nothing needs your attention</h1>
                <p className="ob-lead">
                  RADR reviewed {outcome.invoiceLines} invoice lines and{" "}
                  {outcome.contracts} active contracts. No material
                  discrepancies above your{" "}
                  {money(outcome.thresholdMinor, outcome.currency)} threshold.
                </p>
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  onClick={finish}
                >
                  Go to Control Center
                </button>
              </>
            ) : null}

            {outcome.kind === "insufficient_evidence" ? (
              <>
                <h1 className="ob-title">RADR found a potential issue</h1>
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
  );
}
