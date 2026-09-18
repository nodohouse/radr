"use client";

/**
 * Hero hospitality scene — one desktop + one phone.
 * Vertical switch changes Decision + context. Default = Restaurant Floor.
 */

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  HospitalityContextSwitch,
} from "@/components/marketing/kinetic/HospitalityContextSwitch";
import {
  heroSceneFor,
  type HospitalityVertical,
} from "@/lib/marketing/hospitalityContext";
import {
  RadrPhone,
  type RadrPhoneState,
} from "@/components/marketing/scenes/home/RadrPhone";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";

const ROTATE: HospitalityVertical[] = [
  "restaurant",
  "hotel",
  "serviced_apartment",
];

export function HeroHospitalityScene() {
  const reduced = usePrefersReducedMotion();
  const [vertical, setVertical] = useState<HospitalityVertical>("restaurant");
  const [paused, setPaused] = useState(false);
  const scene = heroSceneFor(vertical);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setVertical((prev) => {
        const i = ROTATE.indexOf(prev);
        return ROTATE[(i + 1) % ROTATE.length]!;
      });
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduced, paused]);

  const phone: RadrPhoneState = {
    id: scene.vertical,
    role: scene.phone.role,
    badge: scene.phone.badge,
    title: scene.phone.title,
    body: scene.phone.body,
    meta: scene.phone.meta,
    primary: scene.phone.primary,
    tone: scene.phone.tone,
  };

  return (
    <div
      className="rx-hrs rx-hrs-hosp"
      data-vertical={vertical}
      onPointerDown={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
    >
      <HospitalityContextSwitch
        value={vertical}
        onChange={(v) => {
          setPaused(true);
          setVertical(v);
        }}
        size="hero"
      />

      <div className="rx-hrs-desktop">
        <header className="rx-hrs-head">
          <p className="rx-hrs-k">{scene.desktop.kicker}</p>
          <p className="rx-hrs-id">{scene.desktop.idLine}</p>
        </header>

        <h2 className="rx-hrs-title">{scene.desktop.title}</h2>

        <button type="button" className="rx-hrs-euro" data-grade={scene.desktop.grade}>
          <strong>{scene.desktop.euro}</strong>
          <span>{scene.desktop.grade}</span>
        </button>

        <p className="rx-hrs-because">{scene.desktop.action}</p>
        <p className="rx-hrs-note">{scene.desktop.because}</p>

        <p className="rx-hrs-demo">Illustrative demo · not customer results</p>
      </div>

      <RadrPhone state={phone} highlight className="rx-hrs-phone" />

      <NextLink href="/product/floor" className="rx-hrs-floor-link">
        Explore RADR Floor <span aria-hidden="true">→</span>
      </NextLink>
    </div>
  );
}
