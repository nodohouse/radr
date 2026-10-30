"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDemoOrg } from "@/components/product/useDemoOrg";
import { useProduct } from "@/lib/product/store";
import type { RoleView } from "@/lib/product/types";
import type { LocationScope } from "@/lib/product/demo/dashboard";
import { writeDemoOrgSession } from "@/lib/radr/demo/demoOrgSession";
import {
  demoOrgForVertical,
  primaryLocationId,
} from "@/lib/radr/demo/organizations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  mapRoleAcrossVertical,
  roleContextFor,
} from "@/lib/radr/product/personas";
import { controlCenterLensFor } from "@/lib/radr/product/controlCenterLens";
import {
  DEFAULT_DEMO_SETTINGS,
  DEMO_SETTINGS_KEY,
  DEMO_USERS_HOTEL,
  DEMO_USERS_RESTAURANT,
  readDemoSettings,
  writeDemoSettings,
  type DemoSettingsState,
} from "@/lib/radr/product/demoSettings";
import {
  buildSettingsHref,
  parseSettingsSection,
  type SettingsSectionId,
} from "@/lib/radr/product/settingsProofEngine";
import { SettingsNav } from "./SettingsNav";
import { SettingsSummaryCards } from "./SettingsSummaryCards";
import { SettingsOrganization } from "./SettingsOrganization";
import { SettingsLocations } from "./SettingsLocations";
import { SettingsContextPanel } from "./SettingsContext";
import { SettingsForecasting } from "./SettingsForecasting";
import { SettingsWorkforce } from "./SettingsWorkforce";
import { SettingsAccess } from "./SettingsAccess";
import { SettingsPolicies } from "./SettingsPolicies";
import { SettingsAutonomy } from "./SettingsAutonomy";
import { SettingsAttention } from "./SettingsAttention";
import { SettingsNotifications } from "./SettingsNotifications";
import { SettingsIntegrations } from "./SettingsIntegrations";
import { SettingsAudit } from "./SettingsAudit";
import { SettingsDemoControls } from "./SettingsDemoControls";
import "./settings-engine.css";

function applyIndustry(
  vertical: DemoVerticalFamily,
  fromVertical: DemoVerticalFamily,
  currentRole: RoleView,
  setLocationScope: (id: LocationScope) => void,
  setRoleView: (role: RoleView) => void,
  setDefaultLocationId: (id: string) => void,
  setPeriod: (p: "today" | "yesterday" | "wtd" | "mtd" | "ytd") => void,
) {
  const org = demoOrgForVertical(vertical);
  const loc = primaryLocationId(org) as LocationScope;
  const nextRole = mapRoleAcrossVertical(currentRole, fromVertical, vertical);
  const ctx = roleContextFor(nextRole, vertical);
  const lens = controlCenterLensFor(nextRole, vertical);
  setDefaultLocationId(loc);
  setRoleView(nextRole);
  setLocationScope(
    ctx.defaultLocationId === "all"
      ? "all"
      : (ctx.defaultLocationId as LocationScope),
  );
  setPeriod(lens.periodDefault);
}

