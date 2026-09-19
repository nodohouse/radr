"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type MutableRefObject,
} from "react";
import {
  BEAM_PERIOD_MS,
  BEAM_START_DEG,
  RADAR_ORIGIN,
  type DeltaSpec,
} from "@/lib/radr/deltaFieldData";
import { RadrDeltaGlyph } from "@/components/radr/RadrDeltaGlyph";
import {
  MAX_VISIBLE_CONTACTS,
  MIN_SCAN_COUNT,
  SIGNAL_SLOT_COUNT,
  SPAWN_WINDOW_START,
  angleDistance,
  desiredNewContacts,
  fadeInMs,
  fadeOutMs,
  landSpec,
  minTrackMs,
  pickContent,
  pickPlacement,
  planSpawnProgresses,
  restingBase,
  signalAngleDeg,
  trackConfidence,
  trackLifetimeMs,
  type ContactContent,
} from "./heroSignals";

type Props = {
  /** Shared visibility flag: mutated by parent IO, no React re-renders. */
  activeRef: MutableRefObject<boolean>;
  /** Parent assigns a kick function to resume RAF after pause. */
  resumeRef: MutableRefObject<(() => void) | null>;
  reduced: boolean;
  rainOpacityRef: MutableRefObject<number>;
  onLand: (spec: DeltaSpec) => void;
  onFirstDetect: () => void;
};

/**
 * SPAWNING → DORMANT → TRACKED → RESOLVING
 * Spawns planned once per radar cycle in the pre-sweep window.
 */
type Phase = "spawning" | "dormant" | "tracked" | "resolving";

type Slot = {
  content: ContactContent;
  x: number;
  y: number;
  zoneId: number;
  /** Precomputed polar angle vs radar origin - hit test is O(1). */
  angleDeg: number;
  phase: Phase;
  phaseAt: number;
  appearedAt: number;
  fadeInDur: number;
  fadeOutDur: number;
  lifetime: number;
  minTrack: number;
  scanCount: number;
  inBeam: boolean;
  captured: boolean;
  hitActive: boolean;
};

type CycleSpawnPlan = {
  cycleIndex: number;
  progresses: number[];
  nextIdx: number;
};

/**
 * Exactly 3 reusable DOM slots. Start hidden.
 * New contacts materialize late in each rotation, ahead of the next sweep.
 */
