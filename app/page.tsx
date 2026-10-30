import { OutcomeStory } from "@/components/marketing/OutcomeStory";
import { ProfessionalScroll, RunningBanner, ValueProof } from "@/components/marketing/ProfessionalMotion";
import { MockupFooter } from "@/components/marketing/MockupFooter";
import { ReferenceHero } from "@/components/marketing/ReferenceHero";
import {
  ConnectSystems,
  DecisionGap,
  DecisionPreview,
  Hospitality,
  ValueMap,
  ReferenceFinal,
} from "@/components/marketing/ReferenceSections";

export default function Home() {
  return (
    <>
      <main className="radr reference-page">
        <ProfessionalScroll />
        <ReferenceHero />
        <RunningBanner />
        <ConnectSystems />
        <OutcomeStory />
        <DecisionGap />
        <DecisionPreview />
        <ValueProof />
        <Hospitality />
        <ValueMap />
        <RunningBanner kind="process" />
        <ReferenceFinal />
      </main>
      <MockupFooter />
    </>
  );
}
