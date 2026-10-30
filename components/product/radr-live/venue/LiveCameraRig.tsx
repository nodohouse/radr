"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import * as THREE from "three";
import {
  VENUE_OVERVIEW_CAM,
  focusCameraForZone,
  type VenueZoneKind,
} from "@/lib/radr/spatial-live/venueLayout";

type Props = {
  focusKind: VenueZoneKind | null;
  /** Subtle hover parallax offset in world space. */
  hoverKind?: VenueZoneKind | null;
};

/**
 * Cinematic camera — overview frames the full restaurant;
 * zone select runs a ~620ms weighted ease (accel → settle).
 */
export function LiveCameraRig({ focusKind, hoverKind = null }: Props) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(...VENUE_OVERVIEW_CAM.target));
  const pos = useRef(new THREE.Vector3(...VENUE_OVERVIEW_CAM.position));
  const parallax = useRef(new THREE.Vector3());
  const targetParallax = useRef(new THREE.Vector3());
  const overviewTarget = useRef(new THREE.Vector3(...VENUE_OVERVIEW_CAM.target));
  const lookScratch = useRef(new THREE.Vector3());
  const fitted = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.fov = VENUE_OVERVIEW_CAM.fov;
    camera.aspect = size.width / Math.max(1, size.height);
    camera.updateProjectionMatrix();
    if (!fitted.current) {
      pos.current.set(...VENUE_OVERVIEW_CAM.position);
      look.current.set(...VENUE_OVERVIEW_CAM.target);
      camera.position.copy(pos.current);
      camera.lookAt(look.current);
      fitted.current = true;
    }
  }, [camera, size.width, size.height]);

  const destination = useMemo(() => {
    if (focusKind) return focusCameraForZone(focusKind);
    return {
      position: [...VENUE_OVERVIEW_CAM.position] as [number, number, number],
      target: [...VENUE_OVERVIEW_CAM.target] as [number, number, number],
    };
  }, [focusKind]);

  useEffect(() => {
    tweenRef.current?.kill();
    const fromPos = pos.current.clone();
    const fromLook = look.current.clone();
    const toPos = new THREE.Vector3(...destination.position);
    const toLook = new THREE.Vector3(...destination.target);
    const state = { t: 0 };

    tweenRef.current = gsap.to(state, {
      t: 1,
      duration: focusKind ? 0.68 : 0.58,
      ease: "power3.inOut",
      onUpdate: () => {
        pos.current.lerpVectors(fromPos, toPos, state.t);
        look.current.lerpVectors(fromLook, toLook, state.t);
      },
    });

    return () => {
      tweenRef.current?.kill();
    };
  }, [destination, focusKind]);

  useFrame((_, dt) => {
    if (hoverKind && !focusKind) {
      const focus = focusCameraForZone(hoverKind);
      targetParallax.current
        .set(focus.target[0], 0, focus.target[2])
        .sub(overviewTarget.current)
        .multiplyScalar(0.045);
    } else {
      targetParallax.current.set(0, 0, 0);
    }
    parallax.current.lerp(targetParallax.current, 1 - Math.exp(-6 * dt));

    camera.position.copy(pos.current).add(parallax.current);
    lookScratch.current.copy(look.current).add(parallax.current);
    camera.lookAt(lookScratch.current);
  });

  return null;
}
