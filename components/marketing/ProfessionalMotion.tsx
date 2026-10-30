"use client";

import { useEffect, useRef } from "react";

const messages = {
  signals: ["Supplier variance → evidence attached", "Labor demand → staffing decisions", "Revenue signals → opportunities to review", "Expected value → tracked through verification"],
  process: ["Connect your systems", "Understand the operating state", "Compare possible futures", "Recommend the next action", "Verify the outcome"],
};

export function RunningBanner({ kind = "signals" }: { kind?: keyof typeof messages }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let visible = false;
    const sync = () => { node.dataset.moving = String(visible && !document.hidden); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return (
    <section className="pro-banner" ref={root} aria-label={kind === "signals" ? "What RADR helps you investigate" : "The RADR decision lifecycle"}>
      <span className="pro-banner-label">{kind === "signals" ? "SIGNAL → DECISION" : "THE OPERATING LOOP"}</span>
      <div className="pro-banner-window" tabIndex={0} aria-label="Scrollable workflow banner">
        <div className="pro-banner-track">
          {[0, 1].map(copy => <div className="pro-banner-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>{messages[kind].map(message => <span key={message}><i aria-hidden="true">↗</i>{message}</span>)}</div>)}
        </div>
      </div>
    </section>
  );
}

/** Scroll-linked depth follows native scrolling; content stays visible without JS. */
export function ProfessionalScroll() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 700px)");
    const hero = document.querySelector<HTMLElement>(".rh-hero");
    const tablet = document.querySelector<HTMLElement>(".rh-device");
    const backdrop = document.querySelector<HTMLElement>(".rh-backdrop");
    const copy = document.querySelector<HTMLElement>(".rh-copy");
    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      ".reference-page .rs-copy, .reference-page .rs-decision, .reference-page .rs-system-tiles, .reference-page .rs-value-visual, .reference-page .rs-operation-card, .reference-page .dg-header, .reference-page .dg-panel, .pro-proof-intro, .pro-proof li, .rs-final-copy"
    ));
    let scenes: { node: HTMLElement; animation: Animation }[] = [];
    let frame = 0;
    const clamp = (value: number) => Math.max(0, Math.min(1, value));
    const resetHero = () => {
      tablet?.style.removeProperty("--tablet-scroll-y");
      tablet?.style.removeProperty("--tablet-scroll-roll");
      backdrop?.style.removeProperty("translate");
      copy?.style.removeProperty("translate");
    };
    const update = () => {
      frame = 0;
      const height = window.innerHeight;
      const range = document.documentElement.scrollHeight - height;
      const heroRect = hero?.getBoundingClientRect();
      // Read geometry together before updating composited animation properties.
      const positions = scenes.map(scene => {
        let top = 0;
        let node: HTMLElement | null = scene.node;
        while (node) { top += node.offsetTop; node = node.offsetParent as HTMLElement | null; }
        return top - window.scrollY;
      });
      if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? clamp(window.scrollY / range) : 0})`;
      if (preference.matches) return;
      if (heroRect && heroRect.bottom > 0) {
        const travel = clamp(-heroRect.top / heroRect.height);
        tablet?.style.setProperty("--tablet-scroll-y", `${travel * (mobile.matches ? -18 : -65)}px`);
        tablet?.style.setProperty("--tablet-scroll-roll", `${travel * (mobile.matches ? .4 : 1.8)}deg`);
        if (backdrop) backdrop.style.translate = `0 ${travel * 65}px`;
        if (copy) copy.style.translate = `0 ${travel * -28}px`;
      }
      scenes.forEach((scene, i) => {
        // Finish each entrance in the upper-middle viewport; keep it readable afterward.
        const entrance = clamp((height * .96 - positions[i]) / (height * .65));
        scene.animation.currentTime = entrance * 1000;
      });
    };
    const onScroll = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
    const configure = () => {
      scenes.forEach(scene => scene.animation.cancel());
      scenes = [];
      resetHero();
      if (!preference.matches) {
        scenes = targets.map((node, i) => {
          const visual = node.matches(".rs-decision, .rs-value-visual, .dg-panel");
          const distance = mobile.matches ? 28 : visual ? 76 : 44;
          const animation = node.animate([
            { opacity: .25, transform: `translate3d(0,${distance}px,0) scale(${visual ? .965 : 1})`, filter: visual && !mobile.matches ? "blur(2px)" : "blur(0px)" },
            { opacity: 1, transform: "translate3d(0,0,0) scale(1)", filter: "blur(0px)" }
          ], { duration: 1000, fill: "both", easing: "cubic-bezier(.22,1,.36,1)" });
          animation.pause();
          animation.currentTime = 1000;
          // Alternate only the transform origin, never the reading order.
          node.style.transformOrigin = i % 2 ? "60% 50%" : "40% 50%";
          return { node, animation };
        });
      }
      onScroll();
    };
    configure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onScroll);
    preference.addEventListener("change", configure);
    mobile.addEventListener("change", configure);
    return () => {
      scenes.forEach(scene => scene.animation.cancel());
      targets.forEach(node => node.style.removeProperty("transform-origin"));
      resetHero();
      preference.removeEventListener("change", configure);
      mobile.removeEventListener("change", configure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <div className="pro-scroll-progress" ref={progress} aria-hidden="true" />;
}

export function ValueProof() {
  const root = useRef<HTMLElement>(null);
  const amount = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / 1100);
        if (amount.current) amount.current.textContent = `$${Math.round(2430 * (1 - Math.pow(1 - progress, 3))).toLocaleString("en-US")}`;
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .3 });
    observer.observe(node);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return (
    <section className="pro-proof" ref={root} aria-labelledby="pro-proof-title">
      <div className="pro-proof-intro"><p>ILLUSTRATIVE SUPPLIER EXAMPLE</p><h2 id="pro-proof-title">Value has to be proven.</h2><span>Detection starts the process. A confirmed outcome closes it.</span></div>
      <ol>
        <li><span>01 / EXPECTED</span><strong aria-label="$2,430"><span ref={amount}>$2,430</span></strong><p>Potential recovery identified from invoice and contract evidence.</p></li>
        <li><span>02 / OBSERVED</span><strong>Pending</strong><p>Track the supplier response and check whether a credit arrives.</p></li>
        <li><span>03 / VERIFIED</span><strong>$0</strong><p>No value is counted as verified until the outcome is confirmed.</p></li>
      </ol>
      <a href="/value-calculator">Explore your operating scenario <span aria-hidden="true">→</span></a>
    </section>
  );
}
