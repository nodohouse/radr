"use client";

/**
 * Mode Rail — labeled icons, homepage triangle mark, sand chrome.
 */

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getDecisionStoreSnapshot,
  subscribeDecisionStore,
} from "@/lib/radr/decision/store";
import { DECISION_IDS, displayDecisionId } from "@/lib/radr/decision/ids";
import {
  scopedDecisions,
  splitNeedsYou,
} from "@/lib/radr/product/roleScope";
import { AskRadrService } from "@/lib/radr/product/services";
import { RadrDelta } from "@/components/radr/RadrDelta";
import { useLab } from "./LabContext";
import { LAB_CANON } from "./labState";
import { LAB_SEEDS } from "./labLineage";

const COMMANDS = [
  "What needs me?",
  "Open recover",
  "Show D-1911",
  "My Center",
  "Verified Value",
] as const;

const MODES = [
  { id: "center" as const, label: "Center", href: "/app/lab/control-center" },
  { id: "decisions" as const, label: "Decisions", href: "/app/lab/decisions" },
  { id: "my" as const, label: "Catalog", href: "/app/lab/my-center" },
  { id: "value" as const, label: "Value", href: "/app/lab/value?band=verified" },
  { id: "memory" as const, label: "Memory", href: "/app/lab/memory?scope=playbook" },
] as const;

export function LabModeRail() {
  const {
    nav,
    state,
    setSurface,
    setMode,
    setSeed,
    setMyView,
    goDecisions,
    goDecision,
    goValue,
    goMemory,
    goMyCenter,
    goService,
    runCommand,
  } = useLab();

  const [cmd, setCmd] = useState("");
  const [cmdOut, setCmdOut] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const snap = useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );

  const needsCount = useMemo(() => {
    const scoped = scopedDecisions(Object.values(snap.records), "gm");
    const { urgent, review } = splitNeedsYou(scoped);
    return urgent.length + review.length;
  }, [snap]);

  const activeRoute =
    nav.route === "decision" || nav.route === "service"
      ? "center"
      : nav.route;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSurface("command");
      }
      if (e.key === "Escape") {
        setSurface("core");
        setCmdOut(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSurface]);

  useEffect(() => {
    if (nav.surface !== "command") return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [nav.surface]);

  const submitCommand = (q: string) => {
    const lower = q.trim().toLowerCase();
    if (/my center|catalog|pin/.test(lower)) {
      setMyView("catalog");
      goMyCenter();
      setSurface("core");
      setCmd("");
      setCmdOut("Catalog");
      return;
    }
    if (/open recover|d-4102|ap credit|recover/.test(lower)) {
      setSeed("recover");
      setSurface("core");
      setCmd("");
      setCmdOut("Recover · D-4102");
      return;
    }
    const result = runCommand(q);
    if (result) {
      setCmdOut(result);
      setSurface("core");
      setCmd("");
      return;
    }
    const a = AskRadrService.answer("gm", q);
    setCmdOut(a.answer.split("\n").slice(0, 2).join(" · "));
    goDecision(DECISION_IDS.peak, "why");
    setSurface("core");
  };

  return (
    <>
      <nav className="lab-rail lab-rail-sand" aria-label="RADR modes">
        <Link href="/app/lab/control-center" className="lab-rail-brand" aria-label="RADR">
          <span className="lab-rail-brand-mark">
            <RadrDelta variant="nav" height={15} />
          </span>
        </Link>

        <ul className="lab-rail-modes">
          {MODES.map((m) => {
            const active = activeRoute === m.id;
            const isDecisions = m.id === "decisions";
            return (
              <li key={m.id}>
                <Link
                  href={m.href}
                  className="lab-rail-mode"
                  data-active={active ? "true" : undefined}
                  aria-current={active ? "page" : undefined}
                  onClick={(e) => {
                    setSurface("core");
                    setMode("live");
                    if (m.id === "my") {
                      e.preventDefault();
                      setMyView("catalog");
                      goMyCenter();
                    } else if (m.id === "decisions") {
                      e.preventDefault();
                      goDecisions();
                    } else if (m.id === "value") {
                      e.preventDefault();
                      goValue("verified");
                    } else if (m.id === "memory") {
                      e.preventDefault();
                      goMemory("playbook");
                    }
                  }}
                >
                  <span className="lab-rail-mark" aria-hidden="true">
                    {m.id === "center"
                      ? "◎"
                      : m.id === "decisions"
                        ? "◇"
                        : m.id === "my"
                          ? "▤"
                          : m.id === "value"
                            ? "€"
                            : "◈"}
                  </span>
                  <span className="lab-rail-label">{m.label}</span>
                  {isDecisions && needsCount > 0 ? (
                    <span className="lab-rail-badge">{needsCount}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="lab-rail-foot">
          <button
            type="button"
            className="lab-rail-cmd"
            aria-label="RADR command ⌘K"
            aria-expanded={nav.surface === "command"}
            onClick={() =>
              setSurface(nav.surface === "command" ? "core" : "command")
            }
          >
            <span className="lab-rail-cmd-orb" aria-hidden="true" />
            <span className="lab-rail-label">⌘K</span>
          </button>
        </div>
      </nav>

      {nav.surface === "command" ? (
        <div className="lab-cmd-layer" role="dialog" aria-label="RADR command">
          <button
            type="button"
            className="lab-cmd-scrim"
            aria-label="Close"
            onClick={() => {
              setSurface("core");
              setCmdOut(null);
            }}
          />
          <div className="lab-cmd-panel">
            <p className="lab-cmd-serif">What needs a decision</p>
            <p className="lab-cmd-kicker">
              {LAB_CANON.property} · ⌘K
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitCommand(cmd);
              }}
            >
              <input
                ref={inputRef}
                value={cmd}
                onChange={(e) => setCmd(e.target.value)}
                placeholder="tonight…"
                aria-label="RADR command"
              />
            </form>
            <div className="lab-cmd-chips">
              {COMMANDS.map((c) => (
                <button key={c} type="button" onClick={() => submitCommand(c)}>
                  {c}
                </button>
              ))}
            </div>
            <div className="lab-cmd-seeds">
              <p>Demo seed</p>
              <Link
                href={LAB_SEEDS.service.path}
                onClick={() => {
                  setSeed("service");
                  setSurface("core");
                }}
              >
                Service · Wait 12
              </Link>
              <Link
                href={LAB_SEEDS.recover.path}
                onClick={() => {
                  setSeed("recover");
                  setSurface("core");
                }}
              >
                Recover · AP credit
              </Link>
            </div>
            {cmdOut ? <p className="lab-cmd-out">{cmdOut}</p> : null}
            {state.mode !== "live" ? (
              <p className="lab-cmd-hint">
                {displayDecisionId(DECISION_IDS.peak)} · {state.mode}
              </p>
            ) : null}
            <button
              type="button"
              className="lab-cmd-service"
              onClick={() => {
                goService();
                setSurface("core");
              }}
            >
              Service map
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
