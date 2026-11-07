"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { clampLiveZoom } from "@/lib/radr/live/spatialCamera";

/** Plan gestures preserve room click targets; a drag must never select a room. */
export function useHotelPlanGestures(
  ref: RefObject<HTMLDivElement | null>,
  zoom: number,
  setZoom: Dispatch<SetStateAction<number>>,
  resetKey: string,
) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const latest = useRef({ pan, zoom });
  latest.current = { pan, zoom };
  const suppress = useRef(0);
  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setDragging(false);
  }, [resetKey]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pointers = new Map<number, { x: number; y: number }>();
    let start: { x: number; y: number; pan: { x: number; y: number } } | null =
      null;
    let pinch: { distance: number; zoom: number } | null = null;
    let moved = false;
    const distance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved = false;
      if (pointers.size === 2) {
        pinch = { distance: distance(), zoom: latest.current.zoom };
        start = null;
        el.setPointerCapture(e.pointerId);
      } else start = { x: e.clientX, y: e.clientY, pan: latest.current.pan };
    };
    const move = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        e.preventDefault();
        moved = true;
        setDragging(true);
        setZoom(
          clampLiveZoom(
            (pinch.zoom * distance()) / Math.max(1, pinch.distance),
          ),
        );
        return;
      }
      if (!start) return;
      const dx = e.clientX - start.x,
        dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) < 5 && !moved) return;
      e.preventDefault();
      moved = true;
      setDragging(true);
      if (!el.hasPointerCapture(e.pointerId)) el.setPointerCapture(e.pointerId);
      setPan({
        x: Math.max(
          -el.clientWidth * 2,
          Math.min(el.clientWidth * 2, start.pan.x + dx),
        ),
        y: Math.max(
          -el.clientHeight * 2,
          Math.min(el.clientHeight * 2, start.pan.y + dy),
        ),
      });
    };
    const up = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      if (moved) suppress.current = performance.now() + 300;
      pointers.delete(e.pointerId);
      if (el.hasPointerCapture(e.pointerId))
        el.releasePointerCapture(e.pointerId);
      start = null;
      pinch = null;
      setDragging(false);
    };
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((z) =>
        clampLiveZoom(
          z * Math.exp(-Math.max(-200, Math.min(200, e.deltaY)) * 0.003),
        ),
      );
    };
    const click = (e: MouseEvent) => {
      if (performance.now() < suppress.current) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const reset = () => {
      setPan({ x: 0, y: 0 });
      setZoom(1);
    };
    const key = (e: KeyboardEvent) => {
      if (e.target !== el) return;
      const steps: Record<string, { x: number; y: number }> = {
        ArrowLeft: { x: 40, y: 0 },
        ArrowRight: { x: -40, y: 0 },
        ArrowUp: { x: 0, y: 40 },
        ArrowDown: { x: 0, y: -40 },
      };
      if (steps[e.key]) {
        e.preventDefault();
        const p = steps[e.key];
        setPan((v) => ({
          x: Math.max(
            -el.clientWidth * 2,
            Math.min(el.clientWidth * 2, v.x + p.x),
          ),
          y: Math.max(
            -el.clientHeight * 2,
            Math.min(el.clientHeight * 2, v.y + p.y),
          ),
        }));
      } else if (["+", "=", "-", "0", "Home"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "0" || e.key === "Home") reset();
        else setZoom((z) => clampLiveZoom(z * (e.key === "-" ? 0.88 : 1.12)));
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("click", click, true);
    el.addEventListener("dblclick", reset);
    el.addEventListener("keydown", key);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      el.removeEventListener("lostpointercapture", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("click", click, true);
      el.removeEventListener("dblclick", reset);
      el.removeEventListener("keydown", key);
    };
  }, [ref, setZoom, resetKey]);
  return {
    style: {
      "--hl-pan-x": `${pan.x}px`,
      "--hl-pan-y": `${pan.y}px`,
    } as CSSProperties,
    dragging,
    reset: () => {
      setPan({ x: 0, y: 0 });
      setZoom(1);
    },
  };
}
