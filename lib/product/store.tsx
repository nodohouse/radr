"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CONTROLS, SIGNALS } from "./demo/catalog";
import type {
  DashPeriod,
  LocationScope,
} from "./demo/dashboard";
import type { Control, RoleView, Signal, SignalStatus } from "./types";
import { migrateRoleView } from "./types";
import {
  REGION_LOCATION_IDS,
  deriveLocationMode,
  type LocationMode,
} from "@/lib/radr/locationCatalog";
import {
  DEFAULT_CANVAS,
  isOperatingLens,
  isOperatingServiceTime,
  type OperatingLens,
  type OperatingServiceTime,
  type TimeFormatPref,
} from "@/lib/radr/operatingCanvas";
import { locationDisplayName } from "@/lib/radr/product/demoOrg";
import { defaultScopeForRole } from "@/lib/radr/role/profiles";
import {
  DEMO_ORG_EVENT,
  type DemoOrgSession,
  activeDemoOrg,
} from "@/lib/radr/demo/demoOrgSession";
import { demoOrgForVertical, primaryLocationId } from "@/lib/radr/demo/organizations";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import {
  toCanonicalLocationId,
  toCatalogLocationId,
} from "@/lib/radr/product/locationIds";

type ResolveOption =
  | "Supplier corrected price"
  | "Credit issued"
  | "Issue rejected"
  | "Expected value updated"
  | "Other";

type ProductState = {
  signals: Signal[];
  controls: Control[];
  roleView: RoleView;
  onboardingDone: boolean;
  comments: Record<string, string[]>;
  locationScope: LocationScope;
  period: DashPeriod;
  /** Operating canvas: decision lens (not territory). */
  lens: OperatingLens;
  /** Operating canvas: service-time scrubber. */
  serviceTime: OperatingServiceTime;
  /** Clock display: 12h (AM/PM) or 24h. */
  timeFormat: TimeFormatPref;
  /** Operating canvas: selected finding for Trace / Ask. */
  selectedFindingId: string | null;
  /** Saved home / default location preference */
  defaultLocationId: string;
  comparisonLocationIds: string[];
  locationMode: LocationMode;
  locationSwitcherOpen: boolean;
  setLocationScope: (v: LocationScope) => void;
  setPeriod: (v: DashPeriod) => void;
  setLens: (v: OperatingLens) => void;
  setServiceTime: (v: OperatingServiceTime) => void;
  setTimeFormat: (v: TimeFormatPref) => void;
  setSelectedFindingId: (id: string | null) => void;
  setDefaultLocationId: (id: string) => void;
  toggleComparisonLocation: (id: string) => void;
  clearComparison: () => void;
  setComparisonLocationIds: (ids: string[]) => void;
  openLocationSwitcher: () => void;
  closeLocationSwitcher: () => void;
  updateSignalStatus: (id: string, status: SignalStatus) => void;
  resolveSignal: (id: string, how: ResolveOption, note?: string) => void;
  createControlFromSignal: (id: string, scope: "supplier" | "all") => void;
  addComment: (signalId: string, body: string) => void;
  setRoleView: (v: RoleView) => void;
  completeOnboarding: () => void;
  scopedSignals: Signal[];
  /** True after session/prefs restored — never trust persona/scope before this. */
  contextReady: boolean;
};

const ProductContext = createContext<ProductState | null>(null);

const SCOPE_KEY = "radr.scope.v1";
const PREFS_KEY = "radr.prefs.v1";

function cloneSignals(): Signal[] {
  return structuredClone(SIGNALS);
}

function cloneControls(): Control[] {
  return structuredClone(CONTROLS);
}