export function DeltaField({
  activeRef,
  resumeRef,
  reduced,
  rainOpacityRef,
  onLand,
  onFirstDetect,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const slotEls = useRef<(HTMLDivElement | null)[]>([]);
  const slots = useRef<(Slot | null)[]>(Array(SIGNAL_SLOT_COUNT).fill(null));
  const recentZones = useRef<number[]>([]);
  const recentIds = useRef<string[]>([]);
  const first = useRef(false);
  const captureGate = useRef(0);
  const cbs = useRef({ onLand, onFirstDetect });
  cbs.current = { onLand, onFirstDetect };
  const pageVisible = useRef(
    typeof document !== "undefined"
      ? document.visibilityState !== "hidden"
      : true,
  );

  const occupied = (except: number) =>
    slots.current
      .map((s, j) =>
        s && j !== except && s.phase !== "resolving" ? s : null,
      )
      .filter(Boolean)
      .map((s) => ({ x: s!.x, y: s!.y, zoneId: s!.zoneId }));

  const visibleCount = () =>
    slots.current.filter((s) => s && s.phase !== "resolving").length;

  const emptySlotCount = () =>
    slots.current.filter((s) => !s).length;

  const hideSlot = (i: number) => {
    const el = slotEls.current[i];
    if (!el) return;
    el.dataset.alive = "false";
    el.dataset.phase = "cooldown";
    el.dataset.hit = "false";
    el.classList.remove("rx-ds--in", "rx-ds--out");
    el.style.setProperty("--base", String(restingBase(0)));
    el.style.removeProperty("--fade-in");
    el.style.removeProperty("--fade-out");
  };

  const writeBase = (slot: Slot, el: HTMLDivElement) => {
    el.style.setProperty("--base", String(restingBase(slot.scanCount)));
    el.style.setProperty("--track", String(trackConfidence(slot.scanCount)));
    el.dataset.scans = String(slot.scanCount);
  };

  const setHit = (slot: Slot, el: HTMLDivElement, on: boolean) => {
    if (slot.hitActive === on) return;
    slot.hitActive = on;
    el.dataset.hit = on ? "true" : "false";
  };

  const applySlotDom = (i: number, slot: Slot) => {
    const el = slotEls.current[i];
    if (!el) return;
    const c = slot.content;
    el.style.left = `${slot.x * 100}%`;
    el.style.top = `${slot.y * 100}%`;
    el.style.setProperty("--c", c.color);
    el.style.setProperty("--c-hit", c.hitColor);
    el.style.setProperty("--c-core", c.coreColor);
    el.style.setProperty("--base", String(restingBase(0)));
    el.style.setProperty("--track", String(trackConfidence(0)));
    el.style.setProperty("--fade-in", `${slot.fadeInDur}ms`);
    el.style.setProperty("--fade-out", `${slot.fadeOutDur}ms`);
    el.dataset.terr = c.territory;
    el.dataset.alive = "true";
    el.dataset.phase = "spawning";
    el.dataset.scans = "0";
    el.dataset.captured = "false";
    el.dataset.material = "true";
    el.dataset.hit = "false";

    const val = el.querySelector(".rx-ds-val");
    if (val) val.textContent = c.value;
    const lab = el.querySelector(".rx-ds-meta em");
    if (lab) lab.textContent = c.label;
    const terr = el.querySelector(".rx-ds-meta strong");
    if (terr) terr.textContent = c.territory;

    el.classList.remove("rx-ds--in", "rx-ds--out");
    requestAnimationFrame(() => {
      el.classList.add("rx-ds--in");
    });
  };

  const spawnInto = (
    i: number,
    now: number,
    beamDeg: number,
    vw: number,
    vh: number,
  ) => {
    const content = pickContent(recentIds.current);
    const pos = pickPlacement(occupied(i), recentZones.current, {
      beamDeg,
      vw,
      vh,
      originX: RADAR_ORIGIN.x,
      originY: RADAR_ORIGIN.y,
    });
    recentZones.current = [...recentZones.current, pos.zoneId].slice(-4);
    recentIds.current = [...recentIds.current, content.specId].slice(-6);

    const sx = pos.x * vw;
    const sy = pos.y * vh;
    const angleDeg = signalAngleDeg(sx - RADAR_ORIGIN.x * vw, sy - RADAR_ORIGIN.y * vh);

    const slot: Slot = {
      content,
      x: pos.x,
      y: pos.y,
      zoneId: pos.zoneId,
      angleDeg,
      phase: "spawning",
      phaseAt: now,
      appearedAt: now,
      fadeInDur: fadeInMs(),
      fadeOutDur: fadeOutMs(),
      lifetime: trackLifetimeMs(),
      minTrack: minTrackMs(),
      scanCount: 0,
      inBeam: false,
      captured: false,
      hitActive: false,
    };
    slots.current[i] = slot;
    applySlotDom(i, slot);
  };

  const freeSlotIndex = () => {
    for (let i = 0; i < SIGNAL_SLOT_COUNT; i++) {
      if (!slots.current[i]) return i;
    }
    return -1;
  };

  useEffect(() => {
    let cancelled = false;

    for (let i = 0; i < SIGNAL_SLOT_COUNT; i++) {
      slots.current[i] = null;
      hideSlot(i);
    }
    recentZones.current = [];
    recentIds.current = [];

    if (reduced) return;

    let raf = 0;
    let prev = performance.now();
    let beamT0 = performance.now();
    let beamSynced = false;
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let lastOp = -1;
    let beamEl: HTMLElement | null = null;
    let lastSchedCheck = 0;
    let spawnPlan: CycleSpawnPlan | null = null;
    let resizeTimer = 0;

    const kick = () => {
      if (cancelled || raf) return;
      if (!pageVisible.current || !activeRef.current) return;
      prev = performance.now();
      raf = requestAnimationFrame(tick);
    };

    resumeRef.current = kick;

    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resizeTimer = 0;
        vw = window.innerWidth;
        vh = window.innerHeight;
        // Recompute contact angles after layout change
        for (let i = 0; i < SIGNAL_SLOT_COUNT; i++) {
          const slot = slots.current[i];
          if (!slot) continue;
          const sx = slot.x * vw;
          const sy = slot.y * vh;
          slot.angleDeg = signalAngleDeg(
            sx - RADAR_ORIGIN.x * vw,
            sy - RADAR_ORIGIN.y * vh,
          );
        }
      }, 120);
    };
    const onVis = () => {
      pageVisible.current = document.visibilityState !== "hidden";
      if (pageVisible.current) kick();
    };
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVis);

    const syncBeam = () => {
      if (beamSynced || !beamEl) return;
      const anim = beamEl.getAnimations?.()[0];
      if (typeof anim?.startTime === "number") {
        beamT0 = anim.startTime;
        beamSynced = true;
      }
    };

    const anotherResolving = (except: number) =>
      slots.current.some(
        (s, j) => s && j !== except && s.phase === "resolving",
      );

    const beginResolve = (
      i: number,
      slot: Slot,
      el: HTMLDivElement,
      now: number,
    ) => {
      if (anotherResolving(i)) return;
      slot.phase = "resolving";
      slot.phaseAt = now;
      el.dataset.phase = "resolving";
      el.classList.remove("rx-ds--in");
      el.classList.add("rx-ds--out");
    };

    /**
     * Lifecycle only: plan once per cycle at spawn-window entry,
     * then execute at most one staggered spawn per scheduler pulse.
     */
    const runScheduler = (
      now: number,
      cycleIndex: number,
      cycleProgress: number,
      beamDeg: number,
    ) => {
      // New cycle → drop prior plan.
      if (spawnPlan && spawnPlan.cycleIndex !== cycleIndex) {
        spawnPlan = null;
      }

      // Entering pre-sweep: plan this cycle's arrivals once.
      if (
        cycleProgress >= SPAWN_WINDOW_START &&
        (!spawnPlan || spawnPlan.cycleIndex !== cycleIndex)
      ) {
        const visible = visibleCount();
        const empty = emptySlotCount();
        const n = desiredNewContacts(empty, visible);
        spawnPlan = {
          cycleIndex,
          progresses: planSpawnProgresses(n),
          nextIdx: 0,
        };
      }

      if (!spawnPlan || spawnPlan.cycleIndex !== cycleIndex) return;
      if (spawnPlan.nextIdx >= spawnPlan.progresses.length) return;

      const at = spawnPlan.progresses[spawnPlan.nextIdx]!;
      if (cycleProgress < at) return;
      if (visibleCount() >= MAX_VISIBLE_CONTACTS) {
        spawnPlan.nextIdx = spawnPlan.progresses.length;
        return;
      }

      const idx = freeSlotIndex();
      if (idx < 0) {
        spawnPlan.nextIdx = spawnPlan.progresses.length;
        return;
      }

      spawnInto(idx, now, beamDeg, vw, vh);
      spawnPlan.nextIdx += 1;
    };

    const tick = (now: number) => {
      raf = 0;
      if (cancelled) return;
      // Stop the loop while offscreen / hidden: parent IO calls resumeRef.
      if (!pageVisible.current || !activeRef.current) return;
      raf = requestAnimationFrame(tick);

      const wrap = rootRef.current;
      if (!wrap) return;
      if (!beamEl) {
        beamEl = wrap.parentElement?.querySelector(
          ".rx-beam-wrap",
        ) as HTMLElement | null;
      }
      syncBeam();

      prev = now;

      const cycleFloat = Math.max(0, (now - beamT0) / BEAM_PERIOD_MS);
      const cycleIndex = Math.floor(cycleFloat);
      const cycleProgress = cycleFloat - cycleIndex;

      const beam =
        (cycleProgress * 360 + BEAM_START_DEG + 360) % 360;

      const op = rainOpacityRef.current;
      if (op !== lastOp) {
        lastOp = op;
        wrap.style.opacity = String(op);
      }

      if (now - lastSchedCheck > 120) {
        lastSchedCheck = now;
        runScheduler(now, cycleIndex, cycleProgress, beam);
      }

      for (let i = 0; i < SIGNAL_SLOT_COUNT; i++) {
        const el = slotEls.current[i];
        if (!el) continue;
        const slot = slots.current[i];
        if (!slot) continue;

        const phaseAge = now - slot.phaseAt;
        const age = now - slot.appearedAt;

        if (slot.phase === "spawning" && phaseAge >= slot.fadeInDur) {
          slot.phase = "dormant";
          slot.phaseAt = now;
          el.dataset.phase = "dormant";
          el.classList.remove("rx-ds--in");
          writeBase(slot, el);
        }

        if (slot.phase === "resolving") {
          setHit(slot, el, false);
          if (phaseAge >= slot.fadeOutDur) {
            slots.current[i] = null;
            hideSlot(i);
          }
          continue;
        }

        if (slot.phase === "spawning") {
          setHit(slot, el, false);
          continue;
        }

        if (slot.phase === "dormant" || slot.phase === "tracked") {
          const ad = angleDistance(slot.angleDeg, beam);
          const hitting = ad < 7;

          if (hitting) {
            setHit(slot, el, true);
            if (!slot.inBeam && ad < 5) {
              slot.inBeam = true;
              slot.scanCount += 1;
              writeBase(slot, el);

              if (slot.phase === "dormant") {
                slot.phase = "tracked";
                slot.phaseAt = now;
                el.dataset.phase = "tracked";
                if (!first.current) {
                  first.current = true;
                  cbs.current.onFirstDetect();
                }
              }

              if (
                !slot.captured &&
                slot.scanCount >= 1 &&
                ad < 3 &&
                age > 1200
              ) {
                captureGate.current += 1;
                if (captureGate.current % 2 === 0) {
                  slot.captured = true;
                  const spec = landSpec(slot.content.specId);
                  if (spec) cbs.current.onLand(spec);
                  el.dataset.captured = "true";
                }
              }
            }
          } else {
            setHit(slot, el, false);
            if (ad > 12) slot.inBeam = false;
          }

          const eligible =
            (age >= slot.minTrack &&
              slot.scanCount >= MIN_SCAN_COUNT &&
              age >= slot.lifetime) ||
            age >= slot.lifetime + 12000;

          if (eligible) beginResolve(i, slot, el, now);
        }
      }
    };

    prev = performance.now();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      resumeRef.current = null;
      if (raf) cancelAnimationFrame(raf);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, rainOpacityRef, activeRef, resumeRef]);

  const shells = Array.from({ length: SIGNAL_SLOT_COUNT }, (_, i) => i);

  return (
    <div ref={rootRef} className="rx-delta-field" data-mode="contacts">
      <div className="rx-rain" data-depth="contacts">
        {shells.map((i) => (
          <div
            key={i}
            ref={(el) => {
              slotEls.current[i] = el;
            }}
            className="rx-ds"
            id={`signal-slot-${i + 1}`}
            data-material="true"
            data-alive="false"
            data-phase="wait"
            data-scans="0"
            data-captured="false"
            data-hit="false"
            style={
              {
                ["--base" as string]: "0.7",
                ["--track" as string]: "0.35",
                ["--c" as string]: "#18E885",
                ["--c-hit" as string]: "#6CFFBD",
                ["--c-core" as string]: "#00FF85",
                ["--fade-in" as string]: "900ms",
                ["--fade-out" as string]: "1500ms",
              } as CSSProperties
            }
          >
            <span className="rx-ds-inner">
              <span className="rx-ds-flash" />
              <span className="rx-ds-head">
                <span className="rx-ds-delta">
                  <RadrDeltaGlyph />
                </span>
                <span className="rx-ds-val" />
              </span>
              <span className="rx-ds-meta">
                <em />
                <strong />
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