export function SettingsShell() {
  const pathname = usePathname() || "/app/settings";
  const searchParams = useSearchParams();
  const { session, org } = useDemoOrg();
  const {
    roleView,
    setRoleView,
    setLocationScope,
    setDefaultLocationId,
    setPeriod,
  } = useProduct();

  const [section, setSection] = useState<SettingsSectionId>(() =>
    parseSettingsSection(searchParams.get("section")),
  );
  const [focusPolicy, setFocusPolicy] = useState<string | null>(
    () => searchParams.get("policy"),
  );
  const [navQuery, setNavQuery] = useState("");
  const [demo, setDemo] = useState<DemoSettingsState>(DEFAULT_DEMO_SETTINGS);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );
  const writtenQueryRef = useRef<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const saved = readDemoSettings();
    // Demo-world switches use the canonical organization, while custom names survive.
    const defaultName = ["Northstar Restaurants", "Northstar Hotels"].includes(saved.orgName);
    let hasSavedPreferences = true;
    try { hasSavedPreferences = Boolean(localStorage.getItem(DEMO_SETTINGS_KEY)); } catch { /* preserve defaults when storage is unavailable */ }
    const home = org.locations.find(location => location.id === primaryLocationId(org)) ?? org.locations[0];
    setDemo({
      ...saved,
      ...(!hasSavedPreferences ? { currency: home?.currency ?? "USD", timezone: home?.timezone ?? "America/New_York" } : {}),
      ...(defaultName ? { orgName: org.name, operatingModel: session.vertical === "hotel" ? "hotel_model" : "restaurant_model" } : {}),
      ...(defaultName && saved.orgName !== org.name ? { users: session.vertical === "hotel" ? DEMO_USERS_HOTEL : DEMO_USERS_RESTAURANT } : {}),
    });
  }, [session.vertical, org]);

  const select = useCallback(
    (id: SettingsSectionId, policy?: string | null) => {
      setSection(id);
      const nextPolicy = id === "policies" ? policy ?? null : null;
      setFocusPolicy(nextPolicy);
      const href = buildSettingsHref(pathname, id, {
        policy: nextPolicy,
        stay: searchParams.get("stay"),
      });
      writtenQueryRef.current = href.includes("?")
        ? href.slice(href.indexOf("?") + 1)
        : "";
      window.history.replaceState(window.history.state, "", href);
    },
    [pathname, searchParams],
  );

  useEffect(() => {
    if (writtenQueryRef.current != null) {
      const written = new URLSearchParams(writtenQueryRef.current);
      const nowSection = searchParams.get("section");
      if (written.get("section") === nowSection) {
        writtenQueryRef.current = null;
        return;
      }
      if (written.get("section") && written.get("section") !== nowSection) {
        return;
      }
    }
    setSection(parseSettingsSection(searchParams.get("section")));
    setFocusPolicy(searchParams.get("policy"));
  }, [searchParams]);

  const persist = useCallback((next: DemoSettingsState) => {
    setDemo(next);
    setSaveStatus("unsaved");
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      setSaveStatus("saving");
      writeDemoSettings(next);
      setSaveStatus("saved");
    }, 500);
  }, []);

  const onPatch = useCallback(
    (partial: Partial<DemoSettingsState>) => {
      persist({ ...demo, ...partial });
    },
    [demo, persist],
  );

  const onIndustry = useCallback(
    (vertical: DemoVerticalFamily) => {
      if (session.vertical === vertical) return;
      const from = session.vertical;
      writeDemoOrgSession(vertical);
      applyIndustry(
        vertical,
        from,
        roleView,
        setLocationScope,
        setRoleView,
        setDefaultLocationId,
        setPeriod,
      );
      const nextName =
        vertical === "hotel" ? "Northstar Hotels" : "Northstar Restaurants";
      const nextModel =
        vertical === "hotel" ? "hotel_model" : "restaurant_model";
      const current = readDemoSettings();
      persist({
        ...current,
        orgName: nextName,
        operatingModel: nextModel,
        users:
          vertical === "hotel" ? DEMO_USERS_HOTEL : DEMO_USERS_RESTAURANT,
      });
    },
    [
      session.vertical,
      roleView,
      setLocationScope,
      setRoleView,
      setDefaultLocationId,
      setPeriod,
      persist,
    ],
  );

  const industryLabel = session.vertical === "hotel" ? "Hotels" : "Restaurants";
  const isHotel = session.vertical === "hotel";

  const saveLabel = useMemo(() => {
    if (saveStatus === "saving") return "Saving…";
    if (saveStatus === "unsaved") return "Unsaved changes";
    return "Saved";
  }, [saveStatus]);

  const body = (() => {
    switch (section) {
      case "organization":
        return (
          <SettingsOrganization
            demo={demo}
            vertical={session.vertical}
            onPatch={onPatch}
            onIndustry={onIndustry}
          />
        );
      case "locations":
        return <SettingsLocations org={org} demo={demo} onPatch={onPatch} />;
      case "context":
        return <SettingsContextPanel demo={demo} onPatch={onPatch} />;
      case "forecasting":
        return <SettingsForecasting demo={demo} onPatch={onPatch} />;
      case "workforce":
        return <SettingsWorkforce isHotel={isHotel} />;
      case "access":
        return (
          <SettingsAccess
            vertical={session.vertical}
            demo={demo}
            onPatch={onPatch}
          />
        );
      case "policies":
        return (
          <SettingsPolicies
            demo={demo}
            focusPolicy={focusPolicy}
            onPatch={onPatch}
            isHotel={isHotel}
          />
        );
      case "autonomy":
        return (
          <SettingsAutonomy
            demo={demo}
            onPatch={onPatch}
            isHotel={isHotel}
          />
        );
      case "attention":
        return <SettingsAttention demo={demo} onPatch={onPatch} />;
      case "notifications":
        return <SettingsNotifications demo={demo} onPatch={onPatch} />;
      case "integrations":
        return <SettingsIntegrations />;
      case "audit":
        return <SettingsAudit />;
      default:
        return null;
    }
  })();

  return (
    <div className="se-root" data-settings-engine="true">
      <SettingsNav
        section={section}
        query={navQuery}
        onQuery={setNavQuery}
        onSelect={(id) => select(id)}
      />

      <div className="se-main">
        <header className="se-head">
          <div className="se-head-row">
            <div>
              <h1>Settings</h1>
              <p>How RADR is governed</p>
            </div>
            <span className="se-save" data-status={saveStatus} role="status">
              {saveLabel}
            </span>
          </div>
        </header>

        <SettingsSummaryCards
          demo={demo}
          orgName={demo.orgName}
          industryLabel={industryLabel}
          onSelect={(id) => select(id)}
        />

        {body}

        <SettingsDemoControls
          vertical={session.vertical}
          roleView={roleView}
          onPersona={(role) => setRoleView(role)}
          onReset={() => {
            const home = org.locations.find(location => location.id === primaryLocationId(org)) ?? org.locations[0];
            const reset = { ...DEFAULT_DEMO_SETTINGS, orgName: org.name, operatingModel: session.vertical === "hotel" ? "hotel_model" : "restaurant_model", users: session.vertical === "hotel" ? DEMO_USERS_HOTEL : DEMO_USERS_RESTAURANT, currency: home?.currency ?? "USD", timezone: home?.timezone ?? "America/New_York" };
            writeDemoSettings(reset);
            setDemo(reset);
            setRoleView("cfo");
            setLocationScope("all");
            setPeriod("mtd");
            setSaveStatus("saved");
          }}
        />
      </div>
    </div>
  );
}
