"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RadrLogo } from "@/components/marketing/RadrLogo";
import { SignOutButton } from "@/components/SignOutButton";
import { ONBOARDING_COUNTRIES } from "@/lib/constants";
import { writeWorkspaceBrand } from "@/lib/onboarding/brand";
import { inferFromCity, searchPlaces } from "@/lib/onboarding/places";
import { trackOnboarding } from "@/lib/onboarding/analytics";
import {
  defaultUnitsForProfile,
  firstInsightFor,
  mapHelpToKpis,
  profileIdFromOnboarding,
  recommendedKpis,
} from "@/lib/onboarding/deriveProfile";
import type {
  HelpFocus,
  LocationBand,
  OnboardingRole,
  OnboardingState,
  OperateFamily,
  OperateSubtype,
  OperatingUnitChoice,
  VenueType,
} from "@/lib/onboarding/types";
import {
  canEnterInsightStep,
  DEMO_SYSTEM_ID,
} from "@/lib/onboarding/types";
import { getProfile } from "@/lib/radr/domain/hospitalityOperatingProfile";
import { providersForProfile } from "@/lib/radr/integrations/families";
import { writeDemoVertical } from "@/lib/radr/operating/resolveProfile";

type WorkspaceSnapshot = {
  organizationId: string;
  name: string;
  onboarding: OnboardingState;
  primaryLocation: { id: string; name: string; city: string | null } | null;
} | null;

type Props = {
  userName: string;
  workspace: WorkspaceSnapshot;
  /** Visual walkthrough without API / auth side effects */
  preview?: boolean;
};

const BANDS: { id: LocationBand; label: string }[] = [
  { id: "1", label: "1" },
  { id: "2-5", label: "2-5" },
  { id: "6-20", label: "6-20" },
  { id: "21-50", label: "21-50" },
  { id: "50+", label: "50+" },
];

const FAMILIES: { id: OperateFamily; label: string; hint: string }[] = [
  { id: "food_beverage", label: "Food & beverage", hint: "Restaurants, bars, cafés" },
  { id: "accommodation", label: "Accommodation", hint: "Hotels, apartments, rentals" },
  { id: "experience", label: "Experiences", hint: "Spa, events, clubs" },
  { id: "mixed", label: "Mixed hospitality", hint: "Hotel + F&B + more" },
];

const SUBTYPES: { id: OperateSubtype; family: OperateFamily; label: string }[] = [
  { id: "full_service_restaurant", family: "food_beverage", label: "Full-service restaurant" },
  { id: "fine_dining", family: "food_beverage", label: "Fine dining" },
  { id: "casual_dining", family: "food_beverage", label: "Casual dining" },
  { id: "cafe", family: "food_beverage", label: "Café" },
  { id: "bar", family: "food_beverage", label: "Bar" },
  { id: "boutique_hotel", family: "accommodation", label: "Boutique hotel" },
  { id: "hotel", family: "accommodation", label: "Hotel" },
  { id: "serviced_apartments", family: "accommodation", label: "Serviced apartments" },
  { id: "vacation_rental", family: "accommodation", label: "Vacation rental" },
  { id: "spa", family: "experience", label: "Spa / wellness" },
  { id: "event_venue", family: "experience", label: "Event venue" },
  { id: "resort", family: "mixed", label: "Resort" },
];

const UNIT_OPTIONS: { id: OperatingUnitChoice; label: string }[] = [
  { id: "ROOMS", label: "Rooms" },
  { id: "RESTAURANT", label: "Restaurant" },
  { id: "BAR", label: "Bar" },
  { id: "BREAKFAST", label: "Breakfast" },
  { id: "SPA", label: "Spa" },
  { id: "EVENTS", label: "Events" },
  { id: "HOUSEKEEPING", label: "Housekeeping" },
  { id: "CAFE", label: "Café" },
  { id: "DELIVERY", label: "Delivery" },
];

