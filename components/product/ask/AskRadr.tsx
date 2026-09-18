"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import { buildButlerOpening } from "@/lib/radr/butler/opening";
import type {
  ButlerResponse,
  ButlerRole,
  ButlerSession,
} from "@/lib/radr/butler/types";
import { AskAnswer } from "./AskAnswer";
import { useAskRadr } from "./AskRadrContext";
import { RADR_DELTA_NAV_ASSET } from "@/lib/radr/brandTokens";
import { findingsForScope } from "@/lib/radr/findings";
import { createActionFromFinding } from "@/lib/radr/actions/service";
import { getRoleProfile } from "@/lib/radr/role/profiles";
import { migrateRoleView } from "@/lib/product/types";

function roleFromView(roleView: string): ButlerRole {
  return getRoleProfile(migrateRoleView(roleView)).butlerRole;
}

export function AskRadr() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    locationScope,
    period,
    roleView,
    defaultLocationId,
    comparisonLocationIds,
    lens,
    serviceTime,
    selectedFindingId,
  } = useProduct();
  const { open, seed, openAsk, closeAsk } = useAskRadr();

  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [askedQuery, setAskedQuery] = useState<string | null>(null);
  const [response, setResponse] = useState<ButlerResponse | null>(null);
  const [session, setSession] = useState<ButlerSession | undefined>();
  const [confirmWrite, setConfirmWrite] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [analysisForced, setAnalysisForced] = useState(false);

  const [analyzing, setAnalyzing] = useState<
    { id: string; label: string; status: string }[]
  >([]);
  const [askMode, setAskMode] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const seededRef = useRef<string | null>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const role = roleFromView(roleView);

  const butlerCtx = useMemo(() => {
    const allowed: string[] | "all" =
      role === "group_cfo" || role === "regional_manager" ? "all" : [locationScope];
    return {
      locationScope,
      period,
      role,
      allowedLocationIds: allowed,
      page: pathname,
      defaultLocationId,
      comparisonLocationIds,
      selectedEntityId: seed?.entityId,
      selectedEntityLabel: seed?.entityLabel,
      lens,
      serviceTime,
      selectedFindingId: selectedFindingId ?? seed?.entityId,
    };
  }, [
    locationScope,
    period,
    role,
    pathname,
    defaultLocationId,
    comparisonLocationIds,
    seed?.entityId,
    seed?.entityLabel,
    lens,
    serviceTime,
    selectedFindingId,
  ]);

  const opening = useMemo(() => buildButlerOpening(butlerCtx), [butlerCtx]);
  const placeholder = `Ask anything about ${opening.scopeLabel}…`;

  const isAnalysis =
    analysisForced || Boolean(response?.expanded) || Boolean(response?.visualization?.type === "comparison");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const growField = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 152)}px`;
  }, []);

  const runAsk = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query) return;

      if (query.startsWith("/")) {
        setShowCommands(true);
        setResponse(null);
        setThinking(false);
        setAskedQuery(query);
        return;
      }

      setShowCommands(false);
      setConfirmWrite(false);
      setAskedQuery(query);
      setAnalysisForced(false);
      setThinking(true);
      setResponse(null);
      setAnalyzing([]);
      setAskMode(null);

      try {
        const res = await fetch("/api/ask-radr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: query,
            locationScope,
            period,
            page: pathname,
            role,
            allowedLocationIds: butlerCtx.allowedLocationIds,
            session,
            selectedEntityId: seed?.entityId,
            selectedEntityLabel: seed?.entityLabel,
            lens,
            serviceTime,
            selectedFindingId: selectedFindingId ?? seed?.entityId,
          }),
        });

        if (!res.ok || !res.body) {
          setResponse({
            title: "Ask RADR unavailable",
            summary: "We couldn't complete that request. Please try again.",
            answer: "Unavailable",
            actions: [],
            evidence: [],
            toolUsed: "none",
            topic: "general",
          });
          setThinking(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const lines = chunk.split("\n");
            let event = "message";
            let data = "";
            for (const line of lines) {
              if (line.startsWith("event:")) event = line.slice(6).trim();
              if (line.startsWith("data:")) data += line.slice(5).trim();
            }
            if (!data) continue;
            try {
              const payload = JSON.parse(data) as Record<string, unknown>;
              if (event === "analyzing") {
                setAnalyzing((prev) => {
                  const step = payload as {
                    id: string;
                    label: string;
                    status: string;
                  };
                  const rest = prev.filter((p) => p.id !== step.id);
                  return [...rest, step];
                });
              }
              if (event === "result") {
                const result = payload as {
                  mode?: string;
                  response: ButlerResponse;
                  session: ButlerSession;
                };
                setAskMode(result.mode ?? null);
                setResponse(result.response);
                setSession(result.session);
                if (result.response.expanded) setAnalysisForced(true);
              }
            } catch {
              /* ignore partial SSE */
            }
          }
        }
      } catch {
        setResponse({
          title: "Ask RADR unavailable",
          summary: "We couldn't complete that request. Please try again.",
          answer: "Unavailable",
          actions: [],
          evidence: [],
          toolUsed: "none",
          topic: "general",
        });
      } finally {
        setThinking(false);
      }
    },
    [butlerCtx, session, locationScope, period, pathname, role, seed, lens, serviceTime, selectedFindingId],
  );

  useEffect(() => {
    if (!open) {
      seededRef.current = null;
      return;
    }
    if (!seed?.query) return;
    setQ(seed.query);
    if (!seed.autoAsk) return;
    if (seededRef.current === seed.query) return;
    seededRef.current = seed.query;
    const t = window.setTimeout(() => runAsk(seed.query!), 60);
    return () => window.clearTimeout(t);
  }, [open, seed, runAsk]);

  const resetClose = useCallback(() => {
    closeAsk();
    setQ("");
    setAskedQuery(null);
    setResponse(null);
    setConfirmWrite(false);
    setThinking(false);
    setShowCommands(false);
    setAnalysisForced(false);
    seededRef.current = null;
    window.setTimeout(() => {
      const el = returnFocusRef.current ?? triggerRef.current;
      el?.focus?.();
    }, 20);
  }, [closeAsk]);

  const closeRef = useRef(resetClose);
  closeRef.current = resetClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closeRef.current();
        else {
          returnFocusRef.current = document.activeElement as HTMLElement | null;
          openAsk();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openAsk]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (isAnalysis && response) {
          setAnalysisForced(false);
          return;
        }
        resetClose();
      }
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, resetClose, isAnalysis, response]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const root = panelRef.current;
    const selector =
      'button, [href], textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(selector),
      ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
      if (!nodes.length) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onTab);
    return () => root.removeEventListener("keydown", onTab);
  }, [open, response, thinking, isAnalysis]);

  const backToQuick = () => {
    setAnalysisForced(false);
    setResponse(null);
    setAskedQuery(null);
    setQ("");
    setConfirmWrite(false);
    setShowCommands(false);
    window.setTimeout(() => inputRef.current?.focus(), 40);
  };

  const commandItems = [
    { label: "Control Center", href: "/app" },
    { label: "Verified Value", href: "/app/value" },
    { label: "Upload data", href: "/app/data?upload=1" },
    { label: "Controls", href: "/app/controls" },
  ];

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="rp-ask-launch"
      onClick={() => {
        returnFocusRef.current = document.activeElement as HTMLElement | null;
        openAsk();
      }}
      aria-label="Ask RADR"
    >
      <span>Ask RADR</span>
      <kbd>⌘K</kbd>
    </button>
  );

  if (!open) return trigger;

  const isOpening = !response && !thinking && !showCommands && !askedQuery;

  const overlay = (
    <div
      className={`rp-ask ${isAnalysis ? "rp-ask-analysis" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="rp-ask-backdrop"
        aria-label="Close Ask RADR"
        onClick={resetClose}
      />

      <div
        ref={panelRef}
        className={`rp-ask-panel ${isAnalysis ? "rp-ask-panel-analysis" : ""} ${isOpening ? "rp-ask-panel-open" : ""}`}
      >
        <header className="rp-ask-chrome">
          <div className="rp-ask-chrome-left">
            <p id={titleId} className="rp-ask-brand">
              Ask RADR
            </p>
            <span className="rp-ask-live" aria-label="RADR live">
              <span className="rp-ask-live-pulse" aria-hidden="true" />
              RADR Live
            </span>
          </div>
          <div className="rp-ask-chrome-right">
            {isAnalysis && response ? (
              <button type="button" className="rp-ask-back" onClick={backToQuick}>
                ← Back
              </button>
            ) : null}
            <span className="rp-ask-mark" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={RADR_DELTA_NAV_ASSET} alt="" width={18} height={16} />
            </span>
            <button
              type="button"
              className="rp-ask-close"
              onClick={resetClose}
              aria-label="Close Ask RADR"
            >
              <span aria-hidden="true">×</span>
              <kbd>Esc</kbd>
            </button>
          </div>
        </header>

        {isOpening ? (
          <div className="rp-ask-opening">
            <h2 className="rp-ask-greeting">{opening.greeting}</h2>
            <p className="rp-ask-invite">{opening.invite}</p>

            <form
              className="rp-ask-composer"
              onSubmit={(e) => {
                e.preventDefault();
                void runAsk(q);
              }}
            >
              <textarea
                ref={inputRef}
                className="rp-ask-field"
                rows={1}
                value={q}
                placeholder={placeholder}
                aria-label="Ask RADR about your operation"
                onChange={(e) => {
                  setQ(e.target.value);
                  growField(e.target);
                  if (!e.target.value.startsWith("/")) setShowCommands(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void runAsk(q);
                  }
                }}
              />
              <button
                type="submit"
                className="rp-ask-send"
                aria-label="Ask"
                disabled={!q.trim() || thinking}
              >
                ↑
              </button>
            </form>

            <p className="rp-ask-scope">{opening.contextLine}</p>

            <div className="rp-ask-now">
              <p className="rp-ask-label">Right now</p>
              <div className="rp-ask-now-row">
                {opening.rightNow.exposureLabel ? (
                  <span className="rp-ask-now-stat rp-ask-now-money">
                    {opening.rightNow.exposureLabel}
                  </span>
                ) : null}
                {opening.rightNow.attentionLabel ? (
                  <span className="rp-ask-now-stat">
                    {opening.rightNow.attentionLabel}
                  </span>
                ) : null}
                {opening.rightNow.actionsLabel ? (
                  <span className="rp-ask-now-stat">
                    {opening.rightNow.actionsLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="rp-ask-suggest">
              <p className="rp-ask-label">Try</p>
              <ul>
                {opening.suggestions.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQ(s.query);
                        runAsk(s.query);
                      }}
                    >
                      <span>{s.label}</span>
                      <em aria-hidden="true">→</em>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="rp-ask-active">
            <p className="rp-ask-scope">{opening.contextLine}</p>
            {askedQuery ? (
              <p className="rp-ask-asked">“{askedQuery}”</p>
            ) : null}

            <div className="rp-ask-scroll">
              {thinking ? (
                <div className="rp-ask-thinking" aria-live="polite">
                  <p className="rp-ask-label">
                    Analyzing {opening.scopeLabel}
                    {askMode === "llm" ? " · AI" : ""}
                  </p>
                  {analyzing.length ? (
                    <ul className="rp-ask-analyzing">
                      {analyzing.map((s) => (
                        <li key={s.id} data-status={s.status}>
                          {s.label}
                          {s.status === "done" ? " ✓" : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="rp-ask-thinking-line">
                      Resolving context · querying RADR tools
                    </p>
                  )}
                </div>
              ) : null}

              {showCommands ? (
                <div className="rp-ask-commands">
                  <p className="rp-ask-label">Commands</p>
                  <ul>
                    {commandItems.map((c) => (
                      <li key={c.href}>
                        <button
                          type="button"
                          onClick={() => {
                            resetClose();
                            router.push(c.href);
                          }}
                        >
                          <span>{c.label}</span>
                          <em>→</em>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {response && !thinking ? (
                <AskAnswer
                  response={response}
                  onFollowUp={(follow) => {
                    setQ(follow);
                    runAsk(follow);
                  }}
                  onNavigate={(href) => {
                    resetClose();
                    router.push(href);
                  }}
                  confirmWrite={confirmWrite}
                  onConfirmWrite={() => {
                    if (
                      response?.pendingWrite?.kind === "CREATE_ACTION" &&
                      response.topic === "labor"
                    ) {
                      const labor = findingsForScope(locationScope).find(
                        (f) => f.territory === "LABOR",
                      );
                      if (labor) {
                        createActionFromFinding(labor, "ask_radr_operator");
                      }
                    }
                    setConfirmWrite(true);
                  }}
                  onCancelWrite={() => setConfirmWrite(false)}
                />
              ) : null}
            </div>

            <form
              className="rp-ask-composer rp-ask-composer-follow"
                onSubmit={(e) => {
                e.preventDefault();
                void runAsk(q);
              }}
            >
              <textarea
                ref={inputRef}
                className="rp-ask-field"
                rows={1}
                value={q}
                placeholder="Ask a follow-up…"
                aria-label="Ask a follow-up"
                onChange={(e) => {
                  setQ(e.target.value);
                  growField(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void runAsk(q);
                  }
                }}
              />
              <button
                type="submit"
                className="rp-ask-send"
                aria-label="Ask"
                disabled={!q.trim() || thinking}
              >
                ↑
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {trigger}
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}

export { AskRadr as CommandPalette };
