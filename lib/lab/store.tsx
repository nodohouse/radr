"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { defaultBriefForRole } from "./briefs";
import { getDecisionHero } from "./decisions";
import { ROLE_PRESETS } from "./modules";
import { ROLE_LENSES } from "./roles";
import type {
  BriefPacketId,
  DecisionMode,
  PulseWindow,
  RoleId,
  SeedId,
} from "./types";

export type LabRoute = "center" | "decisions" | "my" | "value" | "memory";

export type LabNav = {
  route: LabRoute;
  role: RoleId;
  pinnedIds: string[];
  centerView: "ops" | "brief";
  briefPacket: BriefPacketId;
  myView: "board" | "catalog";
  valueBand: "verified" | "active" | "pending" | "trace";
  memoryScope: string;
  surface: "core" | "command";
};

export type LabState = {
  seed: SeedId;
  mode: DecisionMode;
  selectedFuture: string;
  whyStep: number;
  pulseWindow: PulseWindow;
  operatorContext: "none" | "vip";
};

type LabContextValue = {
  state: LabState;
  nav: LabNav;
  hero: ReturnType<typeof getDecisionHero>;
  setSeed: (seed: SeedId) => void;
  setRole: (role: RoleId) => void;
  setMode: (mode: DecisionMode) => void;
  setFuture: (id: string) => void;
  setPulseWindow: (w: PulseWindow) => void;
  setCenterView: (v: "ops" | "brief") => void;
  setBriefPacket: (p: BriefPacketId) => void;
  setMyView: (v: "board" | "catalog") => void;
  setValueBand: (b: LabNav["valueBand"]) => void;
  setMemoryScope: (s: string) => void;
  setSurface: (s: "core" | "command") => void;
  togglePin: (id: string) => void;
  setVip: () => void;
  goCenter: (seed?: SeedId) => void;
  goDecisions: () => void;
  goCatalog: () => void;
  goValue: (band?: LabNav["valueBand"]) => void;
  goMemory: (scope?: string) => void;
  runCommand: (q: string) => string | null;
};

const LabContext = createContext<LabContextValue | null>(null);

function parseSeed(raw: string | null): SeedId {
  if (raw === "recover" || raw === "hotel" || raw === "service") return raw;
  return "service";
}

function routeFromPath(path: string): LabRoute {
  if (path.includes("/lab/my-center")) return "my";
  if (path.includes("/lab/value")) return "value";
  if (path.includes("/lab/memory")) return "memory";
  if (path.includes("/lab/decisions")) return "decisions";
  return "center";
}

