"use client";

/**
 * Persistent LAB operating state — shared across /app/lab/* routes.
 * Shell + Mode Rail read this; canvases mutate it.
 */

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
import { DECISION_IDS } from "@/lib/radr/decision/ids";
import {
  deriveLab,
  LAB_INITIAL,
  isFinanceSeed,
  parseLabSeed,
  type LabFuture,
  type LabMode,
  type LabNode,
  type LabSeed,
  type LabState,
} from "./labState";
import {
  ROLE_PRESETS,
  type CenterRole,
} from "./labModules";
import { type BriefPacket } from "./labServiceBrief";
import { ROLE_LENSES } from "./labRoleLens";
import type { PulseIndustry } from "./labShiftPulse";

export type LabRoute =
  | "center"
  | "my"
  | "decisions"
  | "value"
  | "memory"
  | "service"
  | "decision";

export type ValueBand = "verified" | "active" | "pending" | "trace";
export type MemoryScope =
  | "comparable"
  | "patterns"
  | "interventions"
  | "verified"
  | "playbook";
export type DockSurface = "core" | "command";
export type MyView = "board" | "catalog";
export type CenterView = "ops" | "brief";

export type LabNav = {
  route: LabRoute;
  decisionId: string | null;
  valueBand: ValueBand;
  memoryScope: MemoryScope;
  surface: DockSurface;
  role: import("./labModules").CenterRole;
  pinnedIds: string[];
  myView: MyView;
  centerView: CenterView;
  briefPacket: BriefPacket;
  industry: PulseIndustry;
};

type LabContextValue = {
  state: LabState;
  derived: ReturnType<typeof deriveLab>;
  nav: LabNav;
  setMode: (mode: LabMode) => void;
  setWhyStep: (n: number) => void;
  setFuture: (f: LabFuture) => void;
  setNode: (n: LabNode) => void;
  setVip: () => void;
  setSeed: (s: LabSeed) => void;
  setValueBand: (b: ValueBand) => void;
  setMemoryScope: (s: MemoryScope) => void;
  setSurface: (s: DockSurface) => void;
  setRole: (r: CenterRole) => void;
  togglePin: (id: string) => void;
  setMyView: (v: MyView) => void;
  setCenterView: (v: CenterView) => void;
  setBriefPacket: (p: BriefPacket) => void;
  setIndustry: (i: PulseIndustry) => void;
  goCenter: () => void;
  goMyCenter: () => void;
  goDecisions: () => void;
  goDecision: (id?: string, mode?: LabMode) => void;
  goValue: (band?: ValueBand) => void;
  goMemory: (scope?: MemoryScope) => void;
  goService: () => void;
  runCommand: (query: string) => string | null;
};

const LabCtx = createContext<LabContextValue | null>(null);

function routeFromPath(pathname: string): LabRoute {
  if (pathname.includes("/lab/my-center")) return "my";
  if (pathname.includes("/lab/value")) return "value";
  if (pathname.includes("/lab/memory")) return "memory";
  if (pathname.includes("/lab/service")) return "service";
  if (/\/lab\/decisions\/[^/]+/.test(pathname)) return "decision";
  if (pathname.includes("/lab/decisions")) return "decisions";
  return "center";
}

