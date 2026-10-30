import Link from "next/link";
import Image from "next/image";
import { IntelligenceFlow } from "./IntelligenceFlow";

export function SolutionsStory() {
  return <section className="ps-solutions-hero" id="overview" aria-labelledby="solutions-title">
    <div className="mx-wrap">
      <div className="ps-solutions-intro"><div><p className="mx-kicker">SOLUTIONS FOR HOSPITALITY</p><h1 id="solutions-title">Your operation.<br /><span>A clearer next move.</span></h1></div><div><p>Connect the signals behind every service, stay and location. See what matters, compare your options and prepare the right response.</p><Link href="#tailored" className="mx-button">Find your operation <span aria-hidden="true">→</span></Link></div></div>
      <div className="ps-story-label"><Image src="/brand/radr-mark-clean-white.svg" alt="RADR" width={20} height={20} /><span>A RESTAURANT DECISION, FROM SIGNAL TO OUTCOME</span></div>
      <IntelligenceFlow service />
    </div>
  </section>;
}
