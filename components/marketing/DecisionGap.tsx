"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import { Glyph } from "./MockupVisuals";
import "./decision-gap.css";

const sources = [
  { name: "POS", detail: "Sales & payments", icon: "restaurant" },
  { name: "PMS", detail: "Bookings & stays", icon: "hotel" },
  { name: "Finance", detail: "Invoices & credits", icon: "data" },
  { name: "Procurement", detail: "Contracts & prices", icon: "document" },
  { name: "Labor", detail: "Schedules & hours", icon: "labor" },
];
const outputs = [
  { name: "Insights", detail: "See what matters", icon: "chart" },
  { name: "Futures", detail: "Compare possible outcomes", icon: "spark" },
  { name: "Recommendations", detail: "Choose a clear next step", icon: "document" },
  { name: "Actions", detail: "Keep your team in control", icon: "arrow" },
  { name: "Verification", detail: "Check what actually changed", icon: "check" },
];
function subscribe(listener: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  document.addEventListener("visibilitychange", listener);
  return () => {
    query.removeEventListener("change", listener);
    document.removeEventListener("visibilitychange", listener);
  };
}
const motionSnapshot = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches && document.visibilityState !== "hidden";

function FlowPaths({ mobile = false }: { mobile?: boolean }) {
  return (
    <svg className={`dg-streams dg-streams-${mobile ? "mobile" : "desktop"}`} viewBox={mobile ? "0 0 400 800" : "0 0 1200 480"} fill="none" aria-hidden="true">
      {sources.map((source, i) => {
        const y = 64 + i * 88;
        const x = 40 + i * 80;
        const input = mobile ? `M${x} 122 C${x} 225 200 200 200 310` : `M224 ${y} C390 ${y} 365 ${208 + i * 16} 500 ${208 + i * 16}`;
        const output = mobile ? `M200 490 C200 600 ${x} 565 ${x} 678` : `M700 ${208 + i * 16} C835 ${208 + i * 16} 820 ${y} 976 ${y}`;
        return <g key={source.name} style={{ "--dg-delay": `${i * -.62}s` } as React.CSSProperties}>
          <path className="dg-track dg-track-in" d={input} />
          <path className="dg-track dg-track-out" d={output} />
          <path className="dg-packet dg-packet-in" d={input} pathLength="100" />
          <path className="dg-packet dg-packet-out" d={output} pathLength="100" />
        </g>;
      })}
    </svg>
  );
}

export function DecisionGap() {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: .12 });
  const enabled = useSyncExternalStore(subscribe, motionSnapshot, () => false);
  return (
    <section ref={section} className="dg-section" id="decision-gap" aria-labelledby="gap-title" data-running={inView && enabled}>
      <div className="dg-shell">
        <header className="dg-header">
          <div>
            <p className="dg-eyebrow">THE DECISION GAP</p>
            <h2 id="gap-title">You have data.<br /><span>See the full picture.</span></h2>
          </div>
          <div className="dg-intro">
            <p>Your systems tell different parts of the story. RADR connects them, adds operating context, and brings your next decision into focus.</p>
            <Link href="/how" className="dg-link">Explore the platform <span aria-hidden="true">↗</span></Link>
          </div>
        </header>
        <div className="dg-panel">
          <div className="dg-lane-headings">
            <span><b>01</b> YOUR SYSTEMS</span>
            <span><b>02</b> CONNECTED CONTEXT</span>
            <span><b>03</b> BETTER DECISIONS</span>
          </div>
          <div className="dg-visual" role="group" aria-label="Illustrative flow: operational data from five source systems connects in RADR, then becomes insights, futures, recommendations, actions and verification.">
            <div className="dg-orbit" aria-hidden="true"><i /><i /><i /><i /><div className="dg-orbit-sweep" /></div>
            <FlowPaths /><FlowPaths mobile />
            <div className="dg-inputs">
              {sources.map((source, i) => <div className="dg-source" key={source.name} style={{ "--dg-delay": `${i * -.62}s` } as React.CSSProperties}>
                <Glyph name={source.icon} size={25} /><span><strong>{source.name}</strong><small>{source.detail}</small></span><i aria-hidden="true" />
              </div>)}
            </div>
            <div className="dg-core">
              <div className="dg-core-sheen" aria-hidden="true" />
              <Image src="/brand/radr-wordmark-clean-white.svg" width={148} height={34} alt="RADR" />
              <strong>Operating state</strong>
              <span>Evidence + context</span>
              <div className="dg-processing" aria-hidden="true"><i /><i /><i /></div>
            </div>
            <div className="dg-outputs">
              {outputs.map((output, i) => <div className="dg-result" key={output.name} style={{ "--dg-delay": `${i * -.62}s` } as React.CSSProperties}>
                <Glyph name={output.icon} size={25} /><span><strong>{output.name}</strong><small>{output.detail}</small></span><i aria-hidden="true" />
              </div>)}
            </div>
            <p className="dg-connected">One connected picture</p>
          </div>
          <div className="dg-legend"><span><i />Your operational data</span><span><i />Decisions with evidence</span><small>Illustrative data flow</small></div>
        </div>
        <div className="dg-caption"><span className="dg-eyebrow">THE DIFFERENCE</span><i aria-hidden="true" /><p>From knowing what happened <span aria-hidden="true">→</span> <strong>to knowing what to do next.</strong></p></div>
      </div>
    </section>
  );
}
