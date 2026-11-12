"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import { PLATFORM_GALLERY, PLATFORM_GALLERY_REVISION } from "@/lib/marketing/platformGallery";
import { Link } from "@/i18n/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { TourArrow } from "./PlatformTourIcons";
import "./platform-sneak-peek.css";

const PEEKS = PLATFORM_GALLERY.map((frame) => ({
  ...frame,
  label: frame.caption.split(". ")[0],
}));

/** A small, passive film. The only interaction is the link to the demo. */
export function PlatformWorkspaceShowcase() {
  return (
    <Suspense fallback={<PlatformWorkspaceFilm requested={null} />}>
      <RequestedPlatformFilm />
    </Suspense>
  );
}

function RequestedPlatformFilm() {
  const params = useSearchParams();
  const requested = params.get("surface");
  return (
    <PlatformWorkspaceFilm key={requested || "control"} requested={requested} />
  );
}

function PlatformWorkspaceFilm({ requested }: { requested: string | null }) {
  const [slide, setSlide] = useState(() =>
    Math.max(
      0,
      PEEKS.findIndex((peek) => peek.surface === requested),
    ),
  );
  const [previous, setPrevious] = useState<number | null>(null);
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const frame = useRef<HTMLElement>(null);
  const current = PEEKS[slide]!;
  const imageReady = loadedImage === current.image;
  const activeImage = useRef(current.image);
  activeImage.current = current.image;

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!!entry?.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(node);
    const sync = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  useEffect(() => {
    if (!visible || reduced || !pageVisible || !imageReady) return;
    const timer = window.setTimeout(() => {
      setPrevious(slide);
      setSlide((slide + 1) % PEEKS.length);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [slide, reduced, visible, pageVisible, imageReady]);

  return (
    <section
      id="surfaces"
      className="rx30-connect ps-teaser-section"
      data-nav-theme="light"
      aria-labelledby="ps-teaser-title"
    >
      <div className="rx30-shell">
        <div className="ps-teaser">
          <div className="ps-teaser-copy">
            <p className="rx30-kicker">03 · Inside the platform</p>
            <h2 id="ps-teaser-title">A glimpse inside RADR.</h2>
            <p className="ps-teaser-lead">
              The operating brief. Your rooms and tables. The next decision.
              Here is a taste of what is inside.
            </p>
            <p className="ps-teaser-invite">
              Want the full picture? Choose a hotel or restaurant demo and sign
              up to explore it for yourself.
            </p>
            <Link className="ps-teaser-cta" href="/demo">
              Explore the demo{" "}
              <span aria-hidden="true">
                <TourArrow />
              </span>
            </Link>
          </div>
          <figure
            ref={frame}
            className="ps-teaser-frame"
            aria-label="RADR product sneak peek"
            data-slide={slide}
            data-surface={current.surface}
          >
            <div className="ps-teaser-chrome" aria-hidden="true">
              <span>
                <FrozenRadrLogo
                  variant="mark"
                  theme="light"
                  width={19}
                  decorative
                />{" "}
                INSIDE RADR
              </span>
              <span className="ps-teaser-badge">
                <i /> SNEAK PEEK
              </span>
            </div>
            <div className="ps-teaser-media" data-ready={imageReady}>
              {!imageReady && previous === null ? (
                <span className="ps-teaser-loading" role="status">
                  A closer look at RADR
                </span>
              ) : null}
              {previous !== null && previous !== slide ? (
                <Image
                  className="ps-teaser-previous"
                  src={`/platform-showcase/${PEEKS[previous]!.image}.webp?v=${PLATFORM_GALLERY_REVISION}`}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 90vw, 680px"
                  aria-hidden="true"
                  draggable={false}
                />
              ) : null}
              <Image
                key={current.image}
                className="ps-teaser-current"
                style={{
                  animationPlayState: imageReady ? "running" : "paused",
                }}
                onLoad={() => {
                  if (activeImage.current === current.image)
                    setLoadedImage(current.image);
                }}
                src={`/platform-showcase/${current.image}.webp?v=${PLATFORM_GALLERY_REVISION}`}
                alt={current.alt}
                fill
                sizes="(max-width: 760px) 90vw, 680px"
                priority={slide === 0}
                draggable={false}
              />
            </div>
            <figcaption className="ps-teaser-caption" aria-live="off">
              <span>{current.label}</span>
              <small>Product preview</small>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
