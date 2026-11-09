"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import {
  PLATFORM_GALLERY,
  type PlatformSurfaceId as SurfaceId,
} from "@/lib/marketing/platformGallery";
import { demoSignupHref } from "@/lib/marketing/demoAccess";
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
  const [slide, setSlide] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const workspace = useRef<HTMLDivElement>(null);
  const current = PLATFORM_GALLERY[slide]!;
  const imageReady = loadedImage === current.image;
  const activeImage = useRef<string>(current.image);
  activeImage.current = current.image;
  const selected = current.surface;
  const signup = demoSignupHref();
  const rail = useRef<HTMLElement>(null);
  const active = SURFACES.find((surface) => surface.id === selected)!;
  useEffect(() => {
    const sync = () => {
      setSlide(
        Math.max(
          0,
          PLATFORM_GALLERY.findIndex(
            (frame) => frame.surface === readSurface(),
          ),
        ),
      );
      setPrevious(null);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  useEffect(() => {
    const node = workspace.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || reduced || !pageVisible) return;
    const timer = window.setTimeout(() => {
      if (!document.hidden) {
        setPrevious(slide);
        setSlide((slide + 1) % PLATFORM_GALLERY.length);
      }
    }, 6200);
    return () => window.clearTimeout(timer);
  }, [slide, reduced, visible, pageVisible]);
  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);
  function select(id: SurfaceId) {
    const next = PLATFORM_GALLERY.findIndex((frame) => frame.surface === id);
    if (next === slide) return;
    setPrevious(slide);
    setSlide(
      Math.max(
        0,
        PLATFORM_GALLERY.findIndex((frame) => frame.surface === id),
      ),
    );
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
              A closer look at RADR. See the operating brief, the evidence
              behind it and the decisions that follow.
            </p>
            <Link href={signup}>
              Sign up to explore the demos{" "}
              <span aria-hidden="true">
                <TourArrow />
              </span>
            </Link>
          </div>
        </div>
        <div className="psw-workspace" ref={workspace} data-preview="images">
          <div className="psw-chrome">
            <div>
              <FrozenRadrLogo
                variant="mark"
                theme="dark"
                width={24}
                decorative
              />
              <span>INSIDE RADR</span>
            </div>
            <span className="psw-demo-badge">
              <i />
              Product preview
            </span>
          </div>
          <div className="psw-layout">
            <aside className="psw-sidebar">
              <span className="psw-nav-label">Inside the platform</span>
              <nav
                ref={rail}
                className="psw-nav"
                role="tablist"
                aria-label="Choose a product preview"
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
                <strong>See it here. Explore it in your demo.</strong>
                <p>
                  Screens from fictional operations. Sign up for hands-on access
                  to the full workflow.
                </p>
              </div>
            </aside>
            <label className="psw-mobile-select">
              <span>Choose a preview</span>
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
              <div
                className="psw-gallery"
                aria-label="RADR product image showcase"
                aria-live="off"
                data-slide={slide}
              >
                <div className="psw-gallery-media" data-ready={imageReady}>
                  {!imageReady && previous === null ? (
                    <span className="psw-gallery-loading" role="status">
                      Opening the product preview
                    </span>
                  ) : null}
                  {previous !== null && previous !== slide ? (
                    <Image
                      className="psw-gallery-previous"
                      src={`/platform-showcase/${PLATFORM_GALLERY[previous]!.image}.webp`}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 90vw, 1200px"
                      aria-hidden="true"
                    />
                  ) : null}
                  <Image
                    key={current.image}
                    className="psw-gallery-current"
                    style={{
                      animationPlayState: imageReady ? "running" : "paused",
                    }}
                    onLoad={() => {
                      if (activeImage.current === current.image)
                        setLoadedImage(current.image);
                    }}
                    src={`/platform-showcase/${current.image}.webp`}
                    alt={current.alt}
                    fill
                    sizes="(max-width: 760px) 90vw, (min-width: 2200px) 1600px, 1200px"
                    priority={slide === 0}
                  />
                </div>
                <div className="psw-gallery-caption">
                  <p>{current.caption}</p>
                  <span
                    aria-label={`Image ${slide + 1} of ${PLATFORM_GALLERY.length}`}
                  >
                    {String(slide + 1).padStart(2, "0")} <i>/</i>{" "}
                    {String(PLATFORM_GALLERY.length).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <footer className="psw-panel-footer">
                <span>
                  <i />
                  Ready to make it your own?
                </span>
                <Link href={signup}>
                  Get demo access{" "}
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
