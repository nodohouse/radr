import type { Metadata } from "next";
import {
  LegalPageShell,
  LegalSection,
} from "@/components/marketing/LegalPageShell";
import { LegalIdentity } from "@/components/marketing/LegalIdentity";
export const metadata: Metadata = {
  title: "Imprint / Legal Notice",
  description:
    "Confirmed RADR company information and neutral placeholders for details awaiting confirmation.",
};
export default function ImprintPage() {
  return (
    <LegalPageShell
      kicker="Legal"
      title="Imprint / Legal Notice"
      lead="Company information will be published here once the final legal structure is confirmed."
    >
      <LegalSection title="Company information">
        <LegalIdentity />
      </LegalSection>
    </LegalPageShell>
  );
}
