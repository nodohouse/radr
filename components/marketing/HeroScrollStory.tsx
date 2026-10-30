"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function HeroScrollStory({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    const hero = node?.querySelector<HTMLElement>(".rh-hero");
    const tablet = node?.querySelector<HTMLElement>(".rh-device");
    const copy = node?.querySelector<HTMLElement>(".rh-copy");
    if (!node || !hero || !tablet || !copy) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let turning: Animation | undefined;
    let frame = 0;
    let stage = -2;
    let shiftX = 0;
    let shiftY = 0;
    const clamp = (n: number) => Math.max(0, Math.min(1, n));
    const report = (next: number) => {
      if (next === stage) return;
      stage = next;
      node.dataset.scene = String(next);
      node.dispatchEvent(new CustomEvent("radr:tablet-stage", { detail: next }));
    };
    const update = () => {
      frame = 0;
      if (preference.matches) { report(-1); return; }
      const range = node.offsetHeight - hero.offsetHeight;
      const progress = clamp(-node.getBoundingClientRect().top / Math.max(1, range));
      const turn = clamp(progress / .3);
      const smooth = turn * turn * (3 - 2 * turn);
      node.dataset.engaged = String(progress > .005);
      node.style.setProperty("--story-caption-opacity", String(clamp((progress - .16) / .1)));
      tablet.style.translate = `${shiftX * smooth}px ${shiftY * smooth}px`;
      if (turning) turning.currentTime = smooth * 1000;
      copy.style.opacity = String(1 - clamp(progress / .16));
      copy.style.translate = `0 ${-40 * clamp(progress / .16)}px`;
      copy.style.visibility = progress >= .16 ? "hidden" : "visible";
      report(progress < .035 ? -1 : progress < .38 ? 0 : progress < .7 ? 1 : 2);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const configure = () => {
      turning?.cancel();
      tablet.style.removeProperty("translate");
      copy.style.removeProperty("opacity");
      copy.style.removeProperty("visibility");
      copy.style.removeProperty("translate");
      node.dataset.enhanced = String(!preference.matches);
      if (!preference.matches) {
        const narrow = window.innerWidth <= 1024;
        const scale = narrow ? Math.min((window.innerWidth - 38) / tablet.offsetWidth, .95) : Math.min(1.1, (window.innerWidth - 120) / tablet.offsetWidth, (window.innerHeight - 310) / tablet.offsetHeight);
        tablet.style.transformOrigin = narrow ? "left top" : "center center";
        const targetLeft = narrow ? (window.innerWidth - tablet.offsetWidth * scale) / 2 : (window.innerWidth - tablet.offsetWidth) / 2;
        const renderedHeight = tablet.offsetHeight * scale;
        const targetTop = narrow
          ? Math.max(260, Math.min(320, (window.innerHeight - renderedHeight) / 2 + 65))
          : 260 + (renderedHeight - tablet.offsetHeight) / 2;
        shiftX = targetLeft - tablet.offsetLeft;
        shiftY = targetTop - tablet.offsetTop;
        turning = tablet.animate([
          { transform: getComputedStyle(tablet).transform, offset: 0 },
          { transform: `perspective(1600px) rotateY(-28deg) rotateX(8deg) rotateZ(-5deg) scale(${narrow ? scale * .92 : .96})`, offset: .28 },
          { transform: `perspective(1600px) rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(${scale})` }
        ], { duration: 1000, fill: "both", easing: "linear" });
        turning.pause();
      }
      update();
    };
    configure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", configure);
    preference.addEventListener("change", configure);
    return () => {
      turning?.cancel(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", configure);
      preference.removeEventListener("change", configure);
      tablet.style.removeProperty("translate"); tablet.style.removeProperty("transform-origin");
      copy.style.removeProperty("opacity"); copy.style.removeProperty("visibility"); copy.style.removeProperty("translate");
    };
  }, []);
  return <div className="rh-scroll-track" ref={root}><span id="product-story" className="rh-story-anchor" aria-hidden="true" />{children}</div>;
}