function readPersisted(): {
  locationScope: LocationScope;
  period: DashPeriod;
  lens: OperatingLens;
  serviceTime: OperatingServiceTime;
  selectedFindingId: string | null;
  hasSession: boolean;
} {
  const fallback = {
    locationScope: "loc_ber" as LocationScope,
    period: "today" as DashPeriod,
    lens: DEFAULT_CANVAS.lens,
    serviceTime: DEFAULT_CANVAS.serviceTime,
    selectedFindingId: null as string | null,
    hasSession: false,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(SCOPE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as {
      locationScope?: LocationScope;
      period?: DashPeriod;
      lens?: string;
      serviceTime?: string;
      selectedFindingId?: string | null;
    };
    const valid: DashPeriod[] = ["today", "yesterday", "wtd", "mtd", "ytd"];
    const period =
      parsed.period && valid.includes(parsed.period)
        ? parsed.period
        : "today";
    return {
      locationScope: parsed.locationScope ?? "loc_ber",
      period,
      lens: isOperatingLens(parsed.lens) ? parsed.lens : DEFAULT_CANVAS.lens,
      serviceTime: isOperatingServiceTime(parsed.serviceTime)
        ? parsed.serviceTime
        : DEFAULT_CANVAS.serviceTime,
      selectedFindingId:
        typeof parsed.selectedFindingId === "string"
          ? parsed.selectedFindingId
          : null,
      hasSession: true,
    };
  } catch {
    return fallback;
  }
}

function readPrefs(): {
  defaultLocationId: string;
  roleView: RoleView;
  timeFormat: TimeFormatPref;
} {
  if (typeof window === "undefined") {
    return { defaultLocationId: "loc_ber", roleView: "gm", timeFormat: "12h" };
  }
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { defaultLocationId: "loc_ber", roleView: "gm", timeFormat: "12h" };
    }
    const parsed = JSON.parse(raw) as {
      defaultLocationId?: string;
      roleView?: unknown;
      timeFormat?: TimeFormatPref;
    };
    return {
      defaultLocationId: parsed.defaultLocationId ?? "loc_ber",
      roleView: migrateRoleView(parsed.roleView),
      timeFormat: parsed.timeFormat === "24h" ? "24h" : "12h",
    };
  } catch {
    return { defaultLocationId: "all", roleView: "cfo", timeFormat: "12h" };
  }
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [signals, setSignals] = useState<Signal[]>(cloneSignals);
  const [controls, setControls] = useState<Control[]>(cloneControls);
  const [roleView, setRoleViewState] = useState<RoleView>("gm");
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [locationScope, setLocationScopeState] =
    useState<LocationScope>("loc_berlin_mitte");
  const [period, setPeriodState] = useState<DashPeriod>("today");
  const [lens, setLensState] = useState<OperatingLens>(DEFAULT_CANVAS.lens);
  const [serviceTime, setServiceTimeState] = useState<OperatingServiceTime>(
    DEFAULT_CANVAS.serviceTime,
  );
  const [timeFormat, setTimeFormatState] = useState<TimeFormatPref>("12h");
  const [selectedFindingId, setSelectedFindingIdState] = useState<
    string | null
  >(null);
  const [defaultLocationId, setDefaultLocationIdState] =
    useState("loc_ber");
  const [comparisonLocationIds, setComparisonLocationIds] = useState<
    string[]
  >([]);
  const [locationSwitcherOpen, setLocationSwitcherOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore before paint so persona/scope never flash as GM·Berlin defaults.
  useLayoutEffect(() => {
    const prefs = readPrefs();
    const session = readPersisted();
    const org = activeDemoOrg();
    const primary = primaryLocationId(org) as LocationScope;
    const orgLocIds = new Set(org.locations.map((l) => l.id));
    for (const id of [...orgLocIds]) {
      orgLocIds.add(toCatalogLocationId(id));
      orgLocIds.add(toCanonicalLocationId(id));
    }

    let role = prefs.roleView;
    let home = prefs.defaultLocationId;
    let scope = session.hasSession
      ? session.locationScope
      : defaultScopeForRole(role, home);

    // ?stay=1 pins home for first-enter demos only — never wipe an existing session.
    const stayPin =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("stay") === "1";
    if (stayPin && !session.hasSession) {
      home = primary;
      scope = defaultScopeForRole(role, primary);
    } else if (stayPin) {
      home = prefs.defaultLocationId === "all" ? primary : home;
    }

    const vertical = org.vertical;
    if (vertical === "hotel") {
      if (role === "gm" || role === "head_chef" || role === "kitchen") {
        role = "hotel_gm";
      }
      if (home !== "all" && !orgLocIds.has(home)) home = primary;
      if (
        scope !== "all" &&
        !String(scope).startsWith("region_") &&
        !orgLocIds.has(scope)
      ) {
        scope = primary;
      }
    } else {
      if (
        role === "hotel_gm" ||
        role === "housekeeping_manager" ||
        role === "revenue_manager"
      ) {
        role = "gm";
      }
      // Hard reject hotel property ids under restaurant vertical (P0).
      const hotelIds = new Set(["loc_canal_house", "loc_ams_canal"]);
      if (hotelIds.has(String(home))) home = primary;
      if (hotelIds.has(String(scope))) {
        scope = defaultScopeForRole(role, home);
      }
      if (home !== "all" && !orgLocIds.has(home)) home = primary;
      if (
        scope !== "all" &&
        !String(scope).startsWith("region_") &&
        !orgLocIds.has(scope)
      ) {
        scope = defaultScopeForRole(role, home);
      }
    }

    setDefaultLocationIdState(home);
    setRoleViewState(role);
    setTimeFormatState(prefs.timeFormat);
    setPeriodState(session.period);
    setLensState(session.lens);
    setServiceTimeState(session.serviceTime);
    setSelectedFindingIdState(session.selectedFindingId);
    setLocationScopeState(scope);
    setHydrated(true);
  }, []);

  /**
   * World switch from session event — map persona intentionally.
   * DemoOrgSwitcher applies the full mapping; this is a safety net
   * for other writers of DEMO_ORG_EVENT.
   */
  useEffect(() => {
    function onOrg(e: Event) {
      const detail = (e as CustomEvent<DemoOrgSession>).detail;
      const vertical = (detail?.vertical ?? "restaurant") as DemoVerticalFamily;
      const org = demoOrgForVertical(vertical);
      const loc = primaryLocationId(org) as LocationScope;
      setDefaultLocationIdState(loc);
      // Do not force GM here — DemoOrgSwitcher owns role mapping.
      // Only correct impossible location ids for the new org.
      setLocationScopeState((prev) => {
        if (prev === "all" || String(prev).startsWith("region_")) return prev;
        const ids = new Set(org.locations.map((l) => l.id));
        return ids.has(String(prev)) ? prev : loc;
      });
      setComparisonLocationIds([]);
    }
    window.addEventListener(DEMO_ORG_EVENT, onOrg);
    return () => window.removeEventListener(DEMO_ORG_EVENT, onOrg);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(
      SCOPE_KEY,
      JSON.stringify({
        locationScope,
        period,
        lens,
        serviceTime,
        selectedFindingId,
      }),
    );
  }, [locationScope, period, lens, serviceTime, selectedFindingId, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ defaultLocationId, roleView, timeFormat }),
    );
  }, [defaultLocationId, roleView, timeFormat, hydrated]);

  const setLocationScope = useCallback((v: LocationScope) => {
    setLocationScopeState(v);
    // Switching to group/region exits comparison; single location switch
    // clears comparison so Overview stays coherent.
    if (v === "all" || v.startsWith("region_")) {
      setComparisonLocationIds([]);
    } else {
      setComparisonLocationIds([]);
    }
  }, []);

  const setPeriod = useCallback((v: DashPeriod) => {
    setPeriodState(v);
  }, []);

  const setLens = useCallback((v: OperatingLens) => {
    setLensState(v);
  }, []);

  const setServiceTime = useCallback((v: OperatingServiceTime) => {
    setServiceTimeState(v);
  }, []);

  const setTimeFormat = useCallback((v: TimeFormatPref) => {
    setTimeFormatState(v);
  }, []);

  const setSelectedFindingId = useCallback((id: string | null) => {
    setSelectedFindingIdState(id);
  }, []);

  const setDefaultLocationId = useCallback((id: string) => {
    setDefaultLocationIdState(id);
  }, []);

  const toggleComparisonLocation = useCallback((id: string) => {
    setComparisonLocationIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonLocationIds([]);
  }, []);

  const openLocationSwitcher = useCallback(() => {
    setLocationSwitcherOpen(true);
  }, []);

  const closeLocationSwitcher = useCallback(() => {
    setLocationSwitcherOpen(false);
  }, []);

  /**
   * Persona is a lens — changing it must not silently reset scope/period.
   * Callers that intentionally change composition (RoleViewSwitcher,
   * DemoOrgSwitcher) set scope + period explicitly after setRoleView.
   */
  const setRoleView = useCallback((v: RoleView) => {
    setRoleViewState(v);
  }, []);

  const locationMode = useMemo(
    () => deriveLocationMode(locationScope, comparisonLocationIds),
    [locationScope, comparisonLocationIds],
  );

  const scopedSignals = useMemo(() => {
    if (comparisonLocationIds.length >= 2) {
      const ids = new Set(comparisonLocationIds);
      return signals.filter((s) => ids.has(s.locationId));
    }
    if (locationScope === "all") return signals;
    if (locationScope.startsWith("region_")) {
      const ids = new Set(REGION_LOCATION_IDS[locationScope] ?? []);
      return signals.filter((s) => ids.has(s.locationId));
    }
    return signals.filter((s) => s.locationId === locationScope);
  }, [signals, locationScope, comparisonLocationIds]);

  const updateSignalStatus = useCallback((id: string, status: SignalStatus) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  }, []);

  const resolveSignal = useCallback(
    (id: string, how: ResolveOption, note?: string) => {
      setSignals((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s;
          const activity = [
            ...s.activity,
            {
              id: `a_${Date.now()}`,
              actor: "You",
              body: note ? `${how}: ${note}` : how,
              at: "Just now",
            },
          ];
          return { ...s, status: "RESOLVED" as SignalStatus, activity };
        }),
      );
    },
    [],
  );

  const createControlFromSignal = useCallback(
    (id: string, scope: "supplier" | "all") => {
      const signal = signals.find((s) => s.id === id);
      if (!signal) return;
      setControls((prev) => [
        {
          id: `ctrl_${Date.now()}`,
          name: `Control from ${signal.title}`,
          description: signal.description,
          sourceSignalId: signal.id,
          scope:
            scope === "all"
              ? "All locations"
              : `${locationDisplayName(signal.locationId)} · supplier`,
          condition: "monitored condition",
          action: "Create signal",
          status: "ACTIVE",
          createdAt: "Just now",
          lastRunAt: "Just now",
          preventedCount: 0,
          protectedValue: Math.round(signal.impact * 0.6),
          owner: "You",
          runHistory: ["Passed"],
        },
        ...prev,
      ]);
    },
    [signals],
  );

  const addComment = useCallback((signalId: string, body: string) => {
    setComments((prev) => ({
      ...prev,
      [signalId]: [...(prev[signalId] ?? []), body],
    }));
    setSignals((prev) =>
      prev.map((s) =>
        s.id === signalId
          ? {
              ...s,
              activity: [
                ...s.activity,
                {
                  id: `c_${Date.now()}`,
                  actor: "You",
                  body,
                  at: "Just now",
                },
              ],
            }
          : s,
      ),
    );
  }, []);

  const value = useMemo(
    () => ({
      signals,
      controls,
      roleView,
      onboardingDone,
      comments,
      locationScope,
      period,
      lens,
      serviceTime,
      timeFormat,
      selectedFindingId,
      defaultLocationId,
      comparisonLocationIds,
      locationMode,
      locationSwitcherOpen,
      setLocationScope,
      setPeriod,
      setLens,
      setServiceTime,
      setTimeFormat,
      setSelectedFindingId,
      setDefaultLocationId,
      toggleComparisonLocation,
      clearComparison,
      setComparisonLocationIds,
      openLocationSwitcher,
      closeLocationSwitcher,
      updateSignalStatus,
      resolveSignal,
      createControlFromSignal,
      addComment,
      setRoleView,
      completeOnboarding: () => setOnboardingDone(true),
      scopedSignals,
      contextReady: hydrated,
    }),
    [
      signals,
      controls,
      roleView,
      onboardingDone,
      comments,
      locationScope,
      period,
      lens,
      serviceTime,
      timeFormat,
      selectedFindingId,
      defaultLocationId,
      comparisonLocationIds,
      locationMode,
      locationSwitcherOpen,
      setLocationScope,
      setPeriod,
      setLens,
      setServiceTime,
      setTimeFormat,
      setSelectedFindingId,
      setDefaultLocationId,
      toggleComparisonLocation,
      clearComparison,
      openLocationSwitcher,
      closeLocationSwitcher,
      updateSignalStatus,
      resolveSignal,
      createControlFromSignal,
      addComment,
      setRoleView,
      scopedSignals,
      hydrated,
    ],
  );

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct requires ProductProvider");
  return ctx;
}