const ROLES: { id: OnboardingRole; label: string }[] = [
  { id: "owner", label: "Owner / founder" },
  { id: "ceo", label: "CEO" },
  { id: "cfo", label: "CFO" },
  { id: "coo", label: "COO" },
  { id: "gm", label: "General manager" },
  { id: "hotel_gm", label: "Hotel manager" },
  { id: "fb_director", label: "F&B director" },
  { id: "restaurant_manager", label: "Restaurant manager" },
  { id: "chef", label: "Head chef" },
  { id: "revenue_manager", label: "Revenue manager" },
  { id: "housekeeping_manager", label: "Housekeeping manager" },
  { id: "front_desk", label: "Front desk" },
  { id: "finance", label: "Finance" },
  { id: "other", label: "Other" },
];

const HELP: { id: HelpFocus; label: string }[] = [
  { id: "profitability", label: "Improve profitability" },
  { id: "labor_waste", label: "Reduce labor waste" },
  { id: "occupancy", label: "Increase occupancy" },
  { id: "contribution", label: "Increase contribution" },
  { id: "guest_experience", label: "Improve guest experience" },
  { id: "cancellations", label: "Reduce cancellations / no-shows" },
  { id: "recover_inventory", label: "Recover lost inventory" },
  { id: "direct_bookings", label: "Improve direct bookings" },
  { id: "room_readiness", label: "Improve room readiness" },
  { id: "menu_profitability", label: "Improve menu profitability" },
  { id: "forecasting", label: "Improve forecasting" },
  { id: "multi_location", label: "Multi-location consistency" },
];

const KPI_LABELS: Record<string, string> = {
  covers: "Covers",
  contribution: "Contribution",
  labor_pct: "Labor %",
  labor: "Labor",
  cancellation_exposure: "Cancellation exposure",
  verified_value: "Verified Value",
  floor_pressure: "Floor pressure",
  occupancy: "Occupancy",
  adr: "ADR",
  revpar: "RevPAR",
  room_readiness: "Room readiness",
  arrivals: "Arrivals",
  guest_issues: "Guest issues",
  direct_share: "Direct booking share",
  distribution_cost: "Distribution cost",
  revenue: "Revenue",
  food_cost: "Food cost",
  stockouts: "Stockouts",
  allergies: "Allergies",
  departures: "Departures",
  turnaround: "Turnaround",
  pickup: "Pickup",
};

function toggleIn<T extends string>(list: T[], id: T, max?: number): T[] {
  if (list.includes(id)) return list.filter((x) => x !== id);
  if (max != null && list.length >= max) return list;
  return [...list, id];
}

function initialStep(workspace: WorkspaceSnapshot): OnboardingState["step"] {
  if (!workspace) return "welcome";
  const s = workspace.onboarding?.step;
  if (s === "done") return "choose";
  if (s === "building") return "choose";
  if (s === "operation") return "organization";
  if (
    s === "organization" ||
    s === "operate" ||
    s === "location" ||
    s === "units" ||
    s === "role" ||
    s === "priorities" ||
    s === "kpis" ||
    s === "system" ||
    s === "insight" ||
    s === "choose" ||
    s === "connect"
  ) {
    return s;
  }
  return "choose";
}

function venueTypeFromProfile(profileId: string): VenueType {
  if (profileId === "boutique_hotel" || profileId === "hotel") return "hotel";
  if (profileId === "bar") return "bar";
  if (profileId === "spa") return "spa";
  if (profileId === "serviced_apartments") return "serviced_apartments";
  if (profileId === "vacation_rental") return "vacation_rental";
  return "restaurant";
}

