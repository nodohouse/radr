/**
 * Pinned Intelligence modules — Control Center customization.
 * Abstracted persistence (localStorage today; swap for user prefs later).
 */

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
import {
  getIntelligenceModule,
  INTEL_PINS_KEY,
  MAX_CONTROL_CENTER_PINS,
  type IntelModuleSize,
} from "@/lib/radr/intelligence/moduleRegistry";

export type PinnedIntelModule = {
  moduleId: string;
  size: IntelModuleSize;
  order: number;
};

type IntelPinStore = {
  pins: PinnedIntelModule[];
  isPinned: (moduleId: string) => boolean;
  togglePin: (moduleId: string) => { ok: boolean; reason?: string };
  removePin: (moduleId: string) => void;
  setSize: (moduleId: string, size: IntelModuleSize) => void;
  reorder: (moduleId: string, direction: "up" | "down") => void;
  toast: string | null;
  clearToast: () => void;
};

const Ctx = createContext<IntelPinStore | null>(null);

function readPins(): PinnedIntelModule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INTEL_PINS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PinnedIntelModule[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => getIntelligenceModule(p.moduleId))
      .sort((a, b) => a.order - b.order)
      .slice(0, MAX_CONTROL_CENTER_PINS);
  } catch {
    return [];
  }
}

function writePins(pins: PinnedIntelModule[]) {
  try {
    localStorage.setItem(INTEL_PINS_KEY, JSON.stringify(pins));
  } catch {
    /* ignore */
  }
}

export function IntelligencePinProvider({ children }: { children: ReactNode }) {
  const [pins, setPins] = useState<PinnedIntelModule[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPins(readPins());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writePins(pins);
  }, [pins, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const isPinned = useCallback(
    (moduleId: string) => pins.some((p) => p.moduleId === moduleId),
    [pins],
  );

  const togglePin = useCallback(
    (moduleId: string) => {
      const def = getIntelligenceModule(moduleId);
      if (!def?.pinningSupported) {
        return { ok: false, reason: "This module cannot be pinned." };
      }
      if (pins.some((p) => p.moduleId === moduleId)) {
        setPins((prev) =>
          prev
            .filter((p) => p.moduleId !== moduleId)
            .map((p, i) => ({ ...p, order: i })),
        );
        setToast("Removed from Control Center");
        return { ok: true };
      }
      if (pins.length >= MAX_CONTROL_CENTER_PINS) {
        setToast(
          "Your Control Center is full. Remove or replace a pinned module.",
        );
        return {
          ok: false,
          reason:
            "Your Control Center is full. Remove or replace a pinned module.",
        };
      }
      setPins((prev) => [
        ...prev,
        {
          moduleId,
          size: def.defaultSize,
          order: prev.length,
        },
      ]);
      setToast("Added to Control Center");
      return { ok: true };
    },
    [pins],
  );

  const removePin = useCallback((moduleId: string) => {
    setPins((prev) =>
      prev
        .filter((p) => p.moduleId !== moduleId)
        .map((p, i) => ({ ...p, order: i })),
    );
  }, []);

  const setSize = useCallback((moduleId: string, size: IntelModuleSize) => {
    setPins((prev) =>
      prev.map((p) => (p.moduleId === moduleId ? { ...p, size } : p)),
    );
  }, []);

  const reorder = useCallback(
    (moduleId: string, direction: "up" | "down") => {
      setPins((prev) => {
        const idx = prev.findIndex((p) => p.moduleId === moduleId);
        if (idx < 0) return prev;
        const next = [...prev];
        const swap = direction === "up" ? idx - 1 : idx + 1;
        if (swap < 0 || swap >= next.length) return prev;
        const a = next[idx]!;
        next[idx] = next[swap]!;
        next[swap] = a;
        return next.map((p, i) => ({ ...p, order: i }));
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      pins,
      isPinned,
      togglePin,
      removePin,
      setSize,
      reorder,
      toast,
      clearToast: () => setToast(null),
    }),
    [pins, isPinned, togglePin, removePin, setSize, reorder, toast],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useIntelligencePins(): IntelPinStore {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useIntelligencePins requires IntelligencePinProvider");
  }
  return ctx;
}

export function useIntelligencePinsOptional(): IntelPinStore | null {
  return useContext(Ctx);
}
