import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/LegalPageShell";
export const metadata = { title: "Responsible AI" };
export default function ResponsibleAI() {
  return (
    <LegalPageShell
      kicker="Legal"
      title="Responsible AI"
      lead="Our formal responsible AI policy is being prepared."
    >
      <LegalSection title="Human judgment stays central">
        <p>
          RADR’s product examples present evidence and recommendations for human
          review. Modeled opportunities are distinguished from verified
          outcomes.
        </p>
      </LegalSection>
      <LegalSection title="Policy details">
        <p>To be added once reviewed and confirmed.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