function decisionIdFromPath(pathname: string): string | null {
  const m = pathname.match(/\/lab\/decisions\/([^/?#]+)/);
  if (!m?.[1]) return null;
  const key = m[1].toLowerCase();
  if (key === "d-1911" || key === "peak" || key === DECISION_IDS.peak)
    return DECISION_IDS.peak;
  if (key === "d-7501" || key === "margin") return DECISION_IDS.marginCoke;
  if (key === "d-4102" || key === "supplier") return DECISION_IDS.supplier;
  if (key === "d-7110" || key === "menu") return DECISION_IDS.menuPeak;
  return key;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const search = useSearchParams();
  const seedParam = search?.get("seed");
  const initialSeed = parseLabSeed(seedParam);
  const [state, setState] = useState<LabState>(() => ({
    ...LAB_INITIAL,
    seed: initialSeed,
  }));
  const [surface, setSurface] = useState<DockSurface>("core");
  const [valueBand, setValueBandState] = useState<ValueBand>(
    () => (search?.get("band") as ValueBand) || "verified",
  );
  const [memoryScope, setMemoryScopeState] = useState<MemoryScope>(
    () => (search?.get("scope") as MemoryScope) || "comparable",
  );
  const [role, setRoleState] = useState<CenterRole>(() =>
    isFinanceSeed(initialSeed) ? "cfo" : "gm",
  );
  const [pinnedIds, setPinnedIds] = useState<string[]>(() => [
    ...(isFinanceSeed(initialSeed)
      ? ROLE_PRESETS.cfo.moduleIds
      : ROLE_PRESETS.gm.moduleIds),
  ]);
  const [myView, setMyViewState] = useState<MyView>("board");
  const [centerView, setCenterViewState] = useState<CenterView>("ops");
  const [briefPacket, setBriefPacketState] = useState<BriefPacket>(() =>
    isFinanceSeed(initialSeed) ? ROLE_LENSES.cfo.defaultBriefPacket : "foh",
  );
  const [industry, setIndustryState] = useState<PulseIndustry>("restaurant");

  useEffect(() => {
    if (
      seedParam === "recover" ||
      seedParam === "margin-response" ||
      seedParam === "service"
    ) {
      const next = parseLabSeed(seedParam);
      setState((s) =>
        s.seed === next
          ? s
          : {
              ...s,
              seed: next,
              mode: "live",
              selectedFuture: "wait_12",
              whyStep: 0,
            },
      );
      if (isFinanceSeed(next)) {
        setRoleState("cfo");
        setPinnedIds([...ROLE_PRESETS.cfo.moduleIds]);
        setBriefPacketState(ROLE_LENSES.cfo.defaultBriefPacket);
      }
    }
  }, [seedParam]);

  const route = routeFromPath(pathname);
  const decisionId = decisionIdFromPath(pathname);

  const derived = useMemo(() => deriveLab(state), [state]);

  const nav: LabNav = useMemo(
    () => ({
      route,
      decisionId,
      valueBand,
      memoryScope,
      surface,
      role,
      pinnedIds,
      myView,
      centerView,
      briefPacket,
      industry,
    }),
    [
      route,
      decisionId,
      valueBand,
      memoryScope,
      surface,
      role,
      pinnedIds,
      myView,
      centerView,
      briefPacket,
      industry,
    ],
  );

  const setMode = useCallback((mode: LabMode) => {
    setState((s) => ({
      ...s,
      mode,
      whyStep: mode === "why" ? 0 : s.whyStep,
    }));
  }, []);

  const setWhyStep = useCallback((whyStep: number) => {
    setState((s) => ({ ...s, whyStep }));
  }, []);

  const setFuture = useCallback((f: LabFuture) => {
    setState((s) => ({ ...s, selectedFuture: f, selectedNode: "econ" }));
  }, []);

  const setNode = useCallback((n: LabNode) => {
    setState((s) => ({
      ...s,
      selectedNode: n === null ? null : s.selectedNode === n ? null : n,
    }));
  }, []);

  const setVip = useCallback(() => {
    setState((s) => ({
      ...s,
      operatorContext: "vip",
      mode: "futures",
      selectedFuture: "wait_12",
      selectedNode: null,
    }));
  }, []);

  const setSeed = useCallback(
    (seed: LabSeed) => {
      setState((s) => ({
        ...s,
        seed,
        mode: "live",
        selectedFuture: "wait_12",
        operatorContext: "none",
        whyStep: 0,
        selectedNode: null,
      }));
      router.replace(`/app/lab/control-center?seed=${seed}`, { scroll: false });
    },
    [router],
  );

  const setValueBand = useCallback(
    (b: ValueBand) => {
      setValueBandState(b);
      if (route === "value") {
        router.replace(`/app/lab/value?band=${b}`, { scroll: false });
      }
    },
    [route, router],
  );

  const setMemoryScope = useCallback(
    (s: MemoryScope) => {
      setMemoryScopeState(s);
      if (route === "memory") {
        router.replace(`/app/lab/memory?scope=${s}`, { scroll: false });
      }
    },
    [route, router],
  );

  const setRole = useCallback(
    (r: CenterRole) => {
      setRoleState(r);
      setPinnedIds([...ROLE_PRESETS[r].moduleIds]);
      setMyViewState("board");
      const lens = ROLE_LENSES[r];
      setBriefPacketState(lens.defaultBriefPacket);
      setCenterViewState("ops");
      const nextSeed =
        r === "cfo" ? "recover" : r === "gm" ? "service" : null;
      if (nextSeed) {
        setState((s) => ({
          ...s,
          seed: nextSeed,
          mode: "live",
          selectedFuture: "wait_12",
          whyStep: 0,
          selectedNode: null,
        }));
        if (pathname.includes("/lab/control-center")) {
          router.replace(`/app/lab/control-center?seed=${nextSeed}`, {
            scroll: false,
          });
        }
      }
    },
    [pathname, router],
  );

  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const setMyView = useCallback((v: MyView) => {
    setMyViewState(v);
  }, []);

  const setCenterView = useCallback((v: CenterView) => {
    setCenterViewState(v);
  }, []);

  const setBriefPacket = useCallback((p: BriefPacket) => {
    setBriefPacketState(p);
  }, []);

  const setIndustry = useCallback((i: PulseIndustry) => {
    setIndustryState(i);
  }, []);

  const goCenter = useCallback(() => {
    setSurface("core");
    setState((s) => ({
      ...s,
      mode: "live",
      selectedFuture: "wait_12",
      selectedNode: null,
      whyStep: 0,
    }));
    router.push(
      `/app/lab/control-center?seed=${seedParam === "recover" ? "recover" : state.seed}`,
    );
  }, [router, seedParam, state.seed]);

  const goMyCenter = useCallback(() => {
    setSurface("core");
    router.push("/app/lab/my-center");
  }, [router]);

  const goDecisions = useCallback(() => {
    setSurface("core");
    router.push("/app/lab/decisions");
  }, [router]);

  const goDecision = useCallback(
    (id: string = DECISION_IDS.peak, mode: LabMode = "live") => {
      setSurface("core");
      setState((s) => ({
        ...s,
        mode,
        selectedNode: null,
        seed: id === DECISION_IDS.supplier ? "recover" : s.seed,
      }));
      const slug =
        id === DECISION_IDS.peak
          ? "d-1911"
          : id === DECISION_IDS.marginCoke
            ? "d-7501"
            : id === DECISION_IDS.supplier
              ? "d-4102"
              : id === DECISION_IDS.menuPeak
                ? "d-7110"
                : id;
      if (id === DECISION_IDS.supplier) {
        router.push("/app/lab/control-center?seed=recover");
        return;
      }
      if (id === DECISION_IDS.peak) {
        router.push("/app/lab/control-center?seed=service");
        return;
      }
      router.push(`/app/lab/decisions/${slug}`);
    },
    [router],
  );

  const goValue = useCallback(
    (band: ValueBand = "verified") => {
      setSurface("core");
      setValueBandState(band);
      router.push(`/app/lab/value?band=${band}`);
    },
    [router],
  );

  const goMemory = useCallback(
    (scope: MemoryScope = "comparable") => {
      setSurface("core");
      setMemoryScopeState(scope);
      router.push(`/app/lab/memory?scope=${scope}`);
    },
    [router],
  );

  const goService = useCallback(() => {
    setSurface("core");
    router.push("/app/lab/service");
  }, [router]);

  const runCommand = useCallback(
    (query: string): string | null => {
      const q = query.trim().toLowerCase();
      if (!q) return null;

      if (/d-1911|show d-1911|open d-1911|peak|wait 12/.test(q)) {
        setSeed("service");
        return "Opening D-1911 · Wait 12";
      }
      if (/d-4102|recover|ap credit|supplier|dispute/.test(q)) {
        setSeed("recover");
        return "Opening D-4102 · Recover";
      }
      if (/d-7501|margin response/.test(q)) {
        goDecision(DECISION_IDS.marginCoke, "live");
        return "Opening D-7501";
      }
      if (/d-7110|menu peak/.test(q)) {
        goDecision(DECISION_IDS.menuPeak, "live");
        return "Opening D-7110";
      }
      if (/service map|open service|show tonight/.test(q)) {
        goService();
        return "Service map";
      }
      if (/what needs me|needs me/.test(q)) {
        goDecisions();
        return "Decisions that need you";
      }
      if (/what am i missing|missing/.test(q)) {
        setSeed("service");
        setMode("why");
        return "What you may be missing — D-1911 Why";
      }
      if (/margin leak|where is margin/.test(q)) {
        goDecision(DECISION_IDS.menuPeak, "live");
        return "Margin quality · D-7110";
      }
      if (/value|verified|trace/.test(q)) {
        goValue(q.includes("trace") ? "trace" : "verified");
        return q.includes("trace") ? "Trace lineage" : "Verified Value";
      }
      if (/memory|playbook/.test(q)) {
        goMemory("playbook");
        return "Operating Memory";
      }
      if (/center|home/.test(q)) {
        goCenter();
        return "Center";
      }

      setSeed("service");
      setMode("why");
      return "Grounded in D-1911 · Why";
    },
    [goCenter, goDecision, goDecisions, goMemory, goService, goValue, setMode, setSeed],
  );

  const value: LabContextValue = {
    state,
    derived,
    nav,
    setMode,
    setWhyStep,
    setFuture,
    setNode,
    setVip,
    setSeed,
    setValueBand,
    setMemoryScope,
    setSurface,
    setRole,
    togglePin,
    setMyView,
    setCenterView,
    setBriefPacket,
    setIndustry,
    goCenter,
    goMyCenter,
    goDecisions,
    goDecision,
    goValue,
    goMemory,
    goService,
    runCommand,
  };

  return <LabCtx.Provider value={value}>{children}</LabCtx.Provider>;
}

export function useLab(): LabContextValue {
  const ctx = useContext(LabCtx);
  if (!ctx) throw new Error("useLab requires LabProvider");
  return ctx;
}
