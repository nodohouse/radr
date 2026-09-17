"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ROLE_LENSES } from "@/lib/lab/roles";
import { CATALOG, getDecision, worldFor } from "@/lib/lab/world";
import type {
  AutopilotLevelId,
  BriefRole,
  LabRole,
  LabSeed,
  LabWorld,
  PulseWindow,
  RoleLens,
} from "@/lib/lab/types";

export type Receipt = {
  decisionId: string;
  level: AutopilotLevelId;
  futureId: string;
  note: string;
};

type LabCtx = {
  seed: LabSeed;
  role: LabRole;
  lens: RoleLens;
  window: PulseWindow;
  focusId: string;
  briefRole: BriefRole;
  world: LabWorld;
  pins: string[];
  receipt: Receipt | null;
  setSeed: (seed: LabSeed) => void;
  setRole: (role: LabRole) => void;
  setWindow: (window: PulseWindow) => void;
  setFocus: (id: string) => void;
  setBriefRole: (role: BriefRole) => void;
  togglePin: (id: string) => void;
  stageDecision: (decisionId: string, futureId: string) => void;
  approveDecision: (decisionId: string, futureId: string) => void;
};

const Ctx = createContext<LabCtx | null>(null);

function parseSeed(raw: string | null): LabSeed {
  if (raw === "hotel" || raw === "recover" || raw === "service") return raw;
  return "service";
}

function parseRole(raw: string | null): LabRole {
  if (raw === "cfo" || raw === "clevel" || raw === "gm") return raw;
  return "gm";
}

function parseWindow(raw: string | null): PulseWindow {
  return raw === "24h" ? "24h" : "shift";
}

function parseBrief(raw: string | null, fallback: BriefRole): BriefRole {
  if (raw === "chef" || raw === "foh" || raw === "gm" || raw === "cfo") return raw;
  return fallback;
}

export function LabProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/app/lab/control-center";
  const params = useSearchParams();
  const seed = parseSeed(params.get("seed"));
  const role = parseRole(params.get("role"));
  const window = parseWindow(params.get("window"));
  const lens = ROLE_LENSES[role];
  const world = useMemo(() => worldFor(seed), [seed]);
  const focusId = params.get("focus") || world.heroDecisionId;
  const briefRole = parseBrief(params.get("packet"), lens.defaultBrief);

  const [pins, setPins] = useState(() =>
    CATALOG.filter((m) => m.pinDefault?.includes(role)).map((m) => m.id),
  );
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const replace = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const setSeed = useCallback(
    (next: LabSeed) => {
      const w = worldFor(next);
      setReceipt(null);
      replace({ seed: next, focus: w.heroDecisionId });
    },
    [replace],
  );

  const setRole = useCallback(
    (next: LabRole) => {
      setPins(CATALOG.filter((m) => m.pinDefault?.includes(next)).map((m) => m.id));
      replace({ role: next === "gm" ? null : next });
    },
    [replace],
  );

  const setWindow = useCallback(
    (next: PulseWindow) => replace({ window: next === "shift" ? null : next }),
    [replace],
  );

  const setFocus = useCallback(
    (id: string) => replace({ focus: id }),
    [replace],
  );

  const setBriefRole = useCallback(
    (next: BriefRole) => replace({ packet: next }),
    [replace],
  );

  const togglePin = useCallback((id: string) => {
    setPins((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }, []);

  const stageDecision = useCallback((decisionId: string, futureId: string) => {
    const d = getDecision(decisionId);
    setReceipt({
      decisionId,
      level: "stage",
      futureId,
      note: `Staged only — not written to systems of record. ${d?.displayId ?? ""} stays Expected until Observed → Verified.`,
    });
  }, []);

  const approveDecision = useCallback((decisionId: string, futureId: string) => {
    const d = getDecision(decisionId);
    const auto = d?.autopilot === "auto";
    setReceipt({
      decisionId,
      level: auto ? "auto" : "stage",
      futureId,
      note: auto
        ? `RADR will execute within policy. ${d?.displayId ?? ""} stays Expected until lineage seals Verified.`
        : `Approved prepare. Execution receipt opened. ${d?.displayId ?? ""} stays Expected until Observed → Verified.`,
    });
  }, []);

  const value = useMemo<LabCtx>(
    () => ({
      seed,
      role,
      lens,
      window,
      focusId,
      briefRole,
      world,
      pins,
      receipt,
      setSeed,
      setRole,
      setWindow,
      setFocus,
      setBriefRole,
      togglePin,
      stageDecision,
      approveDecision,
    }),
    [
      seed,
      role,
      lens,
      window,
      focusId,
      briefRole,
      world,
      pins,
      receipt,
      setSeed,
      setRole,
      setWindow,
      setFocus,
      setBriefRole,
      togglePin,
      stageDecision,
      approveDecision,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLab() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLab requires LabProvider");
  return ctx;
}
