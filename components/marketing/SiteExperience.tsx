"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const chapters: Record<string, { title: string; items: [string, string][] }> = {
  "/how": { title: "THE PLATFORM", items: [["Connect", "#foundation"], ["Understand", "#operating-state"], ["Decide", "#intelligence"], ["Verify", "#decisions"]] },
  "/solutions": { title: "YOUR OPERATION", items: [["Explore", "#overview"], ["Find your fit", "#tailored"], ["Connect the workflow", "#reconciliation"]] },
  "/company": { title: "WHY RADR", items: [["Mission", "#mission"], ["Approach", "#approach"], ["Values", "#values"]] },
  "/pricing": { title: "A CLEAR COMMERCIAL MODEL", items: [["Compare plans", "#plans"], ["Implementation", "/contact"], ["Questions", "#faq"]] },
  "/value-calculator": { title: "MODEL THE OPPORTUNITY", items: [["Your inputs", "#calculator"], ["Your scenario", "#results"], ["Next step", "/contact"]] },
};
export function RouteChapterBand() {
  const path = usePathname();
  const content = chapters[path];
  if (!content) return null;
  return <nav className="vc-chapter-band" aria-label="Explore this page"><span>{content.title}</span><div>{content.items.map(([label, href], i) => <a href={href} key={label}><small>0{i + 1}</small>{label}<i aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 18 18 6M6 6h12v12" /></svg></i></a>)}</div></nav>;
}

/** Public pages share choreography; forms, legal text and app screens stay stable. */
export function SiteExperience() {
  const path = usePathname();
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (path === "/" || path === "/en") return;
    const root = document.querySelector<HTMLElement>(".rp-site");
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const animations: Animation[] = [];
    const canvases = Array.from(root.querySelectorAll<HTMLElement>(".vc-canvas"));
    const inView = new Set<HTMLElement>();
    const syncCanvases = () => canvases.forEach(node => { node.dataset.moving = String(inView.has(node) && !document.hidden && !preference.matches); });
    const canvasObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) inView.add(entry.target as HTMLElement); else inView.delete(entry.target as HTMLElement); });
      syncCanvases();
    });
    canvases.forEach(node => canvasObserver.observe(node));
    document.addEventListener("visibilitychange", syncCanvases);
    const targets = root.querySelectorAll<HTMLElement>(".mx-section-copy, .mx-hero-grid > div:first-child, .mx-role-cards > article, .mx-solution-grid > *, .mx-pricing-cards > article, .mx-company-cards > article, .mx-mission-benefits > li, .mx-company-values > div, .vc-canvas, .mx-service-grid > *, .rp-section-heading");
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches) continue;
        animations.push(entry.target.animate([
          { opacity: .3, transform: "translate3d(0,48px,0) scale(.985)" },
          { opacity: 1, transform: "translate3d(0,0,0) scale(1)" }
        ], { duration: 900, easing: "cubic-bezier(.22,1,.36,1)" }));
      }
    }, { threshold: .12 });
    targets.forEach(target => observer.observe(target));
    const visuals = Array.from(root.querySelectorAll<HTMLElement>(".mx-device, .mx-data-foundation, .mx-infinity, .sf-board"));
    const update = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0})`;
      if (preference.matches) return;
      visuals.forEach(node => {
        const rect = node.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const depth = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight));
        node.style.translate = `0 ${depth * -24}px`;
      });
    };
    const scroll = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(update); };
    const reduce = () => { syncCanvases(); if (preference.matches) { animations.forEach(animation => animation.finish()); visuals.forEach(node => node.style.removeProperty("translate")); } scroll(); };
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    preference.addEventListener("change", reduce);
    return () => { observer.disconnect(); canvasObserver.disconnect(); document.removeEventListener("visibilitychange", syncCanvases); animations.forEach(animation => animation.cancel()); visuals.forEach(node => node.style.removeProperty("translate")); cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); preference.removeEventListener("change", reduce); };
  }, [path]);
  return <div ref={bar} className="vc-site-progress" aria-hidden="true" />;
}
