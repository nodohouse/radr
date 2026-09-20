"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AskSeed = {
  query?: string;
  entityId?: string;
  entityLabel?: string;
  autoAsk?: boolean;
};

type AskRadrApi = {
  open: boolean;
  seed: AskSeed | null;
  openAsk: (seed?: AskSeed) => void;
  closeAsk: () => void;
};

const AskCtx = createContext<AskRadrApi | null>(null);

export function AskRadrProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState<AskSeed | null>(null);

  const openAsk = useCallback((next?: AskSeed) => {
    setSeed(next ?? null);
    setOpen(true);
  }, []);

  const closeAsk = useCallback(() => {
    setOpen(false);
    setSeed(null);
  }, []);

  const value = useMemo(
    () => ({ open, seed, openAsk, closeAsk }),
    [open, seed, openAsk, closeAsk],
  );

  return <AskCtx.Provider value={value}>{children}</AskCtx.Provider>;
}

export function useAskRadr(): AskRadrApi {
  const ctx = useContext(AskCtx);
  if (!ctx) {
    throw new Error("useAskRadr must be used within AskRadrProvider");
  }
  return ctx;
}

/** Safe hook when provider may be absent (e.g. AskThis outside shell). */
export function useAskRadrOptional(): AskRadrApi | null {
  return useContext(AskCtx);
}
