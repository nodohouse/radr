"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";
import { ProductBriefPreview } from "./ProductBriefPreview";
import { ValueCaptureField } from "./ValueCaptureField";
import "./scroll-tablet.css";
import { Link } from "@/i18n/navigation";

/** Native-scroll turn with two real, non-mirrored faces. No scroll capture or pinning. */
export function ScrollTabletShowcase() {
  const stage = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  const [ready, setReady] = useState(false);
  const [moving, setMoving] = useState(false);
  const [back, setBack] = useState(false);
  const [manualBack, setManualBack] = useState(false);
  const previousBack = useRef(false);
  const reduced = useReducedMotionSafe();
  const { scrollY } = useScroll();
  const target = useTransform(scrollY, [start, start + 240], [0, 1], {
    clamp: true,
  });
  const progress = useSpring(target, {
    stiffness: 105,
    damping: 27,
    restDelta: 0.0005,
  });
  const rotateY = useTransform(progress, [0, 1], [-6, 180]);
  const rotateX = useTransform(progress, [0, 0.5, 1], [3, 10, 0]);
  const rotateZ = useTransform(progress, [0, 0.5, 1], [1, -8, -1]);
  const y = useTransform(progress, [0, 1], [0, 140]);
  const scale = useTransform(progress, [0, 0.5, 1], [1, 0.92, 0.97]);
  const showingBack = ready && reduced ? manualBack : back;
  const stationary = !ready || reduced === true;

  useMotionValueEvent(progress, "change", (value) => {
    const next = value >= 0.52;
    if (next !== previousBack.current) {
      previousBack.current = next;
      setBack(next);
    }
  });
  useEffect(() => {
    setReady(true);
    const measure = () => {
      const node = stage.current;
      if (node)
        setStart(
          Math.max(
            0,
            node.getBoundingClientRect().top +
              window.scrollY -
              window.innerHeight * 0.3,
          ),
        );
    };
    measure();
    let visible = false;
    const syncMotion = () => setMoving(visible && !document.hidden);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncMotion();
    });
    if (stage.current) visibility.observe(stage.current);
    document.addEventListener("visibilitychange", syncMotion);
    const observer = new ResizeObserver(measure);
    if (stage.current) observer.observe(stage.current);
    window.addEventListener("resize", measure);
    document.fonts.ready.then(measure);
    return () => {
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div
      ref={stage}
      className="rm-hero-product rsc-scroll-stage"
      data-face={showingBack ? "back" : "front"}
      data-ready={ready || undefined}
      data-moving={moving}
    >
      <ValueCaptureField moving={moving} reduced={reduced === true} />
      <motion.div
        className="rsc-flip-rig"
        style={
          stationary
            ? {
                rotateY: showingBack ? 180 : 0,
                rotateX: 0,
                rotateZ: 0,
                y: 0,
                scale: 1,
              }
            : { rotateY, rotateX, rotateZ, y, scale }
        }
      >
        <div
          className="rsc-face rsc-face-front"
          aria-hidden={showingBack}
          inert={showingBack}
        >
          <ProductBriefPreview active={!showingBack} />
        </div>
        <div
          className="rsc-face rsc-face-back"
          aria-hidden={!showingBack}
          inert={!showingBack}
        >
          <ProductBriefPreview variant="operations" active={showingBack} />
        </div>
      </motion.div>
      {ready && reduced && (
        <button
          className="rsc-reduced-switch"
          type="button"
          onClick={() => setManualBack((v) => !v)}
        >
          {showingBack ? "Show decision view" : "Show the operating view"}
          <span aria-hidden="true">↗</span>
        </button>
      )}
      <Link href="/demo" className="rsc-full-demo">
        Explore the full-size demo →
      </Link>
      <span className="rsc-turn-cue" aria-hidden="true">
        {showingBack
          ? "The operation behind the decision"
          : "Scroll to see the other side"}
        <i />
      </span>
    </div>
  );
}