export function LabProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const params = useSearchParams();
  const seedParam = parseSeed(params?.get("seed") ?? null);

  const [state, setState] = useState<LabState>(() => ({
    seed: seedParam,
    mode: "live",
    selectedFuture: "wait_12",
    whyStep: 0,
    pulseWindow: "shift",
    operatorContext: "none",
  }));
  const [role, setRoleState] = useState<RoleId>("gm");
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => [...ROLE_PRESETS.gm]);
  const [centerView, setCenterView] = useState<"ops" | "brief">("ops");
  const [briefPacket, setBriefPacket] = useState<BriefPacketId>("foh");
  const [myView, setMyView] = useState<"board" | "catalog">("catalog");
  const [valueBand, setValueBandState] = useState<LabNav["valueBand"]>(
    () => (params?.get("band") as LabNav["valueBand"]) || "verified",
  );
  const [memoryScope, setMemoryScopeState] = useState(
    () => params?.get("scope") || "playbook",
  );
  const [surface, setSurface] = useState<"core" | "command">("core");

  useEffect(() => {
    setState((s) =>
      s.seed === seedParam
        ? s
        : {
            ...s,
            seed: seedParam,
            mode: "live",
            selectedFuture: "wait_12",
            whyStep: 0,
          },
    );
  }, [seedParam]);

  const route = routeFromPath(pathname);
  const hero = useMemo(
    () => getDecisionHero(state.seed, state.mode, state.selectedFuture),
    [state.seed, state.mode, state.selectedFuture],
  );

  const nav: LabNav = {
    route,
    role,
    pinnedIds,
    centerView,
    briefPacket,
    myView,
    valueBand,
    memoryScope,
    surface,
  };

  const setSeed = useCallback(
    (seed: SeedId) => {
      setState((s) => ({
        ...s,
        seed,
        mode: "live",
        selectedFuture: "wait_12",
        whyStep: 0,
        operatorContext: "none",
      }));
      setCenterView("ops");
      router.replace(`/app/lab/control-center?seed=${seed}`, { scroll: false });
    },
    [router],
  );

  const setRole = useCallback(
    (next: RoleId) => {
      setRoleState(next);
      setPinnedIds([...ROLE_PRESETS[next]]);
      setBriefPacket(defaultBriefForRole(next));
      setCenterView("ops");
      const lens = ROLE_LENSES[next];
      if (pathname.includes("/lab/control-center") && state.seed !== "hotel") {
        setSeed(lens.defaultSeed);
      }
    },
    [pathname, setSeed, state.seed],
  );

  const setMode = useCallback((mode: DecisionMode) => {
    setState((s) => ({ ...s, mode, whyStep: mode === "why" ? 0 : s.whyStep }));
  }, []);

  const setFuture = useCallback((id: string) => {
    setState((s) => ({ ...s, selectedFuture: id }));
  }, []);

  const setPulseWindow = useCallback((pulseWindow: PulseWindow) => {
    setState((s) => ({ ...s, pulseWindow }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }, []);

  const setVip = useCallback(() => {
    setState((s) => ({
      ...s,
      operatorContext: "vip",
      mode: "futures",
      selectedFuture: "wait_12",
    }));
  }, []);

  const goCenter = useCallback(
    (seed?: SeedId) => {
      setSurface("core");
      setCenterView("ops");
      const next = seed ?? state.seed;
      router.push(`/app/lab/control-center?seed=${next}`);
    },
    [router, state.seed],
  );

  const goDecisions = useCallback(() => {
    setSurface("core");
    router.push("/app/lab/decisions");
  }, [router]);

  const goCatalog = useCallback(() => {
    setSurface("core");
    setMyView("catalog");
    router.push("/app/lab/my-center");
  }, [router]);

  const goValue = useCallback(
    (band: LabNav["valueBand"] = "verified") => {
      setSurface("core");
      setValueBandState(band);
      router.push(`/app/lab/value?band=${band}`);
    },
    [router],
  );

  const goMemory = useCallback(
    (scope = "playbook") => {
      setSurface("core");
      setMemoryScopeState(scope);
      router.push(`/app/lab/memory?scope=${scope}`);
    },
    [router],
  );

  const setValueBand = useCallback(
    (band: LabNav["valueBand"]) => {
      setValueBandState(band);
      if (route === "value") {
        router.replace(`/app/lab/value?band=${band}`, { scroll: false });
      }
    },
    [route, router],
  );

  const setMemoryScope = useCallback(
    (scope: string) => {
      setMemoryScopeState(scope);
      if (route === "memory") {
        router.replace(`/app/lab/memory?scope=${scope}`, { scroll: false });
      }
    },
    [route, router],
  );

  const runCommand = useCallback(
    (q: string) => {
      const t = q.trim().toLowerCase();
      if (!t) return null;
      if (/d-1911|wait 12|peak/.test(t)) {
        setSeed("service");
        return "Opening D-1911 · Wait 12";
      }
      if (/d-4102|recover|ap credit|dispute/.test(t)) {
        setSeed("recover");
        return "Opening D-4102 · Recover";
      }
      if (/d-3301|hotel|orphan/.test(t)) {
        setSeed("hotel");
        return "Opening D-3301 · Hotel pulse";
      }
      if (/catalog|my center|pin/.test(t)) {
        goCatalog();
        return "Catalog";
      }
      if (/needs me|decisions/.test(t)) {
        goDecisions();
        return "Decisions that need you";
      }
      if (/value|verified|trace/.test(t)) {
        goValue(t.includes("trace") ? "trace" : "verified");
        return t.includes("trace") ? "Trace lineage" : "Verified Value";
      }
      if (/memory|playbook/.test(t)) {
        goMemory("playbook");
        return "Operating Memory";
      }
      if (/brief/.test(t)) {
        setCenterView("brief");
        goCenter("service");
        return "Service Brief";
      }
      setSeed("service");
      setMode("why");
      return "Grounded in D-1911 · Why";
    },
    [goCatalog, goCenter, goDecisions, goMemory, goValue, setMode, setSeed],
  );

  const value: LabContextValue = {
    state,
    nav,
    hero,
    setSeed,
    setRole,
    setMode,
    setFuture,
    setPulseWindow,
    setCenterView,
    setBriefPacket,
    setMyView,
    setValueBand,
    setMemoryScope,
    setSurface,
    togglePin,
    setVip,
    goCenter,
    goDecisions,
    goCatalog,
    goValue,
    goMemory,
    runCommand,
  };

  return <LabContext.Provider value={value}>{children}</LabContext.Provider>;
}

export function useLab() {
  const ctx = useContext(LabContext);
  if (!ctx) throw new Error("useLab requires LabProvider");
  return ctx;
}
