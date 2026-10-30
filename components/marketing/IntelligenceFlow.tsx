"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const sources = [
  ["bookingdotcom", "Booking.com", "Reservations"],
  ["stripe", "Stripe", "Payments"],
  ["xero", "Xero", "Finance"],
  ["sap", "SAP", "Procurement"],
  ["clockify", "Clockify", "Workforce"],
];
const phases = ["Evidence", "Recommendation", "Verification"];
export function IntelligenceFlow({ service = false }: { service?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [moving, setMoving] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      clearInterval(timer);
      const running = visible && !document.hidden && !preference.matches;
      setMoving(running);
      if (running) timer = setInterval(() => setPhase(value => (value + 1) % 3), 4200);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .15 });
    observer.observe(node);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { clearInterval(timer); observer.disconnect(); preference.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, []);
  const expected = service ? "+$620" : "$2,430";
  return <div className="pf-flow" ref={root} data-moving={moving}>
    <div className="pf-flow-top"><span>CONNECTED SOURCES</span><span>ONE OPERATING PICTURE</span></div>
    <div className="pf-flow-layout">
      <div className="pf-sources">{sources.map(([id, name, category]) => <div className="pf-source" key={id}><span className="pf-source-mark"><Image src={`/brand/sources/${id}.svg`} alt={name} width={25} height={25} /></span><span><strong>{name}</strong><small>{category}</small></span></div>)}</div>
      <div className="pf-rail pf-rail-in" aria-hidden="true"><svg viewBox="0 0 70 320" preserveAspectRatio="none">{[28,94,160,226,292].map((y,i)=><g key={y}><path d={`M0 ${y}C40 ${y} 30 160 70 160`} /><path className="pf-packet" pathLength="100" d={`M0 ${y}C40 ${y} 30 160 70 160`} style={{animationDelay:`${i*-.5}s`}} /></g>)}</svg></div>
      <div className="pf-core"><Image src="/brand/radr-wordmark-clean-white.svg" alt="RADR" width={120} height={28} /><span>Operating<br />intelligence</span><i aria-hidden="true" /></div>
      <div className="pf-rail pf-rail-out" aria-hidden="true"><svg viewBox="0 0 70 320" preserveAspectRatio="none"><path d="M0 160H70" /><path className="pf-packet" pathLength="100" d="M0 160H70" /></svg></div>
      <div className="pf-decision">
        <div className="pf-decision-top"><span>{service ? "RESTAURANT / SERVICE" : "SUPPLIER / AP"}</span><i>Illustrative</i></div>
        <div className="pf-decision-content" key={phase}>
          <span className="pf-step-label">0{phase+1} / {phases[phase]}</span>
          <h3>{phase===0 ? (service ? "Spot the service pressure." : "See the price variance.") : phase===1 ? "Prepare the next move." : "Verify the actual outcome."}</h3>
          {phase===0 ? <><div className="pf-metrics"><div><span>{service?"Covers":"Contract"}</span><strong>{service?"82":"$6.80/L"}</strong></div><div><span>{service?"Kitchen load":"Invoiced"}</span><strong>{service?"High":"$7.45/L"}</strong></div></div><p>{service?"Demand and kitchen load suggest reviewing the pace of the next seating.":"Contract and invoice evidence reveal a supplier variance across three locations."}</p></> : phase===1 ? <><div className="pf-action"><span>NEXT ACTION</span><strong>{service?"Stagger the next seating":"Prepare dispute package"}</strong></div><ul>{(service?["Compare service scenarios","Review the seating recommendation","Keep the floor team in control"]:["Attach the contract and invoices","Prepare supplier communication","Get your team’s approval"]).map(item=><li key={item}><i />{item}</li>)}</ul></> : <><div className="pf-verification"><div><span>Expected</span><strong>{expected}</strong></div><div><span>Observed</span><strong>Pending</strong></div><div><span>Verified</span><strong>$0</strong></div></div><p>Potential value is tracked separately. Nothing is verified until the outcome is confirmed.</p></>}
        </div>
        <ol className="pf-progress" aria-label="Illustrative decision stages">{phases.map((name,i)=><li key={name} data-active={phase===i}><i /><span>{name}</span></li>)}</ol>
      </div>
    </div>
    <div className="pf-flow-foot"><span>Source examples only. Integration availability depends on your setup.</span><span>People stay in control.</span></div>
  </div>;
}
