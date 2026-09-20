import { OnboardingFunnel } from "@/components/onboarding/OnboardingFunnel";
import "../onboarding.css";

export const dynamic = "force-dynamic";

/**
 * Visual preview of the onboarding funnel without auth.
 * Not linked from marketing - for product review only.
 */
export default function OnboardingPreviewPage() {
  return (
    <OnboardingFunnel
      userName="Alex"
      workspace={null}
      preview
    />
  );
}