export function OnboardingFunnel({ userName, workspace, preview = false }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingState["step"]>(() =>
    initialStep(workspace),
  );
  const [orgName, setOrgName] = useState(
    workspace?.onboarding.organizationName ?? workspace?.name ?? "",
  );
  const [band, setBand] = useState<LocationBand>(
    workspace?.onboarding.locationBand ?? "2-5",
  );
  const [hqCity, setHqCity] = useState(workspace?.onboarding.hqCity ?? "");
  const [cityQuery, setCityQuery] = useState(workspace?.onboarding.hqCity ?? "");
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
  const [country, setCountry] = useState(
    workspace?.onboarding.locationCountry ??
      workspace?.onboarding.hqCountry ??
      "NL",
  );
  const [families, setFamilies] = useState<OperateFamily[]>(
    workspace?.onboarding.operateFamilies ?? ["food_beverage"],
  );
  const [subtypes, setSubtypes] = useState<OperateSubtype[]>(
    workspace?.onboarding.operateSubtypes ?? ["full_service_restaurant"],
  );
  const [units, setUnits] = useState<OperatingUnitChoice[]>(
    workspace?.onboarding.operatingUnits ?? ["RESTAURANT", "BAR"],
  );
  const [roomCount, setRoomCount] = useState(
    workspace?.onboarding.roomCount ?? 28,
  );
  const [role, setRole] = useState<OnboardingRole>(
    workspace?.onboarding.role ?? "gm",
  );
  const [helpFocus, setHelpFocus] = useState<HelpFocus[]>(
    workspace?.onboarding.helpFocus ?? ["profitability", "guest_experience"],
  );
  const [selectedKpis, setSelectedKpis] = useState<string[]>(
    workspace?.onboarding.selectedKpis ?? [],
  );
  const [pendingSystem, setPendingSystem] = useState(
    workspace?.onboarding.pendingSystem ?? "",
  );
  const [buildLines, setBuildLines] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const countryMeta = useMemo(
    () =>
      ONBOARDING_COUNTRIES.find((c) => c.code === country) ??
      ONBOARDING_COUNTRIES[0]!,
    [country],
  );

  const placeSuggestions = useMemo(
    () => searchPlaces(cityQuery, 6),
    [cityQuery],
  );

  const draftState: OnboardingState = useMemo(
    () => ({
      step,
      organizationName: orgName,
      locationBand: band,
      hqCity,
      locationName,
      locationCity,
      locationCountry: country,
      currency: countryMeta.currency,
      timezone: countryMeta.timezone,
      operateFamilies: families,
      operateSubtypes: subtypes,
      operatingUnits: units,
      roomCount,
      role,
      helpFocus,
      selectedKpis,
      pendingSystem: pendingSystem || undefined,
    }),
    [
      step,
      orgName,
      band,
      hqCity,
      locationName,
      locationCity,
      country,
      countryMeta,
      families,
      subtypes,
      units,
      roomCount,
      role,
      helpFocus,
      selectedKpis,
      pendingSystem,
    ],
  );

  const profileId = profileIdFromOnboarding(draftState);
  const profile = getProfile(profileId);
  const insight = firstInsightFor(profileId, locationName || orgName);

  const greeting = useMemo(() => {
    const first = userName.trim().split(/\s+/)[0];
    return first ? `Good to have you here, ${first}.` : "Good to have you here.";
  }, [userName]);

  const visibleSubtypes = SUBTYPES.filter(
    (s) => families.includes(s.family) || families.includes("mixed"),
  );

  const systemProviders = providersForProfile(
    profileId,
    profile?.integrationFamilies,
  );

  function applyPlace(city: string) {
    setHqCity(city);
    setCityQuery(city);
    setLocationCity((prev) => prev || city);
    const inferred = inferFromCity(city);
    if (inferred) setCountry(inferred.countryCode);
  }

  async function patchState(body: Record<string, unknown>) {
    if (preview || !workspace) return;
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  function syncUnitsForProfile(nextProfileId: string) {
    setUnits(defaultUnitsForProfile(nextProfileId as never));
  }

  async function buildWorkspace() {
    if (!canEnterInsightStep(pendingSystem)) {
      setError("Connect a system — or choose DEMO data — before the first insight.");
      return;
    }
    setError(null);
    setStep("building");
    setBuildLines([]);
    const lines = [
      "Workspace created",
      `${locationName.trim() || "First location"} added`,
      `Operating model: ${profile?.label ?? "Hospitality"}`,
      `Currency set to ${countryMeta.currency}`,
    ];
    for (let i = 0; i < lines.length; i++) {
      await new Promise((r) => setTimeout(r, 160));
      setBuildLines(lines.slice(0, i + 1));
    }

    const venueType = venueTypeFromProfile(profileId);
    const payload = {
      organizationName: orgName.trim(),
      locationName: locationName.trim(),
      country,
      currency: countryMeta.currency,
      timezone: countryMeta.timezone,
      locationBand: band,
      hqCity: hqCity.trim() || undefined,
      locationCity: (locationCity || hqCity).trim() || undefined,
      venueType,
      operateFamilies: families,
      operateSubtypes: subtypes,
      operatingUnits: units,
      roomCount: units.includes("ROOMS") ? roomCount : undefined,
      role,
      helpFocus,
      selectedKpis:
        selectedKpis.length > 0
          ? selectedKpis
          : recommendedKpis(profileId, role),
      operatingProfileId: profileId,
      pendingSystem: pendingSystem || undefined,
      pendingSystemLabel:
        pendingSystem === DEMO_SYSTEM_ID
          ? "DEMO data"
          : systemProviders.find((p) => p.id === pendingSystem)?.label,
    };

    if (workspace || preview) {
      await patchState({
        ...payload,
        step: "insight",
      });
      setBuildLines([...lines, "READY"]);
      await new Promise((r) => setTimeout(r, 200));
      setStep("insight");
      return;
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(data?.error ?? "Could not create workspace");
      setStep("system");
      return;
    }

    setBuildLines([...lines, "READY"]);
    await new Promise((r) => setTimeout(r, 200));
    setStep("insight");
    router.refresh();
  }

  function enterDemo() {
    startTransition(async () => {
      const isHotel =
        profileId === "boutique_hotel" ||
        profileId === "hotel" ||
        profileId === "resort_mixed";
      const isResidences =
        profileId === "serviced_apartments" ||
        profileId === "vacation_rental";
      const vertical = isHotel
        ? "boutique_hotel"
        : isResidences
          ? "serviced_apartments"
          : "restaurant";
      writeDemoVertical(vertical);
      writeWorkspaceBrand({
        orgName: orgName.trim() || workspace?.name || "Your group",
        locationName:
          locationName.trim() ||
          workspace?.primaryLocation?.name ||
          (isHotel
            ? "Canal House Amsterdam"
            : isResidences
              ? "Lisbon Residences"
              : "First location"),
        city: locationCity || hqCity,
        country: countryMeta.name,
        currency: countryMeta.currency,
        timezone: countryMeta.timezone,
        demo: true,
        operatingProfileId: profileId,
      });
      await patchState({
        step: "done",
        demoEnabled: true,
        operatingProfileId: profileId,
        completedAt: new Date().toISOString(),
      });
      trackOnboarding("demo_selected");
      trackOnboarding("control_center_viewed");
      if (preview) return;
      const qs =
        vertical === "restaurant"
          ? "/app?welcome=1"
          : `/app?welcome=1&vertical=${vertical}`;
      router.push(qs);
      router.refresh();
    });
  }

  function enterConnect() {
    startTransition(async () => {
      await patchState({
        step: "connect",
        operatingProfileId: profileId,
        pendingSystem: pendingSystem || undefined,
      });
      router.push("/onboarding/connect");
      router.refresh();
    });
  }

  return (
    <div className="ob-root">
      <header className="ob-chrome">
        <RadrLogo size="md" variant="plain" surface="light" as="p" />
        <SignOutButton />
      </header>

      <main className="ob-main">
        {step === "welcome" ? (
          <section className="ob-panel" aria-labelledby="ob-welcome-title">
            <p className="ob-kicker">RADR</p>
            <h1 id="ob-welcome-title" className="ob-display">
              {greeting}
            </h1>
            <p className="ob-lead">Let&apos;s understand your operation.</p>
            <p className="ob-copy">
              RADR is the decision layer for hospitality. First we
              learn how your business works — then the product configures itself.
            </p>
            <p className="ob-meta">About two minutes.</p>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                onClick={() => {
                  trackOnboarding("onboarding_started");
                  setStep("organization");
                }}
              >
                Start <span aria-hidden="true">→</span>
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => {
                  writeDemoVertical("restaurant");
                  writeWorkspaceBrand({
                    orgName: "Northstar Hospitality Group",
                    locationName: "Berlin Mitte",
                    demo: true,
                    operatingProfileId: "restaurant_full_service",
                  });
                  trackOnboarding("demo_selected", { path: "skip" });
                  router.push("/app?welcome=1");
                }}
              >
                Explore restaurant demo
              </button>
            </div>
          </section>
        ) : null}

        {step === "organization" ? (
          <section className="ob-panel" aria-labelledby="ob-org-title">
            <p className="ob-step">1 · Organization</p>
            <h1 id="ob-org-title" className="ob-title">
              Who are you?
            </h1>
            <label className="ob-label" htmlFor="orgName">
              Organization name
            </label>
            <input
              id="orgName"
              className="ob-input"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Northstar Hospitality Group"
              autoComplete="organization"
              minLength={2}
              maxLength={120}
            />
            <p className="ob-label">How many locations?</p>
            <div className="ob-chips" role="group" aria-label="Location count">
              {BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  className="ob-chip"
                  data-active={band === b.id ? "true" : "false"}
                  onClick={() => setBand(b.id)}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <label className="ob-label" htmlFor="hqCity">
              Main city <span className="ob-optional">Optional</span>
            </label>
            <input
              id="hqCity"
              className="ob-input"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                setHqCity(e.target.value);
              }}
              placeholder="Amsterdam"
              list="ob-cities"
            />
            <datalist id="ob-cities">
              {placeSuggestions.map((p) => (
                <option key={p.city} value={p.city} />
              ))}
            </datalist>
            {cityQuery ? (
              <ul className="ob-suggest">
                {placeSuggestions.map((p) => (
                  <li key={p.city}>
                    <button type="button" onClick={() => applyPlace(p.city)}>
                      {p.city}
                      <span>
                        {p.countryName} · {p.currency}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="ob-grid-2">
              <div>
                <label className="ob-label" htmlFor="locCountry">
                  Country
                </label>
                <select
                  id="locCountry"
                  className="ob-input"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {ONBOARDING_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="ob-label">Currency · timezone</p>
                <p className="ob-inferred">
                  {countryMeta.currency} · {countryMeta.timezone}
                </p>
              </div>
            </div>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={orgName.trim().length < 2}
                onClick={() => setStep("operate")}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "operate" ? (
          <section className="ob-panel" aria-labelledby="ob-op-title">
            <p className="ob-step">2 · Business type</p>
            <h1 id="ob-op-title" className="ob-title">
              Do not force one category.
            </h1>
            <p className="ob-copy">Select every family that applies — including mixed hospitality.</p>
            <div className="ob-chips" role="group" aria-label="Operating families">
              {FAMILIES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className="ob-chip"
                  data-active={families.includes(f.id) ? "true" : "false"}
                  onClick={() => setFamilies((prev) => toggleIn(prev, f.id))}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <p className="ob-label">More specifically</p>
            <div className="ob-chips" role="group" aria-label="Subtypes">
              {visibleSubtypes.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="ob-chip"
                  data-active={subtypes.includes(s.id) ? "true" : "false"}
                  onClick={() => {
                    const next = toggleIn(subtypes, s.id);
                    setSubtypes(next.length ? next : [s.id]);
                    const pid = profileIdFromOnboarding({
                      ...draftState,
                      operateSubtypes: next.length ? next : [s.id],
                    });
                    syncUnitsForProfile(pid);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("organization")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={families.length < 1 || subtypes.length < 1}
                onClick={() => {
                  if (!locationName) setLocationName(`${orgName.trim()} · Main`);
                  if (!locationCity && hqCity) setLocationCity(hqCity);
                  setStep("location");
                }}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "location" ? (
          <section className="ob-panel" aria-labelledby="ob-loc-title">
            <p className="ob-step">3 · Location</p>
            <h1 id="ob-loc-title" className="ob-title">
              First location
            </h1>
            <label className="ob-label" htmlFor="locName">
              Location name
            </label>
            <input
              id="locName"
              className="ob-input"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Canal House Amsterdam"
            />
            <label className="ob-label" htmlFor="locCity">
              City
            </label>
            <input
              id="locCity"
              className="ob-input"
              value={locationCity || cityQuery}
              onChange={(e) => {
                setLocationCity(e.target.value);
                setCityQuery(e.target.value);
                setHqCity(e.target.value);
              }}
              placeholder="Amsterdam"
              list="ob-cities-loc"
            />
            <datalist id="ob-cities-loc">
              {placeSuggestions.map((p) => (
                <option key={p.city} value={p.city} />
              ))}
            </datalist>
            <label className="ob-label" htmlFor="locCountry2">
              Country
            </label>
            <select
              id="locCountry2"
              className="ob-input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {ONBOARDING_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="ob-inferred">
              {countryMeta.currency} · {countryMeta.timezone}
            </p>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("operate")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={locationName.trim().length < 2}
                onClick={() => setStep("units")}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "units" ? (
          <section className="ob-panel" aria-labelledby="ob-units-title">
            <p className="ob-step">4 · Operating units</p>
            <h1 id="ob-units-title" className="ob-title">
              What runs inside this location?
            </h1>
            <p className="ob-copy">
              A hotel can include rooms, restaurant, bar, and spa under one RADR.
            </p>
            <div className="ob-chips" role="group" aria-label="Operating units">
              {UNIT_OPTIONS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  className="ob-chip"
                  data-active={units.includes(u.id) ? "true" : "false"}
                  onClick={() => setUnits((prev) => toggleIn(prev, u.id))}
                >
                  {u.label}
                </button>
              ))}
            </div>
            {units.includes("ROOMS") ? (
              <>
                <label className="ob-label" htmlFor="roomCount">
                  How many rooms?
                </label>
                <input
                  id="roomCount"
                  className="ob-input"
                  type="number"
                  min={1}
                  max={5000}
                  value={roomCount}
                  onChange={(e) => setRoomCount(Number(e.target.value) || 1)}
                />
              </>
            ) : null}
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("location")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={units.length < 1}
                onClick={() => setStep("role")}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "role" ? (
          <section className="ob-panel" aria-labelledby="ob-role-title">
            <p className="ob-step">5 · Role</p>
            <h1 id="ob-role-title" className="ob-title">
              What is your role?
            </h1>
            <div className="ob-chips" role="radiogroup" aria-label="Role">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  className="ob-chip"
                  data-active={role === r.id ? "true" : "false"}
                  onClick={() => {
                    setRole(r.id);
                    setSelectedKpis(recommendedKpis(profileId, r.id));
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("units")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                onClick={() => setStep("priorities")}
              >
                Continue <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "priorities" ? (
          <section className="ob-panel" aria-labelledby="ob-pri-title">
            <p className="ob-step">6 · What matters most</p>
            <h1 id="ob-pri-title" className="ob-title">
              Where should RADR focus first?
            </h1>
            <p className="ob-copy">Pick up to 5. KPIs soft-default from your profile — customize later.</p>
            <div className="ob-chips" role="group" aria-label="Help focus">
              {HELP.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className="ob-chip"
                  data-active={helpFocus.includes(h.id) ? "true" : "false"}
                  onClick={() =>
                    setHelpFocus((prev) => toggleIn(prev, h.id, 5))
                  }
                >
                  {h.label}
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("role")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => {
                  const merged = [
                    ...recommendedKpis(profileId, role),
                    ...mapHelpToKpis(helpFocus),
                  ];
                  setSelectedKpis([...new Set(merged)].slice(0, 8));
                  setStep("kpis");
                }}
              >
                Customize KPIs
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                onClick={() => {
                  const merged = [
                    ...recommendedKpis(profileId, role),
                    ...mapHelpToKpis(helpFocus),
                  ];
                  setSelectedKpis([...new Set(merged)].slice(0, 8));
                  setStep("system");
                }}
              >
                Looks good <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "kpis" ? (
          <section className="ob-panel" aria-labelledby="ob-kpi-title">
            <p className="ob-step">6b · What RADR watches</p>
            <h1 id="ob-kpi-title" className="ob-title">
              RADR recommends watching
            </h1>
            <p className="ob-copy">
              Based on {profile?.label ?? "your operation"} · {ROLES.find((r) => r.id === role)?.label}.
              Soft defaults — enrich later in setup.
            </p>
            <div className="ob-chips" role="group" aria-label="KPIs">
              {(profile?.defaultKpis ?? selectedKpis).map((k) => (
                <button
                  key={k}
                  type="button"
                  className="ob-chip"
                  data-active={selectedKpis.includes(k) ? "true" : "false"}
                  onClick={() => setSelectedKpis((prev) => toggleIn(prev, k))}
                >
                  {KPI_LABELS[k] ?? k}
                </button>
              ))}
            </div>
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("priorities")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={selectedKpis.length < 1}
                onClick={() => setStep("system")}
              >
                Looks good <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "system" ? (
          <section className="ob-panel" aria-labelledby="ob-sys-title">
            <p className="ob-step">7 · Connect a system</p>
            <h1 id="ob-sys-title" className="ob-title">
              Connect before the first insight
            </h1>
            <p className="ob-copy">
              Pick one primary system for {profile?.label ?? "your venue"}. Soft
              request only — no live credentials yet. DEMO data also counts as a
              connection so the first insight can open.
            </p>
            <div className="ob-chips" role="radiogroup" aria-label="Systems">
              {systemProviders.slice(0, 8).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="ob-chip"
                  data-active={pendingSystem === p.id ? "true" : "false"}
                  onClick={() => setPendingSystem(p.id)}
                >
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                className="ob-chip"
                data-active={pendingSystem === DEMO_SYSTEM_ID ? "true" : "false"}
                onClick={() => setPendingSystem(DEMO_SYSTEM_ID)}
              >
                Use DEMO data
              </button>
            </div>
            {error ? (
              <p className="ob-error" role="alert">
                {error}
              </p>
            ) : null}
            <div className="ob-actions">
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => setStep("priorities")}
              >
                Back
              </button>
              <button
                type="button"
                className="ob-btn ob-btn-primary"
                disabled={pending || !canEnterInsightStep(pendingSystem)}
                onClick={() => void buildWorkspace()}
              >
                Build my RADR <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        ) : null}

        {step === "building" ? (
          <section className="ob-panel ob-panel-build" aria-live="polite">
            <p className="ob-kicker">RADR</p>
            <h1 className="ob-title">Configuring your operating model.</h1>
            <ul className="ob-build-list">
              {buildLines.map((line) => (
                <li key={line} data-ready={line === "READY" ? "true" : "false"}>
                  {line === "READY" ? null : (
                    <span className="ob-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  <strong>{line}</strong>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {step === "insight" ? (
          <section className="ob-panel" aria-labelledby="ob-insight-title">
            <p className="ob-step">8 · First insight</p>
            <p className="ob-kicker">After connect</p>
            <h1 id="ob-insight-title" className="ob-display">
              RADR is ready.
            </h1>
            <p className="ob-lead">{insight}</p>
            <p className="ob-meta">
              {profile?.support === "live"
                ? "Restaurant / F&B intelligence is production-ready."
                : "Hotel and other models open in DEMO preview until systems are connected."}
            </p>
            <div className="ob-choice-grid">
              <article className="ob-choice" data-emphasis="true">
                <p className="ob-choice-kicker">Open Control Center</p>
                <h2>See your operating model with demo data.</h2>
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  disabled={pending}
                  onClick={enterDemo}
                >
                  Open Control Center <span aria-hidden="true">→</span>
                </button>
              </article>
              <article className="ob-choice">
                <p className="ob-choice-kicker">Connect</p>
                <h2>Continue with system setup.</h2>
                <button
                  type="button"
                  className="ob-btn ob-btn-secondary"
                  disabled={pending}
                  onClick={enterConnect}
                >
                  Choose a system <span aria-hidden="true">→</span>
                </button>
              </article>
            </div>
          </section>
        ) : null}

        {step === "choose" ? (
          <section className="ob-panel" aria-labelledby="ob-ready-title">
            <p className="ob-kicker">Ready</p>
            <h1 id="ob-ready-title" className="ob-display">
              Your RADR is ready.
            </h1>
            <p className="ob-lead">
              Explore with demo data or connect your operation.
            </p>
            <div className="ob-choice-grid">
              <article className="ob-choice" data-emphasis="true">
                <p className="ob-choice-kicker">Explore first</p>
                <h2>See RADR working with realistic hospitality data.</h2>
                <button
                  type="button"
                  className="ob-btn ob-btn-primary"
                  disabled={pending}
                  onClick={enterDemo}
                >
                  Explore demo <span aria-hidden="true">→</span>
                </button>
              </article>
              <article className="ob-choice">
                <p className="ob-choice-kicker">Connect one system</p>
                <h2>Start with the tool you already use every day.</h2>
                <button
                  type="button"
                  className="ob-btn ob-btn-secondary"
                  disabled={pending}
                  onClick={enterConnect}
                >
                  Choose a system <span aria-hidden="true">→</span>
                </button>
              </article>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
