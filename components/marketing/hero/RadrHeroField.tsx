"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  type MotionValue,
} from "motion/react";
import {
  ACCUMULATOR_BASE,
  ACCUMULATOR_CAP,
  type DeltaSpec,
} from "@/lib/radr/deltaFieldData";
import { ValueOnRadr, type ValueOnRadrHandle } from "./ValueOnRadr";
import { RadarRings } from "./RadarRings";
import { RadarBeam } from "./RadarBeam";
import { DeltaField } from "./DeltaField";
import { HeroDataNet, type HeroDataNetHandle } from "./HeroDataNet";

type Props = {
  onFirstDetect?: () => void;
  rainOpacity?: MotionValue<number>;
  radarOpacity?: MotionValue<number>;
  beamOpacity?: MotionValue<number>;
  netOpacity?: MotionValue<number>;
  valueOpacity?: MotionValue<number>;
};

/**
 * Hero field shell. Visibility pauses work via refs/DOM. IntersectionObserver
 * does not re-render the radar/beam/rings tree.
 */
export function RadrHeroField({
  onFirstDetect,
  rainOpacity,
  radarOpacity,
  beamOpacity,
  netOpacity,
  valueOpacity,
}: Props) {
  const reduced = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(true);
  const resumeField = useRef<(() => void) | null>(null);
  const valueApi = useRef<ValueOnRadrHandle | null>(null);
  const netApi = useRef<HeroDataNetHandle | null>(null);
  const [value, setValue] = useState(ACCUMULATOR_BASE);
  const rainOpRef = useRef(1);
  const flashTimer = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const applyActive = (on: boolean) => {
      activeRef.current = on;
      el.dataset.active = on ? "true" : "false";
      const beam = el.querySelector(".rx-beam-wrap") as HTMLElement | null;
      if (beam) beam.dataset.static = !on || reduced ? "true" : "false";
      netApi.current?.setPaused(!on || reduced);
      if (on) resumeField.current?.();
    };

    applyActive(true);

    const io = new IntersectionObserver(
      ([entry]) => applyActive(Boolean(entry?.isIntersecting)),
      { rootMargin: "10% 0px", threshold: 0.02 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (flashTimer.current) window.clearTimeout(flashTimer.current);
    };
  }, [reduced]);

  useEffect(() => {
    if (!rainOpacity) return;
    rainOpRef.current = rainOpacity.get();
    return rainOpacity.on("change", (v) => {
      rainOpRef.current = v;
    });
  }, [rainOpacity]);

  const handleFirstDetect = useCallback(() => {
    onFirstDetect?.();
  }, [onFirstDetect]);

  const onLand = useCallback((spec: DeltaSpec) => {
    if (!spec.material || spec.captureEuro <= 0) return;
    setValue((v) => Math.min(ACCUMULATOR_CAP, v + spec.captureEuro));
    valueApi.current?.pulseCapture(spec.captureEuro);
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => {
      valueApi.current?.clearFlash();
      flashTimer.current = 0;
    }, 420);
  }, []);

  return (
    <div
      ref={rootRef}
      className="rx-hf"
      data-mode="lock"
      data-active="true"
      aria-hidden={reduced ? undefined : true}
    >
      <div className="rx-hf-atm" aria-hidden="true">
        <div className="rx-hf-atm-radar" />
        <div className="rx-hf-atm-horizon" />
      </div>

      <DeltaField
        activeRef={activeRef}
        resumeRef={resumeField}
        reduced={reduced}
        rainOpacityRef={rainOpRef}
        onLand={onLand}
        onFirstDetect={handleFirstDetect}
      />

      <motion.div
        className="rx-hf-radar-layer"
        style={radarOpacity ? { opacity: radarOpacity } : undefined}
      >
        <RadarRings />
      </motion.div>

      <motion.div
        className="rx-hf-beam-layer"
        style={beamOpacity ? { opacity: beamOpacity } : undefined}
      >
        <RadarBeam reduced={reduced} />
      </motion.div>

      <motion.div
        className="rx-hf-net-layer"
        style={netOpacity ? { opacity: netOpacity } : undefined}
      >
        <HeroDataNet ref={netApi} reduced={reduced} />
      </motion.div>

      <motion.div
        className="rx-hf-value-layer"
        style={valueOpacity ? { opacity: valueOpacity } : undefined}
      >
        <ValueOnRadr ref={valueApi} value={value} />
      </motion.div>
    </div>
  );
}
