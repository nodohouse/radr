import Link from "next/link";

const outcomes = [
  { n: "01", title: "See the signal.", copy: "Bring invoices, demand, staffing and revenue into one operating picture.", detail: "Evidence, connected", path: "M10 45H38L48 25L60 62L72 38H110" },
  { n: "02", title: "Make the move.", copy: "Understand the discrepancy, compare the options and prepare the next action.", detail: "Your team, in control", path: "M15 65L43 40L65 52L105 15M82 15H105V38" },
  { n: "03", title: "Prove the impact.", copy: "Keep expected value separate from observed outcomes. Verify what actually changed.", detail: "Outcomes, verified", path: "M30 42L50 62L90 22M15 78H110" },
];
export function OutcomeStory() {
  return <section className="ed-outcomes" aria-labelledby="outcome-story-title">
    <div className="ed-outcome-heading"><p>THE POINT OF OPERATING INTELLIGENCE</p><h2 id="outcome-story-title">See it.<br /><span>Decide. Prove it.</span></h2><Link href="/how">Get the full picture <span aria-hidden="true">→</span></Link></div>
    <div className="ed-outcome-grid">{outcomes.map(item=><article key={item.n}><div className="ed-outcome-top"><span>{item.n}</span><svg viewBox="0 0 120 90" fill="none" aria-hidden="true"><path d={item.path} /></svg></div><h3>{item.title}</h3><p>{item.copy}</p><small><i />{item.detail}</small></article>)}</div>
  </section>;
}
