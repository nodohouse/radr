"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { animate, motion, useMotionValue } from "motion/react";

type Props = {
  root: RefObject<HTMLDivElement | null>;
  running: boolean;
  section: number;
  variant: "decisions" | "operations";
  onSectionChange: (section: number) => void;
};

/** A quiet, local product walkthrough. External links and APIs are never activated. */
export function ShowcaseCursor({
  root,
  running,
  section,
  variant,
  onSectionChange,
}: Props) {
  const x = useMotionValue(0),
    y = useMotionValue(0),
    opacity = useMotionValue(0),
    scale = useMotionValue(1);
  const initialized = useRef(false);
  const [shown, setShown] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [interaction, setInteraction] = useState(0);
  useEffect(() => {
    const tablet = root.current;
    if (!tablet) return;
    const onInteraction = (event: Event) => {
      if (event.isTrusted) setInteraction((value) => value + 1);
    };
    tablet.addEventListener("pointerdown", onInteraction);
    tablet.addEventListener("keydown", onInteraction);
    return () => {
      tablet.removeEventListener("pointerdown", onInteraction);
      tablet.removeEventListener("keydown", onInteraction);
    };
  }, [root]);
  useEffect(() => {
    if (!running) {
      setShown(false);
      setClicks(0);
      initialized.current = false;
      opacity.set(0);
      return;
    }
    const tablet = root.current;
    const screen = tablet?.querySelector<HTMLElement>(".rsc-screen");
    if (!tablet || !screen) return;
    const timers: number[] = [];
    const animations: { stop: () => void }[] = [];
    let lastTarget = "";
    const later = (time: number, callback: () => void) =>
      timers.push(window.setTimeout(callback, time));
    const clearEmphasis = () =>
      tablet
        .querySelectorAll("[data-tour-hover], [data-tour-press]")
        .forEach((node) => {
          node.removeAttribute("data-tour-hover");
          node.removeAttribute("data-tour-press");
        });
    const targetPoint = (target: HTMLElement) => {
      let px = target.offsetWidth * 0.5 - 1.6,
        py = target.offsetHeight * 0.5 - 0.8;
      let node: HTMLElement | null = target;
      while (node && node !== screen) {
        px += node.offsetLeft;
        py += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return node === screen ? { x: px, y: py } : null;
    };
    const move = (selector: string, resize = false) => {
      const target = tablet.querySelector<HTMLElement>(selector);
      if (!target || !target.offsetWidth || !target.offsetHeight) return;
      const end = targetPoint(target);
      if (!end) return;
      lastTarget = selector;
      clearEmphasis();
      const start = { x: x.get(), y: y.get() };
      const dx = end.x - start.x,
        dy = end.y - start.y;
      const bend = Math.min(22, Math.hypot(dx, dy) * 0.06);
      const xs: number[] = [],
        ys: number[] = [];
      // Sample one eased Bezier: continuous velocity, no stop at an intermediate waypoint.
      for (let step = 0; step <= 24; step++) {
        const u = step / 24,
          t = u * u * (3 - 2 * u),
          q = 1 - t;
        xs.push(
          q * q * q * start.x +
            3 * q * q * t * (start.x + dx * 0.3) +
            3 * q * t * t * (end.x - dx * 0.25) +
            t * t * t * end.x,
        );
        ys.push(
          q * q * q * start.y +
            3 * q * q * t * (start.y + dy * 0.15 - bend) +
            3 * q * t * t * (end.y - dy * 0.25 - bend) +
            t * t * t * end.y,
        );
      }
      animations.push(
        animate(x, xs, { duration: resize ? 0.18 : 1, ease: "linear" }),
        animate(y, ys, { duration: resize ? 0.18 : 1, ease: "linear" }),
      );
      if (target.tagName === "BUTTON")
        later(resize ? 180 : 1000, () =>
          target.setAttribute("data-tour-hover", "true"),
        );
    };
    const press = (selector: string) => {
      tablet.querySelector(selector)?.setAttribute("data-tour-press", "true");
      animations.push(
        animate(scale, 0.87, { duration: 0.12, ease: "easeOut" }),
      );
    };
    const click = (selector: string, next?: number) => {
      const target = tablet.querySelector<HTMLButtonElement>(selector);
      setClicks((value) => value + 1);
      animations.push(animate(scale, 1, { duration: 0.2, ease: "easeOut" }));
      target?.removeAttribute("data-tour-press");
      if (target?.tagName === "BUTTON") target.click();
      else if (next !== undefined) onSectionChange(next);
    };
    if (!initialized.current) {
      x.set(screen.clientWidth * 0.79);
      y.set(screen.clientHeight - 38);
      initialized.current = true;
      setShown(true);
    }
    if (opacity.get() < 1)
      later(700, () =>
        animations.push(animate(opacity, 1, { duration: 0.35 })),
      );
    animations.push(animate(scale, 1, { duration: 0.18 }));
    const operations = variant === "operations";
    if (operations && section < 2) {
      const objects = [...tablet.querySelectorAll(".rhl-object")];
      const index = objects.findIndex(
        (node) => node.getAttribute("aria-pressed") !== "true",
      );
      const object = `.rhl-object:nth-child(${Math.max(0, index) + 1})`;
      const destination =
        section === 0
          ? ".rhl-mode button:nth-child(2)"
          : '.rsc-sidebar button[data-scene="2"]';
      later(1000, () => move(object));
      later(2440, () => press(object));
      later(2600, () => click(object));
      later(4800, () => move(destination));
      later(6340, () => press(destination));
      later(6500, () => click(destination, section === 0 ? 1 : 2));
    } else {
      const destination =
        operations || section === 3
          ? '.rsc-sidebar button[data-scene="0"]'
          : ".rsc-stage button.rsc-action";
      const finish = operations ? 6500 : 4200;
      later(finish - 1650, () => move(destination));
      later(finish - 160, () => press(destination));
      later(finish, () =>
        click(destination, (section + 1) % (operations ? 3 : 4)),
      );
    }
    const observer = new ResizeObserver(() => {
      if (lastTarget) move(lastTarget, true);
    });
    observer.observe(screen);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      animations.forEach((animation) => animation.stop());
      observer.disconnect();
      clearEmphasis();
    };
  }, [
    running,
    section,
    variant,
    interaction,
    root,
    onSectionChange,
    x,
    y,
    opacity,
    scale,
  ]);
  if (!running || !shown) return null;
  return (
    <motion.div
      className="rsc-demo-pointer"
      aria-hidden="true"
      style={{ x, y, opacity, scale }}
      data-click={clicks}
    >
      <svg viewBox="0 0 20 26" fill="none" aria-hidden="true">
        <path
          d="M2 1V21L7.3 16.5L10.6 23.8L13.7 22.4L10.4 15.2H18L2 1Z"
          fill="#102139"
          stroke="#fff"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
