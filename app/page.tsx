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
    <main className="radr reference-page">
      <ReferenceHero />
      <ConnectSystems />
      <DecisionGap />
      <DecisionPreview />
      <Hospitality />
      <ValueMap />
      <ReferenceFinal />
    </main>
  );
}
