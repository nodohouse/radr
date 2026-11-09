"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  IconCenter,
  IconLive,
  IconDecisions,
  IconService,
  IconHouse,
  IconIntelligence,
  IconValue,
  IconMemory,
  IconHealth,
  IconConnections,
} from "@/components/product/shell/navIcons";
import {
  PlatformSurfacePreview,
  type SurfaceId,
} from "./PlatformSurfacePreview";
import "./platform-workspace.css";
import { TourArrow } from "./PlatformTourIcons";

const SURFACES = [
  {
    id: "control",
    label: "Control Center",
    icon: IconCenter,
    title: "What needs you, in focus.",
    body: "See the priority, the evidence behind it and the next decision to review.",
  },
  {
    id: "live",
    label: "Live",
    icon: IconLive,
    title: "The detail behind every decision.",
    body: "Guest needs, service pressure and the next arrival, connected to the operation.",
  },
  {
    id: "decisions",
    label: "Decisions",
    icon: IconDecisions,
    title: "A clear call. A reason behind it.",
    body: "Compare the options, understand the economics and review the recommendation.",
  },
  {
    id: "operations",
    label: "Operations",
    icon: IconService,
    title: "Understand what the next wave needs.",
    body: "Bring service capacity, staffing and room readiness into the same decision.",
  },
  {
    id: "house",
    label: "Back of House",
    icon: IconHouse,
    title: "Bring field evidence into the picture.",
    body: "Explore how observations and readiness checks support the operating model.",
  },
  {
    id: "intelligence",
    label: "Intelligence",
    icon: IconIntelligence,
    title: "Find the connection behind the number.",
    body: "See how demand, capacity and contribution shape the next decision.",
  },
  {
    id: "value",
    label: "Value",
    icon: IconValue,
    title: "Keep the expectation and the proof separate.",
    body: "Follow the evidence from an expected effect to a reviewed economic outcome.",
  },
  {
    id: "memory",
    label: "Memory",
    icon: IconMemory,
    title: "Keep what the operation teaches you.",
    body: "Comparable evidence builds a stronger foundation for the next decision.",
  },
  {
    id: "health",
    label: "Data Health",
    icon: IconHealth,
    title: "Know how much to trust the call.",
    body: "Explore how evidence freshness changes confidence and the allowed response.",
  },
  {
    id: "connections",
    label: "Connections",
    icon: IconConnections,
    title: "Your systems. One evidence layer.",
    body: "Understand source readiness, freshness and permissions before relying on a decision.",
  },
] satisfies {
  id: SurfaceId;
  label: string;
  icon: typeof IconCenter;
  title: string;
  body: string;
}[];

function readSurface(): SurfaceId {
  const value = new URLSearchParams(window.location.search).get("surface");
  return SURFACES.find((surface) => surface.id === value)?.id || "control";
}

export function PlatformWorkspaceShowcase() {
  const [selected, setSelected] = useState<SurfaceId>("control");
  const rail = useRef<HTMLElement>(null);
  const active = SURFACES.find((surface) => surface.id === selected)!;
  useEffect(() => {
    const sync = () => setSelected(readSurface());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  function select(id: SurfaceId) {
    setSelected(id);
    const url = new URL(window.location.href);
    url.searchParams.set("surface", id);
    window.history.replaceState(null, "", url);
  }
  function navigate(event: KeyboardEvent<HTMLElement>) {
    const direction = ["ArrowRight", "ArrowDown"].includes(event.key)
      ? 1
      : ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : 0;
    if (!direction && !["Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = SURFACES.findIndex((surface) => surface.id === selected);
    const next =
      SURFACES[
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? SURFACES.length - 1
            : (index + direction + SURFACES.length) % SURFACES.length
      ]!;
    select(next.id);
    rail.current
      ?.querySelector<HTMLButtonElement>(`#surface-tab-${next.id}`)
      ?.focus();
  }
  return (
    <section
      id="surfaces"
      className="rx30-connect psw-section"
      data-nav-theme="light"
      aria-labelledby="psw-title"
    >
      <div className="rx30-shell">
        <div className="psw-intro">
          <div>
            <p className="rx30-kicker">03 · Inside the platform</p>
            <h2 id="psw-title">
              Your operation.
              <br />
              <em>One connected picture.</em>
            </h2>
          </div>
          <div>
            <p>
              Start with what needs you. Move from the operation to its
              evidence, decisions and results.
            </p>
            <Link href="/demo">
              Explore the interactive demos{" "}
              <span aria-hidden="true">
                <TourArrow />
              </span>
            </Link>
          </div>
        </div>
        <div className="psw-workspace">
          <div className="psw-chrome">
            <div>
              <FrozenRadrLogo
                variant="mark"
                theme="dark"
                width={24}
                decorative
              />
              <span>THE CONNECTED WORKSPACE</span>
            </div>
            <span className="psw-demo-badge">
              <i />
              Demo data
            </span>
          </div>
          <div className="psw-layout">
            <aside className="psw-sidebar">
              <span className="psw-nav-label">Explore the platform</span>
              <nav
                ref={rail}
                className="psw-nav"
                role="tablist"
                aria-label="Explore the product surfaces"
                aria-orientation="vertical"
                onKeyDown={navigate}
              >
                {SURFACES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    id={`surface-tab-${id}`}
                    type="button"
                    role="tab"
                    aria-controls="surface-preview"
                    aria-selected={selected === id}
                    tabIndex={selected === id ? 0 : -1}
                    onClick={() => select(id)}
                  >
                    <Icon />
                    <span>{label}</span>
                    <b aria-hidden="true">
                      <TourArrow />
                    </b>
                  </button>
                ))}
              </nav>
              <div className="psw-sidebar-note">
                <i />
                <strong>One operating model.</strong>
                <p>
                  Follow the context from a signal to a decision and its
                  outcome.
                </p>
              </div>
            </aside>
            <label className="psw-mobile-select">
              <span>Explore the platform</span>
              <select
                aria-label="Choose a product surface"
                value={selected}
                onChange={(event) => select(event.target.value as SurfaceId)}
              >
                {SURFACES.map((surface) => (
                  <option key={surface.id} value={surface.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="psw-main"
              id="surface-preview"
              role="tabpanel"
              aria-labelledby={`surface-tab-${selected}`}
              tabIndex={0}
              data-surface={selected}
            >
              <header className="psw-panel-head">
                <span>{active.label}</span>
                <h3>{active.title}</h3>
                <p>{active.body}</p>
              </header>
              <div className="psw-screen">
                <PlatformSurfacePreview surface={selected} />
              </div>
              <footer className="psw-panel-footer">
                <span>
                  <i />
                  Evidence stays connected.
                </span>
                <Link href="/demo">
                  Explore the full product{" "}
                  <span aria-hidden="true">
                    <TourArrow />
                  </span>
                </Link>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
