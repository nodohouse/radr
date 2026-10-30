"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function OutcomeStory() {
  const root = useRef<HTMLElement>(null);
  const [amount, setAmount] = useState(2430);
  useEffect(() => {
    const node = root.current?.querySelector(".en-money-total");
    if (!node) return;
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      root.current?.setAttribute("data-money-on", "true");
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now-start)/1300);
        setAmount(Math.round(2430*(1-Math.pow(1-progress,3))));
        if (progress<1) frame=requestAnimationFrame(tick);
      };
      frame=requestAnimationFrame(tick);
    },{threshold:.2});
    observer.observe(node);
    return()=>{observer.disconnect();cancelAnimationFrame(frame);};
  },[]);
  return <section className="ed-outcomes en-money-story" ref={root} aria-labelledby="outcome-story-title">
    <div className="en-money-intro"><div className="ed-outcome-heading"><p>FIND THE VALUE HIDING IN YOUR OPERATION</p><h2 id="outcome-story-title">The gap is where<br /><span>the money is.</span></h2><p className="en-money-lead">A supplier variance. A credit that never arrived. A shift that misses demand. RADR connects the clues to the next decision.</p><Link href="/how">See how RADR finds it <span aria-hidden="true">→</span></Link></div><aside className="en-money-total"><span>ILLUSTRATIVE SUPPLIER EXAMPLE</span><strong aria-label="$2,430 expected">${amount.toLocaleString("en-US")}</strong><p>Expected recovery to investigate</p><small>Observed: pending <i /> Verified: $0</small><div className="en-money-meter" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></aside></div>
    <div className="ed-outcome-grid">
      <article className="en-evidence-card"><div className="ed-outcome-top"><span>01 / DISCOVER</span><b className="en-signal-dot" /></div><h3>Find the difference.</h3><p>Bring the agreed terms and the actual invoice into the same picture.</p><div className="en-evidence-prices"><span>Contract<strong>$6.80/L</strong></span><span>Invoiced<strong>$7.45/L</strong></span></div><small><i />Source evidence, connected</small></article>
      <article><div className="ed-outcome-top"><span>02 / ACT</span><svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><path d="M15 65L43 40L65 52L105 15M82 15H105V38" /></svg></div><h3>Prepare the recovery.</h3><p>Attach the contract and invoices. Prepare a dispute package for your team to review.</p><div className="en-next-action"><span>NEXT MOVE</span><strong>Review supplier dispute <span aria-hidden="true">→</span></strong></div><small><i />Your team approves the action</small></article>
      <article><div className="ed-outcome-top"><span>03 / VERIFY</span><svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><path d="M30 42L50 62L90 22M15 78H110" /></svg></div><h3>Track what comes back.</h3><p>Keep potential recovery separate from money actually returned. Verify the outcome against the evidence.</p><div className="en-result-status"><span>Expected <strong>$2,430</strong></span><span>Verified <strong>$0</strong></span></div><small><i />A confirmed outcome closes the loop</small></article>
    </div>
  </section>;
}
