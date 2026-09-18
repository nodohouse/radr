import { ConnectOperation } from "@/components/onboarding/ConnectOperation";
import "../../onboarding.css";

export const dynamic = "force-dynamic";

/** Visual preview - no auth. */
export default function ConnectPreviewPage() {
  return (
    <ConnectOperation orgName="Maison Group" locationName="Maison Group · Main" />
  );
}
