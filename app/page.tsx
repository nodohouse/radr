import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { HeroRadar } from "@/components/marketing/scenes/HeroRadar";
import { SectionDelta } from "@/components/marketing/scenes/SectionDelta";
import { SectionFinal } from "@/components/marketing/scenes/SectionFinal";
import { SectionLoop } from "@/components/marketing/scenes/SectionLoop";
import { SectionPricingTeaser } from "@/components/marketing/scenes/SectionPricingTeaser";
import { SectionSignals } from "@/components/marketing/scenes/SectionSignals";
import { SectionSystem } from "@/components/marketing/scenes/SectionSystem";
import { SectionTerritories } from "@/components/marketing/scenes/SectionTerritories";
import { SectionVerifiedValue } from "@/components/marketing/scenes/SectionVerifiedValue";

export default function Home() {
  return (
    <div className="radr">
      <SiteNav />
      <HeroRadar />
      <SectionDelta />
      <SectionTerritories />
      <SectionSignals />
      <SectionVerifiedValue />
      <SectionLoop />
      <SectionSystem />
      <SectionPricingTeaser />
      <SectionFinal />
      <SiteFooter />
    </div>
  );
}
