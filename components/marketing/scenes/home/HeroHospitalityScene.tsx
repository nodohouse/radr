"use client";

/**
 * Hero hospitality scene — one desktop + one phone.
 * Vertical switch changes Decision + context. Default = Restaurant Floor.
 * Within restaurant, phone slowly alternates VIP brief ↔ service recommend.
 */

import { useEffect, useState } from "react";
import NextLink from "next/link";
import {
  HospitalityContextSwitch,
} from "@/components/marketing/kinetic/HospitalityContextSwitch";
import {
  heroSceneFor,
  restaurantFloorSecondaryPhone,
  restaurantRecoverPhone,
  restaurantUrgentPhone,
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

type FloorPhone = 0 | 1 | 2 | 3;

export function HeroHospitalityScene() {
  const reduced = usePrefersReducedMotion();
  const [vertical, setVertical] = useState<HospitalityVertical>("restaurant");
  const [paused, setPaused] = useState(false);
  const [floorPhone, setFloorPhone] = useState<FloorPhone>(0);
  const scene = heroSceneFor(vertical);

  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setInterval(() => {
      setVertical((prev) => {
        const i = ROTATE.indexOf(prev);
        return ROTATE[(i + 1) % ROTATE.length]!;
      });
    }, 8000);
    return () => window.clearInterval(id);
  }, [reduced, paused]);

  useEffect(() => {
    if (reduced || paused || vertical !== "restaurant") return;
    const id = window.setInterval(() => {
      setFloorPhone((v) => ((v + 1) % 4) as FloorPhone);
    }, 7000);
    return () => window.clearInterval(id);
  }, [reduced, paused, vertical]);

  const phoneModel =
    vertical === "restaurant"
      ? floorPhone === 0
        ? scene.phone
        : floorPhone === 1
          ? restaurantFloorSecondaryPhone()
          : floorPhone === 2
            ? restaurantUrgentPhone()
            : restaurantRecoverPhone()
      : scene.phone;

  const phone: RadrPhoneState = {
    id: `${scene.vertical}-${vertical === "restaurant" ? floorPhone : "main"}`,
    role: phoneModel.role,
    badge: phoneModel.badge,
    title: phoneModel.title,
    body: phoneModel.body,
    meta: phoneModel.meta,
    primary: phoneModel.primary,
    tone: phoneModel.tone,
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
          setFloorPhone(0);
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
