import Link from "next/link";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/LegalPageShell";
export const metadata = { title: "Data Processing Agreement" };
export default function DataProcessingAgreement() {
  return (
    <LegalPageShell
      kicker="Legal"
      title="Data Processing Agreement"
      lead="The data processing agreement will be published once the company structure and processing terms are confirmed."
    >
      <LegalSection title="Agreement status">
        <p>
          To be added. This placeholder is not a binding agreement or a
          statement of finalized processing terms.
        </p>
      </LegalSection>
      <LegalSection title="Contact">
        <p>
          <Link href="/contact">Contact RADR</Link> for questions.
        </p>
      </LegalSection>
    </LegalPageShell>
  );
}
