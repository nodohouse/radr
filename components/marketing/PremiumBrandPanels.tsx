import Image from "next/image";

export function BrandPortrait() {
  return <div className="ps-brand-portrait">
    <div className="ps-brand-art"><Image src="/brand/radr-wordmark-balanced-white.svg" alt="RADR" width={260} height={60} /><span>Hospitality. In sharper focus.</span></div>
    <div className="ps-brand-photos"><div><Image src="/images/radr-restaurant.webp" alt="Contemporary restaurant dining room" fill sizes="(max-width: 700px) 45vw, 280px" /><span>Every service.</span></div><div><Image src="/images/radr-coastal-architecture.webp" alt="Contemporary coastal hotel terrace" fill sizes="(max-width: 700px) 45vw, 280px" /><span>Every stay.</span></div></div>
    <p>Built for the decisions behind hospitality.</p>
  </div>;
}
export function PlanPortrait() {
  return <div className="ps-plan-portrait"><div className="ps-plan-brand"><Image src="/brand/radr-wordmark-balanced-monochrome-black.svg" alt="RADR" width={100} height={24} /><span>YOUR OPERATING SCOPE</span></div><h2>Start focused.<br />Scale with clarity.</h2><div className="ps-scope-list">{[["01","One location","A clearer view of your operation"],["02","Multiple properties","Local context. Portfolio perspective."],["03","Enterprise","A scope designed around your group"]].map(([n,title,copy])=><div key={n}><i>{n}</i><span><strong>{title}</strong><small>{copy}</small></span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg></div>)}</div><p>Plan details, pricing and availability below.</p></div>;
}
