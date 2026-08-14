import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { HeroProduct } from "@/components/marketing/scenes/HeroProduct";
import { SectionCoverage } from "@/components/marketing/scenes/SectionCoverage";
import { SectionDelta } from "@/components/marketing/scenes/SectionDelta";
import { SectionFinal } from "@/components/marketing/scenes/SectionFinal";
import { SectionHow } from "@/components/marketing/scenes/SectionHow";
import { SectionOutcome } from "@/components/marketing/scenes/SectionOutcome";
import { SectionPricingTeaser } from "@/components/marketing/scenes/SectionPricingTeaser";
import { SectionSystem } from "@/components/marketing/scenes/SectionSystem";

/**
 * One narrative, one dataset (€176,740 from 4 signals).
 * Hero → △ → territories → how → outcome → systems → pricing → CTA
 */
export default function Home() {
  return (
    <div className="radr">
      <SiteNav />
      <HeroProduct />
      <SectionDelta />
      <SectionCoverage />
      <SectionHow />
      <SectionOutcome />
      <SectionSystem />
      <SectionPricingTeaser />
      <SectionFinal />
      <SiteFooter />
    </div>
  );
}
