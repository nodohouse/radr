"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { LabProvider, useLab } from "./LabContext";
import { LabModeRail } from "./LabModeRail";
import { LAB_CANON, isFinanceSeed } from "./labState";
import { LAB_SEEDS } from "./labLineage";
import { ROLE_PRESETS, type CenterRole } from "./labModules";

function LabTopBar() {
  const { nav, state, setSurface, setSeed, setRole, setIndustry } = useLab();
  const [healthOpen, setHealthOpen] = useState(false);
  const recover = isFinanceSeed(state.seed);
  const twoSite = state.seed === "margin-response";

  return (
    <header className="lab-topbar">
      <div className="lab-topbar-left">
        <span className="lab-topbar-loc">{LAB_CANON.property}</span>
        <span className="lab-topbar-sep">/</span>
        <span>
          {twoSite
            ? "Margin Response"
            : recover
              ? "Recover"
              : nav.industry === "hotel"
                ? "Arrivals"
                : "Dinner service"}
        </span>
        <span className="lab-topbar-time">
          {twoSite ? "Expected" : recover ? "Sealed" : LAB_CANON.now}
        </span>
        <span className="lab-topbar-live">Live</span>
      </div>

      <div className="lab-topbar-mid">
        <div className="lab-topbar-roles" role="tablist" aria-label="Role">
          {(Object.keys(ROLE_PRESETS) as CenterRole[]).map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={nav.role === r}
              data-on={nav.role === r ? "true" : undefined}
              onClick={() => setRole(r)}
            >
              {ROLE_PRESETS[r].label}
            </button>
          ))}
        </div>
        <div className="lab-topbar-seeds">
          <Link
            href={LAB_SEEDS.service.path}
            data-on={!recover ? "true" : undefined}
            onClick={() => setSeed("service")}
          >
            Wait-12
          </Link>
          <Link
            href={LAB_SEEDS.recover.path}
            data-on={state.seed === "recover" ? "true" : undefined}
            onClick={() => setSeed("recover")}
          >
            Credit
          </Link>
          <Link
            href={LAB_SEEDS.marginResponse.path}
            data-on={twoSite ? "true" : undefined}
            onClick={() => setSeed("margin-response")}
          >
            Two-site
          </Link>
        </div>
        <div className="lab-topbar-seeds" role="tablist" aria-label="Industry">
          <button
            type="button"
            data-on={nav.industry === "restaurant" ? "true" : undefined}
            onClick={() => setIndustry("restaurant")}
          >
            Restaurant
          </button>
          <button
            type="button"
            data-on={nav.industry === "hotel" ? "true" : undefined}
            onClick={() => setIndustry("hotel")}
          >
            Hotel
          </button>
        </div>
      </div>

      <div className="lab-topbar-right">
        <button
          type="button"
          className="lab-topbar-search"
          onClick={() => setSurface("command")}
        >
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
            {recover ? (
              <>
                <p>
                  <strong>Degraded · AP sync</strong> — lag ~2h. Invoices still
                  match last good pull.
                </p>
                <p>
                  {twoSite ? (
                    <>
                      <strong>Expected · Two-site gap</strong> — €410 Expected
                      until CM + doc_ref seals.
                    </>
                  ) : (
                    <>
                      <strong>Sealed · Trace</strong> — €273 Verified =
                      CM-44102 applied_amount · book-matchable.
                    </>
                  )}
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Degraded · Delivery</strong> — intake delayed ~4m.
                </p>
                <p>
                  <strong>Stale · Walk-in mix</strong> — €620 stays Expected,
                  not Verified.
                </p>
              </>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function LabShellInner({ children }: { children: ReactNode }) {
  const { nav, state } = useLab();

  return (
    <div
      className="lab-root lab-shell lab-shell-sand lab-shell-rail"
      data-mode={state.mode}
      data-route={nav.route}
      data-surface={nav.surface}
      data-seed={state.seed}
      data-role={nav.role}
    >
      <LabModeRail />
      <div className="lab-shell-main">
        <LabTopBar />
        <div className="lab-workspace" key={`${nav.route}-${state.seed}-${nav.role}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function LabShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="lab-root lab-shell lab-shell-sand lab-shell-loading">
          <p>Loading Control Center…</p>
        </div>
      }
    >
      <LabProvider>
        <LabShellInner>{children}</LabShellInner>
      </LabProvider>
    </Suspense>
  );
}
