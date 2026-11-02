import { FirstValueFunnel } from "@/components/onboarding/FirstValueFunnel";
import "../onboarding.css";

export const dynamic = "force-dynamic";
export const metadata = {title:"RADR · Setup preview",robots:{index:false,follow:false}};

/**
 * Visual preview of the onboarding funnel without auth.
 * Not linked from marketing - for product review only.
 */
export default function OnboardingPreviewPage() {
  return (
    <FirstValueFunnel
      userName="Alex"
      workspace={null}
      preview
    />
  );
}
