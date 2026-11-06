"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion } from "motion/react";

type Props = {
  root: RefObject<HTMLDivElement | null>;
  running: boolean;
  section: number;
  variant: "decisions" | "operations";
  onSectionChange: (section: number) => void;
};

/** Decorative choreography. Only local preview buttons are clicked, never links or APIs. */
export function ShowcaseCursor({
  root,
  running,
  section,
  variant,
  onSectionChange,
}: Props) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const [pulse, setPulse] = useState(0);
  const [interaction, setInteraction] = useState(0);

  useEffect(() => {
    const tablet = root.current;
    if (!tablet) return;
    const userInteraction = (event: Event) => {
      if (event.isTrusted) setInteraction((value) => value + 1);
    };
    tablet.addEventListener("pointerdown", userInteraction);
    tablet.addEventListener("keydown", userInteraction);
    return () => {
      tablet.removeEventListener("pointerdown", userInteraction);
      tablet.removeEventListener("keydown", userInteraction);
    };
  }, [root]);

  useEffect(() => {
    if (!running) {
      setPoint(null);
      setPulse(0);
      return;
    }
    const tablet = root.current;
    const screen = tablet?.querySelector<HTMLElement>(".rsc-screen");
    if (!tablet || !screen) return;
    const timers: number[] = [];
    let lastTarget = "";
    const later = (time: number, callback: () => void) =>
      timers.push(window.setTimeout(callback, time));
    const move = (selector: string) => {
      const target = tablet.querySelector<HTMLElement>(selector);
      if (!target || !target.offsetWidth || !target.offsetHeight) return;
      // Logical offsets stay correct through the tablet's 3D turn, wiggle and CSS zoom.
      let x = target.offsetWidth * 0.55;
      let y = target.offsetHeight * 0.5;
      let node: HTMLElement | null = target;
      while (node && node !== screen) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      if (node !== screen) return;
      lastTarget = selector;
      setPoint({ x, y });
    };
    const click = (selector: string, next?: number) => {
      const target = tablet.querySelector<HTMLButtonElement>(selector);
      setPulse((value) => value + 1);
      if (target?.tagName === "BUTTON") target.click();
      else if (next !== undefined) onSectionChange(next);
    };
    const operations = variant === "operations";
    if (operations && section < 2) {
      const object = ".rhl-object:nth-child(2)";
      const destination =
        section === 0
          ? ".rhl-mode button:nth-child(2)"
          : '.rsc-sidebar button[data-scene="2"]';
      later(400, () => move(object));
      later(2600, () => click(object));
      later(4100, () => move(destination));
      later(6500, () => click(destination, section === 0 ? 1 : 2));
    } else {
      const destination =
        operations || section === 3
          ? '.rsc-sidebar button[data-scene="0"]'
          : ".rsc-stage button.rsc-action";
      const detail = operations
        ? ".rso-stations"
        : [".rsc-chart", ".rsc-evidence", ".rsc-futures", ".rsc-value"][
            section
          ];
      later(400, () => move(detail));
      later(operations ? 4200 : 2600, () => move(destination));
      later(operations ? 6500 : 4200, () =>
        click(destination, (section + 1) % (operations ? 3 : 4)),
      );
    }
    const observer = new ResizeObserver(() => {
      if (lastTarget) move(lastTarget);
    });
    observer.observe(screen);
    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
    };
  }, [running, section, variant, interaction, root, onSectionChange]);

  if (!running || !point) return null;
  return (
    <motion.div
      className="rsc-demo-pointer"
      aria-hidden="true"
      initial={{ x: 24, y: 28, opacity: 0 }}
      animate={{ x: point.x, y: point.y, opacity: 1 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      data-click={pulse}
    >
      {pulse > 0 ? <i key={pulse} /> : null}
      <svg viewBox="0 0 25 29" fill="none" aria-hidden="true">
        <path
          d="M3 2L5 23L10 17L15 26L20 23L14 15L23 13L3 2Z"
          fill="white"
          stroke="#062455"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
