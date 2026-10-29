"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { useInView } from "motion/react";
import { Glyph } from "./MockupVisuals";
import "./decision-gap.css";

const sources = [
  { name: "POS", detail: "Sales & payments", icon: "restaurant", brand: "Stripe", logo: "stripe", sample: "$12,480 · net sales", meta: "246 transactions · today" },
  { name: "Bookings", detail: "Bookings & stays", icon: "hotel", brand: "Booking.com", logo: "bookingdotcom", sample: "84% · occupancy", meta: "126 room nights · today" },
  { name: "Finance", detail: "Invoices & credits", icon: "data", brand: "Xero", logo: "xero", sample: "$8.40 · invoiced / unit", meta: "Invoice #1048 · 120 units" },
  { name: "Procurement", detail: "Contracts & prices", icon: "document", brand: "SAP", logo: "sap", sample: "$7.90 · agreed / unit", meta: "Supplier contract · matched" },
  { name: "Labor", detail: "Schedules & hours", icon: "labor", brand: "Clockify", logo: "clockify", sample: "312 h · recorded", meta: "298 h scheduled · this week" },
];
const outputs = [
  { name: "Insights", detail: "A price variance comes into view", sample: "+6.3% unit price", icon: "chart" },
  { name: "Futures", detail: "Compare leaving it vs. correcting it", sample: "Two paths. One clear choice.", icon: "spark" },
  { name: "Recommendations", detail: "Evidence attached. Ready to review.", sample: "Review the $60 variance", icon: "document" },
  { name: "Actions", detail: "Your team approves before sending.", sample: "Prepare a supplier query", icon: "arrow" },
  { name: "Verification", detail: "Track the credit when it arrives.", sample: "Verified recovery: $0", icon: "check" },
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
        <div className="dg-status"><span><i /> CONTINUOUS CONTEXT</span><span>Different signals. One operating picture.</span><span>ILLUSTRATIVE SCENARIO</span></div>
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
                <div className="dg-source-top"><span className="dg-brand"><Image src={`/brand/sources/${source.logo}.svg`} alt={source.brand} width={42} height={22} /></span><span className="dg-source-type">{source.name}</span></div><strong className="dg-data">{source.sample}</strong><small className="dg-data-meta">{source.meta}</small><i aria-hidden="true" />
              </div>)}
            </div>
            <div className="dg-core">
              <div className="dg-core-sheen" aria-hidden="true" />
              <Image src="/brand/radr-wordmark-clean-white.svg" width={148} height={34} alt="RADR" />
              <strong>Connected intelligence</strong>
              <span>Evidence + operating context</span>
              <div className="dg-processing" aria-hidden="true"><i /><i /><i /></div>
            </div>
            <div className="dg-outputs">
              {outputs.map((output, i) => <div className="dg-result" key={output.name} style={{ "--dg-delay": `${i * -.62}s` } as React.CSSProperties}>
                <div className="dg-result-top"><Glyph name={output.icon} size={19} /><strong>{output.name}</strong></div><span className="dg-result-sample">{output.sample}</span><small className="dg-result-detail">{output.detail}</small><i aria-hidden="true" />
              </div>)}
            </div>
            <p className="dg-connected"><span className="dg-core-beacon" /> Always connecting the dots</p>
          </div>
          <div className="dg-legend"><span><i />Your operational data</span><span><i />Decisions with evidence</span><small>Example source systems · integration availability varies</small></div>
        </div>
        <div className="dg-evidence">
          <div className="dg-evidence-title"><span className="dg-eyebrow">FROM SIGNAL TO DECISION</span><h3>A small difference.<br /><span>A clearer next move.</span></h3></div>
          <div className="dg-proof"><span>01 / OBSERVED</span><strong>$8.40 <small>/ unit</small></strong><p>Invoice #1048 · 120 units</p></div>
          <div className="dg-proof"><span>02 / EXPECTED</span><strong>$7.90 <small>/ unit</small></strong><p>Matched supplier agreement</p></div>
          <div className="dg-proof dg-proof-accent"><span>03 / IDENTIFIED VARIANCE</span><strong>$60.00</strong><p>For review · not a verified recovery</p></div>
        </div>
        <div className="dg-caption"><span className="dg-eyebrow">THE DIFFERENCE</span><i aria-hidden="true" /><p>From knowing what happened <span aria-hidden="true">→</span> <strong>to knowing what to do next.</strong></p></div>
      </div>
    </section>
  );
}
