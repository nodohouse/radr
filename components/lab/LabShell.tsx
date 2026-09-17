"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { PROPERTY } from "@/lib/lab/ids";
import { HEALTH, ROLE_LENSES } from "@/lib/lab/roles";
import { LabProvider, useLab } from "@/lib/lab/store";
import { DeltaMark } from "./DeltaMark";

const MODES = [
  { id: "center", label: "Center", href: "/app/lab/control-center", mark: "◎" },
  { id: "decisions", label: "Decisions", href: "/app/lab/decisions", mark: "◇" },
  { id: "my", label: "Catalog", href: "/app/lab/my-center", mark: "▤" },
  { id: "value", label: "Value", href: "/app/lab/value?band=verified", mark: "€" },
  { id: "memory", label: "Memory", href: "/app/lab/memory?scope=playbook", mark: "◈" },
] as const;

const COMMANDS = [
  "What needs me?",
  "Open recover",
  "Show D-1911",
  "Hotel pulse",
  "My Center",
  "Verified Value",
];

function Rail() {
  const { nav, state, setSurface, goDecisions, goCatalog, goValue, goMemory } = useLab();
  return (
    <nav className="lab-rail" aria-label="RADR modes">
      <Link href="/app/lab/control-center" className="lab-rail-brand" aria-label="RADR">
        <span className="lab-rail-brand-mark">
          <DeltaMark height={15} />
        </span>
      </Link>
      <ul className="lab-rail-modes">
        {MODES.map((m) => {
          const on = nav.route === m.id;
          return (
            <li key={m.id}>
              <Link
                href={m.href}
                className="lab-rail-mode"
                data-active={on || undefined}
                aria-current={on ? "page" : undefined}
                onClick={(e) => {
                  setSurface("core");
                  if (m.id === "my") {
                    e.preventDefault();
                    goCatalog();
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
                  {m.mark}
                </span>
                <span className="lab-rail-label">{m.label}</span>
                {m.id === "decisions" ? <span className="lab-rail-badge">5</span> : null}
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
          onClick={() => setSurface(nav.surface === "command" ? "core" : "command")}
        >
          <span className="lab-rail-cmd-orb" aria-hidden="true" />
          <span className="lab-rail-label">⌘K</span>
        </button>
        <p className="lab-rail-seed">{state.seed}</p>
      </div>
    </nav>
  );
}

function Topbar() {
  const { nav, state, setRole, setSeed, setSurface } = useLab();
  const [healthOpen, setHealthOpen] = useState(false);
  const hotel = state.seed === "hotel";
  const recover = state.seed === "recover";
  const property = hotel ? PROPERTY.hotel : PROPERTY.restaurant;
  const issues = HEALTH[state.seed];

  return (
    <header className="lab-topbar">
      <div className="lab-topbar-left">
        <span className="lab-topbar-loc">{property}</span>
        <span className="lab-topbar-sep">/</span>
        <span>{recover ? "Recover" : hotel ? "Arrivals" : "Dinner service"}</span>
        <span className="lab-topbar-time">{recover ? "11d" : "18:42"}</span>
        <span className="lab-topbar-live">Live</span>
      </div>
      <div className="lab-topbar-mid">
        <div className="lab-topbar-roles" role="tablist" aria-label="Role">
          {(Object.keys(ROLE_LENSES) as Array<keyof typeof ROLE_LENSES>).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={nav.role === id}
              data-on={nav.role === id ? "true" : undefined}
              onClick={() => setRole(id)}
            >
              {ROLE_LENSES[id].label}
            </button>
          ))}
        </div>
        <div className="lab-topbar-seeds">
          <button type="button" data-on={state.seed === "service" || undefined} onClick={() => setSeed("service")}>
            Wait-12
          </button>
          <button type="button" data-on={hotel || undefined} onClick={() => setSeed("hotel")}>
            Hotel
          </button>
          <button type="button" data-on={recover || undefined} onClick={() => setSeed("recover")}>
            Recover
          </button>
        </div>
      </div>
      <div className="lab-topbar-right">
        <button type="button" className="lab-topbar-search" onClick={() => setSurface("command")}>
          Search decisions
          <kbd>⌘K</kbd>
        </button>
        <button
          type="button"
          className="lab-topbar-health"
          aria-expanded={healthOpen}
          onClick={() => setHealthOpen((v) => !v)}
        >
          1 degraded · 1 stale
        </button>
        {healthOpen ? (
          <div className="lab-topbar-health-panel" role="status">
            {issues.map((issue) => (
              <p key={issue.source}>
                <strong>
                  {issue.kind === "degraded" ? "Degraded" : "Stale"} · {issue.source}
                </strong>{" "}
                — {issue.detail}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function CommandPalette() {
  const { nav, setSurface, setSeed, runCommand, goCenter } = useLab();
  const [q, setQ] = useState("");
  const [out, setOut] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (nav.surface !== "command") return;
    const t = window.setTimeout(() => input.current?.focus(), 40);
    return () => clearTimeout(t);
  }, [nav.surface]);

  if (nav.surface !== "command") return null;

  const run = (value: string) => {
    const result = runCommand(value);
    setOut(result);
    setQ("");
    setSurface("core");
  };

  return (
    <div className="lab-cmd-layer" role="dialog" aria-label="RADR command">
      <button type="button" className="lab-cmd-scrim" aria-label="Close" onClick={() => setSurface("core")} />
      <div className="lab-cmd-panel">
        <p className="lab-cmd-serif">What needs a decision</p>
        <p className="lab-cmd-kicker">Berlin Mitte · ⌘K</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(q);
          }}
        >
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="tonight…"
            aria-label="RADR command"
          />
        </form>
        <div className="lab-cmd-chips">
          {COMMANDS.map((c) => (
            <button key={c} type="button" onClick={() => run(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="lab-cmd-seeds">
          <p>Demo seed</p>
          <button type="button" onClick={() => { setSeed("service"); setSurface("core"); }}>
            Service · Wait 12
          </button>
          <button type="button" onClick={() => { setSeed("hotel"); setSurface("core"); }}>
            Hotel · orphan nights
          </button>
          <button type="button" onClick={() => { setSeed("recover"); setSurface("core"); }}>
            Recover · AP credit
          </button>
        </div>
        {out ? <p className="lab-cmd-out">{out}</p> : null}
        <button type="button" className="lab-cmd-service" onClick={() => { goCenter(); setSurface("core"); }}>
          Back to Center
        </button>
      </div>
    </div>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const { nav, state, setSurface } = useLab();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSurface(nav.surface === "command" ? "core" : "command");
      }
      if (e.key === "Escape") setSurface("core");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nav.surface, setSurface]);

  return (
    <div
      className="lab-app lab-root lab-shell"
      data-mode={state.mode}
      data-route={nav.route}
      data-seed={state.seed}
      data-role={nav.role}
    >
      <Rail />
      <div className="lab-shell-main">
        <Topbar />
        <div className="lab-workspace">{children}</div>
      </div>
      <CommandPalette />
    </div>
  );
}

export function LabShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="lab-app lab-root lab-shell lab-shell-loading">
          <p>Loading Control Center…</p>
        </div>
      }
    >
      <LabProvider>
        <ShellFrame>{children}</ShellFrame>
      </LabProvider>
    </Suspense>
  );
}
