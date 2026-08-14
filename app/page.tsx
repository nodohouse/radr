import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { HeroProduct } from "@/components/marketing/scenes/HeroProduct";
import { SectionCoverage } from "@/components/marketing/scenes/SectionCoverage";
import { SectionDelta } from "@/components/marketing/scenes/SectionDelta";
import { SectionExpected } from "@/components/marketing/scenes/SectionExpected";
import { SectionFinal } from "@/components/marketing/scenes/SectionFinal";
import { SectionFlywheel } from "@/components/marketing/scenes/SectionFlywheel";
import { SectionOutcome } from "@/components/marketing/scenes/SectionOutcome";
import { SectionPricingTeaser } from "@/components/marketing/scenes/SectionPricingTeaser";
import { SectionSees } from "@/components/marketing/scenes/SectionSees";
import { SectionSystem } from "@/components/marketing/scenes/SectionSystem";
import { SectionWedge } from "@/components/marketing/scenes/SectionWedge";
import { SectionWhy } from "@/components/marketing/scenes/SectionWhy";

/**
 * Escalating narrative — one demo dataset, no filler.
 * 01 Hero → 02 Sees → 03 Expected → 04 Delta signal → 05 Coverage →
 * 06 Flywheel → 07 Verified value → 08 System → 09 Why → 10 Wedge →
 * 11 Pricing → 12 Final
 */
export default function Home() {
  return (
    <div className="radr">
      <SiteNav />
      <HeroProduct />
      <SectionSees />
      <SectionExpected />
      <SectionDelta />
      <SectionCoverage />
      <SectionFlywheel />
      <SectionOutcome />
      <SectionSystem />
      <SectionWhy />
      <SectionWedge />
      <SectionPricingTeaser />
      <SectionFinal />
      <SiteFooter />
    </div>
  );
}
