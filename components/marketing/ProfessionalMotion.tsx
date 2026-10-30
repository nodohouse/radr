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

/** Reveal the existing narrative without hiding server-rendered content. */
export function ProfessionalScroll() {
  const progress = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? Math.min(1, window.scrollY / range) : 0})`;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const animations: Animation[] = [];
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        const children = entry.target.querySelectorAll(".rs-copy, .rs-decision, .rs-system-tiles, .rs-value-visual, .rs-operation-card, .dg-header, .dg-panel");
        children.forEach((node, i) => animations.push(node.animate([{ opacity: .45, transform: "translateY(26px)" }, { opacity: 1, transform: "translateY(0)" }], { duration: 650, delay: Math.min(i * 100, 250), easing: "cubic-bezier(.22,1,.36,1)" })));
      }
    }, { threshold: .12 });
    document.querySelectorAll(".reference-page > section").forEach(section => observer.observe(section));
    const reduce = () => { if (preference.matches) animations.forEach(animation => animation.finish()); };
    preference.addEventListener("change", reduce);
    return () => { observer.disconnect(); animations.forEach(animation => animation.cancel()); preference.removeEventListener("change", reduce); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(frame); };
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
