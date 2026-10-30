"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

export type FocusPayload = {
  id: string;
  what: string;
  why: string;
  impact: string;
  status: string;
  relatedDecisionId?: string | null;
  relatedHref?: string;
  relatedLabel?: string;
};

type FocusApi = {
  focus: FocusPayload | null;
  openFocus: (payload: FocusPayload) => void;
  closeFocus: () => void;
};

const FocusCtx = createContext<FocusApi | null>(null);

export function FocusRailProvider({ children }: { children: ReactNode }) {
  const [focus, setFocus] = useState<FocusPayload | null>(null);
  const openFocus = useCallback((payload: FocusPayload) => {
    setFocus(payload);
  }, []);
  const closeFocus = useCallback(() => setFocus(null), []);
  const value = useMemo(
    () => ({ focus, openFocus, closeFocus }),
    [focus, openFocus, closeFocus],
  );
  return <FocusCtx.Provider value={value}>{children}</FocusCtx.Provider>;
}

export function useFocusRail(): FocusApi {
  const ctx = useContext(FocusCtx);
  if (!ctx) {
    return {
      focus: null,
      openFocus: () => undefined,
      closeFocus: () => undefined,
    };
  }
  return ctx;
}

export function FocusRail() {
  const { focus, closeFocus } = useFocusRail();
  if (!focus) return null;

  return (
    <aside
      className="rp-focus-rail"
      role="dialog"
      aria-modal="false"
      aria-label="Focus"
    >
      <header className="rp-focus-head">
        <p className="rp-focus-k">Focus</p>
        <button
          type="button"
          className="rp-focus-close"
          aria-label="Close focus"
          onClick={closeFocus}
        >
          ×
        </button>
      </header>
      <div className="rp-focus-body">
        <section>
          <p className="rp-focus-label">What</p>
          <p className="rp-focus-what">{focus.what}</p>
        </section>
        <section>
          <p className="rp-focus-label">Why</p>
          <p>{focus.why}</p>
        </section>
        <section>
          <p className="rp-focus-label">Impact</p>
          <p className="rp-focus-impact">{focus.impact}</p>
        </section>
        <section>
          <p className="rp-focus-label">Status</p>
          <p className="rp-focus-status">{focus.status}</p>
        </section>
        {focus.relatedHref ? (
          <Link href={focus.relatedHref} className="rp-focus-cta" onClick={closeFocus}>
            {focus.relatedLabel ?? "Open related →"}
          </Link>
        ) : null}
      </div>
    </aside>
  );
}
